// ======================================
// FIREBASE IMPORTS
// ======================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from
"https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";


// ======================================
// FIREBASE CONFIG (unchanged)
// ======================================

const firebaseConfig = {
    apiKey: "PASTE_YOUR_REAL_API_KEY_HERE",
    authDomain: "timerv2-d7d28.firebaseapp.com",
    databaseURL: "https://timerv2-d7d28-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "timerv2-d7d28",
    storageBucket: "timerv2-d7d28.firebasestorage.app",
    messagingSenderId: "618500546909",
    appId: "1:618500546909:web:37eb7ec513d768afb848b4",
    measurementId: "G-KMKH1ZHQ0D"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// ======================================
// SHARED TIMER DATA
// ======================================

const timers = {
    siam: {
        seconds: 0,
        originalSeconds: 0,
        running: false,
        interval: null,
        endTime: null
    },
    sylvia: {
        seconds: 0,
        originalSeconds: 0,
        running: false,
        interval: null,
        endTime: null
    }
};


// ======================================
// GET TIMER INPUT
// ======================================

function getInputTime(user) {
    const hours = parseInt(document.getElementById(user + "SetHours").value) || 0;
    const minutes = parseInt(document.getElementById(user + "SetMinutes").value) || 0;
    const seconds = parseInt(document.getElementById(user + "SetSeconds").value) || 0;

    return (hours * 3600) + (minutes * 60) + seconds;
}


// ======================================
// SAVE TIMER TO FIREBASE
// ======================================

function saveTimer(user) {
    const timerRef = ref(database, "timers/" + user);

    set(timerRef, {
        seconds: timers[user].seconds,
        originalSeconds: timers[user].originalSeconds,
        running: timers[user].running,
        endTime: timers[user].endTime,
        task: document.getElementById(user + "Task").value
    });
}


// ======================================
// START TIMER
// (timestamp-based: endTime is the source of truth)
// ======================================

function startTimer(user) {

    if (timers[user].running) {
        return;
    }

    // If there is no time left over from a pause, read the inputs
    if (timers[user].seconds <= 0) {

        const inputTime = getInputTime(user);

        if (inputTime <= 0) {
            alert("Please set a timer first!");
            return;
        }

        timers[user].seconds = inputTime;
        timers[user].originalSeconds = inputTime;
    }

    // The finish timestamp is what all clients calculate remaining time from
    timers[user].endTime = Date.now() + (timers[user].seconds * 1000);
    timers[user].running = true;

    saveTimer(user);
    runTimer(user);
}


// ======================================
// RUN TIMER
// One interval per user max — always cleared before a new one starts
// ======================================

function runTimer(user) {

    // Guarantee only a single interval is ever active for this user
    clearInterval(timers[user].interval);

    timers[user].interval = setInterval(function () {

        if (!timers[user].running || !timers[user].endTime) {
            clearInterval(timers[user].interval);
            return;
        }

        const remaining = Math.ceil((timers[user].endTime - Date.now()) / 1000);
        timers[user].seconds = Math.max(0, remaining);

        updateTimer(user);

        if (timers[user].seconds <= 0) {
            clearInterval(timers[user].interval);
            timers[user].running = false;
            timers[user].endTime = null;

            updateStatus(user, "Finished!");
            saveTimer(user);
        }

    }, 250);
}


// ======================================
// PAUSE TIMER
// ======================================

function pauseTimer(user) {

    if (!timers[user].running) {
        return;
    }

    const remaining = Math.ceil((timers[user].endTime - Date.now()) / 1000);
    timers[user].seconds = Math.max(0, remaining);

    clearInterval(timers[user].interval);
    timers[user].running = false;
    timers[user].endTime = null;

    updateTimer(user);
    updateStatus(user, "Paused");
    saveTimer(user);
}


// ======================================
// RESET TIMER
// Goes back to the last time that was set (originalSeconds)
// ======================================

function resetTimer(user) {

    clearInterval(timers[user].interval);
    timers[user].running = false;
    timers[user].endTime = null;
    timers[user].seconds = timers[user].originalSeconds;

    updateTimer(user);
    updateStatus(user, "Stopped");
    saveTimer(user);
}


// ======================================
// DELETE TIMER
// Fully clears the timer, back to a blank slate
// ======================================

function deleteTimer(user) {

    clearInterval(timers[user].interval);

    timers[user].running = false;
    timers[user].endTime = null;
    timers[user].seconds = 0;
    timers[user].originalSeconds = 0;

    document.getElementById(user + "SetHours").value = "";
    document.getElementById(user + "SetMinutes").value = "";
    document.getElementById(user + "SetSeconds").value = "";

    updateTimer(user);
    updateStatus(user, "Stopped");
    saveTimer(user);
}


// ======================================
// UPDATE DIGITAL TIMER
// ======================================

function updateTimer(user) {

    const totalSeconds = timers[user].seconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById(user + "Hours").textContent = String(hours).padStart(2, "0");
    document.getElementById(user + "Minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById(user + "Seconds").textContent = String(seconds).padStart(2, "0");

    updateAnalogTimer(user, hours, minutes, seconds);
}


// ======================================
// ANALOG CLOCK
// ======================================

function updateAnalogTimer(user, hours, minutes, seconds) {

    const clock = document.getElementById(user + "AnalogClock");
    const hourHand = clock.querySelector(".hour-hand");
    const minuteHand = clock.querySelector(".minute-hand");
    const secondHand = clock.querySelector(".second-hand");

    const secondDegree = seconds * 6;
    const minuteDegree = (minutes * 6) + (seconds * 0.1);
    const hourDegree = ((hours % 12) * 30) + (minutes * 0.5);

    secondHand.style.transform = `translateX(-50%) rotate(${secondDegree}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegree}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hourDegree}deg)`;
}


// ======================================
// UPDATE STATUS
// ======================================

function updateStatus(user, text) {
    const status = document.getElementById(user + "Status");
    status.innerHTML = "<span></span> " + text;
}


// ======================================
// LISTEN TO FIREBASE
// Keeps every open browser tab in sync, and restores state on refresh
// ======================================

function listenToTimer(user) {

    const timerRef = ref(database, "timers/" + user);

    onValue(timerRef, function (snapshot) {

        const data = snapshot.val();

        if (!data) {
            return;
        }

        clearInterval(timers[user].interval);

        timers[user].seconds = data.seconds || 0;
        timers[user].originalSeconds = data.originalSeconds || 0;
        timers[user].running = data.running || false;
        timers[user].endTime = data.endTime || null;

        document.getElementById(user + "Task").value = data.task || "";

        if (timers[user].running && timers[user].endTime) {

            const remaining = Math.ceil((timers[user].endTime - Date.now()) / 1000);
            timers[user].seconds = Math.max(0, remaining);

            if (timers[user].seconds > 0) {
                runTimer(user);
                updateStatus(user, "Running");
            } else {
                timers[user].running = false;
                timers[user].endTime = null;
                updateStatus(user, "Finished!");
            }

        } else {
            updateStatus(user, timers[user].seconds > 0 ? "Paused" : "Stopped");
        }

        updateTimer(user);
    });
}


// ======================================
// TASK NAME LIVE SYNC
// ======================================

function setupTaskSync(user) {

    const taskInput = document.getElementById(user + "Task");

    taskInput.addEventListener("input", function () {
        saveTimer(user);
    });
}


// ======================================
// LIVE CLOCK
// ======================================

function updateLiveClock() {

    const now = new Date();

    document.getElementById("liveClock").textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("liveDate").textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("todayDate").textContent = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("dayName").textContent = now.toLocaleDateString("en-US", {
        weekday: "long"
    });
}


// ======================================
// REVERSE COUNTDOWN CLOCK
// Target date is shared/synced through Firebase, remaining time is
// always recalculated from the stored target timestamp.
// ======================================

let countdownTargetTime = null;
let countdownInterval = null;

const countdownInput = document.getElementById("countdownTarget");
const countdownMessage = document.getElementById("countdownMessage");

function toDatetimeLocalValue(timestamp) {
    const d = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, "0");

    return (
        d.getFullYear() + "-" +
        pad(d.getMonth() + 1) + "-" +
        pad(d.getDate()) + "T" +
        pad(d.getHours()) + ":" +
        pad(d.getMinutes())
    );
}

function updateCountdownDisplay() {

    if (!countdownTargetTime) {
        document.getElementById("cdDays").textContent = "00";
        document.getElementById("cdHours").textContent = "00";
        document.getElementById("cdMinutes").textContent = "00";
        document.getElementById("cdSeconds").textContent = "00";
        countdownMessage.textContent = "Set a target date to start counting down.";
        countdownMessage.classList.remove("reached");
        return;
    }

    const diff = countdownTargetTime - Date.now();

    if (diff <= 0) {
        document.getElementById("cdDays").textContent = "00";
        document.getElementById("cdHours").textContent = "00";
        document.getElementById("cdMinutes").textContent = "00";
        document.getElementById("cdSeconds").textContent = "00";
        countdownMessage.textContent = "Time Reached!";
        countdownMessage.classList.add("reached");
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("cdDays").textContent = String(days).padStart(2, "0");
    document.getElementById("cdHours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cdMinutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("cdSeconds").textContent = String(seconds).padStart(2, "0");

    countdownMessage.textContent = "";
    countdownMessage.classList.remove("reached");
}

function startCountdownTicker() {
    clearInterval(countdownInterval);
    updateCountdownDisplay();
    countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

function saveCountdownTarget(timestamp) {
    const countdownRef = ref(database, "countdown/target");
    set(countdownRef, timestamp);
}

function listenToCountdown() {
    const countdownRef = ref(database, "countdown/target");

    onValue(countdownRef, function (snapshot) {
        const value = snapshot.val();

        if (!value) {
            countdownTargetTime = null;
            countdownInput.value = "";
            startCountdownTicker();
            return;
        }

        countdownTargetTime = value;
        countdownInput.value = toDatetimeLocalValue(value);
        startCountdownTicker();
    });
}

countdownInput.addEventListener("change", function () {

    if (!countdownInput.value) {
        countdownTargetTime = null;
        saveCountdownTarget(null);
        startCountdownTicker();
        return;
    }

    const timestamp = new Date(countdownInput.value).getTime();

    if (isNaN(timestamp)) {
        return;
    }

    countdownTargetTime = timestamp;
    saveCountdownTarget(timestamp);
    startCountdownTicker();
});


// ======================================
// ACADEMIC CALENDAR MODAL
// ======================================

const BRAC_CALENDAR_URL = "https://www.bracu.ac.bd/sites/default/files/uploads/2025/12/30/Year%20Planner%202026_up.pdf";

const calendarModal = document.getElementById("calendarModal");
const calendarFrame = document.getElementById("calendarFrame");
const openCalendarBtn = document.getElementById("openCalendarBtn");
const closeCalendarBtn = document.getElementById("closeCalendarBtn");

function openCalendarModal() {
    calendarFrame.src = BRAC_CALENDAR_URL;
    calendarModal.classList.add("open");
}

function closeCalendarModal() {
    calendarModal.classList.remove("open");
    calendarFrame.src = "";
}

openCalendarBtn.addEventListener("click", openCalendarModal);
closeCalendarBtn.addEventListener("click", closeCalendarModal);

calendarModal.addEventListener("click", function (event) {
    if (event.target === calendarModal) {
        closeCalendarModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && calendarModal.classList.contains("open")) {
        closeCalendarModal();
    }
});


// ======================================
// DARK MODE
// ======================================

const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    themeToggleIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
}

themeToggle.addEventListener("click", function () {
    const current = document.body.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
});


// ======================================
// STOPWATCH
// Also timestamp-based so it survives tab switches without drifting
// ======================================

const stopwatch = {
    running: false,
    elapsedMs: 0,
    startTime: null,
    interval: null
};

const stopwatchDisplay = document.getElementById("stopwatchDisplay");

function formatStopwatch(ms) {
    const totalDeciseconds = Math.floor(ms / 100);

    const hours = Math.floor(totalDeciseconds / 36000);
    const minutes = Math.floor((totalDeciseconds % 36000) / 600);
    const seconds = Math.floor((totalDeciseconds % 600) / 10);
    const deci = totalDeciseconds % 10;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        deci
    );
}

function updateStopwatchDisplay() {
    const currentElapsed = stopwatch.running
        ? stopwatch.elapsedMs + (Date.now() - stopwatch.startTime)
        : stopwatch.elapsedMs;

    stopwatchDisplay.textContent = formatStopwatch(currentElapsed);
}

function startStopwatch() {
    if (stopwatch.running) {
        return;
    }

    stopwatch.running = true;
    stopwatch.startTime = Date.now();

    clearInterval(stopwatch.interval);
    stopwatch.interval = setInterval(updateStopwatchDisplay, 100);
}

function pauseStopwatch() {
    if (!stopwatch.running) {
        return;
    }

    stopwatch.elapsedMs += Date.now() - stopwatch.startTime;
    stopwatch.running = false;
    stopwatch.startTime = null;

    clearInterval(stopwatch.interval);
    updateStopwatchDisplay();
}

function resetStopwatch() {
    clearInterval(stopwatch.interval);

    stopwatch.running = false;
    stopwatch.elapsedMs = 0;
    stopwatch.startTime = null;

    updateStopwatchDisplay();
}


// ======================================
// INITIALIZE WEBSITE
// ======================================

initTheme();

updateLiveClock();
setInterval(updateLiveClock, 1000);

updateTimer("siam");
updateTimer("sylvia");

listenToTimer("siam");
listenToTimer("sylvia");

setupTaskSync("siam");
setupTaskSync("sylvia");

listenToCountdown();

updateStopwatchDisplay();


// ======================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================

window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.deleteTimer = deleteTimer;

window.startStopwatch = startStopwatch;
window.pauseStopwatch = pauseStopwatch;
window.resetStopwatch = resetStopwatch;
