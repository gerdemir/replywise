import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

type ApiStatus = 'checking' | 'online' | 'offline';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatTooltipModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  demoMode = input.required<boolean>();
  demoModeChange = output<boolean>();
  
  apiStatus = signal<ApiStatus>('checking');
  private http = inject(HttpClient);
  
  constructor() {
    // Check API health on component init
    this.checkApiHealth();
    
    // Check every 30 seconds
    setInterval(() => {
      if (!this.demoMode()) {
        this.checkApiHealth();
      }
    }, 30000);
  }
  
  checkApiHealth(): void {
    this.apiStatus.set('checking');
    
    // Get health endpoint URL
    const healthUrl = environment.apiBaseUrl.replace('/api', '/health');
    
    this.http.get<{ status: string }>(healthUrl, { 
      observe: 'response',
      responseType: 'json'
    }).pipe(
      timeout({ first: 5000 }),
      catchError(() => {
        this.apiStatus.set('offline');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.apiStatus.set('online');
        }
      }
    });
  }
  
  getStatusIcon(): string {
    switch (this.apiStatus()) {
      case 'online': return 'check_circle';
      case 'offline': return 'error';
      case 'checking': return 'sync';
      default: return 'help';
    }
  }
  
  getStatusText(): string {
    switch (this.apiStatus()) {
      case 'online': return 'API Online';
      case 'offline': return 'API Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  }
  
  getStatusColor(): string {
    switch (this.apiStatus()) {
      case 'online': return 'primary';
      case 'offline': return 'warn';
      case 'checking': return '';
      default: return '';
    }
  }
}
