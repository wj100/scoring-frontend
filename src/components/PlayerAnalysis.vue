<template>
  <div class="player-analysis">
    <!-- <h2>队员分析</h2> -->
    <div class="selector">
      <div class="selector-item">
        <van-cell title="日期" :value="selectedDate" @click="showDatePicker = true" />
        <van-calendar 
          v-model="showDatePicker" 
          :default-date="new Date(selectedDate)" 
          @confirm="onConfirmDate"
          color="#1989fa"
          :show-confirm="true"
          :min-date="minDate"
        />
      </div>
      <div class="selector-item">
        <el-select v-model="selectedPlayer" placeholder="请选择队员" style="width: 160px">
          <el-option v-for="player in players" :key="player" :label="player" :value="player" />
        </el-select>
      </div>
    </div>
    <div v-if="selectedPlayer">
      <!-- <h3>{{ selectedPlayer }} 画像分析</h3> -->
      <div ref="chart" style="width: 100%; height: 400px;display: none;"></div>
      <ul class="match-list">
        <li v-for="item in playerMatches" :key="item.objectId" :class="{ win: item.isWinner }">
           {{ item.match }} 比分: {{ item.score }}
          <span class="player-score">(得分: {{ item.playerScore }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import AV from 'leancloud-storage';
import { PLAYERS } from '../assets/players';

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
    // 默认为昨天
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // 设置最小可选日期为一年前
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    
    return {
      players: [...PLAYERS],
      selectedPlayer: '',
      playerMatches: [],
      allMatches: [],
      selectedDate: yesterday.toISOString().slice(0, 10),
      chart: null,
      loading: false,
      showDatePicker: false,
      minDate: lastYear // 一年前的今天
    };
  },
  watch: {
    selectedPlayer(newPlayer) {
      this.playerMatches = getPlayerMatches(this.allMatches, newPlayer);
      this.$nextTick(this.renderChart);
    },
    selectedDate() {
      this.fetchData();
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    onConfirmDate(date) {
      this.showDatePicker = false;
      this.selectedDate = this.formatDate(date);
    },
    fetchData() {
      this.loading = true;
      const query = new AV.Query('ScoreRecord');
      query.equalTo('date', this.selectedDate);
      query.limit(1000);
      query.find().then(list => {
        const matches = list.map(obj => ({
          objectId: obj.id,
          date: obj.get('date'),
          match: obj.get('match'),
          score: obj.get('score')
        }));
        this.allMatches = matches;
        // 只用全局PLAYERS
        this.players = [...PLAYERS];
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
  display: flex;
  gap: 20px;
  align-items: center;
}
.selector-item {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Vant 日期选择器样式 */
.van-cell {
  padding: 10px 15px;
  font-size: 14px;
  background-color: #f7f8fa;
  border-radius: 4px;
  width: 160px;
}
.van-cell__title {
  font-size: 14px;
  flex: 0 0 30%;
  max-width: 30%;
}
.van-calendar__header-title,
.van-calendar__month-title {
  font-size: 16px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .player-analysis {
    padding: 16px 8px 60px 8px;
  }
  .van-calendar {
    height: 80vh;
  }
  .selector {
    flex-direction: row;
    align-items: flex-start;
  }
  .selector-item {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style> 