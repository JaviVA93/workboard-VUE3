<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';

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
    intervalFunction: number | undefined,
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
    intervalFunction: undefined,
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
    intervalFunction: undefined,
};

const pomoTime = ref<HTMLElement | null>(null),
    pomoStart = ref<HTMLElement | null>(null),
    pomoStop = ref<HTMLElement | null>(null),
    pomoBreakTime = ref<HTMLElement | null>(null),
    pomoBreakStart = ref<HTMLElement | null>(null),
    pomoBreakStop = ref<HTMLElement | null>(null),
    pomoWrapper = ref<HTMLElement | null>(null),
    pomoBreakWrapper = ref<HTMLElement | null>(null),
    pomoAlarm = new Audio(clockAlarm);


function startPauseMainPomo() {
    if (!pomoStart.value || !pomoTime.value) return;
    handleStartPauseResumePomodoro(pomo_vars, pomoStart.value, pomoTime.value);
}

function startPauseBreakPomo() {
    if (!pomoBreakStart.value || !pomoBreakTime.value) return;
    handleStartPauseResumePomodoro(pomo_break_vars, pomoBreakStart.value, pomoBreakTime.value);
}

function handleStartPauseResumePomodoro(vars: pomoTimer, playPauseButton: HTMLElement, timeElement: HTMLElement) {
    if (vars.status === 'running') {
        setPausePomo(vars, playPauseButton)
        // vars.status = 'pause';
        // setPlayPauseButton(playPauseButton, 'play');
        // if (vars.intervalFunction)
        //     clearInterval(vars.intervalFunction);
    }
    else {
        setRunningPomo(vars, playPauseButton, timeElement)
        // if (vars.status !== 'pause') {
        //     debugger
        //     vars.timeRemain = JSON.parse(JSON.stringify(vars.interval));
        //     vars.timeRemain.totalInMiliseconds =
        //         convertTimeToMS(vars.timeRemain.minutes, vars.timeRemain.seconds);
        //     vars.timeElapsed.miliseconds = 0;
        // }
        // vars.lastUpdateTimestamp = new Date().getTime();

        // vars.status = 'running';

        // setPlayPauseButton(playPauseButton, 'pause');

        // vars.intervalFunction = setInterval(() => { updatePomodoro(vars, timeElement, playPauseButton) }, 250);
    }
}

function setPausePomo(vars: pomoTimer, playPauseButton: HTMLElement) {
    vars.status = 'pause';
    setPlayPauseButton(playPauseButton, 'play');
    if (vars.intervalFunction)
        clearInterval(vars.intervalFunction);
}

function setRunningPomo(vars: pomoTimer, playPauseButton: HTMLElement, timeElement: HTMLElement) {
    if (vars.status !== 'pause') {
        vars.timeRemain = JSON.parse(JSON.stringify(vars.interval));
        vars.timeRemain.totalInMiliseconds =
            convertTimeToMS(vars.timeRemain.minutes, vars.timeRemain.seconds);
        vars.timeElapsed.miliseconds = 0;
    }
    vars.lastUpdateTimestamp = new Date().getTime();

    vars.status = 'running';

    setPlayPauseButton(playPauseButton, 'pause');

    vars.intervalFunction = setInterval(() => { updatePomodoro(vars, timeElement, playPauseButton) }, 250);
}


function stopPomoBreakButtonClick() {
    if (!pomoBreakTime.value || !pomoBreakStart.value) return
    stopPomodoro(pomo_break_vars, pomoBreakTime.value, pomoBreakStart.value);
}

function stopPomoButtonClick() {
    if (!pomoTime.value || !pomoStart.value) return
    stopPomodoro(pomo_vars, pomoTime.value, pomoStart.value);
}

