import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NeuroDiverseConditionService } from './neuro-diverse-condition.service';
import { CreateNeuroDiverseConditionDto } from './dto/create-neuro-diverse-condition.dto';
import { UpdateNeuroDiverseConditionDto } from './dto/update-neuro-diverse-condition.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreateImprovementNeedDto } from '../improvement-need/dto/create-improvement-need.dto';

@Controller('neuro-diverse-condition')
export class NeuroDiverseConditionController {
  constructor(
    private readonly neuroDiverseConditionService: NeuroDiverseConditionService,
  ) {}

  @Post()
  create(
    @Body() createNeuroDiverseConditionDto: CreateNeuroDiverseConditionDto,
  ) {
    return this.neuroDiverseConditionService.create(
      createNeuroDiverseConditionDto,
    );
  }

  @Post('/many')
  createMany(@Body() dtos: CreateNeuroDiverseConditionDto[]) {
    return this.neuroDiverseConditionService.createMany(dtos);
  }

  @Get()
  findAll(@I18n() i18n: I18nContext) {
    return this.neuroDiverseConditionService.findAll(i18n);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.neuroDiverseConditionService.findOne(id, i18n);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNeuroDiverseConditionDto: UpdateNeuroDiverseConditionDto,
  ) {
    return this.neuroDiverseConditionService.update(
      id,
      updateNeuroDiverseConditionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.neuroDiverseConditionService.remove(id);
  }
}
