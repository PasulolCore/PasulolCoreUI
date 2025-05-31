import { Component, OnInit } from '@angular/core';
import { results } from '../../share/results';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  results = results;

  current = 0;
  favorites: number[] = [];

  private touchStartX: number = 0;
  private touchEndX: number = 0;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const storedFavorites = localStorage.getItem('profileFavorites');
    this.favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
  }

  showProfile(index: number): void {
    this.current = index;
  }

  isFavorite(index: number): boolean {
    return this.favorites.includes(index);
  }

  toggleFavorite(index: number): void {
    if (this.isFavorite(index)) {
      this.favorites = this.favorites.filter(i => i !== index);
    } else {
      this.favorites.push(index);
    }
    localStorage.setItem('profileFavorites', JSON.stringify(this.favorites));
  }

  nextProfile(): void {
    this.current = (this.current + 1) % this.results.length;
  }

  prevProfile(): void {
    this.current = (this.current - 1 + this.results.length) % this.results.length;
  }

  randomProfile(): void {
    let rand;
    do {
      rand = Math.floor(Math.random() * this.results.length);
    } while (rand === this.current && this.results.length > 1);
    this.current = rand;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50; // Minimum distance for a swipe
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.nextProfile(); // Swipe left
    } else if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.prevProfile(); // Swipe right
    }
  }
}
