<script setup lang="ts">

import { gsap } from 'gsap';
import { ref } from 'vue';

const cardEmit = defineEmits<{
  (e: "removeCard", cardId: string): void;
}>();

const props = defineProps({
  id: String,
  title: String,
  text: String,
  url: String,
});

const card = ref<HTMLElement | null>(null);

function removeCard() {
  if (!card.value) return;

  let computed_height = window.getComputedStyle(card.value).getPropertyValue('height');
  card.value.style.height = computed_height;

  let tl = gsap.timeline();
  tl.to(card.value, { width: 0, opacity: 0, duration: 0.25, ease: "power3.inOut" });
  tl.call(() => {
    if (props.id)
      cardEmit("removeCard", props.id);
  });
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
  <!-- <div class="card" :card-id="props.id" ref="card"> -->
  <div class="card" :card-id="props.id" ref="card">
    <h1>{{ title }}</h1>
    <span>{{ text }}</span>
    <button @click="removeCard">Remove card</button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  width: 20rem;
  padding: 5px;
  border: 0;
  box-shadow: -2px 2px 7px v-bind(color_3);
  background-color: v-bind(color_5);
  border-radius: 5px;
  overflow: hidden;
}

h1 {
  font-size: 2rem;
  line-height: 2rem;
  color: v-bind(color_2);
}

span {
  color: v-bind(color_1);
  font-size: 1.2rem;
}

button {
  align-self: flex-end;

  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;

  color: v-bind(color_3);
  background-color: v-bind(color_2);

  padding: 5px;
  border-radius: 3px;
  border: 0;
}
button:hover {
  background-color: v-bind(color_1);
}
</style>