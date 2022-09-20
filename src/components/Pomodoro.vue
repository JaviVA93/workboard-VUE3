<script setup lang="ts">
import { onMounted } from 'vue';

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

function startPauseResumePomodoro() {
    let start_btn = document.querySelector('#pom_start') as HTMLButtonElement;
    if (pomo_vars.status === 'running') {
        pomo_vars.status = 'pause';
        if (start_btn) start_btn.innerText = 'Resume';
    }
    else {
        if (pomo_vars.status === '' || pomo_vars.status === 'end')
            pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));
        pomo_vars.status = 'running';
        if (start_btn) start_btn.innerText = 'Pause';
        updatePomodoro();
    }
}

function stopPomodoro() {
    pomo_vars.status = 'stop';
    pomo_vars.timeRemain = JSON.parse(JSON.stringify(pomo_vars.interval));

    printTime();

    let start_btn = document.querySelector('#pom_start') as HTMLButtonElement;
    if (start_btn) start_btn.innerText = 'Start';
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
    let time_element: HTMLSpanElement = document.querySelector('.pomo_time');
    if (time_element) time_element.innerText = 
        `${pomo_vars.timeRemain.minutes.toString()}:${pomo_vars.timeRemain.seconds.toString()}`;
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

    let btn = document.querySelector('#pom_start');
    if (pomo_vars.timeRemain.seconds <= 0 && pomo_vars.timeRemain.minutes <= 0) {
        pomo_vars.status = 'end';
        if (btn) btn.textContent = 'Start';
    }
    else if (pomo_vars.status === 'pause') {
        if (btn)
            btn.textContent = 'Resume'
        return;
    }
    else {
        if (btn)
            btn.textContent = 'Pause';
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
        <span class="pomo_time"></span>
        <div class="pom_btns_wrapper">
            <button id="pom_start" @click="startPauseResumePomodoro">Start</button>
            <button id="pom_stop" @click="stopPomodoro">Stop</button>
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

    width: 25vw;
    padding: 15px;

    border-radius: 5px;
}
</style>