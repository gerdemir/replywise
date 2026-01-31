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
    RouterModule, // ⭐ CRITICAL FIX (prevents white screen)

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
  // State
  /////////////////////////////////////////////////

  emailText = signal<string>('');
  context = signal<string>('');
  loading = signal<boolean>(false);
  generateResponse = signal<GenerateResponse | null>(null);
  selectedDraftIndex = signal<number>(0);
  toEmail = signal<string>('');
  showAboutPage = signal<boolean>(false);

  /////////////////////////////////////////////////
  // Computed
  /////////////////////////////////////////////////

  hasResults = computed(() => this.generateResponse() !== null);

  currentDraft = computed(() => {
    const response = this.generateResponse();
    if (!response) return null;
    return response.reply_drafts[this.selectedDraftIndex()];
  });

  /////////////////////////////////////////////////
  // Constructor
  /////////////////////////////////////////////////

  constructor(
    public apiService: ReplywiseApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  /////////////////////////////////////////////////
  // 🔥 AUTO-FILL EMAIL FROM URL (Gmail integration)
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
  // Existing logic (UNCHANGED)
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
        this.loading.set(false);
        this.snackBar.open('Failed to connect to backend', 'Close', { duration: 5000 });
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

  onToEmailChange(email: string): void {
    this.toEmail.set(email);
  }
}
