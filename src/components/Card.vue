<script setup lang="ts">
const props = defineProps({
    title: String,
    text: String,
    url: String
});

function goTo() {
    console.log('goTo');
    if (props.url)
        window.location.href = props.url;
}
</script>

<template>
  <div class="card">
    <h1>{{ title }}</h1>
    <span>{{ text }}</span>
    <button @click="goTo">And a button</button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 30px;
  width: 25vw;
  padding: 10px;
  border: 1px solid;
  background-color: rgb(204, 197, 197);
  border-radius: 5px;
}
h1 {
  font-size: 2rem;
  line-height: 2rem;
  color: rgb(53, 51, 51);
}
span {
}
</style>