/**
 * Адаптер для конвертации нового формата данных в старый
 */

export function convertDailyDataToWeekly(dailyData, period) {
  if (!Array.isArray(dailyData) || dailyData.length === 0) {
    return { weeks: [], regions: {} };
  }

  const weeksMap = new Map();
  const regionsMap = new Map();
  const storesMap = new Map();

  // Группируем данные по неделям, регионам и магазинам
  dailyData.forEach(dayRecord => {
    const weekNumber = dayRecord.week.number;
    let weekKey, weekName, dateRange;
    
    if (period === 'Два місяці') {
      
      // Для месяцев группируем по месяцам
      const dayDate = parseDate(dayRecord.week.day);
      const monthKey = `${dayDate.getFullYear()}-${dayDate.getMonth()}`;
      weekKey = monthKey;
      weekName = getMonthName(dayDate);
      
      // ИСПРАВЛЕНИЕ: создаем dateRange на основе границ месяца, а не данных
      const monthStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), 1);
      const monthEnd = new Date(dayDate.getFullYear(), dayDate.getMonth() + 1, 0);
      dateRange = `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
    } else {
      // Для недель оставляем как есть
      weekKey = weekNumber.toString();
      weekName = `Тиждень ${weekNumber}`;
      dateRange = `${dayRecord.week.start} - ${dayRecord.week.end}`;
    }

    const regionKey = `region_${dayRecord.region_data.id}`;
    const storeKey = `store_${dayRecord.shop.id}`;

    // Создаем период если его нет
    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, {
        id: weekKey,
        name: weekName,
        dateRange: dateRange
      });
    }
    // ИСПРАВЛЕНИЕ: для месяцев НЕ обновляем dateRange
    // Для недель можем обновлять, если нужно
    else if (period !== 'Два місяці') {
      const existing = weeksMap.get(weekKey);
      const currentStart = parseDate(existing.dateRange.split(' - ')[0]);
      const currentEnd = parseDate(existing.dateRange.split(' - ')[1]);
      const newStart = parseDate(dayRecord.week.start);
      const newEnd = parseDate(dayRecord.week.end);
      
      const finalStart = newStart < currentStart ? newStart : currentStart;
      const finalEnd = newEnd > currentEnd ? newEnd : currentEnd;
      
      existing.dateRange = `${formatDate(finalStart)} - ${formatDate(finalEnd)}`;
    }

    // Создаем регион если его нет
    if (!regionsMap.has(regionKey)) {
      regionsMap.set(regionKey, {
        id: regionKey,
        name: dayRecord.region_data.name,
        color: dayRecord.region_data.color,
        stores: []
      });
    }

    // Создаем магазин если его нет
    const storeUniqueKey = `${regionKey}_${storeKey}`;
    if (!storesMap.has(storeUniqueKey)) {
      const store = {
        id: storeKey,
        name: dayRecord.shop.name,
        weeklyData: []
      };
      storesMap.set(storeUniqueKey, store);
      regionsMap.get(regionKey).stores.push(store);
    }

    // Находим или создаем weeklyData для этого периода
    const store = storesMap.get(storeUniqueKey);
    let weeklyData = store.weeklyData.find(w => w.weekId === weekKey);
    
    if (!weeklyData) {
      weeklyData = {
        weekId: weekKey,
        plan: 0,
        fact: 0,
        percent: 0
      };
      
      // Добавляем все динамические поля (кроме plan и fact)
      const dynamicFields = Object.keys(dayRecord).filter(key => 
        !['region_data', 'shop', 'week', 'plan', 'fact'].includes(key)
      );
      
      dynamicFields.forEach(field => {
        weeklyData[field] = 0;
      });
      
      store.weeklyData.push(weeklyData);
    }

    // Суммируем данные по дням периода
    weeklyData.plan += dayRecord.plan || 0;
    weeklyData.fact += dayRecord.fact || 0;
    
    // Суммируем все динамические поля
    Object.keys(dayRecord).forEach(key => {
      if (!['region_data', 'shop', 'week', 'plan', 'fact'].includes(key)) {
        weeklyData[key] = (weeklyData[key] || 0) + (dayRecord[key] || 0);
      }
    });
  });

  // Вычисляем проценты после суммирования
  Object.values(storesMap).forEach(store => {
    store.weeklyData.forEach(weekData => {
      weekData.percent = weekData.plan > 0 ? Math.round((weekData.fact / weekData.plan) * 100) : 0;
    });
  });

  // Сортируем периоды
  const sortedWeeks = Array.from(weeksMap.values()).sort((a, b) => {
    if (period === 'Два місяці') {
      return a.id.localeCompare(b.id);
    } else {
      return parseInt(a.id) - parseInt(b.id);
    }
  });

  return {
    weeks: sortedWeeks,
    regions: Object.fromEntries(regionsMap)
  };
}

// Добавить функцию для получения красивого названия месяца
function getMonthName(date, locale = 'uk-UA') {
  try {
    return date.toLocaleString(locale, { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, (c) => c.toUpperCase()); // Делаем первую букву заглавной
  } catch (error) {
    // Fallback на английский, если украинская локаль не поддерживается
    const months = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}



export function getDateRangeForPeriod(period) {
  // const now = new Date('2025-07-20'); // Для отладки
  const now = new Date();
  let startDate, endDate;

  if (period === 'Два місяці') {
    // Берем два последних ПОЛНЫХ месяца
    // Если сегодня 30.08, то берем июнь (01.06-30.06) и июль (01.07-31.07)
    
    // Конец прошлого месяца
    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Начало месяца, который был два месяца назад
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
  } else { // 'Два тижні'
    // Берем две последние ПОЛНЫЕ недели (понедельник-воскресенье)
    
    // Находим понедельник текущей недели
    const day = now.getDay();
    const mondayThisWeek = new Date(now);
    mondayThisWeek.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    
    // Воскресенье прошлой недели (конец периода)
    endDate = new Date(mondayThisWeek);
    endDate.setDate(mondayThisWeek.getDate() - 1);
    
    // Понедельник недели, которая была две недели назад (начало периода)
    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 13); // 13 дней назад от воскресенья = понедельник 2 недели назад
  }

  return {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate)
  };
}

// Добавим функцию для отладки
export function getDateRangeDebugInfo(period) {
  const now = new Date();
  const range = getDateRangeForPeriod(period);
  
  console.log(`🗓️ Период: ${period}`);
  console.log(`📅 Сегодня: ${formatDate(now)}`);
  console.log(`📊 Диапазон: ${range.start_date} - ${range.end_date}`);
  
  if (period === 'Два місяці') {
    const start = parseDate(range.start_date);
    const end = parseDate(range.end_date);
    console.log(`📆 Месяцы: ${start.toLocaleString('uk-UA', { month: 'long', year: '2-digit' })} - ${end.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}`);
  }
  
  return range;
}

// Добавить функцию для получения названий периодов
export function getPeriodName(period, startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (period === 'Два місяці') {
    const startMonth = start.toLocaleString('uk-UA', { month: 'long' });
    const endMonth = end.toLocaleString('uk-UA', { month: 'long' });
    const year = start.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${year}`;
    } else {
      return `${startMonth} - ${endMonth} ${year}`;
    }
  } else {
    return `${startDate} - ${endDate}`;
  }
}

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function exportToCSV() {
  if (!this.convertDailyDataToWeekly) return ''

  const headers = ['Регион', 'Магазин', 'Неделя']
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
}

export function exportMonthlyToCSV() {
  if (!this.convertDailyDataToWeekly) return ''

  const headers = ['Регион', 'Магазин', 'Месяц', 'Дней в месяце', 'Средний день']
  const rows = [headers.join(',')]

  for (const region of Object.values(this.convertDailyDataToWeekly.regions)) {
    for (const store of region.stores) {
      for (const monthData of store.monthlyData) {
        const month = this.convertDailyDataToWeekly.months.find(m => m.id === monthData.monthId)
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
}
