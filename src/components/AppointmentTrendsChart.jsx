import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AppointmentTrendsChart = ({ appointments = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !appointments.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process appointment data for trends
    const processTrendsData = () => {
      const monthlyData = {};
      const statusCounts = {
        total: {},
        completed: {},
        cancelled: {},
      };

      // Initialize months (last 8 months)
      const months = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        months.push(monthKey);
        monthlyData[monthKey] = 0;
        statusCounts.total[monthKey] = 0;
        statusCounts.completed[monthKey] = 0;
        statusCounts.cancelled[monthKey] = 0;
      }

      // Count appointments by month and status
      appointments.forEach((appointment) => {
        const appointmentDate = new Date(
          parseInt(appointment.start_time) * 1000
        );
        const monthKey = appointmentDate.toLocaleDateString("en-US", {
          month: "short",
        });

        if (monthlyData.hasOwnProperty(monthKey)) {
          statusCounts.total[monthKey]++;

          switch (appointment.status) {
            case "completed":
              statusCounts.completed[monthKey]++;
              break;
            case "cancelled":
              statusCounts.cancelled[monthKey]++;
              break;
          }
        }
      });

      return {
        labels: months,
        datasets: [
          {
            label: "Total Appointments",
            data: months.map((month) => statusCounts.total[month]),
            borderColor: "#1e88a8",
            backgroundColor: "rgba(30, 136, 168, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Completed",
            data: months.map((month) => statusCounts.completed[month]),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Cancelled",
            data: months.map((month) => statusCounts.cancelled[month]),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    };

    const chartData = processTrendsData();

    chartInstance.current = new ChartJS(chartRef.current, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              color: "#64748b",
            },
          },
          x: {
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [appointments]);

  return (
    <div className="relative h-80 w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default AppointmentTrendsChart;
