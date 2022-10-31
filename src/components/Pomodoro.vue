<script setup lang="ts">
import { onMounted, ref } from 'vue';

import playSvg from '../assets/play-button-round-icon.svg';
import pauseSvg from '../assets/pause-button-icon.svg';
import stopSvg from '../assets/stop-button-round-icon.svg';
import clockAlarm from '../assets/clock-alarm.mp3';

interface PomoTimeInterface {
    seconds: number,
    minutes: number
}

const pomo_vars = {
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
}

const pomoTime = ref<HTMLElement | null>(null);
const pomoStart = ref<HTMLElement | null>(null);
const pomoStop = ref<HTMLElement | null>(null);

const cssVars = ref({
    playPauseBackground: `url("${playSvg}")`,
    stopBackground: `url("${stopSvg}")`,
});

let pomoInterval: any = undefined;

const pomoAlarm = new Audio(clockAlarm);

function startPauseResumePomodoro() {
    if (pomo_vars.status === 'running') {
        pomo_vars.status = 'pause';
        setPlayPauseButtonBackground('play');
        if (pomoInterval) 
            clearInterval(pomoInterval);
    }
    else {
        if (pomo_vars.status !== 'pause') {
            pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
            pomo_vars.timeRemain.totalInMiliseconds = 
                convertTimeToMS(pomo_vars.timeRemain.minutes, pomo_vars.timeRemain.seconds);
            pomo_vars.timeElapsed.miliseconds = 0;
        }
        pomo_vars.lastUpdateTimestamp = new Date().getTime();

        pomo_vars.status = 'running';

        setPlayPauseButtonBackground('pause');

        pomoInterval = setInterval(updatePomodoro, 250);
    }
}

function stopPomodoro() {
    pomo_vars.status = 'stop';
    pomoAlarm.pause();
    pomoAlarm.currentTime = 0;
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    if (pomoInterval) clearInterval(pomoInterval);
    printTime();

    setPlayPauseButtonBackground('play');
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
    if (pomoTime.value) {
        let min = pomo_vars.timeRemain.minutes.toString();
        min = (min.length === 1) ? `0${min}` : min;
        let sec = pomo_vars.timeRemain.seconds.toString();
        sec = (sec.length === 1) ? `0${sec}` : sec;

        pomoTime.value.innerText = `${min}:${sec}`;
    }
}

function setPlayPauseButtonBackground(value: string) {
    try {
        if (!pomoStart.value)
            throw 'pomoStart.value is null';

        if (value === 'play')
            cssVars.value.playPauseBackground = `url("${playSvg}")`;
        else if (value === 'pause')
            cssVars.value.playPauseBackground = `url("${pauseSvg}")`;
        else
            throw 'setPlayPauseButtonBackground: value is no valid.';
    } catch (e) {
        console.error(e);
    }
}

function updatePomodoro() {
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
        setPlayPauseButtonBackground('play');
        if (pomoInterval) 
            clearInterval(pomoInterval);
    }
    else if (pomo_vars.status === 'pause')
        setPlayPauseButtonBackground('play');
    else
        setPlayPauseButtonBackground('pause');
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

onMounted(() => {
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    printTime();
    requestNotificatinoPermission();
    setPlayPauseButtonBackground('play');
});

</script>

<template>
    <div class="pomo-card">
        <h1>POMODORO</h1>
        <span class="pomo-time" ref="pomoTime"></span>
        <div class="pom-btns-wrapper">
            <button id="pomo-start" ref="pomoStart" @click="startPauseResumePomodoro" aria-label="Start pomodoro"></button>
            <button id="pomo-stop" ref="pomoStop" @click="stopPomodoro" aria-label="Stop pomodoro"></button>
        </div>
    </div>
</template>

<style scoped>
.pomo-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;

    background-color: aquamarine;

    width: 25rem;
    padding: 15px;

    border-radius: 5px;
}

.pomo-time {
    font-size: 75px;
    font-weight: bold;
}

.pom-btns-wrapper {
    display: flex;
    gap: 10px;
}

#pomo-start {
    width: 35px;
    height: 35px;
    background: v-bind('cssVars.playPauseBackground');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: 0;
}

#pomo-stop {
    width: 35px;
    height: 35px;
    background: v-bind('cssVars.stopBackground');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border: 0;
}
</style>