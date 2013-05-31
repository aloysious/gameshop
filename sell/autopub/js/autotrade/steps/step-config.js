/**
 * Y.StepConfig
 * @description 选择车辆配置型号步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-config', function(Y) {

/**
 * 选择车辆配置型号步骤
 * @module step-config
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="config-list">{items}</ul>',
        ITEM_TEMPLATE = '<li><label><input type="radio" data-name="{label}" name="{name}" value="{value}" /><span>{label}</span></label></li>';
    
	/**
     * 选择车辆配置型号步骤构造函数
     * @class StepConfig
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
	 * @uses StepAjax
     * @constructor
     */
    Y.StepConfig = Y.Base.create('step-config', Y.Step, [
        Y.StepStdMod,
        Y.StepLoad,
        Y.StepAjax
    ], {
		
		/**
         * 渲染步骤结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数 
         * @public
         */
        render: function(container, config) {
            this.data = config.data || {};
            this._renderList();
            this.addButton('step-btn-continue', '继续报价', this._onContinueClick);
        },
        
		/**
         * 渲染配置型号列表
         * @method _renderList
         * @protected
         */
        _renderList: function() {
            var data = this.data,
                id = Y.guid(),
                items = '',
                list;
            
            Y.Array.each(data.models, function(item) {
                items += (Y.Lang.sub(ITEM_TEMPLATE, {
                    name: id,
                    label: item.name,
                    value: item.id
                }));
            });
            
            list = Y.Lang.sub(LIST_TEMPLATE, {
                items: items
            });
            
            this.get('body').append(list);
            
            if (items) {
                this.get('body').one('input').set('checked', true);
            }
        },
        
		/**
         * 点击选择一个型号
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
            var _this = this,
                modelId = '',
                modelName = '';
            
            this.get('body').all('input').each(function(item) {
                if (item.get('checked')) {
                    modelId = item.get('value');
                    modelName = item.getAttribute('data-name');
                }    
            });
            
            this.ajaxSaveInputInfo({
                flowId: this.data.flowId,
                orderId: this.data.orderId,
                'vehicle.modelCode': modelId, //传到后台的参数添加vehicle前缀
                'vehicle.modelName': modelName //传到后台的参数添加vehicle前缀
            });
        }
        
    }, {
        
		/**
		 * 配置参数
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
			
			/**
			 * @attribute title
			 * @description 步骤标题
			 * @type String
			 */
            title: {
                value: '请选择投保车辆的配置型号'    
            },
			
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
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax']
});
