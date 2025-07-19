<template>
  <div class="sales-table-container table-container">
    <div v-if="loading" class="loading-bar">
      <div class="loading-progress"></div>
    </div>

    <div v-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div>{{ error }}</div>
      <button class="retry-btn" @click="refreshData">Попробовать снова</button>
    </div>

    <div v-if="!loading && !error" class="content">
      <!-- Элементы управления -->
      <div class="controls-panel">
        <div class="sorting-controls">
          <button class="sort-order-btn" :class="{ active: sortByRank }"
            :title="sortByRank ? 'Отключить сортировку по общему рангу' : 'Включить сортировку по общему рангу'"
            @click="toggleSortByRank">
            {{ sortByRank ? '🏆 Сортировка по рангу' : 'Сортировка по рангу' }}
          </button>

          <button class="refresh-btn" @click="refreshData" :disabled="loading">
            🔄 Обновить
          </button>
        </div>

        <div class="week-toggles">
          <div class="week-toggle-group" v-for="col in columns" :key="col.key">
            <button class="toggle-columns-btn" :class="{ 'is-hidden': !visible[col.key] }"
              @click="visible[col.key] = !visible[col.key]">
              <span v-html="col.label"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="custom-table">
        <div class="table">
          <!-- Шапка: уровень 1 -->
          <div class="table-header">

            <div class="row header top">
              <div class="cell static header-cell store-name-column">Регион / Магазин</div>
              <div class="cell group week-group" :style="{ width: dynamicRowWidth }">
                <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                  <div class="week_name">{{ week.name }} ({{ week.dateRange }})</div>
                </div>
              </div>
            </div>

            <!-- Шапка: уровень 2 -->
            <div class="row header bottom">
              <div class="cell static header-cell">Общий рейтинг</div>
              <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                <div class="cols">
                  <div v-for="col in columns" :key="col.key + weekIndex"
                    class="cell dynamic header-cell metric-header sortable-header" :style="getStyle(col.key, weekIndex)"
                    @click="handleRegionSort(week.id, col.key)">
                    <div class="header-content">
                      <span v-html="col.label"></span>
                      <span class="sort-arrow" :class="getSortArrowClass(week.id, col.key)">
                        {{ getSortIcon(week.id, col.key) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>




          </div>

          <div class="table-body">
            <!-- Блок итогов по регионам -->
            <div class="regions-summary-block">
              <transition-group name="table-row" tag="div">
                <div v-for="region in sortedRegions" :key="`region-summary-${region.id}`"
                  class="row region-row region-summary data-row" :class="getRegionRowClass(region.regionRank)">
                  <div class="cell static data-cell region-name">
                    <div class="region-info">
                      <div class="region-indicator" :style="{ backgroundColor: region.color }"></div>
                      <!-- <span class="region-arrow" :class="getRegionArrowClass(region.regionRank)">
                        {{ getRegionArrow(region.regionRank) }}
                      </span> -->
                      <span class="region-title">{{ region.name }}</span>
                    </div>
                  </div>
                  <div class="data_cells">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                      <div class="cols">
                        <div v-for="col in columns" :key="`region-summary-${region.id}-${week.id}-${col.key}`"
                          class="cell dynamic data-cell region-total"
                          :class="getRegionCellClass(col.key, region, week.id)" :style="getStyle(col.key, weekIndex)">
                          {{ getRegionData(region, week.id, col.key) }}
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
                  <div class="sort-weeks">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="sort-week">
                      <div class="sort-cols">
                        <div v-for="col in columns" :key="`store-sort-${week.id}-${col.key}`"
                          class="sort-control sortable-control" :class="getStoreSortArrowClass(week.id, col.key)"
                          :style="getStyle(col.key, weekIndex)"
                          :title="`Сортировать магазины по ${col.label.replace(/<br>/g, ' ')} (${week.name})`"
                          @click="handleStoreSort(week.id, col.key)">
                          <span class="sort-arrow">
                            {{ getStoreSortIcon(week.id, col.key) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Все магазины без группировки -->
            <transition-group name="table-row" tag="div">
              <div v-for="store in allStores" :key="`store-${store.id}`" class="row store-row data-row"
                :class="getStoreRowClass(store.overallRank)">
                <div class="cell static data-cell store-name">
                  <div class="store-info">
                    <div class="store-region-indicator" :style="{ backgroundColor: store.regionColor }"></div>
                    <!-- <span class="rank-arrow" :class="getRankArrowClass(store.overallRank)">
                      {{ getRankArrow(store.overallRank) }}
                    </span> -->
                    <span class="store-title">{{ store.name }}</span>
                    <!-- <span class="store-region-label">({{ store.regionName }})</span> -->
                  </div>
                </div>
                <div class="data_cells">
                  <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                    <div class="cols">
                      <div v-for="col in columns" :key="`store-${store.id}-${week.id}-${col.key}`"
                        class="cell dynamic data-cell"
                        :class="[getCellClass(col.key, getStoreWeekData(store, week.id)), col.key]"
                        :style="getStyle(col.key, weekIndex)">
                        {{ getStoreData(store, week.id, col.key) }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'

const loading = ref(true)
const error = ref(null)
const salesData = ref(null)
const sortByRank = ref(false)
const regions = ref([])

// Состояние для сортировки по колонкам регионов
const regionSortBy = ref({ weekId: 'week35', columnKey: 'percent', direction: 'desc' })

// Состояние для сортировки магазинов
const storeSortBy = ref({ weekId: 'week35', columnKey: 'percent', direction: 'desc' })

const heads = [

  { key: 'ob', label: 'ОБОРОТ' },

]

// Определение колонок
const columns = [
  { key: 'rank', label: 'РАНГ' },
  { key: 'points', label: 'БАЛЛЫ' },
  { key: 'plan', label: 'План' },
  { key: 'fact', label: 'Факт' },
  { key: 'percent', label: '%' },
  { key: 'losses', label: 'Втрати /<br>Списання' },
  { key: 'losses_score', label: 'Балл' },
  { key: 'losses_pers', label: '%' },
  { key: 'shortages', label: 'Недостачі' },
  { key: 'shortages_score', label: 'Недостачі' },
  { key: 'shortages_pers', label: 'Недостачі' },
  { key: 'fop', label: 'ФОП' },
  { key: 'fop_score', label: 'ФОП' },
  { key: 'fop_pers', label: 'ФОП' },
  { key: 'fillers', label: 'Заливщики' },
  { key: 'fillers_score', label: 'Заливщики' },
  { key: 'fillers_pers', label: 'Заливщики' },
  { key: 'shift', label: 'Відємні<br>залишки' },
  { key: 'shift_score', label: 'Відємні<br>залишки' },
  { key: 'shift_pers', label: 'Відємні<br>залишки' },
  { key: 'unprocessed', label: 'Не проведені<br>списання' },
  { key: 'unprocessed_score', label: 'Не проведені<br>списання' },
  { key: 'unprocessed_pers', label: 'Не проведені<br>списання' },
]

// Видимость колонок
const visible = reactive(columns.reduce((acc, col) => {
  // if (['plan', 'fact', 'percent'].includes(col.key)) {
  if ([].includes(col.key)) {
    acc[col.key] = false // По умолчанию скрыты
  } else {
    acc[col.key] = true
  }
  return acc
}, {}))

const visibleKeys = computed(() =>
  columns.filter(col => visible[col.key]).map(col => col.key)
)

const dynamicRowWidth = computed(() => {
  const total = visibleKeys.value.length
  return total > 0 ? '100%' : '0%'
})

function getStyle(key, weekIndex) {
  const total = visibleKeys.value.length
  const isVisible = visible[key]
  const width = isVisible ? `${100 / total}%` : '0%'
  return {
    width,
    opacity: isVisible ? 1 : 0,
    transition: 'width 0.3s ease, opacity 0.3s ease',
    overflow: 'hidden',
  }
}

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
    if (!data.weeks || !data.regions) {
      throw new Error('Неверная структура данных')
    }

    salesData.value = data
    regions.value = Object.values(data.regions)

    // Обработка данных после загрузки
    processData()

  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
    error.value = err.message || 'Ошибка загрузки данных'
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }
}

// Обработка данных
const processData = () => {
  if (!regions.value || !salesData.value) return

  // Добавляем цвета регионов к магазинам
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        store.regionId = region.id
        store.regionName = region.name
        store.regionColor = region.color
      })
    }
  })

  // Собираем все магазины для расчета рейтинга
  const allStores = []
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        allStores.push(store)
      })
    }
  })

  // Расчет процентов и баллов для каждой недели
  salesData.value.weeks.forEach(week => {
    // Расчет процентов
    allStores.forEach(store => {
      const weekData = getStoreWeekData(store, week.id)
      weekData.percent = calculatePercent(weekData.plan, weekData.fact)
    })

    // Найти максимальный процент для расчета баллов
    const maxPercent = Math.max(...allStores.map(store => {
      const weekData = getStoreWeekData(store, week.id)
      return weekData.percent || 0
    }))

    // Расчет баллов
    allStores.forEach(store => {
      const weekData = getStoreWeekData(store, week.id)
      if (maxPercent > 0) {
        weekData.points = Math.round((weekData.percent / maxPercent) * 100)
      } else {
        weekData.points = 0
      }
    })

    // Расчет рангов по колонкам для каждой недели
    calculateColumnRanks(week.id, allStores)
  })

  // Расчет общего рейтинга
  allStores.forEach(store => {
    let totalPoints = 0
    salesData.value.weeks.forEach(week => {
      const weekData = getStoreWeekData(store, week.id)
      totalPoints += weekData.points || 0
    })
    store.totalPoints = totalPoints
  })

  // Сортировка по общим баллам и присвоение рангов
  allStores.sort((a, b) => b.totalPoints - a.totalPoints)
  allStores.forEach((store, index) => {
    store.overallRank = index + 1

    // Присваиваем ранг каждой неделе
    salesData.value.weeks.forEach(week => {
      const weekData = getStoreWeekData(store, week.id)
      weekData.rank = store.overallRank
    })
  })

  // Расчет рангов по колонкам для регионов
  calculateRegionColumnRanks()
}

