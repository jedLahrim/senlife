import { Injectable } from '@nestjs/common';
import { CreateNeuroDiverseConditionDto } from './dto/create-neuro-diverse-condition.dto';
import { UpdateNeuroDiverseConditionDto } from './dto/update-neuro-diverse-condition.dto';

@Injectable()
export class NeuroDiverseConditionService {
  create(createNeuroDiverseConditionDto: CreateNeuroDiverseConditionDto) {
    return 'This action adds a new neuroDiverseCondition';
  }

  findAll() {
    return `This action returns all neuroDiverseCondition`;
  }

  findOne(id: number) {
    return `This action returns a #${id} neuroDiverseCondition`;
  }

  update(id: number, updateNeuroDiverseConditionDto: UpdateNeuroDiverseConditionDto) {
    return `This action updates a #${id} neuroDiverseCondition`;
  }

  remove(id: number) {
    return `This action removes a #${id} neuroDiverseCondition`;
  }
}
