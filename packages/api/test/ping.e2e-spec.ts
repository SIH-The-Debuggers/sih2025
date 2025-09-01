import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Location Ping (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let touristToken: string;
  let policeToken: string;

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/ping/location (POST)", () => {
    it("should record location ping as tourist", async () => {
      return request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10.5,
          altitude: 218.5,
          bearing: 45.0,
          speed: 1.2,
          batteryLevel: 85,
          isEmergency: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("recorded", true);
          expect(res.body).toHaveProperty("timestamp");
          expect(res.body).toHaveProperty("anomalies");
        });
    });

    it("should detect speed anomaly", async () => {
      return request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 5.0,
          speed: 150.0, // Very high speed for walking tourist
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.anomalies).toContain("HIGH_SPEED");
        });
    });

    it("should detect accuracy anomaly", async () => {
      return request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 500.0, // Very low accuracy
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.anomalies).toContain("LOW_ACCURACY");
        });
    });

    it("should reject location ping from non-tourist", () => {
      return request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${policeToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10.5,
        })
        .expect(403);
    });
  });

  describe("/ping/batch (POST)", () => {
    it("should process batch location pings", async () => {
      const pings = [
        {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10.5,
          timestamp: new Date().toISOString(),
        },
        {
          latitude: 28.614,
          longitude: 77.2091,
          accuracy: 8.2,
          timestamp: new Date(Date.now() + 30000).toISOString(),
        },
        {
          latitude: 28.6141,
          longitude: 77.2092,
          accuracy: 12.1,
          timestamp: new Date(Date.now() + 60000).toISOString(),
        },
      ];

      return request(app.getHttpServer())
        .post("/ping/batch")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({ pings })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("processed", 3);
          expect(res.body).toHaveProperty("anomalies");
          expect(Array.isArray(res.body.anomalies)).toBe(true);
        });
    });

    it("should validate batch size limit", () => {
      const largeBatch = Array(51).fill({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10.5,
        timestamp: new Date().toISOString(),
      });

      return request(app.getHttpServer())
        .post("/ping/batch")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({ pings: largeBatch })
        .expect(400);
    });
  });

  describe("/ping/tourist/:id/recent (GET)", () => {
    let touristId: string;

    beforeEach(async () => {
      const tourist = await prisma.touristProfile.findFirst({
        where: { user: { email: "tourist@test.com" } },
      });
      touristId = tourist?.id || "";

      // Create some location pings
      await request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10.5,
        });
    });

    it("should get recent pings as police", () => {
      return request(app.getHttpServer())
        .get(`/ping/tourist/${touristId}/recent`)
        .set("Authorization", `Bearer ${policeToken}`)
        .query({ hours: 24 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty("latitude");
          expect(res.body[0]).toHaveProperty("longitude");
        });
    });

    it("should get own recent pings as tourist", () => {
      return request(app.getHttpServer())
        .get(`/ping/tourist/${touristId}/recent`)
        .set("Authorization", `Bearer ${touristToken}`)
        .query({ hours: 1 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe("/ping/analytics (GET)", () => {
    beforeEach(async () => {
      // Create test data
      await request(app.getHttpServer())
        .post("/ping/location")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10.5,
        });
    });

    it("should get analytics as police", () => {
      return request(app.getHttpServer())
        .get("/ping/analytics")
        .set("Authorization", `Bearer ${policeToken}`)
        .query({
          hours: 24,
          area: "NEW_DELHI",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("totalPings");
          expect(res.body).toHaveProperty("uniqueTourists");
          expect(res.body).toHaveProperty("anomaliesDetected");
          expect(res.body).toHaveProperty("coverage");
        });
    });

    it("should reject analytics for tourist", () => {
      return request(app.getHttpServer())
        .get("/ping/analytics")
        .set("Authorization", `Bearer ${touristToken}`)
        .expect(403);
    });
  });

  describe("/ping/geofence (POST)", () => {
    it("should create geofence as police", async () => {
      return request(app.getHttpServer())
        .post("/ping/geofence")
        .set("Authorization", `Bearer ${policeToken}`)
        .send({
          name: "Red Fort Security Zone",
          type: "RESTRICTED",
          coordinates: [
            [77.239, 28.6562],
            [77.241, 28.6562],
            [77.241, 28.6582],
            [77.239, 28.6582],
            [77.239, 28.6562],
          ],
          alertOnEntry: true,
          alertOnExit: false,
          description: "High security area - restricted access",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body).toHaveProperty("name", "Red Fort Security Zone");
          expect(res.body).toHaveProperty("type", "RESTRICTED");
        });
    });

    it("should reject geofence creation by tourist", () => {
      return request(app.getHttpServer())
        .post("/ping/geofence")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          name: "Test Zone",
          type: "SAFE",
          coordinates: [],
        })
        .expect(403);
    });
  });
});
