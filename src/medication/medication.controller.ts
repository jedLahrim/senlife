import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { FilterMedicationDto } from './dto/filter-medication.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('medication')
@UseGuards(AuthGuard('jwt'))
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationService.create(createMedicationDto);
  }
  @Post('duplicate/:id')
  duplicate(@Param('id') id: string) {
    return this.medicationService.duplicate(id);
  }

  @Get()
  findAll(@Query() dto: FilterMedicationDto) {
    return this.medicationService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.medicationService.update(id, updateMedicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicationService.remove(id);
  }
}
