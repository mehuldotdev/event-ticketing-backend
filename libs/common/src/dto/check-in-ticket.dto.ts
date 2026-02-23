import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CheckInTicketDto {
    @IsUUID('4', { message: 'Ticket ID must be a valid UUID v4' })
    @IsNotEmpty({ message: 'Ticket ID is required' })
    ticketId: string;
}