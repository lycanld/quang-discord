let questions = [];
let correctAnswers = {};
let currentQuestionIndex = 0;
const answers = {};

const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');

function fetchQuestions() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data.questions;
      correctAnswers = {};
      questions.forEach((q, idx) => {
        correctAnswers[idx] = q.answer.toLowerCase();
      });
      renderQuestion(currentQuestionIndex);
    })
    .catch(() => {
      questionContainer.innerHTML = '<p>Failed to load questions.</p>';
    });
}

function renderQuestion(index) {
  const q = questions[index];
  if (!q) return;

  progress.textContent = `Question ${index + 1} of ${questions.length}`;

  let html = `<div class="question" id="${q.id}">
    <label>${q.question}</label>`;

  if (q.type === 'radio') {
    html += '<div class="options">';
    q.options.forEach(opt => {
      html += `<label><input type="radio" name="${q.id}" value="${opt.toLowerCase()}"><span> ${opt}</span></label>`;
    });
    html += '</div>';
  } else if (q.type === 'text') {
    html += `<input type="text" name="${q.id}" placeholder="Your answer here" />`;
  }

  html += '</div>';

  questionContainer.classList.remove('fade-out');
  questionContainer.innerHTML = html;
  restoreAnswer(index);
  attachInputListeners(index);
  updateButtons();
}

function attachInputListeners(index) {
  const inputs = questionContainer.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      answers[index] = input.type === 'radio' ? input.value : input.value.trim().toLowerCase();
      updateButtons();
    });
  });
}

function restoreAnswer(index) {
  const val = answers[index];
  if (!val) return;
  const inputs = questionContainer.querySelectorAll('input');
  inputs.forEach(input => {
    if (input.type === 'radio' && input.value === val) {
      input.checked = true;
    } else if (input.type === 'text') {
      input.value = val;
    }
  });
}

function updateButtons() {
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next';
  nextBtn.disabled = !answers[currentQuestionIndex];
}

prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
  }
});

nextBtn.addEventListener('click', () => {
  const answer = answers[currentQuestionIndex];
  if (!answer) return;

  const correct = correctAnswers[currentQuestionIndex];
  const failMsg = questions[currentQuestionIndex].failureMessage || 'Incorrect answer.';

  if (answer !== correct) {
    questionContainer.classList.add('fade-out');
    setTimeout(() => {
      questionContainer.innerHTML = `
        <div class="failure-message">
          ❌ ${failMsg}
        </div>
      `;
      questionContainer.classList.remove('fade-out');
    }, 600);
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
  } else {
    questionContainer.classList.add('fade-out');
    setTimeout(() => {
      questionContainer.innerHTML = `
        <div class="success-message">
          ✅ Oke Rồi! Bạn đã trả lời đúng hết các câu hỏi!<br>
          <a href="https://discord.gg/XsPJTvA4jk" target="_blank" rel="noopener noreferrer">
            👉 Click here to join the Discord server
          </a>
        </div>
      `;
      questionContainer.classList.remove('fade-out');
    }, 600);
  }
});

fetchQuestions();
