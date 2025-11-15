import { IsString, MinLength } from "class-validator";

export class RejectRoomsDto {
    @IsString()
    @MinLength(5)
    reason: string;
}