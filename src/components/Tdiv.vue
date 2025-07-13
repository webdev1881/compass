<template>
  <div class="sales-table-container table-container">
    <div v-if="loading" class="loading-bar">
      <div style="color: white;" class="loading-progress">_</div>
    </div>
    <div v-else class="content">
      
      <div class="controls-panel" v-if="!loading && !error">
        <div class="sorting-controls">
          <label>Сортировка:</label>
          <select v-model="sortWeek" @change="handleSort" :disabled="isAnimating">
            <option value="all">По всем неделям</option>
            <option v-for="week in weeks" :key="'sort-' + week.id" :value="week.id">
              {{ week.name }}
            </option>
          </select>
          
          <select v-model="sortBy" @change="handleSort" :disabled="isAnimating">
            <option value="regionRank">По рангу регионов</option>
            <option value="regionPercent">Регионы по % выполнения</option>
            <option value="regionCurrent">Регионы по баллам</option>
            <option value="storePercent">Магазины по % выполнения</option>
            <option value="storeCurrent">Магазины по баллам</option>
            {{ isAnimating }}
        </select>

  <!-- <button @click="toggleSortOrder" class="sort-order-btn" :class="{ 'animating': isAnimating }">
    {{ sortOrder === 'asc' ? '↑' : '↓' }}
  </button>

  <button @click="refreshData" class="refresh-btn" :disabled="loading || isAnimating">
    🔄 Обновить
  </button> -->