const weeks = computed(() => salesData.value?.weeks || [])

// Расчет рангов по колонкам для магазинов
const calculateColumnRanks = (weekId, allStores) => {
  const columnKeys = ['points', 'percent', 'plan', 'fact', 'losses', 'shortages', 'fop', 'fillers', 'shift', 'unprocessed']

  columnKeys.forEach(columnKey => {
    // Создаем массив магазинов с их значениями для данной колонки
    const storesWithValues = allStores.map(store => {
      const weekData = getStoreWeekData(store, weekId)
      let value = 0

      switch (columnKey) {
        case 'points':
          value = weekData.points || 0
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
        case 'losses':
          value = weekData.losses || 0
          break
        case 'shortages':
          value = weekData.shortages || 0
          break
        case 'fop':
          value = weekData.fop || 0
          break
        case 'fillers':
          value = weekData.fillers || 0
          break
        case 'shift':
          value = weekData.shift || 0
          break
        case 'unprocessed':
          value = weekData.unprocessed || 0
          break
      }

      return { store, value, weekData }
    })

    // Сортируем по убыванию (для большинства показателей выше = лучше)
    // Для losses, shortages, unprocessed - по возрастанию (меньше = лучше)
    const shouldSortAsc = ['losses', 'shortages', 'unprocessed'].includes(columnKey)
    // storesWithValues.sort((a, b) => shouldSortAsc ? a.value - b.value : b.value - a.value)

    // Присваиваем ранги
    storesWithValues.forEach((item, index) => {
      if (!item.weekData.columnRanks) {
        item.weekData.columnRanks = {}
      }
      item.weekData.columnRanks[columnKey] = index + 1
    })
  })
}

