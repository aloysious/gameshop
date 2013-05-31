/**
 * Y.StepManager
 * @description 流程管理器组件
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */

YUI.add('stepmanager', function(Y) {

/**
 * 流程步骤组件
 * @module stepmanager
 * @submodule stepmanager
 */
    
    'use strict';
    
    var Lang = Y.Lang,
        BOX_TEMPLATE = '<div class="yui3-stepmanager"><div class="yui3-stepmanager-list"></div></div>';
    
    /**
     * 流程管理器组件构造函数
     * @class StepManager
     * @extends Base
     * @constructor
     */ 
    Y.StepManager = Y.Base.create('stepmanager', Y.Base, [], {
        
        // -- 组件生命周期 ----------------------------------------
        
        /**
         * 组件初始化
         * @method initializer
         * @public
         */ 
        initializer: function() {
            this._history = [];
            this._stack = [];
            this._anim = null;
            
            this._initStepMap();
            
            this.on('*:back', this._onStepBack);
            this.on('*:forward', this._onStepForward);
            this.after('activeStepChange', this._onActiveStepChange);            
        },
        
        /**
         * 析构函数
         * @method destructor
         * @public
         */  
        destructor: function() {
            this.clear();
            this.get('boxNode').remove(true);
        },
        
        /**
         * 渲染函数
         * @method render
         * @return this
         * @public
         */
        render: function(container) {
            this._renderManagerBox(container);
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
            var history = this._history;
                
            if (history.length < 2) { return this; }
                
            this._setActiveStep('back', {
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
            this._setActiveStep('forward', {
                name: name,
                params: params,
                callback: callback
            });
            
            return this;
        },
		
		/**
         * 是否可以后退
         * @method isBackable
         * @return {Boolean} backable
         * @public
         */
		isBackable: function() {
			var history = this._history,
				len = history.length;
				
			if (!len || (len == 1 && !history[len - 1].get('preserved'))) {
                return false;
            }
			
			return true;
		},
        
        /**
         * 清除历史记录
         * @method clear
         * @return this
         * @public
         */
        clear: function() {
            var history = this._history,
                step;
            
            while (history.length) {
                step = history.pop();
                step.destroy && step.destroy();
            }
            
            this.set('activeStep', null);
            
            return this;
        },        
        
        // -- 组件私有方法 ----------------------------------------
        
        /**
         * 创建一个步骤
         * @method _createStep
         * @param {String} name 步骤名字
         * @param {Object} params 步骤初始化配置
         * @return {Step} step
         * @protected
         */         
        _createStep: function(name, params) {
            var steps = this._stepMap,
                sConstructor = steps[name],
                step = null,
                container;
            
            if (Lang.isFunction(sConstructor)) {
                container = Y.Node.create('<div class="yui3-step" style="position:absolute;visibility:hidden;"></div>');
                container.addClass(sConstructor.NAME);
                params = params || {};
                params.parent = this;
                params.container = container;
                step = new sConstructor(params);
            }
            
            return step;
        },
        
        /**
         * 初始化步骤信息
         * @method _initStepMap
         * @protected
         */
        _initStepMap: function() {
            var steps = this.get('steps'),
                map = {};
            
            if (Lang.isArray(steps)) {
                Y.Array.each(steps, function(item) {
                    map[item.NAME] = item;    
                });
            }
            
            this._stepMap = map;
        },
        
        /**
         * 渲染DOM结构
         * @method _renderManagerBox
         * @param {Node} 父容器节点
         * @protected
         */ 
        _renderManagerBox: function(container) {
            var boxNode = Y.Node.create(BOX_TEMPLATE),
                container = Y.one(container) || this.get('container') || Y.one('body'),
                args = Y.Array(arguments);
            
            args[0] = container;
            container.append(boxNode);
            this.set('container', container);
            this.set('boxNode', boxNode);
            this.set('listNode', boxNode.one('div'));
        },
        
        /**
         * 设置下一个步骤
         * @method _setActiveStep
         * @param {String} direction 步骤切换方向
         * @param {Object} config 步骤相关参数
         * @protected
         */
        _setActiveStep: function(direction, config) {
            var stack = this._stack,
                running = this._anim && this._anim.get('running'),
                step, item;
                
            if (running) {
                if (direction) {
                    stack.push({
                        direction: direction,
                        config: config
                    });
                }
            } else {
                if (Lang.isUndefined(direction) && stack.length) {
                    item = stack.shift();
                    direction = item.direction;
                    config = item.config;
                }
                if (!Lang.isUndefined(direction)) {
                    config = config || {};
                    step = this._getNewStep(direction, config.name, config.params, config.callback);
                    step && this.set('activeStep', step, {
                        direction: direction,
                        callback: config.callback
                    });
                }
            }
        },
        
        /**
         * 获取新步骤
         * @method _getNewStep
         * @param {String} direction 步骤切换方向
         * @param {String} name 步骤名字
         * @param {Object} config 步骤初始化参数
         * @return {Step} step
         * @protected
         */       
        _getNewStep: function(direction, name, params) {
            var history = this._history,
                active, step;
                
            if (direction == 'back') {
                history.pop();
                step = history[history.length - 1];
            } else {
                active = this.get('activeStep');
                step = this._createStep(name, params);
                if (!step) { return null; }
                if (active && !active.get('preserved')) {
                    history.pop();
                }
                history.push(step);
            }
            return step;
        },
        
        /**
         * 切换动画
         * @method _transition
         * @param {Object} config 步骤相关参数
         * @param {Step} config.prevStep 旧步骤
         * @param {Step} config.newStep 新步骤
         * @param {String} config.direction 步骤切换方向
         * @param {Function} config.callback 切换完成回调函数
         * @protected
         */        
        _transition: function(config) {
            
            if (!config || !config.prevStep) { return; }
            
            var _this = this,
                prevStep = config.prevStep,
                newStep = config.newStep,
                callback = config.callback,
                direction = config.direction,
                boxNode = this.get('boxNode'),
                listNode = this.get('listNode'),
                isBack = direction == 'back',
                pCon = prevStep.get('container'),
                nCon = newStep.get('container');
            
            nCon.setStyle('display', 'block');
            
            var pWidth = pCon.get('offsetWidth'),
                pHeight = pCon.get('offsetHeight'),
                nWidth = nCon.get('offsetWidth'),
                nHeight = nCon.get('offsetHeight'),
                left = isBack ? -nWidth : pWidth;
            
            boxNode.setStyle('overflow', 'hidden');
            listNode.setStyle('height', pHeight + 'px');
            nCon.setStyles({
                position: 'absolute',
                top: '0px',
                left: left + 'px',
                display: 'block',
				visibility: 'visible'
            });
            
            // YUI Transition回调事件有bug，改成Anim组件
            this._anim = new Y.Anim({
                node: listNode,
                duration: 0.3,
                easing: Y.Easing.easeOut,
                to: {
                    left: -left + 'px',
                    height: nHeight + 'px'
                }
            });
            
            this._anim.on('end', function() {
                
                if (isBack || !prevStep.get('preserved')) {
                    prevStep.destroy(true);
                } else {
                    pCon._node && pCon.setStyle('display', 'none');
                }
                
                listNode.setStyles({
                    left: '0px',
                    height: 'auto'
                });
                nCon._node && nCon.setStyles({
                    position: 'relative',
                    left: '0px' 
                });
                
                boxNode.setStyle('overflow', '');
                
                if (Lang.isFunction(callback)) {
                    callback.call(newStep, {
                        direction: direction
                    });
                }
                newStep.fire('load', {
                    direction: direction
                });
                
                _this._anim.destroy();
                _this._anim = null;
                
                _this._setActiveStep();
            });
            
            this._anim.run();
        },
        
        // -- 组件属性值修改事件回调 ----------------------------------------
        
        /**
         * 当前步骤变换回调
         * @method _onActiveStepChange
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _onActiveStepChange: function(e) {
            if (e.newVal && e.prevVal !== e.newVal) {
                if (e.direction == 'forward') {
                    var container = e.newVal.get('container');
                    this.get('listNode').append(container);
                    e.newVal.render(container, e.newVal._config);
                }
                if (e.prevVal) {
					if (this.get('useTransition')) {
						this._transition({
							prevStep: e.prevVal,
							newStep: e.newVal,
							direction: e.direction,
							callback: e.callback
						});
					} else {
						if (e.direction == 'back' || !e.prevVal.get('preserved')) {
							e.prevVal.destroy(true);
						} else {
							e.prevVal.get('container')._node && e.prevVal.get('container').setStyle('display', 'none');
						}
						e.newVal.get('container').setStyles({
							'position': 'relative',
							'visibility': 'visible',
							'display': 'block'
						});
						if (Lang.isFunction(e.callback)) {
							e.callback.call(e.newVal, {
								direction: e.direction
							});
						}
						e.newVal.fire('load', {
							direction: e.direction
						});
					}
                } else {
					e.newVal.get('container').setStyles({
						'position': 'relative',
						'visibility': 'visible'
					});
                    if (Lang.isFunction(e.callback)) {
                        e.callback.call(e.newVal, {
                            direction: e.direction
                        });
                    }
                    e.newVal.fire('load', {
                        direction: e.direction   
                    });
                }
            }
        },
        
        // -- 组件自定义事件回调 ----------------------------------------
        
        /**
         * 步骤后退冒泡监听函数
         * @method _onStepBack
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _onStepBack: function(e) {
            this.back(e.callback);
        },
        
        /**
         * 步骤前进冒泡监听函数
         * @method _onStepForward
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _onStepForward: function(e) {
            this.forward(e.name, e.params, e.callback);
        }
        
    }, {
        ATTRS: {
            
            /**
             * @attribute container
             * @description 父容器
             * @type Node
             */
            container: {
                setter: Y.one  
            },
            
            /**
             * @attribute boxNode
             * @description 管理器容器
             * @type Node
             */
            boxNode: {
                setter: Y.one    
            },
            
            /**
             * @attribute listNode
             * @description 步骤列表节点
             * @type Node
             */
            listNode: {
                value: null  
            },
            
            /**
             * @attribute steps
             * @description 步骤名称与构造函数列表
             * @type Array
             */
            steps: {
                value: []
            },
            
            /**
             * @attribute activeStep
             * @description 当前步骤
             * @type Step
             */
            activeStep: {
                value: null
            },
			
			/**
             * @attribute useTransition
             * @description 是否使用动画切换
             * @type Step
             */
			useTransition: {
				value: true
			}
        }
    });
    
}, '0.0.1', {
    requires: ['node-base', 'event-base', 'anim']
});
