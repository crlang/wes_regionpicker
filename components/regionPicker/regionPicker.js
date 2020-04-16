// components/regionPicker/regionPicker.js
import {areaJSData} from "../../data/pca-code.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal, key) {
        if (newVal === true) this._show();
      },
    },// 弹出
    initValue: {
      type: Array,
      value: [0,0,0,0],
    },// 区域默认值
    initCol: {
      type: Number,
      value: 3
    },// 显示的列数
    currentId: {
      type: Number,
      value: ''
    },// 修改时存在，最末项 id ，比默认值具有优先级
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialog: false,
    tmpValue: [],// 临时选项值
    regionsData: '',// 区域数据
    provinceData: '',// 当前-省
    citData: '',// 当前-市
    districtData: '',// 当前-区
    streetData: '',// 当前-镇、街道
  },

  ready() {
    this._get();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取模拟数据
     * @author crl
     * @param  {Boolean} reDiff 是否重新处理数据
     * @return {[type]}
     */
    _get(reDiff=false) {
      // 缓存里面拿
      const regionsData = wx.getStorageSync('regionsData');
      if (regionsData) {
        this._init(regionsData, reDiff);
        return;
      }

      this._init(areaJSData, reDiff);

      // 远程示例
      // wx.showLoading({ title: '加载中...', mask: true });
      // wx.request({
      //   // 必需
      //   url: '/data/pac-code.json',// 远程json数据
      //   data: {
      //   },
      //   header: {
      //     'Content-Type': 'application/json'
      //   },
      //   success: (res) => {
      //     if (res.data && res.data.status && res.data.data) {
      //       this._init(res.data.data, reDiff);
      //     }
      //   },
      //   complete: () => {
      //     wx.hideLoading();
      //   }
      // });
    },

    _init(data, reDiff) {
      this.setData({
        regionsData: data
      });
      wx.setStorageSync('regionsData',data);
      if (reDiff) {
        this.changeRegionsData();
      }
    },

    /**
     * 显示弹窗并初始化数据
     * @author crl
     * @return {[type]}
     */
    _show() {
      this.setData({
        dialog: true
      });
      this.changeRegionsData();
    },

    /**
     * 隐藏弹窗
     * @author crl
     * @return {[type]}
     */
    _hide() {
      this.setData({
        dialog: false,
        show: false
      });
      this.triggerEvent("Callback",{type: 'fail',value: ''});
    },

    /**
     * 省市区数据对齐
     * @author darlang
     */
    changeRegionsData() {
      let regionsData = this.data.regionsData;
      if (!regionsData) {
        this._get(true);
        return;
      }
      let seleIndex = this.data.initValue;
      let l = 0, c = 0, r = 0, t = 0;
      let proData, citData, disData, strData;
      let lastId = this.data.currentId;
      if (lastId) {
        seleIndex = this._checkRight(regionsData,lastId);
        this.data.currentId = '';
      }

      l = seleIndex[0] || 0;
      c = seleIndex[1] || 0;
      r = seleIndex[2] || 0;
      t = seleIndex[3] || 0;

      try {
        // 省
        proData = regionsData;
        if (!proData[l]) l = 0;
        let provinceData = proData.map(k => {return {name: k.name, id: k.code};});
        this.setData({
          provinceData: provinceData
        });
        // 市
        if (proData[l].children) {
          citData = proData[l].children;
          if (!citData[c]) c = 0;
          let cityData = citData.map(k => {return {name: k.name, id: k.code};});
          this.setData({
            cityData: cityData
          });
        }

        // 区
        if (citData[c].children) {
          disData = citData[c].children;
          if (!disData[r]) r = 0;
          let districtData = disData.map(k => {return {name: k.name, id: k.code};});
          this.setData({
            districtData: districtData
          });
        }

        // 区
        if (disData[c].children) {
          strData = disData[r].children;
          if (!disData[t]) t = 0;
          let streetData = strData.map(k => {return {name: k.name, id: k.code};});
          this.setData({
            streetData: streetData
          });
        }

      } catch(e) {
        console.error(e);
      }

      // 重置索引
      this.setData({
        initValue: [l, c, r, t]
      });
    },

    /**
     * 查找 id 所在行列
     * @author crl
     * @param  {Array} data 省市区数据
     * @param  {Number} id   末项 id
     * @return {[type]}
     */
    _checkRight(data,id) {
      let res = this.data.tmpValue;
      if (!id) {
        res = [0,0,0,0];
        return res;
      }

      // 拆分编码 id
      let str = id.toString();
      let tmpArr = [];
      for (let i = 2; i < str.length+1; i=i+2) {
        if (i>6) i=i+1;// 区镇的编码为3位数

        let tmp = str.slice(0, i);
        tmpArr.push(tmp);
      }
      return this._checkRightCode(data,tmpArr);
    },

    /**
     * 处理编码问题
     * @author crl
     * @param  {Array} data 数据
     * @param  {Array} arr  编码数据
     * @return {[type]}
     */
    _checkRightCode(data,arr) {
      let res = this.data.tmpValue;
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (data[j].code == arr[i]) {
            this._checkRightCode(data[j].children,arr.slice(1));
            res.unshift(j);
            break;
          }
        }
      }
      return res;
    },

    /**
     * 拖动修改省市区数据
     * @author darlang
     */
    _change(e) {
      let v = e.detail.value;
      this.setData({
        initValue: v
      });
      this.changeRegionsData();
    },

    /**
     * 确定选择
     * @author crl
     * @return {[type]}
     */
    _ok() {
      let p = this.data.provinceData;
      let c = this.data.cityData;
      let d = this.data.districtData;
      let t = this.data.streetData;
      let s = this.data.initValue;
      let res = {};
      const col = this.data.initCol;
      res.rows = s;
      if (col > 0 && p[s[0]] && p[s[0]].name) {
        res.province = {name: p[s[0]].name, id: p[s[0]].id};
      }
      if (col > 1 && c[s[1]] && c[s[1]].name) {
        res.city = {name: c[s[1]].name, id: c[s[1]].id};
      }
      if (col > 2 && d[s[2]] && d[s[2]].name) {
        res.area = {name: d[s[2]].name, id: d[s[2]].id};
      }
      if (col > 3 && s[3] && t[s[3]] && t[s[3]].name) {
        res.town = {name: t[s[3]].name, id: t[s[3]].id};
      }
      this.triggerEvent("Callback",{type: 'success', value: res});
      this._hide();
    },
  }
});
