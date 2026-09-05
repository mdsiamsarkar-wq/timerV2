// ======================================
// TIMER DATA
// ======================================

const timers = {

    siam: {

        seconds: 0,

        originalSeconds: 0,

        running: false,

        interval: null

    },


    sylvia: {

        seconds: 0,

        originalSeconds: 0,

        running: false,

        interval: null

    }

};




// ======================================
// GET TIME FROM INPUT BOXES
// ======================================

function getInputTime(user) {


    const hours =

        parseInt(

            document.getElementById(
                user + "SetHours"
            ).value

        ) || 0;


    const minutes =

        parseInt(

            document.getElementById(
                user + "SetMinutes"
            ).value

        ) || 0;


    const seconds =

        parseInt(

            document.getElementById(
                user + "SetSeconds"
            ).value

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
// START COUNTDOWN TIMER
// ======================================

function startTimer(user) {


    // Don't start twice

    if (

        timers[user].running

    ) {

        return;

    }



    // If timer has no remaining time,
    // get time from input

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


        updateTimer(user);

    }



    // Start countdown

    timers[user].running = true;


    updateStatus(

        user,

        "Running"

    );


    timers[user].interval =

        setInterval(

            function () {


                timers[user].seconds--;


                updateTimer(user);



                // TIMER FINISHED

                if (

                    timers[user].seconds <= 0

                ) {


                    timers[user].seconds = 0;


                    clearInterval(

                        timers[user].interval

                    );


                    timers[user].running = false;


                    updateTimer(user);


                    updateStatus(

                        user,

                        "Finished!"

                    );


                    alert(

                        "⏰ " +

                        user.toUpperCase()

                        +

                        "'s timer is finished!"

                    );

                }


            },

            1000

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


    clearInterval(

        timers[user].interval

    );


    timers[user].running = false;


    updateStatus(

        user,

        "Paused"

    );

}




// ======================================
// RESET TIMER
// ======================================

function resetTimer(user) {


    clearInterval(

        timers[user].interval

    );


    timers[user].running = false;



    // Return to original selected time

    timers[user].seconds =

        timers[user].originalSeconds;


    updateTimer(user);


    updateStatus(

        user,

        "Stopped"

    );

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

            (totalSeconds % 3600)

            / 60

        );


    const seconds =

        totalSeconds % 60;



    // HOURS

    document.getElementById(

        user + "Hours"

    ).textContent =

        String(hours).padStart(

            2,

            "0"

        );



    // MINUTES

    document.getElementById(

        user + "Minutes"

    ).textContent =

        String(minutes).padStart(

            2,

            "0"

        );



    // SECONDS

    document.getElementById(

        user + "Seconds"

    ).textContent =

        String(seconds).padStart(

            2,

            "0"

        );



    // UPDATE ANALOG CLOCK

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



    // CALCULATE ROTATION


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



    // ROTATE HANDS


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
// LIVE CLOCK
// ======================================

function updateLiveClock() {


    const now =

        new Date();



    // LIVE TIME


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



    // FULL DATE


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



    // TODAY DATE


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



    // DAY NAME


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
// UPDATE LIVE CLOCK EVERY SECOND
// ======================================

updateLiveClock();


setInterval(

    updateLiveClock,

    1000

);




// ======================================
// INITIALIZE TIMERS
// ======================================

updateTimer("siam");


updateTimer("sylvia");