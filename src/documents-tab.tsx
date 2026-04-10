import { useState, useEffect } from "react";
import type { CustomTabProps, TaxDocument } from "./types";

const STATUS_COLORS: Record<TaxDocument["status"], { bg: string; text: string }> = {
  pending: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  received: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  reviewed: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
  filed: { bg: "rgba(0,162,64,0.1)", text: "#00a240" },
};

const TYPE_LABELS: Record<TaxDocument["type"], string> = {
  W2: "W-2",
  "1099": "1099",
  "1040": "1040",
  receipt: "Receipt",
  statement: "Statement",
  other: "Other",
};

export function DocumentsTab(props: CustomTabProps) {
  const [docs, setDocs] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .readFile(".houston/data/documents.json")
      .then((data) => setDocs(JSON.parse(data)))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={styles.empty}>Loading...</div>;
  }

  if (docs.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyTitle}>No documents yet</div>
        <div style={styles.emptyDesc}>
          Ask your agent to track documents. Try: "Add a W-2 from Acme Corp
          for client John Smith"
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Documents</h2>
        <span style={styles.count}>{docs.length}</span>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} style={styles.tr}>
                <td style={styles.tdBold}>{d.name}</td>
                <td style={styles.td}>
                  <span style={styles.typeBadge}>{TYPE_LABELS[d.type]}</span>
                </td>
                <td style={styles.td}>{d.client_id}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: STATUS_COLORS[d.status].bg,
                      color: STATUS_COLORS[d.status].text,
                    }}
                  >
                    {d.status}
                  </span>
                </td>
                <td style={styles.tdMuted}>{d.notes || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "24px 28px", fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif' },
  header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  title: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d", letterSpacing: "-0.02em" },
  count: { fontSize: "12px", background: "#ececec", padding: "2px 8px", borderRadius: "9999px", color: "#676767" },
  tableWrap: { borderRadius: "12px", border: "1px solid rgba(13,13,13,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { textAlign: "left" as const, padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "#9b9b9b", borderBottom: "1px solid rgba(13,13,13,0.05)", background: "#f9f9f9" },
  tr: { borderBottom: "1px solid rgba(13,13,13,0.05)" },
  td: { padding: "10px 14px", color: "#424242" },
  tdBold: { padding: "10px 14px", color: "#0d0d0d", fontWeight: 500 },
  tdMuted: { padding: "10px 14px", color: "#9b9b9b", fontSize: "13px" },
  badge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px" },
  typeBadge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px", background: "rgba(13,13,13,0.06)", color: "#424242" },
  empty: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", gap: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d" },
  emptyDesc: { fontSize: "14px", color: "#676767", maxWidth: "400px", textAlign: "center" as const, lineHeight: 1.5 },
};
