<template>
  <div class="analytics-container">
    <!-- Лоадер -->
    <div v-if="isLoading" class="loader-bar">
      <div class="loader-progress"></div>
    </div>

    <!-- Контент -->
    <div v-else class="analytics-content">
      <!-- Управление показателями -->
      <div class="controls">
        <h3>Управление показателями:</h3>
        <div class="indicator-controls">
          <label v-for="indicator in availableIndicators" :key="indicator.key" class="indicator-checkbox">
            <input 
              type="checkbox" 
              v-model="visibleIndicators[indicator.key]"
              @change="updateColumnVisibility"
            >
            {{ indicator.name }}
          </label>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-container">
        <div class="table-header">
          <div class="header-region">
            <span>Регион / Магазин</span>
            <button @click="toggleSort('name')" class="sort-btn">
              {{ getSortIcon('name') }}
            </button>
          </div>
          
          <div v-for="week in sortedWeeks" :key="week.id" class="header-week">
            <div class="week-title">
              <h4>{{ week.name }}</h4>
              <span class="week-date">{{ week.dateRange }}</span>
            </div>
            
            <!-- Оборотные показатели -->
            <div class="indicators-group">
              <div class="indicator-header basic-indicators">
                <div class="indicator-column">
                  <span>План</span>
                  <button @click="toggleSort(`plan_${week.id}`)" class="sort-btn">
                    {{ getSortIcon(`plan_${week.id}`) }}
                  </button>
                </div>
                <div class="indicator-column">
                  <span>Факт</span>
                  <button @click="toggleSort(`fact_${week.id}`)" class="sort-btn">
                    {{ getSortIcon(`fact_${week.id}`) }}
                  </button>
                </div>
                <div class="indicator-column">
                  <span>%</span>
                  <button @click="toggleSort(`percent_${week.id}`)" class="sort-btn">
                    {{ getSortIcon(`percent_${week.id}`) }}
                  </button>
                </div>
              </div>
              
              <!-- Дополнительные показатели -->
              <div 
                v-for="indicator in additionalIndicators" 
                :key="indicator.key"
                class="indicator-group additional-indicator"
                :class="{ 'hidden': !visibleIndicators[indicator.key] }"
              >
                <div class="indicator-header-group">
                  <span class="indicator-name">{{ indicator.name }}</span>
                </div>
                <div class="indicator-subheaders">
                  <div class="indicator-subheader">
                    <span>Знач.</span>
                    <button @click="toggleSort(`${indicator.key}_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_${week.id}`) }}
                    </button>
                  </div>
                  <div class="indicator-subheader">
                    <span>%</span>
                    <button @click="toggleSort(`${indicator.key}_percent_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_percent_${week.id}`) }}
                    </button>
                  </div>
                  <div class="indicator-subheader">
                    <span>Балл</span>
                    <button @click="toggleSort(`${indicator.key}_score_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_score_${week.id}`) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Общий балл -->
            <div class="total-score-header">
              <span>Общий балл</span>
              <button @click="toggleSort(`totalScore_${week.id}`)" class="sort-btn">
                {{ getSortIcon(`totalScore_${week.id}`) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Блок итогов по регионам -->
        <div class="regions-summary">
          <div class="summary-header">
            <h3>Итоги по регионам</h3>
          </div>
          
          <div v-for="region in sortedRegions" :key="region.id" class="region-row">
            <div class="region-name">
              <span class="region-indicator" :style="{ backgroundColor: region.color }"></span>
              {{ region.name }}
            </div>
            
            <div v-for="week in sortedWeeks" :key="week.id" class="region-data">
              <div class="indicators-group">
                <div class="basic-indicators">
                  <div class="indicator-value">{{ formatNumber(getRegionSummary(region, week.id).plan) }}</div>
                  <div class="indicator-value">{{ formatNumber(getRegionSummary(region, week.id).fact) }}</div>
                  <div class="indicator-value">{{ formatPercent(getRegionSummary(region, week.id).percent) }}</div>
                </div>
                
                <div 
                  v-for="indicator in additionalIndicators" 
                  :key="indicator.key"
                  class="indicator-group additional-indicator"
                  :class="{ 'hidden': !visibleIndicators[indicator.key] }"
                >
                  <div class="indicator-subvalues">
                    <div class="indicator-value">
                      {{ formatNumber(getRegionSummary(region, week.id)[indicator.key]) }}
                    </div>
                    <div class="indicator-value">
                      {{ formatPercent(getRegionSummary(region, week.id)[indicator.key + '_percent']) }}
                    </div>
                    <div class="indicator-value">
                      {{ formatNumber(getRegionSummary(region, week.id)[indicator.key + '_score']) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="total-score">
                {{ formatNumber(getRegionSummary(region, week.id).totalScore) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Блок магазинов -->
        <div class="stores-section">
          <div class="section-header">
            <h3>Магазины</h3>
          </div>
          
          <!-- Заголовки для магазинов -->
          <div class="stores-header">
            <div class="header-region">
              <span>Магазин</span>
              <button @click="toggleSort('name')" class="sort-btn">
                {{ getSortIcon('name') }}
              </button>
            </div>
            
            <div v-for="week in sortedWeeks" :key="week.id" class="header-week">
              <!-- Оборотные показатели -->
              <div class="indicators-group">
                <div class="indicator-header basic-indicators">
                  <div class="indicator-column">
                    <span>План</span>
                    <button @click="toggleSort(`plan_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`plan_${week.id}`) }}
                    </button>
                  </div>
                  <div class="indicator-column">
                    <span>Факт</span>
                    <button @click="toggleSort(`fact_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`fact_${week.id}`) }}
                    </button>
                  </div>
                  <div class="indicator-column">
                    <span>%</span>
                    <button @click="toggleSort(`percent_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`percent_${week.id}`) }}
                    </button>
                  </div>
                </div>
                
                <!-- Дополнительные показатели -->
                <div 
                  v-for="indicator in additionalIndicators" 
                  :key="indicator.key"
                  class="indicator-group additional-indicator"
                  :class="{ 'hidden': !visibleIndicators[indicator.key] }"
                >
                  <div class="indicator-subheaders">
                    <div class="indicator-subheader">
                      <span>Знач.</span>
                      <button @click="toggleSort(`${indicator.key}_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_${week.id}`) }}
                      </button>
                    </div>
                    <div class="indicator-subheader">
                      <span>%</span>
                      <button @click="toggleSort(`${indicator.key}_percent_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_percent_${week.id}`) }}
                      </button>
                    </div>
                    <div class="indicator-subheader">
                      <span>Балл</span>
                      <button @click="toggleSort(`${indicator.key}_score_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_score_${week.id}`) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Общий балл -->
              <div class="total-score-header">
                <span>Общий балл</span>
                <button @click="toggleSort(`totalScore_${week.id}`)" class="sort-btn">
                  {{ getSortIcon(`totalScore_${week.id}`) }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Данные магазинов -->
          <div class="table-body">
            <div v-for="store in sortedStores" :key="store.id" class="store-row">
              <div class="store-name">
                <span class="store-region" :style="{ backgroundColor: getStoreRegionColor(store) }"></span>
                {{ store.name }}
              </div>
              
              <div v-for="week in sortedWeeks" :key="week.id" class="store-data">
                <div class="indicators-group">
                  <div class="basic-indicators">
                    <div class="indicator-value">{{ formatNumber(getStoreValue(store, week.id, 'plan')) }}</div>
                    <div class="indicator-value">{{ formatNumber(getStoreValue(store, week.id, 'fact')) }}</div>
                    <div class="indicator-value">{{ formatPercent(getStorePercent(store, week.id)) }}</div>
                  </div>
                  
                  <div 
                    v-for="indicator in additionalIndicators" 
                    :key="indicator.key"
                    class="indicator-group additional-indicator"
                    :class="{ 'hidden': !visibleIndicators[indicator.key] }"
                  >
                    <div class="indicator-subvalues">
                      <div class="indicator-value">
                        {{ formatNumber(getStoreValue(store, week.id, indicator.key)) }}
                      </div>
                      <div class="indicator-value">
                        {{ formatPercent(getStoreIndicatorPercent(store, week.id, indicator.key)) }}
                      </div>
                      <div class="indicator-value">
                        {{ formatNumber(getStoreIndicatorScore(store, week.id, indicator.key)) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="total-score">
                  {{ formatNumber(getStoreTotalScore(store, week.id)) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'

export default {
  name: 'AnalyticsTable',
  setup() {
    // Состояние загрузки
    const isLoading = ref(true)
    
    // Данные
    const weeksData = ref([])
    const regionsData = ref({})
    const targetsData = ref({})
    
    // Кеш для итогов по регионам
    const regionSummaryCache = ref({})
    
    // Управление показателями
    const visibleIndicators = reactive({
      losses: true,
      shortages: true,
      fop: true,
      shiftRemainder: true,
      unprocessed: true
    })
    
    // Сортировка
    const sortBy = ref('totalScore_2')
    const sortOrder = ref('desc')
    
    // Доступные показатели
    const availableIndicators = computed(() => [
      { key: 'losses', name: 'Потери' },
      { key: 'shortages', name: 'Недостачи' },
      { key: 'fop', name: 'ФОП' },
      { key: 'shiftRemainder', name: 'Остатки смены' },
      { key: 'unprocessed', name: 'Необработанное' }
    ])
    
    const additionalIndicators = computed(() => 
      availableIndicators.value.filter(ind => targetsData.value.targetTree?.[ind.key])
    )
    
    // Отсортированные недели (новые сначала)
    const sortedWeeks = computed(() => 
      [...weeksData.value].sort((a, b) => b.id - a.id)
    )
    
    // Загрузка данных
    const loadData = async () => {
      try {
        isLoading.value = true
        
        const [dataResponse, targetsResponse] = await Promise.all([
          fetch('/sales-data.json'),
          fetch('/targets.json')
        ])
        
        if (!dataResponse.ok || !targetsResponse.ok) {
          throw new Error('Ошибка при загрузке данных')
        }
        
        const salesData = await dataResponse.json()
        const targets = await targetsResponse.json()
        
        weeksData.value = salesData.weeks
        regionsData.value = salesData.regions
        targetsData.value = targets
        
        // Очистка кеша при новых данных
        regionSummaryCache.value = {}
        
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // Расчёты для магазинов
    const calculatePercent = (fact, plan) => {
      if (!plan || plan === 0) return 0
      return (fact / plan) * 100
    }
    
    const getStoreValue = (store, weekId, indicator) => {
      const weekData = store.weeklyData?.find(w => w.weekId === weekId)
      return weekData?.[indicator] || 0
    }
    
    const getStorePercent = (store, weekId) => {
      const weekData = store.weeklyData?.find(w => w.weekId === weekId)
      if (!weekData) return 0
      return calculatePercent(weekData.fact, weekData.plan)
    }
    
    const getStoreIndicatorPercent = (store, weekId, indicator) => {
      const weekData = store.weeklyData?.find(w => w.weekId === weekId)
      const targets = targetsData.value.storeTargets?.[store.id.toString()]
      const targetTree = targetsData.value.targetTree?.[indicator]
      
      if (!weekData || !targets || !targetTree) return 0
      
      const factValue = weekData[indicator] || 0
      const targetValue = targets[indicator] * weekData.fact
      
      if (targetValue === 0) return 0
      
      if (targetTree.type === 'negative') {
        return (targetValue / factValue) * 100
      } else {
        return (factValue / targetValue) * 100
      }
    }
    
    const getStoreIndicatorScore = (store, weekId, indicator) => {
      const weekData = store.weeklyData?.find(w => w.weekId === weekId)
      const targets = targetsData.value.storeTargets?.[store.id.toString()]
      const targetTree = targetsData.value.targetTree?.[indicator]
      
      if (!weekData || !targets || !targetTree) return 0
      
      const factValue = weekData[indicator] || 0
      const targetValue = targets[indicator] * weekData.fact
      
      if (targetValue === 0) return 0
      
      let percent = 0
      if (targetTree.type === 'negative') {
        percent = (targetValue / factValue) * 100
      } else {
        percent = (factValue / targetValue) * 100
      }
      
      const scoreRatio = Math.min(percent / 100, 1)
      return scoreRatio * targetTree.maxScore
    }
    
    const getStoreTotalScore = (store, weekId) => {
      const targets = targetsData.value.storeTargets?.[store.id.toString()]
      if (!targets) return 0
      
      let totalScore = 0
      Object.keys(targets).forEach(indicator => {
        totalScore += getStoreIndicatorScore(store, weekId, indicator)
      })
      
      return totalScore
    }
    
    // Расчёты для регионов с кешированием
    const getRegionSummary = (region, weekId) => {
      const cacheKey = `${region.id}_${weekId}`
      
      if (regionSummaryCache.value[cacheKey]) {
        return regionSummaryCache.value[cacheKey]
      }
      
      const stores = region.stores || []
      let summary = {
        plan: 0,
        fact: 0,
        percent: 0,
        totalScore: 0
      }
      
      // Суммируем базовые показатели
      stores.forEach(store => {
        summary.plan += getStoreValue(store, weekId, 'plan')
        summary.fact += getStoreValue(store, weekId, 'fact')
        summary.totalScore += getStoreTotalScore(store, weekId)
      })
      
      // Рассчитываем процент оборота
      summary.percent = calculatePercent(summary.fact, summary.plan)
      
      // Суммируем дополнительные показатели
      additionalIndicators.value.forEach(indicator => {
        const indicatorKey = indicator.key
        let indicatorSum = 0
        
        stores.forEach(store => {
          indicatorSum += getStoreValue(store, weekId, indicatorKey)
        })
        
        summary[indicatorKey] = indicatorSum
        
        // Рассчитываем средневзвешенный процент для региона
        // Используем средневзвешенный по обороту расчет
        let weightedPercentSum = 0
        let totalFact = 0
        
        stores.forEach(store => {
          const storeFact = getStoreValue(store, weekId, 'fact')
          const storePercent = getStoreIndicatorPercent(store, weekId, indicatorKey)
          
          if (storeFact > 0 && storePercent > 0) {
            weightedPercentSum += storePercent * storeFact
            totalFact += storeFact
          }
        })
        
        summary[indicatorKey + '_percent'] = totalFact > 0 ? weightedPercentSum / totalFact : 0
        
        // Суммируем баллы
        let scoreSum = 0
        stores.forEach(store => {
          scoreSum += getStoreIndicatorScore(store, weekId, indicatorKey)
        })
        
        summary[indicatorKey + '_score'] = scoreSum
      })
      
      regionSummaryCache.value[cacheKey] = summary
      return summary
    }
    
    // Сортировка регионов
    const sortedRegions = computed(() => {
      const regions = Object.values(regionsData.value)
      
      return regions.sort((a, b) => {
        let aValue, bValue
        
        if (sortBy.value === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sortBy.value.startsWith('totalScore_')) {
          const weekId = parseInt(sortBy.value.split('_')[1])
          aValue = getRegionSummary(a, weekId).totalScore
          bValue = getRegionSummary(b, weekId).totalScore
        } else if (sortBy.value.includes('_percent_')) {
          const [indicator, , weekId] = sortBy.value.split('_')
          aValue = getRegionSummary(a, parseInt(weekId))[indicator + '_percent']
          bValue = getRegionSummary(b, parseInt(weekId))[indicator + '_percent']
        } else if (sortBy.value.includes('_score_')) {
          const [indicator, , weekId] = sortBy.value.split('_')
          aValue = getRegionSummary(a, parseInt(weekId))[indicator + '_score']
          bValue = getRegionSummary(b, parseInt(weekId))[indicator + '_score']
        } else {
          const [indicator, weekId] = sortBy.value.split('_')
          if (indicator === 'percent') {
            aValue = getRegionSummary(a, parseInt(weekId)).percent
            bValue = getRegionSummary(b, parseInt(weekId)).percent
          } else {
            aValue = getRegionSummary(a, parseInt(weekId))[indicator]
            bValue = getRegionSummary(b, parseInt(weekId))[indicator]
          }
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    })
    
    // Сортировка магазинов
    const sortedStores = computed(() => {
      const stores = []
      
      // Собираем все магазины со всех регионов
      Object.values(regionsData.value).forEach(region => {
        region.stores.forEach(store => {
          stores.push({
            ...store,
            regionId: region.id,
            regionName: region.name,
            regionColor: region.color
          })
        })
      })
      
      return stores.sort((a, b) => {
        let aValue, bValue
        
        if (sortBy.value === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sortBy.value.startsWith('totalScore_')) {
          const weekId = parseInt(sortBy.value.split('_')[1])
          aValue = getStoreTotalScore(a, weekId)
          bValue = getStoreTotalScore(b, weekId)
        } else if (sortBy.value.includes('_percent_')) {
          const [indicator, , weekId] = sortBy.value.split('_')
          aValue = getStoreIndicatorPercent(a, parseInt(weekId), indicator)
          bValue = getStoreIndicatorPercent(b, parseInt(weekId), indicator)
        } else if (sortBy.value.includes('_score_')) {
          const [indicator, , weekId] = sortBy.value.split('_')
          aValue = getStoreIndicatorScore(a, parseInt(weekId), indicator)
          bValue = getStoreIndicatorScore(b, parseInt(weekId), indicator)
        } else {
          const [indicator, weekId] = sortBy.value.split('_')
          if (indicator === 'percent') {
            aValue = getStorePercent(a, parseInt(weekId))
            bValue = getStorePercent(b, parseInt(weekId))
          } else {
            aValue = getStoreValue(a, parseInt(weekId), indicator)
            bValue = getStoreValue(b, parseInt(weekId), indicator)
          }
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    })
    
    // Получить цвет региона для магазина
    const getStoreRegionColor = (store) => {
      return store.regionColor || '#6c757d'
    }
    
    const toggleSort = (field) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
    }
    
    const getSortIcon = (field) => {
      if (sortBy.value !== field) return '↕'
      return sortOrder.value === 'asc' ? '↑' : '↓'
    }
    
    // Управление видимостью столбцов
    const updateColumnVisibility = () => {
      // Очищаем кеш при изменении видимости
      regionSummaryCache.value = {}
    }
    
    // Форматирование
    const formatNumber = (value) => {
      return Math.round(value).toLocaleString()
    }
    
    const formatPercent = (value) => {
      return Math.round(value) + '%'
    }
    
    // Инициализация
    onMounted(() => {
      loadData()
    })
    
    return {
      isLoading,
      weeksData,
      regionsData,
      targetsData,
      visibleIndicators,
      sortBy,
      sortOrder,
      availableIndicators,
      additionalIndicators,
      sortedWeeks,
      sortedRegions,
      sortedStores,
      
      // Методы
      toggleSort,
      getSortIcon,
      updateColumnVisibility,
      getStoreValue,
      getStorePercent,
      getStoreTotalScore,
      getStoreIndicatorPercent,
      getStoreIndicatorScore,
      getRegionSummary,
      getStoreRegionColor,
      formatNumber,
      formatPercent
    }
  }
}
</script>

<style scoped>
.analytics-container {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Лоадер */
.loader-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #e9ecef;
  z-index: 1000;
}

.loader-progress {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  width: 0%;
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Контент */
.analytics-content {
  padding: 20px;
}

/* Управление показателями */
.controls {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.controls h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.indicator-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.indicator-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #34495e;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  transition: all 0.2s;
}

.indicator-checkbox:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.indicator-checkbox input {
  margin: 0;
}

/* Таблица */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #34495e;
  color: white;
  font-weight: 600;
  border-bottom: 2px solid #2c3e50;
}

.header-region {
  flex: 0 0 200px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid #2c3e50;
}

.header-week {
  flex: 1;
  border-right: 1px solid #2c3e50;
}

.header-week:last-child {
  border-right: none;
}

.week-title {
  padding: 10px 15px;
  border-bottom: 1px solid #2c3e50;
  text-align: center;
}

.week-title h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.week-date {
  font-size: 12px;
  opacity: 0.8;
}

.indicators-group {
  display: flex;
}

.basic-indicators {
  display: flex;
  flex: 0 0 180px;
  border-right: 1px solid #2c3e50;
}

.indicator-column {
  flex: 1;
  padding: 10px 8px;
  text-align: center;
  border-right: 1px solid #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
}

.indicator-column:last-child {
  border-right: none;
}

/* Дополнительные показатели - группировка */
.indicator-group {
  border-right: 1px solid #2c3e50;
  transition: all 0.3s ease;
}

.indicator-group.additional-indicator {
  flex: 0 0 180px;
  opacity: 1;
  width: 180px;
  max-width: 180px;
  transform: scaleX(1);
}

.indicator-group.additional-indicator.hidden {
  opacity: 0;
  width: 0;
  max-width: 0;
  transform: scaleX(0);
  overflow: hidden;
}

.indicator-header-group {
  padding: 8px 5px;
  text-align: center;
  border-bottom: 1px solid #2c3e50;
  background: #2c3e50;
}

.indicator-name {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.indicator-subheaders {
  display: flex;
}

.indicator-subheader {
  flex: 1;
  padding: 6px 3px;
  text-align: center;
  border-right: 1px solid #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  background: #34495e;
}

.indicator-subheader:last-child {
  border-right: none;
}

.indicator-subvalues {
  display: flex;
}

.indicator-subvalues .indicator-value {
  flex: 1;
  text-align: center;
  padding: 12px 4px;
  border-right: 1px solid #dee2e6;
  font-size: 13px;
}

.indicator-subvalues .indicator-value:last-child {
  border-right: none;
}

.total-score-header {
  flex: 0 0 80px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
}

.sort-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.sort-btn:hover {
  opacity: 1;
}

/* Блок итогов по регионам */
.regions-summary {
  background: white;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.summary-header {
  background: #2c3e50;
  color: white;
  padding: 15px 20px;
  border-bottom: 2px solid #34495e;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.region-row {
  display: flex;
  border-bottom: 1px solid #ecf0f1;
  background: #f8f9fa;
  font-weight: 600;
}

.region-row:last-child {
  border-bottom: none;
}

.region-row:hover {
  background: #e9ecef;
}

.region-name {
  flex: 0 0 200px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 1px solid #dee2e6;
}

.region-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.region-data {
  flex: 1;
  display: flex;
  border-right: 1px solid #dee2e6;
}

.region-data:last-child {
  border-right: none;
}

.basic-indicators {
  display: flex;
  flex: 0 0 180px;
  border-right: 1px solid #dee2e6;
}

.basic-indicators .indicator-value {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border-right: 1px solid #dee2e6;
}

.basic-indicators .indicator-value:last-child {
  border-right: none;
}

/* Блок магазинов */
.stores-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  background: #34495e;
  color: white;
  padding: 15px 20px;
  border-bottom: 2px solid #2c3e50;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.stores-header {
  display: flex;
  background: #34495e;
  color: white;
  font-weight: 600;
  border-bottom: 2px solid #2c3e50;
}

.store-region {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

/* Тело таблицы */
.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.store-row {
  display: flex;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s;
}

.store-row:hover {
  background-color: #f8f9fa;
}

.store-name {
  flex: 0 0 200px;
  padding: 12px 15px;
  border-right: 1px solid #dee2e6;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.store-data {
  flex: 1;
  display: flex;
  border-right: 1px solid #dee2e6;
}

.store-data:last-child {
  border-right: none;
}

.indicator-value {
  text-align: center;
  padding: 12px 8px;
  color: #2c3e50;
  font-size: 14px;
}

.total-score {
  flex: 0 0 80px;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #27ae60;
}

/* Адаптивность */
@media (max-width: 768px) {
  .header-region,
  .region-name,
  .store-name {
    flex: 0 0 150px;
  }
  
  .basic-indicators {
    flex: 0 0 120px;
  }
  
  .basic-indicators .indicator-value {
    font-size: 12px;
    padding: 8px 4px;
  }
  
  .indicator-group.additional-indicator {
    flex: 0 0 120px;
    width: 120px;
    max-width: 120px;
  }
  
  .indicator-name {
    font-size: 10px;
  }
  
  .indicator-subheader {
    font-size: 9px;
    padding: 4px 2px;
  }
  
  .indicator-subvalues .indicator-value {
    font-size: 11px;
    padding: 8px 2px;
  }
  
  .indicator-value {
    font-size: 12px;
    padding: 8px 4px;
  }
  
  .summary-header,
  .section-header {
    padding: 10px 15px;
  }
  
  .summary-header h3,
  .section-header h3 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .analytics-content {
    padding: 10px;
  }
  
  .indicator-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .table-container,
  .regions-summary,
  .stores-section {
    font-size: 12px;
  }
  
  .controls {
    padding: 15px;
  }
  
  .controls h3 {
    font-size: 16px;
  }
  
  .indicator-group.additional-indicator {
    flex: 0 0 90px;
    width: 90px;
    max-width: 90px;
  }
  
  .indicator-name {
    font-size: 9px;
  }
  
  .indicator-subheader {
    font-size: 8px;
    padding: 3px 1px;
  }
  
  .indicator-subvalues .indicator-value {
    font-size: 10px;
    padding: 6px 1px;
  }
}
</style>