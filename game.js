'use strict';

const question = document.querySelector('#question');
const answerChoices = Array.from(document.querySelectorAll('.choice-text'));
const questionArea = document.querySelector('.game-box__question-box');
const correctLabel = document.querySelector('#correct');
const incorrectLabel = document.querySelector('#incorrect');
const pointsLabel = document.querySelector('#points');
const timerLabel = document.querySelector('#timer');
const timeIcon = document.querySelector('.score-box i:last-child');

const questionNumberLabel = document.querySelector('#question-number');
const totalQuestionsLabel = document.querySelector('#total-questions');

const progress = document.querySelector('#progress');
const circles = document.querySelectorAll('.circle');

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const pointsHighlight = document.querySelector('.highlight');
const usernameInput = document.querySelector('#username');
const saveScoreBtn = document.querySelector('#saveScore');

let currentQuestion = {};
let acceptingAnswers = false;
let answered = false;
let score = 0;
let right = 0;
let wrong = 0;
let questionCounter = 0;
let availableQuestions = [];
let answeredIncorrect = [];
let currentActive = 1;

let questions = [];

const category = localStorage.getItem('category');

fetch(
        `https://opentdb.com/api.php?amount=30&category=${category}&difficulty=easy&type=multiple`
    )
    .then((response) => response.json())
    .then((apiQuestions) => {
        questions = apiQuestions.results.map((question) => {
            const questionFormatted = {
                question: question.question,
            };

            const choices = [...question.incorrect_answers];
            questionFormatted.answer = Math.floor(Math.random() * 4) + 1;
            choices.splice(questionFormatted.answer - 1, 0, question.correct_answer);

            choices.forEach((choice, index) => {
                questionFormatted['choice' + (index + 1)] = choice;
            });
            return questionFormatted;
        });
        gameInit();
    })
    .catch((error) => console.error(error));

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

const gameInit = () => {
    //reset counters
    score = 0;
    right = 0;
    wrong = 0;
    questionCounter = 0;
    currentActive = 1;
    //create new array of questions
    availableQuestions = [...questions];
    getNewQuestion();
    document.querySelector('.loadingWheel').classList.add('hidden');
    document.querySelector('.game-box').classList.remove('hidden');
};

function getNewQuestion() {
    if (availableQuestions === 0 || questionCounter >= MAX_QUESTIONS) {
        //save score to local Storage
        localStorage.setItem('lastestScore', score);
        //game complete modal overview
        openModal();
        acceptingAnswers = false;
    }
    questionCounter++;
    answered = false;

    if (questionNumberLabel) {
        questionNumberLabel.textContent = `${questionCounter} / 10`;
    }

    const randomQuestionNumber = Math.floor(
        Math.random() * availableQuestions.length
    );
    currentQuestion = availableQuestions[randomQuestionNumber];
    if (question) {
        question.innerHTML = currentQuestion.question;
    }
    answerChoices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerHTML = currentQuestion['choice' + number];
    });

    availableQuestions.splice(randomQuestionNumber, 1);

    acceptingAnswers = true;

    if (questionCounter > 1) currentActive++;
    updateProgressBar();

    startQuestionTimer();
}

if (questionArea) {
    questionArea.addEventListener('click', function (ev) {
        //get answer user selected using bubbling
        const clicked = ev.target.closest('.choice-text');
        if (!clicked || !acceptingAnswers) return;

        answered = true;
        acceptingAnswers = false;
        const selectedAnswer = clicked.dataset.number;

        const answerApplyClass = +selectedAnswer === currentQuestion.answer ? 'correct' : 'incorrect';
        clicked.parentNode.classList.add(answerApplyClass);

        answerApplyClass === 'correct' ?
            updateCorrect(CORRECT_BONUS) :
            updateIncorrect();

        setTimeout(function () {
            clicked.parentNode.classList.remove(answerApplyClass);
            document
                .querySelector(`[data-number='${currentQuestion.answer}']`)
                .parentNode.classList.remove('correct');
            getNewQuestion();
        }, 2000);

        function updateCorrect(num) {
            score += num;
            right++;
            pointsLabel.textContent = score;
            correctLabel.textContent = right;
        }

        function updateIncorrect() {
            wrong++;
            incorrectLabel.textContent = wrong;
            document
                .querySelector(`[data-number='${currentQuestion.answer}']`)
                .parentNode.classList.add('correct');
        }
    });
}

// circle starts 1, index = 0. set all indexes less than currentActive (circle) to active. remove class from those with a higher index
function updateProgressBar() {
    circles.forEach((circle, index) => {
        if (index < currentActive) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    });

    //get all those with an active class, divide by all circles for percentage. 25% increments wont line up. -1 from each to get 33% increments.
    const actives = document.querySelectorAll('.active');
    progress.style.width =
        ((actives.length - 1) / (circles.length - 1)) * 100 + '%';
    // console.log(((actives.length - 1) / (circles.length - 1)) * 100 + '%');
}

const startQuestionTimer = function () {
    let sec = 20;
    timeIcon.classList.remove('warning');

    function tick() {
        // In each call, print the remaining time to UI
        sec > 10 ?
            (timerLabel.textContent = sec.toString()) :
            (timerLabel.textContent = sec.toString().padStart(2, '0'));

        //add low time warning class
        if (sec <= 10) {
            timeIcon.classList.add('warning');
        }
        //stop/reset timer when Qu answered.
        if (answered) {
            clearInterval(timer);
            sec = sec;
        }
        // When 0 seconds, stop timer and end game
        if (sec === 0) {
            clearInterval(timer);
            openModal();
        }
        // Decrease 1s while not answered
        if (!answered) sec--;
    }

    // Call the timer every second
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};

// END GAME MODAL

function openModal() {
    pointsHighlight.textContent = score;
    if (score === 0) {
        usernameInput.disabled = true;
        saveScoreBtn.disabled = true;
    }

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    // console.log(answeredIncorrect);
}

function closeModal() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    return window.location.assign('index.html');
}

if (btnCloseModal || overlay) {
    btnCloseModal.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

usernameInput.addEventListener('keyup', function () {
    saveScoreBtn.disabled = !usernameInput.value;
});

let lastestScore = localStorage.getItem('lastestScore');
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function saveHighScore(event) {
    event.preventDefault();
    window.document.addEventListener('keypress', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
    // console.log(lastestScore);

    const playerScore = {
        category: category,
        score: score,
        username: usernameInput.value,
    };
    //ADD / SORT /SET LIMIT
    highScores.push(playerScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10);

    localStorage.setItem('highScores', JSON.stringify(highScores));

    //direct to highScores
    window.location.assign('index.html#scores');
}

modal.addEventListener('click', function (ev) {
    ev.preventDefault();
    const clicked = ev.target.closest('#saveScore');
    if (!clicked) return;
    saveHighScore(ev);
});