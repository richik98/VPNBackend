/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { UserSession } from './schemas/user-session.schema';
import { VpnProfile } from './schemas/vpn-profile.schema';

@Injectable()
export class VpnCleanupService {
  private readonly logger = new Logger(VpnCleanupService.name);

  constructor(
    @InjectModel(UserSession.name) private userSessionModel: Model<UserSession>,
    @InjectModel(VpnProfile.name) private vpnProfileModel: Model<VpnProfile>,
    private readonly httpService: HttpService,
  ) {}

  @Cron('*/2 * * * *') // Runs every 2 minute
  async releaseExpiredSessions() {
    const now = Date.now();

    console.log('Running CronJob for cleanup service...');

    const expiredSessions = await this.userSessionModel.find({
      expiresAt: { $lt: now },
    });

    for (const session of expiredSessions) {
      const profile = await this.vpnProfileModel.findOne({
        profileName: session.profileName,
      });

      if (!profile) {
        this.logger.warn(`Profile ${session.profileName} not found.`);
        continue;
      }

      try {
        const url = `http://${profile.vpnServerIp}:3000/resetProfile/${profile.profileName}`;
        const response = await firstValueFrom(this.httpService.get(url));

        if (response.data.newProfileName) {
          // Update profile with new name & config
          await this.vpnProfileModel.updateOne(
            { profileName: session.profileName },
            {
              profileName: response.data.newProfileName,
              configFile: response.data.newConfigFile,
              available: true,
            },
          );

          this.logger.log(
            `Reset profile ${session.profileName} -> ${response.data.newProfileName} for country ${profile.country}`,
          );
        } else {
          this.logger.error(
            `Failed to reset profile ${session.profileName} on VPN server ${profile.vpnServerIp}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error resetting profile ${session.profileName} on VPN ${profile.vpnServerIp}: ${error.message}`,
        );
      }

      await this.userSessionModel.deleteOne({ _id: session._id });
    }
  }
}
