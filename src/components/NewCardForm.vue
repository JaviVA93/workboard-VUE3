<script setup lang="ts">
 const emit = defineEmits<{
    (e: 'createCard', title: string, text: string, url: string): void
}>();

function createCard() {
  let title = (<HTMLInputElement>document.querySelector(".new-card-form .form-title input")).value;
  let text = (<HTMLInputElement>document.querySelector(".new-card-form .form-text input")).value;
  let url = (<HTMLInputElement>document.querySelector(".new-card-form .form-url input")).value;
  emit('createCard', title, text, url);
  clearInputs();
}
function clearInputs() {
    let inputs = document.querySelectorAll<HTMLInputElement>('.new-card-form input');
    inputs.forEach(input => {
        input.value = '';
    });
}
</script>

<template>
  <div class="new-card-form">
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
</template>
<style scoped>
.new-card-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 50vw;
  border: 1px solid;
}
button {
  width: 25%;
}
</style>