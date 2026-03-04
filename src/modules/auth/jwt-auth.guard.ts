import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract token from cookie (BFF approach)
    let token = request.cookies?.["Authentication"];

    // Fallback to Authorization header if cookie not present (for API testing if needed)
    if (!token) {
      token = request.headers["authorization"]?.replace("Bearer ", "");
    }

    if (!token) {
      throw new UnauthorizedException("Unauthorized access");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Auth failed");
    }
  }
}
