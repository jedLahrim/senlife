import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, Query,
} from '@nestjs/common';
import { AllergieService } from './allergie.service';
import { CreateAllergieDto } from './dto/create-allergie.dto';
import { UpdateAllergieDto } from './dto/update-allergie.dto';
import { FilterAllergieDto } from './dto/filter-allergie.dto';

@Controller('allergie')
export class AllergieController {
  constructor(private readonly allergieService: AllergieService) {}

  @Post()
  create(@Body() createAllergieDto: CreateAllergieDto) {
    return this.allergieService.create(createAllergieDto);
  }

  @Get()
  findAll(@Query() dto: FilterAllergieDto) {
    return this.allergieService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allergieService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAllergieDto: UpdateAllergieDto,
  ) {
    return this.allergieService.update(id, updateAllergieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allergieService.remove(id);
  }

  @Post('duplicate')
  duplicate(@Body('id') id: string) {
    return this.allergieService.duplicate(id);
  }
}
