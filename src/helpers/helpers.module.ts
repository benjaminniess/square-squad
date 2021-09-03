import { Module } from '@nestjs/common';
import { Helpers } from './helpers';

@Module({ exports: [Helpers], providers: [Helpers] })
export class HelpersModule {}
