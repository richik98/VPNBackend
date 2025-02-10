import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema()
export class UserSession {
  @Prop({ required: true, unique: true }) profileName: string;
  @Prop({ required: true }) userId: string; // Use unique user ID from your app
  @Prop({ required: true }) country: string;
  @Prop({ required: true, default: Date.now }) startedAt: Date;
  @Prop({ required: true }) sessionLength: number; // Store session time in minutes
  @Prop({ required: true, default: Date.now }) expiresAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
