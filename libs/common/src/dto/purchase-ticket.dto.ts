import { IsInt, IsNotEmpty, IsUUID, Max, Min } from "class-validator";

export class PurchaseTicketDto {
    @IsUUID('4', { message: 'Event ID must be a valid UUID v4' })
    @IsNotEmpty({ message: 'Event ID is required' })
    eventId: string;

    @IsInt({ message: 'Quantity must be an integer' })
    @IsNotEmpty({ message: 'Quantity is required' })
    @Min(1, { message: 'Quantity must be at least 1' })
    @Max(10, { message: 'Quantity cannot exceed 10' })
    quantity: number;
}