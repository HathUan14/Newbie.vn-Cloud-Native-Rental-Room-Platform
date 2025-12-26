import { PartialType } from '@nestjs/mapped-types';
import { CreateDisputeDto } from './create-dispute.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
//import { DisputeStatus } from '../dispute.constant';

export class UpdateDisputeDto extends PartialType(CreateDisputeDto) {
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    bookingId: string;

    @IsNotEmpty()
    @IsString()
    @Min(3)
    reason: string;

/*
    @ValidateIf((o) => o.status === DisputeStatus.RESOLVED_DENIED)
    @IsOptional()
    @IsString()
    rejectReason?: string;
*/
}