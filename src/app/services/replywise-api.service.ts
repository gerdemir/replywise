import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  GenerateRequest,
  GenerateResponse,
  RewriteRequest,
  RewriteResponse
} from '../models/replywise.models';

@Injectable({
  providedIn: 'root'
})
export class ReplywiseApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  public readonly demoMode = signal<boolean>(false);

  // Sample email for demo mode
  public readonly SAMPLE_EMAIL = `Subject: Meeting Request for Next Week

Hi there,

I hope this email finds you well. I wanted to reach out to discuss a potential collaboration opportunity between our companies. 

We've been following your work and are very impressed with what you've accomplished. We believe there's a great opportunity for us to work together on a new project that could benefit both parties.

Would you be available for a quick call next week? I'm flexible with timing and can work around your schedule. We're also open to discussing this via email if that's more convenient.

Looking forward to hearing from you!

Best regards,
John Smith
CEO, TechCorp`;

  // Sample response for demo mode
  private readonly SAMPLE_RESPONSE: GenerateResponse = {
    intent_summary: [
      'Requesting a meeting/call for next week',
      'Proposing a collaboration opportunity',
      'Asking about availability and preferred communication method'
    ],
    reply_drafts: [
      {
        style: 'short',
        subject: 'Re: Meeting Request for Next Week',
        body: `Hi John,

Thanks for reaching out! I'm interested in learning more about the collaboration opportunity.

I'm available next week. What times work best for you?

Best,
[Your name]`
      },
      {
        style: 'friendly',
        subject: 'Re: Meeting Request for Next Week',
        body: `Hi John,

Thanks for your email! I appreciate you reaching out about the potential collaboration.

I'd be happy to discuss this further. I'm available next week and can be flexible with timing. A call works great for me, but I'm also open to continuing via email if you prefer.

Could you let me know what times work best for you?

Looking forward to connecting!

Best regards,
[Your name]`
      },
      {
        style: 'formal',
        subject: 'Re: Meeting Request for Next Week',
        body: `Dear John,

Thank you for your email regarding the potential collaboration opportunity. I appreciate your interest in working together.

I would be pleased to discuss this matter further. I am available next week and can accommodate your schedule. I am open to either a phone call or continuing our correspondence via email, whichever is more convenient for you.

Please let me know your preferred date and time, and I will do my best to accommodate.

I look forward to our conversation.

Best regards,
[Your name]`
      }
    ],
    questions_to_ask: [
      'What specific aspects of the collaboration are you most interested in?',
      'What is the timeline for this project?',
      'What would be the expected commitment from both parties?',
      'Are there any specific deliverables or milestones we should discuss?'
    ],
    risk: {
      flags: {
        urgency: false,
        commitment: true,
        sensitive: false,
        financial: false
      },
      notes: [
        'This appears to be a business proposal that may require commitment',
        'No immediate urgency indicated, but follow-up is expected'
      ],
      confidence: 75
    }
  };

  constructor(private http: HttpClient) {}

  generate(request: GenerateRequest): Observable<GenerateResponse> {
    if (this.demoMode()) {
      // Simulate API delay in demo mode
      return of(this.SAMPLE_RESPONSE).pipe(delay(1500));
    }

    return this.http.post<GenerateResponse>(
      `${this.apiBaseUrl}/generate`,
      request
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only fallback to demo if demo mode is ON
        if (this.demoMode()) {
          console.warn('API call failed, using demo mode:', error);
          return of(this.SAMPLE_RESPONSE).pipe(delay(500));
        }
        // If demo mode is OFF, throw the error so user sees it
        console.error('API call failed:', error);
        return throwError(() => error);
      })
    );
  }

  rewrite(request: RewriteRequest): Observable<RewriteResponse> {
    if (this.demoMode()) {
      // Simple mock rewrite logic for demo
      let newBody = request.selectedDraftBody;
      
      if (request.action === 'shorter') {
        newBody = newBody.split('\n').slice(0, 3).join('\n') + '\n\nBest,\n[Your name]';
      } else if (request.action === 'more_formal') {
        newBody = newBody
          .replace(/Hi /g, 'Dear ')
          .replace(/Thanks/g, 'Thank you')
          .replace(/I'm/g, 'I am')
          .replace(/I'd/g, 'I would')
          .replace(/I've/g, 'I have')
          .replace(/can't/g, 'cannot')
          .replace(/don't/g, 'do not')
          .replace(/won't/g, 'will not');
      } else if (request.action === 'regenerate') {
        newBody = request.selectedDraftBody.split('').reverse().join('').substring(0, 100) + '... [Regenerated content]';
      }

      return of({
        subject: 'Re: Meeting Request for Next Week',
        body: newBody
      }).pipe(delay(800));
    }

    return this.http.post<RewriteResponse>(
      `${this.apiBaseUrl}/rewrite`,
      request
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only fallback to demo if demo mode is ON
        if (this.demoMode()) {
          console.warn('API call failed, using demo mode:', error);
          // Return a simple modified version
          return of({
            subject: 'Re: Meeting Request for Next Week',
            body: request.selectedDraftBody + '\n\n[Modified]'
          }).pipe(delay(300));
        }
        // If demo mode is OFF, throw the error
        console.error('API call failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get audio for reply text using ElevenLabs TTS
   */
  getReplyAudio(text: string): Observable<Blob> {
    if (this.demoMode()) {
      // Return empty blob for demo mode
      return of(new Blob()).pipe(delay(500));
    }

    return this.http.post(
      `${this.apiBaseUrl}/tts`,
      { text },
      { responseType: 'arraybuffer' }
    ).pipe(
      map((response: ArrayBuffer) => {
        // Convert ArrayBuffer to Blob
        return new Blob([response], { type: 'audio/mpeg' });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('TTS API call failed:', error);
        // Try to parse error message from response
        let errorMessage = 'Failed to load audio';
        if (error.error) {
          try {
            // If error.error is ArrayBuffer, convert to string
            if (error.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(error.error);
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorJson.message || errorMessage;
            } else if (typeof error.error === 'string') {
              const errorJson = JSON.parse(error.error);
              errorMessage = errorJson.error || errorJson.message || errorMessage;
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
