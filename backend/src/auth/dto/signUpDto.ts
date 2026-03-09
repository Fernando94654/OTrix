import { IsEmail, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Gender } from '../../../generated/prisma/enums.js';
import { Type } from 'class-transformer';

export class SignUpDto {
    @IsString()
    name: string;

    @IsString()
    last_name: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsDateString()
    @Type(() => Date)
    birthday: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsOptional()
    @IsString()
    company: string;
}