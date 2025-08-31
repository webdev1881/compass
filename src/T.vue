<template>
  <div class="odx-sales-dashboard">
    <div class="odx-controls">
      <div class="period-buttons">
        <button @click="loadData()" :class="{ active: selectedPeriod === 'Два місяці' }"
          :disabled="loading || selectedPeriod === 'Два місяці'" class="period-btn">
          {{ 'Місяці' }}
        </button>
        <button @click="loadData2()" :class="{ active: selectedPeriod === 'Два тижні' }"
          :disabled="loading || selectedPeriod === 'Два тижні'" class="period-btn">
          {{ 'Тижні' }}
        </button>
      </div>
      <div :style="headerStyle" class="odx-controls__refresh" @click="refreshData" :disabled="loading">
        Оновити
      </div>
      <div class="tooltip-controls">
        <label class="tooltip-toggle">
          <input type="checkbox" v-model="tooltipEnabled" />
          <span class="toggle-slider"></span>
          <span class="toggle-label">Підказки</span>
        </label>
      </div>

      <div :style="headerStyle" class="odx-controls__export" @click="exportToExcel" :disabled="loading || !salesData">
        📁 Експорт Excel
      </div>
      <a @click="scrollToSection('target-section')" href="#q">
        <div class="odx_q">?</div>
      </a>
    </div>

    <img :class="{ 'odx-palette-toggle--active': isPaletteOpen }" class="odx-palette-toggle" @click="togglePalette"
      src="https://toppng.com/uploads/preview/the-icon-is-shaped-like-an-oval-that-slightly-resembles-paint-palette-icon-11553394861oazcgcebd1.png"
      alt="Palette">

    <div class="odx-color-palette" :class="{ 'odx-color-palette--open': isPaletteOpen }">
      <div class="odx-color-palette__content">
        <h3>Палітра:</h3>
        <div class="odx-color-palette__grid">
          <div v-for="color in darkColors" :key="color" class="odx-color-option"
            :class="{ 'odx-color-option--selected': selectedColor === color }" :style="{ backgroundColor: color }"
            @click="changeColor(color)" :title="color" />
        </div>
        <div class="odx-format-controls">
          <label class="odx-toggle">
            <input type="checkbox" v-model="formatter" @click="formatter = !formatter" />
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

    <div v-if="showPlansEditor" class="odx-plans-overlay">
      <div class="odx-plans-container">
        <Plans @close="showPlansEditor = false" />
      </div>
    </div>

    <div v-if="error" class="odx-error">
      <div class="odx-error__icon">⚠️</div>
      <div class="odx-error__message">{{ error }}</div>
      <button class="odx-error__retry" @click="refreshData">Попробовать снова</button>
    </div>

    <div v-if="!loading && !error" class="odx-dashboard">

      <div class="odx-table-container">
        <div class="odx-table">
          <div class="odx-table__header" :style="headerStyle">
            <div class="odx-table__row odx-table__row--header-top">
              <div class="odx-table__cell odx-table__cell--static odx_top">Регіон / Магазин</div>
              <div class="odx-table__cell odx-table__cell--group odx_top" :style="{ width: dynamicRowWidth }">
                <div v-for="week in weeks" :key="week.id" class="odx-week">
                  <div class="odx-week__name">{{ week.name.replace(/\sр\.$/, '') }}</div>
                  <div class="odx-week__period">{{ week.dateRange }}</div>
                </div>
              </div>
            </div>

            <div class="odx-table__row odx-table__row--header-middle">
              <div class="odx-table__cell odx-table__cell--static"></div>
              <div v-for="week in weeks" :key="week.id" class="odx-week">
                <div class="odx-week__groups">
                  <div v-for="(group, index) in visibleGroups" :key="group.key" @mouseover="hoverColor"
                    class="odx-table__cell odx-table__cell--group-header" :style="getGroupStyle(group.key)"
                    :class="{ odx_right: index === visibleGroups.length - 1 }">
                    <div @click="toggleGroupVisibility(group.key)" class="odx-group-toggle" @mouseover="hoverColor">
                      <span>{{ group.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="odx-table__row odx-table__row--header-bottom">
              <div class="odx-table__cell odx-table__cell--static"></div>
              <div v-for="(week) in weeks" :key="week.id" class="odx-week">
                <div class="odx-week__columns">
                  <div v-for="(indicator, index) in availableIndicators" :key="indicator.key"
                    :class="{ odx_right: index === availableIndicators.length - 1 }"
                    class="odx-table__cell odx-table__cell--metric" :style="getStyle(indicator.key)"
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
              <transition-group name="table-row" tag="div">

                <div v-for="region in sortedRegions" :key="`region-${region.id}`"
                  class="odx-table__row odx-table__row--region" :class="getRegionRowClass(region.regionRank)">
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
                          class="odx-table__cell odx-table__cell--data odx-tooltip-trigger "
                          :class="getRegionCellClass(indicator.key, region, week.id)" :style="getStyle(indicator.key)"
                          @mouseenter="showTooltip($event, region, 'region', week.id, indicator.key)"
                          @mouseleave="hideTooltip" @mousemove="updateTooltipPosition">
                          {{ getRegionData(region, week.id, indicator.key) }}
                          <!-- | {{ region.overallTotalScore }} -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <div class="odx-separator">
              <div class="odx-sort-controls">
                <div class="odx-sort-controls__row">
                  <div class="odx-sort-controls__static"></div>
                  <div class="odx-sort-controls__weeks">
                    <div v-for="week in weeks" :key="week.id" class="odx-sort-week">
                      <div class="odx-sort-week__columns">
                        <div v-for="indicator in availableIndicators" :key="`sort-${week.id}-${indicator.key}`"
                          class="odx-sort-control" :class="getStoreSortArrowClass(week.id, indicator.key)"
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
              <transition-group name="table-row" tag="div">

                <div v-for="store in allStores" :key="`store-${store.id}`" class="odx-table__row odx-table__row--store"
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
                          @mouseleave="hideTooltip" @mousemove="updateTooltipPosition">
                          <!-- {{ indicator }} -->
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
      <div class="space" style="height: 500px;"></div>
      <div id="target-section" class="presentation">
        <h3>Типи показників</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Тип показника</th>
                <th>Логіка розрахунку</th>
                <th>Приклади</th>
                <th>Масштабованість</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Позитивні</strong></td>
                <td>Більше значення = кращий результат<br>
                  Процент = (факт / план) × 100</td>
                <td>Продажі, сервіс, дисципліна</td>
                <td>Необмежена кількість показників</td>
              </tr>
              <tr>
                <td><strong>Негативні</strong></td>
                <td>Менше значення = кращий результат<br>
                  Процент = (план / факт) × 100</td>
                <td>Втрати, Нестачі, ФОП, від'ємні залишки</td>
                <td>Автоматичне додавання нових типів</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="info-block" style="margin-bottom: 15px;">
          <div class="info-title">Масштабованість показників / обмеження</div>
          <ul>
            <li>Додавання нових показників через налаштування</li>
            <li>Автоматичне створення груп показників</li>
            <li>Підтримка необмеженої кількості регіонів, магазинів та періодів</li>
            <li>Обмеження несумірних значеннь (заглушка) = 200%</li>
          </ul>
        </div>

        <h3>Система балів та рангів</h3>

        <div class="formula-box">
          Бал = (процент виконання поточного показника / максимальний процент виконання) × maxScore (макс. бал по
          показнику)
        </div>

        <div class="two-column">
          <div class="info-block">
            <div class="info-title">Принципи розрахунку</div>
            <ul>
              <li>Бали розраховуються відносно найкращого результату</li>
              <li>Максимальний бал (maxScore) задається для кожного показника</li>
              <li>Адаптивність до різних діапазонів значень</li>
              <li>Ранги по окремим показникам</li>
            </ul>
          </div>

          <div class="info-block">
            <div class="info-title">Незалежність від періодів</div>
            <ul>
              <li>Групування базується на логіці коефіцієнтів</li>
              <li>Показники порівнюються відносно, не абсолютно</li>
              <li>Система працює з будь-якою кількістю періодів</li>
              <li>Історичні дані не впливають на поточні розрахунки</li>
              <li>Обмеження: замалі періоди</li>
            </ul>
          </div>
        </div>

        <div class="table-container">
          Приклади:
          <table>
            <thead>
              <tr>
                <th>Показник</th>
                <th>maxScore</th>
                <th>Тип</th>
                <th>Логіка розрахунку балів</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Оборот</td>
                <td>100</td>
                <td>Positive</td>
                <td>Найвищий % виконання плану отримує 100 балів</td>
              </tr>
              <tr>
                <td>Втрати</td>
                <td>20</td>
                <td>Negative</td>
                <td>Найменші втрати отримують 20 балів</td>
              </tr>
              <tr>
                <td>Недостачі</td>
                <td>20</td>
                <td>Negative</td>
                <td>Найменші недостачі отримують 20 балів</td>
              </tr>
              <tr>
                <td>ФОП</td>
                <td>15</td>
                <td>Negative</td>
                <td>Найменші ФОП отримують 15 балів</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Інтерактивні підказки (проміжні обчислення)</h3>
        <h4>Кнопка "Деталі" активує курсор при наведенні на табличні дані</h4>

        <div class="metrics-table">
          <div class="metric-group">
            <div class="metric-group-header">Базові розрахунки</div>
            <div class="metric-group-content">
              <div class="metric-item">
                <div class="metric-name">План показника</div>
                <div class="metric-desc">% від факту × факт</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">% виконання</div>
                <div class="metric-desc">залежить від типу показника</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">Бал показника</div>
                <div class="metric-desc">(% поточний / % максимальний) × maxScore</div>
              </div>
            </div>
          </div>

          <div class="metric-group">
            <div class="metric-group-header">Ранжування</div>
            <div class="metric-group-content">
              <div class="metric-item">
                <div class="metric-name">Ранг у колонці</div>
                <div class="metric-desc">позиція серед усіх об'єктів</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">Процентиль</div>
                <div class="metric-desc">(ранг / загальна кількість) × 100</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">Загальний рейтинг</div>
                <div class="metric-desc">сума балів усіх показників</div>
              </div>
            </div>
          </div>

          <div class="metric-group">
            <div class="metric-group-header">Інформація в підказках</div>
            <div class="metric-group-content">
              <div class="metric-item">
                <div class="metric-name">Розрахункові дані</div>
                <div class="metric-desc">план, факт, цілі, проценти</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">Бали та ранги</div>
                <div class="metric-desc">поточні та максимальні значення</div>
              </div>
              <div class="metric-item">
                <div class="metric-name">Контекст групи</div>
                <div class="metric-desc">тільки показники поточної групи</div>
              </div>
            </div>
          </div>
        </div>

        <h3>Умовне форматування (5 кольрів ранжування)</h3>

        <div class="table-container">
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Процентиль</th>
                <th>Опис категорії</th>
                <th>Колір фону</th>
                <th>Застосування</th>
              </tr>
            </thead>
            <tbody>
              <tr class="rank-1">
                <td>81-100%</td>
                <td>Топ-рівень (найкращі 20%)</td>
                <td>Зелений градієнт</td>
                <td>localstorage, spaindexdb</td>
              </tr>
              <tr class="rank-2">
                <td>61-80%</td>
                <td>Відмінний рівень</td>
                <td>Світло-зелений</td>
                <td>localstorage, spaindexdb</td>
              </tr>
              <tr class="rank-3">
                <td>41-60%</td>
                <td>Хороший рівень</td>
                <td>Жовтий/помаранчевий</td>
                <td>localstorage, spa_indexDB</td>
              </tr>
              <tr class="rank-4">
                <td>21-40%</td>
                <td>Середній рівень</td>
                <td>Помаранчевий</td>
                <td>localstorage, spaindexdb</td>
              </tr>
              <tr class="rank-5">
                <td>≤ 20%</td>
                <td>Низький рівень (потребує уваги)</td>
                <td>Червоний градієнт</td>
                <td>localstorage, spaindexdb</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="two-column">
          <div class="info-block">
            <div class="info-title">Автоматизація</div>
            <ul>
              <li>Автоматичні сповіщення при оновленні даних</li>
              <li>Форматування застосовується миттєво</li>
              <li>Немає необхідності в ручних налаштуваннях (окрім заповнення планових показників)</li>
              <li>Розрахунки адаптуються до змін в структурі даних</li>
            </ul>
          </div>
          <div class="info-block">
            <div class="info-title">Feauters</div>
            <ul>
              <li>Процентилі налаштовуються в ODOO</li>
              <li>Зберіання в Ексель</li>
              <li>Ранжування градієнтне</li>
              <li>Підтримка різних стилів для різних типів показників</li>
            </ul>
          </div>

        </div>

      </div>
    </div>


    <div class="kpi">
      <div v-if="!isOpen" @click="togglePanel" class="kpi-toggle-btn" title="Открыть панель КПИ">
        <img src="https://i.ibb.co/fV6qHXLb/com.png" alt="" class="comp">
      </div>
      <div v-if="isOpen" class="kpi-overlay" @click="closePanel"></div>
      <div class="kpi-sidebar" :class="{ 'kpi-sidebar--open': isOpen }">
        <div class="kpi-header">
          <h2>📊 Ключові показники (сума періодів)</h2>
          <button @click="closePanel" class="close-btn" title="Закрыть">✕</button>
        </div>

        <div class="kpi-content" v-if="processedData">

          <div class="kpi-section">
            <h3>🎯 Загальне зведення</h3>
            <div class="kpi-cards">
              <div class="kpi-card primary">
                <div class="kpi-value">{{ processedData.totalStores }}</div>
                <div class="kpi-label">Всьго магазинів</div>
              </div>
              <div class="kpi-card success">
                <div class="kpi-value">{{ processedData.totalRegions }}</div>
                <div class="kpi-label">Регіонів</div>
              </div>
              <div class="kpi-card info">
                <div class="kpi-value">{{ formatNumber(processedData.averageScore) }}</div>
                <div class="kpi-label">Середній бал</div>
              </div>
              <div class="kpi-card warning">
                <div class="kpi-value">{{ processedData.planExecutionPercent }}%</div>
                <div class="kpi-label">Виконання плану</div>
              </div>
            </div>
          </div>

          <div class="kpi-section">
            <h3>🏆 Топ регіони</h3>
            <div class="kpi-list">
              <div v-for="(region, index) in processedData.topRegions" :key="region.id" class="kpi-list-item"
                :class="`rank-${index + 1}`">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="region-info">
                  <div class="region-indicator" :style="{ backgroundColor: region.color }"></div>
                  <span class="region-name">{{ region.name }}</span>
                </div>
                <div class="region-score">{{ formatNumber(region.averageScore) }}</div>
              </div>
            </div>
          </div>

          <div class="kpi-section">
            <h3>⭐ Топ <b> {{ KPITopStores }} </b> магазини</h3>
            <div class="kpi-list">
              <div v-for="(store, index) in processedData.topStores" :key="store.id" class="kpi-list-item"
                :class="`rank-${index + 1}`">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="store-info">
                  <div class="store-region-indicator" :style="{ backgroundColor: store.regionColor }">
                  </div>
                  <span class="store-name">{{ store.name }}</span>
                  <span class="store-region">{{ store.regionName }}</span>
                </div>
                <div class="store-score">{{ formatNumber(store.overallTotalScore) }}</div>
              </div>
            </div>
          </div>

          <div class="kpi-section">
            <h3>⚠️ Проблемні зони</h3>
            <div class="kpi-cards">

              <div class="kpi-card danger odx-tip_tool ">
                <div class="kpi-value">{{ processedData.problemStores.length }}</div>
                <div v-if="processedData.problemStores.length" class="odx-tip_tooltext"
                  :style="`background-color: ${selectedColor};`">
                  <div v-for="val in (processedData.problemStores)" class="odx-tip_tooltext_item">
                    <div class="item">{{ val.name }}</div>
                    <div class="item">{{ val.overallTotalScore }}</div>
                  </div>
                </div>
                <div class="kpi-label">Магазинів в зоні ризику</div>
              </div>

              <div class="kpi-card warning odx-tip_tool ">
                <div class="kpi-value">{{ processedData.belowPlanStores.length }}</div>
                <div v-if="processedData.belowPlanStores.length" class="odx-tip_tooltext"
                  :style="`background-color: ${selectedColor};`">
                  <div v-for="val in (processedData.belowPlanStores)" class="odx-tip_tooltext_item">
                    <div class="item">{{ val.name }}</div>
                    <div class="item">{{ ((val.weeklyData[0].fact + val.weeklyData[1].fact) / (val.weeklyData[0].plan +
                      val.weeklyData[1].plan) * 100).toFixed(1) }}%</div>
                  </div>
                </div>

                <div class="kpi-label">Не виконують план</div>
              </div>
            </div>

            <div class="problem-details">
              <div class="problem-item" v-for="issue in processedData.topIssues" :key="issue.type">
                <div class="issue-type">{{ issue.name }}</div>
                <div class="issue-stats">
                  <span class="issue-value">{{ formatNumber(issue.totalValue) }}</span>
                  <span class="issue-stores">{{ issue.affectedStores }} магазинів</span>
                </div>
              </div>
            </div>
          </div>

          <div class="kpi-section">
            <h3>📈 Динаміка по неділям</h3>
            <div class="week-comparison">
              <div v-for="week in processedData.weeklyComparison" :key="week.id" class="week-stats">
                <div class="week-header">
                  <div class="week-name">{{ week.name }}</div>
                  <div class="week-period">{{ week.dateRange }}</div>
                </div>
                <div class="week-metrics">
                  <div class="metric">
                    <span class="metric-label">Загальний бал:</span>
                    <span class="metric-value">{{ formatNumber(week.totalScore) }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Виконання плану:</span>
                    <span class="metric-value">{{ week.planExecution }}%</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Середній факт:</span>
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
            <h3>🎯 Цілі та досягнення</h3>
            <div class="targets-overview">
              <div v-for="target in processedData.targetsOverview" :key="target.key" class="target-item">
                <div class="target-header">
                  <span class="target-name">{{ target.name }}</span>
                  <span class="target-score">{{ target.averageScore }}/{{ target.maxScore }}</span>
                </div>
                <div class="target-progress">
                  <div class="progress-bar" :style="{ width: `${(target.averageScore / target.maxScore) * 100}%` }">
                  </div>
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

    <div v-if="tooltip.visible && tooltip.data" class="odx-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', opacity: tooltip.x === 0 && tooltip.y === 0 ? 0 : 1 }">
      <div class="odx-tooltip__header">
        <div class="odx-tooltip__title">{{ tooltip.data.entityName }}</div>
        <div class="odx-tooltip__subtitle">{{ tooltip.data.weekName }} </div>
      </div>
      <div class="odx-tooltip__main">{{ tooltip.data.mainValue }}</div>
      <div class="odx-tooltip__details">
        <div v-for="detail in tooltip.data.details" :key="detail.label" class="odx-tooltip__detail">

          <span class="odx-tooltip__detail-label">{{ detail.label }}</span>
          <span class="odx-tooltip__detail-value">{{ detail.value }}</span>
        </div>
      </div>
    </div>
    <div class="space" style="height: 500px;"></div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, nextTick, watch, Transition } from 'vue'
import Plans from '../components/Plans.vue'
import { convertDailyDataToWeekly, getDateRangeForPeriod, getDateRangeDebugInfo, exportToCSV, exportMonthlyToCSV } from '../utils/dataAdapter.js'
import * as XLSX from 'xlsx'

const loading = ref(true)
const error = ref(null)
const salesData = ref(null)
const targetsData = ref(null)
const sortByTotalScore = ref(true)
const regions = ref([])
const tooltipEnabled = ref(true)
const formatter = ref(false)
const KPITopStores = ref(5)
const isOpen = ref(false)
const planScore = ref(0)
const showPlansEditor = ref(false)
const dynamicTargetsData = ref(null)
const darkColors = ref([
  '#1b263b', // тёмно-синий
  '#0d1b2a', // глубокий морской
  '#1a1a2e', // сине-фиолетовый
  '#2c3e50', // графитовый
  '#22333b', // угольно-зелёный
  '#1b4332', // тёмно-зелёный
  '#2d6a4f', // хвойный
  '#3a0ca3', // тёмный индиго
  '#240046', // насыщенный фиолетовый
  '#4b1459', // тёмная слива
  '#5a189a', // виноградный
  '#641220', // бордово-красный
  '#800f2f', // тёмная малина
  '#6a040f', // вишнёвый
  '#5c3c00', // тёмно-янтарный
  '#4e342e', // кофейный
  '#3e2723', // шоколадный
  '#2b2d31'  // нейтральный тёмный
])
const selectedColor = ref('#e3f2fd')
const isPaletteOpen = ref(false)

const selectedPeriod = ref('Два місяці')
const STORAGE_KEY_LIMIT = 'dashboardLimit'
const limit = ref(parseInt(localStorage.getItem(STORAGE_KEY_LIMIT)) || 200)

// const loadData = async () => {
//   try {
//     loading.value = true
//     error.value = null
//     selectedPeriod.value = 'Місяць'
//     const [salesResponse, targetsResponse] = await Promise.all([
//       // fetch('/com/static/data/output.json'),
//       // fetch('/com/static/data/targets.json'),
//       fetch('output.json'),
//       fetch('targets.json')
//     ])
//     if (!salesResponse.ok || !targetsResponse.ok) {throw new Error(`HTTP error! status: ${salesResponse.status || targetsResponse.status}`)}
//     const [salesDataResult, targetsDataResult] = await Promise.all([salesResponse.json(), targetsResponse.json()])
//     if (!salesDataResult.weeks || !salesDataResult.regions) {throw new Error('Невірна структура даних продаж')}
//     if (!targetsDataResult.targetTree || !targetsDataResult.storeTargets) {throw new Error('Невірна структура даних Цілей')}
//     const savedTargets = getSavedTargetsFromMemory()
//     salesData.value = salesDataResult
//     targetsData.value = savedTargets || targetsDataResult
//     dynamicTargetsData.value = targetsData.value
//     regions.value = Object.values(salesDataResult.regions)
//     initializeVisibility()
//     processData()
//     getSavedColor()

//   } catch (err) {
//     console.error('помилка  даных:', err)
//     error.value = err.message || 'помилка  даных'
//   } finally {setTimeout(() => {loading.value = false}, 400)}
// }

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    selectedPeriod.value = 'Два місяці'

    // const dateRange = getDateRangeForPeriod('Два місяці')
    const dateRange = getDateRangeDebugInfo('Два місяці')


    const [targetsResponse, dailyResponse] = await Promise.all([
      fetch('targets_month.json'),
      fetch('https://odoo.smkft.space/get_compass_data_by_day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateRange)
      })
    ])

    if (!targetsResponse.ok || !dailyResponse.ok) {
      throw new Error(`HTTP error! status: ${targetsResponse.status || dailyResponse.status}`)
    }

    const [targetsDataResult, dailyDataResult] = await Promise.all([
      targetsResponse.json(),
      dailyResponse.json()
    ])

    console.log(targetsDataResult)
    // Конвертируем новый формат в старый
    const salesDataResult = convertDailyDataToWeekly(dailyDataResult, 'Два місяці')

    if (!salesDataResult.weeks || !salesDataResult.regions) {
      throw new Error('Невірна структура даних продажів')
    }
    if (!targetsDataResult.targetTree || !targetsDataResult.storeTargets) {
      throw new Error('Невірна структура даних цілей')
    }

    const savedTargets = getSavedTargetsFromMemory('month')
    salesData.value = salesDataResult
    targetsData.value = savedTargets || targetsDataResult
    dynamicTargetsData.value = targetsData.value
    regions.value = Object.values(salesDataResult.regions)
    initializeVisibility()
    processData()
    getSavedColor()

  } catch (err) {
    console.error('помилка завантаження даних:', err)
    error.value = err.message || 'помилка завантаження даних'
  } finally {
    setTimeout(() => { loading.value = false }, 400)
  }
}


