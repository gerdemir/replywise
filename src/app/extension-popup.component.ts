import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { EmailInputComponent } from './components/email-input/email-input.component';
import { IntentSummaryCardComponent } from './components/intent-summary-card/intent-summary-card.component';
import { RiskPanelComponent } from './components/risk-panel/risk-panel.component';
import { ReplyDraftsComponent } from './components/reply-drafts/reply-drafts.component';
import { QuestionsCardComponent } from './components/questions-card/questions-card.component';
import { ApprovalBarComponent } from './components/approval-bar/approval-bar.component';
import { VoicePanelComponent } from './components/voice-panel/voice-panel.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReplywiseApiService } from './services/replywise-api.service';
import { GenerateResponse, ReplyDraft } from './models/replywise.models';
import { fadeIn, slideIn } from './app.animations';

@Component({
  selector: 'app-extension-popup',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    EmailInputComponent,
    IntentSummaryCardComponent,
    RiskPanelComponent,
    ReplyDraftsComponent,
    QuestionsCardComponent,
    ApprovalBarComponent,
    VoicePanelComponent,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="extension-container">
      <app-header
        [demoMode]="demoMode()"
        (demoModeChange)="onDemoModeChange($event)">
      </app-header>

      <div class="extension-content">
        <app-email-input
          [emailText]="emailText()"
          [context]="context()"
          [loading]="loading()"
          [demoMode]="demoMode()"
          [sampleEmail]="apiService.SAMPLE_EMAIL"
          (emailTextChange)="onEmailTextChange($event)"
          (contextChange)="onContextChange($event)"
          (generateClick)="onGenerate()"
          (loadSampleClick)="onLoadSample()">
        </app-email-input>

        @if (loading() && !hasResults()) {
          <mat-card class="loading-card" @fadeIn>
            <mat-card-content>
              <div class="skeleton-loader">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text-short"></div>
              </div>
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            </mat-card-content>
          </mat-card>
        }

        @if (hasResults()) {
          <div class="results-section" @fadeIn>
            <app-intent-summary-card
              [intentSummary]="generateResponse()!.intent_summary">
            </app-intent-summary-card>

            <app-reply-drafts
              [replyDrafts]="generateResponse()!.reply_drafts"
              [originalEmail]="emailText()"
              [context]="context()"
              [loading]="loading()"
              (rewriteRequest)="onRewriteRequest($event)"
              (draftUpdate)="onDraftUpdate($event)"
              (selectedTabChange)="onTabChange($event)">
            </app-reply-drafts>

            <app-voice-panel
              [draftText]="currentDraft()?.body || ''"
              (approve)="onApprove()"
              (edit)="onEdit()"
              (reject)="onReject()">
            </app-voice-panel>

            <app-questions-card
              [questions]="generateResponse()!.questions_to_ask"
              [selectedDraftBody]="currentDraft()?.body || ''"
              (questionsInserted)="onQuestionsInserted($event)">
            </app-questions-card>

            <app-risk-panel
              [risk]="generateResponse()!.risk">
            </app-risk-panel>

            <app-approval-bar
              [subject]="currentDraft()?.subject || ''"
              [body]="currentDraft()?.body || ''"
              [toEmail]="toEmail()"
              (toEmailChange)="onToEmailChange($event)"
              (approveClick)="onApprove()"
              (copyClick)="onCopy()">
            </app-approval-bar>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .extension-container {
      width: 600px;
      max-height: 800px;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f9fafb;
    }

    .extension-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
    }

    .loading-card {
      margin-top: 16px;
    }

    .skeleton-loader {
      padding: 1.5rem;
    }

    .skeleton-line {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s ease-in-out infinite;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .skeleton-title {
      height: 24px;
      width: 60%;
    }

    .skeleton-text {
      height: 16px;
      width: 100%;
    }

    .skeleton-text-short {
      height: 16px;
      width: 80%;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .results-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    mat-card {
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Scrollbar styling */
    .extension-content::-webkit-scrollbar {
      width: 8px;
    }

    .extension-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .extension-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .extension-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `],
  animations: [fadeIn, slideIn]
})
export class ExtensionPopupComponent {
  // State
  emailText = signal<string>('');
  context = signal<string>('');
  loading = signal<boolean>(false);
  generateResponse = signal<GenerateResponse | null>(null);
  selectedDraftIndex = signal<number>(0);
  toEmail = signal<string>('');
  demoMode = signal<boolean>(false);

  // Computed
  hasResults = computed(() => this.generateResponse() !== null);
  currentDraft = computed(() => {
    const response = this.generateResponse();
    if (!response) return null;
    return response.reply_drafts[this.selectedDraftIndex()];
  });

  constructor(
    public apiService: ReplywiseApiService,
    private snackBar: MatSnackBar
  ) {
    // Load email from chrome storage if available
    this.loadEmailFromStorage();
  }

  get demoModeValue(): boolean {
    return this.demoMode();
  }

  onDemoModeChange(enabled: boolean): void {
    this.demoMode.set(enabled);
    this.apiService.demoMode.set(enabled);
  }

  private loadEmailFromStorage(): void {
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage) {
      (window as any).chrome.storage.local.get(['selectedEmail', 'lastEmail', 'lastContext'], (result: any) => {
        if (result.selectedEmail) {
          this.emailText.set(result.selectedEmail);
        } else if (result.lastEmail) {
          this.emailText.set(result.lastEmail);
        }
        if (result.lastContext) {
          this.context.set(result.lastContext);
        }
      });
    }
  }

  onEmailTextChange(text: string): void {
    this.emailText.set(text);
    // Save to chrome storage
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage) {
      (window as any).chrome.storage.local.set({ lastEmail: text });
    }
  }

  onContextChange(text: string): void {
    this.context.set(text);
    // Save to chrome storage
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage) {
      (window as any).chrome.storage.local.set({ lastContext: text });
    }
  }

  onLoadSample(): void {
    this.emailText.set(this.apiService.SAMPLE_EMAIL);
  }

  onGenerate(): void {
    if (!this.emailText()) return;

    this.loading.set(true);
    this.apiService.generate({
      emailText: this.emailText(),
      context: this.context()
    }).subscribe({
      next: (response) => {
        this.generateResponse.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Generate error:', error);
        this.loading.set(false);
        const errorMessage = error?.error?.message || error?.message || 'Failed to connect to backend. Make sure the API server is running on port 8080.';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onDraftUpdate(event: { index: number; draft: ReplyDraft }): void {
    const response = this.generateResponse();
    if (!response) return;

    const updatedDrafts = [...response.reply_drafts];
    updatedDrafts[event.index] = event.draft;
    
    this.generateResponse.set({
      ...response,
      reply_drafts: updatedDrafts
    });
  }

  onTabChange(index: number): void {
    this.selectedDraftIndex.set(index);
  }

  onRewriteRequest(event: { action: 'shorter' | 'more_formal' | 'regenerate'; draftIndex: number }): void {
    const response = this.generateResponse();
    if (!response) return;

    const draft = response.reply_drafts[event.draftIndex];
    this.loading.set(true);

    this.apiService.rewrite({
      action: event.action,
      selectedDraftBody: draft.body,
      originalEmail: this.emailText(),
      context: this.context()
    }).subscribe({
      next: (rewriteResponse) => {
        const updatedDrafts = [...response.reply_drafts];
        updatedDrafts[event.draftIndex] = {
          ...draft,
          subject: rewriteResponse.subject,
          body: rewriteResponse.body
        };

        this.generateResponse.set({
          ...response,
          reply_drafts: updatedDrafts
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Rewrite error:', error);
        this.loading.set(false);
        const errorMessage = error?.error?.message || error?.message || 'Failed to rewrite. Make sure the API server is running.';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onQuestionsInserted(questions: string[]): void {
    const response = this.generateResponse();
    if (!response) return;

    const draftIndex = this.selectedDraftIndex();
    const draft = response.reply_drafts[draftIndex];
    const questionsText = '\n\nQuestions:\n' + questions.map(q => `- ${q}`).join('\n');
    
    const updatedDrafts = [...response.reply_drafts];
    updatedDrafts[draftIndex] = {
      ...draft,
      body: draft.body + questionsText
    };

    this.generateResponse.set({
      ...response,
      reply_drafts: updatedDrafts
    });
  }

  onToEmailChange(email: string): void {
    this.toEmail.set(email);
  }

  onApprove(): void {
    // Handled by ApprovalBarComponent
    this.snackBar.open('Opening Gmail compose...', 'Close', {
      duration: 2000
    });
  }

  onEdit(): void {
    // Switch to the reply drafts tab to allow editing
    this.selectedDraftIndex.set(0);
    this.snackBar.open('You can now edit the reply in the drafts section above.', 'Got it', {
      duration: 3000
    });
  }

  onReject(): void {
    // Reset the results and go back to input
    this.generateResponse.set(null);
    this.emailText.set('');
    this.context.set('');
    this.selectedDraftIndex.set(0);
    this.snackBar.open('Reply rejected. You can generate a new response.', 'Got it', {
      duration: 3000
    });
  }

  onCopy(): void {
    // Handled by ApprovalBarComponent
    this.snackBar.open('Reply copied to clipboard!', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
