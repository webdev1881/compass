<template>
  <div class="sales-table-container table-container">
    <KPISidebar :salesData="salesData" :targetsData="targetsData" :regions="regions" :weeks="weeks" />
    <img :class="{ active: isPaletteOpen }" class="toggle-button" @click="togglePalette"
      src="https://toppng.com/uploads/preview/the-icon-is-shaped-like-an-oval-that-slightly-resembles-paint-palette-icon-11553394861oazcgcebd1.png"
      alt="">

    <div class="color-palette-sidebar" :class="{ open: isPaletteOpen }">
      <div class="palette-content">
        <h3>Палитра цветов:</h3>
        <div class="color-grid">
          <div v-for="color in darkColors" :key="color" class="color-option"
            :class="{ selected: selectedColor === color }" :style="{ backgroundColor: color }"
            @click="changeColor(color)" :title="color" />
        </div>
      </div>
    </div>
    <div v-if="isPaletteOpen" class="overlay" @click="closePalette"></div>
    <div v-if="loading" class="loading-bar">
      <div class="loading-progress"></div>
    </div>

    <div v-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div>{{ error }}</div>
      <button class="retry-btn" @click="refreshData">Попробовать снова</button>
    </div>

    <div v-if="!loading && !error" class="content">
      <div class="controls-panel">
        <button :style="headerStyle" class="refresh-btn" @click="refreshData" :disabled="loading">
          Обновить
        </button>
        <div class="tooltip-controls">
          <label class="tooltip-toggle">
            <input type="checkbox" v-model="tooltipEnabled" />
            <span class="toggle-slider" :style="headerStyle"></span>
            <span class="toggle-label">Детали</span>
          </label>
        </div>
      </div>

      <div class="custom-table">
        <div class="table">
          <div class="table-header" :style="headerStyle">
            <div class="row header top">
              <div class="cell static header-cell store-name-column">Регион / Магазин</div>
              <div class="cell group week-group" :style="{ width: dynamicRowWidth }">
                <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                  <h3 class="week_name">{{ week.name }} ({{ week.dateRange }})</h3>
                </div>
              </div>
            </div>

            <div class="row header middle">
              <div class="cell static header-cell"></div>
              <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                <div class="group-cols">

                  <div v-for="group in visibleGroups" :key="group.key + weekIndex"
                    class="cell dynamic header-cell group-header" :style="getGroupStyle(group.key, weekIndex)">
                    <div @click="toggleGroupVisibility(group.key)" class="group-content">
                      <span>{{ group.label }}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div class="row header bottom">
              <div class="cell static header-cell"></div>
              <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                <div class="cols">
                  <div v-for="indicator in availableIndicators" :key="indicator.key + weekIndex"
                    class="cell dynamic header-cell metric-header sortable-header"
                    :style="getStyle(indicator.key, weekIndex)" @click="handleRegionSort(week.id, indicator.key)">
                    <div class="header-content">
                      <span v-html="getIndicatorHeader(indicator)"></span>
                      <span class="sort-arrow" :class="getSortArrowClass(week.id, indicator.key)">
                        {{ getSortIcon(week.id, indicator.key) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-body">
            <div class="regions-summary-block">
              <transition-group name="table-row" tag="div">
                <div v-for="region in sortedRegions" :key="`region-summary-${region.id}`"
                  class="row region-row region-summary data-row" :class="getRegionRowClass(region.regionRank)">
                  <div class="cell static data-cell region-name">
                    <div class="region-info">
                      <div class="region-indicator" :style="{ backgroundColor: region.color }"></div>
                      <span class="region-title">{{ region.name }}</span>
                    </div>
                  </div>
                  <div class="data_cells">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                      <div class="cols">
                        <div v-for="indicator in availableIndicators"
                          :key="`region-summary-${region.id}-${week.id}-${indicator.key}`"
                          class="cell dynamic data-cell region-total tooltip-trigger"
                          :class="getRegionCellClass(indicator.key, region, week.id)"
                          :style="getStyle(indicator.key, weekIndex)"
                          @mouseenter="showTooltip($event, region, 'region', week.id, indicator.key)"
                          @mouseleave="hideTooltip" @mousemove="updateTooltipPosition">
                          {{ getRegionData(region, week.id, indicator.key) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <div class="table-separator">
              <div class="store-sort-controls">
                <div class="sort-controls-row">
                  <div class="sort-static-cell"></div>
                  <!-- <div class="sort-static-cell">Сортировка магазинов:</div> -->
                  <div class="sort-weeks">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="sort-week">
                      <div class="sort-cols">
                        <div v-for="indicator in availableIndicators" :key="`store-sort-${week.id}-${indicator.key}`"
                          class="sort-control sortable-control" :class="getStoreSortArrowClass(week.id, indicator.key)"
                          :style="getStyle(indicator.key, weekIndex)"
                          :title="`Сортировать магазины по ${indicator.label.replace(/<br>/g, ' ')} (${week.name})`"
                          @click="handleStoreSort(week.id, indicator.key)">
                          <span class="sort-arrow">
                            {{ getStoreSortIcon(week.id, indicator.key) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <transition-group name="table-row" tag="div">
              <div v-for="store in allStores" :key="`store-${store.id}`" class="row store-row data-row"
                :class="getStoreRowClass(store.overallRank)">
                <div class="cell static data-cell store-name">
                  <div class="store-info">
                    <div class="store-region-indicator" :style="{ backgroundColor: store.regionColor }"></div>
                    <span class="store-title">{{ store.name }}</span>
                  </div>
                </div>
                <div class="data_cells">
                  <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                    <div class="cols">
                      <div v-for="indicator in availableIndicators"
                        :key="`store-${store.id}-${week.id}-${indicator.key}`"
                        class="cell dynamic data-cell tooltip-trigger"
                        :class="[getCellClass(indicator.key, getStoreWeekData(store, week.id), false), indicator.key]"
                        :style="getStyle(indicator.key, weekIndex)"
                        @mouseenter="showTooltip($event, store, 'store', week.id, indicator.key)"
                        @mouseleave="hideTooltip" @mousemove="updateTooltipPosition">
                        {{ getStoreData(store, week.id, indicator.key) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>

    <!-- КПИ -->
    <KPISidebar :salesData="salesData" :targetsData="targetsData" :regions="regions" :weeks="weeks" />
    <!-- Тултип -->
    <div v-if="tooltip.visible && tooltip.data" ref="tooltipRef" class="custom-tooltip" :style="{
      left: tooltip.x + 'px',
      top: tooltip.y + 'px',
      opacity: tooltip.x === 0 && tooltip.y === 0 ? 0 : 1
    }">
      <div class="tooltip-header">
        <div class="tooltip-title">{{ tooltip.data.entityName }}</div>
        <div class="tooltip-subtitle">{{ tooltip.data.weekName }} • {{ tooltip.data.indicator }}</div>
      </div>

      <div class="tooltip-main-value">
        {{ tooltip.data.mainValue }}
      </div>

      <div class="tooltip-details">
        <div v-for="detail in tooltip.data.details" :key="detail.label" class="tooltip-detail-row">
          <span class="detail-label">{{ detail.label }}:</span>
          <span class="detail-value">{{ detail.value }}</span>
        </div>
      </div>
    </div>
  </div>


  


</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import KPISidebar from './KPISidebar.vue'

const loading = ref(true)
const error = ref(null)
const salesData = ref(null)
const targetsData = ref(null)
const sortByTotalScore = ref(true)
const regions = ref([])
const tooltipEnabled = ref(false)

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  data: null,
  type: null,
  width: 0,
  height: 0
})
// тултип
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

  const tooltipElement = document.querySelector('.custom-tooltip')
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
  const currentGroup = indicatorGroups.value.find(group =>
    group.indicators.some(ind => ind.key === indicator)
  )

  const result = {
    entityName: entity.name,
    weekName: week?.name || `Неделя ${weekId}`,
    groupName: currentGroup?.label || 'Показатели',
    indicator: indicatorConfig?.label || indicator,
    mainValue: getDisplayValue(weekData, indicator),
    details: []
  }

  if (currentGroup) {
    if (currentGroup.key === 'score') {
      result.details.push({
        label: 'Общий балл',
        value: weekData.totalScore || 0
      })
    } else if (currentGroup.key === 'turnover') {
      result.details.push(
        { label: 'План', value: formatNumber(weekData.plan || 0) },
        {
          label: 'Факт',
          value: `${formatNumber(weekData.fact || 0)} (${weekData.percent || 0}% от плана)`
        },
        { label: 'Процент оборота', value: `${weekData.percent || 0}%` }
      )

      if (weekData.turnover_score !== undefined) {
        const maxScore = targetsData.value?.targetTree?.turnover?.maxScore || 100
        result.details.push({
          label: `Балл за оборот (из ${maxScore})`,
          value: weekData.turnover_score || 0
        })
      }
    } else {
      const groupKey = currentGroup.key
      const target = targetsData.value?.targetTree?.[groupKey]

      if (target) {
        const value = weekData[groupKey] || 0
        const percent = weekData[`${groupKey}_percent`] || 0
        const score = weekData[`${groupKey}_score`] || 0
        const targetValue = weekData[`${groupKey}_target`] || 0
        const factValue = weekData.fact || 0
        const planValue = factValue > 0 ? targetValue : 0

        result.details.push(
          { label: `${target.name} (значение)`, value: formatNumber(value) },
          {
            label: `Расчетный план`,
            value: ` ${formatNumber(planValue)} (${((targetValue / factValue) * 100).toFixed(2)}% от факта)`
          },
          {
            label: 'Факт оборота →  ',
            value: `${formatNumber(factValue)}`
          },
          {
            label: ` план ${target.name.toLowerCase()}`,
            value: `${formatNumber(targetValue)}`
          },
          { label: `Процент выполнения`, value: `${percent}%` },
          {
            label: `Балл (из ${target.maxScore})`,
            value: `${score} / ${target.maxScore}`
          }
        )
      }
    }
  }

  if (weekData.columnRanks && weekData.columnRanks[indicator]) {
    const totalItems = type === 'store'
      ? regions.value?.reduce((total, region) => total + (region.stores?.length || 0), 0) || 0
      : regions.value?.length || 0

    result.details.push({
      label: 'Ранг по показателю',
      value: `${weekData.columnRanks[indicator]} из ${totalItems}`
    })
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
// cмк
const selectedColor = ref('#1c699b')
// const selectedColor = ref('#2c3e50')

const isPaletteOpen = ref(false)


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

const darkerColor = computed(() => {
  return darkenColor(selectedColor.value)
})

const headerStyle = computed(() => {
  return {
    backgroundColor: selectedColor.value,
    color: '#fff',
    borderCollapse: 'separate',
    borderSpacing: 0
  }
})

const changeColor = (color) => {
  selectedColor.value = color
}

const togglePalette = () => {
  isPaletteOpen.value = !isPaletteOpen.value
}

const closePalette = () => {
  isPaletteOpen.value = false
}

const regionSortBy = ref({ weekId: 2, columnKey: 'totalScore', direction: 'desc' })
const storeSortBy = ref({ weekId: 2, columnKey: 'totalScore', direction: 'asc' })
const indicatorGroups = computed(() => {
  const groups = [
    {
      key: 'score',
      label: 'Общий балл',
      indicators: [
        { key: 'totalScore', label: 'Балл' }
      ]
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
            { key: 'turnover_score', label: 'Балл' }
          ]
        })
      } else {
        console.log(target);

        groups.push({
          key: key,
          label: target.name,
          indicators: [
            { key: key, label: 'факт' },
            { key: `${key}_percent`, label: '%' },
            { key: `${key}_score`, label: 'Балл' }
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
const initializeGroupVisibility = () => {
  indicatorGroups.value.forEach(group => {
    if (group.key === 'score') {
      groupVisibility[group.key] = true
    } else {
      groupVisibility[group.key] = false
    }
  })
}
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

function getStyle(key, weekIndex) {
  const total = visibleIndicators.value.length
  const isVisible = visible[key]
  const width = isVisible ? `${100 / total}%` : '0%'
  return {
    width,
    opacity: isVisible ? 1 : 0,
    transition: 'width 0.3s ease, opacity 0.3s ease',
    overflow: 'hidden',
    borderRight: isVisible ? '1px solid #ddd' : 'none',
  }
}

function getGroupStyle(groupKey, weekIndex) {
  const group = visibleGroups.value.find(g => g.key === groupKey)
  if (!group) return { width: '0%', opacity: 0 }

  const total = visibleIndicators.value.length
  const groupWidth = group.visibleCount > 0 ? `${(group.visibleCount / total) * 100}%` : '0%'

  return {
    width: groupWidth,
    opacity: group.visibleCount > 0 ? 1 : 0,
    transition: 'width 0.3s ease, opacity 0.3s ease',
    overflow: 'hidden',
  }
}

const onIndicatorToggle = () => {
  //стили
}

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
  calculateOverallScores(allStores)
  calculateRegionMetrics()
  calculateRegionColumnRanks()
}

const calculateWeeklyMetrics = (weekId, allStores) => {
  const { targetTree, storeTargets } = targetsData.value

  allStores.forEach(store => {
    const weekData = getStoreWeekData(store, weekId)
    const storeTargetConfig = storeTargets[store.id] || {}
    weekData.percent = calculateTurnoverPercent(weekData.plan, weekData.fact)
    let weeklyScore = 0

    Object.entries(targetTree).forEach(([key, targetConfig]) => {
      if (key === 'turnover') {
        //
        return
      }
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
      if (key === 'turnover') {
        return
      }
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

      Object.entries(targetTree).forEach(([key, targetConfig]) => {
        if (key === 'turnover') return
        let totalValue = 0
        let totalTarget = 0
        region.stores.forEach(store => {
          const storeWeekData = getStoreWeekData(store, week.id)
          const storeTargetConfig = storeTargets[store.id] || {}
          const targetPercent = storeTargetConfig[key] || 0

          totalValue += storeWeekData[key] || 0
          totalTarget += targetPercent * (storeWeekData.fact || 0)
        })

        regionWeekData[key] = totalValue

        let achievementPercent = 0
        if (totalTarget > 0) {
          if (targetConfig.type === 'negative') {
            achievementPercent = Math.min((totalTarget / totalValue) * 100, 200)
          } else {
            achievementPercent = (totalValue / totalTarget) * 100
          }
        }

        regionWeekData[`${key}_percent`] = Math.round(achievementPercent)
        regionWeekData[`${key}_target`] = totalTarget
      })
    })

    Object.entries(targetTree).forEach(([key, targetConfig]) => {
      if (key === 'turnover') return
      const maxPercent = Math.max(...regions.value.map(region => {
        const regionWeekData = region.weeklyData?.find(w => w.weekId === week.id)
        return regionWeekData?.[`${key}_percent`] || 0
      }))

      regions.value.forEach(region => {
        const regionWeekData = region.weeklyData?.find(w => w.weekId === week.id)
        if (!regionWeekData) return

        const achievementPercent = regionWeekData[`${key}_percent`] || 0
        let score = 0
        if (maxPercent > 0) {
          score = Math.round((achievementPercent / maxPercent) * targetConfig.maxScore)
        }
        regionWeekData[`${key}_score`] = score
      })
    })

    if (targetTree.turnover) {
      const maxTurnoverPercent = Math.max(...regions.value.map(region => {
        const regionWeekData = region.weeklyData?.find(w => w.weekId === week.id)
        return regionWeekData?.percent || 0
      }))

      regions.value.forEach(region => {
        const regionWeekData = region.weeklyData?.find(w => w.weekId === week.id)
        if (!regionWeekData) return

        const turnoverPercent = regionWeekData.percent || 0
        let turnoverScore = 0
        if (maxTurnoverPercent > 0) {
          turnoverScore = Math.round((turnoverPercent / maxTurnoverPercent) * targetTree.turnover.maxScore)
        }
        regionWeekData.turnover_score = turnoverScore
      })
    }

    regions.value.forEach(region => {
      const regionWeekData = region.weeklyData?.find(w => w.weekId === week.id)
      if (!regionWeekData) return

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
    stores.sort((a, b) => (b.overallTotalScore || 0) - (a.overallTotalScore || 0))
  }

  return stores
})

const getStoreSortValue = (store, weekId, indicator) => {
  const weekData = getStoreWeekData(store, weekId)

  switch (indicator) {
    case 'totalScore':
      return weekData.totalScore || 0
    case 'percent':
      return weekData.percent || 0
    case 'plan':
      return weekData.plan || 0
    case 'fact':
      return weekData.fact || 0
    default:
      return weekData[indicator] || 0
  }
}

const handleStoreSort = (weekId, indicator) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === indicator) {
    storeSortBy.value.direction = storeSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    storeSortBy.value = {
      weekId,
      columnKey: indicator,
      direction: 'desc'
    }
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
    return storeSortBy.value.direction === 'desc' ? 'sort-active sort-desc' : 'sort-active sort-asc'
  }
  return 'sort-inactive'
}

const handleRegionSort = (weekId, indicator) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === indicator) {
    regionSortBy.value.direction = regionSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    regionSortBy.value = {
      weekId,
      columnKey: indicator,
      direction: 'desc'
    }
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
    return {
      plan: 0, fact: 0, percent: 0, totalScore: 0,
      losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0
    }
  }

  const weekData = store.weeklyData.find(w => w.weekId === weekId)
  return weekData || {
    plan: 0, fact: 0, percent: 0, totalScore: 0,
    losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0
  }
}

const getStoreData = (store, weekId, indicator) => {
  const weekData = getStoreWeekData(store, weekId)

  switch (indicator) {
    case 'totalScore':
      return weekData.totalScore || '-'
    case 'plan':
      return formatNumber(weekData.plan)
    case 'fact':
      return formatNumber(weekData.fact)
    case 'percent':
      return weekData.percent ? `${weekData.percent}%` : '0%'
    case 'turnover_score':
      return weekData.turnover_score || '-'
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
    case 'totalScore':
      return value
    case 'percent':
      return `${value}%`
    case 'plan':
    case 'fact':
      return formatNumber(value)
    case 'turnover_score':
      return value
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
  if (rank <= 3) return 'top-rank'
  if (rank <= 6) return 'mid-rank'
  return 'low-rank'
}

const getRegionRowClass = (regionRank) => {
  if (regionRank <= 2) return 'region-top-rank'
  if (regionRank <= 4) return 'region-mid-rank'
  return 'region-low-rank'
}

const getCellClass = (indicator, weekData, isRegion = false, weekId = null, region = null) => {
  const classes = []

  if (indicator === 'totalScore') {
    classes.push('score-cell')
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
        classes.push('percentile-top')        // Топ 20%
      } else if (percentile <= 40) {
        classes.push('percentile-excellent')  // 20-40%
      } else if (percentile <= 60) {
        classes.push('percentile-good')       // 40-60%
      } else if (percentile <= 80) {
        classes.push('percentile-average')    // 60-80%
      } else {
        classes.push('percentile-poor')       // 80-100%
      }
    } else {
      if (percentile <= 20) {
        classes.push('column-rank-top')
      } else if (percentile <= 40) {
        classes.push('column-rank-good')
      } else if (percentile <= 60) {
        classes.push('column-rank-average')
      } else if (percentile <= 80) {
        classes.push('column-rank-below')
      } else {
        classes.push('column-rank-poor')
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
    return 'Балл'
  }
  return indicator.label
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

const getRegionCellClass = (indicator, region, weekId) => {
  const regionWeekData = region.weeklyData?.find(w => w.weekId === weekId) || {}

  if (region.columnRanks && region.columnRanks[weekId]) {
    regionWeekData.columnRanks = { [indicator]: region.columnRanks[weekId][indicator] }
  }

  return getCellClass(indicator, regionWeekData, true, weekId, region)
}

const toggleSortByTotalScore = () => {
  sortByTotalScore.value = !sortByTotalScore.value
}

const getSortArrowClass = (weekId, indicator) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === indicator) {
    return regionSortBy.value.direction === 'desc' ? 'sort-active sort-desc' : 'sort-active sort-asc'
  }
  return 'sort-inactive'
}

const refreshData = async () => {
  await loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
:root {

  :default {
    /* <СМК> схема (по умолчанию) */
    --header-primary: #00a3e6;
    --header-primary-dark: #2563eb;
    --header-secondary: #6366f1;
    --header-secondary-dark: #4f46e5;
    --header-accent: #f59e0b;
    --header-accent-dark: #d97706;
  }

  /* Зеленая схема */
  .theme-green {
    --header-primary: #10b981;
    --header-primary-dark: #059669;
    --header-secondary: #34d399;
    --header-secondary-dark: #10b981;
    --header-accent: #fbbf24;
    --header-accent-dark: #f59e0b;
  }

  /* Фиолетовая схема */
  .theme-purple {
    --header-primary: #8b5cf6;
    --header-primary-dark: #7c3aed;
    --header-secondary: #a78bfa;
    --header-secondary-dark: #8b5cf6;
    --header-accent: #f472b6;
    --header-accent-dark: #ec4899;
  }

  /* Красная схема */
  .theme-red {
    --header-primary: #ef4444;
    --header-primary-dark: #dc2626;
    --header-secondary: #f87171;
    --header-secondary-dark: #ef4444;
    --header-accent: #fbbf24;
    --header-accent-dark: #f59e0b;
  }

  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #6366f1;

  --success-light: #ecfdf5;
  --warning-light: #fffbeb;
  --danger-light: #fef2f2;
  --info-light: #eef2ff;
  --neutral-light: #f8fafc;

  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  --border-color: silver;
  --border-light: #f1f5f9;
  --surface: #ffffff;
  --surface-hover: #f8fafc;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.sales-table-container {
  width: 100%;
  min-height: 100vh;
  // max-width: 2300px;
  border-top: 1px solid silver;
  background: var(--neutral-light);
  font-family: BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--border-light);
  z-index: 1000;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: var(--primary-color);
  border-radius: 0 2px 2px 0;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    width: 0%;
    transform: translateX(-100%);
  }

  50% {
    width: 70%;
    transform: translateX(0%);
  }

  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

.content {
  padding: 24px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.controls-panel {
  display: flex;
  align-items: center;
  background: var(--surface);
  gap: 20px;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-order-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  background: var(--surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.sort-order-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border-color);
  background: var(--surface);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--success-color);
  color: var(--success-color);
  background: var(--success-light);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.week-toggles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.toggle-columns-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.toggle-columns-btn:hover {
  border-color: var(--info-color);
  color: var(--info-color);
  background: var(--info-light);
}

.toggle-columns-btn.is-hidden {
  opacity: 0.6;
  background: var(--border-light);
  color: var(--text-muted);
}

.custom-table {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.table {
  width: 100%;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 2px solid var(--border-color);
  border-top: 1px solid silver;
}

.row {
  display: flex;
  width: 100%;

}

.cell {
  height: 30px;
  padding: 6px 0px;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-right: 1px solid silver;
}

.cell.static {
  min-width: 230px;
  flex-shrink: 0;
  background: var(--neutral-light);
  font-weight: 600;
  border-right: 2px solid silver;
}

.cell.dynamic {
  display: flex;
  justify-content: center;
  transition: all 0.2s ease;
}

.header-cell {
  background: var(--neutral-light);
  font-size: 12px;
  border-bottom: 1px solid var(--border-color);
}

.week-group {
  background: var(--info-light);
  color: var(--info-color);
  font-size: 15px;
  font-weight: 700;
  border-bottom: 2px solid var(--info-color);
}

.metric-header {
  background: var(--surface);
  font-size: 13px;
  color: var(--text-secondary);
}

.sub-header {
  background: var(--border-light);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.table-body {
  background: var(--surface);
}

.data-row {
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.data-row:hover {
  background: var(--surface-hover);
  box-shadow: 0 2px 8px rgb(59 130 246 / 0.08);
}

.region-row {
  background: var(--neutral-light);
  font-weight: 600;
  border-bottom: 2px solid var(--border-color);
}

.data-cell {
  font-size: 13px;
  font-weight: 500;
}

.region-name,
.store-name {
  justify-content: flex-start;
  padding-left: 20px;
}

.region-info,
.store-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.region-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.region-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.store-rank-number,
.region-rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 11px;
  min-width: 24px;
}

.store-title {
  color: var(--text-primary);
  font-weight: 500;
}

.plan,
.fact,
.losses,
.shortages,
.fop {
  justify-content: flex-end;
  font-family: BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
}

.percent {
  font-weight: 600;
}

.points {
  font-weight: 700;
  color: var(--primary-color);
}

.rank {
  font-weight: 600;
  color: var(--text-secondary);
}

.top-rank {
  background: var(--success-light);
  border-left: 4px solid var(--success-color);
}

.mid-rank {
  background: var(--warning-light);
  border-left: 4px solid var(--warning-color);
}

.low-rank {
  background: var(--danger-light);
  border-left: 4px solid var(--danger-color);
}

.region-top-rank {
  background: var(--success-light);
  border-left: 6px solid var(--success-color);
}

.region-mid-rank {
  background: var(--warning-light);
  border-left: 6px solid var(--warning-color);
}

.region-low-rank {
  background: var(--danger-light);
  border-left: 6px solid var(--danger-color);
}

.region-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 1);
}

.store-region-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 1);
}

.store-region-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.sortable-header {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.sortable-header:hover {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.sort-arrow {
  font-size: 10px;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.sort-arrow.sort-active {
  opacity: 1;
  color: var(--primary-color);
  font-weight: bold;
}

.sort-arrow.sort-desc {
  color: var(--danger-color);
}

.sort-arrow.sort-asc {
  color: var(--success-color);
}

.sort-arrow.sort-inactive {
  opacity: 0.3;
}

.sortable-header:hover .sort-arrow {
  opacity: 0.8;
}

.rank-arrow,
.region-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.arrow-up {
  background: var(--success-light);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.arrow-stable {
  background: var(--warning-light);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

.arrow-down {
  background: var(--danger-light);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

// по рангам
// .column-rank-top {
// background: red;
// color: var(--success-color);
// font-weight: 600;
// border: 1px solid var(--success-color);
// border-radius: var(--radius-sm);
// }

// .column-rank-good {
// background: #f0f9ff;
// color: #0369a1;
// border: 1px solid #0369a1;
// border-radius: var(--radius-sm);
// }

// .column-rank-average {
// background: var(--warning-light);
// color: var(--warning-color);
// border: 1px solid var(--warning-color);
// border-radius: var(--radius-sm);
// }

.column-rank-poor {
  color: var(--danger-color);
  font-weight: 600;
}

.percent-excellent {
  color: var(--success-color) !important;
  font-weight: 700;
}

.percent-good {
  color: #059669 !important;
  font-weight: 600;
}

.percent-average {
  color: var(--warning-color) !important;
  font-weight: 500;
}

.percent-poor {
  color: var(--danger-color) !important;
  font-weight: 700;
}

.negative-indicator {
  color: var(--danger-color);
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.table-separator {
  height: 16px;
  background: var(--border-light);
  border-top: 1px solid silver;
  border-bottom: 1px solid silver;
}

.data_cells {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.week {
  display: flex;
  width: 100%;
  border-top: 1px solid silver;
  border-right: 2px solid silver;
}

.cols {
  width: 100%;
  display: flex;
  align-items: center;
}

.week_name {
  font-weight: 600;
  color: var(--info-color);
  padding: 12px;
  text-align: center;
  width: 100%;
  font-size: 14px;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--warning-color);
}

.retry-btn {
  margin-top: 16px;
  padding: 12px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.4s ease;
}

.table-row-enter-from,
.table-row-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.table-row-move {
  transition: transform 0.4s ease;
}

.table-separator {
  background: var(--border-light);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid silver;
}

.store-sort-controls {
  display: flex;
  flex-direction: column;
}

.sort-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-sort-info {
  font-size: 11px;
  font-weight: 500;
  color: var(--primary-color);
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.sort-controls-row {
  display: flex;
  width: 100%;
  align-items: center;
}

.sort-static-cell {
  min-width: 230px;
  flex-shrink: 0;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-align: left;
}

.sort-weeks {
  display: flex;
  width: 100%;
}

.sort-week {
  display: flex;
  width: 100%;
  border-right: 1px solid var(--border-color);
}

.sort-cols {
  width: 100%;
  display: flex;
  align-items: center;
}

.sort-control {
  padding: 0px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.regions-summary-block {
  border-top: 1px solid silver;
  border-bottom: 2px solid silver;
}

.group-cols {
  width: 100%;
  display: flex;
  align-items: center;
}

.region-total {
  // min-width: 13%;
  // font-size: 0.55em;
}

* {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.region-row,
.store-row {
  transition: all .2s ease;
  transform-origin: center;
}

.region-row:hover,
.store-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 8px rgba(2, 52, 122, 0.5);
  z-index: 10;
  position: relative;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}

.color-palette h3 {
  width: 100%;
  margin: 0 0 15px 0;
  color: #555;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.color-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #333;
}

.table-color-changer {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  position: relative;
}

.toggle-button {
  position: fixed;
  bottom: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  background: red;
}

.toggle-button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.toggle-button.active {
  background: #28a745;
}

.toggle-icon {
  font-size: 16px;
}

.color-palette-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  height: 100vh;
  background: white;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.color-palette-sidebar.open {
  transform: translateX(0);
}

.palette-content {
  padding: 80px 20px 20px 20px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 20px;
  padding: 3px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  transition: opacity 0.3s ease;
}

.group-toggle-btn {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.group-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.group-toggle-btn.is-collapsed {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(0, 0, 0, 0.3);
}

.group-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px 2px;
  gap: 4px;
  cursor: pointer;
}

.custom-tooltip {
  position: fixed;
  z-index: 10000;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 16px;
  min-width: 290px;
  max-width: 600px;
  pointer-events: none;
  font-size: 13px;
  backdrop-filter: blur(8px);
  animation: tooltipFadeIn 0.2s ease-out;
  transition: opacity 0.1s ease;


  max-height: 80vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--border-light);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-header {
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-light);
}

.tooltip-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.tooltip-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.tooltip-main-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  padding: 6px;
  background: var(--info-light);
  border-radius: var(--radius-md);
}

.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 12px;
  flex: 1;
}

.detail-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 12px;
  text-align: right;
}

.tooltip-trigger {
  cursor: help;
  transition: background 0.2s ease;
}

.tooltip-trigger:hover {
  background: rgba(59, 130, 246, 0.05) !important;
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

.percentile-top {
  color: #2e7d32 !important;
  // background-color: #d0ffea;
  // color: white !important;
}

.percentile-excellent {
  color: #2e7d32 !important;
  // background-color: #ebfff6;
  // color: white !important;
}

.percentile-good {
  color: #f57c00 !important;
  // background-color: #fff3e1;
  // color: white !important;
}

.percentile-average {
  color: #ea580c !important;
  // background-color: #fee7c5;
  // color: white !important;
}

.percentile-poor {
  color: #dc2626 !important;
  // background-color: #ffdada;
  // color: white !important;
}

.tooltip-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.tooltip-toggle:hover {
  color: var(--text-primary);
}

.tooltip-toggle input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: var(--border-color);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.tooltip-toggle input[type="checkbox"]:checked+.toggle-slider {
  background: var(--primary-color);
}

.tooltip-toggle input[type="checkbox"]:checked+.toggle-slider::after {
  transform: translateX(16px);
}

.toggle-label {
  user-select: none;
  white-space: nowrap;
  color: silver;
}

.tooltip-header {
  border-bottom: 1px solid var(--border-light);
}

.tooltip-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.tooltip-group {
  font-size: 11px;
  color: var(--info-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
</style>





