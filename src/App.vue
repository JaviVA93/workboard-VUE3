<script setup lang="ts">

import Pomodoro from "./components/Pomodoro.vue";
import Spotify from './components/Spotify.vue';
import ToDo from "./components/ToDo/ToDo.vue";

</script>

<template>
  <div class="content">
    <div class="firt-row-components">
      <Spotify />
      <Pomodoro />
    </div>
    <ToDo />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Dosis&display=swap');

@media screen and (max-width: 800px) {
  .firt-row-components {
    flex-direction: column;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #1a1a1a;
}

#app {
  min-height: 100vh;
  width: 100%;
  font-family: 'Dosis', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #1a1a1a;
}

.firt-row-components {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 15px;
}

.content {
  padding: 10px;
}
</style>
