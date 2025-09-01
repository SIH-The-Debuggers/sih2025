import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@tourist-safety.com" },
    update: {},
    create: {
      email: "admin@tourist-safety.com",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Create police user
  const police = await prisma.user.upsert({
    where: { email: "officer@police.gov" },
    update: {},
    create: {
      email: "officer@police.gov",
      role: "POLICE",
      status: "ACTIVE",
      policeProfile: {
        create: {
          badgeNumber: "POL001",
          rank: "Inspector",
          department: "Tourism Police",
          station: "Central Station",
          isOnDuty: true,
          currentLat: 28.6139, // New Delhi
          currentLng: 77.209,
        },
      },
    },
  });

  // Create verifier user
  const verifier = await prisma.user.upsert({
    where: { email: "verify@airport.com" },
    update: {},
    create: {
      email: "verify@airport.com",
      role: "VERIFIER",
      status: "ACTIVE",
      verifierProfile: {
        create: {
          organization: "Delhi Airport Authority",
          location: "Terminal 3, IGI Airport",
          isApproved: true,
        },
      },
    },
  });

  // Create sample risk zones
  const riskZones = await Promise.all([
    prisma.riskZone.upsert({
      where: { id: "risk-zone-1" },
      update: {},
      create: {
        id: "risk-zone-1",
        name: "Old Delhi High Crime Area",
        description: "Area with elevated pickpocket incidents",
        level: "HIGH",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [77.225, 28.65],
              [77.23, 28.65],
              [77.23, 28.655],
              [77.225, 28.655],
              [77.225, 28.65],
            ],
          ],
        },
        isActive: true,
        createdBy: admin.id,
      },
    }),
    prisma.riskZone.upsert({
      where: { id: "risk-zone-2" },
      update: {},
      create: {
        id: "risk-zone-2",
        name: "Construction Zone",
        description: "Temporary construction area - exercise caution",
        level: "MEDIUM",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [77.21, 28.62],
              [77.215, 28.62],
              [77.215, 28.625],
              [77.21, 28.625],
              [77.21, 28.62],
            ],
          ],
        },
        isActive: true,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create sample tourist
  const tourist = await prisma.user.upsert({
    where: { email: "tourist@example.com" },
    update: {},
    create: {
      email: "tourist@example.com",
      phone: "+919876543210",
      role: "TOURIST",
      status: "ACTIVE",
      touristProfile: {
        create: {
          name: "John Smith",
          nationality: "United States",
          documentType: "passport",
          documentRef: "****5678",
          didUri: `did:web:tourist-safety.com:${Date.now()}`,
          encryptedPII: Buffer.from(
            JSON.stringify({
              fullName: "John Smith",
              passportNumber: "US12345678",
              dateOfBirth: "1990-05-15",
              address: "123 Main St, New York, NY",
            })
          ),
          kycStatus: "VERIFIED",
          consentTracking: true,
          consentAnalytics: false,
          emergencyContacts: {
            create: [
              {
                name: "Jane Smith",
                phone: "+1234567890",
                email: "jane@example.com",
                relationship: "Spouse",
                priority: 1,
              },
              {
                name: "Embassy USA",
                phone: "+911234567890",
                email: "emergency@usembassy.in",
                relationship: "Embassy",
                priority: 2,
              },
            ],
          },
        },
      },
    },
  });

  // Create sample trip
  const trip = await prisma.trip.create({
    data: {
      touristId: tourist.touristProfile!.id,
      title: "Golden Triangle Tour",
      description: "Delhi - Agra - Jaipur tour package",
      startDate: new Date("2024-12-01"),
      endDate: new Date("2024-12-10"),
      origin: "New Delhi",
      destination: "Jaipur",
      itinerary: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Red Fort" },
            geometry: {
              type: "Point",
              coordinates: [77.241, 28.6562],
            },
          },
          {
            type: "Feature",
            properties: { name: "Taj Mahal" },
            geometry: {
              type: "Point",
              coordinates: [78.0421, 27.1751],
            },
          },
          {
            type: "Feature",
            properties: { name: "Hawa Mahal" },
            geometry: {
              type: "Point",
              coordinates: [75.8267, 26.9239],
            },
          },
        ],
      },
      status: "ACTIVE",
    },
  });

  // Create sample Digital ID
  const digitalId = await prisma.digitalID.create({
    data: {
      touristId: tourist.touristProfile!.id,
      tripId: trip.id,
      anchorHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      qrPayload: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      validFrom: new Date("2024-12-01"),
      validTo: new Date("2024-12-10"),
    },
  });

  // Create sample location pings
  const locationPings = await Promise.all([
    prisma.locationPing.create({
      data: {
        touristId: tourist.touristProfile!.id,
        latitude: 28.6139,
        longitude: 77.209,
        altitude: 216,
        speed: 0,
        accuracy: 5,
        timestamp: new Date(),
      },
    }),
    prisma.locationPing.create({
      data: {
        touristId: tourist.touristProfile!.id,
        latitude: 28.6141,
        longitude: 77.2092,
        altitude: 216,
        speed: 1.2,
        accuracy: 3,
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
      },
    }),
  ]);

  // Create sample alert
  const alert = await prisma.alert.create({
    data: {
      type: "GEOFENCE",
      severity: 3,
      status: "OPEN",
      touristId: tourist.touristProfile!.id,
      title: "Tourist entered high-risk area",
      description:
        "Tourist John Smith has entered the Old Delhi High Crime Area",
      latitude: 28.6525,
      longitude: 77.2275,
      riskZoneId: riskZones[0].id,
      metadata: {
        entryTime: new Date().toISOString(),
        riskLevel: "HIGH",
        recommendedAction: "Contact tourist and advise caution",
      },
    },
  });

  // Create system configuration
  await prisma.systemConfig.upsert({
    where: { key: "alert_thresholds" },
    update: {},
    create: {
      key: "alert_thresholds",
      value: {
        inactivity_minutes: 30,
        speed_anomaly_threshold: 80, // km/h
        accuracy_degradation_threshold: 100, // meters
        route_deviation_threshold: 300, // meters
      },
      category: "alerts",
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: "notification_settings" },
    update: {},
    create: {
      key: "notification_settings",
      value: {
        sms_enabled: true,
        email_enabled: true,
        push_enabled: true,
        whatsapp_enabled: false,
        max_retries: 3,
        retry_interval_minutes: 5,
      },
      category: "notifications",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Users created: Admin, Police, Verifier, Tourist`);
  console.log(`🗺️  Risk zones: ${riskZones.length}`);
  console.log(`🆔 Digital IDs: 1`);
  console.log(`📍 Location pings: ${locationPings.length}`);
  console.log(`🚨 Alerts: 1`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
