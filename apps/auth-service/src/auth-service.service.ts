import { DatabaseService, users } from '@app/database';
import { KAFKA_TOPICS } from '@app/kafka';
import { KAFKA_SERVICE } from '@app/kafka/kafka.module';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { ClientKafka } from '@nestjs/microservices/client/client-kafka';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService implements OnModuleInit {

  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect(); 
  }

  // getHello(): string {
  //   return 'Hello World!';
  // }

  // simulateUserRegistration(email: string) {
  //   // publishing event to Kafka
  //   this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, { 
  //     email,
  //     timeStamp: new Date().toISOString(),
  //   });

  //   return { message: `User with email ${email} registered successfully!` };
  // }

  async register(email: string, password: string, name: string) {
    // check if user exists
    const existingUser = await this.dbService.db
      .select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, password: hashedPassword, name })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return { message: 'User registered successfully' };
  }

  async login(email: string, password: string) {
    const [user] = await this.dbService.db
      .select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }

  async getProfile(userId: string) {
    const [user] = await this.dbService.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

}
