import { Body, Controller, Get, Post } from '@nestjs/common';
import { VpnService } from './vpn.service';

@Controller('vpn')
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  @Get('/countryList')
  getCountryList() {
    return this.vpnService.getAvailableCountries();
  }

  @Post('/connectVpn')
  connectVpn(
    @Body()
    body: {
      userId: string;
      targetCountry: string;
      sessionLength: number;
    },
  ) {
    return this.vpnService.assignVpnProfile(
      body.userId,
      body.targetCountry,
      body.sessionLength,
    );
  }

  @Post('/disconnectVpn')
  disconnectVpn(@Body() body: { profileName: string }) {
    return this.vpnService.releaseVpnProfile(body.profileName);
  }
}
