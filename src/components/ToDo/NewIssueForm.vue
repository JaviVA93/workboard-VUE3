<script setup lang="ts">
import { ref } from 'vue';

const titleInput = ref<HTMLInputElement | null>(null);
const textInput = ref<HTMLInputElement | null>(null);
const urlInput = ref<HTMLInputElement | null>(null);

const cardFormEmit = defineEmits<{
  (e: "createCard", title: string, text: string): void;
}>();

function createCard() {

  let title = (titleInput.value && titleInput.value.value !== '') ? titleInput.value.value : 'title not set';

  let text = (textInput.value && textInput.value.value !== '') ? textInput.value.value : 'Text not set';

  cardFormEmit("createCard", title, text);
  clearInputs();
}

function clearInputs() {
  if (titleInput.value) titleInput.value.value = '';
  if (textInput.value) textInput.value.value = '';
}


// CSS VARIABLES
//COLORS
const color_1 = '#76B576';
const color_2 = '#4C754C';
const color_3 = '#1B291B';
const color_4 = '#233623';
const color_5 = '#1E2E1E';
</script>

<template>
  <div class="new-card-form">
    <input type="text" placeholder="Task title" ref="titleInput" />
    <input type="text" placeholder="Task description" ref="textInput" />
    <button @click="createCard">Add task</button>
  </div>
</template>

<style scoped>
.new-card-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  width: 400px;
  background-color: v-bind(color_2);
  border: 0px;
  border-radius: 5px;
  box-shadow: -2px 2px 7px v-bind(color_4);

  padding: 5px;
}

.new-card-form input {
  font-family: inherit;
  font-size: 1.2rem;
  width: 100%;
  height: 2.5rem;
  border: 0;
  border-radius: 5px;
  background-color: v-bind(color_1);
  padding: 0 5px;
}

.new-card-form input::placeholder {
  color: v-bind(color_3)
}

.new-card-form input:focus-visible {
  outline: 0;
  border: 0;
}

.new-card-form button {
  align-self: flex-end;

  display: flex;
  align-items: center;
  justify-content: center;

  color: v-bind(color_2);
  background-color: v-bind(color_4);

  font-size: 1.2rem;
  font-weight: 700;

  border-radius: 3px;
  border: 0;
  padding: 5px;
  width: 100px;
}
.new-card-form button:hover {
  background-color: v-bind(color_5);
}
</style>