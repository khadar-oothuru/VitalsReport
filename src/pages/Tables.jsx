import React, { useMemo, useState } from "react";
import {
  HiOutlineTableCells,
  HiOutlineCircleStack,
  HiOutlineUserGroup,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import ReportNav from "../components/ReportNav.jsx";
import TableViewer from "../components/TableViewer.jsx";

const Tables = () => {
  const datasets = useMemo(
    () => [
      {
        id: "UserTable",
        title: "UserTable",
        subtitle: "User basic information & profiles",
        category: "core",
        icon: <HiOutlineUserGroup className="w-4 h-4" />,
        paths: [
          "/dataTables/UserTable.csv",
          "dataTables/UserTable.csv",
          "../dataTables/UserTable.csv",
          "UserTable.csv",
        ],
      },
      {
        id: "UserDetailsTable",
        title: "UserDetailsTable",
        subtitle: "User lifestyle & metadata",
        category: "core",
        icon: <HiOutlineUserGroup className="w-4 h-4" />,
        paths: [
          "/dataTables/UserDetailsTable.csv",
          "dataTables/UserDetailsTable.csv",
          "../dataTables/UserDetailsTable.csv",
          "UserDetailsTable.csv",
        ],
      },
      {
        id: "ProviderTable",
        title: "ProviderTable",
        subtitle: "Providers & specializations",
        category: "core",
        icon: <HiOutlineUserGroup className="w-4 h-4" />,
        paths: [
          "/dataTables/ProviderTable.csv",
          "dataTables/ProviderTable.csv",
          "../dataTables/ProviderTable.csv",
          "ProviderTable.csv",
        ],
      },
      {
        id: "AppointmentTable",
        title: "AppointmentTable",
        subtitle: "Consultations & scheduling",
        category: "medical",
        icon: <HiOutlineCalendar className="w-4 h-4" />,
        paths: [
          "/dataTables/AppointmentTable.csv",
          "dataTables/AppointmentTable.csv",
          "../dataTables/AppointmentTable.csv",
          "AppointmentTable.csv",
        ],
      },
      {
        id: "MedicalRecordTable",
        title: "MedicalRecordTable",
        subtitle: "Per-user clinical records (JSON fields)",
        category: "medical",
        icon: <HiOutlineDocumentText className="w-4 h-4" />,
        paths: [
          "/dataTables/MedicalRecordTable.csv",
          "dataTables/MedicalRecordTable.csv",
          "../dataTables/MedicalRecordTable.csv",
          "MedicalRecordTable.csv",
        ],
      },
      {
        id: "VitalTable",
        title: "VitalTable",
        subtitle: "Vitals master list",
        category: "vitals",
        icon: <HiOutlineHeart className="w-4 h-4" />,
        paths: [
          "/dataTables/VitalTable.csv",
          "dataTables/VitalTable.csv",
          "../dataTables/VitalTable.csv",
          "VitalTable.csv",
        ],
      },
      {
        id: "VitalRecordTable",
        title: "VitalRecordTable",
        subtitle: "Recorded vital measurements",
        category: "vitals",
        icon: <HiOutlineHeart className="w-4 h-4" />,
        paths: [
          "/dataTables/VitalRecordTable.csv",
          "dataTables/VitalRecordTable.csv",
          "../dataTables/VitalRecordTable.csv",
          "VitalRecordTable.csv",
        ],
      },
      {
        id: "VitalTriggerTable",
        title: "VitalTriggerTable",
        subtitle: "Alert thresholds & notifications",
        category: "vitals",
        icon: <HiOutlineHeart className="w-4 h-4" />,
        paths: [
          "/dataTables/VitalTriggerTable.csv",
          "dataTables/VitalTriggerTable.csv",
          "../dataTables/VitalTriggerTable.csv",
          "VitalTriggerTable.csv",
        ],
      },
      {
        id: "NotificationTable",
        title: "NotificationTable",
        subtitle: "System/user notifications",
        category: "communication",
        icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" />,
        paths: [
          "/dataTables/NotificationTable.csv",
          "dataTables/NotificationTable.csv",
          "../dataTables/NotificationTable.csv",
          "NotificationTable.csv",
        ],
      },
      {
        id: "MessageTable",
        title: "MessageTable",
        subtitle: "User-provider messages",
        category: "communication",
        icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" />,
        paths: [
          "/dataTables/MessageTable.csv",
          "dataTables/MessageTable.csv",
          "../dataTables/MessageTable.csv",
          "MessageTable.csv",
        ],
      },
      {
        id: "UserDocumentTable",
        title: "UserDocumentTable",
        subtitle: "Uploaded documents",
        category: "documents",
        icon: <HiOutlineDocumentText className="w-4 h-4" />,
        paths: [
          "/dataTables/UserDocumentTable.csv",
          "dataTables/UserDocumentTable.csv",
          "../dataTables/UserDocumentTable.csv",
          "UserDocumentTable.csv",
        ],
      },
      {
        id: "CalendarEventTable",
        title: "CalendarEventTable",
        subtitle: "Calendar events",
        category: "scheduling",
        icon: <HiOutlineCalendar className="w-4 h-4" />,
        paths: [
          "/dataTables/CalendarEventTable.csv",
          "dataTables/CalendarEventTable.csv",
          "../dataTables/CalendarEventTable.csv",
          "CalendarEventTable.csv",
        ],
      },
      {
        id: "AddProviderTable",
        title: "AddProviderTable",
        subtitle: "Provider onboarding records",
        category: "admin",
        icon: <HiOutlineCog6Tooth className="w-4 h-4" />,
        paths: [
          "/dataTables/AddProviderTable.csv",
          "dataTables/AddProviderTable.csv",
          "../dataTables/AddProviderTable.csv",
          "AddProviderTable.csv",
        ],
      },
      {
        id: "overall-user-master",
        title: "Overall User Master (Joined by user_id)",
        subtitle: "Embedded related arrays from multiple tables",
        category: "aggregated",
        icon: <HiOutlineCircleStack className="w-4 h-4" />,
        paths: [
          "/overall/UserMaster.csv",
          "overall/UserMaster.csv",
          "../overall/UserMaster.csv",
          "UserMaster.csv",
        ],
      },
      {
        id: "overall-all-tables",
        title: "All Tables Combined (Union)",
        subtitle: "All rows with source_table column",
        category: "aggregated",
        icon: <HiOutlineTableCells className="w-4 h-4" />,
        paths: [
          "/overall/AllTablesCombined.csv",
          "overall/AllTablesCombined.csv",
          "../overall/AllTablesCombined.csv",
          "AllTablesCombined.csv",
        ],
      },
    ],
    []
  );

  const [currentId, setCurrentId] = useState("UserTable");
  const current = datasets.find((d) => d.id === currentId) || datasets[0];

  const navItems = datasets.map((d) => ({ id: d.id, label: d.title }));

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <HiOutlineTableCells className="w-6 h-6 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Tables
            </h1>
          </div>
          <p className="text-green-100">
            Explore all tables and datasets in the Vitals7 system.
          </p>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineCircleStack className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-teal-700">
              Select Dataset
            </h2>
          </div>
          <ReportNav
            items={navItems}
            currentId={currentId}
            onSelect={setCurrentId}
          />
        </div>
      </div>
      <TableViewer
        key={current.id}
        id={current.id}
        title={current.title}
        subtitle={current.subtitle}
        category={current.category}
        icon={current.icon}
        paths={current.paths}
      />
    </main>
  );
};

export default Tables;