// Расчет рангов по колонкам для регионов
const calculateRegionColumnRanks = () => {
  if (!regions.value || !salesData.value) return

  salesData.value.weeks.forEach(week => {
    const columnKeys = ['points', 'percent', 'plan', 'fact', 'losses', 'shortages', 'fop', 'fillers', 'shift', 'unprocessed']

    columnKeys.forEach(columnKey => {
      // Создаем массив регионов с их значениями для данной колонки
      const regionsWithValues = regions.value.map(region => {
        let value = 0
        let totalPlan = 0
        let totalFact = 0
        let totalPoints = 0

        if (region.stores) {
          region.stores.forEach(store => {
            const weekData = getStoreWeekData(store, week.id)

            switch (columnKey) {
              case 'plan':
                value += weekData.plan || 0
                break
              case 'fact':
                value += weekData.fact || 0
                break
              case 'losses':
                value += weekData.losses || 0
                break
              case 'shortages':
                value += weekData.shortages || 0
                break
              case 'fop':
                value += weekData.fop || 0
                break
              case 'fillers':
                value += weekData.fillers || 0
                break
              case 'shift':
                value += weekData.shift || 0
                break
              case 'unprocessed':
                value += weekData.unprocessed || 0
                break
              case 'points':
                totalPoints += weekData.points || 0
                break
            }

            totalPlan += weekData.plan || 0
            totalFact += weekData.fact || 0
          })
        }

        if (columnKey === 'percent') {
          value = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
        } else if (columnKey === 'points') {
          value = totalPoints
        }
        console.log(`Region: ${region.name}, Week: ${week.id}, Column: ${columnKey}, Value: ${value}`);


        return { region, value }
      })

      // Сортируем по убыванию (для большинства показателей выше = лучше)
      // Для losses, shortages, unprocessed - по возрастанию (меньше = лучше)
      const shouldSortAsc = ['losses', 'shortages', 'unprocessed'].includes(columnKey)
      // regionsWithValues.sort((a, b) => shouldSortAsc ? a.value - b.value : b.value - a.value)

      // Присваиваем ранги
      regionsWithValues.forEach((item, index) => {
        if (!item.region.columnRanks) {
          item.region.columnRanks = {}
        }
        if (!item.region.columnRanks[week.id]) {
          item.region.columnRanks[week.id] = {}
        }
        item.region.columnRanks[week.id][columnKey] = index + 1
      })
    })
  })
}

