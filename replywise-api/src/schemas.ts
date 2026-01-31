import { z } from 'zod';

export const GenerateRequestSchema = z.object({
  emailText: z.string().min(1, 'Email text is required'),
  context: z.string().optional()
});

export const RewriteRequestSchema = z.object({
  action: z.enum(['shorter', 'more_formal', 'regenerate']),
  selectedDraftBody: z.string().min(1, 'Draft body is required'),
  originalEmail: z.string().min(1, 'Original email is required'),
  context: z.string().optional()
});

export const ReplyDraftSchema = z.object({
  style: z.enum(['short', 'friendly', 'formal']),
  subject: z.string(),
  body: z.string()
});

export const RiskFlagsSchema = z.object({
  urgency: z.boolean(),
  commitment: z.boolean(),
  sensitive: z.boolean(),
  financial: z.boolean()
});

export const GenerateResponseSchema = z.object({
  intent_summary: z.array(z.string()).min(2).max(5),
  reply_drafts: z.array(ReplyDraftSchema).length(3),
  questions_to_ask: z.array(z.string()).min(2).max(6),
  risk: z.object({
    flags: RiskFlagsSchema,
    notes: z.array(z.string()),
    confidence: z.number().min(0).max(100)
  })
});

export const RewriteResponseSchema = z.object({
  subject: z.string().optional(),
  body: z.string()
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type RewriteRequest = z.infer<typeof RewriteRequestSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;
export type ReplyDraft = z.infer<typeof ReplyDraftSchema>;
