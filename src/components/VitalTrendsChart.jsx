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

const VitalTrendsChart = ({ vitalRecords = [], vitals = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !vitalRecords.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process vital records data for 24-hour trends
    const processVitalData = () => {
      // Get the last 24 hours in 4-hour intervals
      const hours = [];
      const now = new Date();
      for (let i = 23; i >= 0; i -= 4) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourKey = hour.getHours();
        hours.push(hourKey.toString().padStart(2, "0") + ":00");
      }

      // Group vital records by hour and vital type
      const hourlyData = {};
      hours.forEach((hour) => {
        hourlyData[hour] = {
          heart_rate: [],
          systolic_bp: [],
          temperature: [],
        };
      });

      // Process vital records from the last 24 hours
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      vitalRecords.forEach((record) => {
        const recordDate = new Date(record.recorded_at);

        // Only include records from the last 24 hours
        if (recordDate >= last24Hours) {
          const hourKey =
            recordDate.getHours().toString().padStart(2, "0") + ":00";

          if (hourlyData[hourKey]) {
            const vital = vitals.find((v) => v.code === record.vital_code);
            if (vital) {
              const value = parseFloat(record.value);
              if (!isNaN(value)) {
                switch (vital.name.toLowerCase()) {
                  case "heart rate":
                  case "pulse rate":
                    hourlyData[hourKey].heart_rate.push(value);
                    break;
                  case "systolic blood pressure":
                  case "blood pressure systolic":
                    hourlyData[hourKey].systolic_bp.push(value);
                    break;
                  case "temperature":
                    hourlyData[hourKey].temperature.push(value);
                    break;
                }
              }
            }
          }
        }
      });

      // Calculate averages for each hour
      const datasets = [
        {
          label: "Heart Rate (bpm)",
          data: hours.map((hour) => {
            const values = hourlyData[hour].heart_rate;
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
          label: "Systolic BP (mmHg)",
          data: hours.map((hour) => {
            const values = hourlyData[hour].systolic_bp;
            return values.length > 0
              ? values.reduce((a, b) => a + b) / values.length
              : null;
          }),
          borderColor: "#1e88a8",
          backgroundColor: "rgba(30, 136, 168, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Temperature (°F)",
          data: hours.map((hour) => {
            const values = hourlyData[hour].temperature;
            return values.length > 0
              ? values.reduce((a, b) => a + b) / values.length
              : null;
          }),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ];

      return {
        labels: hours,
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
            max: 140,
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
    <div className="relative h-80 w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default VitalTrendsChart;
