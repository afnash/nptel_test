// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.quizData = null;
        this.currentMode = null;
        this.currentWeek = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timer = null;
        
        this.init();
    }

    async init() {
        await this.loadQuizData();
        this.setupEventListeners();
    }

    async loadQuizData() {
        try {
            const response = await fetch('quiz_data.json');
            this.quizData = await response.json();
            console.log('Quiz data loaded:', this.quizData);
        } catch (error) {
            console.error('Error loading quiz data:', error);
            this.showError('Failed to load quiz data. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Add any global event listeners here
        document.addEventListener('DOMContentLoaded', () => {
            this.showHome();
        });
    }

    showHome() {
        this.hideAllScreens();
        document.getElementById('home-screen').classList.add('active');
    }

    showWeeklySelection() {
        this.hideAllScreens();
        document.getElementById('weekly-screen').classList.add('active');
        this.populateWeeksGrid();
    }

    showQuiz() {
        this.hideAllScreens();
        document.getElementById('quiz-screen').classList.add('active');
        this.startQuiz();
    }

    showResults() {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');
        this.displayResults();
    }

    showReview() {
        this.hideAllScreens();
        document.getElementById('review-screen').classList.add('active');
        this.populateReview();
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
    }

    populateWeeksGrid() {
        const weeksGrid = document.getElementById('weeks-grid');
        weeksGrid.innerHTML = '';

        this.quizData.Weeks.forEach((Week, index) => {
            const weekCard = document.createElement('div');
            weekCard.className = 'week-card';
            const links = [link1,link2,link3,link4,link5,link6,link7,link8,link9,link10,link11,link12];
            weekCard.innerHTML = `
                <h3>${Week.Week_name}</h3>
                <p>10 Questions</p>
                <div class="week-actions">
                    <button class="btn btn-primary week-btn" onclick="startWeeklyQuiz(${index})">
                        <i class='fas fa-pen'></i> Practice
                    </button>
                    <a class="btn btn-outline week-btn" href='${links[index]}' target="_blank">
                        <i class='fas fa-book-open'></i> Learn
                    </a>
                </div>
            `;
            weeksGrid.appendChild(weekCard);
        });
    }

    startQuiz(mode = 'full') {
        this.currentMode = mode;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        if (mode === 'full') {
            this.currentQuestions = this.quizData.full_series;
            this.updateQuizInfo('Full Series', 'All Questions');
        } else if (mode === 'weekly') {
            // Default to first week for weekly mode if not selected
            this.currentWeek = 0;
            this.currentQuestions = this.quizData.Weeks[0].questions.slice(0, 10);
            this.updateQuizInfo('Weekly Series', 'Week 1');
        }
        this.showQuestion();
        this.updateProgress();
    }

    startWeeklyQuiz(WeekIndex) {
        this.currentMode = 'weekly';
        this.currentWeek = WeekIndex;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        // Get only the 10 questions for this specific week
        this.currentQuestions = this.quizData.Weeks[WeekIndex].questions.slice(0, 10);
        this.updateQuizInfo('Weekly Series', `Week ${WeekIndex + 1}`);
        // Show quiz screen only, do NOT call startQuiz (which resets to week 1)
        this.hideAllScreens();
        document.getElementById('quiz-screen').classList.add('active');
        this.showQuestion();
        this.updateProgress();
    }

    updateQuizInfo(mode, week) {
        document.getElementById('quiz-mode').textContent = mode;
        document.getElementById('quiz-week').textContent = week;
    }

    showQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        
        questionText.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.onclick = () => this.selectOption(index);
            
            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        this.updateProgress();
        this.updateNavigationButtons();
    }

    selectOption(optionIndex) {
        // Remove previous selection
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
        
        // Add selection to clicked option
        options[optionIndex].classList.add('selected');
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Enable next button
        this.updateNavigationButtons();
        this.showAnswerFeedback(optionIndex); // Pass optionIndex to feedback
    }

    nextQuestion() {
        // For weekly quizzes, stop after exactly 10 questions (index 9)
        if (this.currentMode === 'weekly' && this.currentQuestionIndex >= 9) {
            this.finishQuiz();
        } else if (this.currentMode === 'weekly' && this.currentQuestionIndex < 9) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else if (this.currentMode === 'full' && this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // For weekly quizzes, show "Finish" on question 10 (index 9)
        // For full series, show "Finish" on the last question
        let isLastQuestion = false;
        
        if (this.currentMode === 'weekly') {
            isLastQuestion = this.currentQuestionIndex === 9; // 10th question (index 9)
        } else if (this.currentMode === 'full') {
            isLastQuestion = this.currentQuestionIndex === this.currentQuestions.length - 1;
        }
        
        if (isLastQuestion) {
            nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        // For weekly quizzes, calculate progress based on 10 questions
        // For full series, calculate based on total questions
        let progress, totalQuestions;
        
        if (this.currentMode === 'weekly') {
            totalQuestions = 10;
            progress = ((this.currentQuestionIndex + 1) / 10) * 100;
            progressText.textContent = `${this.currentQuestionIndex + 1} / 10`;
        } else {
            totalQuestions = this.currentQuestions.length;
            progress = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
            progressText.textContent = `${this.currentQuestionIndex + 1} / ${this.currentQuestions.length}`;
        }
        
        progressFill.style.width = `${progress}%`;
    }

    finishQuiz() {
        this.showResults();
    }

    displayResults() {
        // Calculate score based on actual questions answered (up to 10 for weekly)
        const correctAnswers = this.calculateScore();
        const totalQuestions = this.currentMode === 'weekly' ? 10 : this.currentQuestions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const timeSpent = this.calculateTimeSpent();
        
        // Update score circle
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        
        // Update stats with required information
        document.getElementById('total-count').textContent = totalQuestions;
        document.getElementById('correct-count').textContent = correctAnswers;
        document.getElementById('incorrect-count').textContent = incorrectAnswers;
        document.getElementById('percentage-display').textContent = `${percentage}%`;
        document.getElementById('quiz-time').textContent = timeSpent;
        
        // Update title based on score
        const resultsTitle = document.getElementById('results-title');
        const resultsSubtitle = document.getElementById('results-subtitle');
        
        if (percentage >= 80) {
            resultsTitle.textContent = 'Excellent Work!';
            resultsSubtitle.textContent = 'Outstanding performance!';
        } else if (percentage >= 60) {
            resultsTitle.textContent = 'Good Job!';
            resultsSubtitle.textContent = 'Well done! Keep practicing.';
        } else {
            resultsTitle.textContent = 'Keep Practicing!';
            resultsSubtitle.textContent = 'Review the material and try again.';
        }
        
        // Store results for retake functionality
        this.lastResults = {
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            percentage,
            timeSpent
        };

        // Show retake button for both weekly and full series
        const retakeBtn = document.getElementById('retake-btn');
        if (retakeBtn) {
            retakeBtn.style.display = 'block';
        }
    }

    calculateScore() {
        let correct = 0;
        // For weekly quizzes, only check up to 10 questions
        const maxQuestions = this.currentMode === 'weekly' ? 10 : this.currentQuestions.length;
        
        for (let index = 0; index < maxQuestions; index++) {
            const userAnswer = this.userAnswers[index];
            if (userAnswer !== undefined && this.currentQuestions[index]) {
                const correctAnswer = this.currentQuestions[index].options.indexOf(this.currentQuestions[index].answer);
                if (userAnswer === correctAnswer) {
                    correct++;
                }
            }
        }
        return correct;
    }

    calculateTimeSpent() {
        const timeSpent = Date.now() - this.startTime;
        const minutes = Math.floor(timeSpent / 60000);
        const seconds = Math.floor((timeSpent % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    populateReview() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        
        // For weekly quizzes, only show up to 10 questions
        const maxQuestions = this.currentMode === 'weekly' ? 10 : this.currentQuestions.length;
        
        for (let index = 0; index < maxQuestions; index++) {
            if (this.currentQuestions[index]) {
                const question = this.currentQuestions[index];
                const userAnswer = this.userAnswers[index];
                const correctAnswer = question.options.indexOf(question.answer);
                
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                let userAnswerText = 'Not answered';
                if (userAnswer !== undefined) {
                    userAnswerText = question.options[userAnswer];
                }
                
                const isCorrect = userAnswer === correctAnswer;
                
                reviewItem.innerHTML = `
                    <div class="review-question">
                        <strong>Question ${index + 1}:</strong> ${question.question}
                    </div>
                    <div class="review-options">
                        <div class="review-option ${isCorrect ? 'correct-answer' : 'user-answer'}">
                            <strong>Your Answer:</strong> ${userAnswerText}
                        </div>
                        ${!isCorrect ? `
                            <div class="review-option correct-answer">
                                <strong>Correct Answer:</strong> ${question.answer}
                            </div>
                        ` : ''}
                    </div>
                    ${question.explanation ? `
                        <div class="review-explanation">
                            <strong>Explanation:</strong> ${question.explanation}
                        </div>
                    ` : ''}
                `;
                
                reviewContainer.appendChild(reviewItem);
            }
        }
    }

    showAnswerFeedback(optionIndex) {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const correctAnswerIndex = question.options.indexOf(question.answer);
        let feedbackMsg = '';
        let isCorrect = false;
        if (optionIndex == correctAnswerIndex) {
            feedbackMsg = 'Correct!';
            isCorrect = true;
        } else {
            feedbackMsg = 'Incorrect!';
        }
        // Show feedback alert
        this.showSimpleAlert(feedbackMsg, isCorrect, question.explanation);
    }

    showSimpleAlert(message, isCorrect, explanation) {
        let alertBox = document.getElementById('answer-alert');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'answer-alert';
            alertBox.style.position = 'fixed';
            alertBox.style.bottom = '30px';
            alertBox.style.left = '50%';
            alertBox.style.transform = 'translateX(-50%)';
            alertBox.style.zIndex = '9999';
            alertBox.style.padding = '12px 20px';
            alertBox.style.borderRadius = '8px';
            alertBox.style.fontSize = '16px';
            alertBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            alertBox.style.color = '#fff';
            alertBox.style.maxWidth = '90vw';
            document.body.appendChild(alertBox);
        }
        alertBox.style.background = isCorrect ? '#4caf50' : '#f44336';
        alertBox.innerHTML = `<strong>${message}</strong><br><span style='font-size:14px;'>${explanation || ''}</span>\n<button id='close-alert-btn' style='position:absolute;top:8px;right:12px;background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;' aria-label='Close'>&times;</button>`;
        alertBox.style.display = 'block';
        // Add close button event
        const closeBtn = document.getElementById('close-alert-btn');
        if (closeBtn) {
            closeBtn.onclick = () => { alertBox.style.display = 'none'; };
        }
        // Auto-hide after 3s unless closed manually
        setTimeout(() => {
            if (alertBox.style.display !== 'none') {
                alertBox.style.display = 'none';
            }
        }, 5500);
    }

    retakeQuiz() {
        // Redirect to homepage for retest
        this.showHome();
    }

    showError(message) {
        alert(message); // In a real app, you'd want a better error display
    }
}

// Global functions for HTML onclick handlers
let quizApp;
const link1 = "https://drive.google.com/file/d/14Cc11O3-7EoMPCtPbXqIgwOJepvPRqvc/view?usp=drive_link"
const link2 = "https://drive.google.com/file/d/136C2RXIWN3OI5S7cZZiCgJIJrrPsvKuO/view?usp=sharing"
const link3 = "https://drive.google.com/file/d/1UD9S0A7N15cR43sHXM1chSofabWmQYjr/view?usp=sharing"
const link4 = "https://drive.google.com/file/d/1Vmokhw8daGtPaHH70VCtUM7IgT6im04v/view?usp=drive_link"
const link5 = "https://drive.google.com/file/d/1phrqllcz93_8PJOfp28P7r8Aop6EqAme/view?usp=drive_link"
const link6 = "https://drive.google.com/file/d/1lYQHmlQxyna7r2iyIkCPqnoP6JRdnijl/view?usp=drive_link"
const link7 = "https://drive.google.com/file/d/17w4kpu_WMgcbQx9p1xhpLLD0EBQ42GCU/view?usp=drive_link"
const link8 = "https://drive.google.com/file/d/1OjucxQFw4ZXmm0pLWK8BbmCfjHzO7GJ0/view?usp=drive_link"
const link9 = "https://drive.google.com/file/d/1IikJFThtZzWQop5krvpUuR1xJxZ97r1_/view?usp=drive_link"
const link10 = "https://drive.google.com/file/d/1YN6cJrkQkbt2i5hogGaXVstSrw-9U6fZ/view?usp=drive_link"
const link11= "https://drive.google.com/file/d/1ogPQdnZ6uEwjSlJrCJzmekDBpMocmzkZ/view?usp=drive_link"
const link12= "https://drive.google.com/file/d/1qRQQAcRKp8XcbaW6ClNzO__XjnM7tYyC/view?usp=drive_link"
function startQuiz(mode) {
    if (mode === 'weekly') {
        quizApp.showWeeklySelection();
    } else if (mode === 'full') {
        // Show quiz screen and start full series
        quizApp.currentMode = 'full';
        quizApp.currentQuestionIndex = 0;
        quizApp.userAnswers = [];
        quizApp.startTime = Date.now();
        quizApp.currentQuestions = quizApp.quizData.full_series;
        quizApp.updateQuizInfo('Full Series', 'All Questions');
        quizApp.hideAllScreens();
        document.getElementById('quiz-screen').classList.add('active');
        quizApp.showQuestion();
        quizApp.updateProgress();
    }
}

function startLearning() {
    window.open("https://drive.google.com/drive/folders/1k0rqvinjuirc0MsXmIbkGa3sQTCR9YaN?usp=sharing","_blank");
}

function startWeeklyQuiz(WeekIndex) {
    quizApp.startWeeklyQuiz(WeekIndex);
}

function nextQuestion() {
    quizApp.nextQuestion();
}

function previousQuestion() {
    quizApp.previousQuestion();
}

function reviewAnswers() {
    quizApp.showReview();
}

function retakeQuiz() {
    quizApp.retakeQuiz();
}

function showHome() {
    quizApp.showHome();
}

function showResults() {
    quizApp.showResults();
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    quizApp = new QuizApp();
});

// Add some utility functions for better UX
function showLoading() {
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}

// Add smooth scrolling and animations
function addSmoothAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('.option-card, .week-card, .question-card').forEach(el => {
        observer.observe(el);
    });
}
const heart = document.querySelector('.heart');
const link = document.querySelector('footer a');

  link.addEventListener('click', () => {
    heart.classList.add('pop');
    setTimeout(() => heart.classList.remove('pop'), 300);
  });

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', addSmoothAnimations);
