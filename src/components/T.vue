<template>
  <div class="odx-sales-dashboard">
    <img :class="{ 'odx-palette-toggle--active': isPaletteOpen }" 
         class="odx-palette-toggle" 
         @click="togglePalette"
         src="https://toppng.com/uploads/preview/the-icon-is-shaped-like-an-oval-that-slightly-resembles-paint-palette-icon-11553394861oazcgcebd1.png"
         alt="Palette">

    <div class="odx-color-palette" :class="{ 'odx-color-palette--open': isPaletteOpen }">
      <div class="odx-color-palette__content">
        <h3>Палітра:</h3>
        <div class="odx-color-palette__grid">
          <div v-for="color in darkColors" 
               :key="color" 
               class="odx-color-option"
               :class="{ 'odx-color-option--selected': selectedColor === color }" 
               :style="{ backgroundColor: color }"
               @click="changeColor(color)" 
               :title="color" />
        </div>
        <div class="odx-format-controls">
          <label class="odx-toggle">
            <input type="checkbox" v-model="formatter" @click="formatter = !formatter"/>
            <span class="odx-toggle__slider" :style="headerStyle"></span>
            <span class="odx-toggle__label">Форматування</span>
          </label>
        </div>
      </div>
    </div>
    
    <div v-if="isPaletteOpen" class="odx-overlay" @click="closePalette"></div>

    <div v-if="loading" class="odx-loading">
      <div class="odx-loading__progress"></div>
    </div>

    <div v-if="error" class="odx-error">
      <div class="odx-error__icon">⚠️</div>
      <div class="odx-error__message">{{ error }}</div>
      <button class="odx-error__retry" @click="refreshData">Попробовать снова</button>
    </div>

    <div v-if="!loading && !error" class="odx-dashboard">
      <div class="odx-controls">
        <button :style="headerStyle" 
                class="odx-controls__refresh" 
                @click="refreshData" 
                :disabled="loading">
          Оновити
        </button>
        <div class="odx-controls__tooltip">
          <label class="odx-toggle">
            <input type="checkbox" v-model="tooltipEnabled" />
            <span class="odx-toggle__slider" :style="headerStyle"></span>
            <span class="odx-toggle__label">Деталі</span>
          </label>
        </div>
      </div>

      <div class="odx-table-container">
        <div class="odx-table">
          <div class="odx-table__header" :style="headerStyle">
            <div class="odx-table__row odx-table__row--header-top">
              <div class="odx-table__cell odx-table__cell--static">Регіон / Магазин</div>
              <div class="odx-table__cell odx-table__cell--group" :style="{ width: dynamicRowWidth }">
                <div v-for="week in weeks" :key="week.id" class="odx-week">
                  <h3 class="odx-week__name">{{ week.name }} ({{ week.dateRange }})</h3>
                </div>
              </div>
            </div>

            <div class="odx-table__row odx-table__row--header-middle">
              <div class="odx-table__cell odx-table__cell--static"></div>
              <div v-for="week in weeks" :key="week.id" class="odx-week">
                <div class="odx-week__groups">
                  <div v-for="group in visibleGroups" 
                       :key="group.key" 
                       class="odx-table__cell odx-table__cell--group-header" 
                       :style="getGroupStyle(group.key)">
                    <div @click="toggleGroupVisibility(group.key)" class="odx-group-toggle">
                      <span>{{ group.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="odx-table__row odx-table__row--header-bottom">
              <div class="odx-table__cell odx-table__cell--static"></div>
              <div v-for="week in weeks" :key="week.id" class="odx-week">
                <div class="odx-week__columns">
                  <div v-for="indicator in availableIndicators" 
                       :key="indicator.key" 
                       class="odx-table__cell odx-table__cell--metric" 
                       :style="getStyle(indicator.key)" 
                       @click="handleRegionSort(week.id, indicator.key)">
                    <div class="odx-metric-header">
                      <span v-html="getIndicatorHeader(indicator)"></span>
                      <span class="odx-sort-arrow" :class="getSortArrowClass(week.id, indicator.key)">
                        {{ getSortIcon(week.id, indicator.key) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="odx-table__body">
            <div class="odx-regions">
              <div v-for="region in sortedRegions" 
                   :key="`region-${region.id}`"
                   class="odx-table__row odx-table__row--region" 
                   :class="getRegionRowClass(region.regionRank)">
                <div class="odx-table__cell odx-table__cell--static">
                  <div class="odx-region-info">
                    <div class="odx-region-info__indicator" :style="{ backgroundColor: region.color }"></div>
                    <span class="odx-region-info__title">{{ region.name }}</span>
                  </div>
                </div>
                <div class="odx-table__data">
                  <div v-for="week in weeks" :key="week.id" class="odx-week">
                    <div class="odx-week__columns">
                      <div v-for="indicator in availableIndicators"
                           :key="`region-${region.id}-${week.id}-${indicator.key}`"
                           class="odx-table__cell odx-table__cell--data odx-tooltip-trigger"
                           :class="getRegionCellClass(indicator.key, region, week.id)"
                           :style="getStyle(indicator.key)"
                           @mouseenter="showTooltip($event, region, 'region', week.id, indicator.key)"
                           @mouseleave="hideTooltip" 
                           @mousemove="updateTooltipPosition">
                        {{ getRegionData(region, week.id, indicator.key) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="odx-separator">
              <div class="odx-sort-controls">
                <div class="odx-sort-controls__row">
                  <div class="odx-sort-controls__static"></div>
                  <div class="odx-sort-controls__weeks">
                    <div v-for="week in weeks" :key="week.id" class="odx-sort-week">
                      <div class="odx-sort-week__columns">
                        <div v-for="indicator in availableIndicators" 
                             :key="`sort-${week.id}-${indicator.key}`"
                             class="odx-sort-control" 
                             :class="getStoreSortArrowClass(week.id, indicator.key)"
                             :style="getStyle(indicator.key)"
                             :title="`Сортировать магазины по ${indicator.label.replace(/<br>/g, ' ')} (${week.name})`"
                             @click="handleStoreSort(week.id, indicator.key)">
                          <span class="odx-sort-arrow">
                            {{ getStoreSortIcon(week.id, indicator.key) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="odx-stores">
              <div v-for="store in allStores" 
                   :key="`store-${store.id}`" 
                   class="odx-table__row odx-table__row--store"
                   :class="getStoreRowClass(store.overallRank)">
                <div class="odx-table__cell odx-table__cell--static">
                  <div class="odx-store-info">
                    <div class="odx-store-info__indicator" :style="{ backgroundColor: store.regionColor }"></div>
                    <span class="odx-store-info__title">{{ store.name }}</span>
                  </div>
                </div>
                <div class="odx-table__data">
                  <div v-for="week in weeks" :key="week.id" class="odx-week">
                    <div class="odx-week__columns">
                      <div v-for="indicator in availableIndicators"
                           :key="`store-${store.id}-${week.id}-${indicator.key}`"
                           class="odx-table__cell odx-table__cell--data odx-tooltip-trigger"
                           :class="[getCellClass(indicator.key, getStoreWeekData(store, week.id), false), indicator.key]"
                           :style="getStyle(indicator.key)"
                           @mouseenter="showTooltip($event, store, 'store', week.id, indicator.key)"
                           @mouseleave="hideTooltip" 
                           @mousemove="updateTooltipPosition">
                        {{ getStoreData(store, week.id, indicator.key) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="odx-kpi">
      <button v-if="!isOpen" @click="togglePanel" class="odx-kpi__toggle">
        <img src="https://i.ibb.co/fV6qHXLb/com.png" alt="" class="odx-kpi__icon">
      </button>
      <div v-if="isOpen" class="odx-kpi__overlay" @click="closePanel"></div>
      <div class="odx-kpi__sidebar" :class="{ 'odx-kpi__sidebar--open': isOpen }">
        <div class="odx-kpi__header">
          <h2>📊 Ключові показники</h2>
          <button @click="closePanel" class="odx-kpi__close">✕</button>
        </div>

        <div class="odx-kpi__content" v-if="processedData">
          <div class="odx-kpi__section">
            <h3>🎯 Загальне зведення</h3>
            <div class="odx-kpi__cards">
              <div class="odx-kpi__card odx-kpi__card--primary">
                <div class="odx-kpi__value">{{ processedData.totalStores }}</div>
                <div class="odx-kpi__label">Всьго магазинів</div>
              </div>
              <div class="odx-kpi__card odx-kpi__card--success">
                <div class="odx-kpi__value">{{ processedData.totalRegions }}</div>
                <div class="odx-kpi__label">Регіонів</div>
              </div>
              <div class="odx-kpi__card odx-kpi__card--info">
                <div class="odx-kpi__value">{{ formatNumber(processedData.averageScore) }}</div>
                <div class="odx-kpi__label">Середній бал</div>
              </div>
              <div class="odx-kpi__card odx-kpi__card--warning">
                <div class="odx-kpi__value">{{ processedData.planExecutionPercent }}%</div>
                <div class="odx-kpi__label">Виконання плану</div>
              </div>
            </div>
          </div>

          <div class="odx-kpi__section">
            <h3>🏆 Топ регіони</h3>
            <div class="odx-kpi__list">
              <div v-for="(region, index) in processedData.topRegions" 
                   :key="region.id" 
                   class="odx-kpi__item"
                   :class="`odx-kpi__item--rank-${index + 1}`">
                <div class="odx-kpi__rank">{{ index + 1 }}</div>
                <div class="odx-region-info">
                  <div class="odx-region-info__indicator" :style="{ backgroundColor: region.color }"></div>
                  <span class="odx-region-info__name">{{ region.name }}</span>
                </div>
                <div class="odx-kpi__score">{{ formatNumber(region.score) }}</div>
              </div>
            </div>
          </div>

          <div class="odx-kpi__section">
            <h3>⭐ Топ {{ KPITopStores }} магазини</h3>
            <div class="odx-kpi__list">
              <div v-for="(store, index) in processedData.topStores" 
                   :key="store.id" 
                   class="odx-kpi__item"
                   :class="`odx-kpi__item--rank-${index + 1}`">
                <div class="odx-kpi__rank">{{ index + 1 }}</div>
                <div class="odx-store-info">
                  <div class="odx-store-info__indicator" :style="{ backgroundColor: store.regionColor }"></div>
                  <span class="odx-store-info__name">{{ store.name }}</span>
                  <span class="odx-store-info__region">{{ store.regionName }}</span>
                </div>
                <div class="odx-kpi__score">{{ formatNumber(store.overallTotalScore) }}</div>
              </div>
            </div>
          </div>

          <div class="odx-kpi__section">
            <h3>⚠️ Проблемные зоны</h3>
            <div class="odx-kpi__cards">
              <div class="odx-kpi__card odx-kpi__card--danger">
                <div class="odx-kpi__value">{{ processedData.problemStores }}</div>
                <div class="odx-kpi__label">Магазинів в зоні ризику</div>
              </div>
              <div class="odx-kpi__card odx-kpi__card--warning">
                <div class="odx-kpi__value">{{ processedData.belowPlanStores }}</div>
                <div class="odx-kpi__label">Не виконують план</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible && tooltip.data" 
         class="odx-tooltip" 
         :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', opacity: tooltip.x === 0 && tooltip.y === 0 ? 0 : 1 }">
      <div class="odx-tooltip__header">
        <div class="odx-tooltip__title">{{ tooltip.data.entityName }}</div>
        <div class="odx-tooltip__subtitle">{{ tooltip.data.weekName }} • {{ tooltip.data.indicator }}</div>
      </div>
      <div class="odx-tooltip__main">{{ tooltip.data.mainValue }}</div>
      <div class="odx-tooltip__details">
        <div v-for="detail in tooltip.data.details" 
             :key="detail.label" 
             class="odx-tooltip__detail">
          <span class="odx-tooltip__detail-label">{{ detail.label }}:</span>
          <span class="odx-tooltip__detail-value">{{ detail.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick, watch } from 'vue'

const loading = ref(true)
const error = ref(null)
const salesData = ref(null)
const targetsData = ref(null)
const sortByTotalScore = ref(true)
const regions = ref([])
const tooltipEnabled = ref(false)
const formatter = ref(false)
const KPITopStores = ref(5)
const isOpen = ref(false)
const planScore = ref(0)

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const [salesResponse, targetsResponse] = await Promise.all([
      fetch('/real-data.json'),
      fetch('/targets.json')
    ])


    if (!salesResponse.ok || !targetsResponse.ok) {
      throw new Error(`HTTP error! status: ${salesResponse.status || targetsResponse.status}`)
    }
    
    const [salesDataResult, targetsDataResult] = await Promise.all([
      salesResponse.json(),
      targetsResponse.json()
    ])
    
    if (!salesDataResult.weeks || !salesDataResult.regions) {
      throw new Error('Неверная структура данных продаж')
    }

    if (!targetsDataResult.targetTree || !targetsDataResult.storeTargets) {
      throw new Error('Неверная структура данных целей')
    }
    
    salesData.value = salesDataResult
    targetsData.value = targetsDataResult
    regions.value = Object.values(salesDataResult.regions)
    
    initializeVisibility()
    processData()
  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
    error.value = err.message || 'Ошибка загрузки данных'
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 400)
  }
}

const togglePanel = () => { isOpen.value = !isOpen.value }
const closePanel = () => { isOpen.value = false }

const processedData = computed(() => {
  if (!salesData.value || !regions.value || !weeks.value) return null

  const allStores = []
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        allStores.push({
          ...store,
          regionId: region.id,
          regionName: region.name,
          regionColor: region.color
        })
      })
    }
  })
 
  const totalStores = allStores.length
  const totalRegions = regions.value.length
  const totalScore = allStores.reduce((sum, store) => sum + (store.overallTotalScore || 0), 0)
  const averageScore = totalStores > 0 ? Math.round(totalScore / totalStores) : 0

  let totalPlan = 0
  let totalFact = 0
  allStores.forEach(store => {
    weeks.value.forEach(week => {
      const weekData = store.weeklyData?.find(w => w.weekId === week.id)
      if (weekData) {
        totalPlan += weekData.plan || 0
        totalFact += weekData.fact || 0
      }
    })
  })
  const planExecutionPercent = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0

  const regionsWithScores = regions.value.map(region => {
    let regionScore = 0
    if (region.stores) {
      region.stores.forEach(store => {
        regionScore += store.overallTotalScore || 0
      })
    }
    return { ...region, score: regionScore }
  }).sort((a, b) => b.score - a.score).slice(0, 5)

  const topStores = [...allStores]
    .sort((a, b) => (b.overallTotalScore || 0) - (a.overallTotalScore || 0))
    .slice(0, KPITopStores.value)

  const problemStores = allStores.filter(store => (store.overallTotalScore || 0) < averageScore * 0.7).length
  const belowPlanStores = allStores.filter(store => {
    let storePlan = 0
    let storeFact = 0
    weeks.value.forEach(week => {
      const weekData = store.weeklyData?.find(w => w.weekId === week.id)
      if (weekData) {
        storePlan += weekData.plan || 0
        storeFact += weekData.fact || 0
      }
    })
    return storePlan > 0 && (storeFact / storePlan) < 0.95
  }).length

  return {
    totalStores,
    totalRegions,
    averageScore,
    planExecutionPercent,
    topRegions: regionsWithScores,
    topStores,
    problemStores,
    belowPlanStores,
  }
})

const handleKeydown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closePanel()
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  data: null,
  type: null,
  width: 0,
  height: 0
})

const showTooltip = (event, data, type, weekId, indicator) => {
  if (!tooltipEnabled.value) return
  const tooltipData = getTooltipData(data, weekId, indicator, type)
  tooltip.value = {
    visible: true,
    x: 0,
    y: 0,
    data: tooltipData,
    type: type,
    width: 0,
    height: 0
  }
  nextTick(() => {
    updateTooltipPosition(event)
  })
}

const updateTooltipPosition = (event) => {
  if (!tooltip.value.visible) return

  const tooltipElement = document.querySelector('.odx-tooltip')
  if (!tooltipElement) return
  
  const tooltipRect = tooltipElement.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  let x = event.clientX + 10
  let y = event.clientY + 10
  
  if (x + tooltipRect.width > windowWidth - 10) {
    x = event.clientX - tooltipRect.width - 10
  }
  if (y + tooltipRect.height > windowHeight - 10) {
    y = event.clientY - tooltipRect.height - 10
  }
  if (x < 10) x = 10
  if (y < 10) y = 10

  tooltip.value.x = x
  tooltip.value.y = y
  tooltip.value.width = tooltipRect.width
  tooltip.value.height = tooltipRect.height
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const getTooltipData = (entity, weekId, indicator, type) => {
  const weekData = type === 'store'
    ? getStoreWeekData(entity, weekId)
    : entity.weeklyData?.find(w => w.weekId === weekId) || {}

  const week = weeks.value.find(w => w.id === weekId)
  const indicatorConfig = availableIndicators.value.find(ind => ind.key === indicator)

  const result = {
    entityName: entity.name,
    weekName: week?.name || `Неделя ${weekId}`,
    indicator: indicatorConfig?.label || indicator,
    mainValue: getDisplayValue(weekData, indicator),
    details: []
  }

  if (weekData.plan !== undefined) {
    result.details.push({ label: 'План', value: formatNumber(weekData.plan || 0) })
  }
  if (weekData.fact !== undefined) {
    result.details.push({ label: 'Факт', value: formatNumber(weekData.fact || 0) })
  }
  if (weekData.percent !== undefined) {
    result.details.push({ label: 'Процент', value: `${weekData.percent || 0}%` })
  }

  return result
}

const getDisplayValue = (weekData, indicator) => {
  switch (indicator) {
    case 'totalScore':
    case 'turnover_score':
      return weekData[indicator] || '-'
    case 'plan':
    case 'fact':
      return formatNumber(weekData[indicator] || '-')
    case 'percent':
      return `${weekData.percent || 0}%`
    default:
      if (indicator.endsWith('_percent')) {
        return `${weekData[indicator] || 0}%`
      } else if (indicator.endsWith('_score')) {
        return weekData[indicator] || '-'
      } else {
        return formatNumber(weekData[indicator] || '-')
      }
  }
}

const darkColors = ref([
  '#2c3e50', '#34495e', '#1abc9c', '#16a085', '#27ae60', '#2ecc71',
  '#8e44ad', '#9b59b6', '#2980b9', '#3498db', '#e74c3c', '#c0392b',
  '#d35400', '#e67e22', '#f39c12', '#f1c40f', '#7f8c8d', '#95a5a6'
])

const selectedColor = ref('#1c699b')
const isPaletteOpen = ref(false)

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

const headerStyle = computed(() => ({
  backgroundColor: selectedColor.value,
  color: '#fff',
  borderCollapse: 'separate',
  borderSpacing: 0
}))

const changeColor = (color) => { selectedColor.value = color }
const togglePalette = () => { isPaletteOpen.value = !isPaletteOpen.value }
const closePalette = () => { isPaletteOpen.value = false }

const regionSortBy = ref({ weekId: 'week_1', columnKey: 'totalScore', direction: 'desc' })
const storeSortBy = ref({ weekId: 'week_1', columnKey: 'totalScore', direction: 'desc' })

const indicatorGroups = computed(() => {
  const groups = [
    {
      key: 'score',
      label: 'Заг. бал',
      indicators: [{ key: 'totalScore', label: `${planScore.value}` }]
    }
  ]

  if (targetsData.value?.targetTree) {
    Object.entries(targetsData.value.targetTree).forEach(([key, target]) => {
      if (key === 'turnover') {
        groups.push({
          key: 'turnover',
          label: 'Оборот',
          indicators: [
            { key: 'plan', label: 'План' },
            { key: 'fact', label: 'Факт' },
            { key: 'percent', label: '%' },
            { key: 'turnover_score', label: 'planScore.value' }
          ]
        })
      } else {
        groups.push({
          key: key,
          label: target.name,
          indicators: [
            { key: key, label: 'факт' },
            { key: `${key}_percent`, label: '%' },
            { key: `${key}_score`, label: 'Бал' }
          ]
        })
      }
    })
  } else {
    groups.push({
      key: 'turnover',
      label: 'Оборот',
      indicators: [
        { key: 'plan', label: 'План' },
        { key: 'fact', label: 'Факт' },
        { key: 'percent', label: '%' }
      ]
    })
  }

  return groups
})

const availableIndicators = computed(() => {
  const indicators = []
  indicatorGroups.value.forEach(group => {
    group.indicators.forEach(indicator => {
      indicators.push({
        ...indicator,
        groupKey: group.key,
        groupLabel: group.label
      })
    })
  })
  return indicators
})

const visible = reactive({})
const groupVisibility = reactive({})

const initializeVisibility = () => {
  indicatorGroups.value.forEach(group => {
    if (group.key === 'score') {
      groupVisibility[group.key] = true
    } else {
      groupVisibility[group.key] = false
    }
  })

  indicatorGroups.value.forEach(group => {
    group.indicators.forEach(indicator => {
      if (indicator.key === 'totalScore') {
        visible[indicator.key] = true
      } else if (indicator.key.includes('_score')) {
        visible[indicator.key] = true
      } else if (group.key === 'score') {
        visible[indicator.key] = true
      } else {
        visible[indicator.key] = groupVisibility[group.key] || false
      }
    })
  })
}

const toggleGroupVisibility = (groupKey) => {
  if (groupKey === 'score') return
  groupVisibility[groupKey] = !groupVisibility[groupKey]
  const group = indicatorGroups.value.find(g => g.key === groupKey)
  if (group) {
    group.indicators.forEach(indicator => {
      if (indicator.key.includes('_score') || indicator.key === 'totalScore') {
        visible[indicator.key] = true
      } else {
        visible[indicator.key] = groupVisibility[groupKey]
      }
    })
  }
}

const visibleIndicators = computed(() =>
  availableIndicators.value.filter(indicator => visible[indicator.key])
)

const visibleGroups = computed(() => {
  return indicatorGroups.value.map(group => ({
    ...group,
    indicators: group.indicators.filter(indicator => visible[indicator.key]),
    visibleCount: group.indicators.filter(indicator => visible[indicator.key]).length
  })).filter(group => group.visibleCount > 0)
})

const dynamicRowWidth = computed(() => {
  const total = visibleIndicators.value.length
  return total > 0 ? '100%' : '0%'
})

function getStyle(key) {
  const total = visibleIndicators.value.length
  const isVisible = visible[key]
  const width = isVisible ? `${100 / total}%` : '0%'
  
  return {
    width,
    transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
    willChange: 'transform',
    transformOrigin: 'left right',
    fontWeight: key === 'totalScore' ? '700' : 'normal',
    borderRight: isVisible ? '1px solid #ddd!important' : 'none!important',
  }
}

function getGroupStyle(groupKey) {
  const group = visibleGroups.value.find(g => g.key === groupKey)
  if (!group) return { width: '0%', transform: 'scaleX(0)' }

  const total = visibleIndicators.value.length
  const groupWidth = group.visibleCount > 0 ? `${(group.visibleCount / total) * 100}%` : '0%'

  return {
    width: groupWidth,
    transform: group.visibleCount > 0 ? 'scaleX(1)' : 'scaleX(0)',
    willChange: 'transform',
    transformOrigin: 'left right',
    background: group.visibleCount > 1 ? darkenColor(selectedColor.value, 13) : '',
  }
}

const processData = () => {
  if (!regions.value || !salesData.value || !targetsData.value) return
  
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        store.regionId = region.id
        store.regionName = region.name
        store.regionColor = region.color
      })
    }
  })
  
  const allStores = []
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        allStores.push(store)
      })
    }
  })
  
  salesData.value.weeks.forEach(week => {
    calculateWeeklyMetrics(week.id, allStores)
  })
  
  calculateRegionMetrics()
  calculateRegionColumnRanks()
  calculateOverallScores(allStores)
}

