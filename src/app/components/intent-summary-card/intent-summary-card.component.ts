import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { fadeInItem, slideIn } from '../../app.animations';

@Component({
  selector: 'app-intent-summary-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './intent-summary-card.component.html',
  styleUrl: './intent-summary-card.component.scss',
  animations: [slideIn, fadeInItem]
})
export class IntentSummaryCardComponent {
  intentSummary = input.required<string[]>();
}
