/**
 * Y.Step
 * @description 流程步骤组件
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */

YUI.add('step', function(Y) {

/**
 * 流程步骤组件
 * @module step
 * @submodule step
 */
    
	'use strict';
	
	var Lang = Y.Lang;
	
	
    /**
     * 流程步骤组件构造函数
     * @class Step
     * @extends Base
     * @constructor
     */ 
    Y.Step = Y.Base.create('step', Y.Base, [], {
        
        // -- 组件生命周期 ----------------------------------------
        
        /**
         * 组件初始化
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
         * 析构函数
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
         * 渲染函数
         * @method render
         * @return this
         * @public
         */
        render: function(container, params) {
            return this;
        },
        
        // -- 组件公用方法 ----------------------------------------
        
        /**
         * 后退一步
         * @method back
         * @param {Function} callback 后退完成回调函数
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
         * 前进一步
         * @method forward
         * @param {String} name 下一步骤的名字
         * @param {Object} params 下一步骤的初始化配置
         * @param {Function} callback 前进完成回调函数
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
             * @description 父步骤管理器
             * @type StepManager
             */
            parent: {
                value: null    
            },
            
            /**
             * @attribute container
             * @description 步骤容器
             * @type Node
             */
            container: {
                setter: Y.one    
            },
            
            /**
             * @attribute preserved
             * @description 前进后是否保存在历史记录
             * @type Boolean
             */
            preserved: {
                value: true
            }
        }
    });
	
	/**
     * 创建子步骤类简捷方法
     * @method create
     * @param {String} name 步骤名字
     * @param {Object} proto 原型方法
     * @param {Object} attrs 属性配置
     * @return {Function} 子类构造函数
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
