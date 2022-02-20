<script setup lang="ts">
const cardFormEmit = defineEmits<{
  (e: "createCard", title: string, text: string, url: string): void;
}>();

function createCard() {
  let title = (<HTMLInputElement>(
    document.querySelector(".new-card-form .form-title input")
  )).value;
  title = (title === '') ? 'title not set' : title;
  let text = (<HTMLInputElement>(
    document.querySelector(".new-card-form .form-text input")
  )).value;
  text = (text === '') ? 'text not set' : text;
  let url = (<HTMLInputElement>(
    document.querySelector(".new-card-form .form-url input")
  )).value;
  url = (url === "") ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : url;

  console.log([title, text, url])
  cardFormEmit("createCard", title, text, url);
  clearInputs();
}

function clearInputs() {
  let inputs = document.querySelectorAll<HTMLInputElement>(
    ".new-card-form input"
  );
  inputs.forEach((input) => {
    input.value = "";
  });
}
</script>

<template>
  <div class="new-card-form">
    <div>
      <h1>Create a new card.</h1>
      <div class="form-title">
        <span>Card title</span>
        <input type="text" />
      </div>
      <div class="form-text">
        <span>Card text</span>
        <input type="text" />
      </div>
      <div class="form-url">
        <span>Card URL</span>
        <input type="text" />
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
  background-color: #2dbdff;
  border: 0px;
  border-radius: 5px;
  box-shadow: -2px 2px 7px #4730f1;
}
.new-card-form h1 {
  color: #2c3e50;
  margin: 10px 0;
}
.new-card-form > div {
  display: flex;
  flex-direction: column;
  width: fit-content;
  align-items: flex-start;
}
.new-card-form > div > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.new-card-form > div > div:not(:last-child) {
  margin-bottom: 5px;
}
.new-card-form input {
  font-family: inherit;
  font-size: 1.2rem;
  height: 1.5rem;
  border: 0;
  border-radius: 5px;
  box-shadow: -2px 2px 2px #15b8c4;
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