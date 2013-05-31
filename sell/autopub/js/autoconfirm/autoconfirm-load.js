/**
 * Y.AutoConfirmLoad
 * @description 车险接口化确认页加载数据
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-load', function(Y) {
 
/**
 * 确认页逻辑
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * 加载数据
 * @module autoconfirm
 * @submodule autoconfirm-load
 */
    
    'use strict';
    
    /**
     * 加载数据构造函数
     * @class AutoConfirmLoad
     * @constructor
     */
    function AutoConfirmLoad() {}
    
    Y.mix(AutoConfirmLoad, {
        
        /**
         * 加载数据
         * @method load
         * @param {String} uri 接口地址
         * @param {Object} data 发送到后台的数据
         * @param {Function} callback 返回数据处理回调
         * @chainable
         * @public
         */
        load: function(uri, data, callback) {
            var retry = 1, //状态为4000时重试1次
                _this = this;
            
            function load() {
                Y.io(uri, {
                    method: 'GET',
                    data: Y.merge(data, {
                        t: new Date().getTime(),
                        _input_charset: 'UTF-8'
                    }),
                    on: {
                        complete: function(id, r) {
                            var res = null;
                            
                            try {
                                res = Y.JSON.parse(r.responseText);
                            } catch (err) {}
                            
                            if (res) {
                                switch (res.state) {
                                    
                                    //返回正常
                                    case 0:
                                        if (!res.data || !res.data.result) {
                                            _this._onFlowErr(res.errMsg);
                                        } else if (typeof callback == 'function') {
                                            callback.call(_this, Y.merge(res.data || {}, {
                                                flowId: res.flowId,
                                                orderId: res.orderId
                                            }));
                                        } else {}
                                        break;
                                        
                                    //流程超时
                                    case 560:
                                        _this._onFlowTimeout(res.errMsg);
                                        break;
                                    
                                    //用户录入错误
                                    case 561:
                                        _this._onInputErr(res.errMsg);
                                        break;
                                    
                                    //系统异常，重试一次
                                    case 4000:
                                        if (retry > 0) {
                                            retry--;
                                            load();
                                        } else {
                                            _this._onSystemErr(res.errMsg);
                                        }
                                        break;
                                    
                                    //未登录，跳转至登录页
                                    case 4001:
                                        _this._redirectToLogin();
                                        break;
                                    
                                    //其他为流程异常
                                    default:
                                        _this._onFlowErr(res.errMsg);
                                }
                            } else {
                                //返回出错流程异常
                                _this._onFlowErr();
                            }
                        }
                    }
                });
            }
            
            load();
            
            return this;
        },
        
        /**
         * 跳转到登录页面
         * @method _redirectToLogin
         * @protected
         */
        _redirectToLogin: function() {
            var isDaily = window.location.href.indexOf('daily.taobao.net') > -1 ? true : false;
            window.location.href = (isDaily ? 'http://login.daily.taobao.net/member/login.jhtml?redirectURL=' : 'https://login.taobao.com/member/login.jhtml?redirectURL=') + encodeURIComponent(window.location.href);
        },
        
        /**
         * 用户录入错误
         * @method _onInputErr
         * @param {String} errMsg 错误信息
         * @protected
         */
        _onInputErr: function(errMsg) {
            this._showMsgContent(errMsg);
        },
        
        /**
         * 流程超时
         * @method _onFlowTimeout
         * @param {String} errMsg 错误信息
         * @protected
         */
        _onFlowTimeout: function(errMsg) {
            this._showMsgContent(errMsg || '抱歉，流程超时，您可以关闭弹窗重试或重新投保！');
        },
        
        /**
         * 流程异常
         * @method _onFlowErr
         * @param {String} errMsg 错误信息
         * @protected
         */
        _onFlowErr: function() {
            this._showMsgContent(errMsg || '抱歉，流程发生异常，您可以关闭弹窗重试或重新投保！');
        },
        
        /**
         * 系统异常
         * @method _onSystemErr
         * @param {String} errMsg 错误信息
         * @protected
         */
        _onSystemErr: function() {
            this._showMsgContent(errMsg || '抱歉，系统发生异常，您可以关闭弹窗重试或重新投保！');
        }
        
    }, false, null, 4);
    
    Y.AutoConfirmLoad = AutoConfirmLoad;
    
}, '0.0.1', {
    requires: ['io-base', 'json-parse']
});