<!--
 * @Author: 汪骏
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: wangjun
 * @LastEditTime: 2025-01-27 10:00:00
 * @Description: 双打记分组件
-->
<template>
  <div class="doubles-score">
    <div class="match-form">
      <div class="form-section">
        <div class="section-title">双打队员</div>
        
        <div class="doubles-selector">
          <div class="team-section">
            <div class="team-label">A队</div>
            <div class="team-players">
              <div class="player-item">
                <van-field
                  readonly
                  :value="playerA"
                  placeholder="选择队员1"
                  right-icon="arrow-down"
                  @click="showPickerA = true"
                  class="player-input"
                />
                <van-popup v-model="showPickerA" position="bottom" round class="player-popup">
                  <van-picker
                    show-toolbar
                    title="选择队员"
                    :columns="playersA"
                    :default-index="Math.floor(playersA.length / 2)"
                    @confirm="onConfirmPlayerA"
                    @cancel="showPickerA = false"
                    :visible-item-count="playersA.length < 8 ? playersA.length : 8"
                  />
                </van-popup>
              </div>
              <div class="and-text">&</div>
              <div class="player-item">
                <van-field
                  readonly
                  :value="playerA2"
                  placeholder="选择队员2"
                  right-icon="arrow-down"
                  @click="showPickerA2 = true"
                  class="player-input"
                />
                <van-popup v-model="showPickerA2" position="bottom" round class="player-popup">
                  <van-picker
                    show-toolbar
                    title="选择队员"
                    :columns="playersA2"
                    :default-index="Math.floor(playersA2.length / 2)"
                    @confirm="onConfirmPlayerA2"
                    @cancel="showPickerA2 = false"
                    :visible-item-count="playersA2.length < 8 ? playersA2.length : 8"
                  />
                </van-popup>
              </div>
            </div>
          </div>
          
          <div class="vs-text">vs</div>
          
          <div class="team-section">
            <div class="team-label">B队</div>
            <div class="team-players">
              <div class="player-item">
                <van-field
                  readonly
                  :value="playerB"
                  placeholder="选择队员3"
                  right-icon="arrow-down"
                  @click="showPickerB = true"
                  class="player-input"
                />
                <van-popup v-model="showPickerB" position="bottom" round class="player-popup">
                  <van-picker
                    show-toolbar
                    title="选择队员"
                    :columns="playersB"
                    :default-index="Math.floor(playersB.length / 2)"
                    @confirm="onConfirmPlayerB"
                    @cancel="showPickerB = false"
                    :visible-item-count="playersB.length < 8 ? playersB.length : 8"
                  />
                </van-popup>
              </div>
              <div class="and-text">&</div>
              <div class="player-item">
                <van-field
                  readonly
                  :value="playerB2"
                  placeholder="选择队员4"
                  right-icon="arrow-down"
                  @click="showPickerB2 = true"
                  class="player-input"
                />
                <van-popup v-model="showPickerB2" position="bottom" round class="player-popup">
                  <van-picker
                    show-toolbar
                    title="选择队员"
                    :columns="playersB2"
                    :default-index="Math.floor(playersB2.length / 2)"
                    @confirm="onConfirmPlayerB2"
                    @cancel="showPickerB2 = false"
                    :visible-item-count="playersB2.length < 8 ? playersB2.length : 8"
                  />
                </van-popup>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">比分</div>
        <div class="score-selector">
          <van-field
            type="digit"
            v-model="scoreA"
            input-align="center"
            placeholder="A队"
            class="score-input"
          />
          
          <div class="vs-text">vs</div>
          
          <van-field
            type="digit"
            v-model="scoreB"
            input-align="center"
            placeholder="B队"
            class="score-input"
          />
        </div>
        
        <div class="submit-btn-container">
          <van-button type="primary" size="normal" round block @click="submit">提交双打比分</van-button>
        </div>
      </div>
    </div>
    
    <div class="submitted-list">
      <h4>今日已提交：</h4>
      <el-table :data="submitted" border size="mini" style="width: 100%">
        <el-table-column prop="match" label="对战" />
        <el-table-column prop="score" label="比分" width="130" align="center" />
        <el-table-column label="操作" width="60" align="center">
          <template slot-scope="scope">
            <van-button type="danger" size="mini" icon="delete-o" plain @click="remove(scope.row)"></van-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import AV from 'leancloud-storage'
import { PLAYERS } from '../assets/players'