const calculateWeeklyMetrics = (weekId, allStores) => {
  const { targetTree, storeTargets } = targetsData.value

  allStores.forEach(store => {
    const weekData = getStoreWeekData(store, weekId)
    const storeTargetConfig = storeTargets[store.id] || {}
    weekData.percent = calculateTurnoverPercent(weekData.plan, weekData.fact)
    let weeklyScore = 0

    Object.entries(targetTree).forEach(([key, targetConfig]) => {
      if (key === 'turnover') return
      
      const targetPercent = storeTargetConfig[key] || 0
      const actualValue = weekData[key] || 0
      const target = targetPercent * weekData.fact
      let achievementPercent = 0
      
      if (target > 0) {
        if (targetConfig.type === 'negative') {
          achievementPercent = Math.min((target / actualValue) * 100, 200)
        } else {
          achievementPercent = (actualValue / target) * 100
        }
      }

      weekData[`${key}_percent`] = Math.round(achievementPercent)
      weekData[`${key}_target`] = target
    })

    Object.entries(targetTree).forEach(([key, targetConfig]) => {
      if (key === 'turnover') return
      
      const achievementPercent = weekData[`${key}_percent`] || 0
      const maxPercent = Math.max(...allStores.map(s => {
        const sWeekData = getStoreWeekData(s, weekId)
        return sWeekData[`${key}_percent`] || 0
      }))
      
      let score = 0
      if (maxPercent > 0) {
        score = Math.round((achievementPercent / maxPercent) * targetConfig.maxScore)
      }

      weekData[`${key}_score`] = score
      weeklyScore += score
    })

    weekData.totalScore = weeklyScore
  })

  if (targetTree.turnover) {
    const maxTurnoverPercent = Math.max(...allStores.map(store => {
      const weekData = getStoreWeekData(store, weekId)
      return weekData.percent || 0
    }))

    allStores.forEach(store => {
      const weekData = getStoreWeekData(store, weekId)
      const turnoverPercent = weekData.percent || 0
      let turnoverScore = 0
      
      if (maxTurnoverPercent > 0) {
        turnoverScore = Math.round((turnoverPercent / maxTurnoverPercent) * targetTree.turnover.maxScore)
      }

      weekData.turnover_score = turnoverScore
      weekData.totalScore = (weekData.totalScore || 0) + turnoverScore
    })
  } else {
    allStores.forEach(store => {
      const weekData = getStoreWeekData(store, weekId)
      const turnoverScore = Math.round(weekData.percent || 0)
      weekData.totalScore = (weekData.totalScore || 0) + turnoverScore
    })
  }
  
  calculateColumnRanks(weekId, allStores)
}

