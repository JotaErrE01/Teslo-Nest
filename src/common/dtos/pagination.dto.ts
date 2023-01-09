import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO {
  @IsPositive()
  @IsOptional()
  @Type(() => Number) // Transform the string into a number
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number) // Transform the string into a number
  offset?: number;
}