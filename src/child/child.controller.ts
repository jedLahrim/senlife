import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { FilterChildDto } from './dto/filter-child.dto';
import { Pagination } from '../commons/pagination';
import { Child } from './entities/child.entity';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createChildDto: CreateChildDto,
    @I18n() i18n: I18nContext,
    @GetUser() user: User,
  ) {
    return this.childService.create(createChildDto, i18n, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @I18n() i18n: I18nContext,
    @Query() dto: FilterChildDto,
    @GetUser() user: User,
  ): Promise<Pagination<Child>> {
    return this.childService.findAll(i18n, dto, user);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.childService.findOne(id, i18n);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.childService.update(id, updateChildDto, i18n);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.childService.remove(id);
  }
}
