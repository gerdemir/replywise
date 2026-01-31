import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { fadeIn } from '../../app.animations';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './email-input.component.html',
  styleUrl: './email-input.component.scss',
  animations: [fadeIn]
})
export class EmailInputComponent {
  emailText = input.required<string>();
  context = input.required<string>();
  loading = input.required<boolean>();
  demoMode = input.required<boolean>();
  sampleEmail = input<string>('');

  emailTextChange = output<string>();
  contextChange = output<string>();
  generateClick = output<void>();
  loadSampleClick = output<void>();

  onEmailTextChange(value: string): void {
    this.emailTextChange.emit(value);
  }

  onContextChange(value: string): void {
    this.contextChange.emit(value);
  }

  onGenerate(): void {
    this.generateClick.emit();
  }

  onLoadSample(): void {
    this.loadSampleClick.emit();
  }
}