const sortedRegions = computed(() => {
  if (!regions.value) return []

  let sorted = [...regions.value]

  // Рассчитываем рейтинг регионов
  sorted.forEach(region => {
    let totalPlan = 0
    let totalFact = 0

    if (region.stores) {
      region.stores.forEach(store => {
        salesData.value.weeks.forEach(week => {
          const weekData = getStoreWeekData(store, week.id)
          totalPlan += weekData.plan || 0
          totalFact += weekData.fact || 0
        })
      })
    }

    region.totalPercent = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
  })

  // Сортировка регионов по выбранному критерию
  sorted.sort((a, b) => {
    let aValue = 0
    let bValue = 0

    if (regionSortBy.value.columnKey === 'rank') {
      aValue = a.totalPercent
      bValue = b.totalPercent
    } else {
      aValue = getRegionSortValue(a, regionSortBy.value.weekId, regionSortBy.value.columnKey)
      bValue = getRegionSortValue(b, regionSortBy.value.weekId, regionSortBy.value.columnKey)
    }

    return regionSortBy.value.direction === 'desc' ? bValue - aValue : aValue - bValue
  })

  // Присваиваем ранги регионам
  sorted.forEach((region, index) => {
    region.regionRank = index + 1
  })

  return sorted
})




// Все магазины без группировки по регионам
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

  // Приоритет сортировки: сначала по колонкам, потом по рангу
  if (storeSortBy.value.columnKey && storeSortBy.value.weekId) {
    stores.sort((a, b) => {
      let aValue = getStoreSortValue(a, storeSortBy.value.weekId, storeSortBy.value.columnKey)
      let bValue = getStoreSortValue(b, storeSortBy.value.weekId, storeSortBy.value.columnKey)

      // Для негативных показателей инвертируем сортировку
      const isNegativeMetric = ['losses', 'shortages', 'unprocessed'].includes(storeSortBy.value.columnKey)
      if (isNegativeMetric) {
        return storeSortBy.value.direction === 'desc' ? aValue - bValue : bValue - aValue
      }

      return storeSortBy.value.direction === 'desc' ? bValue - aValue : aValue - bValue
    })
  } else if (sortByRank.value) {
    stores.sort((a, b) => (a.overallRank || 0) - (b.overallRank || 0))
  }

  return stores
})

