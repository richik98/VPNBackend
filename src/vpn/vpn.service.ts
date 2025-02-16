import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserSession,
  UserSessionDocument,
} from './schemas/user-session.schema';
import { VpnProfile, VpnProfileDocument } from './schemas/vpn-profile.schema';

@Injectable()
export class VpnService {
  constructor(
    @InjectModel(VpnProfile.name)
    private vpnProfileModel: Model<VpnProfileDocument>,
    @InjectModel(UserSession.name)
    private userSessionModel: Model<UserSessionDocument>,
  ) {}

  // async getAvailableCountries() {
  //   const availableCountries = await this.vpnProfileModel.aggregate([
  //     { $match: { available: true } },
  //     { $group: { _id: '$country', count: { $sum: 1 } } },
  //     { $match: { count: { $gte: 2 } } }, // Only countries with 2+ profiles
  //     { $project: { _id: 0, country: '$_id' } },
  //   ]);
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return availableCountries;
  // }

  async getAvailableCountries() {
    const availableCountries = await this.vpnProfileModel.aggregate([
      { $match: { available: true } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } }, // Only countries with 2+ profiles
      { $project: { _id: 0, country: '$_id' } },
    ]);

    // Extract the countries into an array
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const countryList = availableCountries.map((item) => item.country);

    return { availableCountries: countryList };
  }

  async assignVpnProfile(
    userId: string,
    targetCountry: string,
    sessionLength: number,
  ) {
    const profile = await this.vpnProfileModel.findOneAndUpdate(
      { country: targetCountry, available: true },
      { available: false },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('No available profiles for this country');
    }

    await this.userSessionModel.create({
      userId: userId,
      profileName: profile.profileName,
      country: targetCountry,
      sessionLength,
      expiresAt: Date.now() + sessionLength * 60 * 100,
    });

    return { profileName: profile.profileName, config: profile.configFile };
  }

  async releaseVpnProfile(profileName: string) {
    await this.vpnProfileModel.updateOne({ profileName }, { available: true });
    await this.userSessionModel.deleteOne({ profileName });
    return { message: 'Profile released' };
  }
}
