import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { ReplywiseApiService } from './replywise-api.service';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private recognition: any;
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  public isListening$ = this.isListeningSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public isSupported: boolean;

  constructor(private apiService: ReplywiseApiService) {
    this.initializeSpeechRecognition();
    this.isSupported = !!this.recognition;
  }

  private initializeSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListeningSubject.next(true);
        this.errorSubject.next('');
      };

      this.recognition.onend = () => {
        this.isListeningSubject.next(false);
      };

      this.recognition.onerror = (event: any) => {
        this.errorSubject.next(`Speech recognition error: ${event.error}`);
        this.isListeningSubject.next(false);
      };
    } else {
      this.errorSubject.next('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice commands.');
    }
  }

  /**
   * Get audio blob for text
   */
  getReplyAudio(text: string): Observable<Blob> {
    return this.apiService.getReplyAudio(text);
  }

  /**
   * Start voice recognition
   */
  startListening(): Observable<string> {
    return new Observable(observer => {
      if (!this.recognition) {
        observer.error('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice commands.');
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        observer.next(transcript);
        observer.complete();
      };

      this.recognition.start();
    });
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Parse voice command
   */
  parseCommand(transcript: string): 'approve' | 'edit' | 'reject' | null {
    const approveKeywords = ['approve', 'approve and send', 'send it', 'yes', 'confirm'];
    const editKeywords = ['edit', 'change it', 'modify', 'update'];
    const rejectKeywords = ['reject', 'discard', 'don\'t send', 'no', 'cancel'];

    if (approveKeywords.some(keyword => transcript.includes(keyword))) {
      return 'approve';
    }
    if (editKeywords.some(keyword => transcript.includes(keyword))) {
      return 'edit';
    }
    if (rejectKeywords.some(keyword => transcript.includes(keyword))) {
      return 'reject';
    }

    return null;
  }
}