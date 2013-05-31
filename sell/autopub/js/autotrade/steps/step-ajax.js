/**
 * Y.StepAjax
 * @description 步骤通用Ajax请求模块
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-ajax', function(Y) {
 
/**
 * 步骤
 * @module step
 * @main step
 */

/**
 * 步骤通用Ajax请求模块
 * @module step
 * @submodule step-ajax
 */
   
	'use strict';
	
	/**
     * 步骤通用Ajax请求模块构造函数
     * @class StepAjax
     * @constructor
     */
    function StepAjax() {}
    
    Y.mix(StepAjax, {
        
		/**
         * 保存用户填写信息接口
         * @method ajaxSaveInputInfo
		 * @param {Object} d 接口传参
         * @public
         */
        ajaxSaveInputInfo: function(d) {
            var _this = this;
            
            function handle(data) {
                switch (data.result) {
					
					//返回正常
                    case 'normal':
                        //继续请求计算保费价格
                        _this.ajaxDetailQuote(data); 
                        break;
					
					//拒保
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data    
                        });
                        break;
					
					//选择车辆配置信息
                    case 'choose':
                        _this.forward('step-config', {
                            data: data    
                        });
                        break;
					
					//需要输入验证码
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        this.forward('step-randcode', {
                            data: data    
                        });
                        break;
                    default:
                        break;
                }
            }
            
            this.load('/json/auto/saveInputInfo.do', d, handle);
        },
        
		/**
         * 套餐报价接口
         * @method ajaxDetailQuote
		 * @param {Object} d 接口传参
         * @public
         */
        ajaxDetailQuote: function(d) {
            var _this = this,
                _d = {
                    flowId: d.flowId,
                    orderId: d.orderId,
                    bizBeginDate: d.bizBeginDate, //商业险日期
                    forceBeginDate: d.forceBeginDate //交强险日期    
                };
            
            function handle(data) {
                switch (data.result) {
					
					//返回正常，失败，提前投保，均跳转至套餐页
                    case 'normal':
                    case 'fail':
                    case 'bothBefore':
                    case 'bizBefore':
                    case 'forceBefore':
                        _this.forward('step-plan', {
                            data: d,
                            premiumData: data
                        });
                        break;
					
					//拒保
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//需要输入验证码
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        _this.forward('step-randcode', {
                            data: data
                        });
                        break;
                     default:
                        break;
                }
            }
            
            this.load('/json/auto/detailQuote.do', _d, handle);
        }
            
    }, false, null, 4);
    
    Y.StepAjax = StepAjax;
    
}, '0.0.1', {
    requires: ['step-load']
});
