/**
 * Y.StepValidate
 * @description ����У��
 * @author huya.nzb@taobao.com
 * @date 2013-03-06
 * @version 0.0.1
 */
 
YUI.add('step-validate', function(Y) {
 
/**
 * ����
 * @module step
 * @main step
 */

/**
 * ����У��ģ��
 * @module step
 * @submodule step-validate
 */
   
	'use strict';
	
	/**
     * ����У�鹹�캯��
     * @class StepValidate
     * @constructor
     */
	function StepValidate() {
		this._validateConfig = {};
	}

	//TODO
	//����ʱ����ţ���ʱ����
	//���ܲ���ͨ�ã����ع�
	Y.mix(StepValidate, {
	
		/**
         * ��ʼ��
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
         * ��ʼ��
         * @method setValidateConfig
		 * @param {Object} config У��������ö���
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
         * У���ֶ�
         * @method validate
		 * @param {String} name У���ֶ�ѡ����
		 * @return {Boolean} valid У����
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
         * ��Ӵ���
         * @method addError
		 * @param {Node} elem �ֶνڵ�
		 * @param {String} content �����İ�
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
         * �Ƴ�����
         * @method removeError
		 * @param {Node} elem �ֶνڵ�
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
         * У���ֶ�
         * @method _validate
		 * @param {String} name У���ֶ�ѡ����
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
			//��Ӹ���У�鹦��
			
			//У���Ƿ�Ϊ��
			if (rules.required) {
				v = this._validateRequired.call(node, value, rules.required);
				if (!v) {
					errors.push(rules.required.error);
				}
				valid = v && valid;
			}
			
			//У�������ʽ
			if (rules.pattern) {
				v = this._validatePattern.call(node, value, rules.pattern);
				if (!v) {
					errors.push(rules.pattern.error);
				}
				valid = v && valid;
			}
			
			//У���Զ��庯��
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
         * У������ֶ�
         * @method _validateRequired
		 * @param {String} value �ֶ�ֵ
		 * @param {Object} config ��ǰ�ֶα���У�����
		 * @return {Boolean} valid
         * @protected
         */
		_validateRequired: function(value, config) {
			var placeholder = config.placeholder;
			return value !== '' && (!placeholder || value !== placeholder);
		},
		
		/**
         * У�������ʽ
         * @method _validatePattern
		 * @param {String} value �ֶ�ֵ
		 * @param {Object} config ��ǰ�ֶ�����У�����
		 * @return {Boolean} valid
         * @protected
         */
		_validatePattern: function(value, config) {
			var exp = new RegExp(config.expression);
			return !exp || exp.test(value);
		},
		
		/**
         * У���Զ������
         * @method _validateCustom
		 * @param {String} value �ֶ�ֵ
		 * @param {Object} config ��ǰ�ֶ��Զ���У�����
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