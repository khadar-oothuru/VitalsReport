import React from "react";

export default function ReportNav({ items = [], currentId, onSelect }) {
  return (
    <nav className="mx-auto max-w-7xl px-4">
      <div className="rounded-xl border border-sky-100 bg-white shadow-sm p-3">
        <div className="text-sky-700 font-bold mb-2">Quick Navigation</div>
        <div className="flex flex-wrap gap-2 items-center">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onSelect?.(it.id)}
              className={`px-3 py-2 rounded-md border text-sm font-semibold transition ${
                currentId === it.id
                  ? "bg-gradient-to-r from-sky-600 to-emerald-600 text-white border-sky-600"
                  : "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
