/**
 * Y.StepMessage
 * @description 提示信息步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-message', function(Y) {

/**
 * 提示信息步骤
 * @module step-message
 */    
    'use strict';
    
    var MESSAGE_TEMPLATE = '<div class="message-bd">{message}</div>';
    
	/**
     * 提示信息步骤构造函数
     * @class StepMessage
	 * @extends Step
	 * @uses StepStdMod
     * @constructor
     */
    Y.StepMessage = Y.Base.create('step-message', Y.Step, [
        Y.StepStdMod
    ], {
        
		/**
         * 初始化函数
         * @method initializer
		 * @param {Object} config 组件初始化参数
         * @public
         */
        initializer: function(config) {
            var data = this.data = config.data || {};
            if (data.result == 'refuse') {
                this.set('backDisabled', true);
            }
        },
        
		/**
         * 渲染结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数
         * @public
         */
        render: function(container, config) {
            this.get('body').setContent(Y.Lang.sub(MESSAGE_TEMPLATE, {
				//接受promptMsg和message两个参数
                message: this.data.promptMsg || this.data.message || ''
            }));           
            this.addButton('step-btn-close', '关闭', function() {
                this.get('parent')._stepBox.hide();
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
                value: '中国平安保险公司'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod']
});
