import React, { useEffect, useMemo, useState } from "react";
import {
  HiOutlineTableCells,
  HiOutlineDocumentArrowDown,
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { loadCSVWithFallback } from "../lib/csv.js";
import SmartDropdown from "./SmartDropdown.jsx";

function renderRowsHtml(headers, visibleRows) {
  if (!visibleRows.length)
    return (
      <tr>
        <td
          className="p-6 text-center text-slate-500 italic"
          colSpan={headers.length + 1}
        >
          <div className="flex flex-col items-center gap-2">
            <HiOutlineTableCells className="w-8 h-8 text-slate-400" />
            <span>No rows to display</span>
          </div>
        </td>
      </tr>
    );
  return visibleRows.map((r, idx) => (
    <tr
      key={idx}
      className={`hover:bg-blue-50 transition-colors ${
        idx % 2 === 0 ? "bg-blue-25" : "bg-white"
      } border-b border-blue-100`}
    >
      <td className="px-4 py-3 text-sm font-medium text-teal-700 bg-teal-50 border-r border-teal-200">
        {idx + 1}
      </td>
      {headers.map((h) => (
        <td
          key={h}
          className="px-4 py-3 text-sm text-slate-700 max-w-[240px] truncate hover:whitespace-normal hover:break-words"
        >
          {r[h] ?? ""}
        </td>
      ))}
    </tr>
  ));
}

export default function TableViewer({
  id,
  title,
  subtitle,
  category,
  icon,
  paths,
}) {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [csvPath, setCsvPath] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const parsed = await loadCSVWithFallback(paths);
      setHeaders(parsed.headers);
      setRows(parsed.data);
      setCsvPath(parsed.path);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(paths)]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      headers.some((h) =>
        String(r[h] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [rows, headers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIdx, startIdx + pageSize);

  return (
    <section
      id={id}
      className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <span className="text-white">{icon}</span>}
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {subtitle ? (
                <p className="text-green-100 text-sm">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {category ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border bg-white bg-opacity-20 text-teal-600 border-green-600">
              <HiOutlineTableCells className="w-3 h-3" />
              {String(category).toUpperCase()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <HiOutlineAdjustmentsHorizontal className="w-5 h-5 text-teal-700" />
          <h3 className="text-xl font-semibold text-teal-700">
            Table Controls
          </h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <HiOutlineMagnifyingGlass className="w-4 h-4 text-teal-700" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${title}...`}
                className="flex-1 rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white text-teal-700"
              />
            </div>
            <SmartDropdown
              value={pageSize}
              onChange={(value) => setPageSize(parseInt(value, 10))}
              options={[
                { value: 25, label: "25 rows" },
                { value: 50, label: "50 rows" },
                { value: 100, label: "100 rows" },
                { value: 200, label: "200 rows" },
              ]}
              className="min-w-[120px]"
            />
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 transition-all duration-200 hover:shadow-md"
              onClick={() => {
                if (csvPath) {
                  window.location.href = csvPath;
                }
              }}
            >
              <HiOutlineDocumentArrowDown className="w-4 h-4" />
              Download CSV
            </button>
            <div className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm font-medium text-teal-700">
              <HiOutlineTableCells className="w-4 h-4" />
              {filteredRows.length.toLocaleString()} rows • {headers.length}{" "}
              columns
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-teal-50 to-emerald-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100 border-r border-teal-200">
                    #
                  </th>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {renderRowsHtml(headers, visibleRows)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-white text-teal-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-white text-teal-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-blue-200 text-sm font-medium text-teal-700">
              <HiOutlineTableCells className="w-4 h-4" />
              Page {safePage} of {totalPages}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
