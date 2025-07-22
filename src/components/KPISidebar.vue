<template>
  <div class="kpi">
    <button v-if="!isOpen" @click="togglePanel" class="kpi-toggle-btn" title="Открыть панель КПИ">
      <img src="https://i.ibb.co/fV6qHXLb/com.png" alt="" class="comp">
    </button>
    <div v-if="isOpen" class="kpi-overlay" @click="closePanel"></div>
    <div class="kpi-sidebar" :class="{ 'kpi-sidebar--open': isOpen }">
      <div class="kpi-header">
        <h2>📊 Ключевые показатели</h2>
        <button @click="closePanel" class="close-btn" title="Закрыть">✕</button>
      </div>

      <div class="kpi-content" v-if="processedData">

        <div class="kpi-section">
          <h3>🎯 Общая сводка</h3>
          <div class="kpi-cards">
            <div class="kpi-card primary">
              <div class="kpi-value">{{ processedData.totalStores }}</div>
              <div class="kpi-label">Всего магазинов</div>
            </div>
            <div class="kpi-card success">
              <div class="kpi-value">{{ processedData.totalRegions }}</div>
              <div class="kpi-label">Регионов</div>
            </div>
            <div class="kpi-card info">
              <div class="kpi-value">{{ formatNumber(processedData.averageScore) }}</div>
              <div class="kpi-label">Средний балл</div>
            </div>
            <div class="kpi-card warning">
              <div class="kpi-value">{{ processedData.planExecutionPercent }}%</div>
              <div class="kpi-label">Выполнение плана</div>
            </div>
          </div>
        </div>

        <div class="kpi-section">
          <h3>🏆 Топ регионы</h3>
          <div class="kpi-list">
            <div v-for="(region, index) in processedData.topRegions" :key="region.id" class="kpi-list-item"
              :class="`rank-${index + 1}`">
              <div class="rank-badge">{{ index + 1 }}</div>
              <div class="region-info">
                <div class="region-indicator" :style="{ backgroundColor: region.color }"></div>
                <span class="region-name">{{ region.name }}</span>
              </div>
              <div class="region-score">{{ formatNumber(region.score) }}</div>
            </div>
          </div>
        </div>

        <div class="kpi-section">
          <h3>⭐ Топ магазины</h3>
          <div class="kpi-list">
            <div v-for="(store, index) in processedData.topStores" :key="store.id" class="kpi-list-item"
              :class="`rank-${index + 1}`">
              <div class="rank-badge">{{ index + 1 }}</div>
              <div class="store-info">
                <div class="store-region-indicator" :style="{ backgroundColor: store.regionColor }"></div>
                <span class="store-name">{{ store.name }}</span>
                <span class="store-region">{{ store.regionName }}</span>
              </div>
              <div class="store-score">{{ formatNumber(store.overallTotalScore) }}</div>
            </div>
          </div>
        </div>

        <div class="kpi-section">
          <h3>⚠️ Проблемные зоны</h3>
          <div class="kpi-cards">
            <div class="kpi-card danger">
              <div class="kpi-value">{{ processedData.problemStores }}</div>
              <div class="kpi-label">Магазинов в зоне риска</div>
            </div>
            <div class="kpi-card warning">
              <div class="kpi-value">{{ processedData.belowPlanStores }}</div>
              <div class="kpi-label">Не выполняют план</div>
            </div>
          </div>

          <div class="problem-details">
            <div class="problem-item" v-for="issue in processedData.topIssues" :key="issue.type">
              <div class="issue-type">{{ issue.name }}</div>
              <div class="issue-stats">
                <span class="issue-value">{{ formatNumber(issue.totalValue) }}</span>
                <span class="issue-stores">{{ issue.affectedStores }} магазинов</span>
              </div>
            </div>
          </div>
        </div>

        <div class="kpi-section">
          <h3>📈 Динамика по неделям</h3>
          <div class="week-comparison">
            <div v-for="week in processedData.weeklyComparison" :key="week.id" class="week-stats">
              <div class="week-header">
                <div class="week-name">{{ week.name }}</div>
                <div class="week-period">{{ week.dateRange }}</div>
              </div>
              <div class="week-metrics">
                <div class="metric">
                  <span class="metric-label">Общий балл:</span>
                  <span class="metric-value">{{ formatNumber(week.totalScore) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Выполнение плана:</span>
                  <span class="metric-value">{{ week.planExecution }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Средний факт:</span>
                  <span class="metric-value">{{ formatNumber(week.averageFact) }}</span>
                </div>
              </div>
            </div>

            <div class="trend-indicator" v-if="processedData.weeklyTrend">
              <div class="trend-label">Тренд:</div>
              <div class="trend-value" :class="processedData.weeklyTrend.type">
                {{ processedData.weeklyTrend.icon }} {{ processedData.weeklyTrend.text }}
              </div>
            </div>
          </div>
        </div>

        <div class="kpi-section">
          <h3>🎯 Цели и достижения</h3>
          <div class="targets-overview">
            <div v-for="target in processedData.targetsOverview" :key="target.key" class="target-item">
              <div class="target-header">
                <span class="target-name">{{ target.name }}</span>
                <span class="target-score">{{ target.averageScore }}/{{ target.maxScore }}</span>
              </div>
              <div class="target-progress">
                <div class="progress-bar" :style="{ width: `${(target.averageScore / target.maxScore) * 100}%` }"></div>
              </div>
              <div class="target-stats">
                <span class="success-stores">✅ {{ target.successfulStores }}</span>
                <span class="problem-stores">❌ {{ target.problemStores }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  salesData: Object,
  targetsData: Object,
  regions: Array,
  weeks: Array
})

const isOpen = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const processedData = computed(() => {
  if (!props.salesData || !props.regions || !props.weeks) return null

  const allStores = []
  props.regions.forEach(region => {
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
  const totalRegions = props.regions.length
  const totalScore = allStores.reduce((sum, store) => sum + (store.overallTotalScore || 0), 0)
  const averageScore = totalStores > 0 ? Math.round(totalScore / totalStores) : 0

  let totalPlan = 0
  let totalFact = 0
  allStores.forEach(store => {
    props.weeks.forEach(week => {
      const weekData = store.weeklyData?.find(w => w.weekId === week.id)
      if (weekData) {
        totalPlan += weekData.plan || 0
        totalFact += weekData.fact || 0
      }
    })
  })
  const planExecutionPercent = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0

  const regionsWithScores = props.regions.map(region => {
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
    .slice(0, 5)

  const problemStores = allStores.filter(store => (store.overallTotalScore || 0) < averageScore * 0.7).length
  const belowPlanStores = allStores.filter(store => {
    let storePlan = 0
    let storeFact = 0
    props.weeks.forEach(week => {
      const weekData = store.weeklyData?.find(w => w.weekId === week.id)
      if (weekData) {
        storePlan += weekData.plan || 0
        storeFact += weekData.fact || 0
      }
    })
    return storePlan > 0 && (storeFact / storePlan) < 0.95
  }).length

  const topIssues = []
  if (props.targetsData?.targetTree) {
    Object.entries(props.targetsData.targetTree).forEach(([key, target]) => {
      let totalValue = 0
      let affectedStores = 0

      allStores.forEach(store => {
        let storeValue = 0
        props.weeks.forEach(week => {
          const weekData = store.weeklyData?.find(w => w.weekId === week.id)
          if (weekData && weekData[key]) {
            storeValue += weekData[key] || 0
          }
        })
        if (storeValue > 0) {
          totalValue += storeValue
          affectedStores++
        }
      })

      if (totalValue > 0) {
        topIssues.push({
          type: key,
          name: target.name,
          totalValue,
          affectedStores
        })
      }
    })
  }
  topIssues.sort((a, b) => b.totalValue - a.totalValue).splice(3)

  const weeklyComparison = props.weeks.map(week => {
    let weekTotalScore = 0
    let weekTotalPlan = 0
    let weekTotalFact = 0
    let storeCount = 0

    allStores.forEach(store => {
      const weekData = store.weeklyData?.find(w => w.weekId === week.id)
      if (weekData) {
        weekTotalScore += weekData.totalScore || 0
        weekTotalPlan += weekData.plan || 0
        weekTotalFact += weekData.fact || 0
        storeCount++
      }
    })

    return {
      ...week,
      totalScore: weekTotalScore,
      planExecution: weekTotalPlan > 0 ? Math.round((weekTotalFact / weekTotalPlan) * 100) : 0,
      averageFact: storeCount > 0 ? Math.round(weekTotalFact / storeCount) : 0
    }
  })

  let weeklyTrend = null
  if (weeklyComparison.length >= 2) {
    const latestWeek = weeklyComparison[0]
    const previousWeek = weeklyComparison[1]
    const scoreDiff = latestWeek.totalScore - previousWeek.totalScore
    const planDiff = latestWeek.planExecution - previousWeek.planExecution

    if (scoreDiff > 0 && planDiff > 0) {
      weeklyTrend = { type: 'positive', icon: '📈', text: 'Положительная динамика' }
    } else if (scoreDiff < 0 || planDiff < 0) {
      weeklyTrend = { type: 'negative', icon: '📉', text: 'Отрицательная динамика' }
    } else {
      weeklyTrend = { type: 'stable', icon: '➡️', text: 'Стабильные показатели' }
    }
  }

  const targetsOverview = []
  if (props.targetsData?.targetTree) {
    Object.entries(props.targetsData.targetTree).forEach(([key, target]) => {
      let totalScore = 0
      let successfulStores = 0
      let problemStores = 0

      allStores.forEach(store => {
        let storeScore = 0
        props.weeks.forEach(week => {
          const weekData = store.weeklyData?.find(w => w.weekId === week.id)
          if (weekData && weekData[`${key}_score`]) {
            storeScore += weekData[`${key}_score`] || 0
          }
        })

        totalScore += storeScore
        const averageStoreScore = props.weeks.length > 0 ? storeScore / props.weeks.length : 0

        if (averageStoreScore >= target.maxScore * 0.8) {
          successfulStores++
        } else if (averageStoreScore < target.maxScore * 0.5) {
          problemStores++
        }
      })

      const averageScore = allStores.length > 0 ? Math.round(totalScore / allStores.length) : 0

      targetsOverview.push({
        key,
        name: target.name,
        maxScore: target.maxScore,
        averageScore,
        successfulStores,
        problemStores
      })
    })
  }

  return {
    totalStores,
    totalRegions,
    averageScore,
    planExecutionPercent,
    topRegions: regionsWithScores,
    topStores,
    problemStores,
    belowPlanStores,
    topIssues,
    weeklyComparison,
    weeklyTrend,
    targetsOverview
  }
})

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0'
  }
  return new Intl.NumberFormat('ru-RU').format(number)
}

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
</script>

<style lang="scss" scoped>
// CSS переменные
:root {
  --primary-color: #1976d2;
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
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.kpi {

  .comp {
    width: 60px;
    height: 60px;
    border: #2c3e50 1px solid;
    border-radius: 6px;
    // padding: 3px;
  }

  .kpi-toggle-btn {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    // padding: 3px 4px;
    background: white;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
  }

  .kpi-toggle-btn:hover {
    background: #2c3e50;
    transform: translateY(-1px);
    box-shadow: var(--shadow-xl);
  }

  .kpi-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // background: rgba(255, 255, 255, 0.8);
    // background: white;
    z-index: 1001;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
    border-left: var(--shadow-md) // width: 20%;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .kpi-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    background: white;
    box-shadow: var(--shadow-xl);
    z-index: 1002;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
  }

  .kpi-sidebar--open {
    transform: translateX(0);
  }

  .kpi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 2px solid var(--border-color);
    background: var(--neutral-light);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .kpi-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--border-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--danger-light);
    color: var(--danger-color);
    transform: scale(1.1);
  }

  .kpi-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    scroll-behavior: smooth;
  }

  .kpi-content::-webkit-scrollbar {
    width: 6px;
  }

  .kpi-content::-webkit-scrollbar-track {
    background: var(--border-light);
  }

  .kpi-content::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .kpi-section {
    margin-bottom: 32px;
    animation: slideUp 0.6s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .kpi-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kpi-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .kpi-card {
    padding: 16px;
    border-radius: var(--radius-lg);
    text-align: center;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  .kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .kpi-card.primary {
    background: var(--info-light);
    border-color: var(--info-color);
  }

  .kpi-card.success {
    background: var(--success-light);
    border-color: var(--success-color);
  }

  .kpi-card.warning {
    background: var(--warning-light);
    border-color: var(--warning-color);
  }

  .kpi-card.danger {
    background: var(--danger-light);
    border-color: var(--danger-color);
  }

  .kpi-card.info {
    background: var(--neutral-light);
    border-color: var(--border-color);
  }

  .kpi-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .kpi-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .kpi-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
  }

  .kpi-list-item:hover {
    background: var(--surface);
    border-color: var(--border-color);
    transform: translateX(4px);
  }

  .kpi-list-item.rank-1 {
    background: var(--success-light);
    border-color: var(--success-color);
  }

  .kpi-list-item.rank-2 {
    background: var(--warning-light);
    border-color: var(--warning-color);
  }

  .kpi-list-item.rank-3 {
    background: var(--info-light);
    border-color: var(--info-color);
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: white;
    background: var(--text-secondary);
    flex-shrink: 0;
  }

  .rank-1 .rank-badge {
    background: var(--success-color);
  }

  .rank-2 .rank-badge {
    background: var(--warning-color);
  }

  .rank-3 .rank-badge {
    background: var(--info-color);
  }

  .region-info,
  .store-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .region-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    flex-shrink: 0;
  }

  .store-region-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .region-name,
  .store-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }

  .store-region {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 400;
  }

  .region-score,
  .store-score {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 14px;
    flex-shrink: 0;
  }

  .problem-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .problem-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--danger-light);
    border-radius: var(--radius-sm);
    border: 1px solid var(--danger-color);
  }

  .issue-type {
    font-weight: 600;
    color: var(--danger-color);
    font-size: 13px;
  }

  .issue-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .issue-value {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 14px;
  }

  .issue-stores {
    font-size: 11px;
    color: var(--text-muted);
  }

  .week-comparison {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .week-stats {
    padding: 16px;
    background: var(--surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
  }

  .week-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .week-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }

  .week-period {
    font-size: 12px;
    color: var(--text-muted);
  }

  .week-metrics {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .metric-value {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 13px;
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--neutral-light);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }

  .trend-label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 13px;
  }

  .trend-value {
    font-weight: 600;
    font-size: 13px;
  }

  .trend-value.positive {
    color: var(--success-color);
  }

  .trend-value.negative {
    color: var(--danger-color);
  }

  .trend-value.stable {
    color: var(--warning-color);
  }

  .targets-overview {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .target-item {
    padding: 16px;
    background: var(--surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
  }

  .target-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .target-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }

  .target-score {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 14px;
  }

  .target-progress {
    height: 8px;
    background: var(--border-light);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--success-color), var(--primary-color));
    border-radius: 4px;
    transition: width 0.8s ease;
  }

  .target-stats {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 500;
  }

  .success-stores {
    color: var(--success-color);
  }

  .problem-stores {
    color: var(--danger-color);
  }

  @media (max-width: 1024px) {
    .kpi-sidebar {
      width: 360px;
    }
  }

  @media (max-width: 768px) {
    .kpi-sidebar {
      width: 100vw;
    }

    .kpi-content {
      padding: 16px;
    }

    .kpi-cards {
      grid-template-columns: 1fr;
    }

    .kpi-toggle-btn {
      top: 10px;
      right: 10px;
      padding: 10px 14px;
      font-size: 13px;
    }
  }
}
</style>


