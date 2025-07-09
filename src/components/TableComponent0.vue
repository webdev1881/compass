<template>
  <div class="table-container">
    <div v-if="loading" class="loading-bar">
      <div class="loading-progress"></div>
    </div>
    
    <div v-else class="content">
      <div class="week-title">
        {{ weekInfo.number }} тиждень ({{ weekInfo.startDate }} - {{ weekInfo.endDate }})
      </div>

      <!-- Таблица итогов по сетям -->
      <!-- <div class="table-wrapper networks-summary">
        <table class="custom-table">
          <thead>
            <tr>
              <th rowspan="2" class="network-col">Мережа</th>
              <th colspan="2" class="section-header">Загальний бал</th>
              <th colspan="4" class="section-header">Виторг</th>
              <th rowspan="2" class="metric-header">Втрати<br>Списання</th>
              <th rowspan="2" class="metric-header">Недостачі</th>
              <th rowspan="2" class="metric-header">ФОП</th>
              <th rowspan="2" class="metric-header">Від'ємні<br>залишки</th>
              <th rowspan="2" class="metric-header">Не проведені<br>списання</th>
            </tr>
            <tr>
              <th class="sub-header">РАНГ</th>
              <th class="sub-header score-header">649</th>
              <th class="sub-header score-header">100</th>
              <th class="sub-header">План</th>
              <th class="sub-header">Факт</th>
              <th class="sub-header">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="network in networksSummary" :key="network.id" class="network-summary-row">
              <td class="network-name">
                <span :class="['indicator', `indicator-${network.color}`]"></span>
                <span class="store-number">{{ network.rank }}</span>
                <span class="network-title">{{ network.name }}</span>
              </td>
              <td class="rank-cell">{{ network.rank }}</td>
              <td class="score-cell">
                <div class="score-bar-container">
                  <div class="score-value">{{ network.generalScore }}</div>
                  <div class="score-bar" :style="getScoreBarStyle(network.generalScore, 649)"></div>
                </div>
              </td>
              <td class="score-cell">
                <div class="score-bar-container">
                  <div class="score-value">{{ network.revenue.score }}</div>
                  <div class="score-bar revenue-bar" :style="getScoreBarStyle(network.revenue.score, 100)"></div>
                </div>
              </td>
              <td class="number-cell">{{ formatNumber(network.revenue.plan) }}</td>
              <td class="number-cell">{{ formatNumber(network.revenue.fact) }}</td>
              <td class="percent-cell" :class="getPercentClass(network.revenue.percent)">
                {{ network.revenue.percent }}%
              </td>
              <td class="number-cell">{{ formatNumber(network.losses.writeOffs) }}</td>
              <td class="number-cell">{{ formatNumber(network.losses.shortages) }}</td>
              <td class="number-cell">{{ formatNumber(network.losses.fop) }}</td>
              <td class="status-cell">
                <span v-if="network.losses.negativeBalances > 0" class="status-value negative">
                  {{ network.losses.negativeBalances }}
                </span>
                <span v-else class="status-value">-</span>
              </td>
              <td class="status-cell">
                <span v-if="network.losses.unprocessedWriteOffs > 0" class="status-value negative">
                  {{ network.losses.unprocessedWriteOffs }}
                </span>
                <span v-else class="status-value">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div> -->

      <!-- Таблица магазинов -->
      <div class="table-wrapper stores-table">
        <table class="custom-table">
          <thead>
            <tr>
              <th rowspan="2" class="network-col">Магазин</th>
              <th colspan="2" class="section-header">Загальний бал</th>
              <th colspan="4" class="section-header">Виторг</th>
              <th rowspan="2" class="metric-header">Втрати<br>Списання</th>
              <th rowspan="2" class="metric-header">Недостачі</th>
              <th rowspan="2" class="metric-header">ФОП</th>
              <th rowspan="2" class="metric-header">Від'ємні<br>залишки</th>
              <th rowspan="2" class="metric-header">Не проведені<br>списання</th>
            </tr>
            <tr>
              <th class="sub-header">РАНГ</th>
              <th class="sub-header score-header">649</th>
              <th class="sub-header score-header">100</th>
              <th class="sub-header">План</th>
              <th class="sub-header">Факт</th>
              <th class="sub-header">%</th>
            </tr>
          </thead>


          
          <tbody>
            <template v-for="(storeGroup, networkName) in groupedStores" :key="networkName">
              <tr class="network-separator-row">
                <td colspan="12" class="network-separator">{{ networkName }}</td>
              </tr>
              <tr v-for="store in storeGroup" :key="store.id" class="store-row">
                <td class="store-name">
                  <span :class="['indicator', `indicator-${store.networkColor}`]"></span>
                  <span class="store-number">{{ store.rank }}</span>
                  <span class="store-title">{{ store.name }}</span>
                </td>
                <td class="rank-cell">{{ store.rank }}</td>
                <td class="score-cell">
                  <div class="score-bar-container">
                    <div class="score-value">{{ store.generalScore }}</div>
                    <div class="score-bar" :style="getScoreBarStyle(store.generalScore, 649)"></div>
                  </div>
                </td>
                <td class="score-cell">
                  <div class="score-bar-container">
                    <div class="score-value">{{ store.revenue.score }}</div>
                    <div class="score-bar revenue-bar" :style="getScoreBarStyle(store.revenue.score, 100)"></div>
                  </div>
                </td>
                <td class="number-cell">{{ formatNumber(store.revenue.plan) }}</td>
                <td class="number-cell">{{ formatNumber(store.revenue.fact) }}</td>
                <td class="percent-cell" :class="getPercentClass(store.revenue.percent)">
                  {{ store.revenue.percent }}%
                </td>
                <td class="number-cell">{{ formatNumber(store.losses.writeOffs) }}</td>
                <td class="number-cell">{{ formatNumber(store.losses.shortages) }}</td>
                <td class="number-cell">{{ formatNumber(store.losses.fop) }}</td>
                <td class="status-cell">
                  <span v-if="store.losses.negativeBalances > 0" class="status-value negative">
                    {{ store.losses.negativeBalances }}
                  </span>
                  <span v-else class="status-value">-</span>
                </td>
                <td class="status-cell">
                  <span v-if="store.losses.unprocessedWriteOffs > 0" class="status-value negative">
                    {{ store.losses.unprocessedWriteOffs }}
                  </span>
                  <span v-else class="status-value">-</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'TableComponent',
  setup() {
    const loading = ref(true)
    const weekInfo = ref({})
    const networksSummary = ref([])
    const stores = ref([])

    const groupedStores = computed(() => {
      const grouped = {}
      stores.value.forEach(store => {
        if (!grouped[store.networkName]) {
          grouped[store.networkName] = []
        }
        grouped[store.networkName].push(store)
      })
      return grouped
    })

    const formatNumber = (num) => {
      if (num === null || num === undefined) return '-'
      return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0
      }).format(num).replace(/\s/g, ' ')
    }

    const getScoreBarStyle = (value, maxValue) => {
      const percentage = Math.min((value / maxValue) * 100, 100)
      return {
        width: `${percentage}%`
      }
    }

    const getPercentClass = (percent) => {
      if (percent >= 80) return 'percent-high'
      if (percent >= 60) return 'percent-medium'
      return 'percent-low'
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/data0.json')
        const result = await response.json()
        
        setTimeout(() => {
          weekInfo.value = result.data.weekInfo
          networksSummary.value = result.data.networksSummary
          stores.value = result.data.stores
          loading.value = false
        }, 1500)
      } catch (error) {
        console.error('Error loading data:', error)
        loading.value = false
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      loading,
      weekInfo,
      networksSummary,
      stores,
      groupedStores,
      formatNumber,
      getScoreBarStyle,
      getPercentClass
    }
  }
}
</script>

<style scoped>
.table-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
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
  animation: fadeIn 0.25s ease-in;
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
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 20px;
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
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.store-row:hover {
  background: #fafafa;
}

.network-name,
.store-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 250px;
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
  font-size: 12px;
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
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  color: #333;
}

.percent-cell {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
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
  font-size: 11px;
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
</style>