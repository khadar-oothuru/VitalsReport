import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineHeart,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
  HiOutlineClock,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";
import VitalTrendsChart from "../components/VitalTrendsChart.jsx";
import AlertManagement from "../components/AlertManagement.jsx";

const ProviderVitalMonitoring = () => {
  const [vitalRecords, setVitalRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: "",
    vitalType: "",
    alertLevel: "",
  });

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vitalRecordsData, vitalsData, usersData, providersData] =
          await Promise.all([
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
          ]);

        setVitalRecords(vitalRecordsData.data);
        setVitals(vitalsData.data);
        setUsers(usersData.data);
        setProviders(providersData.data);
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
    if (!vital || !value) return "normal";

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "normal";

    // Use actual normal ranges from VitalTable.csv
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

  // Process vital records with patient and provider information
  const processedVitalRecords = useMemo(() => {
    return vitalRecords.map((record) => {
      const user = users.find((u) => u.user_id === record.user_id);
      const vital = vitals.find((v) => v.code === record.vital_code);
      const provider = providers.find((p) => p.id === record.provider_id);

      // Determine alert level based on vital value
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
        alert_level: alertLevel,
        status: getStatusFromAlertLevel(alertLevel),
      };
    });
  }, [vitalRecords, users, vitals, providers]);

  // Filter vital records based on current filters
  const filteredVitalRecords = useMemo(() => {
    let filtered = processedVitalRecords;

    if (filters.provider) {
      filtered = filtered.filter(
        (record) => record.provider_name === filters.provider
      );
    }

    if (filters.vitalType) {
      filtered = filtered.filter(
        (record) => record.vital_code === filters.vitalType
      );
    }

    if (filters.alertLevel) {
      filtered = filtered.filter(
        (record) => record.alert_level === filters.alertLevel
      );
    }

    return filtered;
  }, [processedVitalRecords, filters]);

  // Get vital statistics
  const vitalStats = useMemo(() => {
    const total = processedVitalRecords.length;
    const critical = processedVitalRecords.filter(
      (r) => r.alert_level === "critical"
    ).length;
    const warning = processedVitalRecords.filter(
      (r) => r.alert_level === "warning"
    ).length;
    const normal = processedVitalRecords.filter(
      (r) => r.alert_level === "normal"
    ).length;

    return { total, critical, warning, normal };
  }, [processedVitalRecords]);

  // Get current vital averages
  const currentVitalAverages = useMemo(() => {
    const averages = {};

    // Get unique vital codes from actual data
    const vitalCodes = [
      ...new Set(processedVitalRecords.map((r) => r.vital_code)),
    ];

    vitalCodes.forEach((code) => {
      const records = processedVitalRecords.filter(
        (r) => r.vital_code === code
      );
      if (records.length > 0) {
        const values = records
          .map((r) => parseFloat(r.value))
          .filter((v) => !isNaN(v));
        if (values.length > 0) {
          averages[code] = values.reduce((a, b) => a + b) / values.length;
        }
      }
    });

    return averages;
  }, [processedVitalRecords]);

  // Get critical alerts (last 10)
  const criticalAlerts = useMemo(() => {
    return processedVitalRecords
      .filter((r) => r.alert_level === "critical")
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, 10);
  }, [processedVitalRecords]);

  // Get recent records (last 10)
  const recentRecords = useMemo(() => {
    return processedVitalRecords
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, 10);
  }, [processedVitalRecords]);

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

  const getAlertColor = (alertLevel) => {
    switch (alertLevel) {
      case "critical":
        return "alert-critical";
      case "warning":
        return "alert-warning";
      default:
        return "alert-normal";
    }
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
                Vital Type
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Level
              </label>
              <select
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Current Vital Averages */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineHeart className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Current Vital Averages</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentVitalAverages)
                .slice(0, 6)
                .map(([code, value]) => {
                  const vital = vitals.find((v) => v.code === code);
                  if (!vital) return null;

                  return (
                    <div
                      key={code}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl font-bold text-teal-600 mb-1">
                        {code === "TEMP" ? value.toFixed(1) : Math.round(value)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {vital.name} ({vital.unit})
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Normal
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

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
              criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg mb-3"
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
                </div>
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

        {/* Vital Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineChartBar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Vital Trends (24h)</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <VitalTrendsChart
                vitalRecords={processedVitalRecords}
                vitals={vitals}
              />
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineDocumentText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Recent Records</h3>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg mb-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {record.patient_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.vital_name}: {record.value} {record.vital_unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(record.recorded_at)}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <HiOutlineDocumentText className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No recent records available</p>
              </div>
            )}
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
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVitalRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.patient_email}
                      </div>
                    </div>
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
                    <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors">
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
    </main>
  );
};

export default ProviderVitalMonitoring;
