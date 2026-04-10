import { useState, useEffect, useRef, useCallback } from "react";
import type { CustomTabProps, Client, ReviewItem } from "./types";

// --- Constants ---

const STATUS_COLORS: Record<Client["status"], { bg: string; text: string }> = {
  intake: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  documents_pending: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  in_review: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
  filed: { bg: "rgba(0,162,64,0.1)", text: "#00a240" },
  completed: { bg: "rgba(13,13,13,0.06)", text: "#424242" },
};

const STATUS_LABELS: Record<Client["status"], string> = {
  intake: "Intake",
  documents_pending: "Documents pending",
  in_review: "In review",
  filed: "Filed",
  completed: "Completed",
};

const FILING_LABELS: Record<Client["filing_status"], string> = {
  single: "Single",
  married_joint: "Married (Joint)",
  married_separate: "Married (Separate)",
  head_of_household: "Head of Household",
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "rgba(224,46,42,0.1)", text: "#e02e2a" },
  medium: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  low: { bg: "rgba(13,13,13,0.06)", text: "#676767" },
};

const CHECKLIST_CATEGORIES = ["checklist-item", "missing-document", "carryover"];
const QUESTION_CATEGORIES = ["needs-info", "discrepancy", "client-request", "informational"];

const FONT = 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif';

// --- Hook: polling data reader ---

function usePolledData<T>(
  readFile: CustomTabProps["readFile"],
  path: string,
  fallback: T,
  interval = 2000,
): T {
  const [data, setData] = useState<T>(fallback);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    let active = true;
    const load = () => {
      readFile(path)
        .then((raw) => {
          if (active) {
            try {
              setData(JSON.parse(raw));
            } catch {
              setData(fallbackRef.current);
            }
          }
        })
        .catch(() => {
          if (active) setData(fallbackRef.current);
        });
    };
    load();
    const id = setInterval(load, interval);
    return () => { active = false; clearInterval(id); };
  }, [readFile, path, interval]);

  return data;
}

// --- Main component ---

export function ClientsTab(props: CustomTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const clients = usePolledData<Client[]>(props.readFile, ".houston/data/clients.json", []);

  const selectedClient = selectedId ? clients.find((c) => c.id === selectedId) ?? null : null;

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        readFile={props.readFile}
        listFiles={props.listFiles}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return <ClientList clients={clients} onSelect={(id) => setSelectedId(id)} />;
}

// --- Client List View ---

function ClientList({ clients, onSelect }: { clients: Client[]; onSelect: (id: string) => void }) {
  if (clients.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyTitle}>No clients yet</div>
        <div style={s.emptyDesc}>Ask Emma to create a new client.</div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.heading}>Clients</h2>
        <span style={s.countBadge}>{clients.length}</span>
      </div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Filing status</th>
              <th style={s.th}>Tax year</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={s.trClickable} onClick={() => onSelect(c.id)}>
                <td style={s.tdBold}>{c.name}</td>
                <td style={s.td}>{c.email}</td>
                <td style={s.td}>{FILING_LABELS[c.filing_status] ?? c.filing_status}</td>
                <td style={s.td}>{c.tax_year}</td>
                <td style={s.td}>
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Client Detail View ---

type DetailTab = "profile" | "checklist" | "questions" | "files";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "checklist", label: "Checklist" },
  { id: "questions", label: "Questions" },
  { id: "files", label: "Files" },
];

