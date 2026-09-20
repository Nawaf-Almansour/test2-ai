import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { RegistrationRepository } from './repositories/registration.repository';
import {
  RegistrationRequest,
  RegistrationRequestSchema,
} from './schemas/registration-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationRequest.name, schema: RegistrationRequestSchema },
    ]),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationRepository],
})
export class RegistrationModule {}
