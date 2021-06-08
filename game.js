'use strict';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import {
    AJAXCall
} from './helper.js'


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

const modal = document.querySelector('.myModal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const pointsHighlight = document.querySelector('.highlight');
const usernameInput = document.querySelector('#username');
const saveScoreBtn = document.querySelector('#saveScore');
const playAgainBtn = document.querySelector('.btn-play-again');
const highScoreBtn = document.querySelector('.btn-highScore');

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


const loadData = async function () {
    try {
        const data = await AJAXCall(`https://opentdb.com/api.php?amount=30&category=${category}&difficulty=easy&type=multiple`);
        questions = data.results.map(question => {
            //create array of question objects
            const questionFormatted = {
                question: question.question
            };

            //array of choices - splice in correct answer at random generated answer number
            const choices = [...question.incorrect_answers];
            questionFormatted.answer = Math.floor(Math.random() * 4) + 1;
            choices.splice(questionFormatted.answer - 1, 0, question.correct_answer);

            //format each choice in obj
            choices.forEach((choice, index) => {
                questionFormatted['choice' + (index + 1)] = choice;
            });
            return questionFormatted;

            // questionFormatted structure
            // {
            //     answer: 3
            //     choice1: "Birdie"
            //     choice2: "Bogey"
            //     choice3: "Eagle"
            //     choice4: "Albatross"
            //     question: "In golf, what name is given to a hole score of two under par?"
            // }
        });
        gameInit();

    } catch (error) {
        console.error(error);
        throw error;
    }

}
loadData();


const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

const gameInit = () => {
    //reset counters
    score = 0;
    right = 0;
    wrong = 0;
    questionCounter = 0;
    // currentActive = 1;
    //create new array of questions
    availableQuestions = [...questions];
    getNewQuestion();
    document.querySelector('.loadingWheel').classList.add('hidden');
    document.querySelector('.game-card').classList.remove('hidden');
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

    //redirect to highScores
    window.location.assign('index.html#scores');
}

modal.addEventListener('click', function (ev) {
    // ev.preventDefault();
    const clicked = ev.target.closest('#saveScore');
    if (!clicked) return;
    saveHighScore(ev);
});

// modal.addEventListener('click', function (ev) {
//     const clicked = ev.target.closest('.btn-highScore');
//     if (!clicked) return

// })