// const loadData2 = async () => {
//   try {
//     loading.value = true
//     error.value = null
//     selectedPeriod.value = 'Неділя'
//     const [salesResponse, targetsResponse] = await Promise.all([
//       // fetch('/com/static/data/output.json'),
//       // fetch('/com/static/data/targets.json'),
//       fetch('output.json'),
//       fetch('targets.json')
//     ])
//     if (!salesResponse.ok || !targetsResponse.ok) {throw new Error(`HTTP error! status: ${salesResponse.status || targetsResponse.status}`)}
//     const [salesDataResult, targetsDataResult] = await Promise.all([salesResponse.json(), targetsResponse.json()])
//     if (!salesDataResult.weeks || !salesDataResult.regions) {throw new Error('Неверная структура данных продаж')}
//     if (!targetsDataResult.targetTree || !targetsDataResult.storeTargets) {throw new Error('Неверная структура данных целей')}
//     const savedTargets = getSavedTargetsFromMemory()
//     salesData.value = salesDataResult
//     targetsData.value = savedTargets || targetsDataResult
//     dynamicTargetsData.value = targetsData.value
//     regions.value = Object.values(salesDataResult.regions)
//     initializeVisibility()
//     processData()
//     getSavedColor()

//   } catch (err) {
//     console.error('Ошибка загрузки данных:', err)
//     error.value = err.message || 'Ошибка загрузки данных'
//   } finally {setTimeout(() => {loading.value = false}, 400)}
// }

