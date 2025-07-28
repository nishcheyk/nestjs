import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    // Extract token from header (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Check if token is blacklisted (i.e., logged out)
    if (this.authService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been logged out');
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    // Return the validated user object, attached to req.user
    return user;
  }
}
