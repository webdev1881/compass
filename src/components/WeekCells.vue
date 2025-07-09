<template>
  <div class="cell">{{ fmt(data?.plan) }}</div>
  <div class="cell">{{ fmt(data?.fact) }}</div>
  <div class="cell" :style="{ backgroundColor: percColor(data?.percent) }">{{ perc(data?.percent) }}</div>
  <div class="cell">{{ fmt(data?.losses) }}</div>
  <div class="cell">{{ fmt(data?.shortages) }}</div>
  <div class="cell">{{ fmt(data?.fop) }}</div>
  <div class="cell" :class="{ warn: data?.shiftRemainder > 0 }">{{ data?.shiftRemainder || '–' }}</div>
  <div class="cell" :class="{ warn: data?.unprocessed > 0 }">{{ data?.unprocessed || '–' }}</div>
</template>

<script setup>
const props = defineProps({
  data: Object
})
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString('uk-UA') : '–'
}
function perc(p) {
  return typeof p === 'number' ? `${p}%` : '–'
}
function percColor(p) {
  if (p >= 70) return '#c8e6c9'
  if (p >= 50) return '#fff3cd'
  return '#f8d7da'
}
</script>

<style scoped>
.cell {
  min-width: 90px;
  text-align: center;
  padding: 4px 6px;
}
.warn {
  color: #e74c3c;
  font-weight: bold;
}
</style>