const getStoreSortValue = (store, weekId, columnKey) => {
  const weekData = getStoreWeekData(store, weekId)

  switch (columnKey) {
    case 'rank':
      return weekData.rank || store.overallRank || 0
    case 'points':
      return weekData.points || 0
    case 'plan':
      return weekData.plan || 0
    case 'fact':
      return weekData.fact || 0
    case 'percent':
      return weekData.percent || 0
    case 'losses':
      return weekData.losses || 0
    case 'shortages':
      return weekData.shortages || 0
    case 'fop':
      return weekData.fop || 0
    case 'fillers':
      return weekData.fillers || 0
    case 'shift':
      return weekData.shift || 0
    case 'unprocessed':
      return weekData.unprocessed || 0
    default:
      return 5
  }
}

const handleStoreSort = (weekId, columnKey) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === columnKey) {
    storeSortBy.value.direction = storeSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    storeSortBy.value = {
      weekId,
      columnKey,
      direction: 'desc'
    }
  }
}

const getStoreSortIcon = (weekId, columnKey) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === columnKey) {
    return storeSortBy.value.direction === 'desc' ? '▼' : '▲'
  }
  return '↕'
}

const getStoreSortArrowClass = (weekId, columnKey) => {
  if (storeSortBy.value.weekId === weekId && storeSortBy.value.columnKey === columnKey) {
    return storeSortBy.value.direction === 'desc' ? 'sort-active sort-desc' : 'sort-active sort-asc'
  }
  return 'sort-inactive'
}

const getRegionSortValue = (region, weekId, columnKey) => {
  if (!region.stores) return 0

  let total = 0
  let totalPlan = 0
  let totalFact = 0
  let totalPoints = 0

  region.stores.forEach(store => {
    const weekData = getStoreWeekData(store, weekId)

    switch (columnKey) {
      case 'plan':
        total += weekData.plan || 0
        break
      case 'fact':
        total += weekData.fact || 0
        break
      case 'losses':
        total += weekData.losses || 0
        break
      case 'shortages':
        total += weekData.shortages || 0
        break
      case 'fop':
        total += weekData.fop || 0
        break
      case 'fillers':
        total += weekData.fillers || 0
        break
      case 'shift':
        total += weekData.shift || 0
        break
      case 'unprocessed':
        total += weekData.unprocessed || 0
        break
      case 'points':
        totalPoints += weekData.points || 0
        break
    }

    totalPlan += weekData.plan || 0
    totalFact += weekData.fact || 0
  })

  switch (columnKey) {
    case 'points':
      return totalPoints
    case 'percent':
      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    default:
      return total
  }
}

const handleRegionSort = (weekId, columnKey) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === columnKey) {
    regionSortBy.value.direction = regionSortBy.value.direction === 'desc' ? 'asc' : 'desc'
  } else {
    regionSortBy.value = {
      weekId,
      columnKey,
      direction: 'desc'
    }
  }
}

const getSortIcon = (weekId, columnKey) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === columnKey) {
    return regionSortBy.value.direction === 'desc' ? '▼' : '▲'
  }
  return '↕'
}

const getStoreWeekData = (store, weekId) => {
  if (!store || !store.weeklyData) {
    return {
      plan: 0, fact: 0, percent: 0, points: 0, rank: 0,
      losses: 0, shortages: 0, fop: 0, fillers: 0,
      shift: 0, unprocessed: 0
    }
  }

  const weekData = store.weeklyData.find(w => w.weekId === weekId)
  return weekData || {
    plan: 0, fact: 0, percent: 0, points: 0, rank: 0,
    losses: 0, shortages: 0, fop: 0, fillers: 0,
    shift: 0, unprocessed: 0
  }
}

const getStoreData = (store, weekId, columnKey) => {
  const weekData = getStoreWeekData(store, weekId)

  switch (columnKey) {
    case 'rank':
      return weekData.rank || store.overallRank || 0
    case 'points':
      return weekData.points || 0
    case 'plan':
      return formatNumber(weekData.plan)
    case 'fact':
      return formatNumber(weekData.fact)
    case 'percent':
      return weekData.percent ? `${weekData.percent}%` : '0%'
    case 'losses':
      return formatNumber(weekData.losses)
    case 'shortages':
      return formatNumber(weekData.shortages)
    case 'fop':
      return formatNumber(weekData.fop)
    case 'fillers':
      return weekData.fillers || 0
    case 'shift':
      return formatNumber(weekData.shift)
    case 'unprocessed':
      return formatNumber(weekData.unprocessed)
    default:
      return ''
  }
}

