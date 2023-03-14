import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MyCode } from './entities/code.entity';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(MyCode)
    private readonly codeRepository: Repository<MyCode>,
  ) {}

  findAll() {
    return this.codeRepository.find({
      order: {
        createdAt: 'asc',
      },
    });
  }
}
