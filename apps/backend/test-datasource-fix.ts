/**
 * Test script to verify DataSource injection fix
 * This validates that AdminAnalyticsService, AdminMonitoringService,
 * and AdminProgressService can properly inject 'auth' DataSource
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminAnalyticsService } from './src/modules/admin/services/admin-analytics.service';
import { AdminMonitoringService } from './src/modules/admin/services/admin-monitoring.service';
import { AdminProgressService } from './src/modules/admin/services/admin-progress.service';

async function testDataSourceInjection() {
  console.log('🧪 Testing DataSource injection fix...\n');

  try {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env'],
        }),
        TypeOrmModule.forRoot({
          name: 'auth',
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'gamilit_dev',
          synchronize: false,
          logging: false,
        }),
      ],
      providers: [
        AdminAnalyticsService,
        AdminMonitoringService,
        AdminProgressService,
      ],
    }).compile();

    const analyticsService = moduleRef.get<AdminAnalyticsService>(AdminAnalyticsService);
    const monitoringService = moduleRef.get<AdminMonitoringService>(AdminMonitoringService);
    const progressService = moduleRef.get<AdminProgressService>(AdminProgressService);

    console.log('✅ AdminAnalyticsService instantiated successfully');
    console.log('✅ AdminMonitoringService instantiated successfully');
    console.log('✅ AdminProgressService instantiated successfully');
    console.log('\n🎉 All DataSource injections working correctly!');
    console.log('\nFix applied:');
    console.log('  - Changed @InjectDataSource("default") → @InjectDataSource("auth")');
    console.log('  - Files fixed: 3 (admin-analytics, admin-monitoring, admin-progress)');

    await moduleRef.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

testDataSourceInjection();
