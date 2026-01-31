import { Component, input, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Risk } from '../../models/replywise.models';
import { slideIn } from '../../app.animations';

@Component({
  selector: 'app-risk-panel',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule, MatIconModule],
  templateUrl: './risk-panel.component.html',
  styleUrl: './risk-panel.component.scss',
  animations: [slideIn]
})
export class RiskPanelComponent {
  risk = input.required<Risk>();

  confidenceLevel = computed(() => {
    const conf = this.risk().confidence;
    if (conf >= 70) return 'High';
    if (conf >= 40) return 'Med';
    return 'Low';
  });

  confidenceColor = computed(() => {
    const conf = this.risk().confidence;
    if (conf >= 70) return 'warn';
    if (conf >= 40) return 'accent';
    return 'primary';
  });

  riskFlags = computed(() => {
    const flags = this.risk().flags;
    const flagList: { label: string; value: boolean; icon: string }[] = [];
    
    if (flags.urgency) flagList.push({ label: 'Urgency', value: true, icon: 'schedule' });
    if (flags.commitment) flagList.push({ label: 'Commitment', value: true, icon: 'gavel' });
    if (flags.sensitive) flagList.push({ label: 'Sensitive', value: true, icon: 'lock' });
    if (flags.financial) flagList.push({ label: 'Financial', value: true, icon: 'attach_money' });
    
    return flagList;
  });
}
