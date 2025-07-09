<template>
    <div class="sales-table">
        <!-- БЛОК: РЕГИОНЫ -->
        <div class="section">
            <div class="table-title">Регионы</div>

            <div class="table-row header">
                <div class="cell region">Регион</div>

                <!-- неделя 1 -->
                <template v-if="weeks[0]">

                    <div class="head_week">
                        <div class="title">weeks[0]</div>
                        <div class="cont">
                            <div class="cell head_1">
                                <div class="title">Загальний бал</div>
                                <div class="head_2">
                                    <div class="cell head_2-item">РАНГ</div>
                                    <div class="cell head_2-item">900</div>
                                </div>
                            </div>

                            <div class="cell head_1">
                                <div class="title">Виторг</div>
                                <div class="head_2">
                                    <div class="cell head_2-item">100</div>
                                    <div class="cell head_2-item">План</div>
                                    <div class="cell head_2-item">Факт</div>
                                    <div class="cell head_2-item">%</div>
                                </div>
                            </div>
                            <div class="cell head_1">
                                <!-- <div class="title">Втрати Списання</div> -->
                                <div class="head_2">
                                    <div class="cell head_2-item">Втрати Списання</div>
                                    <div class="cell head_2-item">Недостачі</div>
                                    <div class="cell head_2-item">ФОП</div>
                                    <div class="cell head_2-item">Від'ємні залишки</div>
                                    <div class="cell head_2-item">Не проведені списання</div>
                                </div>
                            </div>
                        </div>


                    </div>



                </template>

                <!-- неделя 2 -->
                <template v-if="weeks[1]">
                    <div class="head_week">
                        <div class="title">weeks[1]</div>
                        <div class="cont">
                            <div class="cell head_1">
                                <div class="title">Загальний бал</div>
                                <div class="head_2">
                                    <div class="cell head_2-item">РАНГ</div>
                                    <div class="cell head_2-item">900</div>
                                </div>
                            </div>

                            <div class="cell head_1">
                                <div class="title">Виторг</div>
                                <div class="head_2">
                                    <div class="cell head_2-item">100</div>
                                    <div class="cell head_2-item">План</div>
                                    <div class="cell head_2-item">Факт</div>
                                    <div class="cell head_2-item">%</div>
                                </div>
                            </div>
                            <div class="cell head_1">
                                <!-- <div class="title">Втрати Списання</div> -->
                                <div class="head_2">
                                    <div class="cell head_2-item">Втрати Списання</div>
                                    <div class="cell head_2-item">Недостачі</div>
                                    <div class="cell head_2-item">ФОП</div>
                                    <div class="cell head_2-item">Від'ємні залишки</div>
                                    <div class="cell head_2-item">Не проведені списання</div>
                                </div>
                            </div>
                        </div>


                    </div>
                </template>
            </div>

            <div class="table-row" v-for="region in regions" :key="'region-' + region.id">

                <div class="cell region"><span class="dot"
                        :style="{ backgroundColor: regionColor(region.name) }"></span>{{ region.name }}</div>

                <template v-for="week in weeks">
                    <div class="cell">{{ averageRank(region) }}</div>
                    <div class="cell">0</div>
                    <div class="cell">0</div>
                    <WeekCells :data="aggregateWeek(region, week.id)" />
                </template>
            </div>

        </div>

        <!-- БЛОК: МАГАЗИНЫ -->
        <div class="section">
            <div class="table-title">Магазины</div>

            <div class="table-row header">
                <div class="cell region">Магазин</div>
                <div class="cell">РАНГ</div>
                <div class="cell">900</div>
                <div class="cell">100</div>

                <!-- неделя 1 -->
                <template v-if="weeks[0]">
                    <div class="cell">План</div>
                    <div class="cell">Факт</div>
                    <div class="cell">%</div>
                    <div class="cell">Втрати</div>
                    <div class="cell">Недостачі</div>
                    <div class="cell">ФОП</div>
                    <div class="cell">Від’ємні</div>
                    <div class="cell">Не спис.</div>
                </template>

                <!-- неделя 2 -->
                <template v-if="weeks[1]">
                    <div class="cell">План</div>
                    <div class="cell">Факт</div>
                    <div class="cell">%</div>
                    <div class="cell">Втрати</div>
                    <div class="cell">Недостачі</div>
                    <div class="cell">ФОП</div>
                    <div class="cell">Від’ємні</div>
                    <div class="cell">Не спис.</div>
                </template>
            </div>

            <div class="table-row" v-for="store in allStores" :key="'store-' + store.id">
                <div class="cell region">
                    <span class="dot" :style="{ backgroundColor: regionColor(store.regionName) }"></span>
                    {{ store.name }}
                </div>
                <div class="cell">{{ store.rank }}</div>
                <div class="cell">0</div>
                <div class="cell">0</div>

                <template v-for="week in weeks">
                    <WeekCells :data="getWeekData(store, week.id)" />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WeekCells from './WeekCells.vue'

