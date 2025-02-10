import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VpnServerDocument = VpnServer & Document;

@Schema()
export class VpnServer {
  @Prop({ required: true, unique: true }) ip: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true, default: 0 }) activeConnections: number;
  @Prop({ required: true, default: true }) isOnline: boolean;
}

export const VpnServerSchema = SchemaFactory.createForClass(VpnServer);
