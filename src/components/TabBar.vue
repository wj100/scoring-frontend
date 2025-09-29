<!--
 * @Author: 汪骏
 * @Date: 2025-07-18 14:45:54
 * @LastEditors: wangjun
 * @LastEditTime: 2025-08-04 17:37:01
 * @Description: 底部导航栏
-->
<template>
  <div class="tab-bar-container">
    <van-tabbar v-model="activeTab" @change="handleTabChange" fixed route>
      <van-tabbar-item name="submit" icon="edit">单打</van-tabbar-item>
      <van-tabbar-item name="history" icon="chart-trending-o">单打战绩</van-tabbar-item>
      <van-tabbar-item name="doubles" icon="friends-o">双打</van-tabbar-item>
      <van-tabbar-item name="doublesStats" icon="bar-chart-o">双打战绩</van-tabbar-item>
    </van-tabbar>
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
      activeTab: this.selectedTab || 'submit'
    };
  },
  watch: {
    selectedTab(val) {
      this.activeTab = val;
    }
  },
  methods: {
    handleTabChange(tabName) {
      this.$emit('tab-change', tabName);
    }
  }
};
</script>

<style scoped>
.tab-bar-container {
  /* 给底部导航腾出空间 */
  height: 50px;
}
</style> 