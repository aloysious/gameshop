/**
 * Y.StepLoading
 * @description 步骤加载中组件
 * @author huya.nzb@taobao.com
 * @date 2013-03-03
 * @version 0.0.1
 */

YUI.add('step-loading', function(Y) {

/**
 * 步骤加载中组件
 * @module step-loading
 */

	'use strict';
    
    var IE6 = (Y.UA.ie == 6),
        
        NODE_TEMPLATE = '<div class="step-loading"><img src="http://img02.taobaocdn.com/tps/i2/T1aTaTXdBbXXXXXXXX-138-39.png" class="step-loading-logo" /><div class="step-loading-content"></div></div>',
        MASK_TEMPLATE = '<div class="step-loading-mask"></div>',
        SHIM_TEMPLATE = '<iframe class="step-loading-shim" frameborder="0" src="javascript:false" title="Step Stacking Shim" tabindex="-1" role="presentation"></iframe>';
    
	/**
     * 步骤主体结构对象
     * @class StepLoading
	 * @for Step
     * @static
     */
    Y.StepLoading = {
        
		/**
		 * 是否已经渲染
		 * @property rendered
		 * @type Boolean
		 * @public
		 */
        rendered: false,
        
		/**
		 * 创建结构
		 * @method create
		 * @chainable
		 * @public
		 */
        create: function() {
            this._node = Y.Node.create(NODE_TEMPLATE);
            this._mask = Y.Node.create(MASK_TEMPLATE);
            this._content = this._node.one('div');
            IE6 && (this._shim = Y.Node.create(SHIM_TEMPLATE));
            return this;
        },
        
		/**
		 * 渲染组件
		 * @method render
		 * @param {Node} container 容器节点
		 * @chainable
		 * @public
		 */
        render: function(container) {
            this.create();
            this._container = container;
            !IE6 && this._mask.setStyle('opacity', 0.85);
            IE6 && this._shim.appendTo(container);
            this._mask.appendTo(container);
            this._node.appendTo(container);
            this.rendered = true;
            return this;
        },
        
		/**
		 * 显示加载层
		 * @method show
		 * @param {String} content 显示加载中文案
		 * @chainable
		 * @public
		 */
        show: function(content) {
			//默认为“正在为您呈现报价信息...”
            this._content.setContent(content || '正在为您呈现报价信息...');
            this._node.setStyle('display', 'block');
            this._mask.setStyle('display', 'block');
            IE6 && this._shim.setStyle('display', 'block');
            this.sync();
            return this;
        },
        
		/**
		 * 隐藏加载层
		 * @method hide
		 * @chainable
		 * @public
		 */
        hide: function() {
            this._node.setStyle('display', 'none');
            this._mask.setStyle('display', 'none');
            IE6 && this._shim.setStyle('display', 'none');
            return this;
        },
        
		/**
		 * 更新加载层位置
		 * @method sync
		 * @chainable
		 * @public
		 */
        sync: function() {
            var container = this._container,
                node = this._node,
                mask = this._mask,
                shim = this._shim,
                region = container.get('region'),
                nodeWidth = node.get('offsetWidth'),
                nodeHeight = node.get('offsetHeight');
                
            if (IE6) {
                mask.setStyles({
                    width: region.width + 'px',
                    height: region.height + 'px' 
                });
                shim.setStyles({
                    width: region.width + 'px',
                    height: region.height + 'px' 
                });
            }
            node.setStyles({
                marginLeft: -nodeWidth / 2 + 'px',
                marginTop: -nodeHeight / 2 + 'px'
            });
            
            return this;
        }
        
    };
    
}, '0.0.1', {
    requires: ['node']
});
