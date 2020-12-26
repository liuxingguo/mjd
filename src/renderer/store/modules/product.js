import Vue from 'vue'

const state = {
  /**
   * 商品列表
   * @property skuId
   * @property skuName
   * @property color
   * @property skuPrice
   * @property skuImgUrl
   */
  product: {}
}
const getters = {
  productList: state => {
    let result = []
    for (const key in state.product) {
      if (state.product.hasOwnProperty(key)) {
        result.push(state.product[key])
      }
    }
    return result
  }
}
const mutations = {
  SAVE_OR_UPDATE (state, { skuId, skuName, color, skuPrice, skuImgUrl }) {
    let params = {skuId, skuName, color, skuPrice, skuImgUrl}
    if (!skuName) {
      params.skuName = state.product[skuId].skuName
    }
    if (!color) {
      params.color = state.product[skuId].color
    }
    if (!skuPrice) {
      params.skuPrice = state.product[skuId].skuPrice
    }
    if (!skuImgUrl) {
      params.skuImgUrl = state.product[skuId].skuImgUrl
    }
    Vue.set(state.product, skuId, params)
  },
  REMOVE (state, skuId) {
    Vue.delete(state.product, skuId)
  },
  CLEAR_ALL (state) {
    state.product = {}
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
