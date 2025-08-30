import { defineStore } from 'pinia'

export const useDataTransformStore = defineStore('dataTransform', {
  state: () => ({
    rawDailyData: [],
    transformedData: null,
    monthlyTransformedData: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
    transformType: 'weekly',

    availableIndicators: [],
    baseIndicators: ['plan', 'fact'],
    dynamicIndicators: [],

    completedPeriodsOnly: true,
    currentDate: null
  }),

  getters: {

    availableWeeks: (state) => {
      if (!state.transformedData?.weeks) return []
      return state.transformedData.weeks
    },

    availableMonths: (state) => {
      if (!state.monthlyTransformedData?.months) return []
      return state.monthlyTransformedData.months
    },

    availableRegions: (state) => {
      const data = state.transformType === 'monthly'
        ? state.monthlyTransformedData
        : state.transformedData
      if (!data?.regions) return []
      return Object.values(data.regions)
    },

    transformStats: (state) => {
      const data = state.transformType === 'monthly'
        ? state.monthlyTransformedData
        : state.transformedData

      if (!state.rawDailyData.length || !data) {
        return {
          dailyRecords: 0,
          periods: 0,
          regions: 0,
          stores: 0,
          type: state.transformType,
          indicators: state.availableIndicators.length
        }
      }

      const regions = Object.keys(data.regions).length
      const stores = Object.values(data.regions)
        .reduce((total, region) => total + (region.stores?.length || 0), 0)

      const periods = state.transformType === 'monthly'
        ? (data.months?.length || 0)
        : (data.weeks?.length || 0)

      return {
        dailyRecords: state.rawDailyData.length,
        periods,
        regions,
        stores,
        type: state.transformType,
        indicators: state.availableIndicators.length,
        dynamicIndicators: state.dynamicIndicators.length
      }
    },

    currentData: (state) => {
      return state.transformType === 'monthly'
        ? state.monthlyTransformedData
        : state.transformedData
    },

    completedPeriodsInfo: (state) => {
      if (!state.rawDailyData.length) return null

      const allPeriods = state.transformType === 'monthly'
        ? state.getUniqueMonths(state.rawDailyData)
        : state.getUniqueWeeks(state.rawDailyData)

      const completedCount = state.getCompletedPeriods(allPeriods, state.transformType).length

      return {
        total: allPeriods.length,
        completed: completedCount,
        incomplete: allPeriods.length - completedCount,
        showingCompleted: state.completedPeriodsOnly
      }
    }
  },

  actions: {

    analyzeDataStructure(dailyData) {
      if (!dailyData.length) return

      const firstRecord = dailyData[0]
      const allIndicators = new Set()
      const dynamicIndicators = new Set()

      dailyData.forEach(record => {
        Object.keys(record).forEach(key => {

          if (!['region_data', 'shop', 'week'].includes(key)) {
            allIndicators.add(key)

            if (!this.baseIndicators.includes(key)) {
              dynamicIndicators.add(key)
            }
          }
        })
      })

      this.dynamicIndicators = Array.from(dynamicIndicators).sort()
      this.availableIndicators = Array.from(allIndicators).sort()

    },

    getUniqueWeeks(dailyData) {
      const weeks = new Map()

      dailyData.forEach(record => {
        const weekKey = `${record.week.number}-${record.week.start.split('.')[2]}`
        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, {
            number: record.week.number,
            year: record.week.start.split('.')[2],
            start: record.week.start,
            end: record.week.end,
            key: weekKey,
            days: new Set()
          })
        }
        weeks.get(weekKey).days.add(record.week.day)
      })

      return Array.from(weeks.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.number - b.number
      })
    },

    getUniqueMonths(dailyData) {
      const months = new Map()

      dailyData.forEach(record => {
        const [day, month, year] = record.week.day.split('.')
        const monthKey = `${year}-${month.padStart(2, '0')}`

        if (!months.has(monthKey)) {
          months.set(monthKey, {
            year: parseInt(year),
            month: parseInt(month),
            key: monthKey,
            days: new Set(),
            startDate: null,
            endDate: null
          })
        }

        const monthData = months.get(monthKey)
        monthData.days.add(record.week.day)

        const currentDate = record.week.day
        if (!monthData.startDate || currentDate < monthData.startDate) {
          monthData.startDate = currentDate
        }
        if (!monthData.endDate || currentDate > monthData.endDate) {
          monthData.endDate = currentDate
        }
      })

      return Array.from(months.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
    },

    getCompletedPeriods(periods, type = 'weekly') {
      if (!periods.length) return []

      // const currentDate = new Date('2025.07.25')
      const currentDate = new Date()
      const completed = []

      periods.forEach(period => {
        let isCompleted = false

        if (type === 'weekly') {

          const [endDay, endMonth, endYear] = period.end.split('.')
          const weekEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59)
          isCompleted = currentDate > weekEndDate
        } else if (type === 'monthly') {

          const monthEndDate = new Date(period.year, period.month, 0, 23, 59, 59)
          isCompleted = currentDate > monthEndDate
        }

        if (isCompleted) {
          completed.push(period)
        }
      })

      return completed
    },

    async loadAndTransformData(dailyData, type = 'weekly') {
      this.isLoading = true
      this.error = null

      try {

        this.rawDailyData = dailyData
        this.transformType = type
        this.currentDate = new Date().toISOString()

        this.analyzeDataStructure(dailyData)

        if (type === 'monthly') {
          this.monthlyTransformedData = this.transformDailyToMonthly(dailyData)
        } else {
          this.transformedData = this.transformDailyToWeekly(dailyData)
        }

        this.lastUpdate = new Date().toISOString()

      } catch (error) {
        console.error('Ошибка:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    transformDailyToWeekly(dailyData) {

      const allWeeks = this.getUniqueWeeks(dailyData)
      const weeksToProcess = this.completedPeriodsOnly
        ? this.getCompletedPeriods(allWeeks, 'weekly')
        : allWeeks

      const weeklyGroups = this.groupByWeeks(dailyData, weeksToProcess)

      const weeks = this.createWeeksStructure(weeksToProcess)

      const regions = this.createRegionsStructureWeekly(weeklyGroups, weeks)

      return { weeks, regions }
    },

    groupByWeeks(dailyData, weeksToProcess) {
      const groups = new Map()
      const weekKeys = new Set(weeksToProcess.map(w => w.key))

      for (const record of dailyData) {
        const weekKey = `${record.week.number}-${record.week.start.split('.')[2]}`

        if (!weekKeys.has(weekKey)) continue

        if (!groups.has(weekKey)) {
          groups.set(weekKey, {
            weekInfo: weeksToProcess.find(w => w.key === weekKey),
            records: []
          })
        }

        groups.get(weekKey).records.push(record)
      }

      return groups
    },

    createWeeksStructure(weeksToProcess) {
      return weeksToProcess.map(week => ({
        id: week.key,
        name: this.formatWeekName(week),
        dateRange: `${week.start} - ${week.end}`,
        start: week.start,
        end: week.end,
        number: week.number,
        year: week.year,
        daysCount: week.days.size
      }))
    },

    createRegionsStructureWeekly(weeklyGroups, weeks) {
      const regions = {}
      const regionStoreMap = new Map()

      for (const [weekKey, data] of weeklyGroups) {
        for (const record of data.records) {
          const regionKey = `region_${record.region_data.id}`
          const storeKey = record.shop.id.toString()

          if (!regionStoreMap.has(regionKey)) {
            regionStoreMap.set(regionKey, {
              regionInfo: record.region_data,
              stores: new Map()
            })
          }

          const regionData = regionStoreMap.get(regionKey)

          if (!regionData.stores.has(storeKey)) {
            regionData.stores.set(storeKey, {
              storeInfo: record.shop,
              weeklyData: new Map()
            })
          }

          const storeData = regionData.stores.get(storeKey)

          if (!storeData.weeklyData.has(weekKey)) {
            storeData.weeklyData.set(weekKey, [])
          }

          storeData.weeklyData.get(weekKey).push(record)
        }
      }

      for (const [regionKey, regionData] of regionStoreMap) {
        regions[regionKey] = {
          id: regionKey,
          name: regionData.regionInfo.name,
          color: regionData.regionInfo.color,
          stores: []
        }

        for (const [storeKey, storeData] of regionData.stores) {
          const store = {
            id: storeKey,
            name: storeData.storeInfo.name,
            originalId: storeData.storeInfo.id,
            weeklyData: []
          }

          for (const week of weeks) {
            const weekKey = week.id
            const dailyRecords = storeData.weeklyData.get(weekKey) || []

            const weeklyRecord = this.aggregateDailyToWeekly(dailyRecords, weekKey)
            store.weeklyData.push(weeklyRecord)
          }

          regions[regionKey].stores.push(store)
        }
      }

      return regions
    },

    aggregateDailyToWeekly(dailyRecords, weekId) {
      if (!dailyRecords.length) {

        const emptyRecord = { weekId, daysCount: 0 }
        this.availableIndicators.forEach(indicator => {
          emptyRecord[indicator] = 0
        })
        return emptyRecord
      }

      const aggregated = { weekId }

      this.availableIndicators.forEach(indicator => {
        aggregated[indicator] = 0
      })

      dailyRecords.forEach(record => {
        this.availableIndicators.forEach(indicator => {
          if (record[indicator] !== undefined && record[indicator] !== null) {
            aggregated[indicator] += Number(record[indicator]) || 0
          }
        })
      })

      aggregated.percent = aggregated.plan > 0
        ? Math.round((aggregated.fact / aggregated.plan) * 100)
        : 0

      aggregated.daysCount = dailyRecords.length

      return aggregated
    },

    transformDailyToMonthly(dailyData) {
      const allMonths = this.getUniqueMonths(dailyData)
      const monthsToProcess = this.completedPeriodsOnly
        ? this.getCompletedPeriods(allMonths, 'monthly')
        : allMonths

      const monthlyGroups = this.groupByMonths(dailyData, monthsToProcess)

      const months = this.createMonthsStructure(monthsToProcess)

      const regions = this.createRegionsStructureMonthly(monthlyGroups, months)

      return { months, regions }
    },

    groupByMonths(dailyData, monthsToProcess) {
      const groups = new Map()
      const monthKeys = new Set(monthsToProcess.map(m => m.key))

      for (const record of dailyData) {
        const [day, month, year] = record.week.day.split('.')
        const monthKey = `${year}-${month.padStart(2, '0')}`

        if (!monthKeys.has(monthKey)) continue

        if (!groups.has(monthKey)) {
          groups.set(monthKey, {
            monthInfo: monthsToProcess.find(m => m.key === monthKey),
            records: []
          })
        }

        groups.get(monthKey).records.push(record)
      }

      return groups
    },

    createMonthsStructure(monthsToProcess) {
      const monthNames = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
      ]

      return monthsToProcess.map(month => ({
        id: month.key,
        name: `${monthNames[month.month - 1]} ${month.year}`,
        dateRange: `${month.startDate} - ${month.endDate}`,
        year: month.year,
        month: month.month,
        daysCount: month.days.size
      }))
    },

    createRegionsStructureMonthly(monthlyGroups, months) {
      const regions = {}
      const regionStoreMap = new Map()

      for (const [monthKey, data] of monthlyGroups) {
        for (const record of data.records) {
          const regionKey = `region_${record.region_data.id}`

          const storeKey = record.shop.id.toString()

          if (!regionStoreMap.has(regionKey)) {
            regionStoreMap.set(regionKey, {
              regionInfo: record.region_data,
              stores: new Map()
            })
          }

          const regionData = regionStoreMap.get(regionKey)

          if (!regionData.stores.has(storeKey)) {
            regionData.stores.set(storeKey, {
              storeInfo: record.shop,
              monthlyData: new Map()
            })
          }

          const storeData = regionData.stores.get(storeKey)

          if (!storeData.monthlyData.has(monthKey)) {
            storeData.monthlyData.set(monthKey, [])
          }

          storeData.monthlyData.get(monthKey).push(record)
        }
      }

      for (const [regionKey, regionData] of regionStoreMap) {
        regions[regionKey] = {
          id: regionKey,
          name: regionData.regionInfo.name,
          color: regionData.regionInfo.color,
          stores: []
        }

        for (const [storeKey, storeData] of regionData.stores) {
          const store = {
            id: storeKey,
            name: storeData.storeInfo.name,
            originalId: storeData.storeInfo.id,
            monthlyData: []
          }

          for (const month of months) {
            const monthKey = month.id
            const dailyRecords = storeData.monthlyData.get(monthKey) || []

            const monthlyRecord = this.aggregateDailyToMonthly(dailyRecords, monthKey)
            store.monthlyData.push(monthlyRecord)
          }

          regions[regionKey].stores.push(store)
        }
      }

      return regions
    },

    aggregateDailyToMonthly(dailyRecords, monthId) {
      if (!dailyRecords.length) {

        const emptyRecord = { monthId, daysCount: 0, averageDaily: 0 }
        this.availableIndicators.forEach(indicator => {
          emptyRecord[indicator] = 0
        })
        return emptyRecord
      }

      const aggregated = { monthId }

      this.availableIndicators.forEach(indicator => {
        aggregated[indicator] = 0
      })

      dailyRecords.forEach(record => {
        this.availableIndicators.forEach(indicator => {
          if (record[indicator] !== undefined && record[indicator] !== null) {
            aggregated[indicator] += Number(record[indicator]) || 0
          }
        })
      })

      aggregated.percent = aggregated.plan > 0
        ? Math.round((aggregated.fact / aggregated.plan) * 100)
        : 0

      aggregated.averageDaily = dailyRecords.length > 0
        ? Math.round(aggregated.fact / dailyRecords.length)
        : 0

      aggregated.daysCount = dailyRecords.length

      return aggregated
    },

    getLastWeeksData(weeksCount = 2) {
      if (!this.transformedData) return null

      const weeks = this.transformedData.weeks
      if (!weeks.length) return null

      const lastWeeks = weeks.slice(-weeksCount)

      const filteredRegions = {}

      for (const [regionKey, region] of Object.entries(this.transformedData.regions)) {
        filteredRegions[regionKey] = {
          ...region,
          stores: region.stores.map(store => ({
            ...store,
            weeklyData: store.weeklyData.filter(weekData =>
              lastWeeks.some(week => week.id === weekData.weekId)
            )
          }))
        }
      }

      return {
        weeks: lastWeeks,
        regions: filteredRegions
      }
    },

    applyLastWeeksFilter(weeksCount = 2) {
      if (!this.transformedData) {
        console.warn('⚠️ Нет недельных данных для фильтрации')
        return
      }

      const filteredData = this.getLastWeeksData(weeksCount)
      if (filteredData) {

        this.transformedData = filteredData
      }
    },

    getAllWeeksData() {

      if (!this.rawDailyData.length) return null

      const originalSetting = this.completedPeriodsOnly
      this.completedPeriodsOnly = false

      const allData = this.transformDailyToWeekly(this.rawDailyData)

      this.completedPeriodsOnly = originalSetting

      return allData
    },

    toggleWeeksFilter(showOnlyLast = true, weeksCount = 2) {
      if (!this.rawDailyData.length) {
        throw new Error('Нет исходных данных для переключения фильтра')
      }

      if (showOnlyLast) {

        const allData = this.getAllWeeksData()
        this.transformedData = allData
        this.applyLastWeeksFilter(weeksCount)
      } else {
        this.transformedData = this.getAllWeeksData()
      }
    },

    getLastMonthsData(monthsCount = 2) {
      if (!this.monthlyTransformedData) return null

      const months = this.monthlyTransformedData.months
      if (!months.length) return null

      const lastMonths = months.slice(-monthsCount)

      const filteredRegions = {}

      for (const [regionKey, region] of Object.entries(this.monthlyTransformedData.regions)) {
        filteredRegions[regionKey] = {
          ...region,
          stores: region.stores.map(store => ({
            ...store,
            monthlyData: store.monthlyData.filter(monthData =>
              lastMonths.some(month => month.id === monthData.monthId)
            )
          }))
        }
      }

      return {
        months: lastMonths,
        regions: filteredRegions
      }
    },

    compareMonths(month1Id, month2Id) {
      if (!this.monthlyTransformedData) {
        throw new Error('Нет месячных данных. Сначала выполните преобразование с типом "monthly"')
      }

      const month1 = this.monthlyTransformedData.months.find(m => m.id === month1Id)
      const month2 = this.monthlyTransformedData.months.find(m => m.id === month2Id)

      if (!month1 || !month2) {
        throw new Error(`Месяц не найден: ${month1Id} или ${month2Id}`)
      }

      const comparison = {
        month1: { ...month1, totalFact: 0, totalPlan: 0 },
        month2: { ...month2, totalFact: 0, totalPlan: 0 },
        stores: [],
        indicatorsComparison: {}
      }

      this.availableIndicators.forEach(indicator => {
        comparison.indicatorsComparison[indicator] = {
          month1Total: 0,
          month2Total: 0,
          difference: 0,
          changePercent: 0
        }
      })

      for (const region of Object.values(this.monthlyTransformedData.regions)) {
        for (const store of region.stores) {
          const store1Data = store.monthlyData.find(m => m.monthId === month1Id)
          const store2Data = store.monthlyData.find(m => m.monthId === month2Id)

          if (store1Data && store2Data) {
            const storeComparison = {
              storeId: store.id,
              storeName: store.name,
              regionName: region.name,
              month1: store1Data,
              month2: store2Data,
              differences: {}
            }

            this.availableIndicators.forEach(indicator => {
              const val1 = store1Data[indicator] || 0
              const val2 = store2Data[indicator] || 0
              const diff = val2 - val1
              const changePercent = val1 > 0 ? Math.round((diff / val1) * 100) : 0

              storeComparison.differences[indicator] = {
                value: diff,
                percent: changePercent
              }

              comparison.indicatorsComparison[indicator].month1Total += val1
              comparison.indicatorsComparison[indicator].month2Total += val2
            })

            comparison.stores.push(storeComparison)
            comparison.month1.totalFact += store1Data.fact || 0
            comparison.month1.totalPlan += store1Data.plan || 0
            comparison.month2.totalFact += store2Data.fact || 0
            comparison.month2.totalPlan += store2Data.plan || 0
          }
        }
      }

      Object.keys(comparison.indicatorsComparison).forEach(indicator => {
        const data = comparison.indicatorsComparison[indicator]
        data.difference = data.month2Total - data.month1Total
        data.changePercent = data.month1Total > 0
          ? Math.round((data.difference / data.month1Total) * 100)
          : 0
      })

      comparison.totals = {
        factGrowth: comparison.month2.totalFact - comparison.month1.totalFact,
        factGrowthPercent: comparison.month1.totalFact > 0
          ? Math.round(((comparison.month2.totalFact - comparison.month1.totalFact) / comparison.month1.totalFact) * 100)
          : 0,
        planExecution1: comparison.month1.totalPlan > 0
          ? Math.round((comparison.month1.totalFact / comparison.month1.totalPlan) * 100)
          : 0,
        planExecution2: comparison.month2.totalPlan > 0
          ? Math.round((comparison.month2.totalFact / comparison.month2.totalPlan) * 100)
          : 0
      }

      return comparison
    },

    async switchTransformType(type) {
      if (!this.rawDailyData.length) {
        throw new Error('Нет исходных данных для преобразования')
      }

      if (this.transformType === type) return

      await this.loadAndTransformData(this.rawDailyData, type)
    },

    getLegacyFormatData() {
      return this.currentData
    },

    clearData() {
      this.rawDailyData = []
      this.transformedData = null
      this.monthlyTransformedData = null
      this.error = null
      this.lastUpdate = null
      this.transformType = 'weekly'
      this.availableIndicators = []
      this.dynamicIndicators = []
      this.currentDate = null
    },

    exportToCSV() {
      if (!this.transformedData) return ''

      const headers = ['Регион', 'Магазин', 'Неделя', ...this.availableIndicators]
      const rows = [headers.join(',')]

      for (const region of Object.values(this.transformedData.regions)) {
        for (const store of region.stores) {
          for (const weekData of store.weeklyData) {
            const week = this.transformedData.weeks.find(w => w.id === weekData.weekId)
            const row = [
              `"${region.name}"`,
              `"${store.name}"`,
              `"${week?.name || weekData.weekId}"`,
              ...this.availableIndicators.map(indicator => weekData[indicator] || 0)
            ]
            rows.push(row.join(','))
          }
        }
      }

      return rows.join('\n')
    },

    exportMonthlyToCSV() {
      if (!this.monthlyTransformedData) return ''

      const headers = ['Регион', 'Магазин', 'Месяц', ...this.availableIndicators, 'Дней в месяце', 'Средний день']
      const rows = [headers.join(',')]

      for (const region of Object.values(this.monthlyTransformedData.regions)) {
        for (const store of region.stores) {
          for (const monthData of store.monthlyData) {
            const month = this.monthlyTransformedData.months.find(m => m.id === monthData.monthId)
            const row = [
              `"${region.name}"`,
              `"${store.name}"`,
              `"${month?.name || monthData.monthId}"`,
              ...this.availableIndicators.map(indicator => monthData[indicator] || 0),
              monthData.daysCount,
              monthData.averageDaily
            ]
            rows.push(row.join(','))
          }
        }
      }

      return rows.join('\n')
    },

    formatWeekName(weekInfo) {
      const months = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
      ]

      const [day, month, year] = weekInfo.start.split('.')
      const monthIndex = parseInt(month) - 1

      return `${months[monthIndex]} ${year} (№${weekInfo.number})`
    },

    filterDataByDateRange(startDate, endDate) {
      if (!this.rawDailyData.length) return []

      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('.')
        return new Date(year, month - 1, day)
      }

      const start = parseDate(startDate)
      const end = parseDate(endDate)

      return this.rawDailyData.filter(record => {
        const recordDate = parseDate(record.week.day)
        return recordDate >= start && recordDate <= end
      })
    }
  }
})