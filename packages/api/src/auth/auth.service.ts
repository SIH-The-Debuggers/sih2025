import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../database/prisma.service";
import { Role } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    profile?: any;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        touristProfile: true,
        policeProfile: true,
        verifierProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // For MVP, we'll use simple password validation
    // In production, you'd hash passwords properly
    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any): Promise<AuthResponse> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile:
          user.touristProfile || user.policeProfile || user.verifierProfile,
      },
    };
  }

  async register(registerDto: {
    email: string;
    password: string;
    role: Role;
    profile?: any;
  }): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        ...(registerDto.role === "TOURIST" &&
          registerDto.profile && {
            touristProfile: {
              create: {
                name: registerDto.profile.name,
                nationality: registerDto.profile.nationality,
                documentType: registerDto.profile.documentType,
                documentRef: registerDto.profile.documentRef,
                didUri: `did:web:tourist-safety.com:${Date.now()}`,
                encryptedPII: Buffer.from(JSON.stringify(registerDto.profile)),
              },
            },
          }),
        ...(registerDto.role === "POLICE" &&
          registerDto.profile && {
            policeProfile: {
              create: {
                badgeNumber: registerDto.profile.badgeNumber,
                rank: registerDto.profile.rank,
                department: registerDto.profile.department,
                station: registerDto.profile.station,
              },
            },
          }),
        ...(registerDto.role === "VERIFIER" &&
          registerDto.profile && {
            verifierProfile: {
              create: {
                organization: registerDto.profile.organization,
                location: registerDto.profile.location,
              },
            },
          }),
      },
      include: {
        touristProfile: true,
        policeProfile: true,
        verifierProfile: true,
      },
    });

    return this.login(user);
  }

  async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        touristProfile: true,
        policeProfile: true,
        verifierProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.login(user);
  }

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    // In production, integrate with SMS service (Twilio, etc.)
    // For MVP, we'll simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in cache/database with expiry
    // For now, we'll just log it
    console.log(`OTP for ${phone}: ${otp}`);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    // In production, verify OTP from cache/database
    // For MVP, accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      throw new UnauthorizedException("Invalid OTP");
    }

    // Find or create user with phone
    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        touristProfile: true,
        policeProfile: true,
        verifierProfile: true,
      },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          phone,
          email: `${phone}@tourist-safety.temp`,
          role: "TOURIST",
        },
        include: {
          touristProfile: true,
          policeProfile: true,
          verifierProfile: true,
        },
      });
    }

    return this.login(user);
  }
}
