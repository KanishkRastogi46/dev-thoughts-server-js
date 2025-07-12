import { Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.service';

@Module({
  providers: [
    DrizzleProvider
  ],
})
export class DrizzleModule {}
