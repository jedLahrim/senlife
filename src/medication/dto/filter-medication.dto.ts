import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MedicationOrderBy {
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
}
export class FilterMedicationDto {
  @IsOptional()
  take?: number;
  @IsOptional()
  skip?: number;
  @IsOptional()
  @IsEnum(MedicationOrderBy, {
    message: 'this medication order type is invalid',
  })
  orderBy?: MedicationOrderBy;
  @IsOptional()
  @IsEnum(SortType, {
    message: 'this medication order type is invalid',
  })
  sortType?: SortType;
}
