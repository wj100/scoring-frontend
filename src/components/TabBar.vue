<template>
  <el-row class="tab-bar" justify="space-around" type="flex">
    <el-col :span="12" @click.native="changeTab('submit')">
      <div :class="['tab-item', {active: activeTab==='submit'}]">提交比分</div>
    </el-col>
    <el-col :span="12" @click.native="changeTab('history')">
      <div :class="['tab-item', {active: activeTab==='history'}]">历史对战</div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    activeTab: {
      type: String,
      required: true
    }
  },
  methods: {
    changeTab(tab) {
      this.$emit('update:activeTab', tab)
    }
  }
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}
.tab-item {
  line-height: 50px;
  text-align: center;
  font-size: 16px;
  color: #888;
}
.tab-item.active {
  color: #409EFF;
  font-weight: bold;
}
</style> 