const getRegionData = (region, weekId, columnKey) => {
  if (!region.stores) return ''

  let total = 0
  let totalPlan = 0
  let totalFact = 0
  let totalPoints = 0

  region.stores.forEach(store => {
    const weekData = getStoreWeekData(store, weekId)

    switch (columnKey) {
      case 'plan':
        total += weekData.plan || 0
        break
      case 'fact':
        total += weekData.fact || 0
        break
      case 'losses':
        total += weekData.losses || 0
        break
      case 'shortages':
        total += weekData.shortages || 0
        break
      case 'fop':
        total += weekData.fop || 0
        break
      case 'fillers':
        total += weekData.fillers || 0
        break
      case 'shift':
        total += weekData.shift || 0
        break
      case 'unprocessed':
        total += weekData.unprocessed || 0
        break
      case 'points':
        totalPoints += weekData.points || 0
        break
    }

    totalPlan += weekData.plan || 0
    totalFact += weekData.fact || 0
  })

  switch (columnKey) {
    case 'rank':
      return region.regionRank || ''
    case 'points':
      return totalPoints
    case 'percent':
      return totalPlan > 0 ? `${Math.round((totalFact / totalPlan) * 100)}%` : '0%'
    case 'plan':
    case 'fact':
    case 'losses':
    case 'shortages':
    case 'fop':
    case 'shift':
    case 'unprocessed':
      return formatNumber(total)
    case 'fillers':
      return total
    default:
      return ''
  }
}

const calculatePercent = (plan, fact) => {
  if (!plan || plan === 0) return 0
  return Math.round((fact / plan) * 100)
}

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0'
  }
  return new Intl.NumberFormat('ru-RU').format(number)
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

const getRegionArrowClass = (regionRank) => {
  if (regionRank <= 2) return 'arrow-up'
  if (regionRank <= 4) return 'arrow-stable'
  return 'arrow-down'
}

const getRegionArrow = (regionRank) => {
  if (regionRank <= 2) return '↑'
  if (regionRank <= 4) return '→'
  return '↓'
}

const getRankArrowClass = (rank) => {
  if (rank <= 3) return 'arrow-up'
  if (rank <= 6) return 'arrow-stable'
  return 'arrow-down'
}

const getRankArrow = (rank) => {
  if (rank <= 3) return '↑'
  if (rank <= 6) return '→'
  return '↓'
}

const getCellClass = (columnKey, weekData, isRegion = false, weekId = null, region = null) => {
  const classes = []

  // Базовые классы для типов колонок
  if (columnKey === 'points') {
    classes.push('points-cell')
  }

  if (columnKey === 'rank') {
    classes.push('rank-cell')
  }

  // Условное форматирование по рангам в колонках
  let rank = 0
  let totalItems = 0

  if (isRegion && region && weekId) {
    // Для регионов
    rank = region.columnRanks?.[weekId]?.[columnKey] || 0
    totalItems = regions.value?.length || 0
  } else {
    // Для магазинов
    rank = weekData.columnRanks?.[columnKey] || 0
    // Подсчитываем общее количество магазинов
    totalItems = regions.value?.reduce((total, region) => {
      return total + (region.stores?.length || 0)
    }, 0) || 0
  }

  if (rank > 0 && totalItems > 0) {
    const percentile = (rank / totalItems) * 100

    // Форматирование по процентилям
    if (percentile <= 20) {
      classes.push('column-rank-top') // Топ 20%
    } else if (percentile <= 40) {
      classes.push('column-rank-good') // 20-40%
    } else if (percentile <= 60) {
      classes.push('column-rank-average') // 40-60%
    } else if (percentile <= 80) {
      classes.push('column-rank-below') // 60-80%
    } else {
      classes.push('column-rank-poor') // Нижние 20%
    }
  }

  // Специальное форматирование для процентов (дополнительно к рангам)
  if (columnKey === 'percent') {
    const percent = weekData.percent || 0
    if (percent >= 100) classes.push('percent-excellent')
    else if (percent >= 80) classes.push('percent-good')
    else if (percent >= 60) classes.push('percent-average')
    else classes.push('percent-poor')
  }

  // Форматирование для отрицательных показателей
  if (['losses', 'shortages', 'unprocessed'].includes(columnKey)) {
    const value = weekData[columnKey] || 0
    if (value > 0) {
      classes.push('negative-indicator')
    }
  }

  return classes.join(' ')
}

