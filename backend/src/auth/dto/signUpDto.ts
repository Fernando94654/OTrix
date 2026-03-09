import { IsEmail, IsString, IsDateString, IsEnum } from 'class-validator';
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

    @IsString()
    company: string;
}