<!--
 * @Author: 汪骏
 * @Date: 2025-07-18 16:32:21
 * @LastEditors: wangjun
 * @LastEditTime: 2025-07-18 17:32:31
 * @Description: 请填写简介
-->
<template>
  <div id="app">
    <TabBar :selectedTab="selectedTab" @tab-change="selectedTab = $event" />
    <div v-if="selectedTab === 'home'">
      <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
    <div v-else-if="selectedTab === 'history'">
      <HistoryMatches />
    </div>
    <div v-else-if="selectedTab === 'stats'">
      <StatsBoard />
    </div>
    <div v-else-if="selectedTab === 'submit'">
      <SubmitScore />
    </div>
    <div v-else-if="selectedTab === 'player'">
      <PlayerAnalysis />
    </div>
  </div>
</template>

<script>
import TabBar from './components/TabBar.vue';
import HelloWorld from './components/HelloWorld.vue';
import HistoryMatches from './components/HistoryMatches.vue';
import StatsBoard from './components/StatsBoard.vue';
import SubmitScore from './components/SubmitScore.vue';
import PlayerAnalysis from './components/PlayerAnalysis.vue';

export default {
  name: 'App',
  components: {
    TabBar,
    HelloWorld,
    HistoryMatches,
    StatsBoard,
    SubmitScore,
    PlayerAnalysis
  },
  data() {
    return {
      selectedTab: 'submit'
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
