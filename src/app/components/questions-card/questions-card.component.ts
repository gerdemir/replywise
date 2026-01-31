import { Component, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { slideIn } from '../../app.animations';

@Component({
  selector: 'app-questions-card',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './questions-card.component.html',
  styleUrl: './questions-card.component.scss',
  animations: [slideIn]
})
export class QuestionsCardComponent {
  questions = input.required<string[]>();
  selectedDraftBody = input.required<string>();

  questionsInserted = output<string[]>();
  
  selectedQuestions = signal<Set<number>>(new Set());

  toggleQuestion(index: number): void {
    const selected = new Set(this.selectedQuestions());
    if (selected.has(index)) {
      selected.delete(index);
    } else {
      selected.add(index);
    }
    this.selectedQuestions.set(selected);
  }

  isSelected(index: number): boolean {
    return this.selectedQuestions().has(index);
  }

  insertSelected(): void {
    const selected = Array.from(this.selectedQuestions())
      .sort((a, b) => a - b)
      .map(index => this.questions()[index]);
    
    this.questionsInserted.emit(selected);
    this.selectedQuestions.set(new Set());
  }
}
