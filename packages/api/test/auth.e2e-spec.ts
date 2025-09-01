import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Authentication (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/auth/register (POST)", () => {
    it("should register a new tourist", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          role: "TOURIST",
          profile: {
            name: "Test Tourist",
            nationality: "USA",
            documentType: "passport",
            documentRef: "****1234",
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body.user).toHaveProperty("role", "TOURIST");
        });
    });

    it("should register a new police officer", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "officer@police.gov",
          password: "password123",
          role: "POLICE",
          profile: {
            badgeNumber: "POL001",
            rank: "Inspector",
            department: "Tourism Police",
            station: "Central Station",
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body.user).toHaveProperty("role", "POLICE");
        });
    });

    it("should reject duplicate email registration", async () => {
      // First registration
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password123",
          role: "TOURIST",
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password456",
          role: "TOURIST",
        })
        .expect(400);
    });
  });

  describe("/auth/login (POST)", () => {
    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer()).post("/auth/register").send({
        email: "login-test@example.com",
        password: "password123",
        role: "TOURIST",
      });
    });

    it("should login with valid credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "login-test@example.com",
          password: "password123",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body.user).toHaveProperty(
            "email",
            "login-test@example.com"
          );
        });
    });

    it("should reject invalid credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "login-test@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("/auth/otp/send (POST)", () => {
    it("should send OTP to valid phone number", () => {
      return request(app.getHttpServer())
        .post("/auth/otp/send")
        .send({
          phone: "+919876543210",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("success", true);
        });
    });
  });

  describe("/auth/otp/verify (POST)", () => {
    it("should verify OTP and login", () => {
      return request(app.getHttpServer())
        .post("/auth/otp/verify")
        .send({
          phone: "+919876543210",
          otp: "123456",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
        });
    });

    it("should reject invalid OTP format", () => {
      return request(app.getHttpServer())
        .post("/auth/otp/verify")
        .send({
          phone: "+919876543210",
          otp: "12345", // Too short
        })
        .expect(401);
    });
  });
});
