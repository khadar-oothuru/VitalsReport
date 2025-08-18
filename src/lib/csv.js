// Lightweight CSV parsing and loading utilities used across report pages

export function parseCSV(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (char === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (char === "\n") {
        row.push(field);
        rows.push(row);
        field = "";
        row = [];
        i++;
        continue;
      }
      if (char === "\r") {
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return { headers: [], data: [] };
  const headers = rows[0].map((h) => h.trim());
  const data = rows
    .slice(1)
    .filter((r) => r.some((cell) => (cell || "").trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] ?? "").trim();
      });
      return obj;
    });
  return { headers, data };
}

async function tryFetch(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const { headers, data } = parseCSV(text);
    if (!headers || headers.length === 0) throw new Error("No headers");
    return { headers, data };
  } catch {
    return null;
  }
}

export async function loadCSVWithFallback(possiblePaths) {
  for (const p of possiblePaths) {
    const parsed = await tryFetch(p);
    if (parsed) return { ...parsed, path: p };
  }
  return { headers: [], data: [], path: "" };
}

export function normalizeStatusValue(value) {
  if (!value) return "";
  const s = String(value).trim().toLowerCase();
  if (s === "no-show" || s === "no_show" || s === "no show") return "no_show";
  return s.replace(/\s+/g, "_");
}

export function safeParseJSON(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return null;
  }
}