const loadData2 = async () => {
  try {
    loading.value = true
    error.value = null
    selectedPeriod.value = 'Два тижні'

    const dateRange = getDateRangeForPeriod('Два тижні')

    const [targetsResponse, dailyResponse] = await Promise.all([
      fetch('targets_week.json'),
      fetch('https://odoo.smkft.space/get_compass_data_by_day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateRange)
      })
    ])

    if (!targetsResponse.ok || !dailyResponse.ok) {
      throw new Error(`HTTP error! status: ${targetsResponse.status || dailyResponse.status}`)
    }

    const [targetsDataResult, dailyDataResult] = await Promise.all([
      targetsResponse.json(),
      dailyResponse.json()
    ])

    // Конвертируем новый формат в старый
    const salesDataResult = convertDailyDataToWeekly(dailyDataResult, 'Два тижні')

    if (!salesDataResult.weeks || !salesDataResult.regions) {
      throw new Error('Невірна структура даних продажів')
    }
    if (!targetsDataResult.targetTree || !targetsDataResult.storeTargets) {
      throw new Error('Невірна структура даних цілей')
    }

    const savedTargets = getSavedTargetsFromMemory('week')
    salesData.value = salesDataResult
    targetsData.value = savedTargets || targetsDataResult
    dynamicTargetsData.value = targetsData.value
    regions.value = Object.values(salesDataResult.regions)
    initializeVisibility()
    processData()
    getSavedColor()

  } catch (err) {
    console.error('помилка завантаження даних:', err)
    error.value = err.message || 'помилка завантаження даних'
  } finally {
    setTimeout(() => { loading.value = false }, 400)
  }
}

