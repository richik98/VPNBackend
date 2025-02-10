import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { VpnProfile, VpnProfileSchema } from './schemas/vpn-profile.schema';
import { VpnServer, VpnServerSchema } from './schemas/vpn-server.schema';
import { VpnController } from './vpn.controller';
import { VpnService } from './vpn.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VpnProfile.name, schema: VpnProfileSchema },
      { name: VpnServer.name, schema: VpnServerSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  providers: [VpnService],
  controllers: [VpnController],
})
export class VpnModule {}
