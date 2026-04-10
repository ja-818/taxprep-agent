export interface Client {
  id: string;
  name: string;
  email: string;
  filing_status: "single" | "married_joint" | "married_separate" | "head_of_household";
  status: "intake" | "documents_pending" | "in_review" | "filed" | "completed";
  tax_year: number;
}

export interface ReviewItem {
  id: string;
  category:
    | "checklist-item"
    | "missing-document"
    | "carryover"
    | "needs-info"
    | "discrepancy"
    | "client-request"
    | "informational";
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  resolved: boolean;
  action?: string | null;
}

export interface CustomTabProps {
  agent: { id: string; name: string; path: string; folderPath: string };
  agentDef: { config: any; source: string; bundleUrl?: string };
  readFile: (name: string) => Promise<string>;
  writeFile: (name: string, content: string) => Promise<void>;
  listFiles: () => Promise<Array<{ path: string; name: string }>>;
}
