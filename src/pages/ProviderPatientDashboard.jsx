import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineExclamationTriangle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";

const ProviderPatientDashboard = () => {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vitalRecords, setVitalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: "",
    status: "",
    searchTerm: "",
  });

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          usersData,
          userDetailsData,
          medicalRecordsData,
          vitalRecordsData,
          appointmentsData,
          providersData,
          vitalsData,
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
          loadCSVWithFallback([
            "/dataTables/VitalTable.csv",
            "dataTables/VitalTable.csv",
            "../dataTables/VitalTable.csv",
            "VitalTable.csv",
          ]),
        ]);

        setUsers(usersData.data);
        setUserDetails(userDetailsData.data);
        setMedicalRecords(medicalRecordsData.data);
        setVitalRecords(vitalRecordsData.data);
        setAppointments(appointmentsData.data);
        setProviders(providersData.data);
        setVitals(vitalsData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const recordDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - recordDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Process patient data
  const processedPatients = useMemo(() => {
    // Helper function to get alert level - defined inside useMemo to access vitals
    const getAlertLevel = (value, vitalCode) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return "normal";

      // Find the vital definition to get normal ranges
      const vital = vitals.find((v) => v.code === vitalCode);
      if (!vital) return "normal";

      const minNormal = parseFloat(vital.normal_range_min);
      const maxNormal = parseFloat(vital.normal_range_max);

      if (isNaN(minNormal) || isNaN(maxNormal)) return "normal";

      // Define warning ranges (10% outside normal range)
      const warningBuffer = (maxNormal - minNormal) * 0.1;
      const minWarning = minNormal - warningBuffer;
      const maxWarning = maxNormal + warningBuffer;

      if (numValue < minNormal || numValue > maxNormal) {
        return "critical";
      } else if (numValue < minWarning || numValue > maxWarning) {
        return "warning";
      }

      return "normal";
    };
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
      let medicalHistory = {};
      let vitalsData = {};

      try {
        demographics = JSON.parse(medicalRecord?.demographics || "{}");
        medicalHistory = JSON.parse(medicalRecord?.medical_history || "{}");
        vitalsData = JSON.parse(medicalRecord?.vitals || "{}");
      } catch (error) {
        // Handle JSON parsing errors gracefully
        console.warn("Error parsing medical record JSON:", error);
      }

      // Calculate age
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Get latest vital records
      const latestVitals = patientVitalRecords
        .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
        .slice(0, 1);

      // Get recent appointments
      const recentAppointments = patientAppointments
        .sort((a, b) => parseInt(b.start_time) - parseInt(a.start_time))
        .slice(0, 1);

      // Determine patient status
      let status = "active";
      if (patientVitalRecords.length > 0) {
        const latestVital = latestVitals[0];
        if (latestVital) {
          const alertLevel = getAlertLevel(
            latestVital.value,
            latestVital.vital_code
          );
          if (alertLevel === "critical") status = "critical";
          else if (alertLevel === "warning") status = "pending";
        }
      }

      // Get primary condition from medical history
      const primaryCondition = medicalHistory?.hypertension
        ? "Hypertension"
        : medicalHistory?.diabetes
        ? "Diabetes"
        : medicalHistory?.heart_disease
        ? "Heart Disease"
        : medicalHistory?.asthma
        ? "Asthma"
        : medicalHistory?.chronic_conditions
        ? medicalHistory.chronic_conditions
        : medicalHistory?.allergies
        ? `Allergies: ${medicalHistory.allergies}`
        : "No chronic conditions";

      return {
        ...user,
        userDetail,
        medicalRecord,
        demographics,
        medicalHistory,
        vitalsData,
        age,
        vitalRecords: patientVitalRecords,
        latestVitals,
        appointments: patientAppointments,
        recentAppointments,
        status,
        primaryCondition,
        lastAppointment:
          recentAppointments.length > 0
            ? formatDate(
                new Date(parseInt(recentAppointments[0].start_time) * 1000)
              )
            : "No recent visits",
        vitalStatus:
          latestVitals.length > 0
            ? latestVitals[0]
              ? getAlertLevel(latestVitals[0].value, latestVitals[0].vital_code)
              : "normal"
            : "normal",
      };
    });
  }, [users, userDetails, medicalRecords, vitalRecords, appointments, vitals]);

  // Filter patients based on current filters
  const filteredPatients = useMemo(() => {
    let filtered = processedPatients;

    if (filters.provider) {
      // Filter by provider who is assigned to the patient through appointments
      filtered = filtered.filter((patient) => {
        const patientAppointments = appointments.filter(
          (apt) => apt.user_id === patient.user_id
        );
        return patientAppointments.some((apt) => {
          const provider = providers.find((p) => p.id === apt.provider_id);
          return (
            provider &&
            `${provider.prefix} ${provider.first_name} ${provider.last_name}` ===
              filters.provider
          );
        });
      });
    }

    if (filters.status) {
      filtered = filtered.filter(
        (patient) => patient.status === filters.status
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          `${patient.first_name} ${patient.last_name}`
            .toLowerCase()
            .includes(term) ||
          patient.user_id.toLowerCase().includes(term) ||
          patient.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [processedPatients, filters, appointments, providers]);

  // Get patient statistics (based on filtered patients)
  const patientStats = useMemo(() => {
    const total = filteredPatients.length;
    const active = filteredPatients.filter((p) => p.status === "active").length;

    // Calculate new patients this month based on first appointment date
    const newThisMonth = filteredPatients.filter((p) => {
      if (p.appointments.length === 0) return false;

      // Find the earliest appointment for this patient
      const earliestAppointment = p.appointments.sort(
        (a, b) => parseInt(a.start_time) - parseInt(b.start_time)
      )[0];

      if (!earliestAppointment) return false;

      const appointmentDate = new Date(
        parseInt(earliestAppointment.start_time) * 1000
      );
      const thisMonth = new Date();
      thisMonth.setDate(1);

      return appointmentDate >= thisMonth;
    }).length;

    const critical = filteredPatients.filter(
      (p) => p.status === "critical"
    ).length;

    return { total, active, newThisMonth, critical };
  }, [filteredPatients]);

  // Get today's appointments (filtered by selected provider)
  const todaysAppointments = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    let filteredAppointments = appointments.filter((apt) => {
      const aptDate = new Date(parseInt(apt.start_time) * 1000);
      return aptDate >= todayStart && aptDate < todayEnd;
    });

    // Filter by selected provider if one is selected
    if (filters.provider) {
      filteredAppointments = filteredAppointments.filter((apt) => {
        const provider = providers.find((p) => p.id === apt.provider_id);
        return (
          provider &&
          `${provider.prefix} ${provider.first_name} ${provider.last_name}` ===
            filters.provider
        );
      });
    }

    return filteredAppointments
      .sort((a, b) => parseInt(a.start_time) - parseInt(b.start_time))
      .slice(0, 10)
      .map((apt) => {
        const user = users.find((u) => u.user_id === apt.user_id);
        const provider = providers.find((p) => p.id === apt.provider_id);
        return {
          ...apt,
          patient_name: user
            ? `${user.first_name} ${user.last_name}`
            : "Unknown Patient",
          provider_name: provider
            ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
            : "Unknown Provider",
          time: formatTime(new Date(parseInt(apt.start_time) * 1000)),
        };
      });
  }, [appointments, users, providers, filters.provider]);

  // Get vital alerts (based on filtered patients)
  const vitalAlerts = useMemo(() => {
    return filteredPatients
      .filter((p) => p.status === "critical" || p.status === "pending")
      .slice(0, 10)
      .map((patient) => {
        const latestVital = patient.latestVitals[0];
        const vital = vitals.find((v) => v.code === latestVital?.vital_code);
        return {
          patient_name: `${patient.first_name} ${patient.last_name}`,
          vital: latestVital
            ? vital?.name || latestVital.vital_code
            : "No recent vitals",
          value: latestVital
            ? `${latestVital.value} ${vital?.unit || ""}`
            : "N/A",
          status:
            patient.status === "critical"
              ? "Critical"
              : patient.status === "pending"
              ? "Warning"
              : "Normal",
          time: latestVital
            ? formatTimeAgo(latestVital.recorded_at)
            : "No recent readings",
        };
      });
  }, [filteredPatients, vitals]);

  // Get recent messages based on appointment notes (based on filtered patients)
  const recentMessages = useMemo(() => {
    return filteredPatients
      .filter((p) => p.recentAppointments.length > 0)
      .slice(0, 10)
      .map((patient) => {
        const recentAppointment = patient.recentAppointments[0];
        const provider = providers.find(
          (p) => p.id === recentAppointment?.provider_id
        );

        return {
          patient_name: `${patient.first_name} ${patient.last_name}`,
          message:
            recentAppointment?.provider_notes ||
            `Follow-up from ${formatDate(
              new Date(parseInt(recentAppointment.start_time) * 1000)
            )} appointment with Dr. ${provider?.last_name || "Provider"}`,
          time: formatTimeAgo(
            new Date(parseInt(recentAppointment.start_time) * 1000)
          ),
          unread: false, // Messages are considered read by default
        };
      });
  }, [filteredPatients, providers]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    // Filters are applied automatically through useMemo
    console.log("Filters applied:", filters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600 font-medium">
            Loading patient dashboard data...
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
            <HiOutlineUserGroup className="w-6 h-6 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Provider Patient Dashboard
            </h1>
          </div>
          <p className="text-green-100">
            Comprehensive patient data overview for healthcare providers
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineAdjustmentsHorizontal className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Filter & Search
            </h3>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={filters.provider}
                onChange={(e) => handleFilterChange("provider", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Providers</option>
                {providers.map((provider) => (
                  <option
                    key={provider.id}
                    value={`${provider.prefix} ${provider.first_name} ${provider.last_name}`}
                  >
                    {provider.prefix} {provider.first_name} {provider.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient
              </label>
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-800 hover:to-emerald-700 transition-all duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Patient Overview Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineUserGroup className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Patient Overview</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 mb-1">
                  {patientStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {patientStats.active}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {patientStats.newThisMonth}
                </div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {patientStats.critical}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Today's Appointments</h3>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg mb-3"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3 text-teal-600 font-bold">
                    {appointment.patient_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {appointment.patient_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.time} -{" "}
                      {appointment.appointment_type?.replace("_", " ")}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <HiOutlineCalendar className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">
                  No appointments scheduled for today
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vital Alerts Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineExclamationTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Vital Alerts</h3>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {vitalAlerts.length > 0 ? (
              vitalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg mb-3"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600 font-bold">
                    {alert.patient_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {alert.patient_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {alert.vital}: {alert.value}
                    </div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      alert.status.toLowerCase()
                    )}`}
                  >
                    {alert.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <HiOutlineExclamationTriangle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No vital alerts at this time</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Recent Messages</h3>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {recentMessages.length > 0 ? (
              recentMessages.map((message, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg mb-3"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-purple-600 font-bold">
                    {message.patient_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {message.patient_name}
                    </div>
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {message.message}
                    </div>
                    <div className="text-xs text-gray-500">{message.time}</div>
                  </div>
                  {message.unread && (
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Unread
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <HiOutlineChatBubbleLeftRight className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No recent messages</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Medical Records Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Patient Medical Records
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vital Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.demographics?.gender ||
                      patient.userDetail?.gender ||
                      "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.primaryCondition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.lastAppointment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        patient.vitalStatus.toLowerCase()
                      )}`}
                    >
                      {patient.vitalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.recentAppointments.length > 0
                      ? (() => {
                          const provider = providers.find(
                            (p) =>
                              p.id === patient.recentAppointments[0].provider_id
                          );
                          return provider
                            ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
                            : "Provider not found";
                        })()
                      : "No appointments scheduled"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Vital Records Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineChartBar className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Recent Vital Records
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vital Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients
                .flatMap((p) =>
                  p.latestVitals.map((v) => {
                    const vital = vitals.find(
                      (vital) => vital.code === v.vital_code
                    );
                    return {
                      ...v,
                      patient_name: `${p.first_name} ${p.last_name}`,
                      vital_name: vital?.name || v.vital_code,
                      vital_unit: vital?.unit || "",
                      normal_range: vital
                        ? `${vital.normal_range_min}-${vital.normal_range_max} ${vital.unit}`
                        : "N/A",
                      alert_level: p.vitalStatus,
                    };
                  })
                )
                .sort(
                  (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
                )
                .slice(0, 20)
                .map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.vital_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.value} {record.vital_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.normal_range}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          record.alert_level
                        )}`}
                      >
                        {record.alert_level === "critical"
                          ? "Critical"
                          : record.alert_level === "warning"
                          ? "Warning"
                          : "Normal"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.recorded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.location || "Clinic"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Upcoming Appointments
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
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
              {appointments
                .filter((apt) => {
                  const isFuture =
                    new Date(parseInt(apt.start_time) * 1000) > new Date();

                  // Filter by selected provider if one is selected
                  if (filters.provider) {
                    const provider = providers.find(
                      (p) => p.id === apt.provider_id
                    );
                    const matchesProvider =
                      provider &&
                      `${provider.prefix} ${provider.first_name} ${provider.last_name}` ===
                        filters.provider;
                    return isFuture && matchesProvider;
                  }

                  return isFuture;
                })
                .sort((a, b) => parseInt(a.start_time) - parseInt(b.start_time))
                .slice(0, 20)
                .map((appointment, index) => {
                  const user = users.find(
                    (u) => u.user_id === appointment.user_id
                  );
                  const provider = providers.find(
                    (p) => p.id === appointment.provider_id
                  );
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user
                          ? `${user.first_name} ${user.last_name}`
                          : "Unknown Patient"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {provider
                          ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
                          : "Unknown Provider"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(
                          new Date(parseInt(appointment.start_time) * 1000)
                        )}{" "}
                        {formatTime(
                          new Date(parseInt(appointment.start_time) * 1000)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.appointment_type?.replace("_", " ") ||
                          "General consultation"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status?.replace("_", " ") || "Scheduled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {appointment.notes || "No additional notes"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ProviderPatientDashboard;