function stopPomodoro(vars: pomoTimer, timeElement: HTMLElement, playPauseButton: HTMLElement) {
    vars.status = 'stop';
    pomoAlarm.pause();
    pomoAlarm.currentTime = 0;
    vars.timeRemain = JSON.parse(JSON.stringify(vars.interval));
    if (vars.intervalFunction) clearInterval(vars.intervalFunction);
    printTime(vars, timeElement);

    setPlayPauseButton(playPauseButton, 'play');
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

function calculateTimeRemain(vars: pomoTimer) {
    let elapsedTimeSinceLastUpdate = new Date().getTime() - vars.lastUpdateTimestamp;
    let elapsedTimeUpdatedMs =
        elapsedTimeSinceLastUpdate + vars.timeElapsed.miliseconds;

    vars.timeElapsed.miliseconds = elapsedTimeUpdatedMs;

    let timeRemainMs = vars.timeRemain.totalInMiliseconds - elapsedTimeUpdatedMs;
    let timeRemain = convertMsToTime(timeRemainMs);

    vars.timeRemain.minutes = timeRemain.minutes;
    vars.timeRemain.seconds = timeRemain.seconds;

    vars.lastUpdateTimestamp = new Date().getTime();
}

function printTime(vars: pomoTimer, timeElement: HTMLElement) {
    let min = vars.timeRemain.minutes.toString();
    min = (min.length === 1) ? `0${min}` : min;
    let sec = vars.timeRemain.seconds.toString();
    sec = (sec.length === 1) ? `0${sec}` : sec;

    timeElement.textContent = `${min}:${sec}`;
}

function setPlayPauseButton(elem: HTMLElement, value: string) {
    try {
        if (value === 'play') {
            elem.querySelector('.pomo-pause-svg')?.classList.add('hidden');
            elem.querySelector('.pomo-play-svg')?.classList.remove('hidden');
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

function updatePomodoro(vars: pomoTimer, timeElement: HTMLElement, playButton: HTMLElement) {
    if (vars.status === 'pause' || vars.status === 'stop' || vars.status === 'end') {
        return;
    }

    calculateTimeRemain(vars);
    printTime(vars, timeElement);

    if (vars.timeRemain.seconds <= 0 && vars.timeRemain.minutes <= 0) {
        vars.timeRemain.seconds = 0;
        vars.timeRemain.minutes = 0;
        vars.status = 'end';

        pomoAlarm.play();
        pomoEndNotification();
        setPlayPauseButton(playButton, 'play');
        if (vars.intervalFunction)
            clearInterval(vars.intervalFunction);
    }
    else if (vars.status === 'pause')
        setPlayPauseButton(playButton, 'play');
    else
        setPlayPauseButton(playButton, 'pause');
}

function hidePomo(pomoWrapper: HTMLElement) {
    const play_btn = pomoWrapper.querySelector('.pomo-start'),
        stop_btn = pomoWrapper.querySelector('.pomo-stop'),
        pomo_time = pomoWrapper.querySelector('.pomo-time'),
        pomo_title = pomoWrapper.querySelector('h1');
    if (!play_btn || !stop_btn || !pomo_time || !pomo_title) return;

    const tl = gsap.timeline();
    tl.to(pomo_time, { fontSize: '0px', duration: 0.5 });
    tl.to(pomo_title, { color: '#657381', duration: 0.5 }, '<');
    tl.to(play_btn, { width: '0px', height: '0px', duration: 0.5 }, 0.25);
    tl.to(stop_btn, { width: '0px', height: '0px', duration: 0.5 }, '<');
    tl.to(pomo_title, { fontSize: '20px', duration: 0.5 }, 0.25);
    tl.to(pomoWrapper, { gap: 0 }, '<');
    tl.call(() => { pomoWrapper.setAttribute('hidden', '') });
}

function showPomo(pomoWrapper: HTMLElement) {
    const play_btn = pomoWrapper.querySelector('.pomo-start'),
        stop_btn = pomoWrapper.querySelector('.pomo-stop'),
        pomo_time = pomoWrapper.querySelector('.pomo-time'),
        pomo_title = pomoWrapper.querySelector('h1');
    if (!play_btn || !stop_btn || !pomo_time || !pomo_title) return;

    const tl = gsap.timeline();
    tl.to(pomo_time, { fontSize: '75px', duration: 0.5 });
    tl.to(pomo_title, { color: '#2c3e50', duration: 0.5 }, '<');
    tl.to(play_btn, { width: '35px', height: '35px', duration: 0.5 }, 0.25);
    tl.to(stop_btn, { width: '35px', height: '35px', duration: 0.5 }, '<');
    tl.to(pomo_title, { fontSize: '2em', duration: 0.5 }, 0.25);
    tl.to(pomoWrapper, { gap: 10 }, '<');
    tl.call(() => {
        if (pomoWrapper.classList.contains('first-hidden'))
            pomoWrapper.classList.remove('first-hidden');
    });
}

function hideShowMainPomo() {
    if (!pomoBreakWrapper.value || !pomoWrapper.value) return;

    if (pomoWrapper.value.getAttribute('hidden') === '') {
        if (pomoBreakWrapper.value.getAttribute('hidden') !== '') {
            pomoBreakWrapper.value.setAttribute('hidden', '');
            hidePomo(pomoBreakWrapper.value);
            // TO-DO: Pause the current running pomo
            // if pomo finished, initialize it
        }
        pomoWrapper.value.removeAttribute('hidden');
        showPomo(pomoWrapper.value);
    }
}

function hideShowBreakPomo() {
    if (!pomoBreakWrapper.value || !pomoWrapper.value) return;

    if (pomoBreakWrapper.value.getAttribute('hidden') === '') {
        if (pomoWrapper.value.getAttribute('hidden') !== '') {
            pomoWrapper.value.setAttribute('hidden', '');
            hidePomo(pomoWrapper.value);
            // TO-DO: Pause the current running pomo
            // if pomo finished, initialize it
        }
        pomoBreakWrapper.value.removeAttribute('hidden');
        showPomo(pomoBreakWrapper.value);
    }
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
    if (pomoBreakTime.value) printTime(pomo_break_vars, pomoBreakTime.value);
    if (pomoBreakWrapper.value) hidePomo(pomoBreakWrapper.value);
}

function initPomo() {
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    if (pomoStart.value) setPlayPauseButton(pomoStart.value, 'play');
    if (pomoTime.value) printTime(pomo_vars, pomoTime.value);
}

onMounted(() => {
    initPomo();
    initPomoBreak();
    requestNotificatinoPermission();
});

</script>

<template>
    <div class="pomo-card">
        <div class="pomotime-wrapper" ref="pomoWrapper" @click="hideShowMainPomo">
            <h1>POMODORO</h1>
            <span class="pomo-time" ref="pomoTime"></span>
            <div class="pom-btns-wrapper">
                <button class="pomo-start" ref="pomoStart" @click="startPauseMainPomo" aria-label="Start pomodoro">
                    <playSvg class="pomo-play-svg" />
                    <pauseSvg class="pomo-pause-svg hidden" />
                </button>
                <button class="pomo-stop" ref="pomoStop" @click="stopPomoButtonClick" aria-label="Stop pomodoro">
                    <stopSvg />
                </button>
            </div>
        </div>
        <div class="pomotime-wrapper first-hidden" ref="pomoBreakWrapper" @click="hideShowBreakPomo">
            <h1>BREAK</h1>
            <span class="pomo-time" ref="pomoBreakTime"></span>
            <div class="pom-btns-wrapper">
                <button class="pomo-start" ref="pomoBreakStart" @click="startPauseBreakPomo"
                    aria-label="Start pomodoro">
                    <playSvg class="pomo-play-svg" />
                    <pauseSvg class="pomo-pause-svg hidden" />
                </button>
                <button class="pomo-stop" ref="pomoBreakStop" @click="stopPomoBreakButtonClick"
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;

    background-color: aquamarine;

    width: 25rem;
    height: 237px;
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

.pomotime-wrapper h1 {
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.pomotime-wrapper.first-hidden {
    gap: 0px;
}

.pomotime-wrapper.first-hidden .pomo-start {
    width: 0;
    height: 0;
}

.pomotime-wrapper.first-hidden .pomo-stop {
    width: 0;
    height: 0;
}

.pomotime-wrapper.first-hidden .pomo-time {
    font-size: 0px;
}

.pomotime-wrapper.first-hidden h1 {
    font-size: 20px;
    font-weight: 700;
    color: #657381;
}

.pomotime-wrapper[hidden] h1 {
    transition: scale 0.5s, font-weight 0.5s;
    color: #657381;
}

.pomotime-wrapper[hidden] h1:hover {
    scale: 1.2;
    font-weight: 700;
}

.pomo-time {
    font-size: 75px;
    font-weight: bold;
    line-height: 1;
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

.hide-pomo h1 {
    font-size: '20px';
}
</style>