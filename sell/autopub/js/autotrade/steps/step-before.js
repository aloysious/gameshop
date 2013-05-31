/**
 * Y.StepBefore
 * @description 提前投保步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-before', function(Y) {

/**
 * 提前投保步骤
 * @module step-before
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="before-handle">{handles}</ul>',
        BIZ_BEFORE_TEMPLATE = '<li><p>先投保交强险，商业险等到期了再来投保。</p><a href="{link}">投保交强险</a></li>',
        FORCE_BEFORE_TEMPLATE = '<li><p>先投保商业险，交强险等到期了再来投保。</p><a href="{link}">投保商业险</a></li>',
        BOTH_BEFORE_TEMPLATE = '<li><p>请核对保险生效日期，如果不小心填错了请返回修改。</p><a href="#" class="modify-effect">修改保险生效日期</a></li>';
    
	/**
     * 提前投保步骤构造函数
     * @class StepBefore
	 * @extends Step
	 * @uses StepStdMod
     * @constructor
     */
    Y.StepBefore = Y.Base.create('step-before', Y.Step, [
        Y.StepStdMod
    ], {
        
		/**
         * 初始化
         * @method initializer
		 * @param {Object} config 组件初始化参数
		 * @param {Object} [config.data] 步骤数据 
         * @public
         */
        initializer: function(config) {
            var data = config.data || {};
            this.set('note', data.promptMsg);
        },
        
		/**
         * 渲染步骤结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数 
         * @public
         */
        render: function(container, config) {
            var html = '',
                data = config.data || {},
				domain = location.href.indexOf('daily.taobao.net') > -1 ? 'http://baoxian.daily.taobao.net' : 'http://baoxian.taobao.com';

            if (data.result == 'bizBefore') {
                html += Y.Lang.sub(BIZ_BEFORE_TEMPLATE, {
					link: domain + '/auto/quote.html?itemFlag=force&tmpOrderId=' + data.orderId
				});
            } else if (data.result == 'forceBefore') {
                html += Y.Lang.sub(FORCE_BEFORE_TEMPLATE, {
					link: domain + '/auto/quote.html?itemFlag=biz&tmpOrderId=' + data.orderId
				});
            } else {}
            html += BOTH_BEFORE_TEMPLATE;
            this.get('body').append(Y.Lang.sub(LIST_TEMPLATE, {
                handles: html
            }));
            this.get('body').delegate('click', function(e) {
                e.preventDefault();
                this.back();
            }, '.modify-effect', this);
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
                value: '您目前的保险尚未到期'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod']
});
