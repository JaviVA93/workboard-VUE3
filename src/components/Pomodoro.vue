<script setup lang="ts">
import { onMounted, ref } from 'vue';

let pomo_vars = {
    status: '',
    interval: {
        minutes: 0,
        seconds: 10,
    },
    timeRemain: {
        seconds: 0,
        minutes: 0,
    },
}

const pomoTime = ref<HTMLElement | null>(null);
const pomoStart = ref<HTMLElement | null>(null);
const pomoStop = ref<HTMLElement | null>(null);

function startPauseResumePomodoro() {
    if (pomo_vars.status === 'running') {
        pomo_vars.status = 'pause';
        if (pomoStart.value) pomoStart.value.innerText = 'Resume';
    }
    else {
        if (pomo_vars.status === '' || pomo_vars.status === 'end')
            pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
        pomo_vars.status = 'running';
        if (pomoStart.value) pomoStart.value.innerText = 'Pause';
        updatePomodoro();
    }
}

function stopPomodoro() {
    pomo_vars.status = 'stop';
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));

    printTime();

    if (pomoStart.value)  pomoStart.value.innerText = 'Start';
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
    if (pomoTime.value)
        pomoTime.value.innerText = `${pomo_vars.timeRemain.minutes.toString()}:${pomo_vars.timeRemain.seconds.toString()}`;
}

function updatePomodoro() {
    console.log(`updating pomodoro:
    Time remaining: ${pomo_vars.timeRemain.minutes}:${pomo_vars.timeRemain.seconds},
    status: ${pomo_vars.status}`);

    if (pomo_vars.status === 'pause' || pomo_vars.status === 'stop' || pomo_vars.status === 'end')
        return;

    if (pomo_vars.status === 'stop')
        return;

    calculateTimeRemain();
    printTime();

    if (pomo_vars.timeRemain.seconds <= 0 && pomo_vars.timeRemain.minutes <= 0) {
        pomo_vars.status = 'end';
        if (pomoStart.value) pomoStart.value.textContent = 'Start';
    }
    else if (pomo_vars.status === 'pause') {
        if (pomoStart.value) pomoStart.value.textContent = 'Resume'
        return;
    }
    else {
        if (pomoStart.value) pomoStart.value.textContent = 'Pause';
        pomo_vars.status = 'running';
        setTimeout(() => {
            updatePomodoro();
        }, 1000);
    }
}
onMounted(() => {
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
    printTime();
});

</script>
<template>
    <div class="pomo-card">
        <h1>POMODORO</h1>
        <span class="pomo_time" ref="pomoTime"></span>
        <div class="pom_btns_wrapper">
            <button id="pomo_start" ref="pomoStart" @click="startPauseResumePomodoro">Start</button>
            <button id="pomo_stop" ref="pomoStop" @click="stopPomodoro">Stop</button>
        </div>
    </div>
</template>
<style scoped>
.pomo-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: aquamarine;

    width: 25rem;
    padding: 15px;

    border-radius: 5px;
}
</style>