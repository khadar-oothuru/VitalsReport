import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
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

const averageArray = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

const VitalTrendsChart = ({
  vitalRecords = [],
  vitals = [],
  selectedVitalCode = "",
  range = "24h",
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !vitalRecords.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process vital records data for selected vital and range
    const processVitalData = () => {
      const now = new Date();
      let startDate;
      if (range === "7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const targetVital = vitals.find((v) => v.code === selectedVitalCode);
      if (!targetVital) {
        return { labels: [], datasets: [] };
      }

      // Determine bucket size: hourly for 24h, daily for 7d
      const isDaily = range === "7d";
      const buckets = [];
      const bucketMap = {};

      if (isDaily) {
        for (let i = 6; i >= 0; i--) {
          const day = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - i
          );
          const key = day.toISOString().split("T")[0];
          buckets.push(key);
          bucketMap[key] = [];
        }
      } else {
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
          const key = hour.getHours().toString().padStart(2, "0") + ":00";
          buckets.push(key);
          bucketMap[key] = [];
        }
      }

      vitalRecords.forEach((record) => {
        if (record.vital_code !== selectedVitalCode) return;
        const dt = new Date(record.recorded_at);
        if (dt < startDate || dt > now) return;
        const value = parseFloat(record.value);
        if (isNaN(value)) return;
        const key = isDaily
          ? dt.toISOString().split("T")[0]
          : dt.getHours().toString().padStart(2, "0") + ":00";
        if (bucketMap[key]) bucketMap[key].push(value);
      });

      const dataPoints = buckets.map((b) => {
        const arr = bucketMap[b];
        if (!arr?.length) return null;
        return averageArray(arr);
      });

      const palette = {
        default: { border: "#0d9488", bg: "rgba(13,148,136,0.15)" },
      };

      return {
        labels: buckets,
        datasets: [
          {
            label: `${targetVital.name} (${targetVital.unit})`,
            data: dataPoints,
            borderColor: palette.default.border,
            backgroundColor: palette.default.bg,
            tension: 0.4,
            fill: true,
          },
        ],
      };
    };

    const chartData = processVitalData();
    const targetVital = vitals.find((v) => v.code === selectedVitalCode);
    const numericValues = chartData.datasets.flatMap((ds) =>
      ds.data.filter((v) => v !== null)
    );
    let suggestedMin = 0;
    let suggestedMax = 100;
    if (numericValues.length) {
      const minVal = Math.min(...numericValues);
      const maxVal = Math.max(...numericValues);
      const padding = (maxVal - minVal) * 0.15 || 5;
      suggestedMin = Math.floor(minVal - padding);
      suggestedMax = Math.ceil(maxVal + padding);
    } else if (targetVital) {
      // fallback to normal range if no recent data
      const minN = parseFloat(targetVital.normal_range_min);
      const maxN = parseFloat(targetVital.normal_range_max);
      if (!isNaN(minN) && !isNaN(maxN)) {
        const pad = (maxN - minN) * 0.25;
        suggestedMin = Math.floor(minN - pad);
        suggestedMax = Math.ceil(maxN + pad);
      }
    }

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
            suggestedMin,
            suggestedMax,
            grid: { color: "rgba(0,0,0,0.08)" },
            ticks: { color: "#64748b" },
          },
          x: {
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { color: "#64748b" },
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
  }, [vitalRecords, vitals, selectedVitalCode, range]);

  const noData = !vitalRecords.length || !selectedVitalCode;
  return (
    <div className="relative h-80 w-full">
      {noData ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Select a vital and ensure data is available
        </div>
      ) : (
        <canvas ref={chartRef} />
      )}
    </div>
  );
};

export default VitalTrendsChart;

VitalTrendsChart.propTypes = {
  vitalRecords: PropTypes.arrayOf(PropTypes.object),
  vitals: PropTypes.arrayOf(PropTypes.object),
  selectedVitalCode: PropTypes.string,
  range: PropTypes.oneOf(["24h", "7d"]),
};
