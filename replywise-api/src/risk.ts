/**
 * Lightweight risk heuristics to detect potential issues in emails
 */

const URGENCY_KEYWORDS = ['urgent', 'asap', 'immediately', 'right away', 'hurry', 'deadline', 'expires'];
const COMMITMENT_KEYWORDS = ['commit', 'promise', 'guarantee', 'agree', 'contract', 'sign', 'approve'];
const SENSITIVE_KEYWORDS = ['confidential', 'private', 'secret', 'classified', 'nda', 'non-disclosure'];
const FINANCIAL_KEYWORDS = ['wire', 'transfer', 'payment', 'invoice', 'bank', 'account', 'credit card', 'gift card', 'refund', 'money', 'dollar', '$'];
const PHISHING_KEYWORDS = ['click', 'verify', 'update', 'suspended', 'locked', 'expired', 'action required', 'urgent action'];

export interface RiskFlags {
  urgency: boolean;
  commitment: boolean;
  sensitive: boolean;
  financial: boolean;
  phishing: boolean;
}

export interface RiskAnalysis {
  flags: string[];
  notes: string[];
  confidence: number; // 0-1
}

export function analyzeRisk(emailText: string): RiskAnalysis {
  const lowerText = emailText.toLowerCase();
  const flags: RiskFlags = {
    urgency: URGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword)),
    commitment: COMMITMENT_KEYWORDS.some(keyword => lowerText.includes(keyword)),
    sensitive: SENSITIVE_KEYWORDS.some(keyword => lowerText.includes(keyword)),
    financial: FINANCIAL_KEYWORDS.some(keyword => lowerText.includes(keyword)),
    phishing: PHISHING_KEYWORDS.some(keyword => lowerText.includes(keyword))
  };

  const flagList: string[] = [];
  const notes: string[] = [];
  let riskScore = 0;

  if (flags.urgency) {
    flagList.push('urgency');
    notes.push('Email contains urgency indicators');
    riskScore += 0.2;
  }

  if (flags.commitment) {
    flagList.push('commitment');
    notes.push('Email may require commitments or agreements');
    riskScore += 0.2;
  }

  if (flags.sensitive) {
    flagList.push('sensitive');
    notes.push('Email contains sensitive information markers');
    riskScore += 0.15;
  }

  if (flags.financial) {
    flagList.push('financial');
    notes.push('Email mentions financial transactions or requests');
    riskScore += 0.3;
  }

  if (flags.phishing) {
    flagList.push('phishing');
    notes.push('Email contains potential phishing indicators');
    riskScore += 0.35;
  }

  // Check for suspicious patterns
  if (lowerText.includes('attachment') && flags.financial) {
    notes.push('Warning: Financial request with attachment - verify sender');
    riskScore += 0.1;
  }

  if (lowerText.includes('link') || lowerText.includes('http')) {
    notes.push('Email contains links - verify before clicking');
  }

  // Normalize confidence to 0-1 range
  const confidence = Math.min(riskScore, 1);

  return {
    flags: flagList,
    notes,
    confidence
  };
}
