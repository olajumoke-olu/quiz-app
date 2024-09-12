const questionContainer = document.getElementById("question-container");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-button");
const progressBar = document.getElementById("progress-bar");

let correctAnswer = null;
let allowNextQuestion = false;
let questionIndex = 0; // Track the number of questions answered
let score = 0; // Track the user's score
const totalQuestions = 10; // Total number of questions

// Fetch a new question from The Trivia API
async function fetchQuestion() {
  try {
    const response = await fetch(
      "https://the-trivia-api.com/api/questions?categories=science&limit=1&difficulty=medium"
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No questions available. Please try again later.");
    }

    const questionData = data[0];

    return {
      question: questionData.question,
      correct_answer: questionData.correctAnswer,
      incorrect_answers: questionData.incorrectAnswers,
    };
  } catch (error) {
    console.error("Failed to fetch question:", error);
    questionContainer.textContent = error.message || "Error loading question.";
  }
}

// Start the quiz, resetting everything and loading the first question
async function startQuiz() {
  resetState(); // Reset UI state before fetching the question
  const questionData = await fetchQuestion(); // Fetch a question from API
  if (questionData) {
    showQuestion(questionData); // Display the fetched question and answers
    updateProgressBar();
  }
}

// Display the question and possible answers
function showQuestion(data) {
  questionContainer.textContent = data.question; // Show question text
  correctAnswer = data.correct_answer; // Store the correct answer

  // Shuffle correct and incorrect answers together
  const answers = [...data.incorrect_answers, data.correct_answer].sort(
    () => Math.random() - 0.5
  );

  // Create buttons for each answer and attach event listeners
  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.classList.add("btn");
    button.textContent = answer;
    button.addEventListener("click", selectAnswer); // Attach click handler
    answerButtons.appendChild(button); // Add button to the answer buttons container
  });

  allowNextQuestion = false; // Disable the Next button initially
  nextButton.style.display = "none"; // Hide the Next button
}

// Handle the selection of an answer
function selectAnswer(e) {
  const selectedButton = e.target;
  const selectedAnswer = selectedButton.textContent;

  // Provide feedback for correct/incorrect answer
  if (selectedAnswer === correctAnswer) {
    selectedButton.classList.add("correct"); // Highlight correct selection
    score++; // Increment score for correct answer
  } else {
    selectedButton.classList.add("wrong"); // Highlight incorrect selection
    // Highlight the correct answer
    Array.from(answerButtons.children).forEach((button) => {
      if (button.textContent === correctAnswer) {
        button.classList.add("correct");
      }
    });
  }

  // Disable all answer buttons to prevent further clicks
  Array.from(answerButtons.children).forEach(
    (button) => (button.disabled = true)
  );

  // Show the "Next" button after an answer is selected
  nextButton.style.display = "block";
  allowNextQuestion = true; // Allow moving to the next question
}

// Reset the UI state to clear the previous question and answers
function resetState() {
  // Clear previous question text
  questionContainer.innerHTML = "Loading question...";

  // Remove all answer buttons
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }

  // Hide the "Next" button until an answer is selected
  nextButton.style.display = "none";
}

// Update the progress bar based on the number of questions answered
function updateProgressBar() {
  const progressPercentage = ((questionIndex + 1) / totalQuestions) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

// Handle quiz completion and show the final score
function showFinalScore() {
  // Clear the question container and remove all answer buttons
  questionContainer.innerHTML = `Quiz completed! Your score: ${score} / ${totalQuestions}`;
  answerButtons.innerHTML = ""; // Ensure no buttons are left

  nextButton.textContent = "Restart";
  nextButton.classList.remove("next-btn"); // Remove next button styles
  nextButton.classList.add("restart-btn"); // Add restart button styles
  nextButton.style.display = "block"; // Show the Restart button

  // Remove event listener from the Next button
  nextButton.removeEventListener("click", handleNextButtonClick);
}

// Handle the "Next" button click or restart button click
function handleNextButtonClick() {
  if (allowNextQuestion) {
    questionIndex++;
    if (questionIndex < totalQuestions) {
      startQuiz(); // Load the next question
      updateProgressBar();
    } else {
      showFinalScore(); // Show final score and restart button
    }
  }
}

// Add event listener to the "Next" button to load the next question or restart the quiz
nextButton.addEventListener("click", () => {
  if (nextButton.classList.contains("restart-btn")) {
    handleRestartButtonClick(); // Handle restart functionality
  } else {
    handleNextButtonClick(); // Handle next question functionality
  }
});

// Add event listener to the Restart button to reset the quiz
function handleRestartButtonClick() {
  // Reset score and question index
  score = 0;
  questionIndex = 0;

  // Ensure the restart button's event listener is removed and then start a new quiz
  nextButton.removeEventListener("click", handleRestartButtonClick);
  nextButton.textContent = "Next";
  nextButton.classList.remove("restart-btn");
  nextButton.classList.add("next-btn");

  startQuiz(); // Start a new quiz
}

// Start the quiz immediately when the page loads
startQuiz();
