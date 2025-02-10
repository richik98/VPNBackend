import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VpnProfileDocument = VpnProfile & Document;

@Schema()
export class VpnProfile {
  @Prop({ required: true, unique: true }) profileName: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true }) configFile: string; // Store OVPN content as a string
  @Prop({ default: true }) available: boolean;
}

export const VpnProfileSchema = SchemaFactory.createForClass(VpnProfile);