export default {
  name: 'DoublesScore',
  data() {
    return {
      players: PLAYERS,
      playerA: '',
      playerB: '',
      playerA2: '', // 双打A队第二个队员
      playerB2: '', // 双打B队第二个队员
      scoreA: '',
      scoreB: '',
      submitted: [],
      showPickerA: false,
      showPickerB: false,
      showPickerA2: false,
      showPickerB2: false
    }
  },
  computed: {
    playersA() {
      // 双打A队第一个队员：排除B队两个队员
      return this.players.filter(p => p !== this.playerB && p !== this.playerB2);
    },
    playersB() {
      // 双打B队第一个队员：排除A队两个队员
      return this.players.filter(p => p !== this.playerA && p !== this.playerA2);
    },
    playersA2() {
      // 双打A队第二个队员：排除A队第一个队员和B队两个队员
      return this.players.filter(p => p !== this.playerA && p !== this.playerB && p !== this.playerB2);
    },
    playersB2() {
      // 双打B队第二个队员：排除B队第一个队员和A队两个队员
      return this.players.filter(p => p !== this.playerB && p !== this.playerA && p !== this.playerA2);
    }
  },
  mounted() {
    this.loadSubmitted()
  },
  methods: {
    onConfirmPlayerA(value) {
      this.playerA = value;
      this.showPickerA = false;
    },
    onConfirmPlayerB(value) {
      this.playerB = value;
      this.showPickerB = false;
    },
    onConfirmPlayerA2(value) {
      this.playerA2 = value;
      this.showPickerA2 = false;
    },
    onConfirmPlayerB2(value) {
      this.playerB2 = value;
      this.showPickerB2 = false;
    },
    submit() {
      // 验证队员选择
      if (!this.playerA || !this.playerA2 || !this.playerB || !this.playerB2) {
        this.$toast.fail('请选择所有队员');
        return
      }
      // 检查是否有重复队员
      const allPlayers = [this.playerA, this.playerA2, this.playerB, this.playerB2];
      const uniquePlayers = [...new Set(allPlayers)];
      if (uniquePlayers.length !== 4) {
        this.$toast.fail('不能选择重复队员');
        return
      }
      
      // 转换得分为数字
      const scoreA = parseInt(this.scoreA) || 0;
      const scoreB = parseInt(this.scoreB) || 0;
      
      if (scoreA === 0 && scoreB === 0) {
        this.$toast.fail('比分不能同时为0');
        return
      }
      
      const today = new Date().toISOString().slice(0, 10)
      // 双打模式：按字母顺序排列队员名称
      const teamA = [this.playerA, this.playerA2].sort().join('&');
      const teamB = [this.playerB, this.playerB2].sort().join('&');
      const matchKey = `${teamA}-${teamB}`;
      const matchDisplay = `${teamA} vs ${teamB}`;
      
      // 保存到双打数据表
      const ScoreRecord2 = AV.Object.extend('ScoreRecord2')
      const record = new ScoreRecord2()
      record.set('date', today)
      record.set('match', matchKey)
      record.set('score', `${scoreA} - ${scoreB}`)
      record.set('teamA', [this.playerA, this.playerA2]);
      record.set('teamB', [this.playerB, this.playerB2]);
      
      record.save().then(() => {
        this.$toast.success(`${matchDisplay} 提交成功: ${scoreA} - ${scoreB}`);
        // 清空表单
        this.scoreA = '';
        this.scoreB = '';
        this.loadSubmitted()
      }).catch(err => {
        this.$toast.fail('提交失败: ' + err.message);
      })
    },
    loadSubmitted() {
      const today = new Date().toISOString().slice(0, 10)
      const query = new AV.Query('ScoreRecord2')
      query.equalTo('date', today)
      query.descending('createdAt')
      query.limit(1000)
      query.find().then(list => {
        this.submitted = list.map(obj => ({
          objectId: obj.id,
          match: obj.get('match'),
          score: obj.get('score')
        }))
      })
    },
    remove(row) {
      this.$dialog.confirm({
        title: '确认删除',
        message: '确定要删除这条双打比分记录吗？',
      }).then(() => {
        const obj = AV.Object.createWithoutData('ScoreRecord2', row.objectId)
        obj.destroy().then(() => {
          this.$toast.success('删除成功');
          this.loadSubmitted()
        }).catch(err => {
          console.error('删除失败:', err)
          if (err.code === 403) {
            this.$toast.fail('删除失败：没有权限删除此记录');
          } else {
            this.$toast.fail('删除失败：' + err.message);
          }
        })
      }).catch(() => {
        // 取消删除
      });
    }
  }
}
</script>

<style scoped>
.doubles-score {
  padding: 16px 8px 60px 8px;
}

.match-form {
  margin-bottom: 16px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 10px;
  text-align: left;
}

.doubles-selector {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.team-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-label {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  text-align: left;
}

.team-players {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-item {
  flex: 1;
}

.and-text {
  color: #969799;
  font-weight: 500;
  font-size: 14px;
  flex: 0 0 auto;
}

.vs-text {
  padding: 0 10px;
  color: #969799;
  font-weight: 500;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1989fa;
  margin: 10px 0;
}

.score-selector {
  display: flex;
  align-items: center;
  width: 100%;
}

.submit-btn-container {
  margin-top: 25px;
  width: 100%;
}

.submitted-list {
  margin-top: 20px;
}

.el-table .cell {
  font-size: 13px;
  white-space: nowrap;
}

.el-table th {
  font-size: 13px;
}

/* Vant 样式定制 */
.van-field {
  border-radius: 4px;
  background-color: #f7f8fa;
  margin-bottom: 0;
  padding: 10px 12px;
}

.score-selector .van-field,
.team-players .van-field {
  flex: 1;
}

.score-input, .player-input {
  width: 100%;
}

.score-selector .vs-text,
.team-players .vs-text {
  flex: 0 0 auto;
}

.van-field__control {
  font-size: 16px;
  height: 24px;
  line-height: 24px;
}

/* 队员选择器样式 */
.player-popup {
  max-height: 80vh;
}
.player-popup .van-picker {
  max-height: 80vh;
}
.player-popup .van-picker-column__item {
  padding: 8px 0;
  height: 36px;
  line-height: 20px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .doubles-score {
    padding: 16px 8px 70px 8px;
  }
  
  .match-form {
    padding: 15px;
  }
  
  .team-players {
    flex-direction: row;
    flex-wrap: nowrap;
  }
  
  .and-text {
    margin: 0 4px;
    font-size: 12px;
  }
  
  .submit-btn-container {
    margin-top: 25px;
  }
  
  .van-button--normal {
    height: 44px;
    line-height: 42px;
    font-size: 16px;
  }
  
  .van-picker {
    max-height: 40vh;
  }
  
  .player-popup .van-picker {
    max-height: 80vh;
  }
  
  .section-title {
    font-size: 14px;
    margin-bottom: 8px;
  }
}
</style>
