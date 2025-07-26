<template>
<<<<<<< HEAD
  <div class="table-color-changer">
    <h1>Изменение цвета шапки таблицы</h1>
    
    <div class="color-palette">
      <h3>Палитра темных цветов:</h3>
      <div 
        v-for="color in darkColors" 
        :key="color"
        class="color-option"
        :class="{ selected: selectedColor === color }"
        :style="{ backgroundColor: color }"
        @click="changeColor(color)"
        :title="color"
      />
    </div>
    
    <div class="table-container">
      <table>
        <thead 
          class="table-header"
          :style="headerStyle"
        >
          <tr>
            <th>Имя</th>
            <th>Должность</th>
            <th>Отдел</th>
            <th>Зарплата</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.name }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.salary }}</td>
            <td>{{ employee.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="current-color-info" v-if="selectedColor">
      <strong>Текущий цвет:</strong> {{ selectedColor }}<br>
      <strong>Цвет бордеров:</strong> {{ darkerColor }}
=======
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
          <!-- Базовые показатели -->
          <div class="control-group">
            <h4>Базовые показатели</h4>
            <label class="indicator-checkbox">
              <input type="checkbox" v-model="visibleColumns.plan" @change="updateColumnVisibility">
              План
            </label>
            <label class="indicator-checkbox">
              <input type="checkbox" v-model="visibleColumns.fact" @change="updateColumnVisibility">
              Факт
            </label>
            <label class="indicator-checkbox">
              <input type="checkbox" v-model="visibleColumns.percent" @change="updateColumnVisibility">
              % оборота
            </label>
          </div>
          {{ visibleColumns }}
          <!-- Дополнительные показатели -->
          <div class="control-group">
            <h4>Дополнительные показатели</h4>
            <div v-for="indicator in additionalIndicators" :key="indicator.key" class="indicator-group-controls">
              <span class="indicator-title">{{ indicator.name }}:</span>
              <label class="indicator-checkbox">
                <input type="checkbox" v-model="visibleColumns[indicator.key + '_value']" @change="updateColumnVisibility">
                Значение
              </label>
              <label class="indicator-checkbox">
                <input type="checkbox" v-model="visibleColumns[indicator.key + '_percent']" @change="updateColumnVisibility">
                %
              </label>
              <label class="indicator-checkbox">
                <input type="checkbox" v-model="visibleColumns[indicator.key + '_score']" @change="updateColumnVisibility">
                Балл
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-container">
        <!-- Основная шапка -->
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
            
            <div class="week-columns">
              <!-- Общий балл - первая колонка -->
              <div class="column-header total-score-column">
                <span>Общий балл</span>
                <button @click="toggleSort(`totalScore_${week.id}`)" class="sort-btn">
                  {{ getSortIcon(`totalScore_${week.id}`) }}
                </button>
              </div>
              
              <!-- Группа базовых показателей -->
              <div class="indicators-group basic-group">
                <div class="group-title">Оборот</div>
                <div class="group-columns">
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns.plan }">
                    <span>План</span>
                    <button @click="toggleSort(`plan_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`plan_${week.id}`) }}
                    </button>
                  </div>
                  
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns.fact }">
                    <span>Факт</span>
                    <button @click="toggleSort(`fact_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`fact_${week.id}`) }}
                    </button>
                  </div>
                  
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns.percent }">
                    <span>%</span>
                    <button @click="toggleSort(`percent_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`percent_${week.id}`) }}
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Группы дополнительных показателей -->
              <div 
                v-for="indicator in additionalIndicators" 
                :key="indicator.key"
                class="indicators-group additional-group"
              >
                <div v-if="visibleColumns" class="group-title">{{ indicator.name }}</div>
                <div class="group-columns">
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_value'] }">
                    <span>Знач.</span>
                    <button @click="toggleSort(`${indicator.key}_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_${week.id}`) }}
                    </button>
                  </div>
                  
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_percent'] }">
                    <span>%</span>
                    <button @click="toggleSort(`${indicator.key}_percent_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_percent_${week.id}`) }}
                    </button>
                  </div>
                  
                  <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_score'] }">
                    <span>Балл</span>
                    <button @click="toggleSort(`${indicator.key}_score_${week.id}`)" class="sort-btn">
                      {{ getSortIcon(`${indicator.key}_score_${week.id}`) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Блок итогов по регионам -->
        <div class="regions-summary">
          <div class="summary-header">
            <h3>Итоги по регионам</h3>
          </div>
          
          <div v-for="region in sortedRegions" :key="region.id" class="region-row" :class="{ 'sorting': isSorting }">
            <div class="region-name">
              <span class="region-indicator" :style="{ backgroundColor: region.color }"></span>
              {{ region.name }}
            </div>
            
            <div v-for="week in sortedWeeks" :key="week.id" class="region-data">
              <div class="week-columns">
                <!-- Общий балл -->
                <div class="column-value total-score">
                  {{ formatNumber(getRegionSummary(region, week.id).totalScore) }}
                </div>
                
                <!-- Группа базовых показателей -->
                <div class="indicators-group basic-group">
                  <div class="group-columns">
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns.plan }">
                      {{ formatNumber(getRegionSummary(region, week.id).plan) }}
                    </div>
                    
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns.fact }">
                      {{ formatNumber(getRegionSummary(region, week.id).fact) }}
                    </div>
                    
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns.percent }">
                      {{ formatPercent(getRegionSummary(region, week.id).percent) }}
                    </div>
                  </div>
                </div>
                
                <!-- Группы дополнительных показателей -->
                <div 
                  v-for="indicator in additionalIndicators" 
                  :key="indicator.key"
                  class="indicators-group additional-group"
                >
                  <div class="group-columns">
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_value'] }">
                      {{ formatNumber(getRegionSummary(region, week.id)[indicator.key]) }}
                    </div>
                    
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_percent'] }">
                      {{ formatPercent(getRegionSummary(region, week.id)[indicator.key + '_percent']) }}
                    </div>
                    
                    <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_score'] }">
                      {{ formatNumber(getRegionSummary(region, week.id)[indicator.key + '_score']) }}
                    </div>
                  </div>
                </div>
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
              <div class="week-columns">
                <!-- Общий балл -->
                <div class="column-header total-score-column">
                  <span>Общий балл</span>
                  <button @click="toggleSort(`totalScore_${week.id}`)" class="sort-btn">
                    {{ getSortIcon(`totalScore_${week.id}`) }}
                  </button>
                </div>
                
                <!-- Группа базовых показателей -->
                <div class="indicators-group basic-group">
                  <div class="group-columns">
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns.plan }">
                      <span>План</span>
                      <button @click="toggleSort(`plan_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`plan_${week.id}`) }}
                      </button>
                    </div>
                    
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns.fact }">
                      <span>Факт</span>
                      <button @click="toggleSort(`fact_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`fact_${week.id}`) }}
                      </button>
                    </div>
                    
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns.percent }">
                      <span>%</span>
                      <button @click="toggleSort(`percent_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`percent_${week.id}`) }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Группы дополнительных показателей -->
                <div 
                  v-for="indicator in additionalIndicators" 
                  :key="indicator.key"
                  class="indicators-group additional-group"
                >
                  <div class="group-columns">
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_value'] }">
                      <span>Знач.</span>
                      <button @click="toggleSort(`${indicator.key}_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_${week.id}`) }}
                      </button>
                    </div>
                    
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_percent'] }">
                      <span>%</span>
                      <button @click="toggleSort(`${indicator.key}_percent_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_percent_${week.id}`) }}
                      </button>
                    </div>
                    
                    <div class="column-header" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_score'] }">
                      <span>Балл</span>
                      <button @click="toggleSort(`${indicator.key}_score_${week.id}`)" class="sort-btn">
                        {{ getSortIcon(`${indicator.key}_score_${week.id}`) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Данные магазинов -->
          <div class="table-body">
            <div v-for="store in sortedStores" :key="store.id" class="store-row" :class="{ 'sorting': isSorting }">
              <div class="store-name">
                <span class="store-region" :style="{ backgroundColor: getStoreRegionColor(store) }"></span>
                {{ store.name }}
              </div>
              
              <div v-for="week in sortedWeeks" :key="week.id" class="store-data">
                <div class="week-columns">
                  <!-- Общий балл -->
                  <div class="column-value total-score">
                    {{ formatNumber(getStoreTotalScore(store, week.id)) }}
                  </div>
                  
                  <!-- Группа базовых показателей -->
                  <div class="indicators-group basic-group">
                    <div class="group-columns">
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns.plan }">
                        {{ formatNumber(getStoreValue(store, week.id, 'plan')) }}
                      </div>
                      
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns.fact }">
                        {{ formatNumber(getStoreValue(store, week.id, 'fact')) }}
                      </div>
                      
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns.percent }">
                        {{ formatPercent(getStorePercent(store, week.id)) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Группы дополнительных показателей -->
                  <div 
                    v-for="indicator in additionalIndicators" 
                    :key="indicator.key"
                    class="indicators-group additional-group"
                  >
                    <div class="group-columns">
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_value'] }">
                        {{ formatNumber(getStoreValue(store, week.id, indicator.key)) }}
                      </div>
                      
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_percent'] }">
                        {{ formatPercent(getStoreIndicatorPercent(store, week.id, indicator.key)) }}
                      </div>
                      
                      <div class="column-value" :class="{ 'column-hidden': !visibleColumns[indicator.key + '_score'] }">
                        {{ formatNumber(getStoreIndicatorScore(store, week.id, indicator.key)) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
>>>>>>> origin/main
    </div>
  </div>
</template>

<script>
<<<<<<< HEAD
import { ref, computed } from 'vue'

export default {
  name: 'TableColorChanger',
  setup() {
    // Палитра темных цветов
    const darkColors = ref([
      '#2c3e50', // Темно-синий
      '#34495e', // Графитовый
      '#1abc9c', // Темный бирюзовый
      '#16a085', // Зеленый морской волны
      '#27ae60', // Изумрудный
      '#2ecc71', // Темно-зеленый
      '#8e44ad', // Фиолетовый
      '#9b59b6', // Аметистовый
      '#2980b9', // Синий
      '#3498db', // Светло-синий
      '#e74c3c', // Красный
      '#c0392b', // Темно-красный
      '#d35400', // Оранжевый
      '#e67e22', // Темно-оранжевый
      '#f39c12', // Желто-оранжевый
      '#f1c40f', // Желтый
      '#7f8c8d', // Серый
      '#95a5a6'  // Светло-серый
    ])

    // Выбранный цвет
    const selectedColor = ref('#2c3e50')

    // Данные для таблицы
    const employees = ref([
      { 
        id: 1, 
        name: 'Иван Петров', 
        position: 'Разработчик', 
        department: 'IT', 
        salary: '80 000 ₽', 
        status: 'Активен' 
      },
      { 
        id: 2, 
        name: 'Мария Сидорова', 
        position: 'Дизайнер', 
        department: 'Дизайн', 
        salary: '65 000 ₽', 
        status: 'Активна' 
      },
      { 
        id: 3, 
        name: 'Алексей Иванов', 
        position: 'Менеджер', 
        department: 'Продажи', 
        salary: '70 000 ₽', 
        status: 'Активен' 
      },
      { 
        id: 4, 
        name: 'Елена Козлова', 
        position: 'Аналитик', 
        department: 'Аналитика', 
        salary: '75 000 ₽', 
        status: 'Активна' 
      },
      { 
        id: 5, 
        name: 'Дмитрий Смирнов', 
        position: 'Тестировщик', 
        department: 'QA', 
        salary: '60 000 ₽', 
        status: 'Активен' 
      }
    ])

    // Функция для затемнения цвета
    const darkenColor = (color, percent = 20) => {
      const num = parseInt(color.replace("#", ""), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) - amt
      const G = (num >> 8 & 0x00FF) - amt
      const B = (num & 0x0000FF) - amt
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
          (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
          (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
    }

    // Вычисляемый более темный цвет
    const darkerColor = computed(() => {
      return darkenColor(selectedColor.value)
    })

    // Стиль для шапки таблицы
    const headerStyle = computed(() => {
      return {
        backgroundColor: selectedColor.value,
        border: `3px solid ${darkerColor.value}`,
        borderCollapse: 'separate',
        borderSpacing: 0
      }
    })

    // Функция изменения цвета
    const changeColor = (color) => {
      selectedColor.value = color
    }

    return {
      darkColors,
      selectedColor,
      employees,
      darkerColor,
      headerStyle,
      changeColor
=======
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
    
    // Управление видимостью колонок
    const visibleColumns = reactive({
      plan: true,
      fact: true,
      percent: true,
      losses_value: true,
      losses_percent: true,
      losses_score: true,
      shortages_value: false,
      shortages_percent: false,
      shortages_score: false,
      fop_value: false,
      fop_percent: false,
      fop_score: false,
      shiftRemainder_value: false,
      shiftRemainder_percent: false,
      shiftRemainder_score: false,
      unprocessed_value: false,
      unprocessed_percent: false,
      unprocessed_score: false,
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
    
    // Состояние анимации сортировки
    const isSorting = ref(false)
    
    const toggleSort = (field) => {
      isSorting.value = true
      
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
      
      // Убираем анимацию через короткое время
      setTimeout(() => {
        isSorting.value = false
      }, 300)
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
      isSorting,
      weeksData,
      regionsData,
      targetsData,
      visibleColumns,
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
>>>>>>> origin/main
    }
  }
}
</script>

<<<<<<< HEAD
<style scoped>
.table-color-changer {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-family: Arial, sans-serif;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}

.color-palette h3 {
  width: 100%;
  margin: 0 0 15px 0;
  color: #555;
  font-family: Arial, sans-serif;
}

.color-option {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.color-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #333;
}

.table-container {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.table-header {
  transition: all 0.3s ease;
}

.table-header th {
  padding: 15px;
  text-align: left;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.table-header th:not(:last-child) {
  border-right: 2px solid;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.current-color-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  font-family: Arial, sans-serif;
}

.current-color-info strong {
  color: #007bff;
=======
<style lang="scss" scoped>
.analytics-container {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  
  .loader-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #e9ecef;
    z-index: 1000;
    
    .loader-progress {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      width: 0%;
      animation: loading 2s ease-in-out infinite;
    }
  }
  
  @keyframes loading {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
  }
}

.analytics-content {
  padding: 1rem;
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (min-width: 1200px) {
    padding: 2rem;
  }
}

.controls {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
  }
  
  .indicator-controls {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    
    @media (min-width: 1200px) {
      flex-direction: row;
      gap: 2rem;
    }
  }
  
  .control-group {
    flex: 1;
    
    h4 {
      margin: 0 0 0.75rem 0;
      color: #34495e;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .indicator-group-controls {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      
      .indicator-title {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #2c3e50;
      }
      
      .indicator-checkbox {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-right: 1rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        
        input {
          margin: 0;
        }
      }
    }
  }
  
  .indicator-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    color: #34495e;
    padding: 0.5rem 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 0.5rem;
    transform: scale(1);
    
    &:hover {
      background: #f8f9fa;
      border-color: #3498db;
      transform: scale(1.02);
      box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    input {
      margin: 0;
      transition: all 0.2s ease;
      
      &:checked {
        accent-color: #3498db;
      }
    }
  }
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  
  .table-header {
    display: flex;
    background: #34495e;
    color: white;
    font-weight: 600;
    border-bottom: 2px solid #2c3e50;
    
    .header-region {
      flex: 0 0 200px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-right: 1px solid #2c3e50;
      font-size: 0.9rem;
      
      @media (min-width: 768px) {
        flex: 0 0 250px;
        font-size: 1rem;
      }
    }
    
    .header-week {
      flex: 1;
      border-right: 1px solid #2c3e50;
      
      &:last-child {
        border-right: none;
      }
      
      .week-title {
        padding: 0.75rem;
        border-bottom: 1px solid #2c3e50;
        text-align: center;
        
        h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          
          @media (min-width: 768px) {
            font-size: 1.1rem;
          }
        }
        
        .week-date {
          font-size: 0.75rem;
          opacity: 0.8;
        }
      }
      
      .week-columns {
        display: flex;
        
        .column-header {
          flex: 1;
          min-width: 60px;
          padding: 0.5rem 0.25rem;
          text-align: center;
          border-right: 1px solid #2c3e50;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          transition: all 0.3s ease;
          
          @media (min-width: 768px) {
            min-width: 80px;
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }
          
          &:last-child {
            border-right: none;
          }
          
          &.total-score-column {
            background: #2c3e50;
            font-weight: 700;
            flex: 0 0 80px;
            
            @media (min-width: 768px) {
              flex: 0 0 100px;
            }
          }
          
          span {
            line-height: 1.2;
            text-align: center;
          }
        }
        
        .indicators-group {
          display: flex;
          flex-direction: column;
          border-right: 1px solid #2c3e50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          transform: scaleX(1);
          
          &:last-child {
            border-right: none;
          }
          
          // Проверяем, если все колонки внутри группы скрыты
          &:has(.column-header.column-hidden:nth-child(n)) {
            .group-title {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
          }
          
          .group-title {
            padding: 0.5rem;
            background: #2c3e50;
            text-align: center;
            font-size: 0.8rem;
            font-weight: 600;
            border-bottom: 1px solid #34495e;
            transition: all 0.3s ease;
            
            @media (min-width: 768px) {
              font-size: 0.9rem;
            }
          }
          
          .group-columns {
            display: flex;
            
            .column-header {
              border-right: 1px solid #2c3e50;
              
              &:last-child {
                border-right: none;
              }
            }
          }
        }
      }
    }
  }
  
  .sort-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.125rem;
    opacity: 0.7;
    transition: all 0.3s ease;
    transform: scale(1);
    
    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.9);
    }
  }
}

// Анимация для скрытых колонок
.column-header, .column-value {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  transform: scaleX(1);
  width: auto;
  
  &.column-hidden {
    opacity: 0;
    transform: scaleX(0);
    width: 0 !important;
    min-width: 0 !important;
    max-width: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin: 0 !important;
    border-right: none !important;
    border-left: none !important;
    overflow: hidden;
  }
}

// Анимация для сортировки строк
.region-row, .store-row {
  transition: all 0.3s ease;
  
  &.sorting {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
}

.regions-summary {
  background: white;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  
  .summary-header {
    background: #2c3e50;
    color: white;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #34495e;
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
  
  .region-row {
    display: flex;
    border-bottom: 1px solid #ecf0f1;
    background: #f8f9fa;
    font-weight: 600;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .region-name {
      flex: 0 0 200px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-right: 1px solid #dee2e6;
      
      @media (min-width: 768px) {
        flex: 0 0 250px;
        padding: 1rem 1.5rem;
      }
      
      .region-indicator {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }
    }
    
    .region-data {
      flex: 1;
      display: flex;
      border-right: 1px solid #dee2e6;
      
      &:last-child {
        border-right: none;
      }
      
      .week-columns {
        display: flex;
        width: 100%;
        
        .column-value {
          flex: 1;
          min-width: 60px;
          text-align: center;
          padding: 0.75rem 0.25rem;
          border-right: 1px solid #dee2e6;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          
          @media (min-width: 768px) {
            min-width: 80px;
            padding: 1rem 0.5rem;
            font-size: 0.9rem;
          }
          
          &:last-child {
            border-right: none;
          }
          
          &.total-score {
            background: #e8f5e8;
            font-weight: 700;
            color: #27ae60;
            flex: 0 0 80px;
            
            @media (min-width: 768px) {
              flex: 0 0 100px;
            }
          }
        }
        
        .indicators-group {
          display: flex;
          border-right: 1px solid #dee2e6;
          
          &:last-child {
            border-right: none;
          }
          
          .group-columns {
            display: flex;
            
            .column-value {
              border-right: 1px solid #dee2e6;
              
              &:last-child {
                border-right: none;
              }
            }
          }
        }
      }
    }
  }
}

.stores-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  
  .section-header {
    background: #34495e;
    color: white;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #2c3e50;
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
  
  .stores-header {
    display: flex;
    background: #34495e;
    color: white;
    font-weight: 600;
    border-bottom: 2px solid #2c3e50;
    
    .header-region {
      flex: 0 0 200px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-right: 1px solid #2c3e50;
      font-size: 0.9rem;
      
      @media (min-width: 768px) {
        flex: 0 0 250px;
        font-size: 1rem;
      }
    }
    
    .header-week {
      flex: 1;
      border-right: 1px solid #2c3e50;
      
      &:last-child {
        border-right: none;
      }
      
      .week-columns {
        display: flex;
        
        .column-header {
          flex: 1;
          min-width: 60px;
          padding: 0.5rem 0.25rem;
          text-align: center;
          border-right: 1px solid #2c3e50;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          transition: all 0.3s ease;
          
          @media (min-width: 768px) {
            min-width: 80px;
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }
          
          &:last-child {
            border-right: none;
          }
          
          &.total-score-column {
            background: #2c3e50;
            font-weight: 700;
            flex: 0 0 80px;
            
            @media (min-width: 768px) {
              flex: 0 0 100px;
            }
          }
          
          span {
            line-height: 1.2;
            text-align: center;
          }
        }
        
        .indicators-group {
          display: flex;
          border-right: 1px solid #2c3e50;
          
          &:last-child {
            border-right: none;
          }
          
          .group-columns {
            display: flex;
            
            .column-header {
              border-right: 1px solid #2c3e50;
              
              &:last-child {
                border-right: none;
              }
            }
          }
        }
      }
    }
  }
  
  .table-body {
    max-height: 70vh;
    overflow-y: auto;
    
    .store-row {
      display: flex;
      border-bottom: 1px solid #ecf0f1;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .store-name {
        flex: 0 0 200px;
        padding: 0.75rem 1rem;
        border-right: 1px solid #dee2e6;
        color: #2c3e50;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        
        @media (min-width: 768px) {
          flex: 0 0 250px;
          padding: 1rem 1.5rem;
          font-size: 1rem;
        }
        
        .store-region {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
      }
      
      .store-data {
        flex: 1;
        display: flex;
        border-right: 1px solid #dee2e6;
        
        &:last-child {
          border-right: none;
        }
        
        .week-columns {
          display: flex;
          width: 100%;
          
          .column-value {
            flex: 1;
            min-width: 60px;
            text-align: center;
            padding: 0.75rem 0.25rem;
            border-right: 1px solid #dee2e6;
            color: #2c3e50;
            font-size: 0.85rem;
            transition: all 0.3s ease;
            
            @media (min-width: 768px) {
              min-width: 80px;
              padding: 1rem 0.5rem;
              font-size: 0.9rem;
            }
            
            &:last-child {
              border-right: none;
            }
            
            &.total-score {
              background: #e8f5e8;
              font-weight: 700;
              color: #27ae60;
              flex: 0 0 80px;
              
              @media (min-width: 768px) {
                flex: 0 0 100px;
              }
            }
          }
          
          .indicators-group {
            display: flex;
            border-right: 1px solid #dee2e6;
            
            &:last-child {
              border-right: none;
            }
            
            .group-columns {
              display: flex;
              
              .column-value {
                border-right: 1px solid #dee2e6;
                
                &:last-child {
                  border-right: none;
                }
              }
            }
          }
        }
      }
    }
  }
}

.store-region {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

// Адаптивность для мобильных устройств
@media (max-width: 480px) {
  .analytics-content {
    padding: 0.5rem;
  }
  
  .controls {
    padding: 1rem;
    
    .indicator-controls {
      gap: 1rem;
    }
  }
  
  .table-container {
    .table-header,
    .stores-header {
      .header-region {
        flex: 0 0 150px;
        padding: 0.75rem;
        font-size: 0.8rem;
      }
      
      .header-week {
        .week-columns {
          .column-header {
            min-width: 50px;
            padding: 0.5rem 0.25rem;
            font-size: 0.7rem;
            
            &.total-score-column {
              flex: 0 0 60px;
            }
          }
          
          .indicators-group {
            .group-title {
              font-size: 0.7rem;
            }
          }
        }
      }
    }
  }
  
  .regions-summary {
    .region-row {
      .region-name {
        flex: 0 0 150px;
        padding: 0.75rem;
        font-size: 0.85rem;
      }
      
      .region-data {
        .week-columns {
          .column-value {
            min-width: 50px;
            padding: 0.75rem 0.25rem;
            font-size: 0.8rem;
            
            &.total-score {
              flex: 0 0 60px;
            }
          }
        }
      }
    }
  }
  
  .stores-section {
    .table-body {
      .store-row {
        .store-name {
          flex: 0 0 150px;
          padding: 0.75rem;
          font-size: 0.85rem;
        }
        
        .store-data {
          .week-columns {
            .column-value {
              min-width: 50px;
              padding: 0.75rem 0.25rem;
              font-size: 0.8rem;
              
              &.total-score {
                flex: 0 0 60px;
              }
            }
          }
        }
      }
    }
  }
}

.indicators-group {
  flex: 1;
}
.column-value {
  flex: 1;
>>>>>>> origin/main
}
</style>