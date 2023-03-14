import { Module } from '@nestjs/common';
import { NeuroDiverseConditionService } from './neuro-diverse-condition.service';
import { NeuroDiverseConditionController } from './neuro-diverse-condition.controller';

@Module({
  controllers: [NeuroDiverseConditionController],
  providers: [NeuroDiverseConditionService]
})
export class NeuroDiverseConditionModule {}
