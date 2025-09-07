// State variables
let numQuestions = 0;
let timeLimit = 0;
let examName = '';
let questionTypes = [];
let timerInterval = null;
let userAnswers = []; // Store user's answers

// Get DOM elements
const startScreen = document.getElementById('start-screen');
const typeSelectionScreen = document.getElementById('type-selection-screen');
const testScreen = document.getElementById('test-screen');
const answerKeyScreen = document.getElementById('answer-key-screen');
const resultsScreen = document.getElementById('results-screen');

const numQuestionsInput = document.getElementById('num-questions');
const timeLimitInput = document.getElementById('time-limit');
const examNameInput = document.getElementById('exam-name');
const proceedBtn = document.getElementById('proceed-btn');

const questionTypesContainer = document.getElementById('question-types-container');
const goBackBtn = document.getElementById('go-back-btn');
const generateUIBtn = document.getElementById('generate-ui-btn');

const testTitle = document.getElementById('test-title');
const timerDisplay = document.getElementById('timer');
const questionsContainer = document.getElementById('questions-container');
const submitExamBtn = document.getElementById('submit-exam-btn');

const answerKeyInputs = document.getElementById('answer-key-inputs');
const backToTestBtn = document.getElementById('back-to-test-btn');
const calculateResultsBtn = document.getElementById('calculate-results-btn');

const resultsDisplay = document.getElementById('results-display');
const restartBtn = document.getElementById('restart-btn');

// Functions to show/hide screens
function showStartScreen() {
    startScreen.classList.remove('hidden');
    typeSelectionScreen.classList.add('hidden');
    testScreen.classList.add('hidden');
    answerKeyScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
}

function showTypeSelectionScreen() {
    startScreen.classList.add('hidden');
    typeSelectionScreen.classList.remove('hidden');
    testScreen.classList.add('hidden');
    answerKeyScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    generateQuestionTypeDropdowns();
}

function showTestScreen() {
    startScreen.classList.add('hidden');
    typeSelectionScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    answerKeyScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    generateTestUI();
}

function showAnswerKeyScreen() {
    startScreen.classList.add('hidden');
    typeSelectionScreen.classList.add('hidden');
    testScreen.classList.add('hidden');
    answerKeyScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    generateAnswerKeyInputs();
}

function showResultsScreen(resultsData) { // Changed argument name to avoid conflict
    startScreen.classList.add('hidden');
    typeSelectionScreen.classList.add('hidden');
    testScreen.classList.add('hidden');
    answerKeyScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    displayResults(resultsData); // Pass the entire resultsData object
}

// Event Listeners
proceedBtn.addEventListener('click', () => {
    numQuestions = parseInt(numQuestionsInput.value, 10);
    timeLimit = parseInt(timeLimitInput.value, 10);
    examName = examNameInput.value || 'CBT Test';

    if (numQuestions > 0 && timeLimit > 0) {
        showTypeSelectionScreen();
    } else {
        showModal('Please enter valid numbers for questions and time limit.');
    }
});

goBackBtn.addEventListener('click', () => {
    numQuestions = 0;
    timeLimit = 0;
    examName = '';
    questionTypes = [];
    showStartScreen();
});

generateUIBtn.addEventListener('click', () => {
    // Read selected question types from dropdowns
    questionTypes = [];
    const dropdowns = questionTypesContainer.querySelectorAll('select');
    dropdowns.forEach(dropdown => {
        questionTypes.push(dropdown.value);
    });
    showTestScreen();
});

submitExamBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    userAnswers = captureAnswers(); // Capture user answers before going to answer key screen
    showAnswerKeyScreen();
});

backToTestBtn.addEventListener('click', () => {
    showTestScreen(); // Go back to the test screen if needed
});

calculateResultsBtn.addEventListener('click', () => {
    const answerKey = captureAnswerKey();
    const resultsData = calculateScores(userAnswers, answerKey); // Get the object containing totalScore, maxPossibleScore, and individual results
    showResultsScreen(resultsData);
});

restartBtn.addEventListener('click', () => {
    showStartScreen();
});

// Function to generate the dropdowns for question types
function generateQuestionTypeDropdowns() {
    questionTypesContainer.innerHTML = ''; // Clear previous dropdowns
    for (let i = 1; i <= numQuestions; i++) {
        const div = document.createElement('div');
        div.classList.add('input-group');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '0.2rem'; /* Reduced gap */
        div.innerHTML = `
            <label class="font-semibold" style="width: 33.333333%;">Ques ${i}:</label>
            <select class="flex-grow bg-[#ffffff] border border-[#000000] px-4 py-2 text-sm">
                <option value="scq">Single Option Correct</option>
                <option value="mcq">Multiple Options Correct</option>
                <option value="numerical">Numerical</option>
            </select>
        `;
        questionTypesContainer.appendChild(div);
    }
}

