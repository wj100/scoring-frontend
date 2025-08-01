<template>
  <div class="stats-board">
    <el-radio-group v-model="rangeType" size="mini" style="margin-bottom: 8px;">
      <el-radio-button label="week">本周</el-radio-button>
      <el-radio-button label="month">本月</el-radio-button>
      <el-radio-button label="all">全部</el-radio-button>
    </el-radio-group>
    <el-table :data="stats" border size="mini" style="width: 100%">
      <el-table-column prop="player" label="队员" />
      <el-table-column prop="winRate" label="胜率" width="80" align="center" />
      <el-table-column prop="winCount" label="胜场" width="60" align="center" />
      <el-table-column prop="scoreSum" label="总比分" width="60" align="center" />
    </el-table>
  </div>
</template>

<script>
import AV from 'leancloud-storage'
import { PLAYERS } from '../assets/players'
function getDateRange(type) {
  const now = new Date()
  if (type === 'week') {
    // 本周：从7天前 00:00:00 到今天 23:59:59
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return [start, end]
  } else if (type === 'month') {
    // 本月：从当月1号 00:00:00 到今天 23:59:59
    const monthStr = String(now.getMonth() + 1).padStart(2, '0')
    const dayStr = String(now.getDate()).padStart(2, '0')
    const start = new Date(now.getFullYear() + '-' + monthStr + '-01T00:00:00.000Z')
    const end = new Date(now.getFullYear() + '-' + monthStr + '-' + dayStr + 'T23:59:59.000Z')
    return [start, end]
  }
  return [null, null]
}
export default {
  name: 'StatsBoard',
  data() {
    return {
      rangeType: 'week',
      stats: []
    }
  },
  watch: {
    rangeType() {
      this.loadStats()
    }
  },
  mounted() {
    this.loadStats()
  },
  methods: {
    loadStats() {
      let days = []
      if (this.rangeType === 'all') {
        days = null // 查询全部
      } else {
        const [start, end] = getDateRange(this.rangeType)
        let d = new Date(start)
        const endDate = new Date(end)
        while (d <= endDate) {
          days.push(d.toISOString().slice(0, 10))
          d.setDate(d.getDate() + 1)
        }
      }
      const query = new AV.Query('ScoreRecord')
      if (days) query.containedIn('date', days)
      query.limit(1000)
      query.find().then(list => {
        // 统计每个队员的胜场、总比分、胜率
        const statMap = {}
        PLAYERS.forEach(p => statMap[p] = { player: p, winCount: 0, scoreSum: 0, total: 0 })
        list.forEach(obj => {
          const match = obj.get('match').split('-')
          const score = obj.get('score').split('-').map(Number)
          if (match.length !== 2 || score.length !== 2) return
          const [a, b] = match
          const [sa, sb] = score
          statMap[a].scoreSum += sa
          statMap[b].scoreSum += sb
          statMap[a].total++
          statMap[b].total++
          if (sa > sb) statMap[a].winCount++
          else if (sb > sa) statMap[b].winCount++
        })
        // 计算胜率
        const stats = Object.values(statMap).map(s => ({
          ...s,
          winRate: s.total ? ((s.winCount / s.total * 100).toFixed(1) + '%') : '--'
        }))
        // 按比分和胜场排名
        stats.sort((a, b) => b.winCount - a.winCount || b.scoreSum - a.scoreSum)
        this.stats = stats
      })
    }
  }
}
</script>

<style scoped>
.stats-board {
  padding: 16px 8px 60px 8px;
}
.el-table .cell {
  font-size: 13px;
  white-space: nowrap;
}
.el-table th {
  font-size: 13px;
}
</style> 