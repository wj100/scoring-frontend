<!--
 * @Author: 汪骏
 * @Date: 2025-07-18 14:46:23
 * @LastEditors: wangjun
 * @LastEditTime: 2025-09-29 11:04:05
 * @Description: 请填写简介
-->
<template>
  <div class="submit-score">
    <!-- <h2>提交比分</h2> -->
    <div class="match-form">
      <div class="form-section">
        <div class="section-title">队员</div>
        <div class="player-selector">
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
          
          <div class="vs-text">vs</div>
          
          <div class="player-item">
            <van-field
              readonly
              :value="playerB"
              placeholder="选择队员2"
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
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">比分</div>
        <div class="score-selector">
          <van-field
            type="digit"
            v-model="scoreA"
            input-align="center"
            placeholder="队员1"
            class="score-input"
          />
          
          <div class="vs-text">vs</div>
          
          <van-field
            type="digit"
            v-model="scoreB"
            input-align="center"
            placeholder="队员2"
            class="score-input"
          />
        </div>
        
        <div class="submit-btn-container">
          <van-button type="primary" size="normal" round block @click="submit">提交比分</van-button>
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
  name: 'SubmitScore',
  data() {
    return {
      players: PLAYERS,
      playerA: '',
      playerB: '',
      scoreA: '',
      scoreB: '',
      submitted: [],
      showPickerA: false,
      showPickerB: false
    }
  },
  computed: {
    playersA() {
      return this.players.filter(p => p !== this.playerB);
    },
    playersB() {
      return this.players.filter(p => p !== this.playerA);
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
    submit() {
      if (!this.playerA || !this.playerB) {
        this.$toast.fail('请选择双方队员');
        return
      }
      if (this.playerA === this.playerB) {
        this.$toast.fail('不能选择同一队员');
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
      const matchKey = `${this.playerA}-${this.playerB}`
      const ScoreRecord = AV.Object.extend('ScoreRecord')
      const record = new ScoreRecord()
      record.set('date', today)
      record.set('match', matchKey)
      record.set('score', `${scoreA} - ${scoreB}`)
      record.save().then(() => {
        this.$toast.success(`${this.playerA} vs ${this.playerB} 提交成功: ${scoreA} - ${scoreB}`);
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
      const query = new AV.Query('ScoreRecord')
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
        message: '确定要删除这条比分记录吗？',
      }).then(() => {
        const obj = AV.Object.createWithoutData('ScoreRecord', row.objectId)
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
.submit-score {
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

.player-selector, .score-selector {
  display: flex;
  align-items: center;
  width: 100%;
}

.player-item {
  flex: 1;
}

.vs-text {
  padding: 0 10px;
  color: #969799;
  font-weight: 500;
}

.score-form-card {
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

/* 比分输入框特殊样式 */
.score-selector .van-field,
.player-selector .van-field {
  flex: 1;
}

.score-input, .player-input {
  width: 100%; /* 设置固定宽度比例 */
}

.score-selector .vs-text,
.player-selector .vs-text {
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
  .submit-score {
    padding: 16px 8px 70px 8px;
  }
  
  .match-form {
    padding: 15px;
  }
  
  /* 即使在移动端也保持水平布局 */
  .player-selector,
  .score-selector {
    flex-direction: row;
    flex-wrap: nowrap;
  }
  
  /* vs文本特殊处理 */
  .vs-text {
    width: auto;
    margin: 0 8px;
    font-size: 14px;
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