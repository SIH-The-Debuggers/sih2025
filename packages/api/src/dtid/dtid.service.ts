import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { BlockchainService } from "./blockchain.service";
import * as crypto from "crypto";
import * as QRCode from "qrcode";

@Injectable()
export class DtidService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private configService: ConfigService
  ) {}

  async createDigitalID(
    createDto: {
      touristId: string;
      tripId?: string;
      profile: {
        name: string;
        nationality: string;
        documentType: string;
        documentRef: string;
      };
      contacts: Array<{
        name: string;
        phone: string;
        relationship: string;
      }>;
    },
    createdBy: string
  ) {
    // Get or create tourist profile
    let touristProfile = await this.prisma.touristProfile.findUnique({
      where: { id: createDto.touristId },
    });

    if (!touristProfile) {
      // Create new tourist profile
      const user = await this.prisma.user.create({
        data: {
          email: `tourist-${Date.now()}@temp.com`,
          role: "TOURIST",
          touristProfile: {
            create: {
              name: createDto.profile.name,
              nationality: createDto.profile.nationality,
              documentType: createDto.profile.documentType,
              documentRef: createDto.profile.documentRef,
              didUri: `did:web:tourist-safety.com:${Date.now()}`,
              encryptedPII: this.encryptPII(createDto.profile),
              kycStatus: "PENDING",
            },
          },
        },
        include: { touristProfile: true },
      });
      touristProfile = user.touristProfile!;
    }

    // Create emergency contacts
    await Promise.all(
      createDto.contacts.map((contact, index) =>
        this.prisma.emergencyContact.create({
          data: {
            touristId: touristProfile.id,
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            priority: index + 1,
          },
        })
      )
    );

    // Generate anchor hash
    const anchorData = {
      didUri: touristProfile.didUri,
      tripId: createDto.tripId,
      contacts: createDto.contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
      })),
      timestamp: Date.now(),
    };
    const anchorHash = this.generateAnchorHash(anchorData);

    // Create Digital ID record
    const digitalId = await this.prisma.digitalID.create({
      data: {
        touristId: touristProfile.id,
        tripId: createDto.tripId,
        anchorHash,
        qrPayload: await this.generateQRPayload({
          id: touristProfile.id,
          didUri: touristProfile.didUri,
          anchorHash,
          validFrom: new Date(),
          validTo: createDto.tripId
            ? (
                await this.prisma.trip.findUnique({
                  where: { id: createDto.tripId },
                })
              )?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
        validFrom: new Date(),
        validTo: createDto.tripId
          ? (
              await this.prisma.trip.findUnique({
                where: { id: createDto.tripId },
              })
            )?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Register on blockchain (if not mocked)
    if (!this.configService.get("MOCK_BLOCKCHAIN")) {
      try {
        const txHash = await this.blockchainService.registerDigitalID(
          anchorHash,
          touristProfile.didUri
        );
        await this.prisma.digitalID.update({
          where: { id: digitalId.id },
          data: { blockchainTx: txHash },
        });
      } catch (error) {
        console.error("Blockchain registration failed:", error);
        // Continue without blockchain for MVP
      }
    }

    return {
      digitalId,
      qrCode: await this.generateQRCode(digitalId.id),
      anchorHash,
    };
  }

  async getDigitalID(id: string, user: any) {
    const digitalId = await this.prisma.digitalID.findUnique({
      where: { id },
      include: {
        tourist: {
          include: {
            emergencyContacts: true,
          },
        },
        trip: true,
      },
    });

    if (!digitalId) {
      throw new NotFoundException("Digital ID not found");
    }

    // Check access permissions
    if (user.role === "TOURIST" && digitalId.touristId !== user.profile?.id) {
      throw new ForbiddenException("Access denied");
    }

    return {
      id: digitalId.id,
      touristName: digitalId.tourist.name,
      didUri: digitalId.tourist.didUri,
      nationality: digitalId.tourist.nationality,
      documentType: digitalId.tourist.documentType,
      documentRef: digitalId.tourist.documentRef,
      validFrom: digitalId.validFrom,
      validTo: digitalId.validTo,
      isRevoked: digitalId.isRevoked,
      trip: digitalId.trip,
      emergencyContacts:
        user.role === "POLICE" || user.role === "ADMIN"
          ? digitalId.tourist.emergencyContacts
          : undefined,
      blockchainTx: digitalId.blockchainTx,
    };
  }

  async generateQRCode(digitalIdId: string): Promise<string> {
    const digitalId = await this.prisma.digitalID.findUnique({
      where: { id: digitalIdId },
    });

    if (!digitalId) {
      throw new NotFoundException("Digital ID not found");
    }

    try {
      return await QRCode.toDataURL(digitalId.qrPayload);
    } catch (error) {
      throw new Error("Failed to generate QR code");
    }
  }

  async verifyDigitalID(
    id: string,
    verifierId: string,
    verifyDto: { location?: string; metadata?: any }
  ) {
    const digitalId = await this.prisma.digitalID.findUnique({
      where: { id },
      include: { tourist: true },
    });

    if (!digitalId) {
      throw new NotFoundException("Digital ID not found");
    }

    if (digitalId.isRevoked) {
      throw new ForbiddenException("Digital ID has been revoked");
    }

    if (new Date() > digitalId.validTo) {
      throw new ForbiddenException("Digital ID has expired");
    }

    // Create verification record
    const verification = await this.prisma.verification.create({
      data: {
        digitalIdId: id,
        verifierId,
        location: verifyDto.location,
        metadata: verifyDto.metadata,
      },
    });

    return {
      verified: true,
      tourist: {
        name: digitalId.tourist.name,
        nationality: digitalId.tourist.nationality,
        documentRef: digitalId.tourist.documentRef,
      },
      verification,
    };
  }

  async revokeDigitalID(id: string, revokedBy: string) {
    const digitalId = await this.prisma.digitalID.findUnique({
      where: { id },
    });

    if (!digitalId) {
      throw new NotFoundException("Digital ID not found");
    }

    await this.prisma.digitalID.update({
      where: { id },
      data: { isRevoked: true },
    });

    // Log the revocation
    await this.prisma.auditLog.create({
      data: {
        userId: revokedBy,
        action: "REVOKE",
        resource: "DigitalID",
        resourceId: id,
        metadata: { reason: "Administrative revocation" },
      },
    });

    return { revoked: true };
  }

  private encryptPII(data: any): Buffer {
    const key =
      this.configService.get("ENCRYPTION_KEY") ||
      "default-key-change-this-in-production";
    const cipher = crypto.createCipher("aes-256-cbc", key);
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    return Buffer.from(encrypted, "hex");
  }

  private generateAnchorHash(data: any): string {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  private async generateQRPayload(data: {
    id: string;
    didUri: string;
    anchorHash: string;
    validFrom: Date;
    validTo: Date;
  }): Promise<string> {
    // For MVP, simple JSON payload
    // In production, use JWS (JSON Web Signature)
    const payload = {
      id: data.id,
      did: data.didUri,
      hash: data.anchorHash,
      validFrom: data.validFrom.toISOString(),
      validTo: data.validTo.toISOString(),
      iss: "tourist-safety.com",
      iat: Math.floor(Date.now() / 1000),
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }
}
