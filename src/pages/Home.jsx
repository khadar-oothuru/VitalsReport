import React from "react";

const Home = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Welcome to Vitals 7
          </h1>
          <p className="mt-4 text-slate-700">
            A unified view of medical records, vitals, and reports.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Get Started
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-slate-900 hover:bg-slate-50"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>{" "}
              Real-time vital tracking
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>{" "}
              Comprehensive records
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>{" "}
              Insights &amp; reports
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Home;
