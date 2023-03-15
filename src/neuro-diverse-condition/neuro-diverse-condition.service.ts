import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNeuroDiverseConditionDto } from './dto/create-neuro-diverse-condition.dto';
import { UpdateNeuroDiverseConditionDto } from './dto/update-neuro-diverse-condition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeuroDiverseCondition } from './entities/neuro-diverse-condition.entity';
import { I18nContext } from 'nestjs-i18n';
import { AppError } from '../commons/errors/app-error';
import { ERR_NOT_FOUND } from '../commons/errors/errors-codes';
import { NeuroDiverseConditionType } from './enums/neuro-diverse-condition-type';

@Injectable()
export class NeuroDiverseConditionService {
  constructor(
    @InjectRepository(NeuroDiverseCondition)
    private neuroDiverseConditionRepo: Repository<NeuroDiverseCondition>,
  ) {}

  create(dto: CreateNeuroDiverseConditionDto) {
    const { name } = dto;
    const diverseCondition = this.neuroDiverseConditionRepo.create({
      name,
    });
    return this.neuroDiverseConditionRepo.save(diverseCondition);
  }

  async createMany(
    dtos: CreateNeuroDiverseConditionDto[],
  ): Promise<NeuroDiverseCondition[]> {
    const list = [];
    for (const dto of dtos) {
      const diverseCondition = await this.create(dto);
      list.push(diverseCondition);
    }

    return list;
  }

  async findAll(i18n: I18nContext): Promise<NeuroDiverseCondition[]> {
    const diverseConditions = await this.neuroDiverseConditionRepo.find({
      where: {
        type: NeuroDiverseConditionType.PREDEFINED,
      },
    });
    return diverseConditions.map((value) => {
      value.name = i18n.t(`locale.${value.name}`, { defaultValue: value.name });
      return value;
    });
  }

  async findOne(id: string, i18n: I18nContext): Promise<NeuroDiverseCondition> {
    const diverseCondition = await this.neuroDiverseConditionRepo.findOne({
      where: { id },
    });
    diverseCondition.name = i18n.t(`locale.${diverseCondition.name}`, {
      defaultValue: diverseCondition.name,
    });
    return diverseCondition;
  }

  async update(id: string, dto: UpdateNeuroDiverseConditionDto) {
    const { name } = dto;

    const updateResult = await this.neuroDiverseConditionRepo.update(id, {
      name,
    });

    if (updateResult.affected && updateResult.affected > 0) {
      return this.neuroDiverseConditionRepo.findOne({ where: { id } });
    } else {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
  }

  remove(id: string) {
    return `This action removes a #${id} label`;
  }
}
