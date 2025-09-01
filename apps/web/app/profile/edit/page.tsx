"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  personal: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    dateOfBirth: string;
    passportNumber: string;
    visaNumber: string;
  };
  emergency: {
    contact1: {
      name: string;
      phone: string;
      relationship: string;
      email: string;
    };
    contact2: {
      name: string;
      phone: string;
      relationship: string;
      email: string;
    };
  };
  travel: {
    purposeOfVisit: string;
    estimatedStayDuration: string;
    accommodationAddress: string;
    accommodationType: string;
    checkInDate: string;
    checkOutDate: string;
  };
  medical: {
    bloodType: string;
    allergies: string;
    medications: string;
    medicalConditions: string;
    emergencyMedicalInfo: string;
  };
}

const defaultProfile: ProfileData = {
  personal: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    nationality: "USA",
    dateOfBirth: "1990-01-15",
    passportNumber: "",
    visaNumber: "",
  },
  emergency: {
    contact1: {
      name: "Jane Doe",
      phone: "+1-555-0124",
      relationship: "Spouse",
      email: "jane.doe@example.com",
    },
    contact2: {
      name: "",
      phone: "",
      relationship: "",
      email: "",
    },
  },
  travel: {
    purposeOfVisit: "Tourism",
    estimatedStayDuration: "1-2 weeks",
    accommodationAddress: "",
    accommodationType: "Hotel",
    checkInDate: "",
    checkOutDate: "",
  },
  medical: {
    bloodType: "",
    allergies: "",
    medications: "",
    medicalConditions: "",
    emergencyMedicalInfo: "",
  },
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [activeTab, setActiveTab] = useState<
    "personal" | "emergency" | "travel" | "medical"
  >("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("tourist_auth_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Load profile from localStorage or API
    const savedProfile = localStorage.getItem("tourist_profile_details");
    if (savedProfile) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } catch (error) {
        console.error("Failed to parse saved profile:", error);
      }
    }
  }, [router]);

  const handleChange = (
    section: keyof ProfileData,
    field: string,
    value: string
  ) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parent]: {
            ...(prev[section] as any)[parent],
            [child]: value,
          },
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in real app, save to API)
      localStorage.setItem("tourist_profile_details", JSON.stringify(profile));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSavedMessage("Profile updated successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSavedMessage("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "emergency", label: "Emergency Contacts", icon: "🚨" },
    { id: "travel", label: "Travel Details", icon: "✈️" },
    { id: "medical", label: "Medical Info", icon: "🏥" },
  ] as const;

  const renderPersonalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={profile.personal.name}
            onChange={(e) => handleChange("personal", "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={profile.personal.email}
            onChange={(e) => handleChange("personal", "email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={profile.personal.phone}
            onChange={(e) => handleChange("personal", "phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality *
          </label>
          <select
            value={profile.personal.nationality}
            onChange={(e) =>
              handleChange("personal", "nationality", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Country</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="India">India</option>
            <option value="China">China</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            value={profile.personal.dateOfBirth}
            onChange={(e) =>
              handleChange("personal", "dateOfBirth", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passport Number
          </label>
          <input
            type="text"
            value={profile.personal.passportNumber}
            onChange={(e) =>
              handleChange("personal", "passportNumber", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visa Number
          </label>
          <input
            type="text"
            value={profile.personal.visaNumber}
            onChange={(e) =>
              handleChange("personal", "visaNumber", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>
    </div>
  );

  const renderEmergencyTab = () => (
    <div className="space-y-8">
      {/* Primary Emergency Contact */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800 mb-4">
          Primary Emergency Contact *
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={profile.emergency.contact1.name}
              onChange={(e) =>
                handleChange("emergency", "contact1.name", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={profile.emergency.contact1.phone}
              onChange={(e) =>
                handleChange("emergency", "contact1.phone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <select
              value={profile.emergency.contact1.relationship}
              onChange={(e) =>
                handleChange(
                  "emergency",
                  "contact1.relationship",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Relationship</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Child">Child</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profile.emergency.contact1.email}
              onChange={(e) =>
                handleChange("emergency", "contact1.email", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Secondary Emergency Contact */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Secondary Emergency Contact
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Optional but recommended for additional safety
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={profile.emergency.contact2.name}
              onChange={(e) =>
                handleChange("emergency", "contact2.name", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.emergency.contact2.phone}
              onChange={(e) =>
                handleChange("emergency", "contact2.phone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              value={profile.emergency.contact2.relationship}
              onChange={(e) =>
                handleChange(
                  "emergency",
                  "contact2.relationship",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Relationship</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Child">Child</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profile.emergency.contact2.email}
              onChange={(e) =>
                handleChange("emergency", "contact2.email", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTravelTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Visit *
          </label>
          <select
            value={profile.travel.purposeOfVisit}
            onChange={(e) =>
              handleChange("travel", "purposeOfVisit", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Purpose</option>
            <option value="Tourism">Tourism</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Medical">Medical</option>
            <option value="Family Visit">Family Visit</option>
            <option value="Conference">Conference</option>
            <option value="Transit">Transit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Stay Duration *
          </label>
          <select
            value={profile.travel.estimatedStayDuration}
            onChange={(e) =>
              handleChange("travel", "estimatedStayDuration", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Duration</option>
            <option value="1-3 days">1-3 days</option>
            <option value="4-7 days">4-7 days</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accommodation Type
          </label>
          <select
            value={profile.travel.accommodationType}
            onChange={(e) =>
              handleChange("travel", "accommodationType", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Hotel">Hotel</option>
            <option value="Hostel">Hostel</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Guest House">Guest House</option>
            <option value="Friend/Family">Friend/Family</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={profile.travel.checkInDate}
            onChange={(e) =>
              handleChange("travel", "checkInDate", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={profile.travel.checkOutDate}
            onChange={(e) =>
              handleChange("travel", "checkOutDate", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Accommodation Address
        </label>
        <textarea
          value={profile.travel.accommodationAddress}
          onChange={(e) =>
            handleChange("travel", "accommodationAddress", e.target.value)
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Hotel name, address, or residential address where you'll be staying"
        />
      </div>
    </div>
  );

  const renderMedicalTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              Medical Information Privacy
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              This information is encrypted and only accessible to authorized
              medical personnel in case of emergency.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Type
          </label>
          <select
            value={profile.medical.bloodType}
            onChange={(e) =>
              handleChange("medical", "bloodType", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Allergies
        </label>
        <textarea
          value={profile.medical.allergies}
          onChange={(e) => handleChange("medical", "allergies", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Food allergies, drug allergies, environmental allergies, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Medications
        </label>
        <textarea
          value={profile.medical.medications}
          onChange={(e) =>
            handleChange("medical", "medications", e.target.value)
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="List all medications you are currently taking"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical Conditions
        </label>
        <textarea
          value={profile.medical.medicalConditions}
          onChange={(e) =>
            handleChange("medical", "medicalConditions", e.target.value)
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Chronic conditions, disabilities, or other medical information"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Emergency Medical Instructions
        </label>
        <textarea
          value={profile.medical.emergencyMedicalInfo}
          onChange={(e) =>
            handleChange("medical", "emergencyMedicalInfo", e.target.value)
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Important information for emergency responders (medical history, special instructions, etc.)"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-4"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h1>
            </div>

            <button
              onClick={saveProfile}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Save Status */}
        {savedMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              savedMessage.includes("Failed")
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
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
              <span>{savedMessage}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "personal" && renderPersonalTab()}
            {activeTab === "emergency" && renderEmergencyTab()}
            {activeTab === "travel" && renderTravelTab()}
            {activeTab === "medical" && renderMedicalTab()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                All information is encrypted and only shared with authorized
                personnel during emergencies.
              </p>

              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save All Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
