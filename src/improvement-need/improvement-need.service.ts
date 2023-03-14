import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImprovementNeedDto } from './dto/create-improvement-need.dto';
import { UpdateImprovementNeedDto } from './dto/update-improvement-need.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImprovementNeed } from './entities/improvement-need.entity';
import { AppError } from '../commons/errors/app-error';
import { I18nContext } from 'nestjs-i18n';
import { ERR_NOT_FOUND } from '../commons/errors/errors-codes';

@Injectable()
export class ImprovementNeedService {
  constructor(
    @InjectRepository(ImprovementNeed)
    private improvementNeedRepository: Repository<ImprovementNeed>,
  ) {}

  create(dto: CreateImprovementNeedDto): Promise<ImprovementNeed> {
    const { name } = dto;
    const improvementNeed = this.improvementNeedRepository.create({
      name,
    });
    return this.improvementNeedRepository.save(improvementNeed);
  }

  async createMany(
    dtos: CreateImprovementNeedDto[],
  ): Promise<ImprovementNeed[]> {
    const list = [];
    for (const dto of dtos) {
      const improvementNeed = await this.create(dto);
      list.push(improvementNeed);
    }

    return list;
  }

  async findAll(i18n: I18nContext): Promise<ImprovementNeed[]> {
    const improvementNeeds = await this.improvementNeedRepository.find();
    return improvementNeeds.map((value) => {
      value.name = i18n.t(`locale.${value.name}`, { defaultValue: value.name });
      return value;
    });
  }

  async findOne(id: string, i18n: I18nContext): Promise<ImprovementNeed> {
    const improvementNeed = await this.improvementNeedRepository.findOne({
      where: { id },
    });
    improvementNeed.name = i18n.t(`locale.${improvementNeed.name}`, {
      defaultValue: improvementNeed.name,
    });
    return improvementNeed;
  }

  async update(id: string, updateLabelDto: UpdateImprovementNeedDto) {
    const { name } = updateLabelDto;

    const updateResult = await this.improvementNeedRepository.update(id, {
      name,
    });

    if (updateResult.affected && updateResult.affected > 0) {
      return this.improvementNeedRepository.findOne({ where: { id } });
    } else {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
  }

  remove(id: string) {
    return `This action removes a #${id} improvementNeed`;
  }
}
