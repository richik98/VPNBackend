import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { UserSession } from './schemas/user-session.schema';
import { VpnProfile } from './schemas/vpn-profile.schema';

@Injectable()
export class VpnCleanupService {
  private readonly logger = new Logger(VpnCleanupService.name);

  constructor(
    @InjectModel(UserSession.name) private userSessionModel: Model<UserSession>,
    @InjectModel(VpnProfile.name) private vpnProfileModel: Model<VpnProfile>,
  ) {}

  @Cron('*/2 * * * *') // Runs every 2 minute
  async releaseExpiredSessions() {
    const now = Date.now();

    console.log('Running CronJob for cleanup service...');

    const expiredSessions = await this.userSessionModel.find({
      expiresAt: { $lt: now },
    });

    for (const session of expiredSessions) {
      await this.vpnProfileModel.updateOne(
        { profileName: session.profileName },
        { available: true },
      );
      await this.userSessionModel.deleteOne({ _id: session._id });

      this.logger.log(
        `Released profile ${session.profileName} for country ${session.country}`,
      );
    }
  }
}