const calculateRegionMetrics = () => {
  if (!regions.value || !salesData.value || !targetsData.value) return
  
  const { targetTree, storeTargets } = targetsData.value
  
  salesData.value.weeks.forEach(week => {
    regions.value.forEach(region => {
      if (!region.stores) return
      
      if (!region.weeklyData) {
        region.weeklyData = []
      }

      let regionWeekData = region.weeklyData.find(w => w.weekId === week.id)
      if (!regionWeekData) {
        regionWeekData = { weekId: week.id }
        region.weeklyData.push(regionWeekData)
      }
      
      let totalPlan = 0
      let totalFact = 0
      
      region.stores.forEach(store => {
        const storeWeekData = getStoreWeekData(store, week.id)
        totalPlan += storeWeekData.plan || 0
        totalFact += storeWeekData.fact || 0
      })

      regionWeekData.plan = totalPlan
      regionWeekData.fact = totalFact
      regionWeekData.percent = calculateTurnoverPercent(totalPlan, totalFact)

      let totalScore = 0
      Object.entries(targetTree).forEach(([key, targetConfig]) => {
        if (key === 'turnover') {
          totalScore += regionWeekData.turnover_score || 0
        } else {
          totalScore += regionWeekData[`${key}_score`] || 0
        }
      })

      regionWeekData.totalScore = totalScore
    })
  })
}

