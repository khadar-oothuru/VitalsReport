import React from "react";

const AlertManagement = ({ vitalRecords = [] }) => {
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate alert management data from vital records
  const alertManagementData = vitalRecords
    .filter(
      (record) =>
        record.alert_level === "critical" || record.alert_level === "warning"
    )
    .map((record) => ({
      patient: record.patient_name,
      alertType: `${record.vital_name} Alert`,
      vitalValue: `${record.value} ${record.vital_unit}`,
      priority: record.alert_level === "critical" ? "High" : "Medium",
      status: record.alert_level === "critical" ? "Open" : "In Progress",
      createdAt: record.recorded_at,
      assignedTo: record.provider_name,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  if (alertManagementData.length === 0) {
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500">
          No alerts requiring management at this time
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alert Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vital Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alertManagementData.map((alert, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {alert.patient}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {alert.alertType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {alert.vitalValue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                    alert.priority
                  )}`}
                >
                  {alert.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    alert.status
                  )}`}
                >
                  {alert.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDateTime(alert.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {alert.assignedTo}
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
  );
};

export default AlertManagement;
