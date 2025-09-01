import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DtidService } from "./dtid.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("dtid")
@Controller("dtid")
export class DtidController {
  constructor(private readonly dtidService: DtidService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("VERIFIER", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create Digital Tourist ID" })
  async createDTID(
    @Body()
    createDtidDto: {
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
    @Request() req: any
  ) {
    return this.dtidService.createDigitalID(createDtidDto, req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get Digital Tourist ID details" })
  async getDTID(@Param("id") id: string, @Request() req: any) {
    return this.dtidService.getDigitalID(id, req.user);
  }

  @Get(":id/qr")
  @ApiOperation({ summary: "Get QR code for Digital Tourist ID" })
  async getQRCode(@Param("id") id: string) {
    return this.dtidService.generateQRCode(id);
  }

  @Post(":id/verify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("VERIFIER", "POLICE", "ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify Digital Tourist ID" })
  async verifyDTID(
    @Param("id") id: string,
    @Body() verifyDto: { location?: string; metadata?: any },
    @Request() req: any
  ) {
    return this.dtidService.verifyDigitalID(id, req.user.id, verifyDto);
  }

  @Post(":id/revoke")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke Digital Tourist ID" })
  async revokeDTID(@Param("id") id: string, @Request() req: any) {
    return this.dtidService.revokeDigitalID(id, req.user.id);
  }
}
