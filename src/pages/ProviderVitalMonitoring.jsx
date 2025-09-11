import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  HiOutlineHeart,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";
import VitalTrendsChart from "../components/VitalTrendsChart.jsx";
import AlertManagement from "../components/AlertManagement.jsx";

const ProviderVitalMonitoring = () => {
  const [vitalRecords, setVitalRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: "",
    vitalType: "",
    alertLevel: "",
  });

  // State for trends chart controls
  const [trendVital, setTrendVital] = useState(""); // vital code
  const [trendRange, setTrendRange] = useState("24h"); // '24h' | '7d'
  const [trendPatientId, setTrendPatientId] = useState("all");

  // Modal state
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          vitalRecordsData,
          vitalsData,
          usersData,
          providersData,
          appointmentsData,
        ] = await Promise.all([
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
            "/dataTables/UserTable.csv",
            "dataTables/UserTable.csv",
            "../dataTables/UserTable.csv",
            "UserTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/ProviderTable.csv",
            "dataTables/ProviderTable.csv",
            "../dataTables/ProviderTable.csv",
            "ProviderTable.csv",
          ]),
          loadCSVWithFallback([
            "/dataTables/AppointmentTable.csv",
            "dataTables/AppointmentTable.csv",
            "../dataTables/AppointmentTable.csv",
            "AppointmentTable.csv",
          ]),
        ]);

        setVitalRecords(vitalRecordsData.data);
        setVitals(vitalsData.data);
        setUsers(usersData.data);
        setProviders(providersData.data);
        setAppointments(appointmentsData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const getAlertLevel = (value, vital) => {
    if (!vital || value === undefined || value === null || value === "")
      return "normal";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "normal";
    const minNormal = parseFloat(vital.normal_range_min);
    const maxNormal = parseFloat(vital.normal_range_max);
    if (isNaN(minNormal) || isNaN(maxNormal)) return "normal";
    const span = Math.max(maxNormal - minNormal, 1);
    const warningBuffer = span * 0.1; // 10% outside
    const minWarning = minNormal - warningBuffer;
    const maxWarning = maxNormal + warningBuffer;
    // Critical if outside extended warning band
    if (numValue < minWarning || numValue > maxWarning) return "critical";
    // Warning if outside normal but within extended band
    if (numValue < minNormal || numValue > maxNormal) return "warning";
    return "normal";
  };

  const getStatusFromAlertLevel = (alertLevel) => {
    switch (alertLevel) {
      case "critical":
        return "Critical";
      case "warning":
        return "Warning";
      default:
        return "Normal";
    }
  };

  // Index appointments by user for faster provider inference
  const appointmentsByUser = useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      if (!apt.user_id) return;
      if (!map.has(apt.user_id)) map.set(apt.user_id, []);
      map.get(apt.user_id).push(apt);
    });
    // Sort each list by start_time (epoch seconds) so we can binary search later if needed
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          (parseInt(a.start_time, 10) || 0) - (parseInt(b.start_time, 10) || 0)
      );
    }
    return map;
  }, [appointments]);

  // Infer provider for a vital record (if provider_id not directly present or unmatched)
  const inferProviderForRecord = useCallback(
    (record) => {
      if (record.provider_id) {
        const direct = providers.find((p) => p.id === record.provider_id);
        if (direct) return direct;
      }
      const userApts = appointmentsByUser.get(record.user_id) || [];
      if (!userApts.length) return null;
      const recTime = new Date(record.recorded_at).getTime();
      let closest = null;
      let minDiff = Number.POSITIVE_INFINITY;
      userApts.forEach((apt) => {
        if (!apt.provider_id) return;
        const startMs = (parseInt(apt.start_time, 10) || 0) * 1000; // assume epoch seconds
        const diff = Math.abs(recTime - startMs);
        if (diff < minDiff) {
          minDiff = diff;
          closest = apt;
        }
      });
      if (!closest) return null;
      return providers.find((p) => p.id === closest.provider_id) || null;
    },
    [appointmentsByUser, providers]
  );

  // Process vital records with patient & inferred provider
  const processedVitalRecords = useMemo(() => {
    return vitalRecords.map((record) => {
      const user = users.find((u) => u.user_id === record.user_id);
      const vital = vitals.find((v) => v.code === record.vital_code);
      const provider = inferProviderForRecord(record);
      const alertLevel = getAlertLevel(record.value, vital);
      return {
        ...record,
        patient_name: user
          ? `${user.first_name} ${user.last_name}`
          : "Unknown Patient",
        patient_email: user?.email || "",
        vital_name: vital?.name || record.vital_code,
        vital_unit: vital?.unit || "",
        normal_range: vital?.normal_range || "",
        provider_name: provider
          ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
          : "Unknown Provider",
        provider_id_inferred: provider?.id || record.provider_id || "",
        alert_level: alertLevel,
        status: getStatusFromAlertLevel(alertLevel),
      };
    });
  }, [vitalRecords, users, vitals, inferProviderForRecord]);

  // Filter vital records based on current filters
  const providerMatches = useCallback(
    (record, providerName) => {
      const patientAppointments = appointments.filter(
        (apt) => apt.user_id === record.user_id
      );
      return patientAppointments.some((apt) => {
        const provider = providers.find((p) => p.id === apt.provider_id);
        return (
          provider &&
          `${provider.prefix} ${provider.first_name} ${provider.last_name}` ===
            providerName
        );
      });
    },
    [appointments, providers]
  );

  const filteredVitalRecords = useMemo(() => {
    return processedVitalRecords.filter((record) => {
      if (filters.provider && !providerMatches(record, filters.provider)) {
        return false;
      }
      if (filters.vitalType && record.vital_code !== filters.vitalType) {
        return false;
      }
      if (filters.alertLevel && record.alert_level !== filters.alertLevel) {
        return false;
      }
      return true;
    });
  }, [processedVitalRecords, filters, providerMatches]);

  // Patients eligible for trends based on provider filter
  const trendPatients = useMemo(() => {
    if (!filters.provider) return users;
    const providerObj = providers.find(
      (p) => `${p.prefix} ${p.first_name} ${p.last_name}` === filters.provider
    );
    if (!providerObj) return users;
    const ids = new Set();
    appointments.forEach((apt) => {
      if (apt.provider_id === providerObj.id) ids.add(apt.user_id);
    });
    processedVitalRecords.forEach((r) => {
      if (r.provider_id_inferred === providerObj.id) ids.add(r.user_id);
    });
    return users.filter((u) => ids.has(u.user_id));
  }, [filters.provider, users, appointments, processedVitalRecords, providers]);

  // Reset patient selection if provider changed and current patient not valid
  useEffect(() => {
    if (trendPatientId === "all") return;
    if (!trendPatients.some((u) => u.user_id === trendPatientId)) {
      setTrendPatientId("all");
    }
  }, [trendPatients, trendPatientId]);

  // Get vital statistics (based on filtered data)
  const vitalStats = useMemo(() => {
    const total = filteredVitalRecords.length;
    const critical = filteredVitalRecords.filter(
      (r) => r.alert_level === "critical"
    ).length;
    const warning = filteredVitalRecords.filter(
      (r) => r.alert_level === "warning"
    ).length;
    const normal = filteredVitalRecords.filter(
      (r) => r.alert_level === "normal"
    ).length;

    return { total, critical, warning, normal };
  }, [filteredVitalRecords]);

  // Get critical alerts (last 10) - based on filtered data
  const criticalAlerts = useMemo(() => {
    return filteredVitalRecords
      .filter((r) => r.alert_level === "critical")
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, 10);
  }, [filteredVitalRecords]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Removed unused getAlertColor helper

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const recordDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - recordDate) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
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

  const openPatientModal = (patientId) => {
    setSelectedPatientId(patientId);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatientId(null);
  };

  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatientId) return [];
    return processedVitalRecords
      .filter((r) => r.user_id === selectedPatientId)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }, [selectedPatientId, processedVitalRecords]);

  const selectedPatientInfo = useMemo(() => {
    if (!selectedPatientId) return null;
    const user = users.find((u) => u.user_id === selectedPatientId);
    return user || null;
  }, [selectedPatientId, users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600 font-medium">
            Loading vital monitoring data...
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
            <HiOutlineHeart className="w-6 h-6 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Provider Vital Monitoring
            </h1>
          </div>
          <p className="text-green-100">
            Real-time vital signs monitoring and alert management for healthcare
            providers
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
              <label
                htmlFor="filter-provider"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Provider
              </label>
              <select
                id="filter-provider"
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
              <label
                htmlFor="filter-vital"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vital Type
              </label>
              <select
                id="filter-vital"
                value={filters.vitalType}
                onChange={(e) =>
                  handleFilterChange("vitalType", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Vitals</option>
                {vitals.map((vital) => (
                  <option key={vital.code} value={vital.code}>
                    {vital.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-alert"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alert Level
              </label>
              <select
                id="filter-alert"
                value={filters.alertLevel}
                onChange={(e) =>
                  handleFilterChange("alertLevel", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="normal">Normal</option>
              </select>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {vitalStats.total}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Total Vital Records
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {vitalStats.critical}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Critical Alerts
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {vitalStats.warning}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Warning Alerts
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {vitalStats.normal}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Normal Readings
          </div>
        </div>
      </div>

      {/* Dashboard Grid (Critical Alerts + Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Critical Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineExclamationTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Critical Alerts</h3>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <button
                  key={`${alert.user_id}-${alert.vital_code}-${alert.recorded_at}`}
                  type="button"
                  className="flex w-full text-left items-center p-3 bg-gray-50 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:bg-gray-100 transition"
                  onClick={() => openPatientModal(alert.user_id)}
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {alert.patient_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {alert.vital_name}: {alert.value} {alert.vital_unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(alert.recorded_at)}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    HIGH
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <HiOutlineExclamationTriangle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No critical alerts at this time</p>
              </div>
            )}
          </div>
        </div>

        {/* Vital Trends */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineChartBar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Vital Trends</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="trend-patient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Patient
                </label>
                <select
                  id="trend-patient"
                  value={trendPatientId}
                  onChange={(e) => setTrendPatientId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">
                    {filters.provider
                      ? "All Provider's Patients"
                      : "All Patients"}
                  </option>
                  {trendPatients.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="trend-vital"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Vital
                </label>
                <select
                  id="trend-vital"
                  value={trendVital}
                  onChange={(e) => setTrendVital(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Choose Vital</option>
                  {vitals.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="trend-range"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Range
                </label>
                <select
                  id="trend-range"
                  value={trendRange}
                  onChange={(e) => setTrendRange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  disabled
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed"
                >
                  Custom (Soon)
                </button>
              </div>
            </div>
            <div className="h-80">
              {trendVital ? (
                <VitalTrendsChart
                  vitalRecords={filteredVitalRecords.filter(
                    (r) =>
                      trendPatientId === "all" || r.user_id === trendPatientId
                  )}
                  vitals={vitals}
                  selectedVitalCode={trendVital}
                  range={trendRange}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Select a vital to view trends
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Vital Records Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Detailed Vital Records
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded At
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
              {filteredVitalRecords.map((record) => (
                <tr
                  key={`${record.user_id}-${record.vital_code}-${record.recorded_at}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.patient_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(record.recorded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.provider_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openPatientModal(record.user_id)}
                      className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Management Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Alert Management
            </h3>
          </div>
        </div>
        <div className="p-6">
          <AlertManagement vitalRecords={filteredVitalRecords} />
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-lg font-semibold text-teal-700">
                Patient Details & Vitals
              </h4>
              <button
                onClick={closePatientModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedPatientInfo ? (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <div className="text-sm text-gray-500">Patient Name</div>
                      <div className="font-semibold text-gray-900">
                        {selectedPatientInfo.first_name}{" "}
                        {selectedPatientInfo.last_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">
                        {selectedPatientInfo.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">User ID</div>
                      <div className="font-medium text-gray-900">
                        {selectedPatientInfo.user_id}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div>
                <h5 className="text-md font-semibold text-teal-700 mb-3">
                  Vital Sign Records
                </h5>
                {selectedPatientRecords.length ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Vital
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Value
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Recorded At
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Provider
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedPatientRecords.map((r) => (
                          <tr
                            key={`${r.vital_code}-${r.recorded_at}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-2">{r.vital_name}</td>
                            <td className="px-4 py-2">
                              {r.value} {r.vital_unit}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {formatDateTime(r.recorded_at)}
                            </td>
                            <td className="px-4 py-2">{r.provider_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No vitals found for this patient.
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={closePatientModal}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProviderVitalMonitoring;
