import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { AppService } from "../app.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "apps/auth-service/src/jwt.strategy";

@Module({
    imports: [PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
        })
    ],
    controllers: [EventsController],
    providers: [AppService, JwtStrategy],
})
export class EventsModule {}