const getRegionCellClass = (columnKey, region, weekId) => {
  return getCellClass(columnKey, {}, true, weekId, region)
}

const toggleSortByRank = () => {
  sortByRank.value = !sortByRank.value
}

const getSortArrowClass = (weekId, columnKey) => {
  if (regionSortBy.value.weekId === weekId && regionSortBy.value.columnKey === columnKey) {
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
// CSS переменные для современного дизайна
:root {
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

  --border-color: #e2e8f0;
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
  justify-content: space-between;
  background: var(--surface);
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
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
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  background: var(--surface);
  border-radius: var(--radius-md);
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
  min-width: 1400px;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 2px solid var(--border-color);
}

.row {
  display: flex;
  width: 100%;
}

.cell {
  height: 35px;
  padding: 8px 0px;
  border-right: 1px solid var(--border-color);
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-right: 1px solid silver;
  border-bottom: 1px solid silver;
  // line-height: 1.4;
}

.cell.static {
  min-width: 250px;
  flex-shrink: 0;
  background: var(--neutral-light);
  font-weight: 600;
  border-right: 2px solid silver;
}

.cell.dynamic {
  display: flex;
  justify-content: center;
  // min-width: 60px;
  // flex: 1;
  transition: all 0.2s ease;
}

.header-cell {
  font-weight: 600;
  color: var(--text-primary);
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
  font-size: 11px;
  font-weight: 600;
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
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
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

// Современное условное форматирование
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
  // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.store-region-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 1);
  // box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.store-region-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

// Сортировка в заголовках
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

// Современные стрелки направления
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

// Условное форматирование по рангам в колонках
.column-rank-top {
  // background: var(--success-light);
  color: var(--success-color);
  font-weight: 600;
  // border: 1px solid var(--success-color);
  // border-radius: var(--radius-sm);
}

.column-rank-good {
  // background: #f0f9ff;
  color: #0369a1;
  // border: 1px solid #0369a1;
  // border-radius: var(--radius-sm);
}

.column-rank-average {
  // background: var(--warning-light);
  color: var(--warning-color);
  // border: 1px solid var(--warning-color);
  // border-radius: var(--radius-sm);
}

.column-rank-below {
  // background: #fdf2f8;
  color: #be185d;
  // border: 1px solid #be185d;
  // border-radius: var(--radius-sm);
}

.column-rank-poor {
  // background: var(--danger-light);
  color: var(--danger-color);
  font-weight: 600;
  // border: 1px solid var(--danger-color);
  // border-radius: var(--radius-sm);
}

// Дополнительное форматирование для процентов
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

// Форматирование для отрицательных показателей
.negative-indicator {
  // background: var(--danger-light);
  color: var(--danger-color);
  font-weight: 600;
  border-radius: var(--radius-sm);
  // border: 1px solid rgba(239, 68, 68, 0.2);
}

.table-separator {
  height: 23px;
  background: var(--border-light);
  border-top: 1px solid var(--border-color);
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
  border-right: 1px solid var(--border-color);
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
  font-size: 13px;
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

// Анимации для transition-group
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

// Адаптивность
@media (max-width: 768px) {
  .controls-panel {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .week-toggles {
    width: 100%;
    justify-content: center;
  }

  .content {
    padding: 16px;
  }

  .cell {
    padding: 8px 4px;
    font-size: 12px;
  }

  .region-title,
  .store-title {
    font-size: 13px;
  }
}

// Улучшения для печати
@media print {
  .controls-panel {
    display: none;
  }

  .loading-bar {
    display: none;
  }

  .table-body .data-row:hover {
    background: transparent;
    box-shadow: none;
  }
}


.table-separator {
  background: var(--border-light);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid silver;
  // padding: 8px 0;
}

.store-sort-controls {
  display: flex;
  flex-direction: column;
  // gap: 8px;
  // padding: 0 12px;
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
  min-width: 250px;
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
  // min-width: 60px;
  // flex: 1;
  padding: 6px 0px;
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
}
</style>