<template>
  <div id="app">
    <component :is="activeTab==='submit' ? 'SubmitScore' : activeTab==='stats' ? 'StatsBoard' : 'HistoryMatches'" />
    <TabBar :activeTab="activeTab" @update:activeTab="activeTab = $event" />
  </div>
</template>

<script>
import TabBar from './components/TabBar.vue'
import SubmitScore from './components/SubmitScore.vue'
import HistoryMatches from './components/HistoryMatches.vue'
import StatsBoard from './components/StatsBoard.vue'

export default {
  name: 'App',
  components: {
    TabBar,
    SubmitScore,
    HistoryMatches,
    StatsBoard
  },
  data() {
    return {
      activeTab: 'submit'
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  padding-bottom: 50px;
  box-sizing: border-box;
  background: #f5f5f5;
}
</style>
