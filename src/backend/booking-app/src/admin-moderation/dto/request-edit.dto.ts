import { IsString, MinLength } from "class-validator";

export class RequestEditDto {
    @IsString()
    @MinLength(5)
    notes: string;
}
