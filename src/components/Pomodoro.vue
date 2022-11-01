<script setup lang="ts">
import { onMounted, ref } from 'vue';

// import playSvg from '../assets/play-button-round-icon.svg';
// import pauseSvg from '../assets/pause-button-icon.svg';
// import stopSvg from '../assets/stop-button-round-icon.svg';
import clockAlarm from '../assets/clock-alarm.mp3';
import playSvg from './assets/SvgPlayButton.vue';
import pauseSvg from './assets/SvgPauseButton.vue';
import stopSvg from './assets/SvgStopButton.vue';

interface PomoTimeInterface {
    seconds: number,
    minutes: number
}

interface pomoTimer {
    status: string,
    interval: {
        minutes: number,
        seconds: number,
    },
    timeRemain: {
        seconds: number,
        minutes: number,
        totalInMiliseconds: number,
    },
    timeElapsed: {
        miliseconds: number,
    },
    lastUpdateTimestamp: number,
}

let pomo_vars = {
    status: '',
    interval: {
        minutes: 25,
        seconds: 0,
    },
    timeRemain: {
        seconds: 0,
        minutes: 0,
        totalInMiliseconds: 0,
    },
    timeElapsed: {
        miliseconds: 0,
    },
    lastUpdateTimestamp: 0,
};
let pomo_break_vars = {
    status: '',
    interval: {
        minutes: 5,
        seconds: 0,
    },
    timeRemain: {
        seconds: 0,
        minutes: 0,
        totalInMiliseconds: 0,
    },
    timeElapsed: {
        miliseconds: 0,
    },
    lastUpdateTimestamp: 0,
};

const pomoTime = ref<HTMLElement | null>(null),
    pomoStart = ref<HTMLElement | null>(null),
    pomoStop = ref<HTMLElement | null>(null),
    pomoBreakTime = ref<HTMLElement | null>(null),
    pomoBreakStart = ref<HTMLElement | null>(null),
    pomoBreakStop = ref<HTMLElement | null>(null);

// const cssVars = ref({
//     // playPauseBackground: `url("${playSvg}")`,
//     stopBackground: `url("${stopSvg}")`,
// });

let pomoInterval: any = undefined;

const pomoAlarm = new Audio(clockAlarm);

// function startPauseResumePomodoro() {
//     if (!pomoStart.value) return
//     if (pomo_vars.status === 'running') {
//         pomo_vars.status = 'pause';
//         setPlayPauseButton(pomoStart.value, 'play');
//         if (pomoInterval)
//             clearInterval(pomoInterval);
//     }
//     else {
//         if (pomo_vars.status !== 'pause') {
//             pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
//             pomo_vars.timeRemain.totalInMiliseconds =
//                 convertTimeToMS(pomo_vars.timeRemain.minutes, pomo_vars.timeRemain.seconds);
//             pomo_vars.timeElapsed.miliseconds = 0;
//         }
//         pomo_vars.lastUpdateTimestamp = new Date().getTime();

//         pomo_vars.status = 'running';

//         setPlayPauseButton(pomoStart.value, 'pause');

//         pomoInterval = setInterval(updatePomodoro, 250);
//     }
// }

function startPauseMainPomo() {
    if (!pomoStart.value) return;
    pomo_vars = startPauseResumePomodoro(pomo_vars, pomoStart.value);
}

function startPauseBreakPomo() {
    if (!pomoBreakStart.value) return;
    pomo_break_vars = startPauseResumePomodoro(pomo_break_vars, pomoBreakStart.value);
}

function startPauseResumePomodoro(vars: pomoTimer, startBtnElem: HTMLElement) {
    if (vars.status === 'running') {
        vars.status = 'pause';
        setPlayPauseButton(startBtnElem, 'play');
        if (pomoInterval)
            clearInterval(pomoInterval);
    }
    else {
        if (vars.status !== 'pause') {
            vars.timeRemain = JSON.parse(JSON.stringify(vars.interval));
            vars.timeRemain.totalInMiliseconds =
                convertTimeToMS(vars.timeRemain.minutes, vars.timeRemain.seconds);
                vars.timeElapsed.miliseconds = 0;
        }
        vars.lastUpdateTimestamp = new Date().getTime();

        vars.status = 'running';

        setPlayPauseButton(startBtnElem, 'pause');

        // TO-DO: THIS INTERVAL WILL GENERATE ISSUES BECAUSE THIS FUNCTION IS
        // BEING USED BY 2 DIFFERENT TIMERS (BREAK & MAIN)
        pomoInterval = setInterval(updatePomodoro, 250);
    }

    return vars;
}

function stopPomodoroBreak() {
    // TO-DO
}

function stopPomodoro() {
    pomo_vars.status = 'stop';
    pomoAlarm.pause();
    pomoAlarm.currentTime = 0;
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    if (pomoInterval) clearInterval(pomoInterval);
    printTime();

    if (pomoStart.value) setPlayPauseButton(pomoStart.value, 'play');
}

function convertMsToTime(miliseconds: number): PomoTimeInterface {
    if (miliseconds <= 0)
        return {
            seconds: 0,
            minutes: 0
        }

    let mins = Math.floor(miliseconds / 60000)
    let secs = Math.floor((miliseconds % 60000) / 1000);

    return (secs === 60) ? {
        seconds: 0,
        minutes: mins + 1
    } : {
        seconds: secs,
        minutes: mins
    }
}

function convertTimeToMS(minutes: number, seconds: number): number {
    return (minutes * 60000) + (seconds * 1000);
}

