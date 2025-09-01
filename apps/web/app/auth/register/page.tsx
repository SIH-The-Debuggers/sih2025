"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",

    // Emergency Contacts
    emergencyContact1: {
      name: "",
      phone: "",
      relationship: "",
    },
    emergencyContact2: {
      name: "",
      phone: "",
      relationship: "",
    },

    // Travel Information
    purposeOfVisit: "",
    estimatedStayDuration: "",
    accommodationAddress: "",

    // Preferences
    notifications: true,
    locationSharing: true,
    emergencyAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Mock registration - replace with actual API call
      console.log("Registration data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful registration
      const mockResponse = {
        access_token: "mock-jwt-token",
        user: {
          id: "1",
          email: formData.email,
          role: "TOURIST",
          profile: {
            name: formData.name,
            nationality: formData.nationality,
          },
          digitalId: {
            id: "DTID001",
            qrCode: "mock-qr-code-data",
            isActive: true,
          },
        },
      };

      localStorage.setItem("tourist_auth_token", mockResponse.access_token);
      localStorage.setItem(
        "tourist_profile",
        JSON.stringify(mockResponse.user)
      );

      router.push("/dashboard?welcome=true");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="nationality"
            className="block text-sm font-medium text-gray-700"
          >
            Nationality *
          </label>
          <select
            name="nationality"
            id="nationality"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.nationality}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="dateOfBirth"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth *
        </label>
        <input
          type="date"
          name="dateOfBirth"
          id="dateOfBirth"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password *
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
      <p className="text-sm text-gray-600">
        Please provide at least one emergency contact who can be reached in case
        of emergency.
      </p>

      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">
          Primary Emergency Contact
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="emergencyContact1.name"
              className="block text-sm font-medium text-gray-700"
            >
              Name *
            </label>
            <input
              type="text"
              name="emergencyContact1.name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact1.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContact1.phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone *
            </label>
            <input
              type="tel"
              name="emergencyContact1.phone"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact1.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContact1.relationship"
              className="block text-sm font-medium text-gray-700"
            >
              Relationship *
            </label>
            <select
              name="emergencyContact1.relationship"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact1.relationship}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Secondary Emergency Contact (Optional)
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="emergencyContact2.name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="emergencyContact2.name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact2.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContact2.phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              name="emergencyContact2.phone"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact2.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContact2.relationship"
              className="block text-sm font-medium text-gray-700"
            >
              Relationship
            </label>
            <select
              name="emergencyContact2.relationship"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.emergencyContact2.relationship}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Travel Information</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="purposeOfVisit"
            className="block text-sm font-medium text-gray-700"
          >
            Purpose of Visit *
          </label>
          <select
            name="purposeOfVisit"
            id="purposeOfVisit"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.purposeOfVisit}
            onChange={handleChange}
          >
            <option value="">Select Purpose</option>
            <option value="Tourism">Tourism</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Medical">Medical</option>
            <option value="Family Visit">Family Visit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="estimatedStayDuration"
            className="block text-sm font-medium text-gray-700"
          >
            Estimated Stay Duration *
          </label>
          <select
            name="estimatedStayDuration"
            id="estimatedStayDuration"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.estimatedStayDuration}
            onChange={handleChange}
          >
            <option value="">Select Duration</option>
            <option value="1-7 days">1-7 days</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="accommodationAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Accommodation Address
        </label>
        <textarea
          name="accommodationAddress"
          id="accommodationAddress"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Hotel, hostel, or residential address where you'll be staying"
          value={formData.accommodationAddress}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Privacy & Preferences
      </h3>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notifications"
              name="notifications"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={formData.notifications}
              onChange={handleChange}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="notifications"
              className="font-medium text-gray-700"
            >
              Enable Notifications
            </label>
            <p className="text-gray-500">
              Receive important updates and alerts on your device.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="locationSharing"
              name="locationSharing"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={formData.locationSharing}
              onChange={handleChange}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="locationSharing"
              className="font-medium text-gray-700"
            >
              Enable Location Sharing
            </label>
            <p className="text-gray-500">
              Share your location for safety monitoring and emergency response.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="emergencyAlerts"
              name="emergencyAlerts"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={formData.emergencyAlerts}
              onChange={handleChange}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="emergencyAlerts"
              className="font-medium text-gray-700"
            >
              Receive Emergency Alerts
            </label>
            <p className="text-gray-500">
              Get notified about emergency situations in your area.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Digital ID Creation
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                After registration, your Digital Tourist ID will be generated
                with:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Unique QR code for identification</li>
                <li>Emergency contact information</li>
                <li>Travel and accommodation details</li>
                <li>Secure blockchain verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TS</span>
              </div>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Create Your Digital Tourist ID
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join thousands of travelers using secure digital identification
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Personal</span>
              <span>Emergency</span>
              <span>Travel</span>
              <span>Complete</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Creating ID...
                  </div>
                ) : step < 4 ? (
                  "Next"
                ) : (
                  "Create Digital ID"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