const saveColor = (color) => {
  try {
    localStorage.setItem('selectedColor', color)
  } catch (err) {
    console.error('Ошибка сохранения цвета в localStorage:', err)
  }
}

const getSavedColor = () => {
  try {
    selectedColor.value = localStorage.getItem('selectedColor') || selectedColor.value
    return selectedColor.value
  } catch (err) {
    console.error('Ошибка чтения цвета из localStorage:', err)
    return selectedColor.value // Цвет по умолчанию
  }
}

const getSavedTargetsFromMemory = (period) => {
  try {
    const saved = localStorage.getItem(`targetsData_${period}`)
    return saved ? JSON.parse(saved) : null
  } catch (err) {
    console.error('⚠ Ошибка чтения localStorage:', err)
    return null
  }
}

const saveTargetsToMemory = (data, period) => {
  try {
    localStorage.setItem(`targetsData_${period}`, JSON.stringify(data))
    return true
  } catch (err) {
    console.error('Ошибка сохранения в localStorage:', err)
    return false
  }
}


const handlePlansDataUpdate = (event) => {
  const newTargetsData = event.detail.data || event.detail

  if (newTargetsData && newTargetsData.targetTree && newTargetsData.storeTargets) {
    targetsData.value = {
      targetTree: { ...newTargetsData.targetTree },
      storeTargets: { ...newTargetsData.storeTargets }
    }
    dynamicTargetsData.value = targetsData.value

    const period = event.detail.period === 'month' ? 'month' : 'week'
    saveTargetsToMemory(targetsData.value, period)

    processData()
  } else {
    console.error('❌ Неверная структура данных от Plans.vue:', newTargetsData)
  }
}

