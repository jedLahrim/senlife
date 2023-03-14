import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post()
  create(@Body() createChildDto: CreateChildDto, @I18n() i18n: I18nContext) {
    return this.childService.create(createChildDto, i18n);
  }

  @Get()
  findAll(@I18n() i18n: I18nContext) {
    return this.childService.findAll(i18n);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.childService.findOne(id, i18n);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.childService.update(id, updateChildDto, i18n);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.childService.remove(id);
  }
}