const calculateOverallScores = (allStores) => {
  allStores.forEach(store => {
    let totalScore = 0
    salesData.value.weeks.forEach(week => {
      const weekData = getStoreWeekData(store, week.id)
      totalScore += weekData.totalScore || 0
    })
    store.overallTotalScore = totalScore
  })

  allStores.sort((a, b) => b.overallTotalScore - a.overallTotalScore)
  allStores.forEach((store, index) => {
    store.overallRank = index + 1
  })
}

const weeks = computed(() => {
  if (!salesData.value?.weeks) return []
  return [...salesData.value.weeks].sort((a, b) => b.id - a.id)
})

const calculateColumnRanks = (weekId, allStores) => {
  const indicators = availableIndicators.value.map(ind => ind.key)

  indicators.forEach(indicator => {
    const storesWithValues = allStores.map(store => {
      const weekData = getStoreWeekData(store, weekId)
      let value = 0

      switch (indicator) {
        case 'totalScore':
          value = weekData.totalScore || 0
          break
        case 'percent':
          value = weekData.percent || 0
          break
        case 'plan':
          value = weekData.plan || 0
          break
        case 'fact':
          value = weekData.fact || 0
          break
        default:
          value = weekData[indicator] || 0
          break
      }

      return { store, value, weekData }
    })
    
    storesWithValues.sort((a, b) => b.value - a.value)
    storesWithValues.forEach((item, index) => {
      if (!item.weekData.columnRanks) {
        item.weekData.columnRanks = {}
      }
      item.weekData.columnRanks[indicator] = index + 1
    })
  })
}

