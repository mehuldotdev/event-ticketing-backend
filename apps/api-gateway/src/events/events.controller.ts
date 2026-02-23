import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { EventService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto, UpdateEventDto } from '@app/common';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventService) {}

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    // Protected routes
    @UseGuards(AuthGuard('jwt'))
    @Get('my-events')
    findMyEvents(@Req() req: { user: { id: string } }) {
        return this.eventsService.findMyEvents(req.user.id);
    }

    // Public
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.eventsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createEventDto: CreateEventDto, @Req() req: { user: { id: string, role: string } }) {
        return this.eventsService.create(createEventDto, req.user.id, req.user.role || 'USER');
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateEventDto: UpdateEventDto, @Req() req: { user: { id: string, role: string } }) {
        return this.eventsService.update(id, updateEventDto, req.user.id, req.user.role || 'USER');
    }

        @UseGuards(AuthGuard('jwt'))
    @Put(':id/publish')
    publish(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateEventDto: UpdateEventDto, @Req() req: { user: { id: string, role: string } }) {
        return this.eventsService.update(id, updateEventDto, req.user.id, req.user.role || 'USER');
    }


}