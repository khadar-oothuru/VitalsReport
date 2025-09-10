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

const VitalSignsChart = ({ vitalRecords = [], vitals = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !vitalRecords.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process vital records data
    const processVitalData = () => {
      // Get the last 8 months of data
      const months = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });
        months.push(monthKey);
      }

      // Group vital records by month and vital type
      const monthlyData = {};
      months.forEach((month) => {
        monthlyData[month] = {
          systolic_bp: [],
          diastolic_bp: [],
          heart_rate: [],
          temperature: [],
        };
      });

      // Process vital records
      vitalRecords.forEach((record) => {
        const recordDate = new Date(record.recorded_at);
        const monthKey = recordDate.toLocaleDateString("en-US", {
          month: "short",
        });

        if (monthlyData[monthKey]) {
          const vital = vitals.find((v) => v.code === record.vital_code);
          if (vital) {
            const value = parseFloat(record.value);
            if (!isNaN(value)) {
              switch (vital.name.toLowerCase()) {
                case "systolic blood pressure":
                case "blood pressure systolic":
                  monthlyData[monthKey].systolic_bp.push(value);
                  break;
                case "diastolic blood pressure":
                case "blood pressure diastolic":
                  monthlyData[monthKey].diastolic_bp.push(value);
                  break;
                case "heart rate":
                case "pulse rate":
                  monthlyData[monthKey].heart_rate.push(value);
                  break;
                case "temperature":
                  monthlyData[monthKey].temperature.push(value);
                  break;
              }
            }
          }
        }
      });

      // Calculate averages for each month
      const datasets = [
        {
          label: "Systolic BP",
          data: months.map((month) => {
            const values = monthlyData[month].systolic_bp;
            return values.length > 0
              ? values.reduce((a, b) => a + b) / values.length
              : null;
          }),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Diastolic BP",
          data: months.map((month) => {
            const values = monthlyData[month].diastolic_bp;
            return values.length > 0
              ? values.reduce((a, b) => a + b) / values.length
              : null;
          }),
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Heart Rate",
          data: months.map((month) => {
            const values = monthlyData[month].heart_rate;
            return values.length > 0
              ? values.reduce((a, b) => a + b) / values.length
              : null;
          }),
          borderColor: "#1e88a8",
          backgroundColor: "rgba(30, 136, 168, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ];

      return {
        labels: months,
        datasets: datasets.filter((dataset) =>
          dataset.data.some((value) => value !== null)
        ),
      };
    };

    const chartData = processVitalData();

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
            beginAtZero: false,
            min: 60,
            max: 120,
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
  }, [vitalRecords, vitals]);

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default VitalSignsChart;