// Function to generate the test UI
function generateTestUI() {
    testTitle.textContent = examName;
    questionsContainer.innerHTML = ''; // Clear previous questions

    questionTypes.forEach((type, index) => {
        const questionNumber = index + 1;
        const questionCard = document.createElement('div');
        questionCard.classList.add('question-card');

        let questionContent = `
            <h3 class="question-text">Ques ${questionNumber}:</h3>
        `;

        if (type === 'scq') {
            // Single Option Correct (Radio buttons)
            questionContent += `
                <div style="margin-top: 0.1rem;"> <div class="option-item">
                        <input type="radio" id="q${questionNumber}-a" name="q${questionNumber}" value="a">
                        <label for="q${questionNumber}-a">A</label>
                    </div>
                    <div class="option-item">
                        <input type="radio" id="q${questionNumber}-b" name="q${questionNumber}" value="b">
                        <label for="q${questionNumber}-b">B</label>
                    </div>
                    <div class="option-item">
                        <input type="radio" id="q${questionNumber}-c" name="q${questionNumber}" value="c">
                        <label for="q${questionNumber}-c">C</label>
                    </div>
                    <div class="option-item">
                        <input type="radio" id="q${questionNumber}-d" name="q${questionNumber}" value="d">
                        <label for="q${questionNumber}-d">D</label>
                    </div>
                </div>
            `;
        } else if (type === 'mcq') {
            // Multiple Options Correct (Checkboxes)
            questionContent += `
                <div style="margin-top: 0.1rem;"> <div class="option-item">
                        <input type="checkbox" id="q${questionNumber}-a" name="q${questionNumber}-options" value="a">
                        <label for="q${questionNumber}-a">A</label>
                    </div>
                    <div class="option-item">
                        <input type="checkbox" id="q${questionNumber}-b" name="q${questionNumber}-options" value="b">
                        <label for="q${questionNumber}-b">B</label>
                    </div>
                    <div class="option-item">
                        <input type="checkbox" id="q${questionNumber}-c" name="q${questionNumber}-options" value="c">
                        <label for="q${questionNumber}-c">C</label>
                    </div>
                    <div class="option-item">
                        <input type="checkbox" id="q${questionNumber}-d" name="q${questionNumber}-options" value="d">
                        <label for="q${questionNumber}-d">D</label>
                    </div>
                </div>
            `;
        } else if (type === 'numerical') {
            // Numerical Input
            questionContent += `
                <div class="input-group">
                    <input type="number" id="q${questionNumber}-numerical" class="w-1/2 px-4 py-2 bg-[#ffffff] border border-[#000000] outline-none">
                </div>
            `;
        }

        questionContent += `
            <div style="margin-top: 0.2rem; text-align: right;"> <button class="clear-response-btn btn" style="background-color: #000000; padding: 0.1rem 0.2rem; font-size: 0.875rem;" data-question="${questionNumber}">
                    Clear Response
                </button>
            </div>
        `;

        questionCard.innerHTML = questionContent;
        questionsContainer.appendChild(questionCard);
    });

    // Add event listeners for clear buttons
    questionsContainer.querySelectorAll('.clear-response-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const questionNumber = e.target.getAttribute('data-question');
            const questionCard = btn.closest('.question-card');

            const radioButtons = questionCard.querySelectorAll(`input[name="q${questionNumber}"]`);
            radioButtons.forEach(radio => radio.checked = false);

            const checkboxes = questionCard.querySelectorAll(`input[name="q${questionNumber}-options"]`);
            checkboxes.forEach(checkbox => checkbox.checked = false);

            const numericalInput = questionCard.querySelector(`#q${questionNumber}-numerical`);
            if (numericalInput) {
                numericalInput.value = '';
            }
        });
    });

    // Start the timer
    startTimer(timeLimit);
}

// Timer function
function startTimer(minutes) {
    let totalSeconds = minutes * 60;
    const timerElement = document.getElementById('timer');
    timerInterval = setInterval(() => {
        const minutesLeft = Math.floor(totalSeconds / 60);
        const secondsLeft = totalSeconds % 60;

        const formattedTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
        timerElement.textContent = `Time Remaining: ${formattedTime}`;

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            showModal('Time is up! The exam has been automatically submitted.');
            userAnswers = captureAnswers();
            showAnswerKeyScreen();
        } else {
            totalSeconds--;
        }
    }, 1000);
}

// Function to capture all user answers
function captureAnswers() {
    const answers = [];
    questionTypes.forEach((type, index) => {
        const questionNumber = index + 1;
        let userAnswer = '';
        if (type === 'scq') {
            const checkedRadio = document.querySelector(`input[name="q${questionNumber}"]:checked`);
            if (checkedRadio) {
                userAnswer = checkedRadio.value.toUpperCase();
            }
        } else if (type === 'mcq') {
            const checkedCheckboxes = document.querySelectorAll(`input[name="q${questionNumber}-options"]:checked`);
            if (checkedCheckboxes.length > 0) {
                userAnswer = Array.from(checkedCheckboxes).map(cb => cb.value.toUpperCase()).sort().join(',');
            }
        } else if (type === 'numerical') {
            const numericalInput = document.getElementById(`q${questionNumber}-numerical`);
            if (numericalInput && numericalInput.value.trim() !== '') {
                userAnswer = numericalInput.value;
            }
        }
        answers.push({ question: questionNumber, type: type, answer: userAnswer });
    });
    return answers;
}

