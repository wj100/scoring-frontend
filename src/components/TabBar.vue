<!--
 * @Author: 汪骏
 * @Date: 2025-07-18 14:45:54
 * @LastEditors: wangjun
 * @LastEditTime: 2025-07-18 17:37:01
 * @Description: 请填写简介
-->
<template>
  <div class="tab-bar">
    <button v-for="tab in tabs" :key="tab.name" :class="{ active: tab.name === selectedTab }" @click="$emit('tab-change', tab.name)">
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    selectedTab: String
  },
  data() {
    return {
      tabs: [
        // { name: 'home', label: '首页' },
        { name: 'submit', label: '对战' },
        { name: 'history', label: '战绩' },
        // { name: 'stats', label: '统计' },
        { name: 'player', label: '分析' }
      ]
    };
  }
};
</script>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding: 8px 0;
}
button {
  background: none;
  border: none;
  font-size: 16px;
  padding: 8px 16px;
  cursor: pointer;
}
.active {
  color: #42b983;
  font-weight: bold;
}
</style> 