const calculateRegionColumnRanks = () => {
  if (!regions.value || !salesData.value) return

  salesData.value.weeks.forEach(week => {
    const indicators = availableIndicators.value.map(ind => ind.key)
    indicators.forEach(indicator => {
      const regionsWithValues = regions.value.map(region => {
        let value = getRegionIndicatorValue(region, week.id, indicator)
        return { region, value }
      })
      
      regionsWithValues.sort((a, b) => b.value - a.value)
      regionsWithValues.forEach((item, index) => {
        if (!item.region.columnRanks) {
          item.region.columnRanks = {}
        }
        if (!item.region.columnRanks[week.id]) {
          item.region.columnRanks[week.id] = {}
        }
        item.region.columnRanks[week.id][indicator] = index + 1
      })
    })
  })
}

const getRegionIndicatorValue = (region, weekId, indicator) => {
  const regionWeekData = region.weeklyData?.find(w => w.weekId === weekId)
  if (!regionWeekData) return 0
  return regionWeekData[indicator] || 0
}

const sortedRegions = computed(() => {
  if (!regions.value) return []
  let sorted = [...regions.value]
  
  sorted.forEach(region => {
    let totalScore = 0
    if (region.weeklyData) {
      region.weeklyData.forEach(weekData => {
        totalScore += weekData.totalScore || 0
      })
    }
    region.overallTotalScore = totalScore
  })

  sorted.sort((a, b) => {
    let aValue = 0
    let bValue = 0

    if (regionSortBy.value.columnKey === 'totalScore') {
      aValue = a.overallTotalScore
      bValue = b.overallTotalScore
    } else {
      aValue = getRegionIndicatorValue(a, regionSortBy.value.weekId, regionSortBy.value.columnKey)
      bValue = getRegionIndicatorValue(b, regionSortBy.value.weekId, regionSortBy.value.columnKey)
    }

    return regionSortBy.value.direction === 'desc' ? bValue - aValue : aValue - bValue
  })

  sorted.forEach((region, index) => {
    region.regionRank = index + 1
  })

  return sorted
})

const allStores = computed(() => {
  const stores = []

  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        stores.push({
          ...store,
          regionId: region.id,
          regionName: region.name,
          regionColor: region.color
        })
      })
    }
  })

  if (storeSortBy.value.columnKey && storeSortBy.value.weekId) {
    stores.sort((a, b) => {
      let aValue = getStoreSortValue(a, storeSortBy.value.weekId, storeSortBy.value.columnKey)
      let bValue = getStoreSortValue(b, storeSortBy.value.weekId, storeSortBy.value.columnKey)
      return storeSortBy.value.direction === 'desc' ? bValue - aValue : aValue - bValue
    })
  } else if (sortByTotalScore.value) {
    stores.sort((a, b) => (b.overallTotalScore) - (a.overallTotalScore))
  }

  return stores
})

const getStoreSortValue = (store, weekId, indicator) => {
  const weekData = getStoreWeekData(store, weekId)
  switch (indicator) {
    case 'totalScore': return weekData.totalScore || 0
    case 'percent': return weekData.percent || 0
    case 'plan': return weekData.plan || 0
    case 'fact': return weekData.fact || 0
    default: return weekData[indicator] || 0
  }
}

const handleStoreSort = (weekId, indicator) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === indicator) {
    storeSortBy.value.direction = storeSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    storeSortBy.value = { weekId, columnKey: indicator, direction: 'desc' }
  }
}

const getStoreSortIcon = (weekId, indicator) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === indicator) {
    return storeSortBy.value.direction === 'desc' ? '▼' : '▲'
  }
  return '↕'
}

const getStoreSortArrowClass = (weekId, indicator) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === indicator) {
    return storeSortBy.value.direction === 'desc' ? 'odx-sort-control--desc' : 'odx-sort-control--asc'
  }
  return 'odx-sort-control--inactive'
}

const handleRegionSort = (weekId, indicator) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === indicator) {
    regionSortBy.value.direction = regionSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    regionSortBy.value = { weekId, columnKey: indicator, direction: 'desc' }
  }
}

const getSortIcon = (weekId, indicator) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === indicator) {
    return regionSortBy.value.direction === 'desc' ? '▼' : '▲'
  }
  return '↕'
}

const getStoreWeekData = (store, weekId) => {
  if (!store || !store.weeklyData) {
    return { plan: 0, fact: 0, percent: 0, totalScore: 0 }
  }
  const weekData = store.weeklyData.find(w => w.weekId === weekId)
  return weekData || { plan: 0, fact: 0, percent: 0, totalScore: 0 }
}

const getStoreData = (store, weekId, indicator) => {
  const weekData = getStoreWeekData(store, weekId, indicator)

  switch (indicator) {
    case 'totalScore': return weekData.totalScore || '-'
    case 'plan': return formatNumber(weekData.plan)
    case 'fact': return formatNumber(weekData.fact)
    case 'percent': return weekData.percent ? `${weekData.percent}%` : '0%'
    case 'turnover_score': return weekData.turnover_score || '-'
    default:
      if (indicator.endsWith('_percent')) {
        return weekData[indicator] ? `${weekData[indicator]}%` : '0%'
      } else if (indicator.endsWith('_score')) {
        return weekData[indicator] || '-'
      } else {
        return formatNumber(weekData[indicator] || '-')
      }
  }
}

const getRegionData = (region, weekId, indicator) => {
  const value = getRegionIndicatorValue(region, weekId, indicator)

  switch (indicator) {
    case 'totalScore': return value
    case 'percent': return `${value}%`
    case 'plan':
    case 'fact': return formatNumber(value)
    case 'turnover_score': return value
    default:
      if (indicator.endsWith('_percent')) {
        return `${value}%`
      } else if (indicator.endsWith('_score')) {
        return value
      } else {
        return formatNumber(value)
      }
  }
}

const calculateTurnoverPercent = (plan, fact) => {
  if (!plan || plan === 0) return 0
  return Math.round((fact / plan) * 100)
}

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '-'
  }
  return new Intl.NumberFormat('UA', { maximumFractionDigits: 0 }).format(number)
}

