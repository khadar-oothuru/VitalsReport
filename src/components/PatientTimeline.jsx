import React from "react";

const PatientTimeline = ({ vitalRecords = [], vitals = [] }) => {
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVitalName = (vitalCode) => {
    const vital = vitals.find((v) => v.code === vitalCode);
    return vital ? vital.name : vitalCode;
  };

  const getVitalUnit = (vitalCode) => {
    const vital = vitals.find((v) => v.code === vitalCode);
    return vital ? vital.unit : "";
  };

  const getVitalDescription = (vitalCode, value) => {
    const vital = vitals.find((v) => v.code === vitalCode);
    const unit = vital ? vital.unit : "";

    switch (vitalCode.toLowerCase()) {
      case "heart_rate":
      case "pulse_rate":
        return `${value} ${unit} - ${
          value < 60 ? "Low" : value > 100 ? "High" : "Normal"
        } range (60-100 bpm)`;
      case "systolic_bp":
      case "blood_pressure_systolic":
        return `Systolic: ${value} ${unit} - ${
          value < 90 ? "Low" : value > 140 ? "High" : "Normal"
        } range`;
      case "diastolic_bp":
      case "blood_pressure_diastolic":
        return `Diastolic: ${value} ${unit} - ${
          value < 60 ? "Low" : value > 90 ? "High" : "Normal"
        } range`;
      case "temperature":
        return `${value} ${unit} - ${
          value < 97 ? "Low" : value > 99.5 ? "High" : "Normal"
        } range (97.0-99.5°F)`;
      case "oxygen_saturation":
        return `${value} ${unit} - ${
          value < 95 ? "Low" : "Normal"
        } range (95-100%)`;
      default:
        return `${value} ${unit}`;
    }
  };

  if (!vitalRecords.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500">
          No vital records available for this patient.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {vitalRecords.map((record, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-2 w-3 h-3 bg-teal-600 rounded-full border-2 border-white shadow-sm"></div>

            {/* Timeline content */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">
                {formatDateTime(record.recorded_at)}
              </div>
              <div className="font-semibold text-gray-900 mb-2">
                {getVitalName(record.vital_code)} Reading
              </div>
              <div className="text-sm text-gray-600">
                {getVitalDescription(record.vital_code, record.value)}
              </div>
              {record.notes && (
                <div className="text-xs text-gray-500 mt-2 italic">
                  Notes: {record.notes}
                </div>
              )}
              {record.recorded_by && (
                <div className="text-xs text-gray-500 mt-1">
                  Recorded by: {record.recorded_by}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientTimeline;
