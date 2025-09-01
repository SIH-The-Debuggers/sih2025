import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      role: "TOURIST" | "POLICE" | "VERIFIER";
      profile?: any;
    }
  ) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    return this.authService.login(user);
  }

  @Post("otp/send")
  @ApiOperation({ summary: "Send OTP to phone number" })
  async sendOTP(@Body() otpDto: { phone: string }) {
    return this.authService.sendOTP(otpDto.phone);
  }

  @Post("otp/verify")
  @ApiOperation({ summary: "Verify OTP and login" })
  async verifyOTP(@Body() verifyDto: { phone: string; otp: string }) {
    return this.authService.verifyOTP(verifyDto.phone, verifyDto.otp);
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Refresh access token" })
  async refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.id);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Request() req: any) {
    return {
      user: req.user,
    };
  }
}
