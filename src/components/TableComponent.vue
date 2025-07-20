<template>
  <div class="table-color-changer">
    <h1>Изменение цвета шапки таблицы</h1>
    
    <div class="color-palette">
      <h3>Палитра темных цветов:</h3>
      <div 
        v-for="color in darkColors" 
        :key="color"
        class="color-option"
        :class="{ selected: selectedColor === color }"
        :style="{ backgroundColor: color }"
        @click="changeColor(color)"
        :title="color"
      />
    </div>
    
    <div class="table-container">
      <table>
        <thead 
          class="table-header"
          :style="headerStyle"
        >
          <tr>
            <th>Имя</th>
            <th>Должность</th>
            <th>Отдел</th>
            <th>Зарплата</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.name }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.department }}</td>
            <td>{{ employee.salary }}</td>
            <td>{{ employee.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="current-color-info" v-if="selectedColor">
      <strong>Текущий цвет:</strong> {{ selectedColor }}<br>
      <strong>Цвет бордеров:</strong> {{ darkerColor }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TableColorChanger',
  setup() {
    // Палитра темных цветов
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

    // Выбранный цвет
    const selectedColor = ref('#2c3e50')

    // Данные для таблицы
    const employees = ref([
      { 
        id: 1, 
        name: 'Иван Петров', 
        position: 'Разработчик', 
        department: 'IT', 
        salary: '80 000 ₽', 
        status: 'Активен' 
      },
      { 
        id: 2, 
        name: 'Мария Сидорова', 
        position: 'Дизайнер', 
        department: 'Дизайн', 
        salary: '65 000 ₽', 
        status: 'Активна' 
      },
      { 
        id: 3, 
        name: 'Алексей Иванов', 
        position: 'Менеджер', 
        department: 'Продажи', 
        salary: '70 000 ₽', 
        status: 'Активен' 
      },
      { 
        id: 4, 
        name: 'Елена Козлова', 
        position: 'Аналитик', 
        department: 'Аналитика', 
        salary: '75 000 ₽', 
        status: 'Активна' 
      },
      { 
        id: 5, 
        name: 'Дмитрий Смирнов', 
        position: 'Тестировщик', 
        department: 'QA', 
        salary: '60 000 ₽', 
        status: 'Активен' 
      }
    ])

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

    // Вычисляемый более темный цвет
    const darkerColor = computed(() => {
      return darkenColor(selectedColor.value)
    })

    // Стиль для шапки таблицы
    const headerStyle = computed(() => {
      return {
        backgroundColor: selectedColor.value,
        border: `3px solid ${darkerColor.value}`,
        borderCollapse: 'separate',
        borderSpacing: 0
      }
    })

    // Функция изменения цвета
    const changeColor = (color) => {
      selectedColor.value = color
    }

    return {
      darkColors,
      selectedColor,
      employees,
      darkerColor,
      headerStyle,
      changeColor
    }
  }
}
</script>

<style scoped>
.table-color-changer {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-family: Arial, sans-serif;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}

.color-palette h3 {
  width: 100%;
  margin: 0 0 15px 0;
  color: #555;
  font-family: Arial, sans-serif;
}

.color-option {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.color-option.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #333;
}

.table-container {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.table-header {
  transition: all 0.3s ease;
}

.table-header th {
  padding: 15px;
  text-align: left;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.table-header th:not(:last-child) {
  border-right: 2px solid;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.current-color-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  font-family: Arial, sans-serif;
}

.current-color-info strong {
  color: #007bff;
}
</style>