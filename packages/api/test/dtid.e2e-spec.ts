import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("Digital Tourist ID (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let verifierToken: string;
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
    const verifierRes = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "verifier@test.com",
        password: "password123",
        role: "VERIFIER",
        profile: {
          organization: "Test Airport",
          location: "Terminal 1",
        },
      });
    verifierToken = verifierRes.body.access_token;

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

  describe("/dtid/create (POST)", () => {
    it("should create digital ID as verifier", async () => {
      // First get the tourist profile ID
      const touristProfile = await prisma.touristProfile.findFirst({
        where: { user: { email: "tourist@test.com" } },
      });

      return request(app.getHttpServer())
        .post("/dtid/create")
        .set("Authorization", `Bearer ${verifierToken}`)
        .send({
          touristId: touristProfile?.id,
          profile: {
            name: "Test Tourist",
            nationality: "USA",
            documentType: "passport",
            documentRef: "****1234",
          },
          contacts: [
            {
              name: "Emergency Contact",
              phone: "+1234567890",
              relationship: "Family",
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("digitalId");
          expect(res.body).toHaveProperty("qrCode");
          expect(res.body).toHaveProperty("anchorHash");
        });
    });

    it("should reject unauthorized role", () => {
      return request(app.getHttpServer())
        .post("/dtid/create")
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          touristId: "test-id",
          profile: {
            name: "Test Tourist",
            nationality: "USA",
            documentType: "passport",
            documentRef: "****1234",
          },
          contacts: [],
        })
        .expect(403);
    });
  });

  describe("/dtid/:id (GET)", () => {
    let digitalIdId: string;

    beforeEach(async () => {
      const touristProfile = await prisma.touristProfile.findFirst({
        where: { user: { email: "tourist@test.com" } },
      });

      const createRes = await request(app.getHttpServer())
        .post("/dtid/create")
        .set("Authorization", `Bearer ${verifierToken}`)
        .send({
          touristId: touristProfile?.id,
          profile: {
            name: "Test Tourist",
            nationality: "USA",
            documentType: "passport",
            documentRef: "****1234",
          },
          contacts: [
            {
              name: "Emergency Contact",
              phone: "+1234567890",
              relationship: "Family",
            },
          ],
        });

      digitalIdId = createRes.body.digitalId.id;
    });

    it("should get digital ID details as police", () => {
      return request(app.getHttpServer())
        .get(`/dtid/${digitalIdId}`)
        .set("Authorization", `Bearer ${policeToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", digitalIdId);
          expect(res.body).toHaveProperty("touristName");
          expect(res.body).toHaveProperty("emergencyContacts");
        });
    });

    it("should get limited details as tourist (self)", () => {
      return request(app.getHttpServer())
        .get(`/dtid/${digitalIdId}`)
        .set("Authorization", `Bearer ${touristToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", digitalIdId);
          expect(res.body).not.toHaveProperty("emergencyContacts");
        });
    });
  });

  describe("/dtid/:id/verify (POST)", () => {
    let digitalIdId: string;

    beforeEach(async () => {
      const touristProfile = await prisma.touristProfile.findFirst({
        where: { user: { email: "tourist@test.com" } },
      });

      const createRes = await request(app.getHttpServer())
        .post("/dtid/create")
        .set("Authorization", `Bearer ${verifierToken}`)
        .send({
          touristId: touristProfile?.id,
          profile: {
            name: "Test Tourist",
            nationality: "USA",
            documentType: "passport",
            documentRef: "****1234",
          },
          contacts: [],
        });

      digitalIdId = createRes.body.digitalId.id;
    });

    it("should verify digital ID as verifier", () => {
      return request(app.getHttpServer())
        .post(`/dtid/${digitalIdId}/verify`)
        .set("Authorization", `Bearer ${verifierToken}`)
        .send({
          location: "Airport Terminal 1",
          metadata: { checkpointId: "CP001" },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("verified", true);
          expect(res.body).toHaveProperty("tourist");
          expect(res.body).toHaveProperty("verification");
        });
    });

    it("should reject verification by tourist", () => {
      return request(app.getHttpServer())
        .post(`/dtid/${digitalIdId}/verify`)
        .set("Authorization", `Bearer ${touristToken}`)
        .send({
          location: "Airport Terminal 1",
        })
        .expect(403);
    });
  });
});
