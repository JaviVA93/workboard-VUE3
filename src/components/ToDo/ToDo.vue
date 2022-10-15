<script setup lang="ts">

import { onMounted, ref } from 'vue';
import Issue from "./Issue.vue";
import NewIssueForm from './NewIssueForm.vue';

interface CardInterface {
  id: string,
  title: string,
  text: string,
  url: string
}

const issues = ref<CardInterface[]>();

onMounted(() => {
  let ls_cards_data = window.localStorage.getItem('cards_data');
  if (ls_cards_data)
    issues.value = JSON.parse(ls_cards_data);

  if (!issues.value)
    issues.value = [];
});

function createCard(title: string, text: string, url: string) {
  issues.value = issues.value || [];
  issues.value.push({
    id: Math.floor(Math.random() * 100000).toString(),
    title: title,
    text: text,
    url: url
  });
  window.localStorage.setItem('cards_data', JSON.stringify(issues.value));
}

function removeCard(card_id: string) {
  if (issues.value) {
    issues.value = issues.value.filter(card => card.id !== card_id);
    window.localStorage.setItem('cards_data', JSON.stringify(issues.value));
  }
}
</script>




<template>
    <div class="cards-container">
        <div v-for="card in issues" :key="card.id">
            <Issue @remove-card="removeCard" :id="card.id" :title="card.title" :text="card.text" :url="card.url" />
        </div>
    </div>
    <div class="card-form-container">
        <NewIssueForm @create-card="createCard" />
    </div>
</template>




<style scoped>
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