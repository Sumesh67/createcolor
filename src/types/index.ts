export type UserRole = "CHILD" | "PARENT";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColoringPage {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  editHistory: EditHistoryItem[];
  tags: string[];
  isPublic: boolean;
  remixCount: number;
  createdAt: Date;
}

export interface EditHistoryItem {
  id: string;
  editMode: EditMode;
  editText: string;
  imageUrl: string;
  timestamp: Date;
}

export type EditMode = "tweak" | "add" | "remove" | "replace";

export interface Gallery {
  id: string;
  userId: string;
  name: string;
  pages: ColoringPage[];
  createdAt: Date;
}

export interface PrintJob {
  id: string;
  userId: string;
  pageId: string;
  layout: PrintLayout;
  pdfUrl: string;
  qrCode: string;
  status: PrintStatus;
  createdAt: Date;
}

export type PrintLayout = "single" | "double" | "quad" | "mini";

export type PrintStatus = "pending" | "processing" | "completed" | "failed";

export interface SlotSelections {
  who: string;
  doing: string;
  where: string;
}

export interface GenerateRequest {
  slotSelections?: SlotSelections;
  customPrompt?: string;
  imageFile?: File;
}

export interface GenerateResponse {
  imageUrl: string;
  pageId: string;
  prompt: string;
}

export interface EditRequest {
  pageId: string;
  editMode: EditMode;
  editText: string;
}

export interface EditResponse {
  newImageUrl: string;
  editId: string;
}

export interface PrintRequest {
  pageId: string;
  layout: PrintLayout;
}

export interface PrintResponse {
  pdfUrl: string;
  qrCodeUrl: string;
}

export interface PartyPackRequest {
  theme: string;
  count: number;
  layout: PrintLayout;
  childName?: string;
}

export interface PartyPackResponse {
  pdfUrl: string;
  pageUrls: string[];
  pageCount: number;
}

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
}
