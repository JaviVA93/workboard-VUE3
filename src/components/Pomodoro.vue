<script setup lang="ts">
import { onMounted, ref } from 'vue';

import playSvg from '../assets/play-button-round-icon.svg';
import pauseSvg from '../assets/pause-button-icon.svg';
import stopSvg from '../assets/stop-button-round-icon.svg';
import clockAlarm from '../assets/clock-alarm.mp3';

let pomo_vars = {
    status: '',
    interval: {
        minutes: 25,
        seconds: 0,
    },
    timeRemain: {
        seconds: 0,
        minutes: 0,
    },
}

const pomoTime = ref<HTMLElement | null>(null);
const pomoStart = ref<HTMLElement | null>(null);
const pomoStop = ref<HTMLElement | null>(null);

const cssVars = ref({
    playPauseBackground: `url("${playSvg}")`,
    stopBackground: `url("${stopSvg}")`,
});

let pomoInterval: number | undefined = undefined;

const pomoAlarm = new Audio(clockAlarm);

function startPauseResumePomodoro() {
    if (pomo_vars.status === 'running') {
        pomo_vars.status = 'pause';
        setPlayPauseButtonBackground('play');
        if (pomoInterval) clearInterval(pomoInterval);
    }
    else {
        if (pomo_vars.status === '' || pomo_vars.status === 'end')
            pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));

        pomo_vars.status = 'running';

        setPlayPauseButtonBackground('pause');

        pomoInterval = setInterval(updatePomodoro, 1000);
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

function calculateTimeRemain() {
    if (pomo_vars.timeRemain.seconds <= 0 && pomo_vars.timeRemain.minutes >= 0) {
        pomo_vars.timeRemain.minutes--;
        pomo_vars.timeRemain.seconds = 59;
    }
    else
        pomo_vars.timeRemain.seconds--;
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
    console.log(`updating pomodoro:
    Time remaining: ${pomo_vars.timeRemain.minutes}:${pomo_vars.timeRemain.seconds},
    status: ${pomo_vars.status}`);

    if (pomo_vars.status === 'pause' || pomo_vars.status === 'stop' || pomo_vars.status === 'end') {
        return;
    }

    if (pomo_vars.status === 'stop')
        return;

    calculateTimeRemain();
    printTime();

    if (pomo_vars.timeRemain.seconds <= 0 && pomo_vars.timeRemain.minutes <= 0) {
        pomo_vars.status = 'end';
        pomoAlarm.play();
        setPlayPauseButtonBackground('play');
        if (pomoInterval) clearInterval(pomoInterval);
    }
    else if (pomo_vars.status === 'pause') {
        setPlayPauseButtonBackground('play');
        return;
    }
    else {
        setPlayPauseButtonBackground('pause');
    }
}

onMounted(() => {
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    printTime();

    setPlayPauseButtonBackground('play');
});

</script>

<template>
    <div class="pomo-card">
        <h1>POMODORO</h1>
        <span class="pomo-time" ref="pomoTime"></span>
        <div class="pom-btns-wrapper">
            <button id="pomo-start" ref="pomoStart" @click="startPauseResumePomodoro"></button>
            <button id="pomo-stop" ref="pomoStop" @click="stopPomodoro"></button>
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
    font-size: 32px;
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
    border: 0;
}

#pomo-stop {
    width: 35px;
    height: 35px;
    background: v-bind('cssVars.stopBackground');
    background-size: contain;
    border: 0;
}
</style>