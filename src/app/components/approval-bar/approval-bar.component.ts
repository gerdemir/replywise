import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { slideUp } from '../../app.animations';

@Component({
  selector: 'app-approval-bar',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './approval-bar.component.html',
  styleUrl: './approval-bar.component.scss',
  animations: [slideUp]
})
export class ApprovalBarComponent {
  subject = input.required<string>();
  body = input.required<string>();
  toEmail = input<string>('');

  toEmailChange = output<string>();
  approveClick = output<void>();
  copyClick = output<void>();

  constructor(private snackBar: MatSnackBar) {}

  onToEmailChange(value: string): void {
    this.toEmailChange.emit(value);
  }

  onApprove(): void {
    const subject = encodeURIComponent(this.subject());
    const body = encodeURIComponent(this.body());
    const to = this.toEmail() ? encodeURIComponent(this.toEmail()) : '';
    
    let gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1';
    if (to) {
      gmailUrl += `&to=${to}`;
    }
    gmailUrl += `&su=${subject}&body=${body}`;
    
    window.open(gmailUrl, '_blank');
    this.approveClick.emit();
  }

  onCopy(): void {
    const fullText = `To: ${this.toEmail() || '[Recipient]'}\nSubject: ${this.subject()}\n\n${this.body()}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      this.snackBar.open('Final draft copied to clipboard', 'Close', {
        duration: 2000,
        horizontalPosition: 'end'
      });
    });
    this.copyClick.emit();
  }
}
