/**
 * Y.StepStdMod
 * @description ��������ṹ
 * @author huya.nzb@taobao.com
 * @date 2013-03-01
 * @version 0.0.1
 */
 
YUI.add('step-stdmod', function(Y) {

/**
 * ����
 * @module step
 * @main step
 */

/**
 * ��������ṹ
 * @module step
 * @submodule step-stdmod
 */
    
	'use strict';
	
	//��������ṹ
    var STDMOD_TEMPLATE = [
            '<div class="step-hd">',
                '<h2>{title}</h2>',
                '<p>{note}</p>',
            '</div>',
            '<div class="step-bd"></div>',
            '<div class="step-ft">',
                '<div class="step-btns clearfix">',
                    '<a href="#" class="step-back">������һ��</a>',
                '</div>',
            '</div>'
        ].join(''),
        
		//��ťͨ��ģ��
        BUTTON_TEMPLATE = '<button type="button" class="step-btn {cls}" title="{title}"></button>';
    
	
	/**
     * ��������ṹ���캯��
     * @class StepStdMod
     * @constructor
     */
    function StepStdMod() {}
    
	/**
     * ��������ṹ����
     * @property ATTRS
     * @static
     */
    StepStdMod.ATTRS = {
        
		/**
         * @attribute title
         * @description ������
         * @type String
         */
        title: {
            value: ''
        },
        
		/**
         * @attribute note
         * @description ������˵��
         * @type String
         */
        note: {
            value: ''
        },
        
		/**
         * @attribute backDisabled
         * @description �Ƿ���������һ��
         * @type Boolean
         */
        backDisabled: {
            value: false
        },
        
		/**
         * @attribute header
         * @description �ṹͷ��
         * @type Node
		 * @readOnly
         */
        header: {
            readOnly: true    
        },
        
		/**
         * @attribute body
         * @description �ṹ��������
         * @type Node
		 * @readOnly
         */
        body: {
            readOnly: true
        },
        
		/**
         * @attribute footer
         * @description �ṹβ��
         * @type Node
		 * @readOnly
         */
        footer: {
            readOnly: true
        }
            
    };
    
    Y.mix(StepStdMod, {
        
		/**
         * �ṹ��ʼ��
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
         * �ṹ����
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
         * ��Ӱ�ť
         * @method addButton
		 * @param {String} cls ��ťclass
		 * @param {String} title ��ť�İ�
		 * @param {Function} onclick ����ص�����
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
         * ��Ⱦ�ṹ
         * @method _renderStdMod
		 * @param {Node} container ���������ڵ�
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
