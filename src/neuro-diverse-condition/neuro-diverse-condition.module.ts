import { Module } from '@nestjs/common';
import { NeuroDiverseConditionService } from './neuro-diverse-condition.service';
import { NeuroDiverseConditionController } from './neuro-diverse-condition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeuroDiverseCondition } from './entities/neuro-diverse-condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NeuroDiverseCondition])],
  controllers: [NeuroDiverseConditionController],
  providers: [NeuroDiverseConditionService],
})
export class NeuroDiverseConditionModule {}
