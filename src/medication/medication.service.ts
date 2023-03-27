import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { AppError } from '../commons/errors/app-error';
import {
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_MEDICATION,
} from '../commons/errors/errors-codes';
import {
  FilterMedicationDto,
  MedicationOrderBy,
  SortType,
} from './dto/filter-medication.dto';
import { Constant } from '../commons/constant';
import { Pagination } from '../commons/pagination';
import { Child } from '../child/entities/child.entity';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private medicationRepo: Repository<Medication>,
    @InjectRepository(Child)
    private childRepo: Repository<Child>,
  ) {}
  async create(createMedicationDto: CreateMedicationDto) {
    const { name, description, childId } = createMedicationDto;
    const child = await this.childRepo.findOne({
      where: { id: childId },
    });
    if (!child) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
    const medication = this.medicationRepo.create({
      name,
      description,
      child: { id: childId },
    });
    return await this.medicationRepo.save(medication);
  }
  async findAll(dto: FilterMedicationDto): Promise<Pagination<Medication>> {
    let { take, skip, orderBy, sortType } = dto;

    const query = this.medicationRepo.createQueryBuilder();
    switch (orderBy) {
      case MedicationOrderBy.UPDATED_AT:
        query.orderBy('medication.updatedAt', sortType);
        break;
      case MedicationOrderBy.NAME:
        query.orderBy('medication.name', sortType);
        break;
    }
    query.take(take ?? Constant.TAKE);
    query.skip(skip ?? Constant.SKIP);
    const [data, total] = await query.getManyAndCount();
    return new Pagination<Medication>(data, total);
  }
  async findOne(id: string): Promise<Medication> {
    const medication = await this.medicationRepo.findOne({
      where: { id: id },
      relations: { child: true },
    });
    if (!medication) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_MEDICATION));
    } else {
      return medication;
    }
  }

  async update(
    id: string,
    updateMedicationDto: UpdateMedicationDto,
  ): Promise<Medication> {
    const { name, description } = updateMedicationDto;
    const updateResult = await this.medicationRepo.update(
      { id: id },
      { name, description },
    );
    if (updateResult.affected == null || updateResult.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_MEDICATION));
    }
    return await this.findOne(id);
  }
  async remove(id: string) {
    const result = await this.medicationRepo.softDelete({ id });
    if (result.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_MEDICATION));
    }
  }
  async duplicate(id: string) {
    const medication = await this.findOne(id);
    const duplicatedMedication = this.medicationRepo.create({
      name: medication.name,
      description: medication.description,
      child: { id: medication.child.id },
    });
    return await this.medicationRepo.save(duplicatedMedication);
  }
}
