import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { EmailInputComponent } from './components/email-input/email-input.component';
import { IntentSummaryCardComponent } from './components/intent-summary-card/intent-summary-card.component';
import { RiskPanelComponent } from './components/risk-panel/risk-panel.component';
import { ReplyDraftsComponent } from './components/reply-drafts/reply-drafts.component';
import { QuestionsCardComponent } from './components/questions-card/questions-card.component';
import { ApprovalBarComponent } from './components/approval-bar/approval-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { VoicePanelComponent } from './components/voice-panel/voice-panel.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReplywiseApiService } from './services/replywise-api.service';
import { GenerateResponse, ReplyDraft } from './models/replywise.models';
import { fadeIn, slideIn } from './app.animations';

@Component({
  selector: 'app-root',
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
    FooterComponent,
    AboutPageComponent,
    VoicePanelComponent,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [fadeIn, slideIn]
})
export class App {
  // State
  emailText = signal<string>('');
  context = signal<string>('');
  loading = signal<boolean>(false);
  generateResponse = signal<GenerateResponse | null>(null);
  selectedDraftIndex = signal<number>(0);
  toEmail = signal<string>('');
  showAboutPage = signal<boolean>(false);

  // Computed
  hasResults = computed(() => this.generateResponse() !== null);
  currentDraft = computed(() => {
    const response = this.generateResponse();
    if (!response) return null;
    return response.reply_drafts[this.selectedDraftIndex()];
  });

  constructor(public apiService: ReplywiseApiService, private snackBar: MatSnackBar) {}

  get demoMode(): boolean {
    return this.apiService.demoMode();
  }

  onDemoModeChange(enabled: boolean): void {
    this.apiService.demoMode.set(enabled);
  }

  onEmailTextChange(text: string): void {
    this.emailText.set(text);
  }

  onContextChange(text: string): void {
    this.context.set(text);
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
  }

  onEdit(): void {
    // Switch to the reply drafts tab to allow editing
    this.selectedDraftIndex.set(0);
    // Could also scroll to the drafts section or show a message
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
  }
}
