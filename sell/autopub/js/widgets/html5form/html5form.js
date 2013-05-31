/**
 * html5form
 */
YUI.add('html5form', function(Y) {
	
	var Lang = Y.Lang,
		YArray = Y.Array;
	
	function HTML5Form() {
		HTML5Form.superclass.constructor.apply(this, arguments);
	}
	
	HTML5Form.NAME = 'html5form';
	
	HTML5Form.ATTRS = {
		/**
		 * ������Ԫ�صĽڵ㣨��Ԫ�ز�һ����form���棩
		 * @attribute srcNode
		 * @type {Node}
		 */
		srcNode: {
			setter: Y.one,
			value: null
		},
		/**
		 * ��
		 * @attribute formNode
		 * @type {Node}
		 */
		formNode: {
			setter: Y.one,
			value: null
		},
		/**
		 * ��Ԫ��
		 * @attribute fieldElems
		 * @type {Node}
		 */
		fieldElems: {
			value: null
		},
		/**
		 * �ύ��ť���ɶ����
		 * @attribute submitNode
		 * @type {NodeList}
		 */
		submitNode: {
			setter: function(v) {
				var r = v;
				if (Lang.isString(v)) {
					r = Y.one(v);
				}
				if (r && !Y.instanceOf(r, Y.NodeList)) {
					r = new Y.NodeList([r]);
				}
				return r;
			},
			value: null
		},
		/**
		 * ȫ�ִ�����ʾTip
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTip: {
			value: null
		},
		/**
		 * ������ʾTip��λ
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTipPos: {
			value: {
				v: 'middle',
				h: 'oright'
			}
		},
		/**
		 * ����ʾ��ÿ����Ԫ�ض�ӵ���Լ��Ĵ�����ʾTip��
		 * @attribute multiErrorTip
		 * @type {Boolean}
		 */
		multiErrorTip: {
			value: true
		},
		/**
		 * �Զ���Ⱦ
		 * @attribute render
		 * @type {Boolean}
		 */
		render: {
			value: false
		}
	};
	
	/**
	 * ��Ԫ�������Ե�set����
	 */
	function DEFAULT_SETTER(val, attr) {
		var node = this._stateProxy;
		node[attr] = val;
		return val;
	};
	
	/**
	 * ��Ԫ�������Ե�get����
	 */
	function DEFAULT_GETTER(attr) {
		var node = this._stateProxy;
		return node[attr];
	};
	
	/**
	 * ���Node������
	 */
	Y.mix(Y.Node.ATTRS, {
		/**
		 * �Զ���У�麯��
		 * @attribute validFn
		 * @type {Function}
		 */
		validFn: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'validFn');
			}
		},
		/**
		 * ��Ԫ��У��ص�����
		 * @attribute afterValidate
		 * @type {Function}
		 */
		afterValidate: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'afterValidate');
			}
		},
		/**
		 * �л�����ǰ�ص�����
		 * @attribute beforeToggleError
		 * @type {Function}
		 */
		beforeToggleError: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'beforeToggleError');
			}
		},
		/**
		 * �л������ص�����
		 * @attribute afterToggleError
		 * @type {Function}
		 */
		afterToggleError: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'afterToggleError');
			}
		},
		/**
		 * ������ʾTip��instance of Y.FormPostip
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTip: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTip');
			}
		},
		/**
		 * �Ƿ�����ʾTip
		 * @attribute hasTip
		 * @type {Boolean}
		 */
		hasTip: {
			setter: DEFAULT_SETTER,
			getter: function() {
				var node = this._stateProxy;
				return node['hasTip'] === false ? false : true;
			}
		},
		/**
		 * ������ʾTip��λ
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTipPos: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTipPos');
			}
		},
		/**
		 * ������ʾģ��
		 * @attribute errorTextTemplate
		 * @type {Object}
		 */
		errorTextTemplate: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTextTemplate');
			}
		},
		/**
		 * ������ʾTip��λԪ��
		 * @attribute tipAlignNode
		 * @type {Node}
		 */
		tipAlignNode: {
			setter: function(val, attr) {
				var node = this._stateProxy;
				node[attr] = Y.one(val) || this;
				return node[attr];
			},
			getter: function() {
				var node = this._stateProxy;
				return node['tipAlignNode'] || this;
			}
		}
	});
	
	/**
	 * �Ƿ�����Ч�ı�Ԫ�أ���button��submit�⣩
	 * Y.Node.isFormElem
	 */
	Y.Node.addMethod('isFormElem', function() {
		var tagName = this.get('tagName').toUpperCase(),
			type = this.getAttribute('type');
			
		return (tagName === 'INPUT' && type !== 'button' && type !== 'submit') || tagName === 'SELECT' || tagName === 'TEXTAREA';
	});
	
	/**
	 * ��ȡȥ�����˿ո��valueֵ
	 * Y.Node.getValue
	 */
	Y.Node.addMethod('getValue', function() {
		if (this.isFormElem()) {
			return Lang.trim(this.get('value'));
		}
		
		return this.get('value');
	});
	
	/**
	 * ������Ϣģ��
	 */
	HTML5Form.ERROR_TEXT_TEMPLATE = '<b class="left"></b><p class="error">{ERROR_TEXT}</p>';
	
	/**
	 * У�����򣨰���type��pattern��
	 */
	HTML5Form.RX = {
		email: /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		url: /((https?|ftp|gopher|telnet|file|notes|ms-help):((\/\/)|(\\\\))+[\w\d:#@%/;$()~_?\+-=\\\.&]*)/i,
		// **TODO: password
		phone: /([\+][0-9]{1,3}([ \.\-])?)?([\(]{1}[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?[0-9]{1,4}?)/,
		number: /^\d+$/,
		money: /^\d+(\.)?(\d+)?$/,
		// Date in ISO format. Credit: bassistance
		dateISO: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
		date: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
		alpha: /[a-zA-Z]+/,
		alphaNumeric: /\w+/,
		integer: /^\d+$/
	};
	
	/**
	 * ������Ϣ
	 */
	HTML5Form.ErrInfo = {
		email:"�ʼ������ʽ����",
		url:"url�����ʽ����",
		required:"�������������",
		money:"��������ȷ�ļ۸�",
		date: "��������ȷ����",
		min:"������Сֵ",
		max:"�������ֵ",
		number:"��������ȷ����",
		integer: '��������ȷ����'
	};
	
	/**
	 * ��ʽ������
	 */
	HTML5Form.Format = {
		/**
		 * date���ڸ�ʽ;�磺2011-11-11
		 * @method date
		 * @param d {Date}
		 * @return {string} ���ڸ�ʽ
		 * @static
		 */
		date: function(d) {
			return d.getFullYear() + '-' + (d.getMonth() < 9 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
		},
		/**
		 * TODO!
		 * week���ڸ�ʽ
		 * @method week
		 * @param d {Date}
		 * @return {string} ���ڸ�ʽ
		 * @static
		 */
		week: function(d) {
			var w = d;
			return w;
		}
	};
	
	/**
	 * У�鷽��
	 */
	HTML5Form.Validator = {
		/**
		 * �����Ƿ�Ϊ��
		 * @method required
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		required: function(el) {
			var hasRequired = el.hasAttribute('required'),
				isPlaceholder = HTML5Form.Validator.isPlaceholder(el),
				v = el.getValue(),
				isValid = hasRequired ? (v !== '' && !isPlaceholder) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('requiredinfo') || HTML5Form.ErrInfo['required'] || '');
				el.setAttribute('errortype', 'required');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ�ƥ������
		 * @method pattern
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		pattern: function(el) {
			var v = el.getValue(),
				_p = el.getAttribute('pattern'),
				//����Ϊ�ַ���
				p = (_p === '' || Lang.isUndefined(_p) || _p === null) ? false : new RegExp("^(?:" + _p + ")$"),
				isValid = (v !== '' && p) ? p.test(v) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('patterninfo') || HTML5Form.ErrInfo[_p] || '');
				el.setAttribute('errortype', 'pattern');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ����type����Ӧ��ʽ
		 * @method type
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		type: function(el) {
			var v = el.getValue(),
				_tp = el.getAttribute('type'),
				tp = HTML5Form.RX[_tp],
				isValid = (v !== '' && tp) ? tp.test(v) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('typeinfo') || HTML5Form.ErrInfo[_tp] || '');
				el.setAttribute('errortype', 'type');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ񳬳����ֵ
		 * @method max
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		max: function(el) {
			var v = el.getValue(),
				type = el.getAttribute('type').toUpperCase(),
				max = parseFloat(el.getAttribute('max')),
				isValid = (v !== '' && (type === 'NUMBER' || type === 'MONEY') && Lang.isNumber(max)) ? (max >= parseFloat(v)) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('maxinfo') || HTML5Form.ErrInfo['max'] || '');
				el.setAttribute('errortype', 'max');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ������Сֵ
		 * @method min
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		min: function(el) {
			var v = el.getValue(),
				type = el.getAttribute('type').toUpperCase(),
				min = parseFloat(el.getAttribute('min')),
				isValid = (v !== '' && type === 'NUMBER' && Lang.isNumber(min)) ? (min <= parseFloat(v)) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('mininfo') || HTML5Form.ErrInfo['min'] || '');
				el.setAttribute('errortype', 'min');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ������Զ���У�麯��
		 * @method validFn
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		validFn: function(el) {
			var v = el.getValue(),
				validFn = el.get('validFn'),
				isValid = (v !== '' && validFn) ? validFn.call(this, el, HTML5Form) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('custominfo') || '');
				el.setAttribute('errortype', 'custom');
			}
			
			return isValid;
		},
		/**
		 * �Ƿ���ռλ��
		 * @method isPlaceholder
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		isPlaceholder: function(el) {
			var v = el.getValue(),
				p = el.getAttribute('placeholder');
			
			return (Lang.isUndefined(p) || p === null || p === '') ? false : v === p;
		},
		/**
		 * �Ƿ��ǺϷ����֤
		 * @method isIDCard
		 * @param el {Node} ��Ԫ��
		 * @return {Boolean}
		 * @static
		 */
		isIDCard: function(el) {
			var v = el.getValue(),
				_v = v,
				re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
			
			if (v.length == 15) {
				v = v.slice(0, 6) + '19' + v.slice(6) + '1';
			}
			if (!v.match(re)) {
				return false;
			}
			
			//���18λ���֤��У�����Ƿ���ȷ
			//У��λ����ISO 7064:1983.MOD 11-2�Ĺ涨���ɣ�X������Ϊ������10
			if (_v.length == 18) {
				var valnum,
					arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
					arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
					nTemp = 0,
					i = 0;
				for (; i < 17; i++) {
					nTemp += v.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if (valnum != v.substr(17, 1).toUpperCase()) {
					return false;
				}
			}
			return true;
		}
	};
	
	Y.extend(HTML5Form, Y.Base, {
		
		/**
		 * ��ʼ��
		 * @method initializer
		 */
		initializer: function() {
            this.publish('beforeSubmit');
            this.publish('afterFormValidate');
            this.publish('beforeFormValidate');
			this.Events = [];
			if (this.get('render')) {
				this.render();
			}
		},
		
		/**
		 * ��Ⱦ
		 * @method render
		 * @return this
		 */
		render: function() {
			var that = this;
			
			that.renderUI();
			that.bindUI();
			that.syncUI();
			
			return this;
		},
		
		/**
		 * ��ȾUI
		 * @method renderUI
		 * @return this
		 */
		renderUI: function() {
			var that = this,
				srcNode = that.get('srcNode');
			
			if (!that.get('formNode')) {
				that.set('formNode', srcNode);
			}
			if (!that.get('submitNode')) {
				that.set('submitNode', srcNode.all('input[type=submit],button[type=submit]'));
			}
			that._detachEvents();
			that._getFieldElems();
			if (!that.get('mutilErrorTip') && !that.get('errorTip')) {
				that.set('errorTip', new Y.FormPostip({
					pos: that.get('errorTipPos'),
					classname: 'yui3-html5form-errortip'
				}));
			}
		
			return this;
		},
		
		/**
		 * ��ȡ����У��ı�Ԫ�أ���һ����ҪУ�飩
		 * @method _getFieldElems
		 * @return fieldElems {Array}
		 * @private
		 */
		_getFieldElems: function() {
			var that = this,
				srcNode = that.get('srcNode'),
				formElems = srcNode.all('input,select,textarea'),
				fieldElems = [];
			
			that.set('fieldElems', fieldElems);
			formElems.each(function(el) {
				var type = el.get('type').toUpperCase();
				if (type !== 'SUBMIT' && type !== 'BUTTON') {
					that.addFieldElem(el);
				}
			});
			
			return fieldElems;
		},
		
		/**
		 * ������Ϊһ��ʱ���ݹ�ִ��һ������
		 * @method _batch
		 * @param {String} method ������
		 * @param el {Array | NodeList} ���
		 * @private
		 */
		_batch: function(method, el) {
			var that = this, 
				bindArg = Array.prototype.slice.call(arguments, 2);
			
			if (Lang.isString(el) || el.nodeType) {
				that[method].apply(that, [Y.one(el)].concat(bindArg));
				return true;
			}
			
			if (Lang.isArray(el)) {
				for (var i = 0, l = el.length; i < l; i++) {
					that[method].apply(that, [Y.one(el[i])].concat(bindArg));
				}
				return true;
			}
			
			if (Y.instanceOf(el, Y.NodeList)) {
				el.each(function(node) {
					that[method].apply(that, [node].concat(bindArg));
				});
				return true;
			}
			
			return false;
		},
		
		/**
		 * �л�ռλ��
		 * @method togglePlaceholder
		 * @param el {Node}
		 * @param force {Boolean} Ĭ��Ϊtrue
		 */
		togglePlaceholder: function(el, force) {
			var that = this;
			if (that._batch('togglePlaceholder', el, force) === true) { return; }
			
			var	v = el.getValue(),
				p = el.getAttribute('placeholder'),
                _force = false;
			
            if (v === '') {
                _force = true;
            }
            if (Lang.isBoolean(force)) {
                _force = force;
            }
            if (_force) {
                that.addPlaceholder(el);
            } else {
                that.removePlaceholder(el);
            }
			
			return this;
		},
        
        addPlaceholder: function(el) {
            var that = this;
			if (that._batch('addPlaceholder', el) === true) { return; }

            var	v = el.getValue(),
				p = el.getAttribute('placeholder');
            
            if (p !== '' && !Lang.isUndefined(p) && p !== null && (v === '' || HTML5Form.Validator.isPlaceholder(el))) {
                el.addClass('yui3-html5form-placeholder');
                el.set('value', p);
            }
            
            return this;
        },
        
        removePlaceholder: function(el) {
            var that = this;
			if (that._batch('removePlaceholder', el) === true) { return; }
            
            var	v = el.getValue(),
				p = el.getAttribute('placeholder');
            
            if (p !== '' && !Lang.isUndefined(p) && p !== null && (v === '' || HTML5Form.Validator.isPlaceholder(el))) {
                el.set('value', '');
                el.removeClass('yui3-html5form-placeholder');
            }
            
            return this;
        },
		
		/**
		 * ���ñ�Ԫ�ص�У���������
		 * @method setElemAttr
		 * @param el {Node}
		 * @param key {String}
		 * @param val
		 */
		setElemAttr: function(el, key, val) {
			var that = this;
			
			if (that._batch('setElemAttr', el, key, val) === true) { return; }
			
			var isCheckbox = el.get('type') === 'checkbox',
				el = isCheckbox ? that._getCheckboxElems(el).item(0) : el;
			
			el.set(key, val);
			
			return this;
		},
		
		/**
		 * ���ñ�Ԫ�صĶ��У���������
		 * @method setElemAttrs
		 * @param el {Node}
		 * @param key {String}
		 * @param val
		 */
		setElemAttrs: function(el, attrs) {
			var that = this;
			
			if (that._batch('setElemAttrs', el, attrs) === true) { return; }
			
			if (attrs && Lang.isObject(attrs)) {
				Y.Object.each(attrs, function(val, key) {
					that.setElemAttr(el, key, val);
				});
			}
			
			return this;
		},
		
		/**
		 * ��ȡ��Ԫ�ص��������
		 * @method getElemAttr
		 * @param el {Node}
		 * @param key {String}
		 * @return val
		 */
		getElemAttr: function(el, key) {
			var that = this;
			
			if (that._batch('getElemAttr', el, key) === true) { return; }
			
			var isCheckbox = el.get('type') === 'checkbox',
				el = isCheckbox ? that._getCheckboxElems(el).item(0) : el;
			
			return el.get(key);
		},
		
		/**
		 * ��ӿ���У��ı�Ԫ�أ���һ����ҪУ�飩
		 * @method addFieldElem
		 * @return el {Node}
		 */
		addFieldElem: function(el) {
			if(!el) return;
			var that = this,
				srcNode = that.get('srcNode'),
				fieldElems = that.get('fieldElems');
			
			if (that._batch('addFieldElem', el) === true) { return; }
			if (el) {
				var t = el.getAttribute('type'),
					isAdded = el.hasAttribute('isAdded');
				
				//if not checkbox or radio
				if (t !== 'checkbox' && t !== 'radio' && t !== 'hidden' && !isAdded) {
					//push element
					fieldElems.push(el);

					el.setAttribute('isAdded', 'isAdded');
					//set placeholder
					that.togglePlaceholder(el, true);
					//init type
					switch (t) {
						case 'date':
							if (Y.Calendar) {
								new Y.Calendar(el.get('id'), {
									popup: true,
									closeable: true
								}).on('select', function(d) {
									el.set('value', HTML5Form.Format.date(d));
									that.validate(el);
									that.toggleError(el);
								});
							}
							break;
						case 'datetime':
							break;
						case 'week':
							break;
						default:
							break;
					}
					//set focus
					if (el.hasAttribute('autofocus')) {
						that.togglePlaceholder(el, false);
						el.focus();
						//fixed focus position IE�¹�����ʾ���ַ���ǰ��
						el.set('value', el.get('value'));
					}
					//bind element event
					that._bindElemEvent(el);
				} else if (t === 'checkbox' && !isAdded) {
					var els = that._getCheckboxElems(el);
					if (els && els.size()) {
						els.setAttribute('isAdded', 'isAdded');
						//push checkbox elements
						fieldElems.push(el);
						that._bindElemEvent(el);
					}
				}
			}
			
			return this;
		},
		/**
		 * �Ƴ�����У��ı�Ԫ��
		 * @method removeFieldElem
		 * @return el {Node}
		 */
        removeFieldElem: function(el, force) {
            var that = this,
			    fieldElems = that.get('fieldElems');
             
			force = force === true ? true : false;
			if (that._batch('removeFieldElem', el, force) === true) { return; }
			if (el && el._node) {
				var i = Y.Array.indexOf(fieldElems, el);
				if (i > -1) {
					fieldElems.splice(i, 1);
					that.set('fieldElems', fieldElems);
					that.removeError(el, force);
					if (force) {
						el.remove(true);
					}
				}
			}
				
			return this;
        },		
		/**
		 * ��ȡϵ�ж�ѡ��Ԫ��
		 * @method _getCheckboxElems
		 * @return el {String | Node}
		 */
		_getCheckboxElems: function(el) {
			var that = this,
				srcNode = that.get('srcNode'),
				name = Lang.isString(el) ? el : el.getAttribute('name'),
				els = new Y.NodeList([el]);
			
			if (name) {
				els = srcNode.all('input[name=' + name + ']');
				if(!els._nodes.length){
					els = Y.all(document.getElementsByName(name));
				}
			}
			
			return els;
		},
		
		/**
		 * ��UI����
		 * @method bindUI
		 * @return this
		 */
		bindUI: function() {
			var that = this,
				fieldElems = that.get('fieldElems');
			
			that.Events = that.Events.concat([
				that.get('submitNode').on('click', Y.bind(that._handleSubmit, that))
			]);
			
			return this;
		},

		/**
		 * ����UI
		 * @method syncUI
		 * @return this
		 */
		syncUI: function() {
			var that = this;
			
			return this;
		},	
		
		/**
		 * �󶨱�Ԫ���¼�
		 * @method _bindElemEvent
		 * @return el {Node}
		 * @private
		 */
		_bindElemEvent: function(el) {
			var that = this;
				tagName = el.get('tagName').toUpperCase(),
				type = el.getAttribute('type');
				
			if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
				if (tagName === 'SELECT') {
					that.Events = that.Events.concat([
						el.on('change', Y.bind(that._handleChange, that))
					]);
				} else {
					that.Events = that.Events.concat([
						el.on('keyup', Y.bind(that._handleKeyup, that))
					]);
				}
				that.Events = that.Events.concat([
					el.on('focus', Y.bind(that._handleFocus, that)),
					el.on('blur', Y.bind(that._handleBlur, that))
				]);
			} else if (type === 'checkbox') {
				that.Events = that.Events.concat([
					that._getCheckboxElems(el).on('click', Y.bind(that._handleClick, that))
				]);
			}
			
			return el;
		},
		
		/**
		 * ��������¼�
		 * @method _detachEvents
		 * @private
		 */
		_detachEvents: function() {
			while (this.Events.length) {
				this.Events.pop().detach();
			}
		},
		
		/**
		 * focus�ص�
		 * @method _handleFocus
		 * @private
		 */
		_handleFocus: function(e) {
			var that = this;
			that.togglePlaceholder(e.target, false);
			//that.toggleError(e.target);
		},
		
		/**
		 * blur�ص�
		 * @method _handleBlur
		 * @private
		 */
		_handleBlur: function(e) {
			var that = this;
			that.validate(e.target);
			that.togglePlaceholder(e.target, true);
			that.toggleError(e.target);
		},
		/**
		 * blur�ص�����ӿ�
		 * @method handleBlur
		 * @public
		 */
		handleBlur: function(node) {
			var that = this;
			that.validate(node);
			that.togglePlaceholder(node, true);
			that.toggleError(node);
		},
		
		/**
		 * keyup�ص�
		 * @method _handleKeyup
		 * @private
		 */
		_handleKeyup: function(e) {
			e.halt();
			if(e.keyCode == 9) return;
		},
		
		/**
		 * change�ص�
		 * @method _handleChange
		 * @private
		 */
		_handleChange: function(e) {
			var that = this;
			that.validate(e.target);
			that.toggleError(e.target);
		},
		
		/**
		 * click�ص� ��ֻ���checkbox��
		 * @method _handleClick
		 * @private
		 */
		_handleClick: function(e) {
			var that = this;
			
			that._validateCheckbox(e.target);
			that.toggleError(that._getCheckboxElems(e.target).item(0));
		},
		
		/**
		 * submit�ص�
		 * @method _handleSubmit
		 * @private
		 */
		_handleSubmit: function(e) {
			var that = this,
				isFormValid = true;
			
			e.halt();
            if (that.fire('beforeFormValidate',e) === false) {return;}
			if (!that.validateForm()) { isFormValid = false; }
            if (that.fire('afterFormValidate', e, isFormValid) === false) { isFormValid = false; }
            if (isFormValid && that.fire('beforeSubmit', e, isFormValid) === false) { return; }
			isFormValid && that.get('formNode').submit();
		},
		
		/**
		 * У��checkbox
		 * @method _validateCheckbox
		 * @param els {String | Node} name����Node
		 * @return isValid {Boolean}
		 * @private
		 */
		_validateCheckbox: function(el) {
			var that = this,
				els = that._getCheckboxElems(el),
				fel = els.item(0),
				afterValidate = el.get('afterValidate'),
				//todo
				//checkbox find different attribute
				isRequired = fel.hasAttribute('isrequired'),
				isValid = false;
				
			if (isRequired) {
				for (var i = 0, l = els.size(); i < l; i++) {
					if (!els.item(i).get('disabled') && els.item(i).get('checked')) {
						isValid = true;
						break;
					}
				}
			} else {
				isValid = true;
			}
			
			if (isValid) {
				fel.removeAttribute('isError');
			} else {
				fel.setAttribute('isError', 'isError');
				fel.setAttribute('errorinfo', fel.getAttribute('requiredinfo') || HTML5Form.ErrInfo['required'] || '');
				fel.setAttribute('errortype', 'required');
			}
			
			afterValidate && afterValidate.call(this, els, isValid);
			
			return isValid;
		},
		
		/**
		 * У���Ԫ�أ���checkbox�⣩
		 * @method validate
		 * @param el {Node}
		 * @return isValid {Boolean}
		 */
		validate: function(el) {
			var that = this;
			if (that._batch('validate', el) === true) { return; }
			
			var	isDisabled = el.get('disabled'),
				Validator = HTML5Form.Validator,
				afterValidate = el.get('afterValidate'),
				isValid = true;
			
			if (el.getAttribute('type') !== 'checkbox') {
			
				if (isDisabled) { return isValid; }
				
				isValid = Validator.required(el) && Validator.type(el) && Validator.max(el) && Validator.min(el) && Validator.pattern(el) && Validator.validFn(el);
			
				if (isValid) {
					el.removeAttribute('isError');
				} else {
					el.setAttribute('isError', 'isError');
				}
				
				afterValidate && afterValidate.call(this, el, isValid);
				
			} else {
				isValid = that._validateCheckbox(el);
			}
		
			return isValid;
		},
		
		/**
		 * У���
		 * @method validateForm
		 * @return isValid {Boolean}
		 */
		validateForm: function() {
			var that = this,
				isValid = true;
				fieldElems = that.get('fieldElems'),
				el = null,
				firstErrorElem = null,
				i = 0,
				l = fieldElems.length
			
			for (; i < l; i++) {
				el = fieldElems[i];
				if (!that.validate(el)) {
					isValid = false;
					if (!firstErrorElem) {
						firstErrorElem = el;
					}
				}
				that.toggleError(el);
			}
			
			if (!isValid) {
				firstErrorElem.focus();
				//fixed focus position IE�¹�����ʾ���ַ���ǰ��
				firstErrorElem.set('value', firstErrorElem.get('value'));
				//that.toggleError(firstErrorElem);
			}
			
			return isValid;
		},
		
		/**
		 * ִ�д������ǰ�ص�
		 * @method _fireBeforeToggleError
		 * @param el {Node}
		 * @private
		 */
		_fireBeforeToggleError: function(el) {
			var that = this;
			if (that._batch('_fireBeforeToggleError', el) === true) { return; }
			
			var beforeToggleError = el.get('beforeToggleError'),
				isValid = !el.hasAttribute('isError');
			if (beforeToggleError) {
				if (el.getAttribute('type') !== 'checkbox') {
					beforeToggleError.call(this, el, isValid);
				} else {
					beforeToggleError.call(this, that._getCheckboxElems(el), isValid);
				}
			}
			
			return this;
		},
		
		/**
		 * ִ�д�������ص�
		 * @method _fireBeforeToggleError
		 * @param el {Node}
		 * @private
		 */
		_fireAfterToggleError: function(el) {
			var that = this;
			if (that._batch('_fireAfterToggleError', el) === true) { return; }
			
			var afterToggleError = el.get('afterToggleError'),
				isValid = !el.hasAttribute('isError');
			if (afterToggleError) {
				if (el.getAttribute('type') !== 'checkbox') {
					afterToggleError.call(this, el, isValid);
				} else {
					afterToggleError.call(this, that._getCheckboxElems(el), isValid);
				}
			}
			
			return this;
		},
		
		/**
		 * �������
		 * @method toggleError
		 * @param el {Node}
		 * @param renderTip {Boolean} �Ƿ���Ⱦ��ʾTip
		 */
		toggleError: function(el, force, renderTip) {
			var that = this;
			if (that._batch('toggleError', el, force, renderTip) === true) { return; }
			
			var	force = force === false ? false : true,
				isValid = force && !el.hasAttribute('isError');
			if (isValid) {
				that.removeError(el, renderTip);
			} else {
				that.addError(el, '', renderTip);
			}
			
			return this;
		},
		
		/**
		 * �Ƴ�����
		 * @method removeError
		 * @param el {Node | Array}
		 * @param renderTip {Boolean} �Ƿ���Ⱦ��ʾTip
		 */
		removeError: function(el, renderTip) {
			var that = this;
			if (that._batch('removeError', el, renderTip) === true) { return; }
			
			that._fireBeforeToggleError(el);
			renderTip = el.get('hasTip') && (renderTip === false ? false : true);
			el.removeClass('yui3-html5form-error');
            el.removeAttribute('isError');
			if (renderTip) {
				that.removeErrorTip(el);
				if (!that.get('multiErrorTip')) {
					that.get('errorTip').hide();
				}
			}
			that._fireAfterToggleError(el);
			
			return this;
		},
		
		/**
		 * �Ƴ��������ʾ
		 * @method removeErrorTip
		 * @param el {Node}
		 */
		removeErrorTip: function(el) {
			var that = this;
			if (that._batch('removeErrorTip', el) === true) { return; }
			
			var errTip = el.get('errorTip');
			//is errtip exist, remove it
			if (errTip) {
				errTip.hide();
				errTip.destroy();
				errTip = null;
				el.set('errorTip', null);
			}
		},
		
		/**
		 * �Ƴ�����
		 * @method renderError
		 * @param el {Node | Array}
		 */
		addError: function(el, content, renderTip) {
			var that = this;
			if (that._batch('addError', el, content, renderTip) === true) { return; }
			
			if (content === false) {
				renderTip = content;
			}
			that._fireBeforeToggleError(el);
			renderTip = el.get('hasTip') && (renderTip === false ? false : true);
            if (el.get('type') !== 'checkbox') {
                el.addClass('yui3-html5form-error');
            }
            el.setAttribute('isError', 'isError');
			if (renderTip) {
				that.addErrorTip(el, content);
			}
			that._fireAfterToggleError(el);
			
			return this;
		},
		
		/**
		 * ��Ⱦ�������ʾ
		 * @method renderErrorTip
		 * @param el {Node}
		 * @param content {String}
		 */
		addErrorTip: function(el, content) {
			var that = this;
			if (that._batch('addErrorTip', el, content) === true) { return; }
			
			var type = el.getAttribute('type'),
				template = el.get('errorTextTemplate') || HTML5Form.ERROR_TEXT_TEMPLATE,
				errInfo = template.replace('{ERROR_TEXT}', content || el.getAttribute('errorinfo') || ''),
				errTip = null;
			
			//if type is hidden, do not show the errtip
			if (type === 'hidden') { return; }
			
			if (that.get('multiErrorTip')) {
				if (!el.get('errorTip')) {
					el.set('errorTip', new Y.FormPostip({
						pos: el.get('errorTipPos') || that.get('errorTipPos'),
						classname: 'yui3-html5form-errortip'
					}));
				}
				errTip = el.get('errorTip');
			} else {
				errTip = that.get('errorTip');
			}
			
			errTip.rendTipUI(el.get('tipAlignNode'), errInfo);
			
			return this;
		},
		
		/**
		 * ��������
		 * @method destructor
		 */
		destructor: function() {
			this._detachEvents();
			this.set('fieldElems', null);
		}
		
	});
	
	Y.HTML5Form = HTML5Form;
	
}, '2.0', {
	requires: ['node', 'base']
});
