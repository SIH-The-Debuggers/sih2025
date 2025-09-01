import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { PrismaService } from "./database/prisma.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS configuration
  app.enableCors({
    origin: [
      configService.get<string>("FRONTEND_URL", "http://localhost:3001"),
      configService.get<string>("MOBILE_APP_URL", "http://localhost:3002"),
      "http://localhost:3000", // Tourist web
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // API prefix
  app.setGlobalPrefix("api/v1", {
    exclude: ["health", "metrics"],
  });

  // Swagger API documentation (only in development)
  if (nodeEnv === "development") {
    const config = new DocumentBuilder()
      .setTitle("Tourist Safety Platform API")
      .setDescription(
        "Smart Tourist Safety Monitoring & Incident Response System"
      )
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
        "JWT-auth"
      )
      .addTag("Authentication", "User authentication and authorization")
      .addTag("Digital Tourist ID", "Digital ID creation and verification")
      .addTag("Alerts", "Emergency alert management")
      .addTag("Location Tracking", "Location ping and geofencing")
      .addTag("WebSocket", "Real-time communication")
      .addTag("Users", "User management")
      .addTag("Cases", "Case management")
      .addTag("Units", "Police unit management")
      .addTag("Analytics", "System analytics and reporting")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
      },
    });

    logger.log(
      `📚 API Documentation available at: http://localhost:${port}/api/docs`
    );
  }

  // Prisma connection
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    logger.log("Received SIGINT, shutting down gracefully...");
    await app.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.log("Received SIGTERM, shutting down gracefully...");
    await app.close();
    process.exit(0);
  });

  await app.listen(port, "0.0.0.0");

  logger.log(
    `🚀 Tourist Safety Platform API running on: http://localhost:${port}`
  );
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`📊 Health Check: http://localhost:${port}/health`);

  if (nodeEnv === "development") {
    logger.log(`🔍 API Base URL: http://localhost:${port}/api/v1`);
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start the application:", error);
  process.exit(1);
});
