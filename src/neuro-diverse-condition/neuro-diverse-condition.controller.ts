import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NeuroDiverseConditionService } from './neuro-diverse-condition.service';
import { CreateNeuroDiverseConditionDto } from './dto/create-neuro-diverse-condition.dto';
import { UpdateNeuroDiverseConditionDto } from './dto/update-neuro-diverse-condition.dto';

@Controller('neuro-diverse-condition')
export class NeuroDiverseConditionController {
  constructor(private readonly neuroDiverseConditionService: NeuroDiverseConditionService) {}

  @Post()
  create(@Body() createNeuroDiverseConditionDto: CreateNeuroDiverseConditionDto) {
    return this.neuroDiverseConditionService.create(createNeuroDiverseConditionDto);
  }

  @Get()
  findAll() {
    return this.neuroDiverseConditionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.neuroDiverseConditionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNeuroDiverseConditionDto: UpdateNeuroDiverseConditionDto) {
    return this.neuroDiverseConditionService.update(+id, updateNeuroDiverseConditionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.neuroDiverseConditionService.remove(+id);
  }
}
