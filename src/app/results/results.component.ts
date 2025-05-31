import { AfterViewInit, Component, OnInit, ViewChildren } from '@angular/core';
import { results } from '../../share/results';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements AfterViewInit {
  results = results;
  current = 0;
  profiles: NodeListOf<HTMLElement> = document.querySelectorAll('.character-profile');

  ngAfterViewInit(): void {
    this.showProfile(this.current);
    this.profiles = document.querySelectorAll('.character-profile');
    // console.log(this.profiles);
  }

  showProfile(idx: number, direction = 0) {
    for (let i = 0; i < this.profiles.length; i++) {
      const el = this.profiles.item(i);
      console.log(el);
      if (i === idx) {
        el!.style.display = 'block';
        el!.style.opacity = '0';
        el!.style.transform = `translateX(${direction === 0 ? 0 : (direction > 0 ? 60 : -60)}px)`;
        requestAnimationFrame(() => {
          el!.style.transition = 'opacity 0.28s, transform 0.28s';
          el!.style.opacity = '1';
          el!.style.transform = 'translateX(0)';
        });
      } else {
        el!.style.transition = 'opacity 0.18s, transform 0.18s';
        el!.style.opacity = '0';
        el!.style.transform = `translateX(${i < idx ? -60 : 60}px)`;
        setTimeout(() => {
          if (this.current !== i) el!.style.display = 'none';
        }, 180);
      }
    };
  }
}
