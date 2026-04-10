import { jsx as e, jsxs as n } from "react/jsx-runtime";
import { useState as a, useEffect as x } from "react";
const h = {
  intake: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  documents_pending: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  in_review: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
  filed: { bg: "rgba(0,162,64,0.1)", text: "#00a240" },
  completed: { bg: "rgba(13,13,13,0.06)", text: "#424242" }
}, b = {
  single: "Single",
  married_joint: "Married (Joint)",
  married_separate: "Married (Separate)",
  head_of_household: "Head of Household"
};
function S(s) {
  const [r, o] = a([]), [c, p] = a(null), [d, y] = a(!0);
  return x(() => {
    s.readFile(".houston/data/clients.json").then((l) => o(JSON.parse(l))).catch(() => o([])).finally(() => y(!1));
  }, []), d ? /* @__PURE__ */ e("div", { style: i.empty, children: "Loading..." }) : r.length === 0 ? /* @__PURE__ */ n("div", { style: i.empty, children: [
    /* @__PURE__ */ e("div", { style: i.emptyTitle, children: "No clients yet" }),
    /* @__PURE__ */ e("div", { style: i.emptyDesc, children: 'Ask your agent to add some. Try: "Add a new client John Smith, john@example.com, filing single for tax year 2025"' })
  ] }) : /* @__PURE__ */ n("div", { style: i.container, children: [
    /* @__PURE__ */ n("div", { style: i.header, children: [
      /* @__PURE__ */ e("h2", { style: i.title, children: "Clients" }),
      /* @__PURE__ */ e("span", { style: i.count, children: r.length })
    ] }),
    /* @__PURE__ */ e("div", { style: i.tableWrap, children: /* @__PURE__ */ n("table", { style: i.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { style: i.th, children: "Name" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "Email" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "Filing status" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "Tax year" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "Status" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: r.map((l) => /* @__PURE__ */ n("tr", { style: i.tr, children: [
        /* @__PURE__ */ e("td", { style: i.tdBold, children: l.name }),
        /* @__PURE__ */ e("td", { style: i.td, children: l.email }),
        /* @__PURE__ */ e("td", { style: i.td, children: b[l.filing_status] }),
        /* @__PURE__ */ e("td", { style: i.td, children: l.tax_year }),
        /* @__PURE__ */ e("td", { style: i.td, children: /* @__PURE__ */ e(
          "span",
          {
            style: {
              ...i.badge,
              background: h[l.status].bg,
              color: h[l.status].text
            },
            children: l.status.replace(/_/g, " ")
          }
        ) })
      ] }, l.id)) })
    ] }) })
  ] });
}
const i = {
  container: { padding: "24px 28px", fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif' },
  header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  title: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d", letterSpacing: "-0.02em" },
  count: { fontSize: "12px", background: "#ececec", padding: "2px 8px", borderRadius: "9999px", color: "#676767" },
  tableWrap: { borderRadius: "12px", border: "1px solid rgba(13,13,13,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "#9b9b9b", borderBottom: "1px solid rgba(13,13,13,0.05)", background: "#f9f9f9" },
  tr: { borderBottom: "1px solid rgba(13,13,13,0.05)" },
  td: { padding: "10px 14px", color: "#424242" },
  tdBold: { padding: "10px 14px", color: "#0d0d0d", fontWeight: 500 },
  badge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px", textTransform: "capitalize" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", gap: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d" },
  emptyDesc: { fontSize: "14px", color: "#676767", maxWidth: "400px", textAlign: "center", lineHeight: 1.5 }
}, g = {
  pending: { bg: "rgba(224,172,0,0.1)", text: "#b8860b" },
  received: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  reviewed: { bg: "rgba(168,85,247,0.1)", text: "#a855f7" },
  filed: { bg: "rgba(0,162,64,0.1)", text: "#00a240" }
}, f = {
  W2: "W-2",
  1099: "1099",
  1040: "1040",
  receipt: "Receipt",
  statement: "Statement",
  other: "Other"
};
function v(s) {
  const [r, o] = a([]), [c, p] = a(!0);
  return x(() => {
    s.readFile(".houston/data/documents.json").then((d) => o(JSON.parse(d))).catch(() => o([])).finally(() => p(!1));
  }, []), c ? /* @__PURE__ */ e("div", { style: t.empty, children: "Loading..." }) : r.length === 0 ? /* @__PURE__ */ n("div", { style: t.empty, children: [
    /* @__PURE__ */ e("div", { style: t.emptyTitle, children: "No documents yet" }),
    /* @__PURE__ */ e("div", { style: t.emptyDesc, children: 'Ask your agent to track documents. Try: "Add a W-2 from Acme Corp for client John Smith"' })
  ] }) : /* @__PURE__ */ n("div", { style: t.container, children: [
    /* @__PURE__ */ n("div", { style: t.header, children: [
      /* @__PURE__ */ e("h2", { style: t.title, children: "Documents" }),
      /* @__PURE__ */ e("span", { style: t.count, children: r.length })
    ] }),
    /* @__PURE__ */ e("div", { style: t.tableWrap, children: /* @__PURE__ */ n("table", { style: t.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { style: t.th, children: "Name" }),
        /* @__PURE__ */ e("th", { style: t.th, children: "Type" }),
        /* @__PURE__ */ e("th", { style: t.th, children: "Client" }),
        /* @__PURE__ */ e("th", { style: t.th, children: "Status" }),
        /* @__PURE__ */ e("th", { style: t.th, children: "Notes" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: r.map((d) => /* @__PURE__ */ n("tr", { style: t.tr, children: [
        /* @__PURE__ */ e("td", { style: t.tdBold, children: d.name }),
        /* @__PURE__ */ e("td", { style: t.td, children: /* @__PURE__ */ e("span", { style: t.typeBadge, children: f[d.type] }) }),
        /* @__PURE__ */ e("td", { style: t.td, children: d.client_id }),
        /* @__PURE__ */ e("td", { style: t.td, children: /* @__PURE__ */ e(
          "span",
          {
            style: {
              ...t.badge,
              background: g[d.status].bg,
              color: g[d.status].text
            },
            children: d.status
          }
        ) }),
        /* @__PURE__ */ e("td", { style: t.tdMuted, children: d.notes || "" })
      ] }, d.id)) })
    ] }) })
  ] });
}
const t = {
  container: { padding: "24px 28px", fontFamily: 'ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif' },
  header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  title: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d", letterSpacing: "-0.02em" },
  count: { fontSize: "12px", background: "#ececec", padding: "2px 8px", borderRadius: "9999px", color: "#676767" },
  tableWrap: { borderRadius: "12px", border: "1px solid rgba(13,13,13,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "#9b9b9b", borderBottom: "1px solid rgba(13,13,13,0.05)", background: "#f9f9f9" },
  tr: { borderBottom: "1px solid rgba(13,13,13,0.05)" },
  td: { padding: "10px 14px", color: "#424242" },
  tdBold: { padding: "10px 14px", color: "#0d0d0d", fontWeight: 500 },
  tdMuted: { padding: "10px 14px", color: "#9b9b9b", fontSize: "13px" },
  badge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px" },
  typeBadge: { fontSize: "12px", padding: "2px 10px", borderRadius: "9999px", background: "rgba(13,13,13,0.06)", color: "#424242" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", gap: "8px" },
  emptyTitle: { fontSize: "18px", fontWeight: 600, color: "#0d0d0d" },
  emptyDesc: { fontSize: "14px", color: "#676767", maxWidth: "400px", textAlign: "center", lineHeight: 1.5 }
};
export {
  S as ClientsTab,
  v as DocumentsTab
};
