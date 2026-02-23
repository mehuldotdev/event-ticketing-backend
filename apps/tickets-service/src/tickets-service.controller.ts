import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TicketsServiceService } from './tickets-service.service';
import { PurchaseTicketDto } from '@app/common/dto/purchase-ticket.dto';
import { CheckInTicketDto } from '@app/common';

@Controller()
export class TicketsServiceController {
  constructor(private readonly ticketsServiceService: TicketsServiceService) {}

  @Post('purchase')
  purchase(@Body() purchaseDto: PurchaseTicketDto,
    @Headers('x-user-id') userId: string) {
    return this.ticketsServiceService.purchase(purchaseDto, userId);
  }

  @Get('my-tickets')
  findMyTickets(@Headers('x-user-id') userId: string) {
    return this.ticketsServiceService.findMyTickets(userId);
  }

  @Get(':id')
  findOne(@Headers('x-user-id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsServiceService.findOne(id, userId);
  }

  @Post(':id/cancel')
  cancel(@Headers('x-user-id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsServiceService.cancel(id, userId);
  }

  @Post('check-in')
  checkIn(@Body() checkinDto: CheckInTicketDto,
    @Headers('x-user-id') userId: string) {
    return this.ticketsServiceService.checkIn(checkinDto.ticketId, userId);
  }

  
}