</div>
        <button @click="refreshData" class="refresh-btn" :disabled="loading || isAnimating">
          Обновить
        </button>
      </div>

      <div v-if="!loading && !error" class="custom-table">
        <div class="table-header" :style="{ gridTemplateColumns: gridTemplateColumns }">
          <div class="header-cell store-name-column c_1">Регион / Магазин</div>
          <div v-for="(week, weekIndex) in weeks" :key="'week1-' + week.id" class="header-cell week-group"
            :style="`grid-column: ${2 + weekIndex * 11} / span 11; grid-row: 1;`">
            {{ week.name }} ({{ week.dateRange }})
          </div>
          <template v-for="(week, weekIndex) in weeks" :key="'week2-' + week.id">
            <div class="header-cell metric-header" :style="`grid-column: ${2 + weekIndex * 11} / span 2; grid-row: 2;`">
              Загальний бал
            </div>
            <div class="header-cell metric-header" :style="`grid-column: ${4 + weekIndex * 11} / span 4; grid-row: 2;`">
              <div class="vtrg">Виторг<span class="togler">
                  <svg @click="toggleWeekColumns(week.id)" v-if="!showPlanFactColumns[week.id]" viewBox="0 0 32 32"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#555555" stroke="#555555">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <title>plus-square</title>
                      <desc>Created with Sketch Beta.</desc>
                      <defs> </defs>
                      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
                        sketch:type="MSPage">
                        <g id="Icon-Set-Filled" sketch:type="MSLayerGroup"
                          transform="translate(-102.000000, -1037.000000)" fill="#1976d2">
                          <path
                            d="M124,1054 L119,1054 L119,1059 C119,1059.55 118.552,1060 118,1060 C117.448,1060 117,1059.55 117,1059 L117,1054 L112,1054 C111.448,1054 111,1053.55 111,1053 C111,1052.45 111.448,1052 112,1052 L117,1052 L117,1047 C117,1046.45 117.448,1046 118,1046 C118.552,1046 119,1046.45 119,1047 L119,1052 L124,1052 C124.552,1052 125,1052.45 125,1053 C125,1053.55 124.552,1054 124,1054 L124,1054 Z M130,1037 L106,1037 C103.791,1037 102,1038.79 102,1041 L102,1065 C102,1067.21 103.791,1069 106,1069 L130,1069 C132.209,1069 134,1067.21 134,1065 L134,1041 C134,1038.79 132.209,1037 130,1037 L130,1037 Z"
                            id="plus-square" sketch:type="MSShapeGroup"> </path>
                        </g>
                      </g>
                    </g>
                  </svg>
                  <svg @click="toggleWeekColumns(week.id)" v-if="showPlanFactColumns[week.id]" viewBox="0 0 32 32"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <title>minus-square</title>
                      <desc>Created with Sketch Beta.</desc>
                      <defs> </defs>
                      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
                        sketch:type="MSPage">
                        <g id="Icon-Set-Filled" sketch:type="MSLayerGroup"
                          transform="translate(-154.000000, -1037.000000)" fill="#1976d2">
                          <path
                            d="M176,1054 L164,1054 C163.448,1054 163,1053.55 163,1053 C163,1052.45 163.448,1052 164,1052 L176,1052 C176.552,1052 177,1052.45 177,1053 C177,1053.55 176.552,1054 176,1054 L176,1054 Z M182,1037 L158,1037 C155.791,1037 154,1038.79 154,1041 L154,1065 C154,1067.21 155.791,1069 158,1069 L182,1069 C184.209,1069 186,1067.21 186,1065 L186,1041 C186,1038.79 184.209,1037 182,1037 L182,1037 Z"
                            id="minus-square" sketch:type="MSShapeGroup"> </path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            <div class="header-cell metric-header c_8" :style="`grid-column: ${8 + weekIndex * 11}; grid-row: 2 / 4;`">
              Втрати<br>Списання
            </div>
            <div class="header-cell metric-header c_9" :style="`grid-column: ${9 + weekIndex * 11}; grid-row: 2 / 4;`">
              Недостачі
            </div>
            <div class="header-cell metric-header c_10"
              :style="`grid-column: ${10 + weekIndex * 11}; grid-row: 2 / 4;`">
              ФОП
            </div>
            <div class="header-cell metric-header c_11"
              :style="`grid-column: ${11 + weekIndex * 11}; grid-row: 2 / 4;`">
              Від'ємні<br>залишки
            </div>
            <div class="header-cell metric-header c_12"
              :style="`grid-column: ${12 + weekIndex * 11}; grid-row: 2 / 4;`">
              Не проведені<br>списання
            </div>
          </template>

          <template v-for="(week, weekIndex) in weeks" :key="'week3-' + week.id">
            <div class="header-cell sub-header score-max c_2"
              :style="`grid-column: ${2 + weekIndex * 11}; grid-row: 3;`">
              РАНГ
            </div>
            <div class="header-cell sub-header c_3" :style="`grid-column: ${3 + weekIndex * 11}; grid-row: 3;`">
              900
            </div>
            <div class="header-cell sub-header score-current c_4"
              :style="`grid-column: ${4 + weekIndex * 11}; grid-row: 3;`">
              100
            </div>
            <div :class="`header-cell c_5 sub-header plan-column grid-col-${5 + weekIndex * 11}`"
              :style="`grid-column: ${5 + weekIndex * 11}; grid-row: 3;`">
              План
            </div>
            <div :class="`header-cell c_6 sub-header fact-column grid-col-${6 + weekIndex * 11}`"
              :style="`grid-column: ${6 + weekIndex * 11}; grid-row: 3;`">
              Факт
            </div>
            <div class="header-cell sub-header c_7" :style="`grid-column: ${7 + weekIndex * 11}; grid-row: 3;`">
              %
            </div>
          </template>
        </div>

        <div class="table-body regions-body">
          <transition-group name="table-row" tag="div" class="transition-wrapper">
            <div v-for="region in sortedRegions" :key="`region-${region.id}`" class="data-row region-row"
              :style="{ gridTemplateColumns: gridTemplateColumns }">

              <div class="data-cell region-name c_1">
                <div class="region-info">
                  <span class="region-indicator" :style="{ backgroundColor: region.color }"></span>
                  <span class="region-title">{{ region.name }}</span>
                </div>
              </div>

              <template v-for="(week, weekIndex) in weeks" :key="week.id">
                <div class="data-cell region-rank score-max c_2"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'rank')}`">
                  {{ getRegionRank(region, weekIndex) }}
                </div>
                <div class="data-cell c_3" :style="`grid-column: ${getGridColumn(weekIndex, 'scoreMax')}`">
                  {{ '-' }}
                </div>
                <div class="data-cell score-current c_4" :class="getScoreClass(getRegionCurrent(region, weekIndex))"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'scoreCurrent')}`">
                    {{ getRegionCurrent(region, weekIndex) }}
                </div>
                <div :class="`data-cell plan c_5 grid-col-${getGridColumn(weekIndex, 'plan')}`"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'plan')}`">
                  {{ formatNumber(getRegionWeekData(region, week.id).plan) }}
                </div>
                <div :class="`data-cell fact c_6 grid-col-${getGridColumn(weekIndex, 'fact')}`"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'fact')}`">
                  {{ formatNumber(getRegionWeekData(region, week.id).fact) }}
                </div>
                <div class="data-cell percent c_7" :class="getPercentClass(getRegionWeekData(region, week.id).percent)"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'percent')}`">
                  {{ getRegionWeekData(region, week.id).percent }}%
                </div>
                <div class="data-cell losses c_8" :style="`grid-column: ${getGridColumn(weekIndex, 'losses')}`">
                  {{ formatNumber(getRegionWeekData(region, week.id).losses) }}
                </div>
                <div class="data-cell shortages c_9" :style="`grid-column: ${getGridColumn(weekIndex, 'shortages')}`">
                  {{ formatNumber(getRegionWeekData(region, week.id).shortages) }}
                </div>
                <div class="data-cell fop c_10" :style="`grid-column: ${getGridColumn(weekIndex, 'fop')}`">
                  {{ formatNumber(getRegionWeekData(region, week.id).fop) }}
                </div>
                <div class="data-cell shift c_11" :style="`grid-column: ${getGridColumn(weekIndex, 'shift')}`">
                  <span v-if="getRegionWeekData(region, week.id).shiftRemainder" class="status-value negative">
                    {{ getRegionWeekData(region, week.id).shiftRemainder }}
                  </span>
                  <span v-else class="status-value">-</span>
                </div>
                <div class="data-cell unprocessed c_12"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'unprocessed')}`">
                  <span v-if="getRegionWeekData(region, week.id).unprocessed" class="status-value negative">
                    {{ getRegionWeekData(region, week.id).unprocessed }}
                  </span>
                  <span v-else class="status-value">-</span>
                </div>
              </template>
            </div>
          </transition-group>
          <div class="table-separator"></div>
        </div>

        <!-- Разделитель -->
        
        <div class="table-body stores-body">
          <transition-group name="table-row" tag="div" class="transition-wrapper">
            <div v-for="(store, storeIndex) in getAllSortedStores()" :key="`store-${store.id}`" class="data-row store-row"
              :style="{ gridTemplateColumns: gridTemplateColumns }">
              <div class="data-cell store-name c_1">
                <div class="store-info">
                  <span class="region-indicator" :style="{ backgroundColor: store.regionColor }"></span>
                  
                  <span class="store-title">{{ store.name }}</span>
                  
                </div>
              </div>
              
              <template v-for="(week, weekIndex) in weeks" :key="week.id">
                <div class="data-cell store-rank score-max c_2"
                :style="`grid-column: ${getGridColumn(weekIndex, 'rank')}`">
                  {{ storeIndex+1 }}
                </div>
                <div class="data-cell c_3" :style="`grid-column: ${getGridColumn(weekIndex, 'scoreMax')}`">
                  {{ "-" }}
                </div>
                <div class="data-cell score-current c_4"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'scoreCurrent')}`">
                  {{ calculateCurrentScores(week.id)?.scores[store?.id] }}
                  <!-- {{ store.id  }} -->
                </div>
                <div :class="`data-cell plan c_5 grid-col-${getGridColumn(weekIndex, 'plan')}`"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'plan')}`">
                  {{ formatNumber(getStoreWeekData(store, week.id).plan) }}
                </div>
                <div :class="`data-cell fact c_6 grid-col-${getGridColumn(weekIndex, 'fact')}`"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'fact')}`">
                  {{ formatNumber(getStoreWeekData(store, week.id).fact) }}
                </div>
                <div class="data-cell percent c_7" :class="getPercentClass(getStoreWeekData(store, week.id).percent)"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'percent')}`">
                  {{ getStoreWeekData(store, week.id).percent }}%
                </div>
                <div class="data-cell losses c_8" :style="`grid-column: ${getGridColumn(weekIndex, 'losses')}`">
                  {{ formatNumber(getStoreWeekData(store, week.id).losses) }}
                </div>
                <div class="data-cell shortages c_9" :style="`grid-column: ${getGridColumn(weekIndex, 'shortages')}`">
                  {{ formatNumber(getStoreWeekData(store, week.id).shortages) }}
                </div>
                <div class="data-cell fop c_10" :style="`grid-column: ${getGridColumn(weekIndex, 'fop')}`">
                  {{ formatNumber(getStoreWeekData(store, week.id).fop) }}
                </div>
                <div class="data-cell shift c_11" :style="`grid-column: ${getGridColumn(weekIndex, 'shift')}`">
                  <span v-if="getStoreWeekData(store, week.id).shiftRemainder" class="status-value negative">
                    {{ getStoreWeekData(store, week.id).shiftRemainder }}
                  </span>
                  <span v-else class="status-value">-</span>
                </div>
                <div class="data-cell unprocessed c_12"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'unprocessed')}`">
                  <span v-if="getStoreWeekData(store, week.id).unprocessed" class="status-value negative">
                    {{ getStoreWeekData(store, week.id).unprocessed }}
                  </span>
                  <span v-else class="status-value">-</span>
                </div>
              </template>
            </div>
          </transition-group>
        </div>
      </div>

      <div v-else-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки данных</h3>
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">Попробовать снова</button>
      </div>
    </div>


  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SalesTable',
  setup() {
    const loading = ref(true)
    const error = ref(null)
    const salesData = ref(null)
    const sortBy = ref('regionPercent')
    const sortOrder = ref('asc')
    const isAnimating = ref(false)
    const showPlanFactColumns = ref({})
    const weeklyScoresCache = ref({})
    const sortWeek = ref('all')

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        // const response = await fetch('/data.json')
        const response = await fetch('/sales-data.json')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.weeks || !data.regions) {
          throw new Error('Неверная структура данных')
        }

        salesData.value = data

        // updateGridColumns()

        data.weeks.forEach(week => {
          showPlanFactColumns.value[week.id] = true
        })

      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = err.message || 'Ошибка загрузки данных'
      } finally {
        loading.value = false
      }
    }

    const weeks = computed(() => salesData.value?.weeks || [])
    const regions = computed(() => Object.values(salesData.value?.regions) || [])

    const totalColumns = weeks.value.length * 11

    const gridTemplateColumns = computed(() => {
      // return `256px repeat(${totalColumns}, 1fr)`
    })

    const getGridColumn = (weekIndex, columnType) => {
      const baseColumn = 2 + weekIndex * 11
      const columnOffsets = {
        'rank': 0,
        'scoreMax': 1,
        'scoreCurrent': 2,
        'plan': 3,
        'fact': 4,
        'percent': 5,
        'losses': 6,
        'shortages': 7,
        'fop': 8,
        'shift': 9,
        'unprocessed': 10
      }
      return baseColumn + columnOffsets[columnType]
    }

    const getRegionWeekData = (region, weekId) => {
      const stores = region.stores || []

      const weekData = {
        plan: 0,
        fact: 0,
        losses: 0,
        shortages: 0,
        fop: 0,
        shiftRemainder: 0,
        unprocessed: 0,
        max: 0,
      }

      stores.forEach(store => {
        const storeWeekData = store.weeklyData?.find(w => w.weekId === weekId)
        if (storeWeekData) {
          weekData.plan += storeWeekData.plan || 0
          weekData.fact += storeWeekData.fact || 0
          weekData.losses += storeWeekData.losses || 0
          weekData.shortages += storeWeekData.shortages || 0
          weekData.fop += storeWeekData.fop || 0
          weekData.shiftRemainder += storeWeekData.shiftRemainder || 0
          weekData.unprocessed += storeWeekData.unprocessed || 0
        }
      })

      weekData.percent = weekData.plan > 0 ? Math.round((weekData.fact / weekData.plan) * 100) : 0


      return weekData
    }

    const getRegionTotalScore = (region) => {
      const stores = region.stores || []
      let maxScore = 0
      let currentScore = 0

      stores.forEach(store => {
        if (store.totalScore) {
          maxScore += store.totalScore.max || 0
          currentScore += store.totalScore.current || 0
        }
      })

      return { max: maxScore, current: currentScore }
    }

    const getRegionRank = (region, weekIndex) => {
      const allRegions = [...regions.value]
      allRegions.sort((a, b) => {
        const aPercent = getTotalPercentForRegion(a)
        const bPercent = getTotalPercentForRegion(b)
        return bPercent - aPercent
      })
      return allRegions.findIndex(r => r.id === region.id) + 1
    }
    const getStoreRank = (store, weekIndex) => {
      const allStores = [...store.value]
      allStores.sort((a, b) => {
        const aPercent = getTotalPercentForStore(a)
        const bPercent = getTotalPercentForStore(b)
        return bPercent - aPercent
      })
      return allStores.findIndex(r => r.id === region.id) + 1
    }

    const getTotalPlanForRegion = (region) => {
      let totalPlan = 0
      const stores = region.stores || []

      stores.forEach(store => {
        if (store.weeklyData) {
          store.weeklyData.forEach(week => {
            totalPlan += week.plan || 0
          })
        }
      })

      return totalPlan
    }


    const getTotalFactForRegion = (region) => {
      let totalFact = 0
      const stores = region.stores || []
      stores.forEach(store => {
        if (store.weeklyData) {
          store.weeklyData.forEach(week => {
            totalFact += week.fact || 0
          })
        }
      })
      return totalFact
    }

    // Получение текущих баллов региона за конкретную неделю или за все недели
    const getRegionCurrent = (region, weekId = null) => {
      const stores = region.stores || []
      let totalCurrent = 0
      
      if (weekId && weekId !== 'all') {
        // Для конкретной недели
        if (!weeklyScoresCache.value[weekId]) {
          weeklyScoresCache.value[weekId] = calculateCurrentScores(weekId)
        }
        
        stores.forEach(store => {
          totalCurrent += weeklyScoresCache.value[weekId].scores[store.id] || 0
          // console.log('getRegionCurrent', weeklyScoresCache.value[weekId].scores[store.id] );
          // console.log('getRegionCurrent', store );
          // debugger
        })
      } else {
        // Для всех недель
        weeks.value.forEach(week => {
          if (!weeklyScoresCache.value[week.id]) {
            weeklyScoresCache.value[week.id] = calculateCurrentScores(week.id)
          }
          
          stores.forEach(store => {
            totalCurrent += weeklyScoresCache.value[week.id].scores[store.id] || 0
          })
        })
      }
      
      return totalCurrent
    }


    const getTotalPercentForRegion = (region) => {
      const totalPlan = getTotalPlanForRegion(region)
      const totalFact = getTotalFactForRegion(region)
      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    }

    // Получение процента выполнения региона за конкретную неделю или за все недели
    const getRegionPercent = (region, weekId = null) => {
      if (weekId && weekId !== 'all') {
        const weekData = getRegionWeekData(region, weekId)
        return calculatePercent(weekData.plan, weekData.fact)
      }
      // Для всех недель
      const totalPlan = getTotalPlanForRegion(region)
      const totalFact = getTotalFactForRegion(region)
      return calculatePercent(totalPlan, totalFact)
    }

    // Обновленная функция сортировки регионов
    const sortedRegions = computed(() => {
      if (!regions.value) return []

      const sorted = [...regions.value]

      sorted.sort((a, b) => {
        let aValue, bValue

        switch (sortBy.value) {
          case 'regionRank':
            aValue = getRegionRank(a)
            bValue = getRegionRank(b)
            break
          case 'regionPercent':
            aValue = getRegionPercent(a, sortWeek.value)
            bValue = getRegionPercent(b, sortWeek.value)
            break
          case 'regionCurrent':
            aValue = getRegionCurrent(a, sortWeek.value)
            bValue = getRegionCurrent(b, sortWeek.value)
            break
          default:
            return 0
        }

        return sortOrder.value === 'asc' ? bValue - aValue : aValue - bValue
      })

      return sorted
    })


    const getStoreWeekData = (store, weekId) => {
      if (!store || !store.weeklyData) {
        return { plan: 0, fact: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
      }

      const weekData = store.weeklyData.find(w => w.weekId === weekId)
      weekData.percent = weekData.plan > 0 ? Math.round((weekData.fact / weekData.plan) * 100) : 0
      return weekData || { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
    }

    const calculatePercent = (plan, fact) => {
      if (!plan || plan === 0) return 0
      return Math.round((fact / plan) * 100)
    }

    const calculateCurrentScores = (weekId) => {
      const allStores = []
      const allRegions = {}

      // Собираем все магазины с их процентами
      regions.value.forEach(region => {
        region.stores?.forEach(store => {
          const weekData = store.weeklyData?.find(w => w.weekId === weekId)
          if (weekData) {
            const percent = calculatePercent(weekData.plan, weekData.fact)
            allStores.push({
              storeId: store.id,
              percent: percent,
              region_id: region.id,
            })
          }
        })
      })

      const maxPercent = Math.max(...allStores.map(s => s.percent), 0)
      // const maxR = Math.max(allRegions.map(s => s.fact/s.plan ), 0)
      // debugger


      const scores = {}
      allStores.forEach(store => {
        if (maxPercent > 0) {
          scores[store.storeId] = Math.round((store.percent / maxPercent) * 100)
        } else {
          scores[store.storeId] = 0
        }
      })

      return { scores, allRegions }
    }


    const getStoreCurrent = (store, weekId) => {
      if (!weekId || weekId === 'all') {
        // Для всех недель суммируем баллы
        let totalCurrent = 0
        weeks.value.forEach(week => {
          if (!weeklyScoresCache.value[week.id]) {
            weeklyScoresCache.value[week.id] = calculateCurrentScores(week.id)
          }
          totalCurrent += weeklyScoresCache.value[week.id][store.id] || 0
        })
        return totalCurrent
      }
      
      // Для конкретной недели
      if (!weeklyScoresCache.value[weekId]) {
        weeklyScoresCache.value[weekId] = calculateCurrentScores(weekId)
      }
      return weeklyScoresCache.value[weekId][store.id] || 0
    }


    const getTotalPercentForStore = (store) => {
      if (!store || !store.weeklyData) return 0

      let totalPlan = 0
      let totalFact = 0

      store.weeklyData.forEach(week => {
        totalPlan += week.plan || 0
        totalFact += week.fact || 0
      })

      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    }

    // Получение процента выполнения магазина за конкретную неделю или за все недели
    const getStorePercent = (store, weekId = null) => {
      if (weekId && weekId !== 'all') {
        const weekData = store.weeklyData?.find(w => w.weekId === weekId)
        if (!weekData) return 0
        return calculatePercent(weekData.plan, weekData.fact)
      }
      
      // Для всех недель
      return getTotalPercentForStore(store)
    }

    // Обновленная функция getAllSortedStores
    const getAllSortedStores = () => {
      const allStores = []

      regions.value.forEach(region => {
        const stores = region.stores || []
        stores.forEach(store => {
          allStores.push({
            ...store,
            regionName: region.name,
            regionColor: region.color,
          })
        })
      })

      // Сортировка магазинов
      allStores.sort((a, b) => {
        let aValue, bValue

        switch (sortBy.value) {
          case 'storePercent':
            aValue = getStorePercent(a, sortWeek.value)
            bValue = getStorePercent(b, sortWeek.value)
            break
          case 'storeCurrent':
            aValue = getStoreCurrent(a, sortWeek.value)
            bValue = getStoreCurrent(b, sortWeek.value)
            break
          default:
            // По умолчанию сортируем по рангу
            return (a.current || 0) - (b.current || 0)
        }

        return sortOrder.value === 'asc' ? bValue - aValue : aValue - bValue
      })

      return allStores
    }

    const updateGridColumns = () => {
      const header = document.querySelector('.table-header')
      const rows = document.querySelectorAll('.data-row')

      let columns = '220px'

      weeks.value.forEach(week => {
        const isShown = showPlanFactColumns.value[week.id]
        if (isShown) {
          columns += '44px 45px 47px 90px 90px 58px 70px 70px 70px 70px 80px'
        } else {
          // columns += ' 0 0 0 0 0 0 0 0 0 0 0'
          columns += '44px 45px 47px 0px 0px 58px 70px 70px 70px 70px 80px'
        }
      })

      if (header) {
        header.style.transition = 'grid-template-columns 0.2s ease-out'
        // header.style.gridTemplateColumns = column
      }

      rows.forEach(row => {
        row.style.transition = 'grid-template-columns 0.2s ease-out'
        row.style.gridTemplateColumns = columns
      })
    }

    const toggleWeekColumns = (weekId) => {
      const weekIndex = weeks.value.findIndex(w => w.id === weekId)
      const planColumnIndex = 5 + weekIndex * 11
      const factColumnIndex = 6 + weekIndex * 11

      const planColumns = document.querySelectorAll(`.grid-col-${planColumnIndex}`)
      const factColumns = document.querySelectorAll(`.grid-col-${factColumnIndex}`)

      const isCurrentlyShown = showPlanFactColumns.value[weekId] !== false

      if (isCurrentlyShown) {

        planColumns.forEach(col => {
          col.style.transition = 'all 0.3s ease-out'
          col.style.maxWidth = '0'
          col.style.opacity = '0'
          col.style.overflow = 'hidden'
          col.style.padding = '0 0'
          col.style.borderRightWidth = '0'
          col.style.minWidth = '0'
        })

        factColumns.forEach(col => {
          col.style.transition = 'all 0.3s ease-out'
          col.style.maxWidth = '0'
          col.style.opacity = '0'
          col.style.overflow = 'hidden'
          col.style.padding = '0 0'
          col.style.borderRightWidth = '0'
          col.style.minWidth = '0'
        })

        setTimeout(() => {
          showPlanFactColumns.value[weekId] = false
          updateGridColumns()
        }, 300)
      } else {
        showPlanFactColumns.value[weekId] = true
        updateGridColumns()

        setTimeout(() => {
          planColumns.forEach(col => {
            col.style.transition = 'all 0.3s ease-out'
            col.style.maxWidth = '100px'
            col.style.opacity = '1'
            col.style.overflow = ''
            col.style.padding = ''
            col.style.borderRightWidth = ''
            col.style.minWidth = ''
          })

          factColumns.forEach(col => {
            col.style.transition = 'all 0.3s ease-out'
            col.style.maxWidth = '90px'
            col.style.opacity = '1'
            col.style.overflow = ''
            col.style.padding = ''
            col.style.borderRightWidth = ''
            col.style.minWidth = ''
          })
        }, 10)
      }
    }

    const formatNumber = (number) => {
      if (number === null || number === undefined || isNaN(number)) {
        return '0'
      }
      return new Intl.NumberFormat('ru-RU').format(number)
    }

    const getPercentClass = (percent) => {
      if (percent === null || percent === undefined || isNaN(percent)) {
        return 'danger'
      }
      if (percent >= 70) return 'success'
      if (percent >= 50) return 'warning'
      return 'danger'
    }

    const getScoreClass = (score) => {
      if (score === null || score === undefined || isNaN(score)) {
        return 'danger'
      }
      if (score >= 90) return 'success'
      if (score >= 70) return 'warning'
      return 'danger'
    }

    const handleSort = () => {
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    const toggleSortOrder = () => {
      isAnimating.value = true
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      setTimeout(() => {
        isAnimating.value = false
      }, 500)
    }

    const refreshData = async () => {
      await loadData()
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      error,
      weeks,
      regions,
      sortedRegions,
      sortBy,
      sortOrder,
      isAnimating,
      showPlanFactColumns,
      gridTemplateColumns,
      sortWeek,
      getRegionCurrent,
      updateGridColumns,
      calculateCurrentScores,
      getGridColumn,
      getRegionWeekData,
      getRegionTotalScore,
      getRegionRank,
      getStoreWeekData,
      getAllSortedStores,
      toggleWeekColumns,
      formatNumber,
      getPercentClass,
      getScoreClass,
      handleSort,
      toggleSortOrder,
      refreshData,
      loadData
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #2196f3;
$success-color: #2e7d32;
$warning-color: #f57c00;
$danger-color: #d32f2f;
$light-success: #28a745;
$light-warning: #ffebee;
$light-danger: #c62828;

$border-color: #e0e0e0;
$border-light: #dee2e6;
$background-light: #f5f5f5;
$background-white: white;
$background-hover: #fafafa;
$background-week: #e3f2fd;
$background-negative: #ffebee;
$header-background: #f5f5f5;

$text-primary: #333;
$text-secondary: #555;
$text-week: #0f4478;
$text-disabled: #6c757d;
$separator-week: #0f4478;

$border-week: #91b6db;
$border-radius: 4px;
$border-radius-lg: 8px;
$font-size-sm: 11px;
$font-size-base: 12px;
$font-size-lg: 16px;
$padding-sm: 6px 8px;
$padding-base: 8px 12px;
$padding-lg: 15px 20px;

.sales-table-container {
  width: 100%;
  min-height: 100vh;
  max-width: 2300px;
  // max-width: 1966px;
  background: $background-white;
}

.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e0e0e0;
  z-index: 1000;
}

.loading-progress {
  height: 100%;
  background: #2196f3;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    width: 0%;
  }

  50% {
    width: 70%;
  }

  100% {
    width: 100%;
  }
}

.content {
  padding: 20px;
  animation: fadeIn .5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// .controls-panel {
//   padding: 20px;
//   background: white;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//   display: flex;
//   flex-direction: column;
//   gap: 15px;
// }
.controls-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sorting-controls label {
  font-weight: 600;
  color: #555;
}

.sorting-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  /* font-size: 14px; */
}

.sort-order-btn,
.refresh-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  /* font-size: 14px; */
  font-weight: 600;
  transition: background-color 0.3s;
}

.sort-order-btn {
  background: #007bff;
  color: white;
}

.sort-order-btn:hover {
  background: #0056b3;
}

.refresh-btn {
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
}

.refresh-btn:hover:not(:disabled) {
  background: #218838;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-toggles {
  display: flex;
  gap: 20px;
  margin-left: 20px;
}

.week-toggle-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-label {
  font-weight: 500;
  color: #606266;
}

.toggle-columns-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-columns-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.toggle-columns-btn.is-hidden {
  opacity: 0.7;
}

.sort-order-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.sort-order-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.refresh-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  // background: white;
  font-size: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Основная структура таблицы */
.custom-table {
  background: white;
  margin: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  scrollbar-color: #1976d2 #e3f2fd;
}

/* Заголовки таблицы */
.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  display: grid;
  grid-template-rows: auto auto auto;
}

.header-cell {
  padding: 8px 0;
  text-align: center;
  font-weight: 600;
  color: #333;
  border-right: 1px solid $border-week;
  border-bottom: 1px solid $border-week;
  // border-top: 1px solid $border-week;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.store-name-column {
  grid-row: 1 / 4;
  grid-column: 1;
}

.week-group {
  background: #e3f2fd;
  color: $text-week;
  font-size: 17px;
  font-weight: 600;
}

.metric-header {
  background: $background-week;
  font-size: 12px;
}

.sub-header {
  background: $background-week;
  font-size: 12px;
  font-weight: 500;
}

.score-max {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Тело таблицы */
.table-body {
  // min-height: 100px;
}

.data-row {
  display: grid;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.data-row:hover {
  background: #fafafa;
}

.region-row {
  background: #f8f9fa;
  font-weight: 600;
}

.data-cell {
  padding: 6px 8px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* Стили для различных типов ячеек */
.region-name,
.store-name {
  justify-content: flex-start;
  padding-left: 16px;
}

.region-info,
.store-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.region-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.region-title {
  font-weight: 600;
  color: #303133;
}

.store-rank-number {
  font-weight: 600;
  color: #666;
  min-width: 20px;
}

.store-title {
  color: #333;
}

.plan,
.fact,
.losses,
.shortages,
.fop {
  text-align: right;
  justify-content: flex-end;
  font-family: monospace;
}

.percent {
  font-weight: 600;
}

.score-current {
  font-weight: 600;
}


.success {
  color: #2e7d32;
}

.warning {
  color: #f57c00;
}

.danger {
  color: #d32f2f;
}

.status-value {

  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
}

.status-value.negative {
  background: #ffebee;
  color: #c62828;
}

.table-separator {
  height: 10px;
  background: #e3f2fd;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #66b1ff;
}

/* Анимации для transition-group */
.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.5s ease;
}

.table-row-enter-from,
.table-row-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.table-row-move {
  transition: transform 0.5s ease;
}

.regions-body {
  display: grid;
  grid-template-columns: repeat(1fr, 1fr);
  grid-template-rows: auto auto auto;
}



.c_1 {
  min-width: 220px;
}




.c_2 {
  min-width: 44px;
}

.c_3 {
  min-width: 45px;
}

.c_4 {
  min-width: 47px;
}

.c_5 {
  min-width: 90px;
}

.c_6 {
  min-width: 90px;
}

.c_7 {
  min-width: 58px;
}

.c_8 {
  min-width: 70px;
}

.c_9 {
  min-width: 70px;
}

.c_10 {
  min-width: 70px;
}

.c_11 {
  min-width: 70px;
}

.c_12 {
  min-width: 80px;
}

// .c_13 {
//   min-width: 76px;
// }


.grid-col-5,
.grid-col-6,
.grid-col-16,
.grid-col-17 {
  transition: all 0.3s ease-out;
  overflow: hidden;
  white-space: nowrap;
}

.data-cell {
  transition: all 0.3s ease-out;
}

.vtrg {
  position: relative;
  display: flex;
  align-items: center;
}

.togler {
  position: absolute;
  border-radius: 2px;
  right: -20px;
  top: 2px;
  margin-left: 5px;
  font-size: 10px;
  width: 13px;
  height: 13px;
  color: white;

  background-color: white;
}

.region-row,
.store-row {
  transition: all .3s ease;
  transform-origin: center;
}

.region-row:hover,
.store-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 8px rgba(2, 52, 122, 0.5);
  z-index: 10;
  position: relative;
}

.unprocessed {
  border-right: 1px solid $border-week;
}
</style>