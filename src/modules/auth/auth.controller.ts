import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() signUpDto: any) {
    return this.authService.signup(signUpDto.email, signUpDto.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    response.cookie("Authentication", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("Authentication");
    return { message: "Logout successful" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@Req() request: any) {
    const userId = request.user.userId;
    const user = await this.authService.findById(userId);
    const profile = await this.authService.findOrCreateProfile(
      userId,
      user.email,
    );
    return {
      user: { id: user._id, email: user.email, name: user.name, profile },
    };
  }
}
