import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  UserSession,
  UserSessionSchema,
} from './vpn/schemas/user-session.schema';
import { VpnProfile, VpnProfileSchema } from './vpn/schemas/vpn-profile.schema';
import { VpnCleanupService } from './vpn/vpn-cleanup.service';
import { VpnModule } from './vpn/vpn.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot('mongodb://localhost:27017/vpn-db'),
    VpnModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: VpnProfile.name, schema: VpnProfileSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, VpnCleanupService],
})
export class AppModule {}
