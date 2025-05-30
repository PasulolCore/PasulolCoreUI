import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'PasulolCoreUI';
  toggleSoundEnabled = true;
  clickSound = new Audio("sounds/click.mp3");
  hoverSound = new Audio("sounds/hover.mp3");

  ngOnInit(): void {
    document.addEventListener('click', () => {
      this.playClickSound();
    });
  }

  playClickSound() {
    if (this.toggleSoundEnabled) {
      this.clickSound.currentTime = 0; // Reset sound to start
      this.clickSound.play().catch(error => {
        console.error("Error playing click sound:", error);
      });
    }
  }

  playHoverSound() {
    if (this.toggleSoundEnabled) {
      this.hoverSound.currentTime = 0; // Reset sound to start
      this.hoverSound.play().catch(error => {
        console.error("Error playing hover sound:", error);
      });
    }
  }

  toggleSound() {
    this.toggleSoundEnabled = !this.toggleSoundEnabled;
    document.getElementById('soundIcon')!.className = this.toggleSoundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  }
}
