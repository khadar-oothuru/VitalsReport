import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChartBar,
  HiOutlineClock,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";
import VitalSignsChart from "../components/VitalSignsChart.jsx";
import PatientTimeline from "../components/PatientTimeline.jsx";

const ProviderPatientProfile = () => {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vitalRecords, setVitalRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          usersData,
          userDetailsData,
          medicalRecordsData,
          vitalRecordsData,
          vitalsData,
          appointmentsData,
          providersData,
        ] = await Promise.all([
          loadCSVWithFallback([
            "/dataTables/UserTable.csv",
            "dataTables/UserTable.csv",
            "../dataTables/UserTable.csv",
            "UserTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/UserDetailsTable.csv",
            "dataTables/UserDetailsTable.csv",
            "../dataTables/UserDetailsTable.csv",
            "UserDetailsTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/MedicalRecordTable.csv",
            "dataTables/MedicalRecordTable.csv",
            "../dataTables/MedicalRecordTable.csv",
            "MedicalRecordTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/VitalRecordTable.csv",
            "dataTables/VitalRecordTable.csv",
            "../dataTables/VitalRecordTable.csv",
            "VitalRecordTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/VitalTable.csv",
            "dataTables/VitalTable.csv",
            "../dataTables/VitalTable.csv",
            "VitalTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/AppointmentTable.csv",
            "dataTables/AppointmentTable.csv",
            "../dataTables/AppointmentTable.csv",
            "AppointmentTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/ProviderTable.csv",
            "dataTables/ProviderTable.csv",
            "../dataTables/ProviderTable.csv",
            "ProviderTable.csv",
          ]),
        ]);

        setUsers(usersData.data);
        setUserDetails(userDetailsData.data);
        setMedicalRecords(medicalRecordsData.data);
        setVitalRecords(vitalRecordsData.data);
        setVitals(vitalsData.data);
        setAppointments(appointmentsData.data);
        setProviders(providersData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process patient data
  const processedPatients = useMemo(() => {
    return users.map((user) => {
      const userDetail = userDetails.find((ud) => ud.user_id === user.user_id);
      const medicalRecord = medicalRecords.find(
        (mr) => mr.user_id === user.user_id
      );
      const patientVitalRecords = vitalRecords.filter(
        (vr) => vr.user_id === user.user_id
      );
      const patientAppointments = appointments.filter(
        (apt) => apt.user_id === user.user_id
      );

      // Parse medical record JSON fields
      let demographics = {};
      let anthropometry = {};
      let vitalsData = {};
      let sleepMetrics = {};
      let lifestyle = {};
      let medicalHistory = {};
      let mentalHealth = {};
      let holisticFactors = {};
      let carePlanning = {};

      try {
        demographics = JSON.parse(medicalRecord?.demographics || "{}");
        anthropometry = JSON.parse(medicalRecord?.anthropometry || "{}");
        vitalsData = JSON.parse(medicalRecord?.vitals || "{}");
        sleepMetrics = JSON.parse(medicalRecord?.sleep_metrics || "{}");
        lifestyle = JSON.parse(medicalRecord?.lifestyle || "{}");
        medicalHistory = JSON.parse(medicalRecord?.medical_history || "{}");
        mentalHealth = JSON.parse(medicalRecord?.mental_health || "{}");
        holisticFactors = JSON.parse(medicalRecord?.holistic_factors || "{}");
        carePlanning = JSON.parse(medicalRecord?.care_planning || "{}");
      } catch (e) {
        // Handle JSON parsing errors gracefully
      }

      // Calculate age
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Get latest vital records
      const latestVitals = patientVitalRecords
        .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
        .slice(0, 5);

      // Get recent appointments
      const recentAppointments = patientAppointments
        .sort((a, b) => parseInt(b.start_time) - parseInt(a.start_time))
        .slice(0, 5);

      return {
        ...user,
        userDetail,
        medicalRecord,
        demographics,
        anthropometry,
        vitalsData,
        sleepMetrics,
        lifestyle,
        medicalHistory,
        mentalHealth,
        holisticFactors,
        carePlanning,
        age,
        vitalRecords: patientVitalRecords,
        latestVitals,
        appointments: patientAppointments,
        recentAppointments,
      };
    });
  }, [users, userDetails, medicalRecords, vitalRecords, appointments]);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return processedPatients;
    const term = searchTerm.toLowerCase();
    return processedPatients.filter(
      (patient) =>
        `${patient.first_name} ${patient.last_name}`
          .toLowerCase()
          .includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        patient.user_id.toLowerCase().includes(term)
    );
  }, [processedPatients, searchTerm]);

  // Get patient statistics
  const patientStats = useMemo(() => {
    const total = processedPatients.length;
    const active = processedPatients.filter(
      (p) => p.recentAppointments.length > 0
    ).length;
    const withVitals = processedPatients.filter(
      (p) => p.vitalRecords.length > 0
    ).length;
    const withMedicalRecords = processedPatients.filter(
      (p) => p.medicalRecord
    ).length;

    return { total, active, withVitals, withMedicalRecords };
  }, [processedPatients]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getAlertColor = (value, type) => {
    // Simple alert logic based on common vital ranges
    if (type === "heart_rate") {
      if (value < 60 || value > 100) return "alert-high";
      if (value < 70 || value > 90) return "alert-medium";
      return "alert-normal";
    }
    if (type === "blood_pressure_systolic") {
      if (value < 90 || value > 140) return "alert-high";
      if (value < 100 || value > 130) return "alert-medium";
      return "alert-normal";
    }
    if (type === "temperature") {
      if (value < 97 || value > 99.5) return "alert-high";
      return "alert-normal";
    }
    return "alert-normal";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600 font-medium">
            Loading patient data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="py-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineUser className="w-6 h-6 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Provider Patient Profile
            </h1>
          </div>
          <p className="text-green-100">
            Comprehensive patient profiles and medical records management
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineAdjustmentsHorizontal className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Patient Search & Selection
            </h3>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
              </label>
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or patient ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                value={selectedPatient?.user_id || ""}
                onChange={(e) => {
                  const patient = processedPatients.find(
                    (p) => p.user_id === e.target.value
                  );
                  setSelectedPatient(patient || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Choose a patient...</option>
                {filteredPatients.map((patient) => (
                  <option key={patient.user_id} value={patient.user_id}>
                    {patient.first_name} {patient.last_name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {patientStats.total}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Total Patients
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {patientStats.active}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Active Patients
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {patientStats.withVitals}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            With Vital Records
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {patientStats.withMedicalRecords}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            With Medical Records
          </div>
        </div>
      </div>

      {selectedPatient ? (
        <>
          {/* Patient Header */}
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold mr-6">
                    {selectedPatient.first_name.charAt(0)}
                    {selectedPatient.last_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h2>
                    <div className="text-green-100 text-lg">
                      {selectedPatient.age} years old •{" "}
                      {selectedPatient.demographics?.gender || "Unknown"} • ID:{" "}
                      {selectedPatient.user_id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      "active"
                    )}`}
                  >
                    Active
                  </div>
                  <div className="text-green-100 text-sm mt-2">
                    Last Visit:{" "}
                    {selectedPatient.recentAppointments.length > 0
                      ? formatDate(
                          new Date(
                            parseInt(
                              selectedPatient.recentAppointments[0].start_time
                            ) * 1000
                          )
                        )
                      : "No recent visits"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Demographics Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <HiOutlineUser className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Demographics</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Date of Birth
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatDate(selectedPatient.date_of_birth)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Age
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.age} years
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Gender
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.demographics?.gender || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Phone
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Address
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Vital Signs Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <HiOutlineHeart className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Current Vital Signs</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Heart Rate
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.vitalsData?.heart_rate || "N/A"} bpm
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${getAlertColor(
                          selectedPatient.vitalsData?.heart_rate,
                          "heart_rate"
                        )}`}
                      >
                        Normal
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Blood Pressure
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.vitalsData?.blood_pressure_systolic ||
                        "N/A"}
                      /
                      {selectedPatient.vitalsData?.blood_pressure_diastolic ||
                        "N/A"}{" "}
                      mmHg
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${getAlertColor(
                          selectedPatient.vitalsData?.blood_pressure_systolic,
                          "blood_pressure_systolic"
                        )}`}
                      >
                        Normal
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Temperature
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.vitalsData?.temperature || "N/A"}°F
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${getAlertColor(
                          selectedPatient.vitalsData?.temperature,
                          "temperature"
                        )}`}
                      >
                        Normal
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      BMI
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.anthropometry?.bmi || "N/A"} kg/m²
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Normal
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <VitalSignsChart
                    vitalRecords={selectedPatient.vitalRecords}
                    vitals={vitals}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical History and Lifestyle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Medical History Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <HiOutlineHome className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Medical History</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Hypertension
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.hypertension
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Diabetes
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.diabetes ? "Yes" : "No"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Family History
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.family_history || "None"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Allergies
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.allergies || "None"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Chronic Conditions
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.chronic_conditions ||
                        "None"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Current Medications
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.medicalHistory?.current_medications ||
                        "None"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifestyle Factors Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <HiOutlineChartBar className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Lifestyle Factors</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Smoking Status
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.lifestyle?.smoking_status || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Alcohol Consumption
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.lifestyle?.alcohol_consumption ||
                        "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Physical Activity
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.lifestyle?.physical_activity_level ||
                        "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Diet Type
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.lifestyle?.diet_type || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Sleep Duration
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.sleepMetrics?.sleep_duration ||
                        "Unknown"}{" "}
                      hours
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Sleep Quality
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedPatient.sleepMetrics?.sleep_quality_index ||
                        "Unknown"}
                      /10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mental Health & Wellness Card */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <HiOutlineDocumentText className="w-5 h-5" />
                <h3 className="text-lg font-semibold">
                  Mental Health & Wellness
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Depression Score
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.mentalHealth?.depression_score || "N/A"}
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Moderate
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Anxiety Score
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.mentalHealth?.anxiety_score || "N/A"}
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Low
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Stress Level
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.mentalHealth?.stress_levels || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Energy Level
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.mentalHealth?.energy_levels || "Unknown"}
                    /10
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Overall Wellness
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.holisticFactors?.overall_wellness_index ||
                      "Unknown"}
                    /100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Spiritual Wellness
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPatient.holisticFactors?.spiritual_wellness ||
                      "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Recent Appointments
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPatient.recentAppointments.map(
                    (appointment, index) => {
                      const provider = providers.find(
                        (p) => p.id === appointment.provider_id
                      );
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(
                              new Date(parseInt(appointment.start_time) * 1000)
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {provider
                              ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
                              : "Unknown Provider"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.appointment_type?.replace("_", " ") ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status?.replace("_", " ") || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {appointment.notes || "No notes"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vital Records Timeline */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Vital Records Timeline
                </h3>
              </div>
            </div>
            <div className="p-6">
              <PatientTimeline
                vitalRecords={selectedPatient.latestVitals}
                vitals={vitals}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-800 hover:to-emerald-700 transition-all duration-200">
              Schedule Appointment
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Send Message
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Update Medical Record
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Print Report
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <HiOutlineUser className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Patient Selected
          </h3>
          <p className="text-gray-500">
            Please select a patient from the dropdown above to view their
            profile.
          </p>
        </div>
      )}
    </main>
  );
};

export default ProviderPatientProfile;
