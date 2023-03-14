import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { ChildImprovementNeed } from './entities/child-improvement-need.entity';
import { ChildNeuroDiverseCondition } from './entities/child-neuro-diverse-condition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Child,
      ChildImprovementNeed,
      ChildNeuroDiverseCondition,
    ]),
  ],
  controllers: [ChildController],
  providers: [ChildService],
})
export class ChildModule {}
