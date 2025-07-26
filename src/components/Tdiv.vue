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
<<<<<<< HEAD

    <div v-if="!loading && !error" class="content">
      <!-- Элементы управления -->
      <div class="controls-panel">
        <div class="sorting-controls">
          <button class="sort-order-btn" 
                  :class="{ active: sortByRank }"
                  @click="toggleSortByRank">
            {{ sortByRank ? '↑ Сортировка включена' : 'Сортировка по рангу' }}
          </button>
          
          <button class="refresh-btn" 
                  @click="refreshData" 
                  :disabled="loading">
            🔄 Обновить
          </button>
        </div>
        
        <div class="week-toggles">
          <div class="week-toggle-group" v-for="col in columns" :key="col.key">
            <button class="toggle-columns-btn" 
                    :class="{ 'is-hidden': !visible[col.key] }"
                    @click="visible[col.key] = !visible[col.key]">
              <span v-html="col.label"></span>
            </button>
          </div>
=======
    <div v-else class="content">
      <!-- {{ isAnimating }} -->

      <div class="controls-panel" v-if="!loading && !error">
        <div class="region-filters">
          <div class="checkbox-group">
            <label v-for="region in regions" :key="'filter-' + region.id" class="checkbox-wrapper">
              <input type="checkbox" :value="region.name" v-model="selectedRegions" class="region-checkbox" />
              <span class="checkbox-custom">
                <span class="checkbox-indicator" :style="{ backgroundColor: region.color }"></span>
              </span>
              <span class="checkbox-label">{{ region.name }}</span>
            </label>
          </div>
          <button v-if="selectedRegions.length > 0" @click="selectedRegions = []" class="clear-filters-btn">
            Очистить фильтры
          </button>
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

            <div :class="`header-cell c_2 sub-header sort_class fact-column grid-col-${2 + weekIndex * 11}`"
              :style="`grid-column: ${2 + weekIndex * 11}; grid-row: 3; cursor: pointer;`" @click="sortByRank(week.id)">
              <span>100</span>
              <span v-if="sortBy === 'regionRank' && sortWeek === week.id" class="sort-indicator">
                {{ sortOrder === 'desc' ? '↑' : '↓' }}
              </span>
            </div>

            <div class="header-cell sub-header c_3" :style="`grid-column: ${3 + weekIndex * 11}; grid-row: 3;`">
              900
            </div>

            <div :class="`header-cell c_4 sub-header sort_class fact-column grid-col-${4 + weekIndex * 11}`"
              :style="`grid-column: ${4 + weekIndex * 11}; grid-row: 3; cursor: pointer;`"
              @click="sortByCurrent(week.id)">
              <span>100</span>
              <span v-if="sortBy === 'regionCurrent' && sortWeek === week.id" class="sort-indicator">
                {{ sortOrder === 'desc' ? '↑' : '↓' }}
              </span>
            </div>

            <div :class="`header-cell c_5 sub-header fact-column sort_class grid-col-${5 + weekIndex * 11}`"
              :style="`grid-column: ${5 + weekIndex * 11}; grid-row: 3;  cursor: pointer;`"
              @click="sortByPlan(week.id)">
              <span>План</span>
              <span v-if="sortBy === 'regionPlan' && sortWeek === week.id" class="sort-indicator">
                {{ sortOrder === 'desc' ? '↑' : '↓' }}
              </span>
            </div>

            <div :class="`header-cell c_6 sub-header sort_class fact-column grid-col-${6 + weekIndex * 11}`"
              :style="`grid-column: ${6 + weekIndex * 11}; grid-row: 3; cursor: pointer;`" @click="sortByFact(week.id)">
              <span>Факт</span>
              <span v-if="sortBy === 'regionFact' && sortWeek === week.id" class="sort-indicator">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </div>

            <div :class="`header-cell c_7 sub-header sort_class fact-column grid-col-${7 + weekIndex * 11}`"
              :style="`grid-column: ${7 + weekIndex * 11}; grid-row: 3; cursor: pointer;`"
              @click="sortByPercent(week.id)">
              <span>%</span>
              <span v-if="sortBy === 'regionPercent'" class="sort-indicator">
                {{ sortOrder === 'desc' ? '↑' : '↓' }}
              </span>
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
          <div class="table-separator">
            <div  @click="sortByStorePercent(week.id)" class="data-cell regione-name c_1"></div>
            <div v-for="(week, weekIndex) in weeks" :key="week.id" class="sorter">
              <div @click="sortByStorePercent(week.id)" class="sorter_item" :style="`grid-column: ${7 + weekIndex * 11}; grid-row: 3; cursor: pointer;`" v-for="(week, idx) in 11" :class="` c_${idx+2}`">
                <div class="ind_wrap">
                  <span v-if="idx === 0" class="sort-indicato">{{ sortOrder === 'desc' ? '↑' : '↓' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Разделитель -->

        <div class="table-body stores-body">
          <transition-group name="table-row" tag="div" class="transition-wrapper">
            <div v-for="(store, storeIndex) in getAllSortedStores()" :key="`store-${store.id}`"
              class="data-row store-row" :style="{ gridTemplateColumns: gridTemplateColumns }">
              <div class="data-cell store-name c_1">
                <div class="store-info">
                  <span class="region-indicator" :style="{ backgroundColor: store.regionColor }"></span>

                  <span class="store-title">{{ store.name }}</span>

                </div>
              </div>

              <template v-for="(week, weekIndex) in weeks" :key="week.id">
                <div class="data-cell store-rank score-max c_2"
                  :style="`grid-column: ${getGridColumn(weekIndex, 'rank')}`">
                  {{ storeIndex + 1 }}
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
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
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
                       class="cell dynamic header-cell metric-header"
                       :style="getStyle(col.key, weekIndex)">
                    <span v-html="col.label"></span>
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
                     class="row region-row region-summary data-row"
                     :class="getRegionRowClass(region.regionRank)">
                  <div class="cell static data-cell region-name">
                    <div class="region-info">
                      <div class="region-indicator" :class="getRegionRowClass(region.regionRank)"></div>
                      <span class="region-rank-number">{{ region.regionRank }}</span>
                      <span class="region-arrow" :class="getRegionArrowClass(region.regionRank)">
                        {{ getRegionArrow(region.regionRank) }}
                      </span>
                      <span class="region-title">{{ region.name }}</span>
                    </div>
                  </div>
                  <div class="data_cells">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                      <div class="cols">
                        <div v-for="col in columns" :key="`region-summary-${region.id}-${week.id}-${col.key}`" 
                             class="cell dynamic data-cell region-total" 
                             :class="getRegionCellClass(col.key, region, week.id)"
                             :style="getStyle(col.key, weekIndex)">
                          {{ getRegionData(region, week.id, col.key) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <div class="table-separator"></div>

            <!-- Данные магазинов по регионам -->
            <transition-group name="table-row" tag="div">
              <template v-for="region in sortedRegions" :key="`region-stores-${region.id}`">
                <!-- Заголовок региона для группировки магазинов -->
                <div class="row region-header data-row">
                  <div class="cell static data-cell region-name">
                    <div class="region-info">
                      <span class="region-title">{{ region.name }} - Магазины</span>
                    </div>
                  </div>
                  <div class="data_cells">
                    <div v-for="(week, weekIndex) in weeks" :key="week.id" class="week">
                      <div class="cols">
                        <div v-for="col in columns" :key="`region-header-${region.id}-${week.id}-${col.key}`" 
                             class="cell dynamic data-cell header-cell sub-header" 
                             :style="getStyle(col.key, weekIndex)">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Магазины региона -->
                <div v-for="store in getSortedStores(region)" :key="`store-${store.id}`" 
                     class="row store-row data-row"
                     :class="getStoreRowClass(store.overallRank)">
                  <div class="cell static data-cell store-name">
                    <div class="store-info">
                      <span class="store-rank-number">{{ store.overallRank }}</span>
                      <span class="rank-arrow" :class="getRankArrowClass(store.overallRank)">
                        {{ getRankArrow(store.overallRank) }}
                      </span>
                      <span class="store-title">{{ store.name }}</span>
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
              </template>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<<<<<<< HEAD
<script setup>
import { ref, computed, onMounted, reactive } from 'vue'

const loading = ref(true)
const error = ref(null)
const salesData = ref(null)
const sortByRank = ref(false)
const regions = ref([])

// Определение колонок
const columns = [
  { key: 'rank', label: 'РАНГ' },
  { key: 'points', label: 'БАЛЛЫ' },
  { key: 'plan', label: 'План' },
  { key: 'fact', label: 'Факт' },
  { key: 'percent', label: '%' },
  { key: 'losses', label: 'Втрати /<br>Списання' },
  { key: 'shortages', label: 'Недостачі' },
  { key: 'fop', label: 'ФОП' },
  { key: 'fillers', label: 'Заливщики' },
  { key: 'shift', label: 'Відємні<br>залишки' },
  { key: 'unprocessed', label: 'Не проведені<br>списання' }
]

// Видимость колонок
const visible = reactive(columns.reduce((acc, col) => {
  if (['plan', 'fact', 'percent'].includes(col.key)) {
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
=======
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
    const selectedRegions = ref([])

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

        if (data.weeks.length >= 2) {
          sortWeek.value = data.weeks[0].id
        } else if (data.weeks.length > 0) {
          sortWeek.value = data.weeks[1].id
        } else {
          sortWeek.value = 'all'
        }

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

    const getRegionCurrent = (region, weekId = null) => {
      const stores = region.stores || []
      let totalCurrent = 0

      weeks.value.forEach(week => {
        if (!weeklyScoresCache.value[week.id]) {
          weeklyScoresCache.value[week.id] = calculateCurrentScores(week.id)
        }

        stores.forEach(store => {
          totalCurrent += weeklyScoresCache.value[week.id].scores[store.id] || 0
        })
      })


      return totalCurrent
    }


    const getTotalPercentForRegion = (region) => {
      const totalPlan = getTotalPlanForRegion(region)
      const totalFact = getTotalFactForRegion(region)
      return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
    }

    const getRegionPercent = (region, weekId = null) => {
      if (weekId && weekId !== 'all') {
        const weekData = getRegionWeekData(region, weekId)
        return calculatePercent(weekData.plan, weekData.fact)
      }
      const totalPlan = getTotalPlanForRegion(region)
      const totalFact = getTotalFactForRegion(region)
      return calculatePercent(totalPlan, totalFact)
    }


    const sortedRegions = computed(() => {
      if (!regions.value) return []

      let filtered = [...regions.value]

      if (selectedRegions.value.length > 0) {
        filtered = filtered.filter(region => selectedRegions.value.includes(region.name))
      }

      filtered.sort((a, b) => {
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
          case 'regionFact':
            aValue = getRegionFact(a, sortWeek.value)
            bValue = getRegionFact(b, sortWeek.value)
            break
          default:
            return 0
        }

        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
      })

      return filtered
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
        let totalCurrent = 0
        weeks.value.forEach(week => {
          if (!weeklyScoresCache.value[week.id]) {
            weeklyScoresCache.value[week.id] = calculateCurrentScores(week.id)
          }
          totalCurrent += weeklyScoresCache.value[week.id][store.id] || 0
        })
        return totalCurrent
      }
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

    const getStorePercent = (store, weekId = null) => {
      if (weekId && weekId !== 'all') {
        const weekData = store.weeklyData?.find(w => w.weekId === weekId)
        if (!weekData) return 0
        return calculatePercent(weekData.plan, weekData.fact)
      }

      return getTotalPercentForStore(store)
    }


    const getAllSortedStores = () => {
      const allStores = []

      regions.value.forEach(region => {
        if (selectedRegions.value.length > 0 && !selectedRegions.value.includes(region.name)) {
          return
        }
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
            return (a.rank || 0) - (b.rank || 0)
        }

        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
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
          // col.style.transition = 'all 0.3s ease-out'
          col.style.maxWidth = '0'
          col.style.opacity = '0'
          col.style.overflow = 'hidden'
          col.style.padding = '0 0'
          col.style.borderRightWidth = '0'
          col.style.minWidth = '0'
          // col.style.gridColumn = '6'

        })

        factColumns.forEach(col => {
          // col.style.transition = 'all 0.3s ease-out'
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
            // col.style.transition = 'all 0.3s ease-out'
            col.style.maxWidth = ''
            col.style.opacity = '1'
            col.style.overflow = ''
            col.style.padding = ''
            col.style.borderRightWidth = ''
            col.style.minWidth = ''
          })

          factColumns.forEach(col => {
            // col.style.transition = 'all 0.3s ease-out'
            col.style.maxWidth = ''
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


    const sortByFact = (weekId) => {
      isAnimating.value = true
      if (sortBy.value === 'regionFact' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'regionFact'
        sortWeek.value = weekId
        sortOrder.value = 'asc' 
      }

      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    const getRegionFact = (region, weekId) => {
      if (!weekId || weekId === 'all') {
        return getTotalFactForRegion(region)
      }

      const weekData = getRegionWeekData(region, weekId)
      return weekData.fact
    }

    const sortByPlan = (weekId) => {
      isAnimating.value = true

      if (sortBy.value === 'regionPlan' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'regionPlan'
        sortWeek.value = weekId
        sortOrder.value = 'asc' 
      }

      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    const getRegionPlan = (region, weekId) => {
      if (!weekId || weekId === 'all') {
        return getTotalFactForRegion(region)
      }

      const weekData = getRegionWeekData(region, weekId)
      return weekData.fact
    }


    const sortByCurrent = (weekId) => {
      isAnimating.value = true

      if (sortBy.value === 'regionCurrent' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'regionCurrent'
        sortWeek.value = weekId
        sortOrder.value = 'asc' // По умолчанию сортируем по убыванию
      }

      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    const sortByPercent = (weekId) => {
      isAnimating.value = true
      if (sortBy.value === 'regionPercent' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'regionPercent'
        sortWeek.value = weekId
        sortOrder.value = 'asc' 
      }
      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    const sortByRank = (weekId) => {
      isAnimating.value = true
      if (sortBy.value === 'regionRank' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'regionRank'
        sortWeek.value = weekId
        sortOrder.value = 'asc' 
      }
      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }



    const sortByStorePercent = (weekId) => {
      isAnimating.value = true
      if (sortBy.value === 'storePercent' && sortWeek.value === weekId) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = 'storePercent'
        sortWeek.value = weekId
        sortOrder.value = 'asc'
      }
      setTimeout(() => {
        isAnimating.value = false
      }, 600)
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      sortByStorePercent,
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
      loadData,
      sortByFact,
      sortByPlan,
      sortByCurrent,
      sortByPercent,
      sortByRank,
      selectedRegions,
    }
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
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

  // Собираем все магазины для расчета рейтинга
  const allStores = []
  regions.value.forEach(region => {
    if (region.stores) {
      region.stores.forEach(store => {
        store.regionId = region.id
        store.regionName = region.name
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
    storesWithValues.sort((a, b) => shouldSortAsc ? a.value - b.value : b.value - a.value)
    
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
        
        return { region, value }
      })
      
      // Сортируем по убыванию (для большинства показателей выше = лучше)
      // Для losses, shortages, unprocessed - по возрастанию (меньше = лучше)
      const shouldSortAsc = ['losses', 'shortages', 'unprocessed'].includes(columnKey)
      regionsWithValues.sort((a, b) => shouldSortAsc ? a.value - b.value : b.value - a.value)
      
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
  
  // Сортируем регионы по общему проценту выполнения
  sorted.sort((a, b) => b.totalPercent - a.totalPercent)
  
  // Присваиваем ранги регионам
  sorted.forEach((region, index) => {
    region.regionRank = index + 1
  })
  
  if (sortByRank.value) {
    // Сортируем магазины внутри каждого региона по рангу
    sorted.forEach(region => {
      if (region.stores) {
        region.stores.sort((a, b) => (a.overallRank || 0) - (b.overallRank || 0))
      }
    })
  }
  
  return sorted
})

const getSortedStores = (region) => {
  if (!region.stores) return []
  
  if (sortByRank.value) {
    return [...region.stores].sort((a, b) => (a.overallRank || 0) - (b.overallRank || 0))
  }
  
  return region.stores
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

const refreshData = async () => {
  await loadData()
}

onMounted(() => {
  loadData()
})
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
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
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

.controls-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  height: 52px;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-order-btn {
<<<<<<< HEAD
  padding: 8px 12px;
=======
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
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.sort-order-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.sort-order-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.refresh-btn {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  color: #409eff;
  border-color: #409eff;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.week-toggles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-columns-btn {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s;
}

.toggle-columns-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.toggle-columns-btn.is-hidden {
  opacity: 0.7;
  background: #f5f5f5;
}

.custom-table {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
<<<<<<< HEAD
  overflow: hidden;
}

.table {
  width: 100%;
  min-width: 1400px;
  border: 1px solid #ccc;
  box-sizing: border-box;
=======
  overflow-x: auto;
  scrollbar-color: #1976d2 #e3f2fd;
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

<<<<<<< HEAD
.row {
  display: flex;
  width: 100%;
}

.cell {
  padding: 8px 4px;
=======
.header-cell {
  padding: 8px 0;
  text-align: center;
  font-weight: 600;
  color: #333;
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
  border-right: 1px solid $border-week;
  border-bottom: 1px solid $border-week;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell.static {
  width: 256px;
  flex-shrink: 0;
  background: #f9f9f9;
  font-weight: bold;
}

.cell.dynamic {
  font-size: 12px;
  transition: all 0.3s ease-out;
}

.header-cell {
  font-weight: 600;
  color: #333;
  background: #e3f2fd;
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
  height: 36px;
}

.table-body {
  background: white;
}

.data-row {
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.data-row:hover {
  background: #fafafa;
  transform: translateY(-1px);
  box-shadow: 0 1px 8px rgba(2, 52, 122, 0.3);
  z-index: 5;
  position: relative;
}

.region-row {
  background: #f8f9fa;
  font-weight: 600;
}

.data-cell {
  font-size: 13px;
}

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

.store-rank-number,
.region-rank-number {
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

.points {
  font-weight: 600;
  color: #007bff;
}

.rank {
  font-weight: 600;
  color: #6c757d;
}

// Условное форматирование по рангам
.top-rank {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.mid-rank {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.low-rank {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
}

.region-top-rank {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.region-mid-rank {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.region-low-rank {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.region-indicator.region-top-rank {
  background: #4caf50;
}

.region-indicator.region-mid-rank {
  background: #ff9800;
}

.region-indicator.region-low-rank {
  background: #f44336;
}

// Стрелки направления
.rank-arrow,
.region-arrow {
  font-size: 16px;
  font-weight: bold;
}

.arrow-up {
  color: #28a745;
}

.arrow-stable {
  color: #ffc107;
}

.arrow-down {
  color: #dc3545;
}

// Процентное форматирование
.excellent {
  color: #2e7d32;
  font-weight: bold;
}

.good {
  color: #388e3c;
}

.average {
  color: #f57c00;
}

.poor {
  color: #d32f2f;
  font-weight: bold;
}

.points-cell {
  font-weight: bold;
  color: #007bff;
}

<<<<<<< HEAD
.table-separator {
  height: 10px;
  background: #e3f2fd;
  border-top: 2px solid #91b6db;
  border-bottom: 2px solid #91b6db;
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
  border-right: 1px solid #0a0915;
}

.cols {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 13px;
}

// Условное форматирование по рангам в колонках
.column-rank-top {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  font-weight: 600;
}

.column-rank-good {
  background: linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%);
  color: #7b1fa2;
}

.column-rank-average {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
  color: #e65100;
}

.column-rank-below {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
  color: #c2185b;
}

.column-rank-poor {
  background: linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%);
  color: #d32f2f;
  font-weight: 600;
}

// Дополнительное форматирование для процентов
.percent-excellent {
  color: #1b5e20 !important;
  font-weight: bold;
}

.percent-good {
  color: #2e7d32 !important;
}

.percent-average {
  color: #ef6c00 !important;
}

.percent-poor {
  color: #c62828 !important;
  font-weight: bold;
}

// Форматирование для отрицательных показателей
.negative-indicator {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  font-weight: 500;
}

.week_name {
  font-weight: 600;
  color: $text-week;
  padding: 8px;
  text-align: center;
  width: 100%;
}

// Размеры колонок будут приходить из API настроек
.cell.static {
  min-width: 256px; // Минимальная ширина для названий
}

.cell.dynamic {
  min-width: 60px; // Минимальная ширина для данных
  flex: 1; // Автоматическое распределение
}
=======
// .table-separator {
//   display: flex;
//   height: 22px;
//   background: #e3f2fd;
// }
// .sorter {
//   display: flex;
// }
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
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

// Анимации для transition-group
.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.5s ease;
}

.table-row-enter-from,
.table-row-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.table-row-move {
  transition: transform 0.5s ease;
}

<<<<<<< HEAD
@media (max-width: 768px) {
  .controls-panel {
    flex-direction: column;
    gap: 15px;
  }
  
  .week-toggles {
    width: 100%;
    justify-content: center;
  }
=======
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
>>>>>>> 557ad9291ee41f3d5c07534ac7cdf46543e544d7
}


.sort-indicator {
  margin-left: 4px;
  font-size: 14px;
  color: #0f4478;
  font-weight: bold;
}

.header-cell:hover .sort-indicator {
  color: #66b1ff;
}

.sort_class:hover {
  background-color: #c9ddf1;
}





.region-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.checkbox-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.3s;
}

.checkbox-wrapper:hover {
  opacity: 0.8;
}

.region-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background: white;
}

.region-checkbox:checked ~ .checkbox-custom {
  border-color: #1a4b7d;
  background: #ecf5ff;
}

.checkbox-indicator {
  width: 0;
  height: 0;
  border-radius: 2px;
  transition: all 0.3s;
}

.region-checkbox:checked ~ .checkbox-custom .checkbox-indicator {
  width: 12px;
  height: 12px;
}

.checkbox-label {
  font-size: 14px;
  color: #606266;
}

.clear-filters-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #909399;
  transition: all 0.3s;
}

.clear-filters-btn:hover {
  color: #f56c6c;
  border-color: #f56c6c;
}



.table-separator {
  display: flex;
  height: 22px;
  background: #e3f2fd;
}
.sorter {
  display: flex;
}

.sort_mag {
  min-width: 240px;
}
.sorter {
  // position: absolute;
  display: flex;
  width: 100%;
}


.ind_wrap {
  position: absolute;
  
}
.sorter_item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-indicato {
  margin-left: 4px;
  font-size: 13px;
  color: #0f4478;
  font-weight: bold;
}
</style>