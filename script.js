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
// FIREBASE CONFIG
// ======================================

const firebaseConfig = {

    apiKey: "PASTE_YOUR_REAL_API_KEY_HERE",

    authDomain: "timerv2-d7d28.firebaseapp.com",

    databaseURL:
    "https://timerv2-d7d28-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "timerv2-d7d28",

    storageBucket:
    "timerv2-d7d28.firebasestorage.app",

    messagingSenderId: "618500546909",

    appId:
    "1:618500546909:web:37eb7ec513d768afb848b4",

    measurementId: "G-KMKH1ZHQ0D"

};


// ======================================
// INITIALIZE FIREBASE
// ======================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// ======================================
// TIMER DATA
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

    const hours =

        parseInt(
            document.getElementById(user + "SetHours").value
        ) || 0;


    const minutes =

        parseInt(
            document.getElementById(user + "SetMinutes").value
        ) || 0;


    const seconds =

        parseInt(
            document.getElementById(user + "SetSeconds").value
        ) || 0;


    return (

        hours * 3600

        +

        minutes * 60

        +

        seconds

    );

}


// ======================================
// SAVE TIMER TO FIREBASE
// ======================================

function saveTimer(user) {

    const timerRef = ref(
        database,
        "timers/" + user
    );


    set(

        timerRef,

        {

            seconds:

                timers[user].seconds,


            originalSeconds:

                timers[user].originalSeconds,


            running:

                timers[user].running,


            endTime:

                timers[user].endTime,


            task:

                document.getElementById(
                    user + "Task"
                ).value

        }

    );

}


// ======================================
// START TIMER
// ======================================

function startTimer(user) {


    // If already running

    if (

        timers[user].running

    ) {

        return;

    }



    // Get new timer time

    if (

        timers[user].seconds <= 0

    ) {

        const inputTime =

            getInputTime(user);



        if (

            inputTime <= 0

        ) {

            alert(
                "Please set a timer first!"
            );

            return;

        }



        timers[user].seconds =

            inputTime;


        timers[user].originalSeconds =

            inputTime;

    }



    // Create finish time

    timers[user].endTime =

        Date.now()

        +

        timers[user].seconds * 1000;



    timers[user].running = true;



    // Save to Firebase

    saveTimer(user);



    // Start local display

    runTimer(user);

}


// ======================================
// RUN TIMER
// ======================================

function runTimer(user) {


    // Clear old interval

    clearInterval(

        timers[user].interval

    );



    timers[user].interval =

        setInterval(

            function () {


                if (

                    !timers[user].running

                ) {

                    return;

                }



                // Calculate remaining time

                const remaining =

                    Math.ceil(

                        (

                            timers[user].endTime

                            -

                            Date.now()

                        )

                        /

                        1000

                    );



                timers[user].seconds =

                    Math.max(

                        0,

                        remaining

                    );



                updateTimer(user);



                // TIMER FINISHED

                if (

                    timers[user].seconds <= 0

                ) {


                    clearInterval(

                        timers[user].interval

                    );


                    timers[user].running =

                        false;


                    timers[user].endTime =

                        null;


                    updateStatus(

                        user,

                        "Finished!"

                    );


                    saveTimer(user);

                }


            },

            250

        );

}


// ======================================
// PAUSE TIMER
// ======================================

function pauseTimer(user) {


    if (

        !timers[user].running

    ) {

        return;

    }



    // Calculate remaining time

    const remaining =

        Math.ceil(

            (

                timers[user].endTime

                -

                Date.now()

            )

            /

            1000

        );



    timers[user].seconds =

        Math.max(

            0,

            remaining

        );



    clearInterval(

        timers[user].interval

    );



    timers[user].running =

        false;


    timers[user].endTime =

        null;



    updateTimer(user);


    updateStatus(

        user,

        "Paused"

    );



    saveTimer(user);

}


// ======================================
// RESET TIMER
// ======================================

function resetTimer(user) {


    clearInterval(

        timers[user].interval

    );


    timers[user].running =

        false;


    timers[user].endTime =

        null;



    timers[user].seconds =

        timers[user].originalSeconds;



    updateTimer(user);


    updateStatus(

        user,

        "Stopped"

    );



    saveTimer(user);

}


// ======================================
// UPDATE DIGITAL TIMER
// ======================================

function updateTimer(user) {


    const totalSeconds =

        timers[user].seconds;


    const hours =

        Math.floor(

            totalSeconds / 3600

        );


    const minutes =

        Math.floor(

            (

                totalSeconds % 3600

            )

            / 60

        );


    const seconds =

        totalSeconds % 60;



    document.getElementById(
        user + "Hours"
    ).textContent =

        String(hours).padStart(
            2,
            "0"
        );


    document.getElementById(
        user + "Minutes"
    ).textContent =

        String(minutes).padStart(
            2,
            "0"
        );


    document.getElementById(
        user + "Seconds"
    ).textContent =

        String(seconds).padStart(
            2,
            "0"
        );



    updateAnalogTimer(

        user,

        hours,

        minutes,

        seconds

    );

}


