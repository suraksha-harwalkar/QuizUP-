import {questionPool} from "./questionPool.js";

"use strict";

const timeInitial = 240;
var timer;
var time;
var pool = questionPool.map(q => {return {...q}}).slice();
var questions = []
var player = {name: "", numCorrectAnswers: 0, percentageOfCorrectAnswers: 0};

function createEventListeners() {
  var nameForm = document.getElementById("name-form");
  var replayButton = document.getElementById("replay");
  var resetButton = document.getElementById("reset");
  var startNewGameButtons = document.getElementsByClassName("start-new-game");
  
  if (nameForm.addEventListener) {
    nameForm.addEventListener("submit", onNameFormSubmit);
  } else if (nameForm.attachEvent) {
    nameForm.attachEvent("onsubmit", onNameFormSubmit);
  }

  if (replayButton.addEventListener) {
    replayButton.addEventListener("click", replay);
  } else if (replayButton.attachEvent) {
    replayButton.attachEvent("onclick", replay);
  }

  if (resetButton.addEventListener) {
    resetButton.addEventListener("click", reset);
  } else if (resetButton.attachEvent) {
    resetButton.attachEvent("onclick", reset);
  }

  for (var i = 0; i < startNewGameButtons.length; i++) {
    if (startNewGameButtons[i].addEventListener) {
      startNewGameButtons[i].addEventListener("click", startNewGame);
    } else if (startNewGameButtons[i].attachEvent) {
      startNewGameButtons[i].attachEvent("onclick", startNewGame);
    }
  }
}

function generateDetailedResults() {
  var resultsDetailed = document.getElementById("results-detailed");

  while (resultsDetailed.hasChildNodes()) {
    resultsDetailed.removeChild(resultsDetailed.firstChild);
  }
  
  if (questions.length > 0) {
    for (var i = 0; i < questions.length; i++) {
      var entry = document.createElement("div");
      entry.className = "results-entry";
  
      var question = questions[i];
      var isCorrect = question.answer === question.answers[question.correctAnswerIndex]
      
      entry.innerHTML = `
        <div class="results-entry-top">
          <p>${i + 1}.</p>
          <p class="results-entry-correctness">${isCorrect ? "Correct" : "Incorrect"}</p>
        </div>
        <div class="results-entry-bottom">
          <div class="results-entry-q-container">
            <p class="results-entry-question">${question.question}</p>
          </div>
          <div class="results-entry-answers">
            <ul>
            </ul>
          </div>
        </div>
      `
  
      var correctness = entry.getElementsByClassName("results-entry-top")[0];
      correctness.style.backgroundColor = isCorrect ? "#0b0" : "#f00";
  
      var resultsEntryAnswersList = entry.querySelector(".results-entry-answers ul");
  
      for (var j = 0; j < question.answers.length; j++) {
        var li = document.createElement("li");
  
        li.className = "results-entry-answer";
        li.innerHTML = question.answers[j];
  
        if (question.answers[j] === question.answer) {
          li.style.fontWeight = "bold";
          li.style.color = isCorrect ? "#0b0" : "#f00";
        }
  
        if (j === question.correctAnswerIndex) {
          li.style.color = "#0b0";
        }
  
        resultsEntryAnswersList.appendChild(li);
      }
  
      resultsDetailed.appendChild(entry);
    }
  } else {
    var p = document.createElement("p");
    p.id = "no-questions-answered";
    p.innerHTML = "No questions answered."

    resultsDetailed.appendChild(p);
  }
}

function generateLeaderboards() {
  var leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  var leaderboardCorrectAnswers = document.querySelector("#leaderboard-correct-answers tbody");
  var leaderboardAccuracy = document.querySelector("#leaderboard-accuracy tbody");

  while (leaderboardCorrectAnswers.hasChildNodes()) {
    leaderboardCorrectAnswers.removeChild(leaderboardCorrectAnswers.lastChild);
  }
  
  while (leaderboardAccuracy.hasChildNodes()) {
    leaderboardAccuracy.removeChild(leaderboardAccuracy.lastChild);
  }
 
  leaderboard.sort(function (a, b) {return b.numCorrectAnswers - a.numCorrectAnswers});
  
  for (var i = 0; i < leaderboard.length; i++) {
    var tr = document.createElement("tr");
    var playerTd = document.createElement("td");
    var accuaryTd = document.createElement("td");

    playerTd.innerHTML = leaderboard[i].name;
    accuaryTd.innerHTML = leaderboard[i].numCorrectAnswers;

    tr.appendChild(playerTd);
    tr.appendChild(accuaryTd);

    leaderboardCorrectAnswers.appendChild(tr);
  }

  leaderboard.sort(function (a, b) {return b.percentageOfCorrectAnswers - a.percentageOfCorrectAnswers});

  for (var i = 0; i < leaderboard.length; i++) {
    var tr = document.createElement("tr");
    var playerTd = document.createElement("td");
    var accuaryTd = document.createElement("td");

    playerTd.innerHTML = leaderboard[i].name;
    accuaryTd.innerHTML = Math.round((leaderboard[i].percentageOfCorrectAnswers + Number.EPSILON) * 100) / 100;

    tr.appendChild(playerTd);
    tr.appendChild(accuaryTd);

    leaderboardAccuracy.appendChild(tr);
  }
}

