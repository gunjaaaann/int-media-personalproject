const enterScreen = document.getElementById("enter-screen");
const status = document.getElementById("status");
const mainContent = document.getElementById("main-content");
const video = document.getElementById("mirror");
const questionDisplay = document.getElementById("question-display");

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
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

function startListening() {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Speech recognition not supported. Please use Chrome or Edge.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  status.textContent = "Listening...";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    status.textContent = `You said: "${transcript}"`;

    if (transcript.includes("yes") || transcript.includes("ready")) {
      status.textContent = "Welcome! Opening mirror...";
      showMirror();
    } else {
      status.textContent = 'Say "yes" or "ready" to enter';
    }
  };

  recognition.onerror = (event) => {
    status.textContent = "Error: " + event.error;
  };

  recognition.onend = () => {
    if (!mainContent.classList.contains("visible")) {
      recognition.start();
    }
  };
}

function showMirror() {
  enterScreen.style.display = "none";
  mainContent.style.display = "flex";
  mainContent.classList.add("visible");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;

      // Delay to let the camera load
      setTimeout(() => {
        const question = pickQuestion(listOfQuestions);
        questionDisplay.textContent = question;
        speakText(question);
      }, 1000);
    })
    .catch((err) => {
      alert("Camera access denied or not available.");
      console.error(err);
    });
}

// Check mic permissions on load
if (navigator.permissions) {
  navigator.permissions.query({ name: "microphone" }).then((result) => {
    if (result.state === "denied") {
      alert("Microphone access is denied. Please enable it in your browser settings.");
    }
  });
}

// Start listening when the page loads
window.onload = () => {
  startListening();
};