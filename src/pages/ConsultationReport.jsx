import React, { useEffect, useMemo, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineHeart,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineFlag,
} from "react-icons/hi2";
import { BiBody, BiStats, BiBrain, BiLeaf } from "react-icons/bi";
import {
  loadCSVWithFallback,
  safeParseJSON,
  normalizeStatusValue,
} from "../lib/csv.js";
import SmartDropdown from "../components/SmartDropdown.jsx";

const ConsultationReport = () => {
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [userMaster, setUserMaster] = useState([]);
  const [userTable, setUserTable] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  useEffect(() => {
    (async () => {
      const ap = await loadCSVWithFallback([
        "../dataTables/AppointmentTable.csv",
        "/dataTables/AppointmentTable.csv",
        "dataTables/AppointmentTable.csv",
        "AppointmentTable.csv",
      ]);
      setAppointments(ap.data || []);

      const prov = await loadCSVWithFallback([
        "../dataTables/ProviderTable.csv",
        "/dataTables/ProviderTable.csv",
        "dataTables/ProviderTable.csv",
        "ProviderTable.csv",
      ]);
      setProviders(prov.data || []);

      const med = await loadCSVWithFallback([
        "../dataTables/MedicalRecordTable.csv",
        "/dataTables/MedicalRecordTable.csv",
        "dataTables/MedicalRecordTable.csv",
        "MedicalRecordTable.csv",
      ]);
      setMedicalRecords(med.data || []);

      const um = await loadCSVWithFallback([
        "../overall/UserMaster.csv",
        "/overall/UserMaster.csv",
        "overall/UserMaster.csv",
        "UserMaster.csv",
      ]);
      setUserMaster(um.data || []);

      const ut = await loadCSVWithFallback([
        "../dataTables/UserTable.csv",
        "/dataTables/UserTable.csv",
        "dataTables/UserTable.csv",
        "UserTable.csv",
      ]);
      setUserTable(ut.data || []);
    })();
  }, []);

  // PREDEFINED USER: This consultation report is configured to show only Thomas Wilson (thomas.wilson7615@example.com)
  // This is not changeable - the user selection is locked to this specific user only
  const usersForSelector = useMemo(() => {
    const users =
      (userMaster && userMaster.length ? userMaster : userTable) || [];

    // Filter to show only the predefined Thomas Wilson user
    const thomasWilsonUser = users.find(
      (user) =>
        user.email === "thomas.wilson7615@example.com" ||
        user.user_id === "7608f719-f6b3-4074-8db3-95abc689b587"
    );

    return thomasWilsonUser ? [thomasWilsonUser] : [];
  }, [userMaster, userTable]);

  useEffect(() => {
    if (!selectedUserId && usersForSelector.length) {
      setSelectedUserId(usersForSelector[0].user_id || "");
    }
  }, [usersForSelector, selectedUserId]);

  const userInfo = useMemo(() => {
    if (!selectedUserId) return null;
    const u =
      usersForSelector.find((x) => x.user_id === selectedUserId) ||
      userTable.find((x) => x.user_id === selectedUserId);
    if (!u) return null;
    const nowYear = new Date().getFullYear();
    const age = u.date_of_birth
      ? nowYear - new Date(u.date_of_birth).getFullYear()
      : "";
    return {
      id: selectedUserId,
      age: Number.isFinite(age) ? age : "",
      phone: u.phone || "",
      name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      email: u.email || "",
    };
  }, [selectedUserId, usersForSelector, userTable]);

  const appointmentsForUser = useMemo(() => {
    return (
      selectedUserId
        ? appointments.filter((a) => a.user_id === selectedUserId)
        : appointments
    )
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at || b.created) -
          new Date(a.created_at || a.created)
      );
  }, [appointments, selectedUserId]);

  // Auto-select the latest appointment when user is selected
  useEffect(() => {
    if (
      selectedUserId &&
      appointmentsForUser.length > 0 &&
      !selectedAppointmentId
    ) {
      setSelectedAppointmentId(appointmentsForUser[0].id); // Select the latest appointment
    }
  }, [selectedUserId, appointmentsForUser, selectedAppointmentId]);

  const appointment = useMemo(
    () => appointments.find((x) => x.id === selectedAppointmentId) || null,
    [appointments, selectedAppointmentId]
  );

  const provider = useMemo(
    () =>
      appointment
        ? providers.find((p) => p.id === appointment.provider_id)
        : null,
    [providers, appointment]
  );

  const medicalRecord = useMemo(
    () =>
      appointment
        ? medicalRecords.find((m) => m.user_id === appointment.user_id)
        : null,
    [medicalRecords, appointment]
  );

  const anthropometry = safeParseJSON(medicalRecord?.anthropometry) || {};
  const vitals = safeParseJSON(medicalRecord?.vitals) || {};
  const sleepMetrics = safeParseJSON(medicalRecord?.sleep_metrics) || {};
  const mentalHealth = safeParseJSON(medicalRecord?.mental_health) || {};
  const lifestyle = safeParseJSON(medicalRecord?.lifestyle) || {};
  const medicalHistory = safeParseJSON(medicalRecord?.medical_history) || {};
  const holisticFactors = safeParseJSON(medicalRecord?.holistic_factors) || {};
  const carePlanning = safeParseJSON(medicalRecord?.care_planning) || {};

  const formatAppointmentDate = (apt) => {
    if (!apt) return "--";
    const src = apt.created_at || apt.created || apt.start_time;
    if (!src) return "Unknown Date";
    try {
      let d;
      if (typeof src === "string" && src.includes("-")) d = new Date(src);
      else if (!isNaN(src)) {
        const ts = parseInt(src, 10);
        d = new Date(ts > 9999999999 ? ts : ts * 1000);
      } else d = new Date(src);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    } catch {
      return "Unknown Date";
    }
    return "Unknown Date";
  };

  const mkCard = (label, value, unit = "") => {
    const shouldShow = value !== undefined && value !== null && value !== "";
    if (!shouldShow) return null;
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-600">
          {label}
        </div>
        <div className="text-xl font-bold text-teal-700">
          {value}
          {unit ? (
            <span className="text-sm font-medium ml-1 text-slate-600">
              {unit}
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  };

  const statusNorm = normalizeStatusValue(appointment?.status || "completed");
  const getStatusConfig = (status) => {
    switch (status) {
      case "cancelled":
        return {
          icon: HiOutlineXCircle,
          class: "bg-red-50 text-red-600 border-red-200",
          label: "Cancelled",
        };
      case "no_show":
        return {
          icon: HiOutlineExclamationCircle,
          class: "bg-amber-50 text-amber-600 border-amber-200",
          label: "No Show",
        };
      default:
        return {
          icon: HiOutlineCheckCircle,
          class: "bg-green-50 text-green-600 border-green-200",
          label: "Completed",
        };
    }
  };

  const statusConfig = getStatusConfig(statusNorm);

  const allergiesText = Array.isArray(medicalHistory?.allergies)
    ? medicalHistory.allergies
        .filter((a) => a && a.toLowerCase() !== "none")
        .join(", ")
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <HiOutlineDocumentText className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">
                Consultation Report
              </h1>
            </div>
            <p className="text-blue-100 font-medium">
              Individual session summary with vitals, sleep, mental health,
              lifestyle, and care planning
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineUserGroup className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-teal-700">
              Select Consultation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <label
                htmlFor="userSelect"
                className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-600"
              >
                <HiOutlineUser className="w-4 h-4" />
                Patient
              </label>
              <SmartDropdown
                value={selectedUserId}
                onChange={() => {
                  // User selection is locked to Thomas Wilson - no changes allowed
                  return;
                }}
                options={[
                  ...usersForSelector.map((u) => {
                    const fullName = `${(u.first_name || "").trim()} ${(
                      u.last_name || ""
                    ).trim()}`.trim();
                    const email = u.email ? ` (${u.email})` : "";
                    return {
                      value: u.user_id,
                      label: `${fullName || u.user_id}${email}`,
                    };
                  }),
                ]}
                placeholder="Select a user..."
                disabled={true}
              />
              {userInfo && (
                <div className="mt-3 text-xs rounded-lg px-3 py-2 bg-green-100 text-green-700 font-medium">
                  ID: {userInfo.id}
                  {userInfo.age ? ` • Age: ${userInfo.age}` : ""}
                  {userInfo.phone ? ` • ${userInfo.phone}` : ""}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <label
                htmlFor="consultationSelect"
                className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-600"
              >
                <HiOutlineCalendar className="w-4 h-4" />
                Appointment
              </label>

              <SmartDropdown
                value={selectedAppointmentId}
                onChange={(value) => setSelectedAppointmentId(value)}
                options={[
                  { value: "", label: "Select a consultation..." },
                  ...(appointmentsForUser.length === 0
                    ? [
                        {
                          value: "",
                          label: "No consultations found for this user",
                          disabled: true,
                        },
                      ]
                    : appointmentsForUser.map((apt) => {
                        const prov = providers.find(
                          (p) => p.id === apt.provider_id
                        );
                        const provName = prov
                          ? `${prov.prefix || ""} ${prov.first_name || ""} ${
                              prov.last_name || ""
                            }`.trim() || "Unknown Provider"
                          : "Unknown Provider";
                        const date = formatAppointmentDate(apt);
                        const statusBadge = apt.status
                          ? ` (${apt.status})`
                          : "";

                        return {
                          value: apt.id,
                          label: `${date} - ${provName}${statusBadge}`,
                        };
                      })),
                ]}
                placeholder="Select a consultation..."
              />
              {selectedAppointmentId && (
                <div className="mt-3 text-xs rounded-lg px-3 py-2 bg-green-100 text-green-700 font-medium">
                  <div className="flex items-center justify-between">
                    <span>Appointment ID: {selectedAppointmentId}</span>
                    {appointmentsForUser.length > 0 &&
                      appointmentsForUser[0].id === selectedAppointmentId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          Latest
                        </span>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedAppointmentId ? (
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Consultation Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <HiOutlineCalendar className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Date
                    </div>
                    <div className="text-sm font-bold text-green-900">
                      {formatAppointmentDate(appointment)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <HiOutlineAcademicCap className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Provider
                    </div>
                    <div className="text-sm font-bold text-green-900">
                      {provider
                        ? `${provider.prefix || ""} ${
                            provider.first_name || ""
                          } ${provider.last_name || ""} - ${
                            provider.specialization || "General"
                          }`.trim()
                        : "Provider information not available"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <statusConfig.icon className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Status
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border bg-green-900 text-green-50 border-green-800">
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Clinical Assessment
                  </h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                  <div className="text-sm font-semibold mb-3 text-slate-600">
                    Clinical Notes & Recommendations
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700">
                    {appointment?.provider_notes ||
                      "No clinical notes provided for this consultation."}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BiLeaf className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Holistic Health Assessment
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    mkCard(
                      "Ayurvedic Dosha Type",
                      holisticFactors.ayurvedic_dosha_type
                    ),
                    mkCard(
                      "Overall Wellness Index",
                      holisticFactors.overall_wellness_index,
                      "/100"
                    ),
                    mkCard(
                      "Spiritual Wellness",
                      holisticFactors.spiritual_wellness
                    ),
                  ].filter(Boolean)}
                  {!holisticFactors ||
                  Object.keys(holisticFactors).length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No holistic assessment data available
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <HiOutlineFlag className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Care Planning & Goals
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                    <div className="text-sm font-semibold mb-3 text-slate-600">
                      Treatment Goals
                    </div>
                    <div className="text-sm leading-relaxed text-slate-700">
                      {Array.isArray(carePlanning?.treatment_goals) &&
                      carePlanning.treatment_goals.filter(
                        (g) => g && String(g).trim()
                      ).length
                        ? carePlanning.treatment_goals
                            .filter((g) => g && String(g).trim())
                            .join(", ")
                        : "No treatment goals specified for this patient."}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                    <div className="text-sm font-semibold mb-3 text-slate-600">
                      Next Steps
                    </div>
                    <div className="text-sm leading-relaxed text-slate-700">
                      {carePlanning?.next_steps ||
                        "No next steps specified for this patient."}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BiBody className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Physical Measurements & Vitals
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    mkCard("BMI", anthropometry.bmi, "kg/m²"),
                    mkCard("Height", anthropometry.height, "cm"),
                    mkCard("Weight", anthropometry.weight, "kg"),
                    mkCard(
                      "Waist Circumference",
                      anthropometry.waist_circumference,
                      "cm"
                    ),
                    mkCard(
                      "Neck Circumference",
                      anthropometry.neck_circumference,
                      "cm"
                    ),
                    mkCard(
                      "Heart Rate",
                      vitals.heart_rate || vitals.pulse_rate,
                      "bpm"
                    ),
                    mkCard(
                      "Systolic BP",
                      vitals.systolic_bp || vitals.blood_pressure_systolic,
                      "mmHg"
                    ),
                    mkCard(
                      "Diastolic BP",
                      vitals.diastolic_bp || vitals.blood_pressure_diastolic,
                      "mmHg"
                    ),
                    mkCard("Temperature", vitals.temperature, "°F"),
                    mkCard("Oxygen Saturation", vitals.oxygen_saturation, "%"),
                  ].filter(Boolean)}
                  {(!anthropometry ||
                    Object.keys(anthropometry).length === 0) &&
                  (!vitals || Object.keys(vitals).length === 0) ? (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No vital signs data available
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <HiOutlineMoon className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Sleep Assessment
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    mkCard(
                      "Sleep Duration",
                      sleepMetrics.sleep_duration,
                      "hours"
                    ),
                    mkCard("ESS Score", sleepMetrics.ess_score, "/24"),
                    mkCard(
                      "Sleep Quality Index",
                      sleepMetrics.sleep_quality_index,
                      "/10"
                    ),
                    mkCard(
                      "Snoring",
                      sleepMetrics.snoring
                        ? "Yes"
                        : sleepMetrics.snoring === false
                        ? "No"
                        : ""
                    ),
                  ].filter(Boolean)}
                  {!sleepMetrics || Object.keys(sleepMetrics).length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No sleep data available
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BiBrain className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Mental Health & Wellness
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    mkCard(
                      "Depression Score",
                      mentalHealth.depression_score,
                      "/27"
                    ),
                    mkCard("Anxiety Score", mentalHealth.anxiety_score, "/21"),
                    mkCard("Stress Levels", mentalHealth.stress_levels),
                    mkCard("Energy Levels", mentalHealth.energy_levels, "/10"),
                  ].filter(Boolean)}
                  {!mentalHealth || Object.keys(mentalHealth).length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No mental health data available
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <BiStats className="w-5 h-5 text-teal-700" />
                  <h3 className="text-xl font-semibold text-teal-700">
                    Lifestyle & Medical History
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    mkCard("Smoking Status", lifestyle.smoking_status),
                    mkCard(
                      "Alcohol Consumption",
                      lifestyle.alcohol_consumption
                    ),
                    mkCard(
                      "Physical Activity",
                      lifestyle.physical_activity_level
                    ),
                    mkCard("Diet Type", lifestyle.diet_type),
                    mkCard(
                      "Hypertension",
                      medicalHistory.hypertension === true ||
                        medicalHistory.hypertension === "true"
                        ? "Yes"
                        : medicalHistory.hypertension === false ||
                          medicalHistory.hypertension === "false"
                        ? "No"
                        : medicalHistory.hypertension
                    ),
                    mkCard(
                      "Diabetes",
                      medicalHistory.diabetes === true ||
                        medicalHistory.diabetes === "true"
                        ? "Yes"
                        : medicalHistory.diabetes === false ||
                          medicalHistory.diabetes === "false"
                        ? "No"
                        : medicalHistory.diabetes
                    ),
                    mkCard("Family History", medicalHistory.family_history),
                    mkCard("Allergies", allergiesText),
                  ].filter(Boolean)}
                  {(!lifestyle || Object.keys(lifestyle).length === 0) &&
                  (!medicalHistory ||
                    Object.keys(medicalHistory).length === 0) ? (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No lifestyle or medical history data available
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center shadow-lg">
            <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-4 text-teal-600" />
            <p className="font-bold text-lg mb-2 text-teal-700">
              Select a patient and consultation to view the report
            </p>
            <p className="text-sm text-slate-600">
              Choose from the dropdowns above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationReport;
