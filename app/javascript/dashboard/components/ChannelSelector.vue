<template>
  <div class="w-40">
    <button
      class="w-full bg-white dark:bg-slate-900 cursor-pointer flex flex-col justify-end transition-all duration-200 ease-in -m-px py-4 px-0 items-center border border-solid border-slate-25 dark:border-slate-800 hover:border-woot-500 dark:hover:border-woot-500 hover:shadow-md hover:z-50 disabled:opacity-60"
      @click="$emit('click')"
    >
      <img :src="src" :alt="title" class="w-1/2 my-4 mx-auto" />
      <h3
        class="text-slate-800 dark:text-slate-100 text-base text-center capitalize"
      >
        {{ title }}
      </h3>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
.inactive {
  img {
    filter: grayscale(100%);
  }

  &:hover {
    @apply border-transparent shadow-none cursor-not-allowed;
  }
}
</style>
