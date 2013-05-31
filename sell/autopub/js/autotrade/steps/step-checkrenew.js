/**
 * Y.StepCheckRenew
 * @description 检查是否是续保用户步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-checkrenew', function(Y) {

/**
 * 提前投保步骤
 * @module step-checkrenew
 */
    
    'use strict';
    
	/**
     * 检查是否是续保用户步骤构造函数
     * @class StepCheckRenew
	 * @extends Step
	 * @uses StepLoad
	 * @uses StepAjax
     * @constructor
     */
    Y.StepCheckRenew = Y.Base.create('step-checkrenew', Y.Step, [
        Y.StepLoad,
        Y.StepAjax
    ], {
        
		/**
         * 初始化
         * @method initializer
		 * @param {Object} config 组件初始化参数
         * @public
         */
        initializer: function(config) {
            this.after('load', function(e) {
                this._checkRenew(config);
            });
        },
        
		/**
         * 渲染步骤结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数 
         * @public
         */
        render:function(container, config) {
            this.data = config.data || {};
        },
        
		/**
         * 检查是否是续保用户
         * @method _checkRenew
		 * @param {Object} config 组件初始化参数 
         * @protected
         */
        _checkRenew: function(config) {
            var _this = this,
                d = {
                    cityCode: config.cityCode,
                    cityName: config.cityName,
                    carId: config.carId,
					itemId: config.itemId
                };
            
            function handle(data) {
                switch (data.result) {
					
					//是续保用户
                    case 'xubao':
                        _this.forward('step-renew', {
                            backDisabled: true,
                            data: data
                        });
                        break;
					
					//是新保用户
                    case 'new':
                        _this._loadNew(data);
                        break;
                    default:
                        break;
                }
            }
            
            this.load('/json/auto/checkRenewal.do', d, handle);
        },
        
		/**
         * 检查为新保，跳转至车辆信息填写页面
         * @method _loadNew
		 * @param {Object} dt 步骤数据 
         * @protected
         */
        _loadNew: function(dt) {
            var _this = this,
                d = {
                    orderId: dt.orderId,
                    flowId: dt.flowId
                };
            
            function handle(data) {
                switch (data.result) {
					
					//需要录入车辆信息
                    case 'have':
                        _this.forward('step-info', {
                            backDisabled: true,
                            data: data
                        });
                        break;
					
					//不需要录入车辆信息
                    case 'not':
                        _this.ajaxSaveInputInfo({
							orderId: data.orderId,
							flowId: data.flowId
						});
                    default:
                        break;
                }
            }

            this.load('/json/auto/queryInputInfo.do', d, handle);
        }
        
    }, {
	
		/**
		 * 配置参数
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
		
			/**
			 * @attribute preserved
			 * @description 跳转后是否保留步骤
			 * @type Boolean
			 */
            preserved: {
                value: false
            }
        }
    });
    
}, '0.0.1', {
    requires: ['step', 'step-load', 'step-ajax']
});
