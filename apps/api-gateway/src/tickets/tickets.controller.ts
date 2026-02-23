import {Controller, Get, Headers, ParseUUIDPipe, Post, Body, UseGuards, Param} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from './tickets.service';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common';


@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post('purchase')
    purchase(@Body() purchaseDto: PurchaseTicketDto, @Headers('authorization') authorization: string) {
        return this.ticketsService.purchase(purchaseDto, authorization);
    }
    
    @Get(':id')
    findOne(@Headers('authorization') authorization: string, @Param('id', new ParseUUIDPipe()) id: string) {
        return this.ticketsService.findOne(id, authorization);
    }

    @Post(':id/cancel')
    cancel(@Headers('authorization') authorization: string, @Param('id', new ParseUUIDPipe()) id: string) {
        return this.ticketsService.cancel(id, authorization);
    }

    @Post('check-in')
    checkIn(@Body() checkinDto: CheckInTicketDto, @Headers('authorization') authorization: string) {
         return this.ticketsService.checkin(checkinDto.ticketId, authorization);
    }

    @Get('event/:eventId')
    findByEvent(@Headers('authorization') authorization: string, @Param('eventId', new ParseUUIDPipe()) eventId: string) {
        return this.ticketsService.findEventTickets(eventId, authorization);
    }
}