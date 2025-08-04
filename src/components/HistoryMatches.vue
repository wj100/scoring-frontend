<template>
  <div class="history-matches">
    <!-- <h2>历史对战</h2> -->
    <el-radio-group v-model="rangeType" size="mini" style="margin-bottom: 8px;">
      <el-radio-button label="lastMonth">上月</el-radio-button>
      <el-radio-button label="day">昨日</el-radio-button>
      <el-radio-button label="today">今日</el-radio-button>
      <el-radio-button label="month">当月</el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-model="selectedDate"
      :type="['day', 'today'].includes(rangeType) ? 'date' : 'daterange'"
      :picker-options="pickerOptions"
      :default-value="[new Date(), new Date()]"
      :value-format="'yyyy-MM-dd'"
      :range-separator="'至'"
      :start-placeholder="['day', 'today'].includes(rangeType) ? '选择日期' : '开始日期'"
      :end-placeholder="'结束日期'"
      style="width: 100%; margin-bottom: 12px;"
    />
    <div v-if="records.length === 0" class="empty">暂无记录</div>
    <template v-else>
      <h3>数据统计</h3>
      <el-table :data="playerStats" border :default-sort="{prop: 'totalScore', order: 'descending'}" style="margin-bottom: 20px;">
        <el-table-column prop="name" label="队员" align="center" sortable fixed="left" width="120" />
        <el-table-column prop="totalScore" label="总分" align="center" sortable />
        <el-table-column prop="wins" label="胜场" align="center" sortable />
        <el-table-column prop="totalGames" label="总场" align="center" sortable />
        <el-table-column prop="winRate" label="胜率" align="center" sortable>
          <template slot-scope="scope">
            {{ (scope.row.winRate * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <!-- 场次平均分 -->
        <el-table-column prop="averageScore" label="均分" align="center" sortable>
          <template slot-scope="scope">
            {{ (scope.row.totalScore / scope.row.totalGames).toFixed(1) }}
          </template>
        </el-table-column>
      </el-table>

      <h3>对战记录</h3>
      <el-table :data="records" border>
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="match" label="对战" align="center" />
        <el-table-column prop="score" label="比分" align="center" />
      </el-table>
    </template>
  </div>
</template>

<script>
import AV from 'leancloud-storage'
function getDateRange(type) {
  const now = new Date()
  if (type === 'today') {
    // 今日：从 00:00:00 到 23:59:59
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return [start, end]
  } else if (type === 'day') {
    // 昨日：从 00:00:00 到 23:59:59
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0)
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
    return [start, end]
  } else if (type === 'lastMonth') {
    // 上月：从上个月第1天 00:00:00 到上个月最后一天 23:59:59
    let lastMonthYear = now.getFullYear()
    let lastMonth = now.getMonth() - 1
    if (lastMonth < 0) {
      lastMonth = 11
      lastMonthYear--
    }
    const monthStr = String(lastMonth + 1).padStart(2, '0')
    const start = new Date(lastMonthYear + '-' + monthStr + '-01T00:00:00.000Z')
    const end = new Date(lastMonthYear + '-' + monthStr + '-31T23:59:59.000Z')
    return [start, end]
  } else if (type === 'month') {
    // 当月：从当月第1天 00:00:00 到今天 23:59:59
    const monthStr = String(now.getMonth() + 1).padStart(2, '0')
    const dayStr = String(now.getDate()).padStart(2, '0')
    const start = new Date(now.getFullYear() + '-' + monthStr + '-01T00:00:00.000Z')
    const end = new Date(now.getFullYear() + '-' + monthStr + '-' + dayStr + 'T23:59:59.000Z')
    return [start, end]
  }
  return [now, now]
}
export default {
  name: 'HistoryMatches',
  data() {
    const [, end] = getDateRange('today')
    return {
      rangeType: 'today',
      selectedDate: end.toISOString().slice(0, 10),
      records: [],
      pickerOptions: {
        disabledDate: () => false
      }
    }
  },
  computed: {
    playerStats() {
      const stats = {}
      
      // 遍历每场比赛记录
      this.records.forEach(record => {
        const [player1, player2] = record.match.split('-')
        const [score1, score2] = record.score.split('-').map(s => parseInt(s.trim(), 10))
        
        // 初始化玩家数据
        if (!stats[player1]) {
          stats[player1] = { name: player1, totalScore: 0, wins: 0, totalGames: 0 }
        }
        if (!stats[player2]) {
          stats[player2] = { name: player2, totalScore: 0, wins: 0, totalGames: 0 }
        }
        
        // 更新得分
        stats[player1].totalScore += score1
        stats[player2].totalScore += score2
        
        // 更新胜场和总场数
        stats[player1].totalGames++
        stats[player2].totalGames++
        
        if (score1 > score2) {
          stats[player1].wins++
        } else if (score2 > score1) {
          stats[player2].wins++
        }
      })
      
      // 计算胜率并转换为数组
      return Object.values(stats).map(player => ({
        ...player,
        winRate: player.wins / player.totalGames
      })).sort((a, b) => b.totalScore - a.totalScore) // 按总得分排序
    }
  },
  watch: {
    rangeType(val) {
      // 切换日期选择类型时，重置日期选择
      const range = getDateRange(val)
      if (['day', 'today'].includes(val)) {
        this.selectedDate = range[1].toISOString().slice(0, 10)
      } else {
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
      if (['day', 'today'].includes(this.rangeType)) {
        // 单日选择
        days = [this.selectedDate]
      } else if (Array.isArray(this.selectedDate) && this.selectedDate.length === 2) {
        // 使用用户手动选择的日期范围
        const [start, end] = this.selectedDate
        let d = new Date(start)
        const endDate = new Date(end)
        while (d <= endDate) {
          days.push(d.toISOString().slice(0, 10))
          d.setDate(d.getDate() + 1)
        }
      } else {
        // 如果没有选择日期范围，使用默认范围
        let start, end;
        if (this.rangeType === 'lastMonth') {
          [start, end] = getDateRange('lastMonth')
        } else if (this.rangeType === 'month') {
          [start, end] = getDateRange('month')
        } else {
          // 默认今日
          [start, end] = [new Date(), new Date()]
        }
        
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