import { Module } from '@nestjs/common';
import { ImprovementNeedService } from './improvement-need.service';
import { ImprovementNeedController } from './improvement-need.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImprovementNeed } from './entities/improvement-need.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImprovementNeed])],
  controllers: [ImprovementNeedController],
  providers: [ImprovementNeedService],
})
export class ImprovementNeedModule {}
