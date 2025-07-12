<template>
  <div class="calendar">
    <div class="calendar-header">
      <h2>{{ monthYearLabel }}</h2>
    </div>
    <div class="calendar-grid">
      <div class="calendar-day header" v-for="d in daysOfWeek" :key="d">{{ d }}</div>
      <div
        class="calendar-day"
        v-for="day in daysInMonth"
        :key="day.date + '-' + day.day"
      >
        <div class="day-number" v-if="day.day">{{ day.day }}</div>
        <div v-for="article in articlesForDay(day.date)" :key="article.id || article.title + article.date" class="article-card">
          <span class="badge">{{ article.label }}</span>
          <div class="title">{{ article.title }}</div>
          <div class="stats">
            <span>Volume: <b>{{ article.volume }}</b></span>
            <span>Difficulty: <b>{{ article.difficulty }}</b></span>
          </div>
          <button @click="goToArticle(article.articleUrl)">
            {{ article.buttonText || 'Read Article' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const pad = n => n < 10 ? '0' + n : n;
function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default {
  props: {
    articles: {
      type: 'array',
      label: 'Articles',
      description: 'List of articles to display in the calendar',
      default: [],
      items: {
        type: 'object',
        fields: {
          id: { type: 'string', label: 'ID' },
          date: { type: 'string', label: 'Date (YYYY-MM-DD)' },
          label: { type: 'string', label: 'Label' },
          title: { type: 'string', label: 'Title' },
          volume: { type: 'string', label: 'Volume' },
          difficulty: { type: 'string', label: 'Difficulty' },
          buttonText: { type: 'string', label: 'Button Text' },
          articleUrl: { type: 'string', label: 'Article URL' },
        }
      }
    }
  },
  data() {
    const today = new Date();
    return {
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
    };
  },
  computed: {
    monthYearLabel() {
      return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    daysOfWeek() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    },
    daysInMonth() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      // Add blanks for first week
      for (let i = 0; i < firstDay.getDay(); i++) {
        days.push({ day: '', date: '' });
      }
      // Add days
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(this.currentYear, this.currentMonth, d);
        days.push({ day: d, date: formatDate(date) });
      }
      return days;
    },
  },
  methods: {
    articlesForDay(dateStr) {
      if (!dateStr) return [];
      return this.articles.filter(a => a.date === dateStr);
    },
    goToArticle(url) {
      if (url) window.open(url, '_blank');
    },
  },
};
</script>

<style scoped>
.calendar {
  max-width: 900px;
  margin: 0 auto;
}
.calendar-header {
  text-align: center;
  margin-bottom: 1rem;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.calendar-day {
  background: #fff;
  min-height: 120px;
  border: 1px solid #eee;
  padding: 6px;
  position: relative;
  border-radius: 8px;
}
.calendar-day.header {
  background: none;
  border: none;
  font-weight: bold;
  text-align: center;
}
.day-number {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}
.article-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.badge {
  display: inline-block;
  background: #7c3aed;
  color: #fff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  margin-bottom: 4px;
}
.title {
  font-weight: 600;
  margin-bottom: 2px;
}
.stats {
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
}
button {
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}
button:hover {
  background: #5b21b6;
}
</style>
