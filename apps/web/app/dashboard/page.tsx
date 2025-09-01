"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Mock user data - replace with actual auth store
const mockUser = {
  id: "1",
  email: "john.doe@example.com",
  profile: {
    name: "John Doe",
    nationality: "USA",
    phone: "+1-555-0123",
  },
  digitalId: {
    id: "DTID001",
    qrCode:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2MCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICA8IS0tIE1vcmUgUVIgY29kZSBwYXR0ZXJucy4uLiAtLT4KICA8dGV4dCB4PSI3MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9ImJsYWNrIj5EVElEMDAxPC90ZXh0Pgo8L3N2Zz4K",
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
  },
  emergencyContacts: [
    {
      name: "Jane Doe",
      phone: "+1-555-0124",
      relationship: "Spouse",
    },
    {
      name: "Emergency Services",
      phone: "112",
      relationship: "Emergency",
    },
  ],
  locationTracking: {
    isEnabled: true,
    lastLocation: {
      lat: 28.6139,
      lng: 77.209,
      address: "New Delhi, India",
      timestamp: "2024-01-20T14:30:00Z",
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";

  const [user] = useState(mockUser);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "enabled" | "disabled" | "loading"
  >("loading");

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("tourist_auth_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Check location permissions
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationStatus(result.state === "granted" ? "enabled" : "disabled");
      });
    }
  }, [router]);

  const handlePanicButton = async () => {
    setIsPanicActive(true);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const alertData = {
        type: "PANIC",
        severity: "HIGH",
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        message: "Emergency assistance required",
        timestamp: new Date().toISOString(),
      };

      console.log("Panic alert sent:", alertData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Emergency alert sent! Authorities have been notified.");
    } catch (error) {
      console.error("Failed to send panic alert:", error);
      alert(
        "Failed to send emergency alert. Please try calling emergency services directly."
      );
    } finally {
      setIsPanicActive(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tourist_auth_token");
    localStorage.removeItem("tourist_profile");
    router.push("/");
  };

  const enableLocationTracking = async () => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      setLocationStatus("enabled");
      console.log("Location enabled:", position.coords);
    } catch (error) {
      console.error("Location permission denied:", error);
      alert(
        "Location access is required for safety features. Please enable it in your browser settings."
      );
    }
  };

  if (isWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Tourist Safe!
            </h2>
            <p className="mt-2 text-gray-600">
              Your Digital Tourist ID has been created successfully.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              Your Digital ID: {user.digitalId.id}
            </h3>
            <p className="text-sm text-blue-700">
              Keep your phone with you at all times. Your digital ID includes
              emergency contacts and location tracking for your safety.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Tourist Safe
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQRCode(true)}
                className="text-gray-500 hover:text-gray-700"
                title="Show QR Code"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h4m4 0h4"
                  />
                </svg>
              </button>

              <div className="relative">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4 12h16m-8-8h8m-8 16h8"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Digital ID Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Digital ID
                </h3>
                <p className="text-sm text-gray-500">
                  Active • {user.digitalId.id}
                </p>
              </div>
            </div>
          </div>

          {/* Location Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${locationStatus === "enabled" ? "bg-green-100" : "bg-yellow-100"}`}
              >
                <svg
                  className={`h-6 w-6 ${locationStatus === "enabled" ? "text-green-600" : "text-yellow-600"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Location</h3>
                <p className="text-sm text-gray-500">
                  {locationStatus === "enabled"
                    ? "Tracking Active"
                    : "Disabled"}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                <p className="text-sm text-gray-500">
                  {user.emergencyContacts.length} Emergency Contacts
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900">{user.profile.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nationality
                  </label>
                  <p className="text-gray-900">{user.profile.nationality}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900">{user.profile.phone}</p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/profile/edit"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Emergency & Safety */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Emergency & Safety
              </h2>

              {/* Panic Button */}
              <div className="mb-6">
                <button
                  onClick={handlePanicButton}
                  disabled={isPanicActive}
                  className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg ${
                    isPanicActive
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  } transition-colors duration-200`}
                >
                  {isPanicActive ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Sending Alert...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z"
                        />
                      </svg>
                      PANIC BUTTON
                    </div>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press in case of emergency. This will immediately alert
                  authorities and your emergency contacts.
                </p>
              </div>

              {/* Location Tracking */}
              {locationStatus === "disabled" && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="h-5 w-5 text-yellow-600 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Location Tracking Disabled
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Enable location tracking for safety monitoring and emergency
                    response.
                  </p>
                  <button
                    onClick={enableLocationTracking}
                    className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    Enable Location
                  </button>
                </div>
              )}

              {/* Emergency Contacts */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Emergency Contacts
                </h3>
                <div className="space-y-3">
                  {user.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contact.relationship}
                        </p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowQRCode(true)}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="h-8 w-8 text-blue-600 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h4m4 0h4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Show QR Code
            </span>
          </button>

          <Link
            href="/alerts"
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="h-8 w-8 text-orange-600 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 12h16m-8-8h8m-8 16h8"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              View Alerts
            </span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="h-8 w-8 text-gray-600 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </Link>

          <Link
            href="/help"
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <svg
              className="h-8 w-8 text-green-600 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Help & Support
            </span>
          </Link>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Your Digital ID
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <img
                src={user.digitalId.qrCode}
                alt="Digital ID QR Code"
                className="mx-auto mb-4 border border-gray-200 rounded-lg"
                width={200}
                height={200}
              />
              <p className="text-sm text-gray-600 mb-2">
                Digital ID: {user.digitalId.id}
              </p>
              <p className="text-xs text-gray-500">
                Show this code to authorities when requested
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
