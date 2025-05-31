import { Component, OnInit } from '@angular/core';
import { characters } from '../../share/characters';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Result } from '../../share/result.model';
import { environment } from '../../environments/environment';
import { Scores } from '../../share/scores.model';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent implements OnInit {
  resultId: string | null = null;
  scores: Scores | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.resultId = this.route.snapshot.paramMap.get('resultId');
    this.http.get<Result>(`${environment.apiUrl}/result/${this.resultId}`).subscribe(result => {
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
      } else {
        console.error('Result not found for ID:', this.resultId);
      }
    });
  }

  // calculateCharacter() {
  //   let bestMatch = null;
  //   let maxScore = -Infinity;

  //   characters.forEach(character => {
  //       let matchScore = 0;

  //       // MBTI Matching
  //       for (const trait of character.mbti) {
  //           matchScore += scores[trait] || 0;
  //       }

  //       // Enneagram Matching
  //       matchScore += scores.enneagram[character.coreType] * 2;

  //       if (character.tritype) {
  //           for (const type of character.tritype.split('')) {
  //               matchScore += scores.enneagram[parseInt(type)] || 0;
  //           }
  //       }

  //       if (matchScore > maxScore) {
  //           maxScore = matchScore;
  //           bestMatch = character;
  //       }
  //   });

  //   return bestMatch || characters[0];
  // }

  // showResults() {
  //   console.log(">> เข้าสู่ showResults แล้ว");
  //   // playComplete(); // TODO: Implement this function to play a sound when results are shown

  //   const test = document.getElementById('test-container');
  //   const result = document.getElementById('result-container');

  //   const character = calculateCharacter();
  //   const userEnneagram = calculateEnneagramType();
  //   const userTritype = calculateTritype();

  //   displayCharacterResult(character, userEnneagram, userTritype);
  //   displayRelatedCharacters(character);

  //   // --- Hopfield Network Implementation ---
  //   // ตัวอย่าง pattern (ควรปรับให้ตรงกับของจริง)
  //   const hopfieldPatterns = [
  //       [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
  //       [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1],
  //       [1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1]
  //   ];

  //   function createHopfieldWeights(patterns) {
  //       const N = patterns[0].length;
  //       let W = Array.from({ length: N }, () => Array(N).fill(0));
  //       for (const p of patterns) {
  //           for (let i = 0; i < N; i++) {
  //               for (let j = 0; j < N; j++) {
  //                   if (i !== j) W[i][j] += p[i] * p[j];
  //               }
  //           }
  //       }
  //       for (let i = 0; i < N; i++) {
  //           for (let j = 0; j < N; j++) {
  //               W[i][j] /= patterns.length;
  //           }
  //       }
  //       return W;
  //   }

  //   function sign(x) {
  //       return x >= 0 ? 1 : -1;
  //   }

  //   function hopfieldRecall(input, W, maxIter = 10) {
  //       let state = input.slice();
  //       const N = state.length;
  //       for (let iter = 0; iter < maxIter; iter++) {
  //           let changed = false;
  //           for (let i = 0; i < N; i++) {
  //               let sum = 0;
  //               for (let j = 0; j < N; j++) {
  //                   sum += W[i][j] * state[j];
  //               }
  //               const newVal = sign(sum);
  //               if (state[i] !== newVal) {
  //                   state[i] = newVal;
  //                   changed = true;
  //               }
  //           }
  //           if (!changed) break;
  //       }
  //       return state;
  //   }

  //   function cosineSimilarity(a, b) {
  //       let dot = 0, magA = 0, magB = 0;
  //       for (let i = 0; i < a.length; i++) {
  //           dot += a[i] * b[i];
  //           magA += a[i] * a[i];
  //           magB += b[i] * b[i];
  //       }
  //       return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  //   }

  //   function findClosestPattern(output, patterns) {
  //       let maxSim = -Infinity, bestIdx = -1;
  //       for (let i = 0; i < patterns.length; i++) {
  //           const sim = cosineSimilarity(output, patterns[i]);
  //           if (sim > maxSim) {
  //               maxSim = sim;
  //               bestIdx = i;
  //           }
  //       }
  //       return bestIdx;
  //   }

  //   // --- สร้างเวกเตอร์คะแนนผู้ใช้ ---
  //   const userVector = [
  //       scores.E, scores.I, scores.T, scores.F, scores.J, scores.P,
  //       scores.enneagram[1], scores.enneagram[2], scores.enneagram[3],
  //       scores.enneagram[4], scores.enneagram[5], scores.enneagram[6],
  //       scores.enneagram[7], scores.enneagram[8], scores.enneagram[9]
  //   ];
  //   const inputPattern = userVector.map(x => x >= 0 ? 1 : -1);

  //   // --- สร้าง weight matrix และ recall ---
  //   const W = createHopfieldWeights(hopfieldPatterns);
  //   const recalled = hopfieldRecall(inputPattern, W);
  //   const hopfieldIdx = findClosestPattern(recalled, hopfieldPatterns);

  //   // --- แสดงผลลัพธ์ Hopfield ---
  //   document.getElementById('hopfield-result').innerHTML =
  //       `<div class="hopfield-section">
  //           <h4>AI Memory Match (Hopfield Network)</h4>
  //           <p>บุคลิกของคุณใกล้เคียงกับ Pattern #${hopfieldIdx + 1}</p>
  //           <div style="margin-bottom:4px;font-size:0.95em;color:#555;">Heatmap ผลลัพธ์:</div>
  //           ${renderHopfieldHeatmap(recalled)}
  //       </div>`;

  //   // ...โค้ดเดิม...
  //   renderScoreChart();
  // }
}
