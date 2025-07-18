/*
 * @Author: 汪骏
 * @Date: 2025-07-18 14:43:27
 * @LastEditors: wangjun
 * @LastEditTime: 2025-07-18 14:46:31
 * @Description: 请填写简介
 */
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度375px
      propList: ['*'],
      minPixelValue: 2
    }
  }
} 