// ======================================
// ANALOG CLOCK
// ======================================

function updateAnalogTimer(

    user,

    hours,

    minutes,

    seconds

) {


    const clock =

        document.getElementById(

            user + "AnalogClock"

        );


    const hourHand =

        clock.querySelector(

            ".hour-hand"

        );


    const minuteHand =

        clock.querySelector(

            ".minute-hand"

        );


    const secondHand =

        clock.querySelector(

            ".second-hand"

        );



    const secondDegree =

        seconds * 6;


    const minuteDegree =

        minutes * 6

        +

        seconds * 0.1;


    const hourDegree =

        (hours % 12) * 30

        +

        minutes * 0.5;



    secondHand.style.transform =

        `translateX(-50%) rotate(${secondDegree}deg)`;


    minuteHand.style.transform =

        `translateX(-50%) rotate(${minuteDegree}deg)`;


    hourHand.style.transform =

        `translateX(-50%) rotate(${hourDegree}deg)`;

}


// ======================================
// UPDATE STATUS
// ======================================

function updateStatus(

    user,

    text

) {


    const status =

        document.getElementById(

            user + "Status"

        );


    status.innerHTML =

        "<span></span> "

        +

        text;

}


// ======================================
// LISTEN TO FIREBASE
// ======================================

function listenToTimer(user) {


    const timerRef =

        ref(

            database,

            "timers/" + user

        );



    onValue(

        timerRef,

        function (

            snapshot

        ) {


            const data =

                snapshot.val();



            if (

                !data

            ) {

                return;

            }



            // Stop old timer

            clearInterval(

                timers[user].interval

            );



            timers[user].seconds =

                data.seconds || 0;


            timers[user].originalSeconds =

                data.originalSeconds || 0;


            timers[user].running =

                data.running || false;


            timers[user].endTime =

                data.endTime || null;



            // Update task

            document.getElementById(

                user + "Task"

            ).value =

                data.task || "";



            // If running, calculate correct time

            if (

                timers[user].running

                &&

                timers[user].endTime

            ) {


                const remaining =

                    Math.ceil(

                        (

                            timers[user].endTime

                            -

                            Date.now()

                        )

                        /

                        1000

                    );



                timers[user].seconds =

                    Math.max(

                        0,

                        remaining

                    );


                runTimer(user);


                updateStatus(

                    user,

                    "Running"

                );

            }


            else {


                updateStatus(

                    user,

                    timers[user].seconds > 0

                    ?

                    "Paused"

                    :

                    "Stopped"

                );

            }



            updateTimer(user);

        }

    );

}


// ======================================
// TASK NAME LIVE SYNC
// ======================================

function setupTaskSync(user) {


    const taskInput =

        document.getElementById(

            user + "Task"

        );



    taskInput.addEventListener(

        "input",

        function () {


            saveTimer(user);

        }

    );

}


// ======================================
// LIVE CLOCK
// ======================================

function updateLiveClock() {


    const now =

        new Date();



    document.getElementById(

        "liveClock"

    ).textContent =

        now.toLocaleTimeString(

            [],

            {

                hour:

                    "2-digit",

                minute:

                    "2-digit",

                second:

                    "2-digit"

            }

        );



    document.getElementById(

        "liveDate"

    ).textContent =

        now.toLocaleDateString(

            "en-US",

            {

                weekday:

                    "long",

                year:

                    "numeric",

                month:

                    "long",

                day:

                    "numeric"

            }

        );



    document.getElementById(

        "todayDate"

    ).textContent =

        now.toLocaleDateString(

            "en-US",

            {

                year:

                    "numeric",

                month:

                    "long",

                day:

                    "numeric"

            }

        );



    document.getElementById(

        "dayName"

    ).textContent =

        now.toLocaleDateString(

            "en-US",

            {

                weekday:

                    "long"

            }

        );

}


// ======================================
// INITIALIZE WEBSITE
// ======================================


// Start live clock

updateLiveClock();

setInterval(

    updateLiveClock,

    1000

);


// Initialize displays

updateTimer("siam");

updateTimer("sylvia");


// Connect Firebase listeners

listenToTimer("siam");

listenToTimer("sylvia");


// Connect task syncing

setupTaskSync("siam");

setupTaskSync("sylvia");


// ======================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================

window.startTimer = startTimer;

window.pauseTimer = pauseTimer;

window.resetTimer = resetTimer;
