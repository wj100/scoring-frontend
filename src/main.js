/*
 * @Author: 汪骏
 * @Date: 2025-07-18 14:42:36
 * @LastEditors: wangjun
 * @LastEditTime: 2025-07-18 15:48:31
 * @Description: 请填写简介
 */
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'lib-flexible/flexible'
import App from './App.vue'
import AV from 'leancloud-storage'

Vue.use(ElementUI)

AV.init({
  appId: 'Ou98O5wwi38kkAIZbrujAvJR-gzGzoHsz',
  appKey: 'ZBoe5efOhpkkPF53DQMgjgF9',
  serverURL: 'https://leancloud.wangjun.work' // 若使用国际版可省略
})

new Vue({
  render: h => h(App),
}).$mount('#app')
