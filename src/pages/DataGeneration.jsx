import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getNodeText = (children) => {
  const array = Array.isArray(children) ? children : [children];
  return array
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (child && typeof child === "object" && child.props) {
        return getNodeText(child.props.children);
      }
      return "";
    })
    .join("");
};

const DataGeneration = () => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [isCompact, setIsCompact] = useState(true);
  const firstH1SkippedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/README_GENERATE_MEDICAL_DATA_V0.2.md", {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) {
          throw new Error(`Failed to load README (${res.status})`);
        }
        const text = await res.text();
        if (isMounted) {
          setContent(text);
          // Extract H2/H3 headings for TOC
          const hs = [];
          const re = /^(#{1,6})\s+(.+)$/gm;
          let m;
          while ((m = re.exec(text)) !== null) {
            const level = m[1].length;
            const title = m[2].replace(/[#`]/g, "").trim();
            if (level === 2 || level === 3) {
              hs.push({
                level,
                title,
                id: slugify(title),
              });
            }
          }
          setHeadings(hs);
        }
      } catch (e) {
        if (isMounted) setError(e.message || "Failed to load documentation");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMarkdown();
    return () => {
      isMounted = false;
    };
  }, []);

  const headingRenderer =
    (Tag) =>
    ({ node, children, ...props }) => {
      const text = getNodeText(children);
      const id = slugify(text);
      return (
        <Tag
          id={id}
          {...props}
          className={`${props.className || ""} group scroll-mt-24`}
        >
          <a href={`#${id}`} className="no-underline">
            {children}
          </a>
          <a
            href={`#${id}`}
            aria-label="Link to section"
            className="ml-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600"
          >
            #
          </a>
        </Tag>
      );
    };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-teal-700">
            Data Generation Guide
          </h1>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={isCompact}
              onChange={(e) => setIsCompact(e.target.checked)}
            />
            Compact view
          </label>
        </div>
        <p className="text-slate-600 mb-4 text-sm">
          This page renders the full documentation from the included README to
          explain how the synthetic medical data is generated.
        </p>

        {loading && (
          <div className="text-slate-500 text-sm">Loading documentation…</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 flex items-center justify-between">
            <span>{error}</span>
            <button
              className="px-2.5 py-1 rounded bg-red-600 text-white text-xs"
              onClick={() => {
                setError("");
                setLoading(true);
                // trigger reload via effect by resetting content
                setContent("");
                // naive retry by refiring the effect body
                (async () => {
                  try {
                    const res = await fetch(
                      "/README_GENERATE_MEDICAL_DATA_V0.2.md",
                      {
                        headers: { "Cache-Control": "no-cache" },
                      }
                    );
                    if (!res.ok)
                      throw new Error(`Failed to load README (${res.status})`);
                    const text = await res.text();
                    setContent(text);
                  } catch (e) {
                    setError(e.message || "Failed to load documentation");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
            <article
              className={`prose prose-slate max-w-3xl ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => {
                    if (!firstH1SkippedRef.current) {
                      firstH1SkippedRef.current = true;
                      return null;
                    }
                    const Comp = headingRenderer((p) => (
                      <h1
                        {...p}
                        className={`${p.className || ""} ${
                          isCompact
                            ? "text-xl md:text-2xl"
                            : "text-2xl md:text-3xl"
                        } font-bold text-slate-900 mt-6 mb-3`}
                      />
                    ));
                    return <Comp node={node}>{children}</Comp>;
                  },
                  h2: headingRenderer((props) => (
                    <h2
                      {...props}
                      className={`${props.className || ""} ${
                        isCompact ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                      } font-semibold text-slate-900 mt-6 mb-3`}
                    />
                  )),
                  h3: headingRenderer((props) => (
                    <h3
                      {...props}
                      className={`${props.className || ""} ${
                        isCompact
                          ? "text-base md:text-lg"
                          : "text-lg md:text-xl"
                      } font-semibold text-slate-900 mt-5 mb-2`}
                    />
                  )),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-slate-700 leading-relaxed mb-3"
                      {...props}
                    />
                  ),
                  code: ({ inline, className, children, ...props }) =>
                    inline ? (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="relative group/code">
                        <pre className="bg-slate-900 text-slate-100 p-3 md:p-4 rounded-lg overflow-auto text-xs md:text-sm">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                        <button
                          type="button"
                          className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity px-2 py-1 text-xs rounded bg-slate-700 text-white"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                String(children)
                              );
                            } catch (e) {
                              // ignore
                            }
                          }}
                          aria-label="Copy code"
                          title="Copy code"
                        >
                          Copy
                        </button>
                      </div>
                    ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-teal-700 underline hover:text-teal-800"
                      target="_blank"
                      rel="noreferrer"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 space-y-1 mb-3" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal pl-6 space-y-1 mb-3"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="w-full overflow-x-auto mb-4">
                      <table
                        className="min-w-full border border-slate-200 text-xs md:text-sm"
                        {...props}
                      />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-slate-50" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="border border-slate-200 px-2 md:px-3 py-2 text-left font-semibold"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="border border-slate-200 px-2 md:px-3 py-2 align-top"
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-slate-300 pl-4 italic text-slate-700 my-4"
                      {...props}
                    />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-6 md:my-8 border-slate-200" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
            <aside className="hidden lg:block">
              <div className="sticky top-20 border border-slate-200 bg-white rounded-lg p-3">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">
                  On this page
                </div>
                <nav className="space-y-1">
                  {headings.length === 0 && (
                    <div className="text-slate-400 text-xs">No sections</div>
                  )}
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-slate-700 hover:text-teal-700 text-xs ${
                        h.level === 3 ? "pl-3" : "pl-0"
                      }`}
                    >
                      {h.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataGeneration;
