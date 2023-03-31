import { Module } from '@nestjs/common';
import { AllergieService } from './allergie.service';
import { AllergieController } from './allergie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allergie } from './entities/allergie.entity';
import { Child } from '../child/entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allergie, Child])],
  controllers: [AllergieController],
  providers: [AllergieService],
})
export class AllergieModule {}
