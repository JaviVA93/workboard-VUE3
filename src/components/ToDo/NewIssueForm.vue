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
    <div class="field-wrapper">
      <input type="text" ref="titleInput" id="todo-form-title-field" placeholder=" "/>
      <label for="todo-form-title-field" class="todo-form-label">Task title</label>
    </div>
    <div class="field-wrapper">
      <input type="text" ref="textInput" id="todo-form-text-field" placeholder=" "/>
      <label for="todo-form-text-field" class="todo-form-label">Task description</label>
    </div>
    <button @click="createCard">Add task</button>
  </div>
</template>

<style scoped>
.new-card-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  width: 400px;

  background-color: v-bind(color_2);
  box-shadow: -2px 2px 7px v-bind(color_4);

  border: 0px;
  border-radius: 5px;

  padding: 15px 5px 5px;
}

.new-card-form .field-wrapper {
  width: 100%;
  position: relative;

  height: 2.5rem;
  
  display: flex;
  align-items: center;
}

.new-card-form .field-wrapper:nth-child(1) {
  margin-bottom: 10px;
}

.new-card-form input {
  position: absolute;
  font-family: inherit;
  font-size: 1.2rem;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 5px;
  background-color: v-bind(color_1);
  padding: 8px 16px 0;
}

.new-card-form .todo-form-label {
  z-index: 1;
  position: relative;
  top: 0px;
  left: 16px;

  background: v-bind(color_1);

  font-weight: 900;
  color: v-bind(color_3);

  padding: 1px 5px;
  
  transition: all 0.5s ease;
}

.new-card-form .field-wrapper input:focus ~ .todo-form-label {
  top: -50%;
  left: 12px;
  scale: 0.9;
  background-color: v-bind(color_2);
  border-radius: 4px;
}

.new-card-form .field-wrapper input:not(:placeholder-shown) ~ .todo-form-label {
  top: -50%;
  left: 12px;
  scale: 0.9;
  background-color: v-bind(color_2);
  border-radius: 4px;
}

.new-card-form input:focus-visible {
  outline: v-bind(color_3) solid 1px;
}

.new-card-form button {
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100px;

  color: v-bind(color_2);
  background-color: v-bind(color_4);

  font-size: 1.2rem;
  font-weight: 700;

  border-radius: 3px;
  border: 0;
  padding: 5px;
  margin-top: 10px;
}

.new-card-form button:hover {
  background-color: v-bind(color_5);
}
</style>