// Меры для отображения
const measures = [
    { name: 'План', key: 'plan' },
    { name: 'Факт', key: 'fact' },
    { name: '%', key: 'percent' },
    { name: 'Втрати', key: 'losses' },
    { name: 'Недостачі', key: 'shortages' },
    { name: 'ФОП', key: 'fop' },
    { name: 'Від’ємні', key: 'shiftRemainder' },
    { name: 'Не спис.', key: 'unprocessed' }
]

// загрузка
const rawData = ref({})
onMounted(async () => {
    const res = await fetch('/sales.json')
    rawData.value = await res.json()
})

const weeks = computed(() => rawData.value.weeks || [])
const regions = computed(() => rawData.value.regions || [])

// список всех магазинов с привязкой к региону
const allStores = computed(() => {
    return regions.value.flatMap(region =>
        region.stores.map(store => ({
            ...store,
            regionName: region.name
        }))
    )
})

// получить данные магазина за неделю
function getWeekData(store, weekId) {
    return store.weeklyData.find(w => w.weekId === weekId)
}

// агрегированные данные по региону
function aggregateWeek(region, weekId) {
    const dataList = region.stores.map(store =>
        getWeekData(store, weekId)
    ).filter(Boolean)

    if (!dataList.length) return {}

    const result = {
        plan: 0, fact: 0, percent: 0, losses: 0,
        shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0
    }

    dataList.forEach(d => {
        result.plan += d.plan
        result.fact += d.fact
        result.losses += d.losses
        result.shortages += d.shortages
        result.fop += d.fop
        result.shiftRemainder += d.shiftRemainder
        result.unprocessed += d.unprocessed
    })

    result.percent = Math.round((result.fact / result.plan) * 100)
    return result
}

function averageRank(region) {
    const sum = region.stores.reduce((acc, s) => acc + s.rank, 0)
    return Math.round(sum / region.stores.length)
}

// цвета для регионов
function regionColor(name) {
    const palette = {
        'Белая Церковь': '#e74c3c',
        'Киев': '#2ecc71',
        'Харьков': '#3498db',
        'Днепр': '#f1c40f'
    }
    return palette[name] || '#aaa'
}
</script>

<style scoped>
/* .sales-table {
  font-family: sans-serif;
  font-size: 13px;
  width: 100%;
  overflow-x: auto;
}
.section {
  margin-bottom: 2rem;
}
.table-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 0.5rem;
}
.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
}
.cell {
  padding: 6px 8px;
  border-right: 1px solid #eee;
  min-width: 90px;
  text-align: center;
  flex-shrink: 0;
}
.cell.region {
  min-width: 180px;
  text-align: left;
  font-weight: bold;
}
.header {
  background: #f0f4f8;
  font-weight: bold;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
} */
.sales-table {
    font-family: sans-serif;
    font-size: 13px;
    width: 100%;
    overflow-x: auto;
}

.section {
    margin-bottom: 2rem;
}

.table-title {
    font-weight: bold;
    font-size: 16px;
    margin: 12px 0 8px;
}

.table-row {
    display: flex;
    border-bottom: 1px solid #eee;
    width: 100%;
}

.cell {
    padding: 6px 8px;
    text-align: center;
    border-right: 1px solid #eee;
    /* flex: 1 1 0; */
    word-break: break-word;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    /* min-width: 60px; */
}

.cell.region {
    flex: 0 0 200px;
    min-width: 180px;
    max-width: 300px;
    text-align: left;
    font-weight: bold;
}

.header {
    background: #f0f4f8;
    font-weight: bold;
}

.dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
}



.head_week {
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    align-items: center;
}


.head_week>.cont {
    font-weight: bold;
    padding: 4px 8px;
    background: silver;
    display: flex;
}





.head_1 {
    min-width: 133px;
    /* display: flex; */
}

.head_2 {
    display: flex;
    justify-content: space-around;
}
</style>
