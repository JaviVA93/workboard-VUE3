<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { onMounted, ref, Ref } from 'vue';
import Card from "./components/Card.vue";
import NewCardForm from "./components/NewCardForm.vue";
import Pomodoro from "./components/Pomodoro.vue";
import Spotify from './components/Spotify.vue';

interface CardInterface {
  id: string,
  title: string,
  text: string,
  url: string
}

const cards = ref<CardInterface[]>();

onMounted(() => {
  let ls_cards_data = window.localStorage.getItem('cards_data');
  if (ls_cards_data)
    cards.value = JSON.parse(ls_cards_data);

  if (!cards.value)
    cards.value = [];
});

function createCard(title: string, text: string, url: string) {
  cards.value = cards.value || [];
  cards.value.push({
    id: Math.floor(Math.random() * 100000).toString(),
    title: title,
    text: text,
    url: url
  });
  window.localStorage.setItem('cards_data', JSON.stringify(cards.value));
}

function removeCard(card_id: string) {
  if (cards.value) {
    cards.value = cards.value.filter(card => card.id !== card_id);
    window.localStorage.setItem('cards_data', JSON.stringify(cards.value));
  }
}
</script>

<template>
  <div class="spotify-container">
    <Spotify />
  </div>
  <div class="pomodoro-container">
    <Pomodoro />
  </div>
  <div class="cards-wrapper">
    <div class="cards-container">
      <div v-for="card in cards" :key="card.id">
        <Card @remove-card="removeCard" :id="card.id" :title="card.title" :text="card.text" :url="card.url" />
      </div>
    </div>
    <div class="card-form-container">
      <NewCardForm @create-card="createCard" />
    </div>
  </div>
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

.cards-wrapper {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 98%;

  display: flex;
  flex-direction: column;
  gap: 15px;

  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  padding: 15px 0; 
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, 20rem);
  row-gap: 10px;
  column-gap: 10px;
  justify-content: center;
}

.cards-container .card {
  height: 100%;
}

.card-form-container {
  position: relative;
  width: fit-content;
  left: 50%;
  transform: translateX(-50%);
}
</style>
