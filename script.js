const enterScreen = document.getElementById("enter-screen");
const status = document.getElementById("status");
const mainContent = document.getElementById("main-content");
const video = document.getElementById("mirror");
const questionDisplay = document.getElementById("question-display");
const outputDiv = document.getElementById("output");

let listOfQuestions = [
  "What kind of song is playing in the background of your thoughts?",
  "If your feelings were weather, what forecast would you give?",
  "What memory has visited you most often lately?",
  "Is there a corner of your mind you’ve been avoiding?",
  "Are you drifting, rooted, or reaching?",
  "Is there a word you’ve been afraid to say out loud lately?",
  "Is your breath heavy or light today?",
  "What does comfort smell like to you?",
  "If you could press pause on one feeling, which would it be?",
  "If your heart wrote a letter today, what would the first line say?"
];

function pickQuestion(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function speakText(text, lang = "en-GB") {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

function startInitialListening() {
  status.textContent = "Say 'yes' or 'ready' to start";
  recognition.start();
}

recognition.onstart = () => {
  status.textContent = "Listening...";
};

recognition.onerror = (event) => {
  status.textContent = "Error: " + event.error;
};

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  console.log("Transcript:", transcript);

  if (!mainContent.classList.contains("visible")) {
    if (transcript.includes("yes") || transcript.includes("ready")) {
      status.textContent = "Welcome! Opening mirror...";
      recognition.stop();
      await showMirrorAndAskQuestion();
    } else {
      status.textContent = 'Say "yes" or "ready" to enter';
      recognition.stop();
    }
  } else {
    outputDiv.textContent = transcript;
  }
};

recognition.onend = () => {
  if (!mainContent.classList.contains("visible")) {
    recognition.start();
  }
};

async function showMirrorAndAskQuestion() {
  enterScreen.style.display = "none";
  mainContent.style.display = "flex";
  mainContent.classList.add("visible");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("Camera access denied or not available.");
    console.error(err);
    return;
  }

  const question = pickQuestion(listOfQuestions);
  questionDisplay.textContent = question;
  await speakText(question);
  startAnswerListening();
}

function startAnswerListening() {
  status.textContent = "Recording...";
  recognition.stop();

  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = async (event) => {
    const answer = event.results[0][0].transcript;
    outputDiv.textContent = answer;
    status.textContent = "Recording stopped.";
    console.log("Captured answer:", answer);

    // Sentiment Analysis
    try {
      const analyze = (await import('https://cdn.skypack.dev/sentiment-analysis')).default;
      const result = analyze(answer);
      console.log("Sentiment Analysis:", result);

    } catch (err) {
      console.error("Failed to load Sentiment module:", err);
    }
  };

  recognition.onend = () => {
    status.textContent = "Finished listening for answer.";
  };

  recognition.onerror = (event) => {
    status.textContent = "Error: " + event.error;
    console.error(event.error);
  };

  recognition.start();
}

window.onload = () => {
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }
  startInitialListening();
};
