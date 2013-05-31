/**
 * Y.StepValidate
 * @description 步骤校验
 * @author huya.nzb@taobao.com
 * @date 2013-03-06
 * @version 0.0.1
 */
 
YUI.add('step-validate', function(Y) {
 
/**
 * 步骤
 * @module step
 * @main step
 */

/**
 * 步骤校验模块
 * @module step
 * @submodule step-validate
 */
   
	'use strict';
	
	/**
     * 步骤校验构造函数
     * @class StepValidate
     * @constructor
     */
	function StepValidate() {
		this._validateConfig = {};
	}

	//TODO
	//开发时间紧张，临时方案
	//功能不够通用，需重构
	Y.mix(StepValidate, {
	
		/**
         * 初始化
         * @method initializer
         * @public
         */
		initializer: function() {
			this.publish('validate');
			this.on('validate', function(e) {
				if (e.valid) {
					this.removeError(e.elem);
				} else {
					this.addError(e.elem, e.error);
				}
			});
		},
		
		/**
         * 初始化
         * @method setValidateConfig
		 * @param {Object} config 校验规则配置对象
		 * @chainable
         * @public
         */
		setValidateConfig: function(config) {
			var _this = this,
				body = this.get('body'), elem;
				
			this._validateConfig = Y.aggregate(this._validateConfig, config || {}, true);
			Y.Object.each(this._validateConfig, function(v, k) {
				elem = body.one(k);
				(function(node, name) {
					if (node) {
						node.on('focus', function(e) {
							_this.removeError(node);
						}, _this);
						node.on('blur', function(e) {
							_this.validate(name);
						}, _this);
					}
				})(elem, k);
			}, this);
			
			return this;
		},
		
		/**
         * 校验字段
         * @method validate
		 * @param {String} name 校验字段选择器
		 * @return {Boolean} valid 校验结果
         * @public
         */
		validate: function(name) {
			var valid = true,
				config = this._validateConfig,
				elemConfig,
				ret,
				first;
				
			if (name) {
				elemConfig = config[name];
				if (elemConfig) {
					ret = this._validate(name, elemConfig);
					if (ret.node) {
						valid = ret.valid;
						if (valid) {
							ret.node.ancestor('.step-elem').removeClass('elem-error');
						} else {
							ret.node.ancestor('.step-elem').addClass('elem-error');
						}
						this.fire('validate', {
							elem: ret.node,
							valid: ret.valid,
							error: ret.errors[0]
						});
					}
				}
			} else {
				first = true;
				Y.Object.each(config, function(v, k) {
					valid = this.validate(k) && valid;
				}, this);
			}
			
			return valid;
		},
		
		/**
         * 添加错误
         * @method addError
		 * @param {Node} elem 字段节点
		 * @param {String} content 错误文案
		 * @chainable
         * @public
         */
		addError: function(elem, content) {
			if (!elem) { return this; }
			var err = elem.ancestor('.step-elem').one('.step-elem-error');
			if (err) {
				if (content) {
					err.setContent(content);
				}
				err.removeClass('hidden');
			}
			return this;
		},
		
		/**
         * 移除错误
         * @method removeError
		 * @param {Node} elem 字段节点
		 * @chainable
         * @public
         */
		removeError: function(elem) {
			var err = elem.ancestor('.step-elem').one('.step-elem-error');
			if (err) {
				err.addClass('hidden');
			}
			return this;
		},
		
		/**
         * 校验字段
         * @method _validate
		 * @param {String} name 校验字段选择器
		 * @return {Object} validObj { valid: valid, errors: errors, node: node }
         * @protected
         */
		_validate: function(name, config) {
			var node = this.get('body').one(name);
			
			if (!node) {
				return {
					valid: true,
					errors: [],
					node: node
				};
			}
			
			var	rules = config,
				value = Y.Lang.trim(node.get('value')),
				valid = true,
				errors = [],
				v;
			
			//TODO
			//添加更多校验功能
			
			//校验是否为空
			if (rules.required) {
				v = this._validateRequired.call(node, value, rules.required);
				if (!v) {
					errors.push(rules.required.error);
				}
				valid = v && valid;
			}
			
			//校验正则格式
			if (rules.pattern) {
				v = this._validatePattern.call(node, value, rules.pattern);
				if (!v) {
					errors.push(rules.pattern.error);
				}
				valid = v && valid;
			}
			
			//校验自定义函数
			if (rules.custom) {
				v = this._validateCustom.call(node, value, rules.custom);
				if (!v) {
					errors.push(rules.custom.error);
				}
				valid = v && valid;
			}
			
			return {
				valid: valid,
				errors: errors,
				node: node
			};
		},
		
		/**
         * 校验必需字段
         * @method _validateRequired
		 * @param {String} value 字段值
		 * @param {Object} config 当前字段必需校验规则
		 * @return {Boolean} valid
         * @protected
         */
		_validateRequired: function(value, config) {
			var placeholder = config.placeholder;
			return value !== '' && (!placeholder || value !== placeholder);
		},
		
		/**
         * 校验正则格式
         * @method _validatePattern
		 * @param {String} value 字段值
		 * @param {Object} config 当前字段正则校验规则
		 * @return {Boolean} valid
         * @protected
         */
		_validatePattern: function(value, config) {
			var exp = new RegExp(config.expression);
			return !exp || exp.test(value);
		},
		
		/**
         * 校验自定义规则
         * @method _validateCustom
		 * @param {String} value 字段值
		 * @param {Object} config 当前字段自定义校验规则
		 * @return {Boolean} valid
         * @protected
         */
		_validateCustom: function(value, config) {
			var fn = config.fn;
			return typeof fn != 'function' || fn.call(this, value, config);
		}
	
	}, false, null, 4);
	
	Y.StepValidate = StepValidate;
	
}, '0.0.1', {
	requires: ['node-base']
});