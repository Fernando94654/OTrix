import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
    sub: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const header = req.headers['authorization'];
        if (!header?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing bearer token');
        }
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(header.slice(7), {
                secret: process.env.JWT_SECRET,
            });
            req.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
