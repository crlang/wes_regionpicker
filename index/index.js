Page({
  data: {
    regionState: false,
    regionData: '',
    regionCol: 3,// 列数，省市区共 4 列，可选 4省市区镇、3省市区(默认)、2省市、1省
    // regionInitValue: [8,0,0],// 初始值 默认[0,0,0]
    regionId: '310101',// 末项 id ，该值具有优先级
  },

  /**
   * 城市选择弹出
   * @author crl
   * @param  {Function} cb [description]
   * @return {[type]}
   */
  callRegion(cb) {
    if (cb.detail && cb.detail.type === 'success') {
      let val = cb.detail.value;
      console.log('选择了==>',val);
      this.setData({
        regionData: val
      });
    }
  },

  // 设置所在城市
  bindCity() {
    this.setData({
      regionState: true
    });
  },

  onLoad: function () {
  },
});
