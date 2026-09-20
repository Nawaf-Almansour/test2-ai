import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { RegistrationModule } from './registration/registration.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-platform'),
    ThrottlerModule.forRoot([{
      ttl: 600000, // 10 minutes
      limit: 5, // 5 requests per IP per 10 minutes
    }]),
    RegistrationModule,
    HealthModule,
  ],
})
export class AppModule {}