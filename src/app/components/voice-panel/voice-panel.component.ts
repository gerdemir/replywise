import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VoiceService } from '../../services/voice.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-voice-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './voice-panel.component.html',
  styleUrl: './voice-panel.component.scss'
})
export class VoicePanelComponent {
  draftText = input.required<string>();

  approve = output<void>();
  edit = output<void>();
  reject = output<void>();

  isLoadingAudio = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  isListening = signal<boolean>(false);
  errorMessage = signal<string>('');

  private audio: HTMLAudioElement | null = null;

  constructor(public voiceService: VoiceService) {
    // Subscribe to voice service states
    this.voiceService.isListening$.subscribe((listening: boolean) => {
      this.isListening.set(listening);
    });

    this.voiceService.error$.subscribe((error: string) => {
      this.errorMessage.set(error);
    });
  }

  async onListen(): Promise<void> {
    if (this.isPlaying()) {
      this.stopAudio();
      return;
    }

    this.isLoadingAudio.set(true);
    this.errorMessage.set('');

    try {
      const audioBlob = await firstValueFrom(this.voiceService.getReplyAudio(this.draftText()));
      if (audioBlob) {
        this.playAudio(audioBlob);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to load audio';
      this.errorMessage.set(errorMsg);
      console.error('Audio load error:', error);
    } finally {
      this.isLoadingAudio.set(false);
    }
  }

  private playAudio(blob: Blob): void {
    if (this.audio) {
      this.audio.pause();
    }

    this.audio = new Audio(URL.createObjectURL(blob));
    this.audio.onended = () => {
      this.isPlaying.set(false);
      URL.revokeObjectURL(this.audio!.src);
    };

    this.audio.play().then(() => {
      this.isPlaying.set(true);
    }).catch(error => {
      this.errorMessage.set('Failed to play audio');
      console.error('Audio play error:', error);
    });
  }

  private stopAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying.set(false);
      URL.revokeObjectURL(this.audio.src);
      this.audio = null;
    }
  }

  onSpeakCommand(): void {
    if (!this.voiceService.isSupported) {
      this.errorMessage.set('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice commands.');
      return;
    }

    if (this.isListening()) {
      this.voiceService.stopListening();
      return;
    }

    this.errorMessage.set('');
    this.voiceService.startListening().subscribe({
      next: (transcript: string) => {
        const command = this.voiceService.parseCommand(transcript);
        if (command) {
          switch (command) {
            case 'approve':
              this.approve.emit();
              break;
            case 'edit':
              this.edit.emit();
              break;
            case 'reject':
              this.reject.emit();
              break;
          }
        } else {
          this.errorMessage.set(`Unrecognized command: "${transcript}"`);
        }
      },
      error: (error: any) => {
        this.errorMessage.set(error);
      }
    });
  }

  onApprove(): void {
    this.approve.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onReject(): void {
    this.reject.emit();
  }
}