<template>
  <div id="app">
    <TodoList listName="My first VUE app" />
  </div>
</template>

<script>
import TodoList from "./components/TodoList.vue";

export default {
  name: "app",
  components: {
    TodoList
  }
};
</script>

<style>
</style>

