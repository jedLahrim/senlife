import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from './entities/label.entity';
import { AppError } from '../commons/errors/app-error';
import { I18nContext } from 'nestjs-i18n';
import { ERR_NOT_FOUND } from '../commons/errors/errors-codes';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private labelRepo: Repository<Label>,
  ) {}

  create(createLabelDto: CreateLabelDto): Promise<Label> {
    const { name } = createLabelDto;
    const label = this.labelRepo.create({
      name,
    });
    return this.labelRepo.save(label);
  }

  async createMany(createLabelDtos: CreateLabelDto[]): Promise<Label[]> {
    const list = [];
    for (const dto of createLabelDtos) {
      const label = await this.create(dto);
      list.push(label);
    }

    return list;
  }

  async findAll(i18n: I18nContext): Promise<Label[]> {
    const labels = await this.labelRepo.find();
    return labels.map((value) => {
      value.name = i18n.t(`locale.${value.name}`);
      return value;
    });
  }

  async findOne(id: string, i18n: I18nContext): Promise<Label> {
    const label = await this.labelRepo.findOne({ where: { id } });
    label.name = i18n.t(`locale.${label.name}`);
    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto) {
    const { name } = updateLabelDto;

    const updateResult = await this.labelRepo.update(id, {
      name,
    });

    if (updateResult.affected && updateResult.affected > 0) {
      return this.labelRepo.find({ where: { id } });
    } else {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
  }

  remove(id: string) {
    return `This action removes a #${id} label`;
  }
}
