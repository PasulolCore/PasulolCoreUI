import { Component } from '@angular/core';
import { questions } from '../../share/typology';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Result } from '../../share/result.model';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  questions = questions;
  currentQuestion = 0;
  scores: {
      [key: string]: any;
      E: number; I: number; S: number, N: number, T: number; F: number; J: number; P: number;
      enneagram: { [key: number]: number; 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; 9: number };
      headType: number; heartType: number; gutType: number;
  } = {
      // MBTI Scores
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
      // Enneagram Scores
      enneagram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      // Tritype Components
      headType: 0, heartType: 0, gutType: 0
  };
  totalScores = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
      enneagram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
  };
  selectedAnswer = null;
  selectedAnswerIndex: number | null = 0;
  progressPercent = 0;
  questionsLength = questions.length;
  isNextDisabled = false;

  constructor(
    private http: HttpClient
  ) {}

  // ฟังก์ชันหลัก
  initializeQuiz() {
    console.log("จำนวนคำถาม:", questions.length);
    this.displayQuestion();
  }

  displayQuestion() {
    const question = questions[this.currentQuestion];
    // ป้องกัน error ใน in-app browser
    if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== "undefined") {
        const speech = new SpeechSynthesisUtterance(question.question);
        speech.lang = 'th-TH';
        speechSynthesis.speak(speech);
    }

    // ปรับตรงนี้ให้รองรับข้อที่ไม่มีรูป
    const img = document.getElementById('question-image');
    if (img) {
        if (question.image && question.image.trim() !== "") {
            // img.src = question.image;
            // img.alt = "ภาพคำถาม";
            img.style.display = "block";
            img.onerror = function () { this.style.display = "none"; };
            // img.onload = function () { this.style.display = "block"; };
        } else {
            img.style.display = "none";
        }
    }

    // for (const [key, answer] of Object.entries(question.answers)) {
    //     const answerElement = document.createElement('div');
    //     answerElement.className = 'answer-option';
    //     const typedAnswer = answer as { text: string; scores: Record<string, number> };
    //     answerElement.textContent = typedAnswer.text;
    //     answerElement.dataset['key'] = key;
    //     answerElement.addEventListener('click', () => this.selectAnswer(key, answerElement));
    //     answersContainer!.appendChild(answerElement);
    // }

    this.updateProgress();
  }

  updateProgress() {
    this.progressPercent = ((this.currentQuestion + 1) / questions.length) * 100;
  }

  selectAnswer(index: number) {
    this.isNextDisabled = false;
    this.selectedAnswerIndex = index;
  }

  prevQuestion() {
    this.currentQuestion--;
    this.selectedAnswerIndex = null;
    this.displayQuestion();
  }

  nextQuestion() {
    if (this.selectedAnswerIndex === null) return;

    this.updateScores(questions[this.currentQuestion].answers[this.selectedAnswerIndex].scores);

    this.currentQuestion++;
    this.selectedAnswerIndex = null;

    if (this.currentQuestion < questions.length) {
        this.displayQuestion();
    } else {
      const body: Result = {
        "accept_email": true,
        "extroversion": this.scores.E,
        "introversion": this.scores.I,
        "sensing": this.scores.S,
        "intuition": this.scores.N,
        "thinking": this.scores.T,
        "feeling": this.scores.F,
        "judging": this.scores.J,
        "perceiving": this.scores.P,
        "enneagram_1": this.scores.enneagram[1],
        "enneagram_2": this.scores.enneagram[2],
        "enneagram_3": this.scores.enneagram[3],
        "enneagram_4": this.scores.enneagram[4],
        "enneagram_5": this.scores.enneagram[5],
        "enneagram_6": this.scores.enneagram[6],
        "enneagram_7": this.scores.enneagram[7],
        "enneagram_8": this.scores.enneagram[8],
        "enneagram_9": this.scores.enneagram[9],
      }
      this.http.post(`${environment.apiUrl}/result/create`, body).subscribe({
        next: (response) => {
          console.log(">> ส่งข้อมูลสำเร็จ:", response);
        },
        error: (error) => {
          console.error(">> เกิดข้อผิดพลาดในการส่งข้อมูล:", error);
        }
      })
      console.log(">> แสดงผลลัพธ์");
      // this.showResults();
      // TODO: navigate to result page
    }
  }

  updateScores(answerScores: any) {
    // // Update MBTI scores
    for (const [trait, score] of Object.entries(answerScores)) {
        if (this.scores.hasOwnProperty(trait)) {
            this.scores[trait] += score;
        } else if (this.scores.enneagram.hasOwnProperty(trait)) {
            this.scores.enneagram[Number(trait)] += Number(score);
        }
    }

    // Update Tritype components
    this.scores.headType = Math.max(this.scores.enneagram[5], this.scores.enneagram[6], this.scores.enneagram[7]);
    this.scores.heartType = Math.max(this.scores.enneagram[2], this.scores.enneagram[3], this.scores.enneagram[4]);
    this.scores.gutType = Math.max(this.scores.enneagram[1], this.scores.enneagram[8], this.scores.enneagram[9]);

    // Update totalScores
    for (const [key, value] of Object.entries(this.scores)) {
        if (typeof value === 'object') {
            for (const [subKey, subValue] of Object.entries(value)) {
                (this.totalScores[key as keyof typeof this.totalScores] as any)[subKey] += subValue;
            }
        } else {
            this.totalScores[key as keyof typeof this.totalScores] += value;
        }
    }

    console.log("Total Scores:", this.totalScores);
    console.log("Current Scores:", this.scores);
  }
}