function ClientDetail({
  client,
  readFile,
  listFiles,
  onBack,
}: {
  client: Client;
  readFile: CustomTabProps["readFile"];
  listFiles: CustomTabProps["listFiles"];
  onBack: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("profile");

  const profile = usePolledData<Record<string, any>>(
    readFile,
    `clients/${client.id}/profile.json`,
    {},
  );
  const reviewItems = usePolledData<ReviewItem[]>(
    readFile,
    `clients/${client.id}/review-items.json`,
    [],
  );

  const checklistItems = reviewItems.filter((r) => CHECKLIST_CATEGORIES.includes(r.category));
  const questionItems = reviewItems.filter((r) => QUESTION_CATEGORIES.includes(r.category));

  return (
    <div style={s.detailOuter}>
      {/* Fixed header */}
      <div style={s.detailFixedHeader}>
        <div style={s.detailHeader}>
          <button style={s.chevronBack} onClick={onBack} title="Back to all clients">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M10 12 6 8l4-4"/></svg>
          </button>
          <h2 style={s.heading}>{client.name}</h2>
          <StatusBadge status={client.status} />
        </div>
        {/* Tab bar */}
        <div style={s.tabBar}>
          {DETAIL_TABS.map((t) => {
            const isActive = tab === t.id;
            const count =
              t.id === "checklist" ? checklistItems.filter((i) => !i.resolved).length :
              t.id === "questions" ? questionItems.filter((i) => !i.resolved).length :
              undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  ...s.tabButton,
                  ...(isActive ? s.tabButtonActive : {}),
                }}
              >
                {t.label}
                {count !== undefined && count > 0 && (
                  <span style={s.tabCount}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={s.detailScrollArea}>
        <div style={s.detailContent}>
          {tab === "profile" && <ProfileSection profile={profile} />}
          {tab === "checklist" && <ChecklistSection items={checklistItems} />}
          {tab === "questions" && <QuestionsSection items={questionItems} />}
          {tab === "files" && <ClientFilesSection clientId={client.id} readFile={readFile} listFiles={listFiles} />}
        </div>
      </div>
    </div>
  );
}

// --- Profile Section ---

function ProfileSection({ profile }: { profile: Record<string, any> }) {
  const isEmpty = Object.keys(profile).length === 0;

  return (
    <Section>
      {isEmpty ? (
        <div style={s.sectionEmpty}>
          No profile yet. Emma will fill this in as she processes documents.
        </div>
      ) : (
        <div style={s.profileGrid}>
          <RenderFields data={profile} depth={0} />
        </div>
      )}
    </Section>
  );
}

function RenderFields({ data, depth }: { data: Record<string, any>; depth: number }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const label = formatKey(key);

        if (value === null || value === undefined) {
          return (
            <div key={key} style={s.fieldRow}>
              <span style={s.fieldLabel}>{label}</span>
              <span style={s.fieldValueMuted}>--</span>
            </div>
          );
        }

        if (typeof value === "boolean") {
          return (
            <div key={key} style={s.fieldRow}>
              <span style={s.fieldLabel}>{label}</span>
              <span style={s.fieldValue}>{value ? "Yes" : "No"}</span>
            </div>
          );
        }

        if (Array.isArray(value)) {
          if (value.length === 0) {
            return (
              <div key={key} style={s.fieldRow}>
                <span style={s.fieldLabel}>{label}</span>
                <span style={s.fieldValueMuted}>None</span>
              </div>
            );
          }
          return (
            <div key={key} style={s.nestedSection}>
              <span style={s.nestedLabel}>{label}</span>
              <div style={{ paddingLeft: "16px" }}>
                {value.map((item, i) =>
                  typeof item === "object" && item !== null ? (
                    <div key={i} style={s.nestedCard}>
                      <RenderFields data={item} depth={depth + 1} />
                    </div>
                  ) : (
                    <div key={i} style={s.fieldValue}>{formatValue(item)}</div>
                  ),
                )}
              </div>
            </div>
          );
        }

        if (typeof value === "object") {
          return (
            <div key={key} style={s.nestedSection}>
              <span style={s.nestedLabel}>{label}</span>
              <div style={{ paddingLeft: "16px" }}>
                <RenderFields data={value} depth={depth + 1} />
              </div>
            </div>
          );
        }

        return (
          <div key={key} style={s.fieldRow}>
            <span style={s.fieldLabel}>{label}</span>
            <span style={s.fieldValue}>{formatValue(value)}</span>
          </div>
        );
      })}
    </>
  );
}

// --- Checklist Section ---

