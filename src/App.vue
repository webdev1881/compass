<template>
  <div id="app">
<<<<<<< HEAD
=======
    <TableComponent />
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
    <Tdiv />
    <!-- <Tt /> -->
    <!-- <T /> -->
    <!-- <TableComponent /> -->
    <!-- <TableComponent0 /> -->
  </div>
</template>

<script>
import TableComponent from './components/TableComponent.vue'
import TableComponent0 from './components/TableComponent0.vue'
import T from './components/T.vue'
import Tdiv from './components/Tdiv.vue'
import Tt from './components/Tt.vue'

export default {
  name: 'App',
  components: {
    TableComponent,
    TableComponent0,
    T,
    Tdiv,
    Tt,
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>