const togglePlansEditor = () => {
  showPlansEditor.value = !showPlansEditor.value
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
        console.log( store )
        regionScore += store.overallTotalScore || 0
      })
    }
    return { ...region, score: regionScore, averageScore: Math.round(regionScore / region.stores.length) || 0 }
  }).sort((a, b) => b.score - a.score).slice(0, 2)

  const topStores = [...allStores]
    .sort((a, b) => (b.overallTotalScore || 0) - (a.overallTotalScore || 0))
    .slice(0, KPITopStores.value)

  const problemStores = allStores.filter(store => (store.overallTotalScore || 0) < averageScore * 0.8)
    .sort((a, b) => (a.overallTotalScore || 0) - (b.overallTotalScore || 0))
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
    return storePlan > 0 && (storeFact / storePlan) < 1
  })

  const topIssues = []
  let summ = 0;
  if (targetsData.value.targetTree) {
    Object.entries(targetsData.value.targetTree).forEach(([key, target]) => {
      let totalValue = 0
      let affectedStores = 0
      summ += target.maxScore
      allStores.forEach(store => {
        let storeValue = 0
        weeks.value.forEach(week => {
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
  planScore.value = summ
  topIssues.sort((a, b) => b.totalValue - a.totalValue)

  const weeklyComparison = weeks.value.map(week => {
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

    if (scoreDiff < 0 && planDiff < 0) {
      weeklyTrend = { type: 'positive', icon: '📈', text: 'Позитивна динаміка' }
    } else if (scoreDiff > 0) {
      weeklyTrend = { type: 'negative', icon: '📉', text: 'Негативна динаміка' }
    } else {
      weeklyTrend = { type: 'stable', icon: '➡️', text: 'Стабільні показники' }
    }
  }

  const targetsOverview = []
  if (targetsData.value.targetTree) {
    Object.entries(targetsData.value.targetTree).forEach(([key, target]) => {
      let totalScore = 0
      let successfulStores = 0
      let problemStores = []
      const storeAverages = [] // Массив для хранения средних баллов каждого магазина

      allStores.forEach(store => {
        let storeScore = 0
        let validWeeks = 0

        weeks.value.forEach(week => {
          const weekData = store.weeklyData?.find(w => w.weekId === week.id)
          if (weekData && weekData[`${key}_score`] !== undefined) {
            storeScore += weekData[`${key}_score`] || 0
            validWeeks++
          }
        })

        const averageStoreScore = validWeeks > 0 ? storeScore / validWeeks : 0
        storeAverages.push(averageStoreScore)
        totalScore += storeScore
      })

      const overallAverageScore = storeAverages.length > 0
        ? storeAverages.reduce((sum, score) => sum + score, 0) / storeAverages.length
        : 0

      const thresholdScore = overallAverageScore * 0.7 // 70% от среднего = средний минус 30%

      storeAverages.forEach((averageStoreScore, index) => {

        if (averageStoreScore >= overallAverageScore) {
          successfulStores++
        } else if (averageStoreScore < thresholdScore) {
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
    targetsOverview,
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
  const currentGroup = indicatorGroups.value.find(group =>
    group.indicators.some(ind => ind.key === indicator)
  )

  const result = {
    entityName: entity.name,
    weekName: week?.name || `Неділя ${weekId}`,
    groupName: currentGroup?.label || 'Показники',
    indicator: indicatorConfig?.label || indicator,
    mainValue: getDisplayValue(weekData, indicator),
    details: []
  }

  if (currentGroup) {
    if (currentGroup.key === 'score') {
      result.details.push({
        label: 'Загальний бал',
        value: weekData.totalScore || 0
      })
    } else if (currentGroup.key === 'turnover') {
      result.details.push(
        { label: 'План', value: formatNumber(weekData.plan || 0) },
        {
          label: 'Факт',
          value: `${formatNumber(weekData.fact || 0)} (${weekData.percent || 0}% від плану)`
        },
        { label: 'Процент обороту', value: `${weekData.percent || 0}%` },
      )

      if (weekData.turnover_score !== undefined) {
        const maxScore = targetsData.value?.targetTree?.turnover?.maxScore
        result.details.push({
          label: `Бал за оборот (з ${maxScore})`,
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
          { label: `${target.name} (факт)`, value: formatNumber(value) },
          {
            label: `План, коеф. %`,
            value: `  (${((targetValue / factValue) * 100).toFixed(2)}% від факту)`
          },
          {
            label: `Розрахунковий план. грн`,
            value: ` ${formatNumber(planValue)} `
          },
          {
            label: 'Факт обороту →',
            value: `${formatNumber(factValue)}`
          },
          { label: `Процент виконання`, value: `${percent}%` },
          { label: `Реальний Процент`, value: `${((planValue / value) * 100).toFixed(0)}%` },
          {
            label: `Бал (з ${target.maxScore})`,
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
      label: 'Ранг по показнику',
      value: `${weekData.columnRanks[indicator]} з ${totalItems}`
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
const hoverColor = () => {
  return 'style="background-color: ' + darkenColor(selectedColor.value, 10) + '!important;"'
}

const headerStyle = computed(() => ({
  backgroundColor: selectedColor.value,
  color: '#0f4478',
  // borderCollapse: 'separate',
  border: '1px solid #91b6db',
  borderSpacing: 0
}))

const changeColor = (color) => {
  selectedColor.value = color
  saveColor(color)
}
const togglePalette = () => { isPaletteOpen.value = !isPaletteOpen.value }
const closePalette = () => { isPaletteOpen.value = false }

const regionSortBy = ref({ weekId: null, columnKey: 'totalScore', direction: 'desc' })
const storeSortBy = ref({ weekId: null, columnKey: 'totalScore', direction: 'desc' })

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
    transform: isVisible ? 'width:105%' : 'width:0%',
    // willChange: 'transform',
    // transition: 'width 0.3s',
    transformOrigin: 'left right',
    fontWeight: key === 'totalScore' ? '700' : 'normal',
    borderRight: isVisible ? '1px solid #e0e0e0!important' : 'none!important',
  }
}

function getGroupStyle(groupKey) {
  const group = visibleGroups.value.find(g => g.key === groupKey)
  if (!group) return { width: '0%', transform: 'width:0%' }

  const total = visibleIndicators.value.length
  const groupWidth = group.visibleCount > 0 ? `${(group.visibleCount / total) * 100}%` : '0%'

  return {
    width: groupWidth,
    transform: group.visibleCount > 0 ? 'width:100%' : 'width:0%',
    transition: 'width 0.2s',
    willChange: 'transform',
    transformOrigin: 'left right',
    background: group.visibleCount > 1 ? darkenColor(selectedColor.value, 13) : '',
  }
}

// const processData = () => {
//   if (!regions.value || !salesData.value || !targetsData.value) return

//   regions.value.forEach(region => {
//     if (region.stores) {
//       region.stores.forEach(store => {
//         store.regionId = region.id
//         store.regionName = region.name
//         store.regionColor = region.color
//       })
//     }
//   })

//   const allStores = []
//   regions.value.forEach(region => {
//     if (region.stores) {
//       region.stores.forEach(store => {
//         allStores.push(store)
//       })
//     }
//   })

//   salesData.value.weeks.forEach(week => {
//     calculateWeeklyMetrics(week.id, allStores)
//   })

//   calculateRegionMetrics()
//   calculateRegionColumnRanks()
//   calculateOverallScores(allStores)
// }

// Добавьте эту функцию в начало script секции
const findStoreTargetConfig = (storeTargets, storeId) => {
  if (!storeTargets || typeof storeTargets !== 'object' || Array.isArray(storeTargets)) {
    console.error('❌ storeTargets не является объектом:', storeTargets)
    return {}
  }

  const idWithoutPrefix = storeId.replace('store_', '')
  if (storeTargets[idWithoutPrefix]) {
    return storeTargets[idWithoutPrefix]
  }

  if (storeTargets[storeId]) {
    return storeTargets[storeId]
  }

  return {}
}



const initializeSorting = () => {
  if (weeks.value && weeks.value.length > 0) {
    const firstWeekId = weeks.value[0].id

    // Обновляем сортировку только если weekId не установлен или недоступен
    if (!regionSortBy.value.weekId || !weeks.value.find(w => w.id === regionSortBy.value.weekId)) {
      regionSortBy.value.weekId = firstWeekId
    }

    if (!storeSortBy.value.weekId || !weeks.value.find(w => w.id === storeSortBy.value.weekId)) {
      storeSortBy.value.weekId = firstWeekId
    }
  }
}

// Обновите функцию processData, добавив вызов инициализации
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

  // Добавьте инициализацию сортировки после обработки данных
  initializeSorting()
}

// const calculateWeeklyMetrics = (weekId, allStores) => {
//   const { targetTree, storeTargets } = targetsData.value

//   allStores.forEach(store => {
//     const weekData = getStoreWeekData(store, weekId)
//     // console.log( 'store', store )
//     // console.log( 'storeTargets', storeTargets )
//     // console.log( 'storeTargets', storeTargets[store?.id] )
//     const storeTargetConfig = storeTargets[store?.id] || {}
//     weekData.percent = calculateTurnoverPercent(weekData.plan, weekData.fact)

//     Object.entries(targetTree).forEach(([key, targetConfig]) => {
//       if (key === 'turnover') return

//       const targetPercent = storeTargetConfig[key] || 0
//       const actualValue = weekData[key] || 0
//       const target = targetPercent * weekData.fact

//       let achievementPercent = 0

//       if (target > 0) {
//         if (targetConfig.type === 'negative') {
//           achievementPercent = Math.min((target / actualValue) * 100, limit.value)
//         } else {
//           achievementPercent = (actualValue / target) * 100
//         }
//       }

//       weekData[`${key}_percent`] = Math.round(achievementPercent)
//       weekData[`${key}_target`] = target
//     })
//   })

//   Object.entries(targetTree).forEach(([key, targetConfig]) => {
//     if (key === 'turnover') return
//     const maxPercent = Math.max(...allStores.map(store => {
//       const weekData = getStoreWeekData(store, weekId)
//       return weekData[`${key}_percent`] || 0
//     }))

//     allStores.forEach(store => {
//       const weekData = getStoreWeekData(store, weekId)
//       const currentPercent = weekData[`${key}_percent`] || 0
//       let score = 0

//       if (maxPercent > 0 && currentPercent > 0) {
//         score = Math.round((currentPercent / maxPercent) * targetConfig.maxScore)
//       }

//       weekData[`${key}_score`] = score
//     })
//   })

//   if (targetTree.turnover) {
//     const maxTurnoverPercent = Math.max(...allStores.map(store => {
//       const weekData = getStoreWeekData(store, weekId)
//       return weekData.percent || 0
//     }))

//     allStores.forEach(store => {
//       const weekData = getStoreWeekData(store, weekId)
//       const turnoverPercent = weekData.percent || 0
//       let turnoverScore = 0

//       if (maxTurnoverPercent > 0) {
//         turnoverScore = Math.round((turnoverPercent / maxTurnoverPercent) * targetTree.turnover.maxScore)
//       }

//       weekData.turnover_score = turnoverScore
//     })
//   }

//   allStores.forEach(store => {
//     const weekData = getStoreWeekData(store, weekId)
//     let totalScore = 0

//     Object.entries(targetTree).forEach(([key, targetConfig]) => {
//       if (key === 'turnover') {
//         totalScore += weekData.turnover_score || 0
//       } else {
//         totalScore += weekData[`${key}_score`] || 0
//       }
//     })

//     weekData.totalScore = totalScore
//   })

//   calculateColumnRanks(weekId, allStores)
// }

const calculateWeeklyMetrics = (weekId, allStores) => {
  const { targetTree, storeTargets } = targetsData.value

  // ОТЛАДКА: проверим структуру данных
  // console.log('🔍 Debug calculateWeeklyMetrics:', {
  //   'targetsData.value': targetsData.value,
  //   'targetTree type': typeof targetTree,
  //   'storeTargets type': typeof storeTargets,
  //   'storeTargets keys': Object.keys(storeTargets || {}),
  //   'is storeTargets array': Array.isArray(storeTargets),
  //   'sample store': storeTargets ? storeTargets['719'] || storeTargets['544'] : 'not found'
  // })

  allStores.forEach(store => {
    const weekData = getStoreWeekData(store, weekId)

    // ИСПРАВЛЕНИЕ: изменить const на let
    let storeTargetConfig = {}

    // Сначала пробуем ID без префикса (719)
    const storeIdWithoutPrefix = store.id.replace('store_', '')
    if (storeTargets && typeof storeTargets === 'object' && !Array.isArray(storeTargets)) {
      // Сначала пробуем ID без префикса (719)
      const storeIdWithoutPrefix = store.id.replace('store_', '')
      if (storeTargets[storeIdWithoutPrefix]) {
        storeTargetConfig = storeTargets[storeIdWithoutPrefix]
      }
      // Если не нашли, пробуем с префиксом (store_719)  
      else if (storeTargets[store.id]) {
        storeTargetConfig = storeTargets[store.id]
      }
      else {
        console.warn(`⚠️ Не найдена конфигурация для магазина: ${store.id} (${store.name})`)
      }
    } else {
      console.error('❌ storeTargets не является объектом:', storeTargets)
    }

    weekData.percent = calculateTurnoverPercent(weekData.plan, weekData.fact)

    Object.entries(targetTree).forEach(([key, targetConfig]) => {
      if (key === 'turnover') return

      const targetPercent = storeTargetConfig[key] || 0
      const actualValue = weekData[key] || 0
      const target = targetPercent * weekData.fact

      let achievementPercent = 0

      if (target > 0) {
        if (targetConfig.type === 'negative') {
          achievementPercent = Math.min((target / actualValue) * 100, limit.value)
        } else {
          achievementPercent = (actualValue / target) * 100
        }
      }

      weekData[`${key}_percent`] = Math.round(achievementPercent)
      weekData[`${key}_target`] = target
    })
  })

  Object.entries(targetTree).forEach(([key, targetConfig]) => {
    if (key === 'turnover') return
    const maxPercent = Math.max(...allStores.map(store => {
      const weekData = getStoreWeekData(store, weekId)
      return weekData[`${key}_percent`] || 0
    }))

    allStores.forEach(store => {
      const weekData = getStoreWeekData(store, weekId)
      const currentPercent = weekData[`${key}_percent`] || 0
      let score = 0

      if (maxPercent > 0 && currentPercent > 0) {
        score = Math.round((currentPercent / maxPercent) * targetConfig.maxScore)
      }

      weekData[`${key}_score`] = score
    })
  })

  if (targetTree.turnover) {
    const maxTurnoverPercent = Math.max(...allStores.map(store => {
      const weekData = getStoreWeekData(store, weekId)
      return weekData.percent || 0
    }))

    allStores.forEach(store => {
      const