function ChecklistSection({ items }: { items: ReviewItem[] }) {
  const resolved = items.filter((i) => i.resolved).length;
  const total = items.length;

  return (
    <Section>
      {total === 0 ? (
        <div style={s.sectionEmpty}>
          No checklist yet. Upload documents and ask Emma to process them.
        </div>
      ) : (
        <>
          <ProgressBar resolved={resolved} total={total} />
          <div style={s.itemList}>
            {items.map((item) => (
              <ChecklistRow key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function ProgressBar({ resolved, total }: { resolved: number; total: number }) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={s.progressLabel}>
        {resolved} of {total} documents received
      </div>
      <div style={s.progressTrack}>
        <div
          style={{
            ...s.progressFill,
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}

function ChecklistRow({ item }: { item: ReviewItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={s.itemCard}>
      <div style={s.itemRow} onClick={() => item.description && setExpanded(!expanded)}>
        <span style={item.resolved ? s.iconResolved : s.iconPending}>
          {item.resolved ? "\u2713" : "\u25CB"}
        </span>
        <span style={{ ...s.itemTitle, textDecoration: item.resolved ? "line-through" : "none", color: item.resolved ? "#9b9b9b" : "#0d0d0d" }}>
          {item.title}
        </span>
        <PriorityBadge priority={item.priority} />
        {item.description && (
          <span style={s.expandArrow}>{expanded ? "\u25B4" : "\u25BE"}</span>
        )}
      </div>
      {expanded && item.description && (
        <div style={s.itemDesc}>{item.description}</div>
      )}
    </div>
  );
}

// --- Questions Section ---

function QuestionsSection({ items }: { items: ReviewItem[] }) {
  const unresolved = items.filter((i) => !i.resolved).length;

  return (
    <Section>
      {items.length === 0 ? (
        <div style={s.sectionEmpty}>No questions yet.</div>
      ) : (
        <>
          <div style={s.questionCount}>
            {unresolved} question{unresolved !== 1 ? "s" : ""} to resolve
          </div>
          <div style={s.itemList}>
            {items.map((item) => (
              <QuestionRow key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function QuestionRow({ item }: { item: ReviewItem }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const categoryLabel = formatKey(item.category);

  return (
    <div style={s.itemCard}>
      <div style={s.itemRow} onClick={() => setExpanded(!expanded)}>
        <span style={s.categoryTag}>{categoryLabel}</span>
        <span style={{ ...s.itemTitle, color: item.resolved ? "#9b9b9b" : "#0d0d0d" }}>
          {item.title}
        </span>
        <PriorityBadge priority={item.priority} />
        <span style={s.expandArrow}>{expanded ? "\u25B4" : "\u25BE"}</span>
      </div>
      {expanded && (
        <div style={s.itemExpandedContent}>
          {item.description && <div style={s.itemDesc}>{item.description}</div>}
          {item.category === "client-request" && item.action && (
            <div style={s.emailBox}>
              <div style={s.emailBoxHeader}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#676767" }}>
                  Email draft
                </span>
                <button
                  style={s.copyButton}
                  onClick={(e) => { e.stopPropagation(); handleCopy(item.action!); }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre style={s.emailText}>{item.action}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Shared small components ---

function StatusBadge({ status }: { status: Client["status"] }) {
  const color = STATUS_COLORS[status] ?? { bg: "rgba(13,13,13,0.06)", text: "#424242" };
  return (
    <span
      style={{
        fontSize: "12px",
        padding: "2px 10px",
        borderRadius: "9999px",
        background: color.bg,
        color: color.text,
        fontWeight: 500,
        whiteSpace: "nowrap" as const,
      }}
    >
      {STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.low;
  return (
    <span
      style={{
        fontSize: "11px",
        padding: "1px 8px",
        borderRadius: "9999px",
        background: color.bg,
        color: color.text,
        fontWeight: 500,
        marginLeft: "auto",
      }}
    >
      {priority}
    </span>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div style={s.section}>{children}</div>;
}

// --- Helpers ---

function formatKey(key: string): string {
  return key
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: any): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// --- Client Files Section ---

function ClientFilesSection({
  clientId,
  readFile,
  listFiles,
}: {
  clientId: string;
  readFile: CustomTabProps["readFile"];
  listFiles: CustomTabProps["listFiles"];
}) {
  const [files, setFiles] = useState<Array<{ path: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => {
      listFiles()
        .then((all) => {
          if (!active) return;
          const prefix = `clients/${clientId}/`;
          const clientFiles = all
            .filter((f) => f.path.includes(prefix) && !f.name.startsWith("."))
            .map((f) => ({
              ...f,
              name: f.path.split(prefix).pop() || f.name,
            }));
          setFiles(clientFiles);
        })
        .catch(() => { if (active) setFiles([]); })
        .finally(() => { if (active) setLoading(false); });
    };
    load();
    const id = setInterval(load, 3000);
    return () => { active = false; clearInterval(id); };
  }, [clientId, listFiles]);

  if (loading) return <div style={s.sectionEmpty}>Loading files...</div>;

  if (files.length === 0) {
    return (
      <Section>
        <div style={s.sectionEmpty}>
          No files yet. Upload documents in the Emma chat using the attachment button.
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "2px" }}>
        {files.map((f) => (
          <div key={f.path} style={s.fileRow}>
            <span style={s.fileIcon}>📄</span>
            <span style={s.fileName}>{f.name}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px 28px",
    fontFamily: FONT,
    maxWidth: "860px",
  },

  // Detail layout — fixed header + scrollable body
  detailOuter: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    fontFamily: FONT,
  },
  detailFixedHeader: {
    flexShrink: 0,
    padding: "20px 28px 0",
    maxWidth: "860px",
  },
  detailScrollArea: {
    flex: 1,
    overflowY: "auto" as const,
    minHeight: 0,
  },
  detailContent: {
    padding: "20px 28px 40px",
    maxWidth: "860px",
  },

  // Tab bar
  tabBar: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid rgba(13,13,13,0.05)",
    marginTop: "16px",
  },
  tabButton: {
    padding: "10px 16px",
    fontSize: "13px",
    color: "#9b9b9b",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    marginBottom: "-1px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "color 0.15s",
    fontFamily: FONT,
  } as React.CSSProperties,
  tabButtonActive: {
    color: "#0d0d0d",
    fontWeight: 500,
    borderBottomColor: "#0d0d0d",
  },
  tabCount: {
    fontSize: "11px",
    background: "rgba(224,46,42,0.1)",
    color: "#e02e2a",
    padding: "1px 6px",
    borderRadius: "9999px",
    fontWeight: 600,
  },

  // File rows
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#424242",
    cursor: "default",
  },
  fileIcon: { fontSize: "14px", flexShrink: 0 },
  fileName: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: "300px",
    gap: "8px",
    fontFamily: FONT,
  },
  emptyTitle: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d" },
  emptyDesc: {
    fontSize: "14px",
    color: "#676767",
    maxWidth: "400px",
    textAlign: "center",
    lineHeight: 1.5,
  },

  // Header
  header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  heading: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d", letterSpacing: "-0.02em", margin: 0 },
  countBadge: {
    fontSize: "12px",
    background: "#ececec",
    padding: "2px 8px",
    borderRadius: "9999px",
    color: "#676767",
  },

  // Table
  tableWrap: { borderRadius: "12px", border: "1px solid rgba(13,13,13,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "14px" },
  th: {
    textAlign: "left" as const,
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#9b9b9b",
    borderBottom: "1px solid rgba(13,13,13,0.05)",
    background: "#f9f9f9",
  },
  trClickable: {
    borderBottom: "1px solid rgba(13,13,13,0.05)",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  td: { padding: "10px 14px", color: "#424242" },
  tdBold: { padding: "10px 14px", color: "#0d0d0d", fontWeight: 500 },

  // Detail header
  chevronBack: {
    background: "none",
    border: "none",
    color: "#9b9b9b",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "color 0.15s, background 0.15s",
    flexShrink: 0,
  },
  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // Section
  section: {
    padding: 0,
  },
  sectionEmpty: {
    fontSize: "13px",
    color: "#9b9b9b",
    lineHeight: 1.5,
  },

  // Profile
  profileGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  fieldRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    padding: "4px 0",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#9b9b9b",
    minWidth: "140px",
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: "13px",
    color: "#0d0d0d",
  },
  fieldValueMuted: {
    fontSize: "13px",
    color: "#cdcdcd",
  },
  nestedSection: {
    padding: "6px 0",
  },
  nestedLabel: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#424242",
    display: "block",
    marginBottom: "4px",
  },
  nestedCard: {
    padding: "8px 0",
    borderBottom: "1px solid rgba(13,13,13,0.05)",
  },

  // Progress
  progressLabel: {
    fontSize: "13px",
    color: "#676767",
    marginBottom: "6px",
  },
  progressTrack: {
    height: "6px",
    borderRadius: "3px",
    background: "#ececec",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    background: "#00a240",
    transition: "width 0.3s ease",
  },

  // Item list
  itemList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  itemCard: {
    borderRadius: "8px",
    border: "1px solid rgba(13,13,13,0.05)",
    overflow: "hidden",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: "13px",
  },
  itemTitle: {
    fontSize: "13px",
    fontWeight: 500,
  },
  itemDesc: {
    fontSize: "13px",
    color: "#676767",
    lineHeight: 1.5,
    padding: "0 12px 12px 34px",
  },
  itemExpandedContent: {
    padding: "0 0 4px 0",
  },
  expandArrow: {
    fontSize: "10px",
    color: "#9b9b9b",
    marginLeft: "4px",
    flexShrink: 0,
  },

  // Icons
  iconPending: {
    fontSize: "14px",
    color: "#cdcdcd",
    width: "18px",
    textAlign: "center" as const,
    flexShrink: 0,
  },
  iconResolved: {
    fontSize: "14px",
    color: "#00a240",
    fontWeight: 700,
    width: "18px",
    textAlign: "center" as const,
    flexShrink: 0,
  },

  // Category tag
  categoryTag: {
    fontSize: "11px",
    padding: "1px 8px",
    borderRadius: "9999px",
    background: "rgba(13,13,13,0.06)",
    color: "#676767",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },

  // Question count
  questionCount: {
    fontSize: "13px",
    color: "#676767",
    marginBottom: "12px",
  },

  // Email box
  emailBox: {
    margin: "8px 12px 12px 34px",
    borderRadius: "8px",
    border: "1px solid rgba(13,13,13,0.08)",
    background: "#f9f9f9",
    overflow: "hidden",
  },
  emailBoxHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderBottom: "1px solid rgba(13,13,13,0.05)",
  },
  copyButton: {
    fontSize: "12px",
    padding: "2px 10px",
    borderRadius: "9999px",
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#ffffff",
    color: "#424242",
    cursor: "pointer",
    fontFamily: FONT,
  },
  emailText: {
    fontSize: "13px",
    color: "#424242",
    lineHeight: 1.6,
    padding: "12px",
    margin: 0,
    whiteSpace: "pre-wrap" as const,
    fontFamily: FONT,
  },
};
