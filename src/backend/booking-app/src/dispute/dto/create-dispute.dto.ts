import {
    isNotEmpty,
    IsNotEmpty,
    isNumber,
    IsNumber,
    IsString,
    Min,
} from 'class-validator'
export class CreateDisputeDto {
    @IsNotEmpty()
    @IsNumber()
    bookingId: string;

    @IsNotEmpty()
    @IsString()
    @Min(3)
    reason: string;
}
