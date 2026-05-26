export interface LegalDocumentSection {
  heading: string;
  content?: string;
  bullets?: (string | { label: string; value: string })[];
}

export interface LegalDocumentItem {
  title: string;
  content?: string;
  subcontent?: string;
  bulletTop?: string;
  bullets?: (string | { label: string; value: string })[];
  sections?: LegalDocumentSection[];
}
