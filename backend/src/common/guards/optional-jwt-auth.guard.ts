import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalJwtAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        request.user = payload;
      } catch (error) {
        // Token is invalid, but we still allow the request through
        request.user = null;
      }
    } else {
      request.user = null;
    }

    return true; // Always allow the request through
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 