import { Module } from '@nestjs/common';
import { DrizzleAsyncProvider, drizzleProvider } from './drizzle.service';

@Module({
  providers: [
    ...drizzleProvider
  ],
  exports: [
    DrizzleAsyncProvider
  ]
})
export class DrizzleModule {}
