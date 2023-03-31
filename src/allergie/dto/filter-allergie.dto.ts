import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum AllergieOrderBy {
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
}
export class FilterAllergieDto {
  @IsOptional()
  take?: number;
  @IsOptional()
  skip?: number;
  @IsOptional()
  @IsEnum(AllergieOrderBy, {
    message: 'this allergie order type is invalid',
  })
  orderBy?: AllergieOrderBy;
  @IsOptional()
  @IsEnum(SortType, {
    message: 'this allergie order type is invalid',
  })
  sortType?: SortType;
}
