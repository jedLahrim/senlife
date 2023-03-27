import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrderBy {
  UPDATED_AT = 'UPDATED_AT',
}
export class FilterMedicationDto {
  @IsOptional()
  take?: number;
  @IsOptional()
  skip?: number;
  @IsOptional()
  @IsEnum(OrderBy, {
    message: 'this medication order type is invalid',
  })
  orderBy?: OrderBy;
  @IsOptional()
  @IsEnum(SortType, {
    message: 'this medication order type is invalid',
  })
  sortType?: SortType;
}