const getStoreRowClass = (rank) => {
  if (rank <= 3) return 'odx-table__row--top-rank'
  if (rank <= 6) return 'odx-table__row--mid-rank'
  return 'odx-table__row--low-rank'
}

const getRegionRowClass = (regionRank) => {
  if (regionRank <= 2) return 'odx-table__row--region-top'
  if (regionRank <= 4) return 'odx-table__row--region-mid'
  return 'odx-table__row--region-low'
}

const getCellClass = (indicator, weekData, isRegion = false, weekId = null, region = null) => {
  const classes = []

  if (indicator === 'totalScore') {
    classes.push('odx-table__cell--score')
  }

  let rank = 0
  let totalItems = 0

  if (isRegion && region && weekId) {
    rank = region.columnRanks?.[weekId]?.[indicator] || 0
    totalItems = regions.value?.length || 0
  } else {
    rank = weekData.columnRanks?.[indicator] || 0
    totalItems = regions.value?.reduce((total, region) => {
      return total + (region.stores?.length || 0)
    }, 0) || 0
  }

  if (rank > 0 && totalItems > 0) {
    const percentile = (rank / totalItems) * 100
    if (indicator.endsWith('_score') || indicator === 'totalScore' ||
        indicator.endsWith('_percent') || indicator === 'percent') {
      
      if (percentile <= 20) {
        classes.push('odx-table__cell--percentile-top')
        if (formatter.value) { classes.push('odx-table__cell--formatted-top') }
      } else if (percentile <= 40) {
        classes.push('odx-table__cell--percentile-excellent')
        if (formatter.value) { classes.push('odx-table__cell--formatted-excellent') }
      } else if (percentile <= 60) {
        classes.push('odx-table__cell--percentile-good')
        if (formatter.value) { classes.push('odx-table__cell--formatted-good') }
      } else if (percentile <= 80) {
        classes.push('odx-table__cell--percentile-average')
        if (formatter.value) { classes.push('odx-table__cell--formatted-average') }
      } else {
        classes.push('odx-table__cell--percentile-poor')
        if (formatter.value) { classes.push('odx-table__cell--formatted-poor') }
      }
    }
  }

  return classes.join(' ')
}

const getIndicatorHeader = (indicator) => {
  if (indicator.key.endsWith('_score')) {
    const baseKey = indicator.key.replace('_score', '')
    if (baseKey === 'turnover' && targetsData.value?.targetTree?.turnover) {
      return targetsData.value.targetTree.turnover.maxScore.toString()
    } else if (targetsData.value?.targetTree?.[baseKey]) {
      return targetsData.value.targetTree[baseKey].maxScore.toString()
    }
    return 'Бал'
  }
  return indicator.label
}

const getRegionCellClass = (indicator, region, weekId) => {
  const regionWeekData = region.weeklyData?.find(w => w.weekId === weekId) || {}

  if (region.columnRanks && region.columnRanks[weekId]) {
    regionWeekData.columnRanks = { [indicator]: region.columnRanks[weekId][indicator] }
  }

  return getCellClass(indicator, regionWeekData, true, weekId, region)
}

const getSortArrowClass = (weekId, indicator) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === indicator) {
    return regionSortBy.value.direction === 'desc' ? 'odx-sort-arrow--desc' : 'odx-sort-arrow--asc'
  }
  return 'odx-sort-arrow--inactive'
}

