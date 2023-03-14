import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { Repository } from 'typeorm';
import { ChildImprovementNeed } from './entities/child-improvement-need.entity';
import { ChildNeuroDiverseCondition } from './entities/child-neuro-diverse-condition.entity';
import { AppError } from '../commons/errors/app-error';
import { ERR_NOT_FOUND } from '../commons/errors/errors-codes';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ChildService {
  constructor(
    @InjectRepository(Child)
    private childRepo: Repository<Child>,
    @InjectRepository(ChildImprovementNeed)
    private childImprovementNeedRepo: Repository<ChildImprovementNeed>,
    @InjectRepository(ChildNeuroDiverseCondition)
    private childNeuroDiverseConditionRepo: Repository<ChildNeuroDiverseCondition>,
  ) {}

  async create(dto: CreateChildDto, i18n: I18nContext): Promise<Child> {
    const {
      fullName,
      nuroDiverseConditionId,
      improvementNeedIds,
      birthdayDate,
      address,
      profileImageUrl,
      gender,
    } = dto;

    const child = this.childRepo.create({
      fullName,
      birthdayDate,
      address,
      profileImageUrl,
      gender,
    });

    const savedChild = await this.childRepo.save(child);
    const childImprovementNeeds = this._getChildImprovementNeedsByIds(
      improvementNeedIds,
      savedChild.id,
    );
    await this.childImprovementNeedRepo.save(childImprovementNeeds);

    const childNeuroDiverseCondition =
      this.childNeuroDiverseConditionRepo.create({
        child: {
          id: savedChild.id,
        },
        neuroDiverseCondition: {
          id: nuroDiverseConditionId,
        },
      });
    await this.childNeuroDiverseConditionRepo.save(childNeuroDiverseCondition);

    return this.findOne(savedChild.id, i18n);
  }

  private _getChildImprovementNeedsByIds(
    improvementNeedIds: string[],
    childId: string,
  ): ChildImprovementNeed[] {
    return improvementNeedIds.map((id) =>
      this.childImprovementNeedRepo.create({
        child: {
          id: childId,
        },
        improvementNeed: {
          id: id,
        },
      }),
    );
  }

  findAll(i18n: I18nContext) {
    return `This action returns all child`;
  }

  async findOne(id: string, i18n: I18nContext): Promise<Child> {
    try {
      const child = await this.childRepo.findOne({
        where: { id: id },
        loadEagerRelations: true,
        relations: {
          childImprovementNeeds: {
            improvementNeed: true,
          },
          childNeuroDiverseConditions: { neuroDiverseCondition: true },
        },
      });

      return this._i18nChildParams(child, i18n);
    } catch (e) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }
  }

  private _i18nChildParams(child: Child, i18n: I18nContext) {
    child.childImprovementNeeds = child.childImprovementNeeds.map((value) => {
      const name = value.improvementNeed.name;
      value.improvementNeed.name = i18n.t(`locale.${name}`, {
        defaultValue: name,
      });
      return value;
    });

    child.childNeuroDiverseConditions = child.childNeuroDiverseConditions.map(
      (value) => {
        const name = value.neuroDiverseCondition.name;
        value.neuroDiverseCondition.name = i18n.t(`locale.${name}`, {
          defaultValue: name,
        });
        return value;
      },
    );

    return child;
  }

  update(id: string, updateChildDto: UpdateChildDto, i18n: I18nContext) {
    return `This action updates a #${id} child`;
  }

  remove(id: string) {
    return `This action removes a #${id} child`;
  }
}
