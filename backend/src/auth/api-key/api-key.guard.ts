import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedException("API key missing"); 
    }
    const keys = await this.prisma.apiKey.findMany({
      where: { isActive: true },
    });
    for (const key of keys) {
      if (key.keyHash === apiKey) {
        return true;
      }
    }
    throw new UnauthorizedException("Invalid API key"); 
  }
}
