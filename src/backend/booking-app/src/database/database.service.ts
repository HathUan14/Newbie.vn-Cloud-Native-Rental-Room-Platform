import { neon } from '@neondatabase/serverless';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dns from 'dns';
import * as net from 'net';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly sql;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');

    // Log database URL (hide password)
    const safeUrl = databaseUrl?.replace(/:[^:@]+@/, ':****@');
    this.logger.log(`🔗 Database URL: ${safeUrl}`);

    if (!databaseUrl) {
      this.logger.error('❌ DATABASE_URL is not defined in .env file');
      throw new Error('DATABASE_URL is required');
    }

    this.sql = neon(databaseUrl);
  }

  async onModuleInit() {
    const databaseUrl = this.configService.get('DATABASE_URL');

    try {
      // Parse URL
      const url = new URL(databaseUrl);
      const hostname = url.hostname;
      const port = parseInt(url.port || '5432');

      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.log('🔍 DIAGNOSTIC TEST STARTED');
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 1. Check DNS Resolution
      this.logger.log(`\n1️⃣ Testing DNS resolution for: ${hostname}`);
      try {
        const addresses = await this.resolveDNS(hostname);
        this.logger.log(`✅ DNS resolved to: ${addresses.join(', ')}`);
      } catch (error) {
        this.logger.error(`❌ DNS Resolution FAILED: ${error.message}`);
        this.logger.error(
          '💡 Solution: Check your internet connection or DNS settings',
        );
        throw error;
      }

      // 2. Check Port Connectivity
      this.logger.log(`\n2️⃣ Testing TCP connection to: ${hostname}:${port}`);
      try {
        await this.testPortConnection(hostname, port);
        this.logger.log(`✅ Port ${port} is reachable`);
      } catch (error) {
        this.logger.error(`❌ Port ${port} is NOT reachable: ${error.message}`);
        this.logger.error(
          '💡 Solution: Check firewall/VPN or whitelist your IP in Neon',
        );
        throw error;
      }

      // 3. Test Database Connection
      this.logger.log(`\n3️⃣ Testing database authentication...`);
      try {
        const startTime = Date.now();
        const result = await this.sql`
          SELECT 
            NOW() as current_time,
            version() as pg_version,
            current_database() as database_name,
            current_user as username,
            inet_server_addr() as server_ip,
            inet_server_port() as server_port
        `;
        const duration = Date.now() - startTime;

        this.logger.log(`✅ Database connected successfully in ${duration}ms`);
        this.logger.log(
          `📊 PostgreSQL Version: ${result[0].pg_version.split(' ')[0]}`,
        );
        this.logger.log(`🗄️  Database: ${result[0].database_name}`);
        this.logger.log(`👤 User: ${result[0].username}`);
        this.logger.log(`🌐 Server IP: ${result[0].server_ip}`);
        this.logger.log(`🔌 Server Port: ${result[0].server_port}`);
        this.logger.log(`🕐 Server Time: ${result[0].current_time}`);
      } catch (error) {
        this.logger.error(`❌ Database authentication FAILED`);
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error code: ${error.code || 'N/A'}`);

        if (error.code === 'ECONNREFUSED') {
          this.logger.error('💡 Solution: Database server refused connection');
        } else if (error.code === 'ETIMEDOUT') {
          this.logger.error(
            '💡 Solution: Connection timeout - check firewall/VPN',
          );
        } else if (error.code === '28P01') {
          this.logger.error('💡 Solution: Invalid username or password');
        } else if (error.code === '3D000') {
          this.logger.error('💡 Solution: Database does not exist');
        }

        throw error;
      }

      // 4. Test Query Performance
      this.logger.log(`\n4️⃣ Testing query performance...`);
      try {
        const queries = [
          { name: 'Simple SELECT', sql: this.sql`SELECT 1 as test` },
          { name: 'Count Rooms', sql: this.sql`SELECT COUNT(*) FROM rooms` },
        ];

        for (const query of queries) {
          const start = Date.now();
          await query.sql;
          const duration = Date.now() - start;
          this.logger.log(`✅ ${query.name}: ${duration}ms`);
        }
      } catch (error) {
        this.logger.error(`❌ Query test failed: ${error.message}`);
      }

      this.logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.log('✅ ALL TESTS PASSED - DATABASE READY');
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (error) {
      this.logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.error('❌ DIAGNOSTIC TEST FAILED');
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Log system info
      this.logger.error('📋 System Information:');
      this.logger.error(`   OS: ${process.platform} ${process.arch}`);
      this.logger.error(`   Node: ${process.version}`);
      this.logger.error(`   Process ID: ${process.pid}`);

      // Don't throw - let app continue
      this.logger.warn('⚠️  Application will continue without database');
    }
  }

  private resolveDNS(hostname: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      dns.resolve4(hostname, (error, addresses) => {
        if (error) reject(error);
        else resolve(addresses);
      });
    });
  }

  private testPortConnection(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error(`Connection timeout after 10s`));
      }, 10000);

      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve();
      });

      socket.on('error', (error) => {
        clearTimeout(timeout);
        socket.destroy();
        reject(error);
      });
    });
  }

  async getData() {
    try {
      const data = await this.sql`SELECT * FROM rooms LIMIT 10`;
      return data;
    } catch (error) {
      this.logger.error(`Query failed: ${error.message}`);
      throw error;
    }
  }
}
