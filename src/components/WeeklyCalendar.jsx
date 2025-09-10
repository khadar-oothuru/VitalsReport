import React, { useMemo } from "react";
import { HiOutlineCalendar } from "react-icons/hi2";

const WeeklyCalendar = ({ appointments = [] }) => {
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    const weekData = days.map((dayName, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);

      // Count appointments for this day
      const dayAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(
          parseInt(appointment.start_time) * 1000
        );
        return (
          appointmentDate.getDate() === dayDate.getDate() &&
          appointmentDate.getMonth() === dayDate.getMonth() &&
          appointmentDate.getFullYear() === dayDate.getFullYear()
        );
      });

      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      return {
        dayName,
        dayNumber: dayDate.getDate(),
        appointmentCount: dayAppointments.length,
        isToday,
        hasAppointments: dayAppointments.length > 0,
      };
    });

    return weekData;
  }, [appointments]);

  return (
    <div className="grid grid-cols-7 gap-1 bg-gray-200 rounded-xl overflow-hidden">
      {weeklyData.map((day, index) => (
        <div
          key={index}
          className={`bg-white p-3 min-h-20 flex flex-col ${
            day.isToday ? "bg-blue-100" : ""
          } ${day.hasAppointments ? "bg-yellow-50" : ""}`}
        >
          <div className="text-center text-xs font-semibold text-gray-600 mb-1">
            {day.dayName}
          </div>
          <div className="text-center text-lg font-bold text-gray-900 mb-1">
            {day.dayNumber}
          </div>
          <div className="text-center text-xs text-gray-500">
            {day.appointmentCount > 0 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {day.appointmentCount} appointment
                {day.appointmentCount !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-gray-400">No appointments</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendar;
