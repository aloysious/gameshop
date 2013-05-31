/**
 * Y.StepStdMod
 * @description 步骤主体结构
 * @author huya.nzb@taobao.com
 * @date 2013-03-01
 * @version 0.0.1
 */
 
YUI.add('step-stdmod', function(Y) {

/**
 * 步骤
 * @module step
 * @main step
 */

/**
 * 步骤主体结构
 * @module step
 * @submodule step-stdmod
 */
    
	'use strict';
	
	//步骤主体结构
    var STDMOD_TEMPLATE = [
            '<div class="step-hd">',
                '<h2>{title}</h2>',
                '<p>{note}</p>',
            '</div>',
            '<div class="step-bd"></div>',
            '<div class="step-ft">',
                '<div class="step-btns clearfix">',
                    '<a href="#" class="step-back">返回上一步</a>',
                '</div>',
            '</div>'
        ].join(''),
        
		//按钮通用模板
        BUTTON_TEMPLATE = '<button type="button" class="step-btn {cls}" title="{title}"></button>';
    
	
	/**
     * 步骤主体结构构造函数
     * @class StepStdMod
     * @constructor
     */
    function StepStdMod() {}
    
	/**
     * 步骤主体结构属性
     * @property ATTRS
     * @static
     */
    StepStdMod.ATTRS = {
        
		/**
         * @attribute title
         * @description 标题栏
         * @type String
         */
        title: {
            value: ''
        },
        
		/**
         * @attribute note
         * @description 标题栏说明
         * @type String
         */
        note: {
            value: ''
        },
        
		/**
         * @attribute backDisabled
         * @description 是否允许返回上一步
         * @type Boolean
         */
        backDisabled: {
            value: false
        },
        
		/**
         * @attribute header
         * @description 结构头部
         * @type Node
		 * @readOnly
         */
        header: {
            readOnly: true    
        },
        
		/**
         * @attribute body
         * @description 结构主体内容
         * @type Node
		 * @readOnly
         */
        body: {
            readOnly: true
        },
        
		/**
         * @attribute footer
         * @description 结构尾部
         * @type Node
		 * @readOnly
         */
        footer: {
            readOnly: true
        }
            
    };
    
    Y.mix(StepStdMod, {
        
		/**
         * 结构初始化
         * @method initializer
         * @public
         */
        initializer: function() {
            this._stdmodEvents = [];
            
            if (!this.get('parent').isBackable()) {
                this.set('backDisabled', true);
            }
            
            Y.before(this._renderStdMod, this, 'render');
        },
        
		/**
         * 结构销毁
         * @method destructor
         * @public
         */
        destructor: function() {
            while (this._stdmodEvents.length) {
                this._stdmodEvents.pop().detach();
            }
            this._btnsNode = null;
            this._stdmodEvents = null;
            delete this._btnsNode;
            delete this._stdmodEvents;
        },
        
		/**
         * 添加按钮
         * @method addButton
		 * @param {String} cls 按钮class
		 * @param {String} title 按钮文案
		 * @param {Function} onclick 点击回调函数
		 * @chainable
         * @public
         */
        addButton: function(cls, title, onclick) {
            var button = Y.Node.create(Y.Lang.sub(BUTTON_TEMPLATE, {
                cls: cls,
                title: title    
            }));
            
            if (typeof onclick == 'function') {
                this._stdmodEvents.push(
                    button.on('click', onclick, this)    
                );
            }
            
            this._btnsNode.appendChild(button);
            
            return this;
        },
        
		/**
         * 渲染结构
         * @method _renderStdMod
		 * @param {Node} container 步骤容器节点
         * @protected
         */
        _renderStdMod: function(container) {
            var title = this.get('title'),
                note = this.get('note'),
                backDisabled = this.get('backDisabled'),
                mod = Y.Node.create(Y.Lang.sub(STDMOD_TEMPLATE, {
                    title: title || '',
                    note: note || ''
                })),
                backBtn = mod.one('a'),
                btnsNode = mod.one('.step-btns');
            
            if (backDisabled) {
                backBtn.remove();
            } else {
                this._stdmodEvents.push(
                    backBtn.on('click', function(e) {
                        e.preventDefault();
                        this.back();
                    }, this)
                );
            }
            
            this._btnsNode = btnsNode;
            this._set('header', mod.one('.step-hd'));
            this._set('body', mod.one('.step-bd'));
            this._set('footer', mod.one('.step-ft'));
            container.appendChild(mod);
        }
        
    }, false, null, 4);
    
    Y.StepStdMod = StepStdMod;
    
}, '0.0.1', {
    requires: ['node']
});
