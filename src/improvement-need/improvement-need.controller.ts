import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ImprovementNeedService } from './improvement-need.service';
import { CreateImprovementNeedDto } from './dto/create-improvement-need.dto';
import { UpdateImprovementNeedDto } from './dto/update-improvement-need.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('improvement-need')
export class ImprovementNeedController {
  constructor(
    private readonly improvementNeedService: ImprovementNeedService,
  ) {}

  @Post()
  create(@Body() dto: CreateImprovementNeedDto) {
    return this.improvementNeedService.create(dto);
  }

  @Post('/many')
  createMany(@Body() dtos: CreateImprovementNeedDto[]) {
    return this.improvementNeedService.createMany(dtos);
  }

  @Get()
  findAll(@I18n() i18n: I18nContext) {
    return this.improvementNeedService.findAll(i18n);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.improvementNeedService.findOne(id, i18n);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateImprovementNeedDto,
  ) {
    return this.improvementNeedService.update(id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.improvementNeedService.remove(id);
  }
}
