import { Body, Controller, Get, Post, Headers, Param, Put, ParseUUIDPipe, Head } from '@nestjs/common';
import { EventsServiceService } from './events-service.service';
import { CreateEventDto } from '@app/common/dto/create-event-dto';
import { useContainer } from 'class-validator';

@Controller()
export class EventsServiceController {
  constructor(private readonly eventsServiceService: EventsServiceService) { }

  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Headers('x-user-id') userId: string,

  ) {
    return this.eventsServiceService.create(createEventDto, userId);
  }

  @Get()
  findAll() {
    return this.eventsServiceService.findAll();
  }

  @Get('my-events')
  findMyEvents(@Headers('x-user-id') userId: string) {
    return this.eventsServiceService.findMyEvents(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsServiceService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: CreateEventDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.eventsServiceService.update(id, updateEventDto, userId, userRole);
  }

  @Post(':id/publish')
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.eventsServiceService.publish(id, userId, userRole);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.eventsServiceService.cancel(id, userId, userRole);
  }

}
