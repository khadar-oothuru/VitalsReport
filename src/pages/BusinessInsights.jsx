import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { loadCSVWithFallback } from "../lib/csv";
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiHeart,
  FiUser,
} from "react-icons/fi";

Chart.register(...registerables);

const BusinessInsights = () => {
  const [data, setData] = useState({
    users: [],
    appointments: [],
    providers: [],
    loading: true,
  });

  const chartRefs = {
    userGrowth: useRef(null),
    engagement: useRef(null),
    consultationStatus: useRef(null),
    specialization: useRef(null),
    providerPerformance: useRef(null),
    monthlyTrends: useRef(null),
  };

  const brandColors = {
    primary: "#1e88a8",
    secondary: "#2db88d",
    accent: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  };

  // Load data from CSV files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResult, appointmentsResult, providersResult] =
          await Promise.all([
            loadCSVWithFallback([
              "/dataTables/UserTable.csv",
              "./dataTables/UserTable.csv",
              "../dataTables/UserTable.csv",
            ]),
            loadCSVWithFallback([
              "/dataTables/AppointmentTable.csv",
              "./dataTables/AppointmentTable.csv",
              "../dataTables/AppointmentTable.csv",
            ]),
            loadCSVWithFallback([
              "/dataTables/ProviderTable.csv",
              "./dataTables/ProviderTable.csv",
              "../dataTables/ProviderTable.csv",
            ]),
          ]);

        setData({
          users: usersResult.data || [],
          appointments: appointmentsResult.data || [],
          providers: providersResult.data || [],
          loading: false,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (data.loading || !data.users.length) {
      return {
        totalUsers: 0,
        totalConsultations: 0,
        activeProviders: 0,
        completionRate: 0,
        monthlyActiveUsers: 0,
        newRegistrations: 0,
        completedConsultations: 0,
        cancelledConsultations: 0,
      };
    }

    const totalUsers = data.users.length;
    const totalConsultations = data.appointments.length;
    const activeProviders = data.providers.filter(
      (p) => p.status === "active"
    ).length;

    const completedAppointments = data.appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const completionRate =
      totalConsultations > 0
        ? Math.round((completedAppointments / totalConsultations) * 100)
        : 0;

    // Calculate monthly metrics (last 30 days from current date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = data.users.filter((u) => {
      const createdDate = new Date(u.created_at);
      return createdDate >= thirtyDaysAgo;
    });

    return {
      totalUsers,
      totalConsultations,
      activeProviders,
      completionRate,
      monthlyActiveUsers: recentUsers.length,
      newRegistrations: recentUsers.length,
      completedConsultations: data.appointments.filter(
        (a) => a.status === "completed"
      ).length,
      cancelledConsultations: data.appointments.filter(
        (a) => a.status === "cancelled" || a.status === "no_show"
      ).length,
    };
  };

  const metrics = calculateMetrics();

  useEffect(() => {
    if (data.loading) return;

    const chartInstances = {};

    // Initialize all charts with real data
    const initCharts = () => {
      // Destroy existing charts first to prevent canvas reuse error
      Object.values(chartInstances).forEach((chart) => {
        if (chart) {
          chart.destroy();
        }
      });

      // Calculate monthly data for charts
      const getMonthlyData = () => {
        const months = [];
        const userCounts = [];
        const appointmentCounts = [];
        const completedCounts = [];

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });

          months.push(monthName);

          // Count users created in this month
          const monthUsers = data.users.filter((u) => {
            const userMonth = new Date(u.created_at).toISOString().slice(0, 7);
            return userMonth === monthKey;
          }).length;

          // Count appointments in this month
          const monthAppointments = data.appointments.filter((a) => {
            const apptMonth = new Date(a.created_at).toISOString().slice(0, 7);
            return apptMonth === monthKey;
          }).length;

          // Count completed appointments in this month
          const monthCompleted = data.appointments.filter((a) => {
            const apptMonth = new Date(a.created_at).toISOString().slice(0, 7);
            return apptMonth === monthKey && a.status === "completed";
          }).length;

          userCounts.push(monthUsers);
          appointmentCounts.push(monthAppointments);
          completedCounts.push(monthCompleted);
        }

        return { months, userCounts, appointmentCounts, completedCounts };
      };

      const monthlyData = getMonthlyData();

      // User Growth Chart
      if (chartRefs.userGrowth.current) {
        chartInstances.userGrowth = new Chart(chartRefs.userGrowth.current, {
          type: "line",
          data: {
            labels: monthlyData.months,
            datasets: [
              {
                label: "New User Registrations",
                data: monthlyData.userCounts,
                borderColor: brandColors.primary,
                backgroundColor: brandColors.primary + "20",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: brandColors.primary,
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
              x: { grid: { color: "#f1f5f9" } },
            },
          },
        });
      }

      // Engagement Chart
      if (chartRefs.engagement.current) {
        chartInstances.engagement = new Chart(chartRefs.engagement.current, {
          type: "bar",
          data: {
            labels: monthlyData.months,
            datasets: [
              {
                label: "Total Appointments",
                data: monthlyData.appointmentCounts,
                backgroundColor: brandColors.primary + "80",
                borderColor: brandColors.primary,
                borderWidth: 2,
              },
              {
                label: "New Registrations",
                data: monthlyData.userCounts,
                backgroundColor: brandColors.secondary + "80",
                borderColor: brandColors.secondary,
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" } },
            scales: {
              y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
              x: { grid: { color: "#f1f5f9" } },
            },
          },
        });
      }

      // Consultation Status Chart
      const statusCounts = {
        completed: data.appointments.filter((a) => a.status === "completed")
          .length,
        cancelled: data.appointments.filter((a) => a.status === "cancelled")
          .length,
        no_show: data.appointments.filter((a) => a.status === "no_show").length,
      };

      if (chartRefs.consultationStatus.current) {
        chartInstances.consultationStatus = new Chart(
          chartRefs.consultationStatus.current,
          {
            type: "doughnut",
            data: {
              labels: ["Completed", "Cancelled", "No-Show"],
              datasets: [
                {
                  data: [
                    statusCounts.completed,
                    statusCounts.cancelled,
                    statusCounts.no_show,
                  ],
                  backgroundColor: [
                    brandColors.success,
                    brandColors.warning,
                    brandColors.danger,
                  ],
                  borderColor: "#ffffff",
                  borderWidth: 3,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { padding: 20, usePointStyle: true },
                },
              },
            },
          }
        );
      }

      // Specialization Chart
      const specializationCounts = {};
      data.providers.forEach((provider) => {
        const spec = provider.specialization || "Unknown";
        specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
      });

      const topSpecializations = Object.entries(specializationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

      if (chartRefs.specialization.current && topSpecializations.length > 0) {
        chartInstances.specialization = new Chart(
          chartRefs.specialization.current,
          {
            type: "bar",
            data: {
              labels: topSpecializations.map(([spec]) =>
                spec.replace(/\s+/g, "\n")
              ),
              datasets: [
                {
                  label: "Provider Count",
                  data: topSpecializations.map(([, count]) => count),
                  backgroundColor: [
                    brandColors.primary,
                    brandColors.secondary,
                    brandColors.accent,
                    brandColors.success,
                  ],
                  borderColor: "#ffffff",
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                x: { grid: { color: "#f1f5f9" } },
              },
            },
          }
        );
      }

      // Provider Performance Chart
      const providerStats = {};
      data.appointments.forEach((appointment) => {
        const providerId = appointment.provider_id;
        if (!providerStats[providerId]) {
          providerStats[providerId] = {
            total: 0,
            completed: 0,
            name: "Unknown",
          };
        }
        providerStats[providerId].total++;
        if (appointment.status === "completed") {
          providerStats[providerId].completed++;
        }
      });

      // Add provider names
      data.providers.forEach((provider) => {
        if (providerStats[provider.id]) {
          providerStats[provider.id].name = `Dr. ${provider.last_name}`;
        }
      });

      const topProviders = Object.entries(providerStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5);

      if (chartRefs.providerPerformance.current && topProviders.length > 0) {
        chartInstances.providerPerformance = new Chart(
          chartRefs.providerPerformance.current,
          {
            type: "bar",
            data: {
              labels: topProviders.map(([, stats]) => stats.name),
              datasets: [
                {
                  label: "Completed",
                  data: topProviders.map(([, stats]) => stats.completed),
                  backgroundColor: brandColors.success + "80",
                  borderColor: brandColors.success,
                  borderWidth: 2,
                },
                {
                  label: "Total Booked",
                  data: topProviders.map(([, stats]) => stats.total),
                  backgroundColor: brandColors.primary + "40",
                  borderColor: brandColors.primary,
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: {
                y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                x: { grid: { color: "#f1f5f9" } },
              },
            },
          }
        );
      }

      // Monthly Trends Chart
      if (chartRefs.monthlyTrends.current) {
        chartInstances.monthlyTrends = new Chart(
          chartRefs.monthlyTrends.current,
          {
            type: "line",
            data: {
              labels: monthlyData.months,
              datasets: [
                {
                  label: "Consultations Booked",
                  data: monthlyData.appointmentCounts,
                  borderColor: brandColors.primary,
                  backgroundColor: brandColors.primary + "20",
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: brandColors.primary,
                  pointBorderColor: "#ffffff",
                  pointBorderWidth: 2,
                },
                {
                  label: "Consultations Completed",
                  data: monthlyData.completedCounts,
                  borderColor: brandColors.success,
                  backgroundColor: brandColors.success + "20",
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: brandColors.success,
                  pointBorderColor: "#ffffff",
                  pointBorderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: {
                y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                x: { grid: { color: "#f1f5f9" } },
              },
            },
          }
        );
      }
    };

    initCharts();

    return () => {
      // Cleanup charts on unmount
      Object.values(chartInstances).forEach((chart) => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [data, brandColors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {data.loading ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-xl text-teal-700">Loading data...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-15 h-15 mx-auto mb-5 bg-gradient-to-br from-teal-700 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                <FiUsers className="text-white" />
              </div>
              <div className="text-4xl font-bold text-teal-700 mb-2">
                {metrics.totalUsers}
              </div>
              <div className="text-slate-600 font-medium mb-2">Total Users</div>
              <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                {metrics.newRegistrations} this month
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-15 h-15 mx-auto mb-5 bg-gradient-to-br from-teal-700 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                <FiCalendar className="text-white" />
              </div>
              <div className="text-4xl font-bold text-teal-700 mb-2">
                {metrics.totalConsultations}
              </div>
              <div className="text-slate-600 font-medium mb-2">
                Total Consultations
              </div>
              <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                {metrics.completedConsultations} completed
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-15 h-15 mx-auto mb-5 bg-gradient-to-br from-teal-700 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                <FiHeart className="text-white" />
              </div>
              <div className="text-4xl font-bold text-teal-700 mb-2">
                {metrics.activeProviders}
              </div>
              <div className="text-slate-600 font-medium mb-2">
                Active Providers
              </div>
              <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                {data.providers.length} total providers
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-15 h-15 mx-auto mb-5 bg-gradient-to-br from-teal-700 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                <FiBarChart2 className="text-white" />
              </div>
              <div className="text-4xl font-bold text-teal-700 mb-2">
                {metrics.completionRate}%
              </div>
              <div className="text-slate-600 font-medium mb-2">
                Completion Rate
              </div>
              <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                {metrics.cancelledConsultations} cancelled
              </div>
            </div>
          </div>

          {/* User Growth & Engagement Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <FiTrendingUp className="text-white" /> User Growth & Engagement
                Trends
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Monthly Active Users
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.monthlyActiveUsers}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    New User Registrations
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.newRegistrations}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    User Retention Rate
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.totalUsers > 0
                      ? Math.round(
                          (metrics.monthlyActiveUsers / metrics.totalUsers) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Avg. Appointments per User
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.totalUsers > 0
                      ? (
                          metrics.totalConsultations / metrics.totalUsers
                        ).toFixed(1)
                      : 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    User Growth (Last 6 Months)
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.userGrowth}></canvas>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    Monthly Appointments vs New Registrations
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.engagement}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Analytics Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <FiActivity className="text-white" /> Consultation Analytics
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Completed Consultations
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.completedConsultations}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Cancelled/No-shows
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.cancelledConsultations}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Avg. Consultations per User
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.totalUsers > 0
                      ? (
                          metrics.totalConsultations / metrics.totalUsers
                        ).toFixed(1)
                      : 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Success Rate
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {metrics.completionRate}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    Consultation Status Distribution
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.consultationStatus}></canvas>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    Provider Specializations
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.specialization}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Performance Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <FiUser className="text-white" /> Provider Performance Analytics
              </h2>
            </div>
            <div className="p-8">
              {/* Provider Performance Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Avg. Appointments per Provider
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {(() => {
                      const totalProviders = data.providers.length;
                      return totalProviders > 0
                        ? (metrics.totalConsultations / totalProviders).toFixed(
                            1
                          )
                        : 0;
                    })()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Most Booked Provider
                  </div>
                  <div className="text-xl font-bold text-teal-700">
                    {(() => {
                      const providerStats = {};
                      data.appointments.forEach((appointment) => {
                        const providerId = appointment.provider_id;
                        if (!providerStats[providerId]) {
                          providerStats[providerId] = {
                            count: 0,
                            name: "Unknown",
                          };
                        }
                        providerStats[providerId].count++;
                      });

                      data.providers.forEach((provider) => {
                        if (providerStats[provider.id]) {
                          providerStats[
                            provider.id
                          ].name = `Dr. ${provider.first_name} ${provider.last_name}`;
                        }
                      });

                      const topProvider = Object.entries(providerStats).sort(
                        ([, a], [, b]) => b.count - a.count
                      )[0];

                      return topProvider ? topProvider[1].name : "No data";
                    })()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Top Specialization
                  </div>
                  <div className="text-xl font-bold text-teal-700">
                    {(() => {
                      const specializationCounts = {};
                      data.providers.forEach((provider) => {
                        const spec = provider.specialization || "Unknown";
                        specializationCounts[spec] =
                          (specializationCounts[spec] || 0) + 1;
                      });

                      const topSpecialization = Object.entries(
                        specializationCounts
                      ).sort(([, a], [, b]) => b - a)[0];

                      return topSpecialization
                        ? topSpecialization[0]
                        : "No data";
                    })()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    Provider Utilization
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {(() => {
                      const providersWithAppointments = new Set(
                        data.appointments.map((a) => a.provider_id)
                      ).size;
                      const totalProviders = data.providers.length;

                      return totalProviders > 0
                        ? Math.round(
                            (providersWithAppointments / totalProviders) * 100
                          )
                        : 0;
                    })()}
                    %
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    Appointments by Provider
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.providerPerformance}></canvas>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-lg font-semibold text-teal-700 mb-5 text-center">
                    Monthly Consultation Trends
                  </div>
                  <div className="h-72">
                    <canvas ref={chartRefs.monthlyTrends}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessInsights;
