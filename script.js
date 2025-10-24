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
            weekCard.onclick = () => this.startWeeklyQuiz(index);
            
            weekCard.innerHTML = `
                <h3>${Week.Week_name}</h3>
                <p>10 Questions</p>
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

        // Show retake button only for weekly mode
        const retakeBtn = document.getElementById('retake-btn');
        if (retakeBtn) {
            retakeBtn.style.display = this.currentMode === 'weekly' ? 'block' : 'none';
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

function startQuiz(mode) {
    if (mode === 'weekly') {
        quizApp.showWeeklySelection();
    } else if (mode === 'full') {
        quizApp.startQuiz('full');
    }
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

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', addSmoothAnimations);
