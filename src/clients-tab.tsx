import { useState, useEffect } from "react";
import type { CustomTabProps, Client } from "./types";

const STATUS_COLORS: Record<Client["status"], { bg: string; text: string }> = {
  intake: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  documents_pending: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  in_review: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
  filed: { bg: "rgba(0,162,64,0.1)", text: "#00a240" },
  completed: { bg: "rgba(13,13,13,0.06)", text: "#424242" },
};

const FILING_LABELS: Record<Client["filing_status"], string> = {
  single: "Single",
  married_joint: "Married (Joint)",
  married_separate: "Married (Separate)",
  head_of_household: "Head of Household",
};

export function ClientsTab(props: CustomTabProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .readFile(".houston/data/clients.json")
      .then((data) => setClients(JSON.parse(data)))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={styles.empty}>Loading...</div>;
  }

  if (clients.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyTitle}>No clients yet</div>
        <div style={styles.emptyDesc}>
          Ask your agent to add some. Try: "Add a new client John Smith,
          john@example.com, filing single for tax year 2025"
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Clients</h2>
        <span style={styles.count}>{clients.length}</span>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Filing status</th>
              <th style={styles.th}>Tax year</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={styles.tr}>
                <td style={styles.tdBold}>{c.name}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{FILING_LABELS[c.filing_status]}</td>
                <td style={styles.td}>{c.tax_year}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: STATUS_COLORS[c.status].bg,
                      color: STATUS_COLORS[c.status].text,
                    }}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>
                </td>
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
  badge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px", textTransform: "capitalize" as const },
  empty: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", gap: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d" },
  emptyDesc: { fontSize: "14px", color: "#676767", maxWidth: "400px", textAlign: "center" as const, lineHeight: 1.5 },
};
