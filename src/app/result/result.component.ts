import { Component, OnInit } from '@angular/core';
import { Character, characters, getCharacterByName } from '../../share/character.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Result } from '../../share/result.model';
import { environment } from '../../environments/environment';
import { Scores } from '../../share/scores.model';
import { enneagramTypes } from '../../share/typology';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';

Chart.register(...registerables);

declare global {
  interface Window {
    scoreChart: Chart | null;
  }
}

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent implements OnInit {
  characters = characters;
  getCharacterByName = getCharacterByName;
  resultId: string | null = null;
  scores: Scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
    enneagram: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0
    },
    headType: 0,
    heartType: 0,
    gutType: 0
  }
  userCharacter: Character = characters[0]; // Default character
  userMBTI: string = 'INTJ'; // Default MBTI type
  userEnneagram: { type: number, name: string } = { type: 1, name: 'Type 1' };
  userTritype: string = '125'; // Default tritype

  recalled: number[] = [];
  hopfieldIdx: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resultId = this.route.snapshot.paramMap.get('resultId');
    this.http.get<Result>(`${environment.apiUrl}/result/${this.resultId}`).subscribe({
      next: (result: Result) => {
        if (result) {
          // this.displayResult(result);
          console.log('Result loaded:', result);
          this.scores = {
            E: result.extroversion,
            I: result.introversion,
            S: result.sensing,
            N: result.intuition,
            T: result.thinking,
            F: result.feeling,
            J: result.judging,
            P: result.perceiving,
            enneagram: {
              1: result.enneagram_1,
              2: result.enneagram_2,
              3: result.enneagram_3,
              4: result.enneagram_4,
              5: result.enneagram_5,
              6: result.enneagram_6,
              7: result.enneagram_7,
              8: result.enneagram_8,
              9: result.enneagram_9
            },
            headType: result.headType,
            heartType: result.heartType,
            gutType: result.gutType
          }
          this.showResults();
        }
      },
      error: (error) => {
        console.error('Error loading result:', error);
        this.router.navigate(['/']);
      }
    });
  }

  calculateCharacter() {
    let bestMatch = null;
    let maxScore = -Infinity;

    characters.forEach(character => {
        let matchScore = 0;

        // MBTI Matching
        for (const trait of character.mbti) {
            matchScore += this.scores[trait] || 0;
        }

        // Enneagram Matching
        matchScore += this.scores.enneagram[parseInt(character.coreType)] * 2;

        if (character.code) {
            for (const type of character.code.split('')) {
                matchScore += this.scores.enneagram[parseInt(type)] || 0;
            }
        }

        if (matchScore > maxScore) {
            maxScore = matchScore;
            bestMatch = character;
        }
    });

    return bestMatch || characters[0];
  }

  showResults() {
    console.log(">> เข้าสู่ showResults แล้ว");
    // playComplete(); // TODO: Implement this function to play a sound when results are shown

    const test = document.getElementById('test-container');
    const result = document.getElementById('result-container');

    this.userMBTI = this.calculateMBTIType();
    this.userCharacter = this.calculateCharacter();
    this.userEnneagram = this.calculateEnneagramType();
    this.userTritype = this.calculateTritype();

    // --- Hopfield Network Implementation ---
    // ตัวอย่าง pattern (ควรปรับให้ตรงกับของจริง)
    const hopfieldPatterns = [
        [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
        [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1],
        [1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1]
    ];

    function createHopfieldWeights(patterns: number[][]) {
        const N = patterns[0].length;
        let W = Array.from({ length: N }, () => Array(N).fill(0));
        for (const p of patterns) {
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    if (i !== j) W[i][j] += p[i] * p[j];
                }
            }
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                W[i][j] /= patterns.length;
            }
        }
        return W;
    }

    function sign(x: number): number {
        return x >= 0 ? 1 : -1;
    }

    function hopfieldRecall(input: (1 | -1)[], W: any[][], maxIter = 10) {
        let state = input.slice();
        const N = state.length;
        for (let iter = 0; iter < maxIter; iter++) {
            let changed = false;
            for (let i = 0; i < N; i++) {
                let sum = 0;
                for (let j = 0; j < N; j++) {
                    sum += W[i][j] * state[j];
                }
                const newVal = sign(sum);
                if (state[i] !== newVal) {
                    state[i] = newVal as 1 | -1;
                    changed = true;
                }
            }
            if (!changed) break;
        }
        return state;
    }

    function cosineSimilarity(a: number[], b: number[]) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    function findClosestPattern(output: number[], patterns: number[][]) {
        let maxSim = -Infinity, bestIdx = -1;
        for (let i = 0; i < patterns.length; i++) {
            const sim = cosineSimilarity(output, patterns[i]);
            if (sim > maxSim) {
                maxSim = sim;
                bestIdx = i;
            }
        }
        return bestIdx;
    }

    // --- สร้างเวกเตอร์คะแนนผู้ใช้ ---
    const userVector = [
        this.scores.E, this.scores.I, this.scores.T, this.scores.F, this.scores.J, this.scores.P,
        this.scores.enneagram[1], this.scores.enneagram[2], this.scores.enneagram[3],
        this.scores.enneagram[4], this.scores.enneagram[5], this.scores.enneagram[6],
        this.scores.enneagram[7], this.scores.enneagram[8], this.scores.enneagram[9]
    ];
    const inputPattern = userVector.map(x => x >= 0 ? 1 : -1);

    // --- สร้าง weight matrix และ recall ---
    const W = createHopfieldWeights(hopfieldPatterns);
    this.recalled = hopfieldRecall(inputPattern, W);
    this.hopfieldIdx = findClosestPattern(this.recalled, hopfieldPatterns);

    // ...โค้ดเดิม...
    this.renderScoreChart();
  }

  calculateMBTIType() {
    const E = this.scores.E;
    const I = this.scores.I;
    const S = this.scores.S;
    const N = this.scores.N;
    const T = this.scores.T;
    const F = this.scores.F;
    const J = this.scores.J;
    const P = this.scores.P;

    let mbtiType = '';
    mbtiType += E >= I ? 'E' : 'I';
    mbtiType += S >= N ? 'S' : 'N';
    mbtiType += T >= F ? 'T' : 'F';
    mbtiType += J >= P ? 'J' : 'P';

    return mbtiType;
  }

  calculateEnneagramType() {
    let maxType = 1;
    for (let type = 2; type <= 9; type++) {
        if (this.scores.enneagram[type] > this.scores.enneagram[maxType]) {
            maxType = type;
        }
    }
    return { type: maxType, name: enneagramTypes[maxType as keyof typeof enneagramTypes].name };
  }

  calculateTritype() {
      const headType = [5, 6, 7].reduce((a, b) => this.scores.enneagram[a] > this.scores.enneagram[b] ? a : b);
      const heartType = [2, 3, 4].reduce((a, b) => this.scores.enneagram[a] > this.scores.enneagram[b] ? a : b);
      const gutType = [1, 8, 9].reduce((a, b) => this.scores.enneagram[a] > this.scores.enneagram[b] ? a : b);
      return `${headType}${heartType}${gutType}`;
  }

  // แสดงผล (เพิ่ม heatmap)
  renderHopfieldHeatmap(vector: number[]) {
    const labels = [
        'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P',
        '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    return `
        <div class="heatmap-bar">
            ${vector.map((v, i) => `
                <div class="heatmap-cell ${v > 0 ? 'positive' : 'negative'}"
                    data-label="${labels[i]}" data-value="${v}">
                    ${labels[i]}
                </div>
            `).join('')}
        </div>
    `;
  }

  // --- เพิ่มฟังก์ชัน renderScoreChart ที่นี่ ---
  renderScoreChart() {
    const canvas = document.getElementById('score-chart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
        if (window.scoreChart) window.scoreChart.destroy(); // ป้องกันซ้อน
        window.scoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['E','I','S','N','T','F','J','P','1','2','3','4','5','6','7','8','9'],
            datasets: [{
                label: 'คะแนน',
                data: [
                    this.scores.E, this.scores.I, this.scores.S, this.scores.N, this.scores.T, this.scores.F, this.scores.J, this.scores.P,
                    this.scores.enneagram[1], this.scores.enneagram[2], this.scores.enneagram[3],
                    this.scores.enneagram[4], this.scores.enneagram[5], this.scores.enneagram[6],
                    this.scores.enneagram[7], this.scores.enneagram[8], this.scores.enneagram[9]
                ],
                backgroundColor: [
                    '#ff6b81','#6bcfff','#ffb86b','#6bffb8','#b86bff','#ff6bb8',
                    '#b22222','#ff9999','#ffb3c6','#ffd6e0','#b2f7ef','#b2b2f7','#f7b2b2','#f7e6b2','#b2f7c6'
                ]
            }]
        },
        options: {
            responsive: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  navigateToQuiz() {
    this.router.navigate(['/quiz']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
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

  showShare() {
    this.http.post(`${environment.apiUrl}/result/share`, null).subscribe({
      next: (response: any) => {
        console.log('Share response:', response);
      },
      error: (error) => {
        console.error('Error sharing result:', error);
      }
    });
    Swal.fire({
      title: 'แชร์ผลลัพธ์ของคุณ',
      html: `
        <div style="text-align: center;">
          <p>คุณสามารถบันทึกหรือแชร์ผลลัพธ์ไปยังโซเชียลมีเดียได้</p>
          <div style="margin: 15px 0;">
            <button onclick="downloadResult()" style="
              margin: 5px;
              padding: 10px 15px;
              border-radius: 8px;
              border: none;
              background-color: #b22222;
              color: #fff;
              font-weight: 700;
              font-size: 1rem;
              cursor: pointer;
              transition: background 0.2s;
            ">
              ⬇ ดาวน์โหลดผลลัพธ์
            </button>
          </div>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <a href="https://www.instagram.com/PasulolCore" target="_blank" style="color: #E4405F;"><i class="fab fa-instagram fa-2x"></i></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://wellgr8.github.io/Pasulol-Core/" target="_blank" style="color: #3b5998;"><i class="fab fa-facebook fa-2x"></i></a>
            <a href="https://www.tiktok.com/@PasulolCore" target="_blank" style="color: #000;"><i class="fab fa-tiktok fa-2x"></i></a>
            <a href="https://twitter.com/intent/tweet?text=ลองทำแบบทดสอบบุคลิกภาพ Pasulol ดูสิ!&url=https://wellgr8.github.io/Pasulol-Core/" target="_blank" style="color: #1DA1F2;"><i class="fab fa-twitter fa-2x"></i></a>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#b22222'
    });
  }
}
