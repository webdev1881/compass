/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted } from "@odoo/owl";

export class VueAdminPage extends Component {
    setup() {
        onMounted(async () => {

            // const template = renderToElement('smk_custom_page.MainVueAdminTemplate', {widget: this})
            // debugger;

            const response = await fetch('/smk_custom_page/static/src/html/main_vue_template.html');
            this.templateText = await response.text();
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js";
            script.onload = () => {
                this.createApp();
            };
            document.head.appendChild(script);
        });
    }

    createApp() {
        const { createApp, ref, computed, onMounted } = window.Vue;
        createApp({
            setup() {
                const loading = ref(true)
                const error = ref(null)
                const salesData = ref(null)
                const sortBy = ref('regionRank')
                const sortOrder = ref('asc')
                const isAnimating = ref(false)
                const showPlanFactColumns = ref(true)

                const showColumn = ref(true)

                const toggleColumn = () => {
                    showColumn.value = !showColumn.value
                }

                const colors = ref({
                    'Белая Церковь': '#f44336',
                    'Днепр': '#ffc107',
                    'Киев': '#4caf50',
                    'Харьков': '#2196f3',
                })
                const loadData = async () => {
                    try {
                        loading.value = true
                        error.value = null
                        const response = await fetch('/smk_custom_page/static/src/js/sales-data.json')

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`)
                        }

                        const data = await response.json()

                        if (!data.weeks || !data.regions) {
                            throw new Error('Неверная структура данных')
                        }



                        setTimeout(() => {
                            salesData.value = data
                            loading.value = false
                        }, 1500)


                    } catch (err) {
                        console.error('Ошибка загрузки данных:', err)
                        error.value = err.message || 'Ошибка загрузки данных'
                    } finally {
                        loading.value = false
                    }
                }

                const weeks = computed(() => salesData.value?.weeks || [])
                const regions = computed(() => salesData.value?.regions || [])

                const getRegionWeekData = (region, weekId) => {
                    const stores = region.stores || []
                    const weekData = {
                        plan: 0,
                        fact: 0,
                        losses: 0,
                        shortages: 0,
                        fop: 0,
                        shiftRemainder: 0,
                        unprocessed: 0
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

                const getRegionRank = (region) => {
                    const allRegions = [...regions.value]
                    allRegions.sort((a, b) => {
                        const aPercent = getTotalPercentForRegion(a)
                        const bPercent = getTotalPercentForRegion(b)
                        return bPercent - aPercent
                    })

                    return allRegions.findIndex(r => r.id === region.id) + 1
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

                const getTotalPercentForRegion = (region) => {
                    const totalPlan = getTotalPlanForRegion(region)
                    const totalFact = getTotalFactForRegion(region)
                    return totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0
                }

                const sortedRegions = computed(() => {
                    if (!regions.value) return []

                    const sorted = [...regions.value]

                    sorted.sort((a, b) => {
                        let aValue, bValue

                        switch (sortBy.value) {
                            case 'regionRank':
                                aValue = getRegionRank(a)
                                bValue = getRegionRank(b)
                                break
                            case 'regionTotalPercent':
                                aValue = getTotalPercentForRegion(a)
                                bValue = getTotalPercentForRegion(b)
                                break
                            default:
                                return 0
                        }

                        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
                    })

                    return sorted
                })

                const getStoreWeekData = (store, weekId) => {
                    if (!store || !store.weeklyData) {
                        return { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
                    }

                    const weekData = store.weeklyData.find(w => w.weekId === weekId)
                    return weekData || { plan: 0, fact: 0, percent: 0, losses: 0, shortages: 0, fop: 0, shiftRemainder: 0, unprocessed: 0 }
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

                const getAllSortedStores = () => {
                    const allStores = []

                    regions.value.forEach(region => {
                        const stores = region.stores || []
                        stores.forEach(store => {
                            allStores.push({
                                ...store,
                                regionName: region.name
                            })
                        })
                    })

                    if (sortBy.value === 'storePercent') {
                        allStores.sort((a, b) => {
                            const aPercent = getTotalPercentForStore(a)
                            const bPercent = getTotalPercentForStore(b)
                            return sortOrder.value === 'asc' ? aPercent - bPercent : bPercent - aPercent
                        })
                    } else {
                        allStores.sort((a, b) => (a.rank || 0) - (b.rank || 0))
                    }

                    return allStores
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
                    }, 600)
                }

                const refreshData = async () => {
                    await loadData()
                }

                onMounted(() => {
                    loadData()
                })

                return {
                    loading,
                    error,
                    weeks,
                    regions,
                    sortedRegions,
                    sortBy,
                    sortOrder,
                    isAnimating,
                    colors,
                    getRegionWeekData,
                    getRegionTotalScore,
                    getRegionRank,
                    getStoreWeekData,
                    getAllSortedStores,
                    formatNumber,
                    getPercentClass,
                    getScoreClass,
                    handleSort,
                    toggleSortOrder,
                    refreshData,
                    loadData,
                    showPlanFactColumns,
                    toggleColumn
                }
            },
            template: this.templateText
        }).mount('#vue-app');
    }

    static template = "smk_custom_page.VueAdminTemplate";
}

registry.category("actions").add("vue.admin.page", VueAdminPage);