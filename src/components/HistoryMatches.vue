<template>
  <div class="history-matches">
    <h2>历史对战</h2>
    <el-radio-group v-model="rangeType" size="mini" style="margin-bottom: 8px;">
      <el-radio-button label="day">昨日</el-radio-button>
      <el-radio-button label="week">一周</el-radio-button>
      <el-radio-button label="month">一月</el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-model="selectedDate"
      :type="rangeType === 'day' ? 'date' : 'daterange'"
      :picker-options="pickerOptions"
      :default-value="[new Date(), new Date()]"
      :value-format="'yyyy-MM-dd'"
      :range-separator="'至'"
      :start-placeholder="rangeType === 'day' ? '选择日期' : '开始日期'"
      :end-placeholder="'结束日期'"
      style="width: 100%; margin-bottom: 12px;"
    />
    <div v-if="records.length === 0" class="empty">暂无记录</div>
    <el-table v-else :data="records" border>
      <el-table-column prop="date" label="日期" />
      <el-table-column prop="match" label="对战" align="center" />
      <el-table-column prop="score" label="比分" align="center" />
    </el-table>
  </div>
</template>

<script>
import AV from 'leancloud-storage'
function getDateRange(type) {
  const now = new Date()
  if (type === 'day') {
    // 返回昨天的日期
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    return [yesterday, yesterday]
  } else if (type === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return [start, now]
  } else if (type === 'month') {
    const start = new Date(now)
    start.setDate(now.getDate() - 29)
    return [start, now]
  }
  return [now, now]
}
export default {
  name: 'HistoryMatches',
  data() {
    const [, end] = getDateRange('day')
    return {
      rangeType: 'day',
      selectedDate: end.toISOString().slice(0, 10),
      records: [],
      pickerOptions: {
        disabledDate: () => false
      }
    }
  },
  watch: {
    rangeType(val) {
      if (val === 'day') {
        const [, end] = getDateRange(val)
        this.selectedDate = end.toISOString().slice(0, 10)
      } else {
        const range = getDateRange(val)
        this.selectedDate = [range[0].toISOString().slice(0, 10), range[1].toISOString().slice(0, 10)]
      }
      this.loadRecords()
    },
    selectedDate() {
      this.loadRecords()
    }
  },
  mounted() {
    this.loadRecords()
  },
  methods: {
    loadRecords() {
      let days = []
      if (this.rangeType === 'day') {
        days = [this.selectedDate]
      } else if (Array.isArray(this.selectedDate) && this.selectedDate.length === 2) {
        const [start, end] = this.selectedDate
        let d = new Date(start)
        const endDate = new Date(end)
        while (d <= endDate) {
          days.push(d.toISOString().slice(0, 10))
          d.setDate(d.getDate() + 1)
        }
      }
      if (days.length === 0) {
        this.records = []
        return
      }
      // LeanCloud 查询
      const query = new AV.Query('ScoreRecord')
      query.containedIn('date', days)
      query.limit(1000)
      query.find().then(list => {
        this.records = list.map(obj => ({
          date: obj.get('date'),
          match: obj.get('match'),
          score: obj.get('score')
        }))
      }).catch(err => {
        this.$message.error('查询失败: ' + err.message)
        this.records = []
      })
    }
  }
}
</script>

<style scoped>
.history-matches {
  padding: 16px 8px 60px 8px;
}
.empty {
  text-align: center;
  color: #aaa;
  margin-top: 32px;
}
.el-table .cell {
  font-size: 13px;
  white-space: nowrap;
}
.el-table th {
  font-size: 13px;
}
</style> 