<template>
  <div class="sales-table-container table-container">

    <div class="controls-panel">
      <div class="sorting-controls">
        <label>Сортировка:</label>
        <select v-model="sortBy" @change="handleSort" :disabled="isAnimating">
          <option value="regionRank">По рангу регионов</option>
          <option value="regionTotalPercent">Регионы по % выполнения</option>
          <option value="storePercent">Магазины по % выполнения</option>
        </select>

        <button @click="toggleSortOrder" class="sort-order-btn" :class="{ 'animating': isAnimating }">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>

        <button @click="refreshData" class="refresh-btn" :disabled="loading || isAnimating">
          🔄 Обновить
        </button>
      </div>
    
    </div>

    <div class="" v-if="!loading && !error">

      <table class="custom-table">
        <thead>
          <tr>
            <th style="width: 230px;" rowspan="3" class="store-name-column">Регион / Магазин</th>
            <th v-for="week in weeks" :key="week.id" :colspan="11" class="week-group">
              <tr>

                {{ week.name }}  ({{ week.dateRange }})
              </tr>
            </th>
          </tr>
          <tr>
            <template v-for="week in weeks" :key="week.id">
              <th colspan="2" class="metric-header">Загальний бал</th>
              <th colspan="4" class="metric-header">Виторг</th>
              <th rowspan="2" class="metric-header">Втрати<br>Списання</th>
              <th rowspan="2" class="metric-header">Недостачі</th>
              <th rowspan="2" class="metric-header">ФОП</th>
              <th rowspan="2" class="metric-header">Від'єміні<br>залишки</th>
              <th rowspan="2" class="metric-header">Не проведені<br>списання</th>
            </template>
          </tr>
          <tr>
            <template v-for="week in weeks" :key="week.id">
              <th rowspan="3" class="store-rank-column">РАНГ</th>
              <th rowspan="3" class="score-max">900</th>
              <th rowspan="3" class="score-current">100</th>
              <th class="plan-column">План</th>
              <th class="fact-column">Факт</th>
              <th class="percent-column">%</th>
            </template>
          </tr>
        </thead>

        <tbody name="table-row" is="transition-group" tag="tbody" class="total_tbody">
          <transition-group appear>
            <tr v-for="region in sortedRegions" :key="`region-${region.id}`" class="region-row">
              <td class="region-name">
                <div class="region-info">
                  <span class="region-indicator" :style="{ backgroundColor: colors[region.name] }"></span>
                  <span class="region-title">{{ region.name }}</span>
                </div>
              </td>
              <template v-for="week in weeks" :key="week.id">
                <td class="region-rank">{{ region.rank }}</td>
                <td class="score-max">{{ region.totalScore.max }}</td>
                <td class="score-current" :class="getScoreClass(region.totalScore.current)">{{ region.totalScore.current}}</td>
                <td class="plan">{{ formatNumber(getRegionWeekData(region, week.id).plan) }}</td>
                <td class="fact">{{ formatNumber(getRegionWeekData(region, week.id).fact) }}</td>
                <td class="percent" :class="getPercentClass(getRegionWeekData(region, week.id).percent)">{{ getRegionWeekData(region, week.id).percent }}%</td>
                <td class="losses">{{ formatNumber(getRegionWeekData(region, week.id).losses) }}</td>
                <td class="shortages">{{ formatNumber(getRegionWeekData(region, week.id).shortages) }}</td>
                <td class="fop">{{ formatNumber(getRegionWeekData(region, week.id).fop) }}</td>

                <td class="shift">
                  <span v-if="getRegionWeekData(region, week.id).shiftRemainder" class="status-value negative">
                    {{ getRegionWeekData(region, week.id).shiftRemainder }}
                  </span><span v-else class="status-value">-</span>
                </td>

                <td class="unprocessed">
                  <span v-if="getRegionWeekData(region, week.id).unprocessed" class="status-value negative">
                    {{ getRegionWeekData(region, week.id).unprocessed }}
                  </span><span v-else class="status-value">-</span>
                </td>


              </template>
            </tr>
          </transition-group>
        </tbody>
        <br>
        <tbody name="table-row" is="transition-group" tag="tbody" class="total_tbody">

          <transition-group appear>
          <tr v-for="store in getAllSortedStores()" :key="`store-${store.id}`" class="store-row">
            <td class="store-name">
              <div class="store-info">
                <span class="region-indicator" :style="{ backgroundColor: colors[store.regionName] }"></span>
                <span class="store-rank-number">{{ store.rank }}</span>
                <span class="store-title">{{ store.name }}</span>
              </div>
            </td>
            <template v-for="week in weeks" :key="week.id">
              <td class="store-rank">{{ store.rank }}</td>
              <td class="score-max">{{ store.regionScore.max }}</td>
              <td class="score-current" :class="getScoreClass(store.regionScore.current)">{{ store.regionScore.current}}</td>
              <td class="plan">{{ formatNumber(getStoreWeekData(store, week.id).plan) }}</td>
              <td class="fact">{{ formatNumber(getStoreWeekData(store, week.id).fact) }}</td>
              <td class="percent" :class="getPercentClass(getStoreWeekData(store, week.id).percent)">{{ getStoreWeekData(store, week.id).percent }}%</td>
              <td class="losses">{{ formatNumber(getStoreWeekData(store, week.id).losses) }}</td>
              <td class="shortages">{{ formatNumber(getStoreWeekData(store, week.id).shortages) }}</td>
              <td class="fop">{{ formatNumber(getStoreWeekData(store, week.id).fop) }}</td>

              <td class="shift">
                <span v-if="getStoreWeekData(store, week.id).shiftRemainder" class="status-value negative">
                    {{ getStoreWeekData(store, week.id).shiftRemainder }}
                  </span><span v-else class="status-value">-</span>
              </td>

              <td class="unprocessed">
                <span v-if="getStoreWeekData(store, week.id).unprocessed" class="status-value negative">
                {{ getStoreWeekData(store, week.id).unprocessed }}
                </span><span v-else class="status-value">-</span>
              </td>


            </template>
          </tr>
          </transition-group>
        </tbody>
      </table>

      <br>

    </div>

    <!-- Состояние загрузки -->
    <div v-else-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <!-- Состояние ошибки -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <h3>Ошибка загрузки данных</h3>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">Попробовать снова</button>
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
    const sortBy = ref('regionRank')
    const sortOrder = ref('asc')
    const colors = ref({
      'Белая Церковь': '#6f4b4f',
      'Днепр': '#ffc107',
      'Киев': '#28a745',
      'Харьков': '#007bff',
    })


    // Загрузка данных
    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const response = await fetch('/sales-data.json')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Загруженные данные:', data);


        // Валидация данных
        if (!data.weeks || !data.regions) {
          throw new Error('Неверная структура данных')
        } else {
          data.weeks.reverse()
          data.regions.reverse()
        }

        salesData.value = data
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        error.value = err.message || 'Ошибка загрузки данных'
      } finally {
        loading.value = false
      }
    }

    // Вычисляемые свойства
    const weeks = computed(() => salesData.value?.weeks || [])
    const regions = computed(() => salesData.value?.regions || [])

    // Сортировка регионов
    const sortedRegions = computed(() => {
      if (!regions.value) return []

      const sorted = [...regions.value]

      sorted.sort((a, b) => {
        let aValue, bValue

        switch (sortBy.value) {
          case 'regionRank':
            aValue = a.rank
            bValue = b.rank
            break
          case 'regionName':
            aValue = a.name || ''
            bValue = b.name || ''
            break
          case 'regionTotalPlan':
            aValue = getTotalPlanForRegion(a)
            bValue = getTotalPlanForRegion(b)
            break
          case 'regionTotalFact':
            aValue = getTotalFactForRegion(a)
            bValue = getTotalFactForRegion(b)
            break
          case 'regionTotalPercent':
            aValue = getTotalPercentForRegion(a)
            bValue = getTotalPercentForRegion(b)
            break
          default:
            return 0
        }

        if (typeof aValue === 'string') {
          return sortOrder.value === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        } else {
          return sortOrder.value === 'asc'
            ? aValue - bValue
            : bValue - aValue
        }
      })

      return sorted
    })

    // Получение данных региона за конкретную неделю
    const getRegionWeekData = (region, weekId) => {
      if (!region || !region.weeklyData) {
        return { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
      }

      const weekData = region.weeklyData.find(w => w.weekId === weekId)
      return weekData || { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
    }

    // Получение данных магазина за конкретную неделю
    const getStoreWeekData = (store, weekId) => {
      if (!store || !store.weeklyData) {
        return { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
      }

      const weekData = store.weeklyData.find(w => w.weekId === weekId)
      return weekData || { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
    }

    // Получение общего плана для региона (сумма по всем неделям)
    const getTotalPlanForRegion = (region) => {
      if (!region || !region.weeklyData) return 0
      return region.weeklyData.reduce((sum, week) => sum + (week.plan || 0), 0)
    }

    // Получение общего факта для региона (сумма по всем неделям)
    const getTotalFactForRegion = (region) => {
      if (!region || !region.weeklyData) return 0
      return region.weeklyData.reduce((sum, week) => sum + (week.fact || 0), 0)
    }

    // Получение общего процента для региона
    const getTotalPercentForRegion = (region) => {
      const totalPlan = getTotalPlanForRegion(region)
      const totalFact = getTotalFactForRegion(region)
      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    }

    // Получение всех магазинов без группировки по регионам
    const getAllSortedStores = () => {
      const allStores = []

      regions.value.forEach(region => {
        const stores = region.stores || []
        stores.forEach(store => {
          allStores.push({
            ...store,
            regionColor: region.color,
            regionScore: region.totalScore,
            regionName: region.name
          })
        })
      })

      // Сортировка всех магазинов
      if (sortBy.value.startsWith('store')) {
        allStores.sort((a, b) => {
          let aValue, bValue

          switch (sortBy.value) {
            case 'storeName':
              aValue = a.name || ''
              bValue = b.name || ''
              break
            case 'storePlan':
              aValue = getTotalPlanForStore(a)
              bValue = getTotalPlanForStore(b)
              break
            case 'storeFact':
              aValue = getTotalFactForStore(a)
              bValue = getTotalFactForStore(b)
              break
            case 'storePercent':
              aValue = getTotalPercentForStore(a)
              bValue = getTotalPercentForStore(b)
              break
            default:
              return 0
          }

          if (typeof aValue === 'string') {
            return sortOrder.value === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue)
          } else {
            return sortOrder.value === 'asc'
              ? aValue - bValue
              : bValue - aValue
          }
        })
      } else {
        // Сортировка по умолчанию по рангу
        allStores.sort((a, b) => (a.rank || 0) - (b.rank || 0))
      }

      return allStores
    }

    // Получение общего плана для магазина
    const getTotalPlanForStore = (store) => {
      if (!store || !store.weeklyData) return 0
      return store.weeklyData.reduce((sum, week) => sum + (week.plan || 0), 0)
    }

    // Получение общего факта для магазина
    const getTotalFactForStore = (store) => {
      if (!store || !store.weeklyData) return 0
      return store.weeklyData.reduce((sum, week) => sum + (week.fact || 0), 0)
    }

    // Получение общего процента для магазина
    const getTotalPercentForStore = (store) => {
      const totalPlan = getTotalPlanForStore(store)
      const totalFact = getTotalFactForStore(store)
      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    }

    // Утилитарные функции
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

    // Состояние анимации
    const isAnimating = ref(false)

    // Обработчики событий
    const handleSort = () => {
      // Добавляем индикацию анимации
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 600) // Длительность анимации
    }

    const toggleSortOrder = () => {
      isAnimating.value = true
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      setTimeout(() => {
        isAnimating.value = false
      }, 600)
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
      colors,
      getRegionWeekData,
      getStoreWeekData,
      getAllSortedStores,
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

<style scoped>


.total_tbody {
  text-align: center;
}


.sales-table-container {
  padding: 20px;
  max-width: 1900px;
  margin: 0 auto;
}

.controls-panel {
  display: flex;
  align-items: center;
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
  background: #28a745;
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

.table-wrapper {
  /* background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden; */
}

.region-table,
.stores-table {
  /* width: 100%; */
  border-collapse: collapse;
  font-size: 11px;
  /* min-width: 1600px; */
}

.sales-table th,
.stores-table th {
  background: #495057;
  color: white;
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #343a40;
  /* font-size: 11px; */
}

.sales-table td,
.stores-table td {
  padding: 6px 4px;
  text-align: center;
  border: 1px solid #ddd;
  /* font-size: 11px; */
}

.name-column,
.store-name-column {
  min-width: 180px;
  text-align: left;
}

.rank-column,
.store-rank-column {
  width: 50px;
}

.score-max-column,
.score-current-column {
  width: 40px;
}

.week-group {
    /* background: #6c757d !important; */
    color: rgb(50, 128, 201)!important;
    font-weight: 700;
    font-size: 20px;
  }

.revenue-group {
  background: #17a2b8 !important;
}

.plan-column,
.fact-column {
  width: 80px;
}

.percent-column {
  width: 50px;
}

.losses-column,
.shortages-column,
.fop-column {
  width: 60px;
}

.shift-column,
.unprocessed-column {
  width: 50px;
}

.region-row {
  background: #f8f9fa;
  font-weight: 600;
}

.region-info,
.store-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.region-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.region-rank-number,
.store-rank-number {
  font-weight: 700;
  color: #495057;
  /* font-size: 11px; */
}

.region-title {
  font-size: 13px;
}

.store-title {
  flex: 1;
  text-align: left;
  font-size: 12px;
}

.stores-section {
  margin-top: 20px;
}

.store-row {
  background: #fafafa;
}

.store-row:nth-child(even) {
  /* background: #f5f5f5; */
}

.store-row:hover {
  background: #e9ecef;
}

.store-name {
  text-align: left;
  padding-left: 15px;
}

.percent.success,
.score-current.success {
  background: #d4edda;
  color: #155724;
  font-weight: 600;
}

.percent.warning,
.score-current.warning {
  background: #fff3cd;
  color: #856404;
  font-weight: 600;
}

.percent.danger,
.score-current.danger {
  background: #f8d7da;
  color: #721c24;
  font-weight: 600;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #dc3545;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  /* font-size: 14px; */
  font-weight: 600;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #0056b3;
}




.table-container {
  /* width: 100%; */
  /* min-height: 100vh; */
  background: #d7e4f0;
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
  animation: fadeIn 0.5s ease-in;
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

.week-title {
  font-size: 20px;
  font-weight: 600;
  color: #1976d2;
  text-align: center;
  margin-bottom: 20px;
}

.table-wrapper {
  /* background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 20px; */
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-table th {
  background: #f8f9fa;
  padding: 8px;
  text-align: center;
  font-weight: 600;
  color: #333;
  border: 1px solid #dee2e6;
}

.section-header {
  background: #f5f5f5;
  font-size: 14px;
}

.metric-header {
  background: #fafafa;
  font-size: 12px;
  font-weight: 500;
  vertical-align: middle;
  min-width: 80px;
}

.sub-header {
  font-size: 12px;
  font-weight: 500;
  background: #fafafa;
}

.score-header {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
}

.custom-table td {
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  vertical-align: middle;
}

.network-summary-row {
  background: #f8f9fa;
  font-weight: 600;
}

.network-separator-row td {
  background: #607d8b;
  color: white;
  font-weight: 600;
  padding: 8px 12px;
  /* text-align: left; */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.store-row:hover {
  background: #fafafa;
}

.network-name,
.store-name {
  /* display: flex; */
  align-items: center;
  gap: 8px;
  width: 20px;
}

.network-title {
  font-weight: 600;
  color: #333;
}

.store-title {
  color: #333;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.indicator-red {
  background: #f44336;
}

.indicator-yellow {
  background: #ffc107;
}

.indicator-green {
  background: #4caf50;
}

.indicator-blue {
  background: #2196f3;
}

.store-number {
  font-weight: 600;
  color: #666;
  min-width: 20px;
}

.rank-cell {
  text-align: center;
  font-weight: 600;
  color: #666;
}

.score-cell {
  padding: 4px !important;
  width: 80px;
}

.score-bar-container {
  position: relative;
  height: 24px;
  background: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
}

.score-value {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: #333;
  z-index: 2;
  /* font-size: 12px; */
}

.score-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
  transition: width 0.3s ease;
}

.revenue-bar {
  background: linear-gradient(90deg, #8bc34a 0%, #cddc39 100%);
}

.number-cell {
  /* text-align: right;
  font-family: monospace;
  font-size: 12px; */
  color: #333;
}

.percent-cell {
  text-align: center;
  font-weight: 600;
  /* font-size: 12px; */
}

.percent-high {
  color: #2e7d32;
}

.percent-medium {
  color: #f57c00;
}

.percent-low {
  color: #d32f2f;
}

.status-cell {
  text-align: center;
}

.status-value {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 2px;
  /* font-size: 11px; */
  font-weight: 600;
}

.status-value.negative {
  background: #ffebee;
  color: #c62828;
}

@media (max-width: 1400px) {
  .table-wrapper {
    overflow-x: auto;
  }

  .custom-table {
    min-width: 1200px;
  }
}









































/* Анимации для сортировки строк */
.table-row-move,
.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.table-row-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.table-row-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.table-row-leave-active {
  position: absolute;
  width: 100%;
}

/* Улучшенные hover эффекты для строк */
.region-row,
.store-row {
  transition: all 0.11s ease;
  transform-origin: center;
}

.region-row:hover,
.store-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  position: relative;
}

/* Анимация для изменения сортировки */
.sorting-controls select {
  transition: all 0.3s ease;
}

.sorting-controls select:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.sorting-controls select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa;
}

.sort-order-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sort-order-btn:active {
  transform: scale(0.95);
}

.sort-order-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.sort-order-btn:active::before {
  width: 100px;
  height: 100px;
}

/* Пульсация при загрузке */
/* .loading-spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }

    100% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  } */

/* Анимация появления таблиц */
/* .table-wrapper {
    animation: slideInUp 0.6s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  } */

/* Плавная анимация цветовых изменений */
/* .percent,
.score-current {
  transition: all 0.4s ease;
}

.region-indicator {
  transition: all 0.3s ease;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
}

.region-row:hover .region-indicator,
.store-row:hover .region-indicator {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
} */

/* Анимация для кнопки обновления */
/* .refresh-btn {
  transition: all 0.3s ease;
  position: relative;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
}

.refresh-btn:disabled {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-2px);
  }

  75% {
    transform: translateX(2px);
  }
}

@media (max-width: 768px) {
  .controls-panel {
    flex-direction: column;
    gap: 15px;
  }

  .sorting-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .sales-table,
  .stores-table {
    font-size: 10px;
  }

  .name-column,
  .store-name-column {
    min-width: 120px;
  }

  .plan-column,
  .fact-column {
    width: 60px;
  }

  .table-row-move {
    transition: all .5s;
  }

  .table-row-item {
    backface-visibility: hidden;
  }
} */
</style>