function generateResults() {
  if (questions.length > 0 && questions[questions.length - 1].answer === "") {
    questions.pop();
  }

  var coreGameContainer = document.getElementById("core-game-container");
  var resultsContainer = document.getElementById("results-container");
 
  coreGameContainer.style.display = "none";
  resultsContainer.style.display = "block";

  var quizResults = document.getElementById("quiz-results");

  while (quizResults.hasChildNodes()) {
    quizResults.removeChild(quizResults.firstChild);
  }

  player.numCorrectAnswers = questions.filter(question => question.answer === question.answers[question.correctAnswerIndex]).length;
  player.percentageOfCorrectAnswers = questions.length === 0 ? 0 : (player.numCorrectAnswers / questions.length) * 100;

  quizResults.innerHTML = `
    <h3 id="quiz-results-name">${player.name}</h3>
    <p id="quiz-results-percentage">${Math.round(player.percentageOfCorrectAnswers)}%</p>
    <div id="quiz-results-questions">
      <p id="quiz-results-num-questions">${questions.length} questions</p>
      <p id="correct-v-incorrect"><span>${player.numCorrectAnswers} correct</span> | <span>${questions.length - player.numCorrectAnswers} incorrect</span></p>
    </div>
  `

  var leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(player);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  generateLeaderboards();
  generateDetailedResults();
}

function loadQuestion() {
  var poolIdx = Math.floor(Math.random() * pool.length);

  questions.push(pool[poolIdx]);
  pool.splice(poolIdx, 1);

  var question = document.getElementById("question");
  var questionNum = document.getElementById("q-num");
  var answers = document.getElementById("answers");

  question.innerHTML = questions[questions.length - 1].question;
  questionNum.innerHTML = questions.length;

  while (answers.hasChildNodes()) {
    answers.removeChild(answers.lastChild);
  }

  for (var i = 0; i < questions[questions.length - 1].answers.length; i++) {
    var answer = document.createElement("button");

    answer.innerHTML = questions[questions.length - 1].answers[i];
    answer.className = "answer";

    answer.addEventListener("click", onAnswerSelect);

    answers.appendChild(answer);
  }
}

function onAnswerSelect() {
  questions[questions.length - 1]["answer"] = this.innerHTML;

  if (pool.length > 0) {
    loadQuestion();
  } else {
    clearInterval(timer);
    generateResults();
  }
}

function onNameFormSubmit(e) {
  e.preventDefault();
  
  var name = document.getElementsByName("name")[0].value;
  var error = document.querySelector("#name-form .error");
  var coreGameContainer = document.getElementById("core-game-container");
  var nameForm = document.getElementById("name-form");
  var nameEl = document.getElementById("player-name");

  var coreGameContainerDisplay;
  var nameFormDisplay;
  var errorDisplay;

  try {
    if (name === "" || /^\s+$/.test(name)) {
      throw "Name must not be blank."
    }

    player.name = name;
    nameEl.innerHTML = name;

    coreGameContainerDisplay = "block";
    nameFormDisplay = "none";
    errorDisplay = "none";

    loadQuestion();
    resetTimer();
  } catch (msg) {
    error.innerHTML = msg;
    coreGameContainerDisplay = "none";
    nameFormDisplay = "block";
    errorDisplay = "block";
  } finally {
    coreGameContainer.style.display = coreGameContainerDisplay;
    nameForm.style.display = nameFormDisplay;
    error.style.display = errorDisplay;
  }
}

function renderTimer() {
  var canvas = document.getElementById("timer");
  var context = canvas.getContext("2d");

  var cw = canvas.width;
  var ch = canvas.height;

  context.clearRect(0, 0, cw, ch);

  context.strokeStyle = "#000";
  context.lineWidth = 5;

  var endAngle = ((-0.5 / 90) * ((360 * (time / timeInitial)) % 360) + 2) * Math.PI - (90 * (Math.PI / 180));

  context.beginPath();
  context.arc(cw * 0.5, ch * 0.5, cw * 0.4, -90 * (Math.PI / 180), endAngle, true);
  context.stroke();
 
  context.strokeStyle = "#0001";
  context.beginPath();
  context.arc(cw * 0.5, ch * 0.5, cw * 0.4, 0, 2 * Math.PI);
  context.stroke();

  var minutes = Math.floor(time / 60);
  var seconds = time % 60;

  context.font = "16px Arial"
  context.textAlign = "center"
  context.fillText(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`, cw * 0.5, ch * 0.57)
}

function replay() {
  reset();

  player.numCorrectAnswers = 0;
  player.percentageOfCorrectAnswers = 0;
  
  var coreGameContainer = document.getElementById("core-game-container");
  var resultsContainer = document.getElementById("results-container");

  coreGameContainer.style.display = "block";
  resultsContainer.style.display = "none";
}

function reset() {
  resetQuestions();
  loadQuestion();
  resetTimer();
}

function resetQuestions() {
  pool = questionPool.map(q => {return {...q}}).slice();
  questions = [];
}

function resetTimer() {
  clearInterval(timer);
  time = timeInitial;
  updateTimer(false);
  timer = setInterval(updateTimer, 1000);
}

function setup() {
  createEventListeners();
}

function startNewGame() {
  clearInterval(timer);
  resetQuestions();
  
  player = {name: "", numCorrectAnswers: 0, percentageOfCorrectAnswers: 0};

  var nameForm = document.getElementById("name-form");
  var coreGameContainer = document.getElementById("core-game-container")
  var resultsContainer = document.getElementById("results-container");

  nameForm.style.display = "block";
  coreGameContainer.style.display = "none";
  resultsContainer.style.display = "none";
}

function updateTimer(mutate = true) {
  if (mutate)
    time--;

  if (time === 0) {
    clearInterval(timer);
    generateResults();
  } else {
    renderTimer();
  }
}

if (window.addEventListener) {
  window.addEventListener("load", setup, false);
} else if (window.attachEvent) {
  window.attachEvent("onload", setup);
}