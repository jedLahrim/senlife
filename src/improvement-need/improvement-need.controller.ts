import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(@Body() createLabelDto: CreateLabelDto) {
    return this.labelService.create(createLabelDto);
  }

  @Post('/many')
  createMany(@Body() createLabelDtos: CreateLabelDto[]) {
    return this.labelService.createMany(createLabelDtos);
  }

  @Get()
  findAll(@I18n() i18n: I18nContext) {
    return this.labelService.findAll(i18n);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.labelService.findOne(id, i18n);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    return this.labelService.update(id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labelService.remove(id);
  }
}
