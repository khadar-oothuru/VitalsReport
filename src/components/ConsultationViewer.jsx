import React, { useEffect, useMemo, useState } from "react";
import { loadCSVWithFallback, safeParseJSON } from "../lib/csv.js";

export default function ConsultationViewer() {
	const [users, setUsers] = useState([]);
	const [userMap, setUserMap] = useState({});
	const [appointments, setAppointments] = useState([]);
	const [providers, setProviders] = useState([]);
	const [medicalRecords, setMedicalRecords] = useState([]);

	const [selectedUserId, setSelectedUserId] = useState("");
	const [selectedApptId, setSelectedApptId] = useState("");

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

			setUsers((userDetails && userDetails.length ? userDetails : userMaster) || []);
			setUserMap(nameById);

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
		})();
	}, []);

	const appointmentsForSelectedUser = useMemo(
		() => appointments
			.filter((a) => a.user_id === selectedUserId)
			.sort((a, b) => new Date(b.created_at || b.created) - new Date(a.created_at || a.created)),
		[appointments, selectedUserId]
	);

	const appt = useMemo(
		() => appointments.find((x) => x.id === selectedApptId) || {},
		[appointments, selectedApptId]
	);
	const provider = useMemo(() => providers.find((pp) => pp.id === appt.provider_id), [providers, appt.provider_id]);
	const mr = useMemo(() => medicalRecords.find((m) => m.user_id === appt.user_id) || {}, [medicalRecords, appt.user_id]);
	const anth = safeParseJSON(mr.anthropometry) || {};
	const vit = safeParseJSON(mr.vitals) || {};

	const mkCard = (label, val, unit = "") =>
		val !== undefined && val !== "" ? (
			<div className="rounded-lg border border-sky-100 bg-white p-3">
				<div className="text-xs font-bold uppercase text-slate-500">{label}</div>
				<div className="text-sky-700 font-bold">
					{val} {unit}
				</div>
			</div>
		) : null;

return (
		<section className="mx-auto max-w-7xl px-4 py-8">
			<h2 className="text-2xl font-bold text-slate-900 mb-3">Consultation Report</h2>
			<div className="flex gap-3 items-center bg-white border border-sky-100 rounded-lg p-3 mb-4 flex-wrap">
				<label htmlFor="consult-user" className="font-semibold text-sky-700">User</label>
				<select
					id="consult-user"
					className="border border-slate-200 rounded-md px-3 py-2 text-sm"
					value={selectedUserId}
					onChange={(e) => {
						setSelectedUserId(e.target.value);
						setSelectedApptId("");
					}}
				>
					<option value="">Select a user...</option>
					{users.map((u) => {
						const id = u.user_id;
						const label = userMap[id] ? `${userMap[id]} (${id})` : id;
						return (
							<option key={id} value={id}>
								{label}
							</option>
						);
					})}
				</select>
				<label htmlFor="consult-appointment" className="font-semibold text-sky-700">Appointment</label>
				<select
					id="consult-appointment"
					className="border border-slate-200 rounded-md px-3 py-2 text-sm"
					value={selectedApptId}
					onChange={(e) => setSelectedApptId(e.target.value)}
				>
					<option value="">Select an appointment...</option>
					{appointmentsForSelectedUser.map((a) => (
						<option key={a.id} value={a.id}>
							{new Date(a.created_at || a.created || Date.now()).toLocaleDateString()} - {a.status}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
				<div className="rounded-lg bg-sky-50 border-l-4 border-emerald-500 p-3">
					<div className="text-xs font-bold uppercase text-slate-500">Date</div>
					<div className="text-sky-700 font-bold">{selectedApptId ? new Date(appt.created_at || appt.created || Date.now()).toLocaleDateString() : '--'}</div>
				</div>
				<div className="rounded-lg bg-sky-50 border-l-4 border-emerald-500 p-3">
					<div className="text-xs font-bold uppercase text-slate-500">Provider</div>
					<div className="text-sky-700 font-bold">{selectedApptId ? (provider ? `${provider.prefix || ''} ${provider.first_name || ''} - ${provider.specialization || ''}`.trim() : 'Provider information not available') : '--'}</div>
				</div>
				<div className="rounded-lg bg-sky-50 border-l-4 border-emerald-500 p-3">
					<div className="text-xs font-bold uppercase text-slate-500">Status</div>
					<div className="text-sky-700 font-bold">{selectedApptId ? (appt.status || 'Unknown') : '--'}</div>
				</div>
			</div>

			<div className="mb-4">
				<div className="text-sky-700 font-bold mb-2">Clinical Notes & Recommendations</div>
				<div className="rounded-lg border border-sky-100 bg-white p-3">
					{selectedApptId ? (appt.provider_notes || 'No clinical notes provided for this consultation.') : 'Select an appointment to view details.'}
				</div>
			</div>

			<div>
				<div className="text-sky-700 font-bold mb-2">Physical Measurements & Vitals</div>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
					{selectedApptId ? (
						<>
							{mkCard("BMI", anth.bmi, "kg/m²")}
							{mkCard("Heart Rate", vit.heart_rate, "bpm")}
							{mkCard("Height", anth.height, "cm")}
							{mkCard("Weight", anth.weight, "kg")}
							{mkCard("Oxygen Saturation", vit.oxygen_saturation, "%")}
							{mkCard("Pulse Rate", vit.heart_rate || vit.pulse_rate, "bpm")}
							{mkCard("Blood Pressure Systolic", vit.blood_pressure_systolic || vit.systolic_bp, "mmHg")}
							{mkCard("Blood Pressure Diastolic", vit.blood_pressure_diastolic || vit.diastolic_bp, "mmHg")}
						</>
					) : (
						<div className="italic text-slate-500">No vital signs data available</div>
					)}
				</div>
			</div>
		</section>
	);
}


