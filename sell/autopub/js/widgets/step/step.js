/**
 * Y.Step
 * @description ���̲������
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */

YUI.add('step', function(Y) {

/**
 * ���̲������
 * @module step
 * @submodule step
 */
    
	'use strict';
	
	var Lang = Y.Lang;
	
	
    /**
     * ���̲���������캯��
     * @class Step
     * @extends Base
     * @constructor
     */ 
    Y.Step = Y.Base.create('step', Y.Base, [], {
        
        // -- ����������� ----------------------------------------
        
        /**
         * �����ʼ��
         * @method initializer
         * @public
         */ 
        initializer: function(config) {
            config = config || {};
            this._config = config;
            this._parent = config.parent;
            this.publish('back');
            this.publish('forward');
            this.publish('load');
            if (this._parent) {
                this.addTarget(this._parent);
                delete config.parent;
            }
            delete config.container;
        },
        
        /**
         * ��������
         * @method destructor
         * @public
         */    
        destructor: function() {
            if (this._parent) {
                this.removeTarget(this._parent);
                delete this._parent;
            }
            delete this._config;
            this.get('container').remove(true);
            this.set('parent', null);
            this.set('container', null);
        },
        
        /**
         * ��Ⱦ����
         * @method render
         * @return this
         * @public
         */
        render: function(container, params) {
            return this;
        },
        
        // -- ������÷��� ----------------------------------------
        
        /**
         * ����һ��
         * @method back
         * @param {Function} callback ������ɻص�����
         * @return this
         * @public
         */
        back: function(callback) {
            this.fire('back', {
                callback: callback
            });
            return this;
        },
        
        /**
         * ǰ��һ��
         * @method forward
         * @param {String} name ��һ���������
         * @param {Object} params ��һ����ĳ�ʼ������
         * @param {Function} callback ǰ����ɻص�����
         * @return this
         * @public
         */
        forward: function(name, params, callback) {
            if (Lang.isFunction(params)) {
                callback = params;
                params = null;
            }
            this.fire('forward', {
                name: name,
                params: params,
                callback: callback
            });
            return this;
        }
		        
    }, {
        ATTRS: {
            
            /**
             * @attribute parent
             * @description �����������
             * @type StepManager
             */
            parent: {
                value: null    
            },
            
            /**
             * @attribute container
             * @description ��������
             * @type Node
             */
            container: {
                setter: Y.one    
            },
            
            /**
             * @attribute preserved
             * @description ǰ�����Ƿ񱣴�����ʷ��¼
             * @type Boolean
             */
            preserved: {
                value: true
            }
        }
    });
	
	/**
     * �����Ӳ������ݷ���
     * @method create
     * @param {String} name ��������
     * @param {Object} proto ԭ�ͷ���
     * @param {Object} attrs ��������
     * @return {Function} ���๹�캯��
     * @static
     */
	Y.Step.create = function(name, proto, attrs) {
		return Y.Base.create(name, Y.Step, [], proto, {
			ATTRS: attrs
		});
	};

}, '0.0.1', {
    requires: ['node-base', 'event-base', 'event-delegate', 'base']
});
