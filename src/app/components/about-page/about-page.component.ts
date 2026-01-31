import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { fadeIn, slideIn } from '../../app.animations';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  animations: [fadeIn, slideIn]
})
export class AboutPageComponent {
  visible = input.required<boolean>();
  close = output<void>();

  teamMembers = [
    {
      name: 'Abhishek',
      role: 'CS @ Sheridan',
      linkedin: 'https://www.linkedin.com/in/abhishek8524/',
      profilePic: '/Abhishek.jpeg'
    },
    {
      name: 'Gamze Esen-Erdemir',
      role: '@ OntarioTechUniversity',
      linkedin: 'https://www.linkedin.com/in/gamze-esen-erdemir/',
      profilePic: '/Gamze.jpg'
    },
    {
      name: 'Nifemi Toluhi',
      role: '@ OntarioTechUniversity',
      linkedin: 'https://www.linkedin.com/in/nifemi-toluhi/',
      profilePic: '/Nifemi.jpeg'
    }
  ];

  onClose(): void {
    this.close.emit();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTMwIDIwQzI2LjEgMjAgMjMgMjMuMSAyMyAyN0MyMyAzMC45IDI2LjEgMzQgMzAgMzRDMzMuOSAzNCAzNyAzMC45IDM3IDI3QzM3IDIzLjEgMzMuOSAyMCAzMCAyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
  }
}
