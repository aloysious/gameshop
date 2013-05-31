/**
 * Y.StepLoading
 * @description ������������
 * @author huya.nzb@taobao.com
 * @date 2013-03-03
 * @version 0.0.1
 */

YUI.add('step-loading', function(Y) {

/**
 * ������������
 * @module step-loading
 */

	'use strict';
    
    var IE6 = (Y.UA.ie == 6),
        
        NODE_TEMPLATE = '<div class="step-loading"><img src="http://img02.taobaocdn.com/tps/i2/T1aTaTXdBbXXXXXXXX-138-39.png" class="step-loading-logo" /><div class="step-loading-content"></div></div>',
        MASK_TEMPLATE = '<div class="step-loading-mask"></div>',
        SHIM_TEMPLATE = '<iframe class="step-loading-shim" frameborder="0" src="javascript:false" title="Step Stacking Shim" tabindex="-1" role="presentation"></iframe>';
    
	/**
     * ��������ṹ����
     * @class StepLoading
	 * @for Step
     * @static
     */
    Y.StepLoading = {
        
		/**
		 * �Ƿ��Ѿ���Ⱦ
		 * @property rendered
		 * @type Boolean
		 * @public
		 */
        rendered: false,
        
		/**
		 * �����ṹ
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
		 * ��Ⱦ���
		 * @method render
		 * @param {Node} container �����ڵ�
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
		 * ��ʾ���ز�
		 * @method show
		 * @param {String} content ��ʾ�������İ�
		 * @chainable
		 * @public
		 */
        show: function(content) {
			//Ĭ��Ϊ������Ϊ�����ֱ�����Ϣ...��
            this._content.setContent(content || '����Ϊ�����ֱ�����Ϣ...');
            this._node.setStyle('display', 'block');
            this._mask.setStyle('display', 'block');
            IE6 && this._shim.setStyle('display', 'block');
            this.sync();
            return this;
        },
        
		/**
		 * ���ؼ��ز�
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
		 * ���¼��ز�λ��
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
