import React, { useEffect, useMemo, useState } from "react";
import {
  HiOutlineUserCircle,
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { BiStats, BiBrain, BiLeaf } from "react-icons/bi";
import { loadCSVWithFallback, safeParseJSON } from "../lib/csv.js";
import SmartDropdown from "./SmartDropdown.jsx";

export default function ProfileViewer() {
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vitalRecords, setVitalRecords] = useState([]);
  const [vitalMaster, setVitalMaster] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    (async () => {
      const ud = (await loadCSVWithFallback([
        "../dataTables/UserDetailsTable.csv",
        "/dataTables/UserDetailsTable.csv",
        "dataTables/UserDetailsTable.csv",
        "UserDetailsTable.csv",
      ])) || { headers: [], data: [] };
      const um = (await loadCSVWithFallback([
        "../overall/UserMaster.csv",
        "/overall/UserMaster.csv",
        "overall/UserMaster.csv",
        "UserMaster.csv",
      ])) || { headers: [], data: [] };
      const ut = (await loadCSVWithFallback([
        "../dataTables/UserTable.csv",
        "/dataTables/UserTable.csv",
        "dataTables/UserTable.csv",
        "UserTable.csv",
      ])) || { headers: [], data: [] };

      const userDetails = ud.data || [];
      const userMaster = um.data || [];
      const userBasic = ut.data || [];

      const nameById = {};
      (userMaster || []).forEach((r) => {
        if (r.user_id) {
          const fn = (r.first_name || "").trim();
          const ln = (r.last_name || "").trim();
          const full = (fn + " " + ln).trim();
          if (full) nameById[r.user_id] = full;
        }
      });
      (userBasic || []).forEach((r) => {
        if (!nameById[r.user_id] && r.user_id) {
          const fn = (r.first_name || "").trim();
          const ln = (r.last_name || "").trim();
          const full = (fn + " " + ln).trim();
          if (full) nameById[r.user_id] = full;
        }
      });

      setUsers(userDetails?.length ? userDetails : userMaster || []);
      setUserMap(nameById);

      const med = await loadCSVWithFallback([
        "../dataTables/MedicalRecordTable.csv",
        "/dataTables/MedicalRecordTable.csv",
        "dataTables/MedicalRecordTable.csv",
        "MedicalRecordTable.csv",
      ]);
      setMedicalRecords(med.data || []);
      const vrec = await loadCSVWithFallback([
        "../dataTables/VitalRecordTable.csv",
        "/dataTables/VitalRecordTable.csv",
        "dataTables/VitalRecordTable.csv",
        "VitalRecordTable.csv",
      ]);
      setVitalRecords(vrec.data || []);
      const vmas = await loadCSVWithFallback([
        "../dataTables/VitalTable.csv",
        "/dataTables/VitalTable.csv",
        "dataTables/VitalTable.csv",
        "VitalTable.csv",
      ]);
      setVitalMaster(vmas.data || []);
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
    })();
  }, []);

  const selectedMedicalRecord = useMemo(
    () => medicalRecords.find((r) => r.user_id === selectedUserId) || {},
    [medicalRecords, selectedUserId]
  );

  const demographics = useMemo(
    () => safeParseJSON(selectedMedicalRecord.demographics) || {},
    [selectedMedicalRecord.demographics]
  );
  const holistic = useMemo(
    () => safeParseJSON(selectedMedicalRecord.holistic_factors) || {},
    [selectedMedicalRecord.holistic_factors]
  );
  const lifestyle = useMemo(
    () => safeParseJSON(selectedMedicalRecord.lifestyle) || {},
    [selectedMedicalRecord.lifestyle]
  );
  const mental = useMemo(
    () => safeParseJSON(selectedMedicalRecord.mental_health) || {},
    [selectedMedicalRecord.mental_health]
  );
  const sleep = useMemo(
    () => safeParseJSON(selectedMedicalRecord.sleep_metrics) || {},
    [selectedMedicalRecord.sleep_metrics]
  );

  const latestVitalsByCode = useMemo(() => {
    const userVitals = vitalRecords.filter((r) => r.user_id === selectedUserId);
    const latestBy = {};
    userVitals.forEach((r) => {
      const key = r.vital_code;
      const t = new Date(r.recorded_at || r.created_at || 0).getTime();
      if (!latestBy[key] || t > latestBy[key]._t)
        latestBy[key] = { ...r, _t: t };
    });
    return latestBy;
  }, [vitalRecords, selectedUserId]);

  const userAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.user_id === selectedUserId)
        .sort(
          (a, b) =>
            new Date(b.created_at || b.created) -
            new Date(a.created_at || a.created)
        ),
    [appointments, selectedUserId]
  );

  const mkCard = (label, value, unit = "", icon = null) => {
    const shouldShow = value !== undefined && value !== null && value !== "";
    if (!shouldShow) return null;
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-teal-700">{icon}</span>}
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            {label}
          </div>
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

  const userInfo = useMemo(() => {
    if (!selectedUserId) return null;
    const u = users.find((x) => x.user_id === selectedUserId);
    if (!u) return null;
    const name =
      userMap[selectedUserId] ||
      `${u.first_name || ""} ${u.last_name || ""}`.trim();
    return {
      id: selectedUserId,
      name: name || selectedUserId,
      age: demographics.age || "",
      gender: demographics.gender || "",
      neckSize: u.neck_size || "",
    };
  }, [selectedUserId, users, userMap, demographics]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 shadow-lg">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineUser className="w-5 h-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-teal-700">
              Select Patient
            </h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow max-w-md relative">
            <label
              htmlFor="profile-user"
              className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-600"
            >
              <HiOutlineUserCircle className="w-4 h-4" />
              Patient
            </label>
            <SmartDropdown
              value={selectedUserId}
              onChange={(value) => setSelectedUserId(value)}
              options={[
                { value: "", label: "Select a user..." },
                ...users.map((u) => {
                  const id = u.user_id;
                  const label = userMap[id] ? `${userMap[id]} (${id})` : id;
                  return { value: id, label };
                }),
              ]}
              placeholder="Select a user..."
            />
            {userInfo && (
              <div className="mt-3 text-xs rounded-lg px-3 py-2 bg-green-100 text-green-700 font-medium">
                ID: {userInfo.id}
                {userInfo.age ? ` • Age: ${userInfo.age}` : ""}
                {userInfo.gender ? ` • ${userInfo.gender}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserId ? (
        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Patient Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                <HiOutlineUserCircle className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xs font-semibold text-green-800">
                    Patient Name
                  </div>
                  <div className="text-sm font-bold text-green-900">
                    {userInfo?.name || selectedUserId}
                  </div>
                </div>
              </div>
              {userInfo?.age && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <HiOutlineCalendar className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Age
                    </div>
                    <div className="text-sm font-bold text-green-900">
                      {userInfo.age} years
                    </div>
                  </div>
                </div>
              )}
              {userInfo?.gender && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <HiOutlineUser className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Gender
                    </div>
                    <div className="text-sm font-bold text-green-900">
                      {userInfo.gender}
                    </div>
                  </div>
                </div>
              )}
              {(holistic.overall_wellness_index || holistic.wellness_index) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-20">
                  <HiOutlineSparkles className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Wellness Index
                    </div>
                    <div className="text-sm font-bold text-green-900">
                      {holistic.overall_wellness_index ||
                        holistic.wellness_index}
                      /100
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BiLeaf className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Holistic Health Assessment
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(() => {
                  const cards = [];

                  Object.entries(holistic).forEach(([k, v]) => {
                    if (
                      v !== undefined &&
                      v !== null &&
                      v !== "" &&
                      k !== "overall_wellness_index" &&
                      k !== "wellness_index"
                    ) {
                      let unit = "";
                      if (k.includes("index") || k.includes("wellness"))
                        unit = "/100";

                      cards.push(
                        mkCard(
                          k
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                          v,
                          unit,
                          <BiLeaf className="w-4 h-4" />
                        )
                      );
                    }
                  });

                  const validCards = cards.filter(Boolean);

                  return validCards.length ? (
                    validCards
                  ) : (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No holistic assessment data available
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineHeart className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Vital Signs Summary
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(latestVitalsByCode).length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                    No vital signs recorded
                  </div>
                ) : (
                  Object.values(latestVitalsByCode).map((rec) => {
                    const v = vitalMaster.find(
                      (vv) => vv.code === rec.vital_code
                    );
                    const name = v ? v.name : rec.vital_code;
                    const unit = v ? v.unit : "";
                    return mkCard(
                      name,
                      rec.value,
                      unit,
                      <HiOutlineHeart className="w-4 h-4" />
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <BiStats className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Lifestyle & Wellness
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(() => {
                  const u =
                    users.find((x) => x.user_id === selectedUserId) || {};
                  const cards = [];

                  if (u.smoker !== undefined) {
                    cards.push(
                      mkCard(
                        "Smoking Status",
                        (u.smoker || "").toLowerCase() === "true"
                          ? "Smoker"
                          : "Non-smoker"
                      )
                    );
                  }

                  if (u.alcohol !== undefined) {
                    cards.push(
                      mkCard(
                        "Alcohol Use",
                        (u.alcohol || "").toLowerCase() === "true"
                          ? "Yes"
                          : "No"
                      )
                    );
                  }

                  if (u.alcohol_frequency) {
                    cards.push(
                      mkCard("Alcohol Frequency", u.alcohol_frequency)
                    );
                  }

                  if (u.vaping !== undefined) {
                    cards.push(
                      mkCard(
                        "Vaping",
                        (u.vaping || "").toLowerCase() === "true" ? "Yes" : "No"
                      )
                    );
                  }

                  if (userInfo?.neckSize) {
                    cards.push(mkCard("Neck Size", userInfo.neckSize, "cm"));
                  }

                  Object.entries(lifestyle).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== "") {
                      cards.push(
                        mkCard(
                          k
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                          v
                        )
                      );
                    }
                  });

                  const validCards = cards.filter(Boolean);

                  return validCards.length ? (
                    validCards
                  ) : (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No lifestyle data recorded
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <BiBrain className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Mental Health & Sleep
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(() => {
                  const cards = [];

                  Object.entries(mental).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== "") {
                      let displayValue = v;
                      let unit = "";

                      if (k.includes("score")) {
                        if (k.includes("depression")) unit = "/27";
                        else if (k.includes("anxiety")) unit = "/21";
                        else if (k.includes("stress")) unit = "/10";
                      }

                      cards.push(
                        mkCard(
                          k
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                          displayValue,
                          unit,
                          <BiBrain className="w-4 h-4" />
                        )
                      );
                    }
                  });

                  Object.entries(sleep).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== "") {
                      let unit = "";
                      if (k.includes("duration")) unit = "hours";
                      else if (k.includes("ess")) unit = "/24";
                      else if (k.includes("quality")) unit = "/10";

                      cards.push(
                        mkCard(
                          k
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                          v,
                          unit,
                          <HiOutlineMoon className="w-4 h-4" />
                        )
                      );
                    }
                  });

                  const validCards = cards.filter(Boolean);

                  return validCards.length ? (
                    validCards
                  ) : (
                    <div className="col-span-full bg-white rounded-xl p-6 text-center text-sm font-medium border border-blue-100 shadow-md text-slate-600">
                      No mental health or sleep data recorded
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-teal-700" />
                <h3 className="text-xl font-semibold text-teal-700">
                  Consultation Timeline
                </h3>
              </div>
              <div className="space-y-4">
                {userAppointments.length ? (
                  userAppointments.map((a) => {
                    const p = providers.find((pp) => pp.id === a.provider_id);
                    const pname = p
                      ? `${p.prefix || ""} ${p.first_name || ""} ${
                          p.last_name || ""
                        }`.trim()
                      : "Unknown Provider";
                    const specialization = p?.specialization || "General";

                    return (
                      <div
                        key={a.id}
                        className="bg-white rounded-xl p-6 shadow-md border border-blue-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <HiOutlineCheckCircle className="w-5 h-5 text-teal-700" />
                            <div>
                              <div className="font-semibold text-teal-700">
                                {specialization} - {pname}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(
                                  a.created_at || a.created || Date.now()
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-600 border-green-200">
                            <HiOutlineCheckCircle className="w-3 h-3" />
                            {a.status || "Completed"}
                          </div>
                        </div>
                        <div className="text-sm leading-relaxed rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-slate-700">
                          {a.provider_notes ||
                            "Consultation completed. No additional notes provided."}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center shadow-md border border-blue-100">
                    <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-4 text-teal-600" />
                    <p className="font-bold text-lg mb-2 text-teal-700">
                      No consultations recorded
                    </p>
                    <p className="text-sm text-slate-600">
                      Consultation history will appear here once appointments
                      are scheduled
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center shadow-lg">
          <HiOutlineUserCircle className="w-12 h-12 mx-auto mb-4 text-teal-600" />
          <p className="font-bold text-lg mb-2 text-teal-700">
            Select a patient to view their medical profile
          </p>
          <p className="text-sm text-slate-600">
            Choose from the dropdown above to get started
          </p>
        </div>
      )}
    </main>
  );
}
