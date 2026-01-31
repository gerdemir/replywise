import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReplyDraft } from '../../models/replywise.models';
import { slideIn } from '../../app.animations';

@Component({
  selector: 'app-reply-drafts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reply-drafts.component.html',
  styleUrl: './reply-drafts.component.scss',
  animations: [slideIn]
})
export class ReplyDraftsComponent {
  replyDrafts = input.required<ReplyDraft[]>();
  originalEmail = input.required<string>();
  context = input<string>('');
  loading = input<boolean>(false);

  rewriteRequest = output<{ action: 'shorter' | 'more_formal' | 'regenerate'; draftIndex: number }>();
  draftUpdate = output<{ index: number; draft: ReplyDraft }>();
  selectedTabChange = output<number>();

  selectedTabIndex = signal(0);
  editedDrafts = signal<ReplyDraft[]>([]);

  constructor(private snackBar: MatSnackBar) {
    // Watch for changes to replyDrafts and update editedDrafts
    effect(() => {
      this.editedDrafts.set([...this.replyDrafts()]);
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.selectedTabChange.emit(index);
  }

  onDraftChange(index: number, field: 'subject' | 'body', value: string): void {
    const drafts = [...this.editedDrafts()];
    drafts[index] = { ...drafts[index], [field]: value };
    this.editedDrafts.set(drafts);
    this.draftUpdate.emit({ index, draft: drafts[index] });
  }

  onCopy(index: number, type: 'subject' | 'body'): void {
    const draft = this.editedDrafts()[index];
    const text = type === 'subject' ? draft.subject : draft.body;
    
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(`${type === 'subject' ? 'Subject' : 'Body'} copied to clipboard`, 'Close', {
        duration: 2000,
        horizontalPosition: 'end'
      });
    });
  }

  onCopyFull(index: number): void {
    const draft = this.editedDrafts()[index];
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      this.snackBar.open('Full draft copied to clipboard', 'Close', {
        duration: 2000,
        horizontalPosition: 'end'
      });
    });
  }

  onRewrite(action: 'shorter' | 'more_formal' | 'regenerate', index: number): void {
    this.rewriteRequest.emit({ action, draftIndex: index });
  }

  getCurrentDraft(): ReplyDraft {
    return this.editedDrafts()[this.selectedTabIndex()];
  }
}
