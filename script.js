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
            celebrateTimerFinish(user);
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
                saveTimer(user);
                celebrateTimerFinish(user);
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
// TODAY DATE
// ======================================

function updateTodayDate() {

    const now = new Date();

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
// TO-DO LISTS (Siam & Sylvia)
// Each user's tasks are stored as an object keyed by task id, so the
// entire list is overwritten on every change — same pattern as the timer.
// ======================================

const todos = {
    siam: {},
    sylvia: {}
};

function generateTodoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function saveTodos(user) {
    const todosRef = ref(database, "todos/" + user);
    set(todosRef, todos[user]);
}

function addTodo(user) {
    const input = document.getElementById(user + "TodoInput");
    const text = input.value.trim();

    if (!text) {
        return;
    }

    const id = generateTodoId();

    todos[user][id] = {
        text: text,
        done: false,
        createdAt: Date.now()
    };

    input.value = "";
    saveTodos(user);
}

function toggleTodo(user, id) {
    if (!todos[user][id]) {
        return;
    }

    todos[user][id].done = !todos[user][id].done;
    saveTodos(user);
}

function deleteTodo(user, id) {
    if (!todos[user][id]) {
        return;
    }

    delete todos[user][id];
    saveTodos(user);
}

function editTodo(user, id, newText) {
    const trimmed = newText.trim();

    if (!todos[user][id]) {
        return;
    }

    // An edit that empties the task is treated as a delete
    if (!trimmed) {
        delete todos[user][id];
    } else {
        todos[user][id].text = trimmed;
    }

    saveTodos(user);
}

function renderTodos(user) {

    const list = document.getElementById(user + "TodoList");
    const emptyMessage = document.getElementById(user + "TodoEmpty");

    list.innerHTML = "";

    const entries = Object.entries(todos[user] || {})
        .sort(function (a, b) {
            return (a[1].createdAt || 0) - (b[1].createdAt || 0);
        });

    if (entries.length === 0) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");

    entries.forEach(function ([id, task]) {

        const li = document.createElement("li");
        li.className = "todo-item" + (task.done ? " completed" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!task.done;
        checkbox.addEventListener("change", function () {
            if (checkbox.checked) {
                celebrateTaskDone(user, task.text);
            }
            toggleTodo(user, id);
        });

        const textSpan = document.createElement("span");
        textSpan.className = "todo-text";
        textSpan.textContent = task.text;
        textSpan.title = "Click to edit";
        textSpan.addEventListener("click", function () {
            startEditingTodo(user, id, li, textSpan);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "todo-delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Delete task";
        deleteBtn.addEventListener("click", function () {
            deleteTodo(user, id);
        });

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

function startEditingTodo(user, id, li, textSpan) {

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-edit-input";
    editInput.value = textSpan.textContent;

    li.replaceChild(editInput, textSpan);
    editInput.focus();
    editInput.select();

    function finishEdit(save) {
        if (save) {
            editTodo(user, id, editInput.value);
        } else {
            renderTodos(user);
        }
    }

    editInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            finishEdit(true);
        } else if (event.key === "Escape") {
            finishEdit(false);
        }
    });

    editInput.addEventListener("blur", function () {
        finishEdit(true);
    });
}

function listenToTodos(user) {
    const todosRef = ref(database, "todos/" + user);

    onValue(todosRef, function (snapshot) {
        todos[user] = snapshot.val() || {};
        renderTodos(user);
    });
}

function setupTodoInput(user) {
    const input = document.getElementById(user + "TodoInput");
    const addBtn = document.getElementById(user + "TodoAddBtn");

    addBtn.addEventListener("click", function () {
        addTodo(user);
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addTodo(user);
        }
    });
}


// ======================================
// CONGRATULATIONS POPUP
// Shown when a timer finishes or a to-do item is checked off,
// with a brief screen shake for emphasis.
// ======================================

const celebrationOverlay = document.getElementById("celebrationOverlay");
const celebrationTitle = document.getElementById("celebrationTitle");
const celebrationMessage = document.getElementById("celebrationMessage");
const celebrationCloseBtn = document.getElementById("celebrationCloseBtn");

let celebrationAutoCloseTimeout = null;

function showCelebration(title, message) {

    celebrationTitle.textContent = title;
    celebrationMessage.textContent = message;
    celebrationOverlay.classList.add("open");

    // Brief screen shake for emphasis
    document.body.classList.remove("screen-shake");
    // Force reflow so the animation can be retriggered back-to-back
    void document.body.offsetWidth;
    document.body.classList.add("screen-shake");

    clearTimeout(celebrationAutoCloseTimeout);
    celebrationAutoCloseTimeout = setTimeout(closeCelebration, 4000);
}

function closeCelebration() {
    celebrationOverlay.classList.remove("open");
    clearTimeout(celebrationAutoCloseTimeout);
}

celebrationCloseBtn.addEventListener("click", closeCelebration);

celebrationOverlay.addEventListener("click", function (event) {
    if (event.target === celebrationOverlay) {
        closeCelebration();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && celebrationOverlay.classList.contains("open")) {
        closeCelebration();
    }
});

function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function celebrateTimerFinish(user) {
    const name = capitalize(user);
    const task = (document.getElementById(user + "Task").value || "").trim();

    const message = task
        ? name + "'s timer is done — great work on \u201c" + task + "\u201d!"
        : name + "'s timer is done. Great work!";

    showCelebration("Time's Up!", message);
}

function celebrateTaskDone(user, taskText) {
    const name = capitalize(user);
    showCelebration("Task Complete!", name + " finished: \u201c" + taskText + "\u201d");
}


// ======================================
// INITIALIZE WEBSITE
// ======================================

initTheme();

updateTodayDate();
// Keep the date/day correct if the page is left open past midnight
setInterval(updateTodayDate, 60 * 1000);

updateTimer("siam");
updateTimer("sylvia");

listenToTimer("siam");
listenToTimer("sylvia");

setupTaskSync("siam");
setupTaskSync("sylvia");

listenToCountdown();

listenToTodos("siam");
listenToTodos("sylvia");

setupTodoInput("siam");
setupTodoInput("sylvia");


// ======================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================

window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.deleteTimer = deleteTimer;
