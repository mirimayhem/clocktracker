<template>
  <input v-if="is === 'input'" v-model="value" :class="classes" />
  <select v-else-if="is === 'select'" v-model="value" :class="classes">
    <slot />
  </select>
  <textarea v-else-if="is === 'textarea'" v-model="value" :class="classes" />
</template>

<script setup lang="ts">
const props = defineProps<{
  mode?: "input" | "select" | "textarea";
  fontSize?: "sm" | "md" | "lg" | "xl";
  modelValue: any;
}>();
const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const classes = computed(
  () =>
    "block w-full border bg-stone-300 dark:bg-stone-600 disabled:bg-stone-400 dark:disabled:bg-stone-700 border-stone-100 dark:border-stone-500 rounded-md p-2 " +
    (is.value === "textarea" ? "resize-none" : "h-[2.5rem]") +
    fontSize.value
);

const is = computed(() => {
  switch (props.mode) {
    case "input":
      return "input";
    case "select":
      return "select";
    case "textarea":
      return "textarea";
    default:
      return "input";
  }
});

const fontSize = computed(() => {
  switch (props.fontSize) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
    default:
      return "text-lg";
  }
});
</script>
