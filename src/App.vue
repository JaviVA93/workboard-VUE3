<script setup lang="ts">

import Pomodoro from "./components/Pomodoro.vue";
import Spotify from './components/Spotify.vue';
import ToDo from "./components/ToDo/ToDo.vue";

</script>

<template>
  <div class="spotify-container">
    <Spotify />
  </div>
  <div class="pomodoro-container">
    <Pomodoro />
  </div>
  <ToDo />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #df57bb2e;
}

#app {
  font-family: 'Dosis', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.spotify-container {
  width: fit-content;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 15px;
}

.pomodoro-container {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, 25rem);
  gap: 1rem;
  justify-content: center;
}
</style>
