<template>
  <div class="player-analysis">
    <!-- <h2>队员分析</h2> -->
    <div class="selector">
      <label>选择队员：</label>
      <el-select v-model="selectedPlayer" placeholder="请选择队员" style="width: 160px">
        <el-option v-for="player in players" :key="player" :label="player" :value="player" />
      </el-select>
    </div>
    <div v-if="selectedPlayer">
      <h3>{{ selectedPlayer }} 画像分析</h3>
      <div ref="chart" style="width: 100%; height: 400px;display: none;"></div>
      <ul class="match-list">
        <li v-for="item in playerMatches" :key="item.objectId" :class="{ win: item.isWinner }">
          {{ item.date }} {{ item.match }} 比分: {{ item.score }}
          <span class="player-score">(得分: {{ item.playerScore }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import AV from 'leancloud-storage';

function extractPlayers(data) {
  const set = new Set();
  data.forEach(item => {
    const [a, b] = item.match.split('-');
    set.add(a);
    set.add(b);
  });
  return Array.from(set);
}

function getPlayerMatches(data, player) {
  return data.filter(item => item.match.includes(player))
    .map(item => {
      const [player1, player2] = item.match.split('-');
      const [score1, score2] = item.score.split(' - ').map(Number);
      
      // 调整对战队员顺序，得分高的放前面
      let newMatch;
      if (score1 > score2) {
        newMatch = `${player1}-${player2}`;
      } else if (score2 > score1) {
        newMatch = `${player2}-${player1}`;
      } else {
        newMatch = item.match; // 平局保持原样
      }

      const playerScore = player1 === player ? score1 : score2;
      return {
        ...item,
        match: newMatch,
        playerScore,
        isWinner: player1 === player ? score1 > score2 : score2 > score1
      };
    })
    .sort((a, b) => b.playerScore - a.playerScore); // 按该队员得分降序排序
}

function getPlayerScores(matches, player) {
  return matches.map(item => {
    const [a, b] = item.match.split('-');
    const [scoreA, scoreB] = item.score.split(' - ').map(Number);
    let score = 0;
    if (a === player) score = scoreA;
    else if (b === player) score = scoreB;
    return { date: item.date, score };
  });
}

export default {
  name: 'PlayerAnalysis',
  data() {
    return {
      players: [],
      selectedPlayer: '',
      playerMatches: [],
      allMatches: [],
      chart: null,
      loading: false
    };
  },
  watch: {
    selectedPlayer(newPlayer) {
      this.playerMatches = getPlayerMatches(this.allMatches, newPlayer);
      this.$nextTick(this.renderChart);
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      const query = new AV.Query('ScoreRecord');
      query.limit(1000);
      query.find().then(list => {
        const matches = list.map(obj => ({
          objectId: obj.id,
          date: obj.get('date'),
          match: obj.get('match'),
          score: obj.get('score')
        }));
        this.allMatches = matches;
        this.players = extractPlayers(matches);
        this.selectedPlayer = this.players[0] || '';
        this.playerMatches = getPlayerMatches(matches, this.selectedPlayer);
        this.$nextTick(this.renderChart);
      }).finally(() => {
        this.loading = false;
      });
    },
    renderChart() {
      if (!this.selectedPlayer) return;
      const scores = getPlayerScores(this.playerMatches, this.selectedPlayer);
      const dates = scores.map(item => item.date);
      const data = scores.map(item => item.score);
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart);
      }
      const option = {
        title: { text: `${this.selectedPlayer} 得分趋势` },
        tooltip: {},
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [{ name: '得分', type: 'line', data }]
      };
      this.chart.setOption(option);
    }
  }
};
</script>

<style scoped>
.player-analysis {
  padding: 16px;
}
.selector {
  margin-bottom: 16px;
}
.match-list {
  list-style: none;
  padding: 0;
}
.match-list li {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #f5f7fa;
}
.match-list li.win {
  background: #f0f9eb;
}
.player-score {
  margin-left: 8px;
  color: #409EFF;
  font-weight: bold;
}
</style> 