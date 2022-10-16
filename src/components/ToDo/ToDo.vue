<script setup lang="ts">

import { onMounted, ref } from 'vue';
import Issue from "./Issue.vue";
import NewIssueForm from './NewIssueForm.vue';

interface CardInterface {
  id: string,
  title: string,
  text: string
}

const issues = ref<CardInterface[]>();

onMounted(() => {
  let ls_cards_data = window.localStorage.getItem('cards_data');
  if (ls_cards_data)
    issues.value = JSON.parse(ls_cards_data);

  if (!issues.value)
    issues.value = [];
});

function createCard(title: string, text: string) {
  issues.value = issues.value || [];
  issues.value.push({
    id: Math.floor(Math.random() * 100000).toString(),
    title: title,
    text: text
  });
  window.localStorage.setItem('cards_data', JSON.stringify(issues.value));
}

function removeCard(card_id: string) {
  if (issues.value) {
    issues.value = issues.value.filter(card => card.id !== card_id);
    window.localStorage.setItem('cards_data', JSON.stringify(issues.value));
  }
}

// CSS VARIABLES
//COLORS
const color_1 = '#76B576';
const color_2 = '#4C754C';
const color_2_soft = "#5e765e";
const color_3 = '#1B291B';
const color_4 = '#233623';
const color_5 = '#1E2E1E';
</script>




<template>
  <div class="todo-wrapper">
    <h1 class="todo-wrapper-title">TODO</h1>
    <div class="horizontal-line"></div>
    <div class="issues-container">
      <div v-for="card in issues" :key="card.id">
        <Issue @remove-card="removeCard" :id="card.id" :title="card.title" :text="card.text" :url="card.url" />
      </div>
    </div>
    <div class="issue-form-container">
      <NewIssueForm @create-card="createCard" />
    </div>
  </div>
</template>




<style scoped>
.todo-wrapper {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 98%;

  display: flex;
  flex-direction: column;

  background-color: v-bind(color_2_soft);
  border-radius: 5px;
  padding: 10px;
}

.todo-wrapper-title {
  align-self: flex-start;
  color: v-bind(color_5);
}

.horizontal-line {
  border: 1px solid v-bind(color_4);
}

.issues-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, 20rem);
  row-gap: 10px;
  column-gap: 10px;
  margin: 10px 0;
}

.issues-container .card {
  height: 100%;
}

.issue-form-container {
  position: relative;
  width: fit-content;
  align-self: flex-start;
}
</style>