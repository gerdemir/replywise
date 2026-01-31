import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

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
    RouterModule, // ⭐ required for ActivatedRoute

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
export class App implements OnInit {

  /////////////////////////////////////////////////
  // STATE
  /////////////////////////////////////////////////

  emailText = signal<string>('');
  context = signal<string>('');
  loading = signal<boolean>(false);
  generateResponse = signal<GenerateResponse | null>(null);
  selectedDraftIndex = signal<number>(0);
  toEmail = signal<string>('');
  showAboutPage = signal<boolean>(false);

  /////////////////////////////////////////////////
  // COMPUTED
  /////////////////////////////////////////////////

  hasResults = computed(() => this.generateResponse() !== null);

  currentDraft = computed(() => {
    const response = this.generateResponse();
    if (!response) return null;
    return response.reply_drafts[this.selectedDraftIndex()];
  });

  /////////////////////////////////////////////////
  // CONSTRUCTOR
  /////////////////////////////////////////////////

  constructor(
    public apiService: ReplywiseApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  /////////////////////////////////////////////////
  // AUTO-FILL EMAIL FROM GMAIL (?email=)
  /////////////////////////////////////////////////

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        const decoded = decodeURIComponent(params['email']);
        this.emailText.set(decoded);
        console.log('Email loaded from Gmail:', decoded.slice(0, 50));
      }
    });
  }

  /////////////////////////////////////////////////
  // UI HANDLERS (UNCHANGED LOGIC)
  /////////////////////////////////////////////////

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

  /////////////////////////////////////////////////
  // GENERATE
  /////////////////////////////////////////////////

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
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to connect to backend', 'Close', {
          duration: 4000
        });
      }
    });
  }

  /////////////////////////////////////////////////
  // DRAFT UPDATE
  /////////////////////////////////////////////////

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

  /////////////////////////////////////////////////
  // REWRITE
  /////////////////////////////////////////////////

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
      error: () => {
        this.loading.set(false);
      }
    });
  }

  /////////////////////////////////////////////////
  // QUESTIONS
  /////////////////////////////////////////////////

  onQuestionsInserted(questions: string[]): void {
    const response = this.generateResponse();
    if (!response) return;

    const draftIndex = this.selectedDraftIndex();
    const draft = response.reply_drafts[draftIndex];

    const questionsText =
      '\n\nQuestions:\n' + questions.map(q => `- ${q}`).join('\n');

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

  /////////////////////////////////////////////////
  // EMAIL + COPY (required by template)
  /////////////////////////////////////////////////

  onToEmailChange(email: string): void {
    this.toEmail.set(email);
  }

  onCopy(): void {
    const draft = this.currentDraft();
    if (!draft) return;

    navigator.clipboard.writeText(draft.body);
    this.snackBar.open('Copied!', 'OK', { duration: 1500 });
  }

  /////////////////////////////////////////////////
  // APPROVAL ACTIONS
  /////////////////////////////////////////////////

  onApprove(): void {}

  onEdit(): void {
    this.selectedDraftIndex.set(0);
  }

  onReject(): void {
    this.generateResponse.set(null);
    this.emailText.set('');
    this.context.set('');
    this.selectedDraftIndex.set(0);
  }
}
