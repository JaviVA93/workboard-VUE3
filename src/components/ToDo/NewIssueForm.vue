<script setup lang="ts">
import { ref } from 'vue';

const titleInput = ref<HTMLInputElement | null>(null);
const textInput = ref<HTMLInputElement | null>(null);
const urlInput = ref<HTMLInputElement | null>(null);

const cardFormEmit = defineEmits<{
  (e: "createCard", title: string, text: string, url: string): void;
}>();

function createCard() {

  let title = (titleInput.value && titleInput.value.value !== '') ? titleInput.value.value : 'title not set';

  let text = (textInput.value && textInput.value.value !== '') ? textInput.value.value : 'Text not set';

  let url = (urlInput.value && urlInput.value.value !== '') ?
    urlInput.value.value : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

  console.log([title, text, url])
  cardFormEmit("createCard", title, text, url);
  clearInputs();
}

function clearInputs() {
  if (titleInput.value) titleInput.value.value = '';
  if (textInput.value) textInput.value.value = '';
  if (urlInput.value) urlInput.value.value = '';
}


// CSS VARIABLES
const soft_blue = '#2dbdff';
const sky = '#15b8c4';
const purple_blue = '#4730f1';
const soft_grey = ''
</script>

<template>
  <div class="new-card-form">
    <div>
      <h1>Create a new card.</h1>
      <div class="form-title">
        <span>Card title</span>
        <input type="text" ref="titleInput" />
      </div>
      <div class="form-text">
        <span>Card text</span>
        <input type="text" ref="textInput" />
      </div>
      <div class="form-url">
        <span>Card URL</span>
        <input type="text" ref="urlInput" />
      </div>
      <button @click="createCard">Create card</button>
    </div>
  </div>
</template>

<style scoped>
.new-card-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 50vw;
  background-color: v-bind(soft_blue);
  border: 0px;
  border-radius: 5px;
  box-shadow: -2px 2px 7px v-bind(purple_blue);
}

.new-card-form h1 {
  color: #2c3e50;
  margin: 10px 0;
}

.new-card-form>div {
  display: flex;
  flex-direction: column;
  width: fit-content;
  align-items: flex-start;
}

.new-card-form>div>div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.new-card-form>div>div:not(:last-child) {
  margin-bottom: 5px;
}

.new-card-form input {
  font-family: inherit;
  font-size: 1.2rem;
  height: 1.5rem;
  border: 1px solid;
  border-radius: 5px;
  box-shadow: -2px 2px 2px v-bind(sky);
  padding: 0 5px;
}

.new-card-form input:focus-visible {
  outline: 0;
  border: 2px solid;
}

.new-card-form button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  padding: 5px;
  width: 80%;
}
</style>