// Function to generate answer key input fields
function generateAnswerKeyInputs() {
    answerKeyInputs.innerHTML = ''; // Clear previous inputs
    questionTypes.forEach((type, index) => {
        const questionNumber = index + 1;
        const div = document.createElement('div');
        div.classList.add('input-group');
        div.innerHTML = `
            <label>Ques ${questionNumber} (${type.toUpperCase()}):</label>
            <input type="text" id="answer-key-q${questionNumber}" placeholder="Enter correct answer(s)" class="flex-grow bg-[#ffffff] border border-[#000000] px-4 py-2 text-sm">
        `;
        answerKeyInputs.appendChild(div);
    });
}

// Function to capture the answer key
function captureAnswerKey() {
    const answerKey = [];
    questionTypes.forEach((type, index) => {
        const questionNumber = index + 1;
        const inputElement = document.getElementById(`answer-key-q${questionNumber}`);
        let correctAnswer = '';
        if (inputElement && inputElement.value.trim() !== '') {
            let inputValue = inputElement.value.toUpperCase().trim();
            if (type === 'mcq' && !inputValue.includes(',')) {
                correctAnswer = inputValue.split('').sort().join(',');
            } else {
                correctAnswer = inputValue.split(',').map(s => s.trim()).sort().join(',');
            }
        }
        answerKey.push({ question: questionNumber, type: type, answer: correctAnswer });
    });
    return answerKey;
}

// Function to calculate scores
function calculateScores(userAnswers, answerKey) {
    let totalScore = 0;
    let maxPossibleScore = 0; // Initialize max possible score
    const results = [];

    userAnswers.forEach((userAns, index) => {
        const correctAns = answerKey[index];
        let score = 0;
        let status = 'Incorrect';

        // Each question contributes 4 to the max possible score
        maxPossibleScore += 4;

        if (userAns.answer === correctAns.answer && userAns.answer !== '') {
            status = 'Correct';
            if (userAns.type === 'scq' || userAns.type === 'numerical') {
                score = 4;
            } else if (userAns.type === 'mcq') {
                score = 4;
            }
        } else if (userAns.answer === '' || userAns.answer === 'NONE') {
            status = 'Unattempted';
            score = 0;
        }
        else {
            if (userAns.type === 'scq' || userAns.type === 'numerical') {
                score = -1;
            } else if (userAns.type === 'mcq') {
                score = -2;
            }
        }
        totalScore += score;
        results.push({
            question: userAns.question,
            userAnswer: userAns.answer === '' ? 'Unattempted' : userAns.answer,
            correctAnswer: correctAns.answer === '' ? 'Not provided' : correctAns.answer,
            status: status,
            score: score
        });
    });

    return { totalScore: totalScore, maxPossibleScore: maxPossibleScore, results: results };
}

// Function to display the results
function displayResults(resultsData) { // Takes the resultsData object
    resultsDisplay.innerHTML = ''; // Clear previous results

    const totalScoreElement = document.createElement('h2');
    totalScoreElement.classList.add('text-2xl', 'font-bold', 'mb-4');
    totalScoreElement.style.textAlign = 'center';
    totalScoreElement.textContent = `Total Score: ${resultsData.totalScore}/${resultsData.maxPossibleScore}`; // Display total and max score
    resultsDisplay.appendChild(totalScoreElement);

    if (resultsData.results.length === 0) {
        resultsDisplay.innerHTML += '<p style="text-align: center;">No questions were answered.</p>';
        return;
    }

    resultsData.results.forEach(result => { // Iterate over the individual results
        const resultCard = document.createElement('div');
        resultCard.classList.add('result-card');

        let statusColor = '';
        if (result.status === 'Correct') {
            statusColor = 'green';
        } else if (result.status === 'Incorrect') {
            statusColor = 'red';
        } else {
            statusColor = 'gray';
        }

        resultCard.innerHTML = `
            <h3 class="font-bold text-lg mb-2">Ques ${result.question}</h3>
            <p>Your Answer: ${result.userAnswer}</p>
            <p>Correct Answer: ${result.correctAnswer}</p>
            <p style="color: ${statusColor};">Status: ${result.status} (Score: ${result.score})</p>
        `;
        resultsDisplay.appendChild(resultCard);
    });
}


// Custom modal function to replace alert()
function showModal(message) {
    const modalHtml = `
        <div id="custom-modal" style="position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 50;">
            <div style="background-color: #ffffff; padding: 2rem; border: 1px solid #000000; max-width: 24rem; width: 100%; text-align: center; border-radius: 0.5rem;">
                <p style="color: #000000; margin-bottom: 1.5rem;">${message}</p>
                <button id="close-modal-btn" style="padding: 0.5rem 1.5rem; background-color: #000000; color: #ffffff; border: none; cursor: pointer; border-radius: 0.25rem;">
                    OK
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('custom-modal').remove();
    });
}