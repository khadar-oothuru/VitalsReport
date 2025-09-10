import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";
import AppointmentTrendsChart from "../components/AppointmentTrendsChart.jsx";
import WeeklyCalendar from "../components/WeeklyCalendar.jsx";

const ProviderAppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider: "",
    type: "",
    status: "",
    dateRange: "",
  });

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [appointmentsData, providersData, usersData] = await Promise.all([
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
            "/dataTables/UserTable.csv",
            "dataTables/UserTable.csv",
            "../dataTables/UserTable.csv",
            "UserTable.csv",
          ]),
        ]);

        setAppointments(appointmentsData.data);
        setProviders(providersData.data);
        setUsers(usersData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process appointment data
  const processedAppointments = useMemo(() => {
    return appointments.map((appointment) => {
      const provider = providers.find((p) => p.id === appointment.provider_id);
      const user = users.find((u) => u.user_id === appointment.user_id);

      // Parse time slot JSON
      let timeSlot = {};
      try {
        timeSlot = JSON.parse(appointment.time_slot || "{}");
      } catch (e) {
        timeSlot = {
          start: appointment.start_time,
          end: appointment.start_time + 3600,
        };
      }

      // Parse events JSON
      let events = [];
      try {
        events = JSON.parse(appointment.events || "[]");
      } catch (e) {
        events = [];
      }

      return {
        ...appointment,
        provider_name: provider
          ? `${provider.prefix} ${provider.first_name} ${provider.last_name}`
          : "Unknown Provider",
        provider_specialization: provider?.specialization || "Unknown",
        patient_name: user
          ? `${user.first_name} ${user.last_name}`
          : "Unknown Patient",
        patient_email: user?.email || "",
        patient_phone: user?.phone || "",
        start_datetime: new Date(parseInt(appointment.start_time) * 1000),
        end_datetime: new Date(parseInt(timeSlot.end) * 1000),
        duration_minutes: appointment.duration_minutes || 30,
        events,
      };
    });
  }, [appointments, providers, users]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let filtered = processedAppointments;

    if (filters.provider) {
      filtered = filtered.filter((apt) => apt.provider_id === filters.provider);
    }

    if (filters.type) {
      filtered = filtered.filter(
        (apt) => apt.appointment_type === filters.type
      );
    }

    if (filters.status) {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case "today":
          filtered = filtered.filter((apt) => {
            const aptDate = new Date(apt.start_datetime);
            return (
              aptDate >= today &&
              aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          });
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          filtered = filtered.filter((apt) => {
            const aptDate = new Date(apt.start_datetime);
            return aptDate >= weekStart && aptDate < weekEnd;
          });
          break;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
          );
          filtered = filtered.filter((apt) => {
            const aptDate = new Date(apt.start_datetime);
            return aptDate >= monthStart && aptDate < monthEnd;
          });
          break;
      }
    }

    return filtered;
  }, [processedAppointments, filters]);

  // Get today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return filteredAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.start_datetime);
        return aptDate >= today && aptDate < tomorrow;
      })
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);
  }, [filteredAppointments]);

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return filteredAppointments
      .filter((apt) => new Date(apt.start_datetime) >= tomorrow)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);
  }, [filteredAppointments]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const today = filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.start_datetime);
      const todayDate = new Date();
      return aptDate.toDateString() === todayDate.toDateString();
    }).length;
    const completed = filteredAppointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const cancelled = filteredAppointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const pending = filteredAppointments.filter(
      (apt) => apt.status === "pending"
    ).length;

    return { total, today, completed, cancelled, pending };
  }, [filteredAppointments]);

  // Get provider analytics
  const providerAnalytics = useMemo(() => {
    const analytics = {};

    filteredAppointments.forEach((apt) => {
      const providerId = apt.provider_id;
      if (!analytics[providerId]) {
        analytics[providerId] = {
          provider_name: apt.provider_name,
          total: 0,
          completed: 0,
          cancelled: 0,
          noShows: 0,
          totalDuration: 0,
        };
      }

      analytics[providerId].total++;
      analytics[providerId].totalDuration +=
        parseInt(apt.duration_minutes) || 30;

      switch (apt.status) {
        case "completed":
          analytics[providerId].completed++;
          break;
        case "cancelled":
          analytics[providerId].cancelled++;
          break;
        case "no_show":
          analytics[providerId].noShows++;
          break;
      }
    });

    return Object.values(analytics).map((analytics) => ({
      ...analytics,
      avgDuration: Math.round(analytics.totalDuration / analytics.total),
      satisfaction: "4.8/5", // Placeholder - would come from feedback data
    }));
  }, [filteredAppointments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "no_show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600 font-medium">
            Loading appointment data...
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
            <HiOutlineCalendar className="w-6 h-6 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Provider Appointment Management
            </h1>
          </div>
          <p className="text-green-100">
            Comprehensive appointment scheduling and management for healthcare
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <option key={provider.id} value={provider.id}>
                    {provider.prefix} {provider.first_name} {provider.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="annual_physical">Annual Physical</option>
                <option value="urgent_care">Urgent Care</option>
                <option value="specialist_consultation">
                  Specialist Consultation
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    provider: "",
                    type: "",
                    status: "",
                    dateRange: "",
                  })
                }
                className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-800 hover:to-emerald-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Total Appointments
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.today}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Today's Appointments
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600 font-medium">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 font-medium">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.cancelled}
          </div>
          <div className="text-sm text-gray-600 font-medium">Cancelled</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineClock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Today's Schedule</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="text-center mr-4">
                      <div className="text-lg font-bold text-teal-600">
                        {formatTime(appointment.start_datetime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(appointment.start_datetime)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {appointment.patient_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.appointment_type} •{" "}
                        {appointment.duration_minutes} min
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.provider_name}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace("_", " ")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <HiOutlineCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="text-center mr-4">
                      <div className="text-lg font-bold text-teal-600">
                        {formatTime(appointment.start_datetime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(appointment.start_datetime)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {appointment.patient_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.appointment_type} •{" "}
                        {appointment.duration_minutes} min
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.provider_name}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace("_", " ")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <HiOutlineCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointment Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineChartBar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Appointment Trends</h3>
            </div>
          </div>
          <div className="p-6">
            <AppointmentTrendsChart appointments={filteredAppointments} />
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">This Week</h3>
            </div>
          </div>
          <div className="p-6">
            <WeeklyCalendar appointments={filteredAppointments} />
          </div>
        </div>
      </div>

      {/* All Appointments Table */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              All Appointments
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
                  Duration
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
              {filteredAppointments.slice(0, 50).map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.patient_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.provider_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.provider_specialization}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(appointment.start_datetime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.appointment_type?.replace("_", " ") || "N/A"}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {appointment.notes || "No notes"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-md transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Analytics */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <HiOutlineChartBar className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-semibold text-teal-700">
              Appointment Analytics
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Appointments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cancelled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No Shows
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providerAnalytics.map((analytics, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {analytics.provider_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.cancelled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.noShows}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.avgDuration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analytics.satisfaction}
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
    </main>
  );
};

export default ProviderAppointmentManagement;
