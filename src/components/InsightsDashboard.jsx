import React, { useEffect, useMemo, useState } from "react";
import { loadCSVWithFallback, normalizeStatusValue } from "../lib/csv.js";

const brandColors = {
  primary: "#1e88a8",
  secondary: "#2db88d",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

function parseAppointmentDate(row) {
  const created = row.created_at || row.created || "";
  if (created) {
    const d = new Date(created);
    if (!isNaN(d)) return d;
  }
  const startTime = row.start_time ? parseInt(row.start_time, 10) : NaN;
  if (!Number.isNaN(startTime) && startTime > 100000)
    return new Date(startTime * 1000);
  try {
    const slot =
      typeof row.time_slot === "string"
        ? JSON.parse(row.time_slot)
        : row.time_slot || {};
    const start = slot.start ? parseInt(slot.start, 10) : NaN;
    if (!Number.isNaN(start) && start > 100000) return new Date(start * 1000);
  } catch {}
  return null;
}

export default function InsightsDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  useEffect(() => {
    (async () => {
      const combined = await loadCSVWithFallback([
        "../overall/AllTablesCombined.csv",
        "/overall/AllTablesCombined.csv",
        "overall/AllTablesCombined.csv",
        "AllTablesCombined.csv",
      ]);
      const combinedData = combined?.data || [];

      if (combinedData.length) {
        setAppointments(
          combinedData.filter(
            (r) => (r.source_table || "").toLowerCase() === "appointmenttable"
          )
        );
        const usersFromCombined = combinedData
          .filter((r) => (r.user_id || "").trim() !== "")
          .map((r) => r.user_id);
        setUserDetails(
          Array.from(new Set(usersFromCombined)).map((u) => ({ user_id: u }))
        );
        const prov = await loadCSVWithFallback([
          "../dataTables/ProviderTable.csv",
          "/dataTables/ProviderTable.csv",
          "dataTables/ProviderTable.csv",
          "ProviderTable.csv",
        ]);
        setProviders(prov.data || []);
      } else {
        const ud = await loadCSVWithFallback([
          "../dataTables/UserDetailsTable.csv",
          "/dataTables/UserDetailsTable.csv",
          "dataTables/UserDetailsTable.csv",
          "UserDetailsTable.csv",
        ]);
        setUserDetails(ud.data || []);
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
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const totalUsers =
      userDetails.length ||
      new Set(appointments.map((a) => a.user_id).filter(Boolean)).size;
    const totalConsultations = appointments.length;
    const completed = appointments.filter(
      (a) => normalizeStatusValue(a.status) === "completed"
    ).length;
    const cancelled = appointments.filter(
      (a) => normalizeStatusValue(a.status) === "cancelled"
    ).length;
    const noShow = appointments.filter(
      (a) => normalizeStatusValue(a.status) === "no_show"
    ).length;
    const completionRate = totalConsultations
      ? Math.round((completed / totalConsultations) * 100)
      : 0;
    let activeProviders = providers.filter(
      (p) =>
        (p.status || "").trim() === "" ||
        (p.status || "").toLowerCase() === "active"
    ).length;
    if (!activeProviders)
      activeProviders = new Set(
        appointments.map((a) => a.provider_id).filter(Boolean)
      ).size;

    const months = [];
    const counts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const c = appointments.filter((a) => {
        const date = parseAppointmentDate(a);
        if (!date) return false;
        const mkey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        return mkey === key;
      }).length;
      months.push(d.toLocaleDateString("en", { month: "short" }));
      counts.push(c);
    }

    return {
      totalUsers,
      totalConsultations,
      completed,
      cancelled,
      noShow,
      completionRate,
      months,
      counts,
    };
  }, [appointments, providers, userDetails]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Business Insights Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-700">
            {String(metrics.totalUsers ?? "--")}
          </div>
          <div className="text-slate-600 font-semibold text-sm">
            Total Users
          </div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-700">
            {String(metrics.totalConsultations ?? "--")}
          </div>
          <div className="text-slate-600 font-semibold text-sm">
            Total Consultations
          </div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-700">
            {String(
              metrics.completed + metrics.cancelled + metrics.noShow > 0
                ? metrics.completed +
                    metrics.cancelled +
                    metrics.noShow -
                    metrics.cancelled -
                    metrics.noShow
                : "--"
            )}
          </div>
          <div className="text-slate-600 font-semibold text-sm">
            Active Providers
          </div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-700">
            {String(metrics.completionRate ?? "--")}%
          </div>
          <div className="text-slate-600 font-semibold text-sm">
            Completion Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-sky-100 bg-white p-4">
          <div className="text-sky-700 font-bold text-center mb-2">
            Consultation Status Distribution
          </div>
          <div className="flex items-end gap-2 h-48">
            {[
              {
                label: "Completed",
                value: metrics.completed,
                color: brandColors.success,
              },
              {
                label: "Cancelled",
                value: metrics.cancelled,
                color: brandColors.warning,
              },
              {
                label: "No-Show",
                value: metrics.noShow,
                color: brandColors.danger,
              },
            ].map((b) => (
              <div
                key={b.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-10 rounded-t-md"
                  style={{
                    height: `${(b.value || 0) === 0 ? 2 : 8 + b.value * 6}px`,
                    background: b.color,
                  }}
                />
                <div className="text-xs text-slate-600 font-semibold">
                  {b.label}
                </div>
                <div className="text-xs text-slate-900 font-bold">
                  {b.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white p-4">
          <div className="text-sky-700 font-bold text-center mb-2">
            Monthly Consultation Trends
          </div>
          <div className="flex items-end gap-2 h-48">
            {metrics.months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-10 rounded-t-md bg-sky-600/70 border border-sky-600"
                  style={{
                    height: `${
                      (metrics.counts[i] || 0) === 0
                        ? 2
                        : 8 + metrics.counts[i] * 6
                    }px`,
                  }}
                />
                <div className="text-xs text-slate-600 font-semibold">{m}</div>
                <div className="text-xs text-slate-900 font-bold">
                  {metrics.counts[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
