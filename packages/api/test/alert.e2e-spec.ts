import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Alert System (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let touristToken: string;
  let policeToken: string;
  let operatorToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Create test users and get tokens
    const touristRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "tourist@test.com",
        password: "password123",
        role: "TOURIST",
        profile: {
          name: "Test Tourist",
          nationality: "USA",
          documentType: "passport",
          documentRef: "****1234",
        },
      });
    touristToken = touristRes.body.access_token;

    const policeRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "police@test.com",
        password: "password123",
        role: "POLICE",
        profile: {
          badgeNumber: "POL001",
          rank: "Inspector",
          department: "Tourism Police",
          station: "Central Station",
        },
      });
    policeToken = policeRes.body.access_token;

    const operatorRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "operator@test.com",
        password: "password123",
        role: "CONTROL_ROOM",
        profile: {
          operatorId: "OP001",
          shift: "DAY",
        },
      });
    operatorToken = operatorRes.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/alert/panic (POST)", () => {
    it("should create panic alert as tourist", async () => {
      return request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "MEDICAL",
          description: "I need medical help immediately",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body).toHaveProperty("status", "ACTIVE");
          expect(res.body).toHaveProperty("type", "PANIC");
          expect(res.body).toHaveProperty("emergencyType", "MEDICAL");
        });
    });

    it("should reject panic alert from non-tourist", () => {
      return request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${policeToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "SECURITY",
        })
        .expect(403);
    });
  });

  describe("/alert/active (GET)", () => {
    let alertId: string;

    beforeEach(async () => {
      const alertRes = await request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "SECURITY",
          description: "Help needed",
        });

      alertId = alertRes.body.id;
    });

    it("should get active alerts as police", () => {
      return request(app.getHttpServer())
        .get("/alert/active")
        .set("Authorization", `Bearer ${policeToken}`)
        .query({ radius: 5000 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty("id", alertId);
        });
    });

    it("should filter by radius", () => {
      return request(app.getHttpServer())
        .get("/alert/active")
        .set("Authorization", `Bearer ${policeToken}`)
        .query({
          radius: 1, // Very small radius
          lat: 0,
          lng: 0,
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe("/alert/:id/respond (POST)", () => {
    let alertId: string;

    beforeEach(async () => {
      const alertRes = await request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "SECURITY",
          description: "Help needed",
        });

      alertId = alertRes.body.id;
    });

    it("should respond to alert as police", () => {
      return request(app.getHttpServer())
        .post(`/alert/${alertId}/respond`)
        .set("Authorization", `Bearer ${policeToken}`)
        .send({
          responseType: "ACKNOWLEDGE",
          estimatedArrival: "10 minutes",
          notes: "Unit dispatched, en route",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("alert");
          expect(res.body).toHaveProperty("response");
          expect(res.body.response).toHaveProperty("type", "ACKNOWLEDGE");
        });
    });

    it("should update alert status", () => {
      return request(app.getHttpServer())
        .post(`/alert/${alertId}/respond`)
        .set("Authorization", `Bearer ${policeToken}`)
        .send({
          responseType: "RESOLVED",
          resolutionNotes: "Tourist safely assisted",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.alert).toHaveProperty("status", "RESOLVED");
        });
    });

    it("should reject response from tourist", () => {
      return request(app.getHttpServer())
        .post(`/alert/${alertId}/respond`)
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          responseType: "ACKNOWLEDGE",
        })
        .expect(403);
    });
  });

  describe("/alert/:id/status (PUT)", () => {
    let alertId: string;

    beforeEach(async () => {
      const alertRes = await request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "MEDICAL",
        });

      alertId = alertRes.body.id;
    });

    it("should update alert status as control room", () => {
      return request(app.getHttpServer())
        .put(`/alert/${alertId}/status`)
        .set("Authorization", `Bearer ${operatorToken}`)
        .send({
          status: "IN_PROGRESS",
          notes: "Medical unit dispatched",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("status", "IN_PROGRESS");
        });
    });

    it("should escalate alert priority", () => {
      return request(app.getHttpServer())
        .put(`/alert/${alertId}/status`)
        .set("Authorization", `Bearer ${operatorToken}`)
        .send({
          priority: "CRITICAL",
          notes: "Escalating to critical priority",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("priority", "CRITICAL");
        });
    });
  });

  describe("/alert/:id (GET)", () => {
    let alertId: string;

    beforeEach(async () => {
      const alertRes = await request(app.getHttpServer())
        .post("/alert/panic")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 10.5,
          },
          emergencyType: "SECURITY",
          description: "Help needed urgently",
        });

      alertId = alertRes.body.id;
    });

    it("should get alert details with full info for police", () => {
      return request(app.getHttpServer())
        .get(`/alert/${alertId}`)
        .set("Authorization", `Bearer ${policeToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", alertId);
          expect(res.body).toHaveProperty("tourist");
          expect(res.body).toHaveProperty("location");
          expect(res.body).toHaveProperty("responses");
        });
    });

    it("should get alert details for tourist (own alert)", () => {
      return request(app.getHttpServer())
        .get(`/alert/${alertId}`)
        .set("Authorization", `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", alertId);
          expect(res.body).toHaveProperty("status");
          expect(res.body).toHaveProperty("responses");
        });
    });
  });
});