const refreshData = async () => {
  await loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.odx-sales-dashboard {
  --odx-primary: #3b82f6;
  --odx-success: #10b981;
  --odx-warning: #f59e0b;
  --odx-danger: #ef4444;
  --odx-info: #6366f1;
  --odx-text: #1e293b;
  --odx-text-muted: #64748b;
  --odx-border: #e2e8f0;
  --odx-surface: #ffffff;
  --odx-surface-hover: #f8fafc;
  --odx-neutral: #f1f5f9;

  width: 100% !important;
  height: 100vh !important;
  overflow-y: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  background: var(--odx-neutral) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  position: relative !important;
  box-sizing: border-box !important;

  * {
    box-sizing: border-box !important;
  }

  .odx-palette-toggle {
    position: fixed !important;
    bottom: 10px !important;
    right: 10px !important;
    width: 20px !important;
    height: 20px !important;
    cursor: pointer !important;
    z-index: 1000 !important;
    border-radius: 4px !important;
    transition: transform 0.2s ease !important;

    &:hover {
      transform: scale(1.1) !important;
    }

    &--active {
      transform: scale(1.2) !important;
    }
  }

  .odx-color-palette {
    position: fixed !important;
    top: 0 !important;
    right: -300px !important;
    width: 280px !important;
    height: 100vh !important;
    background: var(--odx-surface) !important;
    border-left: 1px solid var(--odx-border) !important;
    z-index: 1001 !important;
    transition: right 0.3s ease !important;
    overflow-y: auto !important;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1) !important;

    &--open {
      right: 0 !important;
    }

    &__content {
      padding: 20px !important;
    }

    &__grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 12px !important;
      margin: 20px 0 !important;
    }
  }

  .odx-color-option {
    width: 32px !important;
    height: 32px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    border: 2px solid transparent !important;
    transition: all 0.2s ease !important;

    &:hover {
      transform: scale(1.1) !important;
    }

    &--selected {
      border-color: var(--odx-text) !important;
      box-shadow: 0 0 0 2px var(--odx-border) !important;
    }
  }

  .odx-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.3) !important;
    z-index: 1000 !important;
    cursor: pointer !important;
  }

  .odx-loading {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 3px !important;
    background: var(--odx-border) !important;
    z-index: 2000 !important;
    overflow: hidden !important;

    &__progress {
      height: 100% !important;
      background: var(--odx-primary) !important;
      animation: odx-loading 1.5s ease-in-out infinite !important;
    }
  }

  @keyframes odx-loading {
    0% { width: 0%; transform: translateX(-100%); }
    50% { width: 70%; transform: translateX(0%); }
    100% { width: 100%; transform: translateX(100%); }
  }

  .odx-error {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 400px !important;
    padding: 40px !important;
    margin: 20px !important;
    background: var(--odx-surface) !important;
    border-radius: 12px !important;
    border: 1px solid var(--odx-border) !important;

    &__icon {
      font-size: 48px !important;
      margin-bottom: 16px !important;
      color: var(--odx-warning) !important;
    }

    &__message {
      color: var(--odx-text) !important;
      font-size: 16px !important;
      text-align: center !important;
      margin-bottom: 16px !important;
    }

    &__retry {
      padding: 12px 20px !important;
      background: var(--odx-primary) !important;
      color: white !important;
      border: none !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;

      &:hover {
        background: #2563eb !important;
        transform: translateY(-1px) !important;
      }
    }
  }

  .odx-dashboard {
    padding: 20px !important;
    animation: odx-fadeIn 0.6s ease-out !important;
  }

  @keyframes odx-fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .odx-controls {
    display: flex !important;
    align-items: center !important;
    gap: 20px !important;
    padding: 16px 20px !important;
    background: var(--odx-surface) !important;
    border-radius: 8px !important;
    border: 1px solid var(--odx-border) !important;
    margin-bottom: 16px !important;

    &__refresh {
      padding: 8px 16px !important;
      border: 1px solid var(--odx-border) !important;
      background: var(--odx-surface) !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      transition: all 0.2s ease !important;

      &:hover:not(:disabled) {
        transform: translateY(-1px) !important;
      }

      &:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
    }
  }

  .odx-toggle {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    color: var(--odx-text-muted) !important;

    input[type="checkbox"] {
      display: none !important;
    }

    &__slider {
      width: 36px !important;
      height: 20px !important;
      background: var(--odx-border) !important;
      border-radius: 20px !important;
      position: relative !important;
      transition: all 0.3s ease !important;

      &::after {
        content: '' !important;
        position: absolute !important;
        width: 16px !important;
        height: 16px !important;
        background: white !important;
        border-radius: 50% !important;
        top: 2px !important;
        left: 2px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
      }
    }

    input[type="checkbox"]:checked + &__slider {
      background: var(--odx-primary) !important;

      &::after {
        transform: translateX(16px) !important;
      }
    }

    &__label {
      user-select: none !important;
      white-space: nowrap !important;
      color: var(--odx-text-muted) !important;
    }
  }

  .odx-table-container {
    background: var(--odx-surface) !important;
    border-radius: 12px !important;
    border: 1px solid var(--odx-border) !important;
    overflow: hidden !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  }

  .odx-table {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;

    &__header {
      position: sticky !important;
      top: 0 !important;
      z-index: 10 !important;
      background: var(--odx-surface) !important;
      border-bottom: 2px solid var(--odx-border) !important;
    }

    &__row {
      display: flex !important;
      width: 100% !important;
      border-bottom: 1px solid var(--odx-border) !important;
      transition: all 0.15s ease !important;
      will-change: transform !important;

      &:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        z-index: 5 !important;
        position: relative !important;
      }

      &--header-top,
      &--header-middle,
      &--header-bottom {
        &:hover {
          transform: none !important;
          box-shadow: none !important;
        }
      }

      // &--region {
      //   background: var(--odx-neutral) !important;
      //   font-weight: 600 !important;
      //   border-bottom: 2px solid var(--odx-border) !important;
      // }

      // &--store {
      //   background: var(--odx-surface) !important;
      // }

      // &--top-rank {
      //   background: #ecfdf5 !important;
      //   border-left: 4px solid var(--odx-success) !important;
      // }

      // &--mid-rank {
      //   background: #fffbeb !important;
      //   border-left: 4px solid var(--odx-warning) !important;
      // }

      // &--low-rank {
      //   background: #fef2f2 !important;
      //   border-left: 4px solid var(--odx-danger) !important;
      // }

      // &--region-top {
      //   background: #ecfdf5 !important;
      //   border-left: 6px solid var(--odx-success) !important;
      // }

      // &--region-mid {
      //   background: #fffbeb !important;
      //   border-left: 6px solid var(--odx-warning) !important;
      // }

      // &--region-low {
      //   background: #fef2f2 !important;
      //   border-left: 6px solid var(--odx-danger) !important;
      // }
    }

    &__cell {
      height: 32px !important;
      padding: 6px 0px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 13px !important;
      border-right: 1px solid var(--odx-border) !important;
      text-align: center !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      transition: transform 1.2s ease !important;
      will-change: transform !important;

      &--static {
        min-width: 230px !important;
        flex-shrink: 0 !important;
        background: var(--odx-neutral) !important;
        font-weight: 600 !important;
        border-right: 2px solid var(--odx-border) !important;
        justify-content: flex-start !important;
        padding-left: 16px !important;
      }

      &--group {
        background: #eef2ff !important;
        color: var(--odx-info) !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        border-bottom: 2px solid var(--odx-info) !important;
      }

      &--group-header {
        background: var(--odx-surface) !important;
        font-size: 13px !important;
        color: var(--odx-text-muted) !important;
        cursor: pointer !important;

        &:hover {
          background: #0d598a !important;
          color: white !important;
        }
      }

      &--metric {
        background: var(--odx-surface) !important;
        font-size: 12px !important;
        color: var(--odx-text-muted) !important;
        cursor: pointer !important;

        &:hover {
          background: #0d598a !important;
          color: white !important;
        }
      }

      &--data {
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--odx-text) !important;
      }

      &--score {
        font-weight: 700 !important;
        color: var(--odx-primary) !important;
      }

      &--percentile-top {
        color: #2e7d32 !important;
        font-weight: 600 !important;
      }

      &--percentile-excellent {
        color: #2e7d32 !important;
        font-weight: 600 !important;
      }

      &--percentile-good {
        color: #f57c00 !important;
        font-weight: 600 !important;
      }

      &--percentile-average {
        color: #ea580c !important;
        font-weight: 600 !important;
      }

      &--percentile-poor {
        color: #dc2626 !important;
        font-weight: 600 !important;
      }

      &--formatted-top {
        background-color: #d0ffea !important;
        color: white !important;
      }

      &--formatted-excellent {
        background-color: #ebfff6 !important;
        color: #2e7d32 !important;
      }

      &--formatted-good {
        background-color: #fff3e1 !important;
        color: #f57c00 !important;
      }

      &--formatted-average {
        background-color: #fee7c5 !important;
        color: #ea580c !important;
      }

      &--formatted-poor {
        background-color: #ffdada !important;
        color: white !important;
      }
    }

    &__data {
      display: flex !important;
      width: 100% !important;
    }

    &__body {
      background: var(--odx-surface) !important;
    }
  }

  .odx-week {
    display: flex !important;
    width: 100% !important;
    border-right: 2px solid var(--odx-border) !important;

    &__name {
      font-weight: 600 !important;
      color: var(--odx-info) !important;
      padding: 12px !important;
      text-align: center !important;
      font-size: 14px !important;
      margin: 0 !important;
    }

    &__groups,
    &__columns {
      width: 100% !important;
      display: flex !important;
    }
  }

  .odx-group-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    padding: 4px 0px !important;

  }

  .odx-metric-header {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    width: 100% !important;
  }

  .odx-sort-arrow {
    font-size: 10px !important;
    opacity: 0.6 !important;
    transition: all 0.2s ease !important;

    &--active {
      opacity: 1 !important;
      color: var(--odx-primary) !important;
      font-weight: bold !important;
    }

    &--desc {
      color: var(--odx-danger) !important;
    }

    &--asc {
      color: var(--odx-success) !important;
    }

    &--inactive {
      opacity: 0.3 !important;
    }
  }

  .odx-region-info,
  .odx-store-info {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;

    &__indicator {
      width: 10px !important;
      height: 10px !important;
      border-radius: 50% !important;
      flex-shrink: 0 !important;
      border: 1px solid rgba(255, 255, 255, 0.8) !important;
    }

    &__title,
    &__name {
      font-weight: 600 !important;
      color: var(--odx-text) !important;
      font-size: 14px !important;
    }

    &__region {
      font-size: 12px !important;
      color: var(--odx-text-muted) !important;
      font-weight: 400 !important;
    }
  }

  .odx-separator {
    height: 16px !important;
    background: var(--odx-neutral) !important;
    border-top: 1px solid var(--odx-border) !important;
    border-bottom: 1px solid var(--odx-border) !important;
  }

  .odx-sort-controls {
    display: flex !important;
    flex-direction: column !important;

    &__row {
      display: flex !important;
      width: 100% !important;
      align-items: center !important;
    }

    &__static {
      min-width: 230px !important;
      flex-shrink: 0 !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      color: var(--odx-text-muted) !important;
    }

    &__weeks {
      display: flex !important;
      width: 100% !important;
    }
  }

  .odx-sort-week {
    display: flex !important;
    width: 100% !important;
    border-right: 1px solid var(--odx-border) !important;

    &__columns {
      width: 100% !important;
      display: flex !important;
    }
  }

  .odx-sort-control {
    padding: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    transition: all 0.2s ease !important;
    border: 1px solid transparent !important;

    &:hover {
      background: var(--odx-surface-hover) !important;
      border-color: var(--odx-border) !important;
    }

    &--desc,
    &--asc {
      background: var(--odx-primary) !important;
      color: white !important;
      border-color: var(--odx-primary) !important;
    }

    &--inactive {
      opacity: 0.5 !important;
    }
  }

  .odx-tooltip {
    position: fixed !important;
    z-index: 10000 !important;
    background: var(--odx-surface) !important;
    border: 1px solid var(--odx-border) !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
    padding: 16px !important;
    min-width: 250px !important;
    max-width: 400px !important;
    pointer-events: none !important;
    font-size: 13px !important;
    animation: odx-tooltipFadeIn 0.2s ease-out !important;

    &__header {
      padding-bottom: 8px !important;
      border-bottom: 1px solid var(--odx-border) !important;
      margin-bottom: 8px !important;
    }

    &__title {
      font-weight: 600 !important;
      color: var(--odx-text) !important;
      font-size: 14px !important;
    }

    &__subtitle {
      font-size: 12px !important;
      color: var(--odx-text-muted) !important;
      margin-top: 2px !important;
    }

    &__main {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: var(--odx-primary) !important;
      text-align: center !important;
      padding: 8px !important;
      background: #eef2ff !important;
      border-radius: 6px !important;
      margin-bottom: 8px !important;
    }

    &__details {
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
    }

    &__detail {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 2px 0 !important;

      &-label {
        color: var(--odx-text-muted) !important;
        font-size: 12px !important;
      }

      &-value {
        font-weight: 600 !important;
        color: var(--odx-text) !important;
        font-size: 12px !important;
      }
    }
  }

  @keyframes odx-tooltipFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .odx-tooltip-trigger {
    cursor: help !important;

    &:hover {
      background: rgba(59, 130, 246, 0.05) !important;
    }
  }

  .odx-kpi {
    &__toggle {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 1000 !important;
      background: white !important;
      border: none !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s ease !important;
      padding: 8px !important;

      &:hover {
        background: #2c3e50 !important;
        transform: translateY(-1px) !important;
      }
    }

    &__icon {
      width: 40px !important;
      height: 40px !important;
      border: 1px solid #2c3e50 !important;
      border-radius: 6px !important;
    }

    &__overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 1001 !important;
      background: rgba(0, 0, 0, 0.3) !important;
      backdrop-filter: blur(4px) !important;
    }

    &__sidebar {
      position: fixed !important;
      top: 0 !important;
      right: -420px !important;
      width: 420px !important;
      height: 100vh !important;
      background: white !important;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1) !important;
      z-index: 1002 !important;
      transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
      display: flex !important;
      flex-direction: column !important;

      &--open {
        right: 0 !important;
      }
    }

    &__header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 20px 24px !important;
      border-bottom: 2px solid var(--odx-border) !important;
      background: var(--odx-neutral) !important;

      h2 {
        margin: 0 !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--odx-text) !important;
      }
    }

    &__close {
      width: 32px !important;
      height: 32px !important;
      border: none !important;
      background: var(--odx-border) !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      color: var(--odx-text-muted) !important;
      font-size: 16px !important;
      transition: all 0.2s ease !important;

      &:hover {
        background: #fef2f2 !important;
        color: var(--odx-danger) !important;
        transform: scale(1.1) !important;
      }
    }

    &__content {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 24px !important;

      &::-webkit-scrollbar {
        width: 6px !important;
      }

      &::-webkit-scrollbar-track {
        background: var(--odx-border) !important;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--odx-text-muted) !important;
        border-radius: 3px !important;
      }
    }

    &__section {
      margin-bottom: 32px !important;

      h3 {
        margin: 0 0 16px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--odx-text) !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }
    }

    &__cards {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
      margin-bottom: 16px !important;
    }

    &__card {
      padding: 16px !important;
      border-radius: 8px !important;
      text-align: center !important;
      border: 2px solid transparent !important;
      transition: all 0.3s ease !important;

      &:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }

      &--primary {
        background: #eef2ff !important;
        border-color: var(--odx-info) !important;
      }

      &--success {
        background: #ecfdf5 !important;
        border-color: var(--odx-success) !important;
      }

      &--warning {
        background: #fffbeb !important;
        border-color: var(--odx-warning) !important;
      }

      &--danger {
        background: #fef2f2 !important;
        border-color: var(--odx-danger) !important;
      }

      &--info {
        background: var(--odx-neutral) !important;
        border-color: var(--odx-border) !important;
      }
    }

    &__value {
      font-size: 24px !important;
      font-weight: 700 !important;
      color: var(--odx-text) !important;
      margin-bottom: 4px !important;
    }

    &__label {
      font-size: 12px !important;
      font-weight: 500 !important;
      color: var(--odx-text-muted) !important;
    }

    &__list {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }

    &__item {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 12px 16px !important;
      background: var(--odx-surface-hover) !important;
      border-radius: 8px !important;
      border: 1px solid var(--odx-border) !important;
      transition: all 0.2s ease !important;

      &:hover {
        background: var(--odx-surface) !important;
        border-color: var(--odx-text-muted) !important;
        transform: translateX(4px) !important;
      }

      &--rank-1 {
        background: #ecfdf5 !important;
        border-color: var(--odx-success) !important;
      }

      &--rank-2 {
        background: #fffbeb !important;
        border-color: var(--odx-warning) !important;
      }

      &--rank-3 {
        background: #eef2ff !important;
        border-color: var(--odx-info) !important;
      }
    }

    &__rank {
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: 700 !important;
      font-size: 12px !important;
      color: white !important;
      background: var(--odx-text-muted) !important;
      flex-shrink: 0 !important;
    }

    &__item--rank-1 &__rank {
      background: var(--odx-success) !important;
    }

    &__item--rank-2 &__rank {
      background: var(--odx-warning) !important;
    }

    &__item--rank-3 &__rank {
      background: var(--odx-info) !important;
    }

    &__score {
      font-weight: 700 !important;
      color: var(--odx-primary) !important;
      font-size: 14px !important;
      flex-shrink: 0 !important;
    }
  }

  @media (max-width: 1024px) {
    .odx-kpi__sidebar {
      width: 360px !important;
    }
  }

  @media (max-width: 768px) {
    .odx-kpi__sidebar {
      width: 100vw !important;
    }

    .odx-kpi__content {
      padding: 16px !important;
    }

    .odx-kpi__cards {
      grid-template-columns: 1fr !important;
    }

    .odx-dashboard {
      padding: 10px !important;
    }

    .odx-table__cell--static {
      min-width: 230px !important;
    }
  }
}
</style>


