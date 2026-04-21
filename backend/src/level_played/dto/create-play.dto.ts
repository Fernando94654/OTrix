import { IsInt, IsOptional, Min } from 'class-validator';

export class CreatePlayDto {
    @IsInt()
    level_id: number;

    @IsInt()
    @Min(0)
    score: number;

    @IsInt()
    @Min(1)
    attempts: number;

    @IsInt()
    @Min(0)
    time_used: number;

    @IsOptional()
    @IsInt()
    client_epoch_ms?: number;
}
