<!--
 * @Author: 汪骏
 * @Date: 2025-07-18 14:46:23
 * @LastEditors: wangjun
 * @LastEditTime: 2025-07-18 18:02:10
 * @Description: 请填写简介
-->
<template>
  <div class="submit-score">
    <!-- <h2>提交比分</h2> -->
    <el-form :inline="true" class="match-form">
      <el-form-item label="队员">
        <el-select v-model="playerA" placeholder="选择队员1" style="width: 120px">
          <el-option v-for="p in players" :key="p" :label="p" :value="p" :disabled="p === playerB" />
        </el-select>
      </el-form-item>
      <span style="margin: 0 8px;">vs</span>
      <el-form-item >
        <el-select v-model="playerB" placeholder="选择队员2" style="width: 120px">
          <el-option v-for="p in players" :key="p" :label="p" :value="p" :disabled="p === playerA" />
        </el-select>
      </el-form-item>

      <div class="score-form-card">
        <el-form-item label="比分">
        <el-input-number v-model="scoreA" :min="0" :max="100" :controls="false" style="width: 120px" />
      </el-form-item>
      <span style="margin: 0 8px;">vs</span>
      <el-form-item>
        <el-input-number v-model="scoreB" :min="0" :max="100" :controls="false" style="width: 120px" />
      </el-form-item>
      <div>
        <el-form-item>
            <el-button type="primary" size="mini" @click="submit">提交</el-button>
      </el-form-item>
      </div>
      </div>
    </el-form>
    <div class="submitted-list">
      <h4>今日已提交：</h4>
      <el-table :data="submitted" border size="mini" style="width: 100%">
        <el-table-column prop="match" label="对战" />
        <el-table-column prop="score" label="比分" width="60" align="center" />
        <el-table-column label="操作" width="60" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="remove(scope.row)">删除</el-button>
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
      scoreA: 0,
      scoreB: 0,
      submitted: []
    }
  },
  mounted() {
    this.loadSubmitted()
  },
  methods: {
    submit() {
      if (!this.playerA || !this.playerB) {
        this.$message.error('请选择双方队员')
        return
      }
      if (this.playerA === this.playerB) {
        this.$message.error('不能选择同一队员')
        return
      }
      if (this.scoreA === 0 && this.scoreB === 0) {
        this.$message.error('比分不能同时为0')
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      const matchKey = `${this.playerA}-${this.playerB}`
      const ScoreRecord = AV.Object.extend('ScoreRecord')
      const record = new ScoreRecord()
      record.set('date', today)
      record.set('match', matchKey)
      record.set('score', `${this.scoreA} - ${this.scoreB}`)
      record.save().then(() => {
        this.$message.success(`${this.playerA} vs ${this.playerB} 提交成功: ${this.scoreA} - ${this.scoreB}`)
        this.loadSubmitted()
      }).catch(err => {
        this.$message.error('提交失败: ' + err.message)
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
      this.$confirm('确定要删除这条比分记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const obj = AV.Object.createWithoutData('ScoreRecord', row.objectId)
        obj.destroy().then(() => {
          this.$message.success('删除成功')
          this.loadSubmitted()
        })
      })
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
  padding: 12px 8px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.el-form-item {
  margin-bottom: 0;
  margin-right: 8px;
}
.el-input-number {
  width: 40px;
}
.el-input__inner {
  padding: 0 2px;
  text-align: center;
  font-size: 16px;
}
.submitted-list {
  margin-top: 12px;
}
.el-table .cell {
  font-size: 13px;
  white-space: nowrap;
}
.el-table th {
  font-size: 13px;
}
.score-form-card{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 10px;
}
</style> 