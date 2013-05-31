/**
 * Y.AutoTradeStepManager
 * @description 车险商品页报价步骤
 * @author huya.nzb@taobao.com
 * @date 2013-02-28
 * @version 0.0.1
 */
 
YUI.add('autotrade-stepmanager', function(Y) {

/**
 * 商品页逻辑
 * @module autotrade
 * @main autotrade
 */

/**
 * 车险商品页报价步骤
 * @module autotrade
 * @submodule autotrade-stepmanager
 */
    
	/**
     * 车险商品页报价步骤构造函数
     * @class AutoTradeStepManager
     * @for AutoTrade
     * @constructor
     */    
    function AutoTradeStepManager() {}
    
    Y.mix(AutoTradeStepManager, {
        
		/**
         * 模块初始化
         * @method initializer
         * @public
         */ 
        initializer: function() {
            Y.after(this._bindStepManager, this, 'render');
        },
        
		/**
         * 显示报价弹窗
         * @method showStepManager
		 * @param {EventFacade} 事件对象
         * @public
         */ 
        showStepManager: function(e) {
            if (!this._stepManager)  {
                this._renderStepManager();
            }
            if (!this._stepBox) {
                this._renderStepBox();
            }
            this._stepBox.show();
            this._checkRenewStep(e);
        },
        
		/**
         * 初始化检查是否是续保用户
         * @method _checkRenewStep
         * @protected
         */
        _checkRenewStep: function(e) {
			// 新车未上牌时，车牌号为前缀加“*”，例如“粤A*”
            this._stepManager.forward('step-checkrenew', {
                cityCode: e.cityCode,
                cityName: e.cityName,
                carId: e.newCar ? (e.cityPrefix + '*') : e.carId,
                itemId: e.itemId
            });
        },
        
		/**
         * 绑定表单提交监听回调
         * @method _bindStepManager
         * @protected
         */
        _bindStepManager: function() {
            this.on('submit', function(e) {
                this.showStepManager(e);
            });
        },
        
		/**
         * 渲染步骤管理组件
         * @method _renderStepManager
         * @protected
         */
        _renderStepManager: function() {
            this._stepManager = new Y.StepManager({
                steps: [
					//车辆信息填写步骤
                    Y.StepInfo,
					//消息步骤
                    Y.StepMessage,
					//提前投保步骤
                    Y.StepBefore,
					//验证码步骤					
                    Y.StepRandcode,
					//检查是否是续保用户步骤
                    Y.StepCheckRenew, 
					//续保用户身份证确认步骤
                    Y.StepRenew, 
					//车辆配置信息步骤
                    Y.StepConfig,
					//报价方案步骤
                    Y.StepPlan 
                ],
				useTransition: (Y.UA.ie != 6)
            });
            this._stepManager.on('*:load', function(e) {
                Y.StepLoading.hide();   
            });  
        },
        
		/**
         * 渲染报价弹窗
         * @method _renderStepBox
         * @protected
         */
        _renderStepBox: function() {
            var mask = Y.Node.create('<div class="autotrade-stepbox-mask hidden"></div>'),
                close = Y.Node.create('<a href="#" class="autotrade-stepbox-close" title="关闭"></a>'),
                bottom = Y.Node.create('<div class="autotrade-stepbox-bottom"></div>'),
                stepBox = new Y.Overlay({
                    render: true,
                    visible: false,
                    width: '594px',
                    zIndex: 200000,
                    centered: true
                });
            
            function sizeMask(visible) {
                if (visible && Y.UA.ie == 6) {
                    mask.setStyles({
                        width: Y.DOM.docWidth() + 'px',
                        height: Y.DOM.docHeight() + 'px'
                    });
                }
            }
            
            mask.setStyles({
                opacity: 0.6,
                zIndex: 200000
            });
            bottom.setStyle('opacity', 0.2);
            stepBox.get('boundingBox').addClass('autotrade-stepbox');
            stepBox.get('boundingBox').insert(mask, 'before');
            stepBox.get('boundingBox').append(bottom);
            this._stepManager.render(stepBox.get('contentBox'));
            stepBox.get('contentBox').append(close);
            
            stepBox.after('visibleChange', function(e) {
                sizeMask(e.newVal);
                mask.toggleClass('hidden', !e.newVal);
                if (!e.newVal && this._stepManager) {
                    this._stepManager.clear();
                    Y.StepLoading.hide();
                }
            }, this);
            close.on('click', function(e) {
                e.preventDefault(); 
                stepBox.hide();   
            });
            
            if (!Y.StepLoading.rendered) {
                Y.StepLoading.render(this._stepManager.get('listNode'));
            }
            
            this._stepBox = stepBox;
            this._stepBoxMask = mask;
            this._stepManager._stepBox = this._stepBox;
        }
        
    }, false, null, 4);
    
    Y.AutoTradeStepManager = AutoTradeStepManager;
    
}, '0.0.1', {
    requires: ['stepmanager', 'step', 'overlay', 'io', 'json-parse']
});
