import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    const url = new URL(databaseUrl);
    const sslRootCertPath = url.searchParams.get('sslrootcert');
    const sslCa = sslRootCertPath
      ? readFileSync(resolve(process.cwd(), sslRootCertPath), 'utf8')
      : undefined;

    const pool = new Pool({
      host: url.hostname,
      port: Number(url.port || '5432'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      ssl: sslCa
        ? {
            ca: sslCa,
            rejectUnauthorized: true,
          }
        : {
            rejectUnauthorized: false,
          },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}
