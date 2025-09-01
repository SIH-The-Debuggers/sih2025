"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const emergencyNumbers = [
  {
    country: "India",
    police: "100",
    fire: "101",
    medical: "108",
    tourist: "1363",
  },
  {
    country: "General",
    police: "112",
    fire: "112",
    medical: "112",
    tourist: "112",
  },
];

const emergencyContacts = [
  {
    name: "Tourist Helpline",
    number: "1363",
    description: "24/7 assistance for tourists",
    type: "primary",
  },
  {
    name: "Police Emergency",
    number: "100",
    description: "Immediate police assistance",
    type: "police",
  },
  {
    name: "Medical Emergency",
    number: "108",
    description: "Ambulance and medical help",
    type: "medical",
  },
  {
    name: "Fire Emergency",
    number: "101",
    description: "Fire department emergency",
    type: "fire",
  },
];

export default function EmergencyPage() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    // Auto-get location on emergency page load
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setLocation(newLocation);

      // Reverse geocoding to get address (mock)
      try {
        // In real app, use Google Maps API or similar
        const address = `${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}`;
        setLocation((prev) => (prev ? { ...prev, address } : null));
      } catch (error) {
        console.error("Failed to get address:", error);
      }
    } catch (error) {
      console.error("Failed to get location:", error);
      alert(
        "Location access is required for emergency services. Please enable location in your browser."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      if (!location) {
        await getCurrentLocation();
      }

      const alertData = {
        type: "EMERGENCY_ACCESS",
        severity: "HIGH",
        location: location,
        message:
          "Emergency page accessed - immediate assistance may be required",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      console.log("Emergency alert sent:", alertData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAlertSent(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setAlertSent(false), 5000);
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      alert(
        "Failed to send emergency alert. Please call emergency services directly."
      );
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="h-6 w-6 text-red-600"
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
              </div>
              <div>
                <h1 className="text-2xl font-bold">Emergency Assistance</h1>
                <p className="text-red-100">
                  Immediate help and emergency contacts
                </p>
              </div>
            </div>

            <Link href="/" className="text-red-100 hover:text-white">
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
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Alert Status */}
        {alertSent && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
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
              <span>
                Emergency alert sent to authorities. Help is on the way.
              </span>
            </div>
          </div>
        )}

        {/* Location Status */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Current Location
            </h2>
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {isLoadingLocation ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  <span>Getting location...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh</span>
                </div>
              )}
            </button>
          </div>

          {location ? (
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Coordinates:</span>{" "}
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              {location.address && (
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span>{" "}
                  {location.address}
                </p>
              )}
              <div className="mt-4">
                <button
                  onClick={sendEmergencyAlert}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Send Emergency Alert
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  This will notify authorities of your location and emergency
                  status
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-500 mb-4">Location not available</p>
              <button
                onClick={getCurrentLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Enable Location Access
              </button>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-lg mr-4 ${
                      contact.type === "primary"
                        ? "bg-blue-100"
                        : contact.type === "police"
                          ? "bg-blue-100"
                          : contact.type === "medical"
                            ? "bg-red-100"
                            : contact.type === "fire"
                              ? "bg-orange-100"
                              : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`h-6 w-6 ${
                        contact.type === "primary"
                          ? "text-blue-600"
                          : contact.type === "police"
                            ? "text-blue-600"
                            : contact.type === "medical"
                              ? "text-red-600"
                              : contact.type === "fire"
                                ? "text-orange-600"
                                : "text-gray-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {contact.type === "medical" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      ) : contact.type === "fire" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contact.description}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCall(contact.number)}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  contact.type === "primary"
                    ? "bg-blue-600 focus:ring-blue-500"
                    : contact.type === "police"
                      ? "bg-blue-600 focus:ring-blue-500"
                      : contact.type === "medical"
                        ? "bg-red-600 focus:ring-red-500"
                        : contact.type === "fire"
                          ? "bg-orange-600 focus:ring-orange-500"
                          : "bg-gray-600 focus:ring-gray-500"
                }`}
              >
                Call {contact.number}
              </button>
            </div>
          ))}
        </div>

        {/* Emergency Numbers Reference */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Emergency Numbers Reference
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Police
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tourist
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencyNumbers.map((numbers, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {numbers.country}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                      onClick={() => handleCall(numbers.police)}
                    >
                      {numbers.police}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 hover:text-orange-700 cursor-pointer"
                      onClick={() => handleCall(numbers.fire)}
                    >
                      {numbers.fire}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-red-600 hover:text-red-700 cursor-pointer"
                      onClick={() => handleCall(numbers.medical)}
                    >
                      {numbers.medical}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hover:text-green-700 cursor-pointer"
                      onClick={() => handleCall(numbers.tourist)}
                    >
                      {numbers.tourist}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Emergency Safety Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                In Case of Emergency:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Stay calm and assess the situation</li>
                <li>• Call the appropriate emergency number</li>
                <li>• Provide your exact location</li>
                <li>• Follow instructions from emergency operators</li>
                <li>• Stay on the line until help arrives</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Important Information to Provide:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your exact location or address</li>
                <li>• Nature of the emergency</li>
                <li>• Number of people involved</li>
                <li>• Your name and contact number</li>
                <li>• Any medical conditions or allergies</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-yellow-600 mt-0.5 mr-2"
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
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Remember
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Keep your phone charged and your Digital Tourist ID
                  accessible. Emergency services can use your Digital ID to
                  access your emergency contacts and medical information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Options */}
        <div className="mt-8 text-center">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Return to Dashboard
            </Link>

            <div className="text-sm text-gray-500">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700"
              >
                Sign in to access full features
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
