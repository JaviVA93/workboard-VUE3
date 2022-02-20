<script setup lang="ts">

import { gsap } from 'gsap';

const cardEmit = defineEmits<{
  (e: "removeCard", cardId: string): void;
}>();

const props = defineProps({
  id: String,
  title: String,
  text: String,
  url: String,
});

function goTo() {
  console.log("goTo");
  if (props.url) window.location.href = props.url;
}

function removeCard() {
  let tl = gsap.timeline();
  tl.call(() => {
    let card = document.querySelector(`.card[card-id="${props.id}"]`);
    card?.classList.add('to-remove');
  });
  tl.to(`.card[card-id="${props.id}"]`, { width: 0, opacity: 0, duration: 0.25, ease: "power3.inOut" });
  tl.call(() => {
    if (props.id)
      cardEmit("removeCard", props.id);
  });
}
</script>

<template>
  <div class="card" :card-id="props.id">
    <h1>{{ title }}</h1>
    <span>{{ text }}</span>
    <button @click="goTo">And a button</button>
    <button @click="removeCard">Remove card</button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 25vw;
  padding: 10px 30px;
  border: 0;
  box-shadow: -2px 2px 7px #e83a8e;
  background-color: #a78fff;
  border-radius: 5px;
  overflow: hidden;
}
h1 {
  font-size: 2rem;
  line-height: 2rem;
  color: rgb(53, 51, 51);
}
button {
  padding: 5px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  background-color: #e83a8e;
}

.to-remove h1 {
  opacity: 0;
}
.to-remove span {
  opacity: 0;
}
.to-remove button {
  opacity: 0;
}
</style>