export interface GenerateRequest {
  emailText: string;
  context?: string;
}

export interface RiskFlags {
  urgency: boolean;
  commitment: boolean;
  sensitive: boolean;
  financial: boolean;
}

export interface Risk {
  flags: RiskFlags;
  notes: string[];
  confidence: number; // 0-100
}

export interface ReplyDraft {
  style: 'short' | 'friendly' | 'formal';
  subject: string;
  body: string;
}

export interface GenerateResponse {
  intent_summary: string[];
  reply_drafts: ReplyDraft[];
  questions_to_ask: string[];
  risk: Risk;
}

export interface RewriteRequest {
  action: 'shorter' | 'more_formal' | 'regenerate';
  selectedDraftBody: string;
  originalEmail: string;
  context?: string;
}

export interface RewriteResponse {
  subject: string;
  body: string;
}
