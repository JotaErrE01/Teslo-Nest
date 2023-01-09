import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;
  
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt() // -> no decimales
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;
}
