import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAllergieDto } from './dto/create-allergie.dto';
import { UpdateAllergieDto } from './dto/update-allergie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergie } from './entities/allergie.entity';
import { AppError } from '../commons/errors/app-error';
import {
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_ALLERGIE,
} from '../commons/errors/errors-codes';
import { AllergieOrderBy, FilterAllergieDto } from './dto/filter-allergie.dto';
import { Constant } from '../commons/constant';
import { Pagination } from '../commons/pagination';
import { Child } from '../child/entities/child.entity';

@Injectable()
export class AllergieService {
  constructor(
    @InjectRepository(Allergie)
    private allergieRepo: Repository<Allergie>,
    @InjectRepository(Child)
    private childRepo: Repository<Child>,
  ) {}

  async create(createAllergieDto: CreateAllergieDto) {
    const { name, description, childId } = createAllergieDto;
    const child = await this.childRepo.findOne({
      where: { id: childId },
    });
    if (!child) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
    const medication = this.allergieRepo.create({
      name,
      description,
      child: { id: childId },
    });
    return await this.allergieRepo.save(medication);
  }

  async findAll(dto: FilterAllergieDto): Promise<Pagination<Allergie>> {
    let { take, skip, orderBy, sortType } = dto;
    const query = this.allergieRepo.createQueryBuilder();
    switch (orderBy) {
      case AllergieOrderBy.UPDATED_AT:
        query.orderBy('allergie.updatedAt', sortType);
        break;
      case AllergieOrderBy.NAME:
        query.orderBy('allergie.name', sortType);
        break;
    }
    query.take(take ?? Constant.TAKE);
    query.skip(skip ?? Constant.SKIP);
    const [data, total] = await query.getManyAndCount();
    return new Pagination<Allergie>(data, total);
  }

  async findOne(id: string) {
    const allergie = await this.allergieRepo.findOne({
      where: { id: id },
      relations: { child: true },
    });
    if (!allergie) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_ALLERGIE));
    } else {
      return allergie;
    }
  }

  async update(id: string, updateAllergieDto: UpdateAllergieDto) {
    const { name, description } = updateAllergieDto;
    const updateResult = await this.allergieRepo.update(
      { id: id },
      { name, description },
    );
    if (updateResult.affected == null || updateResult.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_ALLERGIE));
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.allergieRepo.softDelete({ id });
    if (result.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_ALLERGIE));
    }
  }
  async duplicate(id: string) {
    const allergie = await this.findOne(id);
    const duplicatedAllergie = this.allergieRepo.create({
      name: allergie.name,
      description: allergie.description,
      child: { id: allergie.child.id },
    });
    return await this.allergieRepo.save(duplicatedAllergie);
  }
}
