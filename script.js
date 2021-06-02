let getHighScores = JSON.parse(localStorage.getItem('highScores')) || [];
const scoreList = document.querySelector('.highScoreList');

const startGameBtn = document.querySelector('.btn-start-game');

let lastScore = 100;

const filter = document.querySelector('.filterSelect');
const selectedChoice = document.querySelector('.questionChoice');

selectedChoice.addEventListener('change', function (ev) {
    category = event.target.value;
    localStorage.setItem('category', category);
    startGameBtn.classList.remove('disable-btn');
});


filter.addEventListener('change', function (ev) {
    category = event.target.value;
    let rank = getHighScores ? 0 : 1;

    if (category === 'all') {
        retrieveScores(getHighScores);
    } else {
        const [...filteredScores] = getHighScores.filter(score => categories[score.category] === category);
        retrieveScores(filteredScores);
    }
});

const categories = {
    9: 'General Knowledge',
    21: 'Sport',
    14: 'TV Shows',
    11: 'Movies',
    17: 'Science & Nature',
    18: 'Computer Science'
}

const retrieveScores = function (scores) {
    scoreList.innerHTML = '';
    lastScore = 100;
    let rank = scores ? 0 : 1;
    scores.forEach((score, index) => {
        //retrieve prev score
        !scores[(index - 1)] ? lastScore : lastScore = scores[(index - 1)].score;
        //check if rank should be increased.
        score.score < lastScore ? rank++ : rank;
        //update UI
        scoreList.innerHTML +=
            `<tr>
            <td>${categories[score.category]}</td>
            <td>${rank}</td>
            <td>${score.username}</td>
            <td>${score.score}</td> 
        </tr>`;
    })
}

//smooth scroll to high score section
document.querySelector('.btn-highScore').addEventListener('click', function (ev) {
    ev.preventDefault();
    document.querySelector('#scores').scrollIntoView({
        behavior: 'smooth'
    });
})

retrieveScores(getHighScores);