function calculateTimeRemain() {
    let elapsedTimeSinceLastUpdate = new Date().getTime() - pomo_vars.lastUpdateTimestamp;
    let elapsedTimeUpdatedMs =
        elapsedTimeSinceLastUpdate + pomo_vars.timeElapsed.miliseconds;

    pomo_vars.timeElapsed.miliseconds = elapsedTimeUpdatedMs;

    let timeRemainMs = pomo_vars.timeRemain.totalInMiliseconds - elapsedTimeUpdatedMs;
    let timeRemain = convertMsToTime(timeRemainMs);

    pomo_vars.timeRemain.minutes = timeRemain.minutes;
    pomo_vars.timeRemain.seconds = timeRemain.seconds;

    pomo_vars.lastUpdateTimestamp = new Date().getTime();
}

function printTime() {
    if (!pomoTime.value) return;

    let min = pomo_vars.timeRemain.minutes.toString();
    min = (min.length === 1) ? `0${min}` : min;
    let sec = pomo_vars.timeRemain.seconds.toString();
    sec = (sec.length === 1) ? `0${sec}` : sec;

    pomoTime.value.textContent = `${min}:${sec}`;
}

function printBreakTime() {
    if (!pomoBreakTime.value) return;

    let min = pomo_break_vars.timeRemain.minutes.toString();
    min = (min.length === 1) ? `0${min}` : min;
    let sec = pomo_break_vars.timeRemain.seconds.toString();
    sec = (sec.length === 1) ? `0${sec}` : sec;

    pomoBreakTime.value.innerText = `${min}:${sec}`;
}

function setPlayPauseButton(elem: HTMLElement, value: string) {
    try {
        if (value === 'play') {
            elem.querySelector('.pomo-pause-svg')?.classList.add('hidden');
            elem.querySelector('.pomo-play-svg')?.classList.remove('hidden');
            // cssVars.value.playPauseBackground = `url("${playSvg}")`;
        }
        else if (value === 'pause') {
            elem.querySelector('.pomo-play-svg')?.classList.add('hidden');
            elem.querySelector('.pomo-pause-svg')?.classList.remove('hidden');
        }
        else
            throw 'setPlayPauseButton: value is no valid.';
    } catch (e) {
        console.error(e);
    }
}

function updatePomodoro() {
    if (!pomoStart.value) return;
    if (pomo_vars.status === 'pause' || pomo_vars.status === 'stop' || pomo_vars.status === 'end') {
        return;
    }

    calculateTimeRemain();
    printTime();

    if (pomo_vars.timeRemain.seconds <= 0 && pomo_vars.timeRemain.minutes <= 0) {
        pomo_vars.timeRemain.seconds = 0;
        pomo_vars.timeRemain.minutes = 0;
        pomo_vars.status = 'end';

        pomoAlarm.play();
        pomoEndNotification();
        setPlayPauseButton(pomoStart.value, 'play');
        if (pomoInterval)
            clearInterval(pomoInterval);
    }
    else if (pomo_vars.status === 'pause')
        setPlayPauseButton(pomoStart.value, 'play');
    else
        setPlayPauseButton(pomoStart.value, 'pause');
}

function getNotificationPermission() {
    return (window.Notification) ? window.Notification.permission : null;
}

function requestNotificatinoPermission() {
    let notifPermission = getNotificationPermission();
    if (notifPermission !== 'default')
        return;

    window.Notification.requestPermission();
}

function pomoEndNotification() {
    let notifPermission = getNotificationPermission();
    if (notifPermission === 'granted') {
        let notification = new Notification('Pomodoro finished! Time for a break :)');
        notification.onclick = () => {
            parent.focus();
            window.focus();
        }
    }
}

function initPomoBreak() {
    pomo_break_vars.timeRemain = JSON.parse(JSON.stringify(pomo_break_vars.interval));
    if (pomoBreakStart.value) setPlayPauseButton(pomoBreakStart.value, 'play');
    printBreakTime();
}

function initPomo() {
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    if (pomoStart.value) setPlayPauseButton(pomoStart.value, 'play');
    printTime();
}

onMounted(() => {
    initPomo();
    initPomoBreak();
    requestNotificatinoPermission();
});

</script>

<template>
    <div class="pomo-card">
        <div class="pomotime-wrapper">
            <h1>POMODORO</h1>
            <span class="pomo-time" ref="pomoTime"></span>
            <div class="pom-btns-wrapper">
                <button class="pomo-start" ref="pomoStart" @click="startPauseMainPomo"
                    aria-label="Start pomodoro">
                    <playSvg class="pomo-play-svg" />
                    <pauseSvg class="pomo-pause-svg hidden"/>
                </button>
                <button class="pomo-stop" ref="pomoStop" @click="stopPomodoro" aria-label="Stop pomodoro">
                    <stopSvg />
                </button>
            </div>
        </div>
        <div class="pomobreak-wrapper">
            <h1>BREAK</h1>
            <span class="pomo-time-break" ref="pomoBreakTime"></span>
            <div class="pom-btns-wrapper">
                <button class="pomo-start" ref="pomoBreakStart" @click="startPauseBreakPomo"
                    aria-label="Start pomodoro">
                    <playSvg class="pomo-play-svg" />
                    <pauseSvg class="pomo-pause-svg hidden"/>
                </button>
                <button class="pomo-stop" ref="pomoBreakStop" @click="stopPomodoroBreak"
                    aria-label="Stop pomodoro break">
                    <stopSvg />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hidden {
    display: none !important;
}

.pomo-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    background-color: aquamarine;

    width: 25rem;
    padding: 15px;

    border-radius: 5px;
}

.pomotime-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.pomo-time {
    font-size: 75px;
    font-weight: bold;
}

.pom-btns-wrapper {
    display: flex;
    gap: 10px;
}

.pomo-start {
    width: 35px;
    height: 35px;
    background-color: aquamarine;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: 0;
}

.pomo-stop {
    width: 35px;
    height: 35px;
    background-color: aquamarine;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: 0;
}
</style>