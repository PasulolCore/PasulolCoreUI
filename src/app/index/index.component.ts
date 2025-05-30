import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  statistics: Statistics = {
    cumulative_visitors: 0,
    cumulative_shares: 0
  };

  constructor(
    public appComponent: AppComponent,
    private http: HttpClient,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.http.post(`${environment.apiUrl}/result/visit`, null).subscribe(() => {
      this.http.get<Statistics>(`${environment.apiUrl}/result/statistics`).subscribe((data) => {
        this.statistics = data;
        console.log('Statistics loaded:', this.statistics);
      })
    });
  }

  showInstructions() {
    Swal.fire({
        title: 'วิธีทำแบบทดสอบ',
        html: `
            <ol style="text-align: left; margin: 0 auto; max-width: 80%;">
                <li>อ่านคำถามและตัวเลือกอย่างละเอียด</li>
                <li>เลือกคำตอบที่ตรงกับคุณที่สุด</li>
                <li>กดปุ่ม 'ต่อไป' เพื่อไปคำถามถัดไป</li>
                <li>เมื่อตอบครบทุกคำถามจะแสดงผลลัพธ์</li>
            </ol>
            <p style="margin-top: 20px; font-style: italic;">เลือกคำตอบที่ตรงกับตัวคุณจริงๆ อย่าเลือกสิ่งที่คิดว่าฮานะ :D</p>
        `,
        icon: 'info',
        confirmButtonText: 'เข้าใจแล้ว',
        confirmButtonColor: '#b22222'
    });
  }

  showAbout() {
    Swal.fire({
        title: 'เกี่ยวกับแบบทดสอบ',
        html: `
            <div style="text-align: left;">
                <p><strong>Pasulol Core Personality Test</strong></p>
                <p>แบบทดสอบนี้พัฒนาขึ้นเพื่อวิเคราะห์บุคลิกภาพตามตัวละครการ์ตูนของเรื่อง Pasulol เป็นหลักให้แม่นยำ</p>
                <p>เวอร์ชัน 0.1</p>
                <hr>
                <p style="font-size: 0.9rem; color: #777;">© 2025 Pasulol Universe</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#b22222'
    });
  }

  showSupport() {
    Swal.fire({
        title: 'สนับสนุนผู้พัฒนา',
        html: `
            <div style="text-align: center; font-family: 'Segoe UI', sans-serif;">
                <p>หากคุณชอบแบบทดสอบนี้และอยากสนับสนุนผู้พัฒนา</p>
                <p>สามารถสนับสนุนได้ผ่านช่องทางเหล่านี้:</p>
                <div style="margin: 25px 0; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <button onclick="window.open('https://www.buymeacoffee.com/wellgr8', '_blank');"
                            style="background-color: #FFDD00; color: #111; font-weight: 600; font-size: 16px;
                                  border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer;
                                  box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s ease;">
                        ☕ Buy Me a Coffee
                    </button>
                    <button onclick="window.open('https://ezdn.app/welldonegr8', '_blank');"
                            style="background-color: #2D9CDB; color: #fff; font-weight: 600; font-size: 16px;
                                  border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer;
                                  box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s ease;">
                        💙 EasyDonate
                    </button>
                </div>
                <p style="font-size: 0.9rem; color: #555;">ขอบคุณสำหรับการสนับสนุน!</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#b22222'
    });
  }

  navigateToQuiz(): void {
    this.router.navigate(['/quiz']); // Navigate to quiz page
  }
}

interface Statistics {
  cumulative_visitors: number;
  cumulative_shares: number;
}
