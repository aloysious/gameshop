/**
 * html5form����֤���<br>
 * ����YUI3-Base<br>
 * Y.Node����html5������
 * @module html5forms
 */
YUI.add('yui3-form',function(Y){
	/**
	 * ��֤�ؼ����������Ƿ���ȷ����.
	 * @method _validate
	 * @param  elNode {Node} node����ӿ�.
	 * @private
	 */
	function _validate(elNode) {
		var isValid = true,
			sTagName = elNode.get('tagName').toUpperCase();
		if (!elNode.get('disabled') && ('INPUT' == sTagName || 'SELECT' == sTagName)){ 
			isValid = _evaluate_attr_required(elNode) &&
					  _evaluate_attr_pattern(elNode) &&
					  _evaluate_attr_max(elNode) &&
					  _evaluate_attr_min(elNode) && 
					  _evaluate_validFn(elNode);
		}
		return isValid;
	}
	/**
	 * ��֤�Ƿ��Ǳ�������ǵ�placeholder����.
	 * @method _evaluate_attr_required
	 * @param  elNode {Node} yui node.
	 * @return {Boolean} ��ȷ��� 
	 * @private
	 */
	function _evaluate_attr_required(elNode) {
		var sPlaceholderText = elNode.get(PLACEHOLDER),
			sValue = elNode.getValue(),
			result = elNode.get(REQUIRED) ? sValue && sValue != sPlaceholderText : true;
		if(!result){
			elNode.set(ERRINFO, ErrInfo['required']);
		}
		return result?true:false;
	}
	/**
	 * ��֤input��type/pattern��������<br>
	 * typeȡRXУ�����,patternȡnew RegExp("^(?:" + pattern + ")$")����У��
	 * @method _evaluate_attr_pattern
	 * @param  elNode {Node} yui node.
	 * @return {Boolean} ��ȷ��� 
	 * @private
	 */
	function _evaluate_attr_pattern(elNode) {
		var cp = elNode.get(PATTERN),
			cpattern = cp?new RegExp("^(?:" + cp + ")$"):false,
			tpattern = RX[elNode.getAttribute('type')],
			value = elNode.getValue(),
			result = true,
			er, 
			rx;
		if (cpattern && value && _isplace(elNode)) {
			result = cpattern.test(value);
			if(!result){elNode.set(ERRINFO, elNode.getAttribute('errinfo'))}
		}else if(tpattern && value && _isplace(elNode)){
			result = tpattern.test(value);
			if(!result){elNode.set(ERRINFO, ErrInfo[elNode.getAttribute('type')])}
		}
		return result;
	}
	/**
	 * ��֤inputԪ��max���Ժ���<br>
	 * �ж������ֵ�Ƿ�������ֵmax 
	 * @method _evaluate_attr_max
	 * @param  elNode {Node} Required. The node instance.
	 * @return {Boolean} Valid?
	 * @private
	 */
	function _evaluate_attr_max(elNode) {
		var ct = elNode.getAttribute('type'),max = elNode.get('max'),result=true,evalue = elNode.get('value');
		if(evalue && _isplace(elNode) && elNode.get('max') && (ct == 'number' || ct == 'money' || ct == 'integer')){
			result = parseFloat(max) > parseFloat(elNode.get('value'));
		}
		if(!result){elNode.set(ERRINFO, ErrInfo['max'])}
		return result;
	}
	/**
	 * ��֤inputԪ��min���Ժ���<br>
	 * �ж������ֵ�Ƿ�С����Сֵmin 
	 * @method _evaluate_attr_max
	 * @param  elNode {Node} Required. The node instance.
	 * @return {Boolean} Valid?
	 * @private
	 */
	function _evaluate_attr_min(elNode) {
		var ct = elNode.getAttribute('type'),min = elNode.get('min'),result=true;
		if(elNode.get('value') && _isplace(elNode) && elNode.get('min') && (ct == 'number' || ct == 'money' || ct == 'integer')){
			result = parseFloat(min) <= parseFloat(elNode.get('value'));
		}
		if(!result){elNode.set(ERRINFO, ErrInfo['min'])}
		return result;
	}
	/**
	 * �Զ���У�麯��
	 * У��Ԫ���Ƿ�ͨ���Զ����У�麯��
	 * @method _evaluate_validFn
	 * @param  elNode {Node} Required. The node instance.
	 * @return {Boolean} Valid?
	 * @private
	 */
	function _evaluate_validFn(elNode) {
		var validFn = elNode.validFn || elNode.get('validFn');
			result = true;
		if (validFn && validFn.call(this, elNode) === false) {
			result = false;
		}
		if(!result){elNode.set(ERRINFO, elNode.getAttribute('errinfo'))}
		return result;
	}
	/**
	 * Handles the fetching of an attribute's value from the DOM node.
	 * @method _getter
	 * @param  elNode {Node} Required. The node instance.
	 * @param  sAttr {String} Required. The attribute name.
	 * @return {String} The attribute value.
	 * @private
	 */
	function _getter(elNode, sAttr) {
		return elNode[sAttr] || elNode.getAttribute(sAttr);
	}
	/**
	 * �ж��Ƿ����placeholder���Բ�valueֵ��Ч.
	 * @method _isplace
	 * @param  elNode {Node} Required. The node instance.
	 * @return {bool} ����ֵ
	 * @private
	 */
	function _isplace(elNode) {
		var sPlaceholderText = elNode.get(PLACEHOLDER);
		if(sPlaceholderText){
			return sPlaceholderText != elNode.get('value')
		}
		return true;
	}
	
	/**
	 * Handles the setting of an attribute's value for a DOM node.
	 * @method _setter
	 * @param  elNode {Node} Required. The node instance.
	 * @param  sAttr {String} Required. The attribute name.
	 * @param  val {String} Required. The new attribute value.
	 * @private
	 */
	function _setter(elNode, sAttr, val) {
		elNode[sAttr] = val;
		elNode.setAttribute(sAttr, val);
	}
	
	/**
	 * Handles the fetching of an attribute's existence from the DOM node.
	 * @method _has
	 * @param  elNode {Node} Required. The node instance.
	 * @param  sAttr {String} Required. The attribute name.
	 * @return {Boolean} The attribute exists.
	 * @private
	 */
	function _has(elNode, sAttr) {
		try{
			return elNode.hasAttribute(sAttr);
		} catch(e){//ie67
			return (elNode.getAttribute(sAttr) != null) ? true : false;
		}
	}
	/**
	 * date���ڸ�ʽ;�磺2011-11-11
	 * @method _formatDate
	 * @return {string} ���ڸ�ʽ
	 * @private
	 */
	function _formatDate(d) {
		return d.getFullYear() + '-' + (d.getMonth() < 9 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
	}
	/**
	 * week���ڸ�ʽ;�磺2011-11-11
	 * @method _formatWeek
	 * @return {string} ���ڸ�ʽ
	 * @private
	 */
	function _formatWeek(d) {
		return d.getFullYear() + '-' + (d.getMonth() < 9 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
	}
	/**
	 * ԭ������getValue������ȥ����β�ո� 
	 * @method getValue
	 * @return {string} ����value.
	 * @private
	 */
	Y.Node.prototype.getValue = function() {
		return Lang.trim(this.get('value'));
	};
	/**
	 * һЩ�����Ŀ�ݶ��� 
	 */
	var AFTER_VALIDATION_FUNC = 'aftervalidate',
	ERRTIP = 'errtip',
	AUTOFOCUS = 'autofocus',
	BOUNDING_BOX = 'boundingBox',
	CLS_VALID = 'valid',
	MAX = 'max',
	MIN = 'min',
	PATTERN = 'pattern',
	PLACEHOLDER = 'placeholder',
	REQUIRED = 'required',
	STEP = 'step',
	ERRINFO = 'derrinfo',
	BLUR = true,
	PLACEHOLDERCLASS = 'place',
	// regular expressions to support input types
	RX = {
		email: /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		url: /((https?|ftp|gopher|telnet|file|notes|ms-help):((\/\/)|(\\\\))+[\w\d:#@%/;$()~_?\+-=\\\.&]*)/i,
		// **TODO: password
		phone: /([\+][0-9]{1,3}([ \.\-])?)?([\(]{1}[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?[0-9]{1,4}?)/,
		number: /-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?/,
		money: /-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?/,
		// Date in ISO format. Credit: bassistance
		dateISO: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
		alpha: /[a-zA-Z]+/,
		alphaNumeric: /\w+/,
		integer: /^\d+$/
	},
	ErrInfo = {
		email:"�ʼ������ʽ����",
		url:"url�����ʽ����",
		required:"�������������",
		money:"��������ȷ�ļ۸�",
		min:"������Сֵ",
		max:"�������ֵ",
		number:"��������ȷ����",
		integer: '��������ȷ����'
	}
	Lang = Y.Lang,
	yui3_form_support = Y.Base.create('form_input_attrs', Y.Widget, [], {

		/**
		 * ����inputԪ�ؽ����Ƴ�ʱ�Ļص�����.
		 * @method _handleBlur
		 * @param e {Event} Required. The javascript `blur` or `keydown` event.
		 * @protected
		 */
		_handleBlur: function(e) {
			var elNode = e.target,
				sPlaceholderText = elNode.get(PLACEHOLDER),
				value = elNode.getValue();
		
			if (sPlaceholderText && value == "") {
				elNode.set('value', sPlaceholderText);
				elNode.addClass(PLACEHOLDERCLASS);
			}
			if(this._errors.indexOf(e.target) == -1){
				BLUR = false;
			}
			this._evaluate_errors_tip(e.target,false);
		},
		
		/**
		 * ����inputԪ�ؼ�������ʱ�Ļص�����.
		 * @method _handleKeyup
		 * @param e {Event} Required. The javascript `blur` or `keydown` event.
		 * @protected
		 */
		_handleKeyup: function(e) {
			e.halt();
			if(e.keyCode == 9) return;
			//this._evaluate_errors_tip(e.target,true);
		},

		/**
		 * ����selectԪ�ص��ʱ�Ļص�����.
		 * @method _handleSelect
		 * @param e {Event} Required. The javascript `blur` or `keydown` event.
		 * @protected
		 */
		_handleSelect: function(e) {
			e.halt();
			this._evaluate_errors_tip(e.target,false);
			BLUR = false;
		},
		/**
		 * ����inputԪ�ػ�ȡ����ʱ�Ļص�����.
		 * @method _handleFocus
		 * @param e {Event} Required. The javascript `blur` or `keydown` event.
		 * @protected
		 */
		_handleFocus: function(e) {
			var elNode = e.target,
				sPlaceholderText = elNode.get(PLACEHOLDER),
				value = elNode.getValue();
		
			if (value == sPlaceholderText) {
				elNode.set('value', '');
			}
			elNode.removeClass(PLACEHOLDERCLASS);
			if(this._errors.indexOf(elNode)!=-1){
				this._evaluate_errors_tip(elNode,false);
			}
		},
		
		/**
		 * ��������bodyҳ����ʱ��ί�лص�����<br/>.
		 * ��Ҫʵ��Ŀ���ǿ���������ʧ
		 * @method _handleDoc
		 * @param e {Event} Required. The javascript `blur` or `keydown` event.
		 * @protected
		 */
		_handleDoc: function(e) {
			var nodeName = e.target.get('nodeName').toLowerCase();
			if(BLUR && nodeName !== 'input' && nodeName != 'button' && nodeName != 'textarea'){
				//this._errtip.hide();
			};
			BLUR = true;
		},

		/**
		 * ���Ʊ��ύ�¼�����; 
		 * @method _handleSubmit
		 * @param e {Event} Required. The javascript `submit` event.
		 * @protected
		 */
		_handleSubmit: function(e) {
			e.halt();
			var that = this;
			var submitfx = this.get('submitfx');
			that._errors._nodes = [];
			that._fields.each(function(node) {
				if(!_validate(node)){
					that._errors._nodes.push(node._node);
				};
			});

			that._errors.each(function(node){
				if(that._errors.indexOf(node) == 0){
					node.focus();
				}
				that._evaluate_errors_tip(node, false);
				node.addClass('err');
			});
			if(that._aftervalidate() && !that._errors._nodes.length){
				if (submitfx) {
					submitfx.call(e.target, e, this);
				}
				that._form.submit();
			}
		},
		
		/**
		 * ���������¼����� 
		 * @method bindUI
		 * @protected
		 */
		bindUI: function() {
			var that = this,
				elBb = that.get(BOUNDING_BOX);

			that._fields.each(function(elNode) {
				var sPlaceholderText = elNode.get(PLACEHOLDER),
					sValue = elNode.get('value'),
					stype = elNode.getAttribute('type');
				// if there is no default value, then setup placeholder
				if (sValue == '' && sPlaceholderText) {
					elNode.addClass(PLACEHOLDERCLASS);
					elNode.set('value',sPlaceholderText);
				}

				// handle autofocus;
				if (elNode.get(AUTOFOCUS)) {
					elNode.focus(); 
				}	
				switch(stype){
					case 'date':
						new Y.Calendar(elNode.get('id'), {
							popup: true,
							closeable: true
						}).on('select',function(d) {
							elNode.set('value', _formatDate(d));
						});	
						break;
					case 'datetime':
						break;
					case 'week':
						break;
				}
				switch(elNode.get('nodeName').toLowerCase()){
					case 'input':
						elNode.on('focus', Y.bind(that._handleFocus, that));
						//handlendle keyup
						elNode.on('keyup', Y.bind(that._handleKeyup, that));				
						//handle blur
						elNode.on('blur', Y.bind(that._handleBlur, that));
						break;
					case 'select':
						elNode.on('change', Y.bind(that._handleSelect, that));
						break;
				}
			});
			//bandle submit
			that._btnsubmit.on('click', Y.bind(that._handleSubmit, that));
			//bandle doc 
			//Y.on('click',Y.bind(that._handleDoc, that),document);
		},

		/**
		 * ������֤����������ʵ�� 
		 * @method _evaluate_errors_tip
		 * @param node {node} �ڵ�.
		 * @param filerr {boolen} �Ƿ���˴�����ʾ.		 
		 * @protected
		 */		
		_evaluate_errors_tip:function(node,filerr){
			var isErr = _validate(node),
				isInErors = (this._errors.indexOf(node) == -1) ? false : true,
				beforeRenderErr = node.beforeRenderErr || function() { return true; };
			if(!filerr && !isErr && isInErors){//�Ѿ����ڼ�¼�Ĵ���
				node.addClass('err');//���ڶ��Ԫ��ʹ��ͬһ��tip,���޸Ĵ���״̬����ʾ��ʾ�����
				if (beforeRenderErr.call(this, node, true) === false) { return; }
				this._renderTipUI(node);
			}else if(!filerr && !isErr){//δ��¼�Ĵ���
				this._errors._nodes.push(node._node);
				node.addClass('err');
				if (beforeRenderErr.call(this, node, true) === false) { return; }
				this._renderTipUI(node);
			}else if(isInErors){//��֤��ȷ,�����¼
				this._errors._nodes[this._errors.indexOf(node)] = null;
				node.removeClass('err');
				if (beforeRenderErr.call(this, node, false) === false) { return; }
				node.errtip && node.errtip.hide();
			}else{//ͨ����֤
				node.removeClass('err');
				if (beforeRenderErr.call(this, node, false) === false) { return; }
				node.errtip && node.errtip.hide();
			}
			
		},
		_renderTipUI:function(errnode){
			if (!errnode.errtip) {
				errnode.errtip = new Y.FormPostip({pos:{v:'middle',h:'oright'},classname:'msg'});
			}
			errnode.errtip.rendTipUI(errnode.alignNode || errnode,'<b class="left"></b><p class="error">'+ errnode.get(ERRINFO) + "</p>");
			errnode.addClass('err');
		},
		initializer: function() {
			var that = this;
			that._aftervalidate = that.get(AFTER_VALIDATION_FUNC),
			elBb = that.get(BOUNDING_BOX);
			that._btnsubmit = elBb.one(that.get('submitbtn'));
			that._form = 'FORM' == elBb.get('tagName').toUpperCase() ? elBb : null;
			that._fields = new Y.NodeList([]);
			that._errors = new Y.NodeList([]);	
			elBb.all('input,textarea,select').each(function(node){
				var curtype = node.get('type');
				if(curtype != 'submit' && curtype != 'button'){
					that._fields._nodes.push(node._node);
				}
			});
			//error tip
			/*that._errtip = that.get(ERRTIP);
			if (!that._errtip) {
				that._errtip = new Y.FormPostip({pos:{v:'30',h:'0'},classname:'tip'});
				that.set(ERRTIP, that._errtip);
			}*/
			//that._fields._nodes = that._fields._nodes.concat(elBb.all('textarea')._nodes);					
		},
		renderUI: function() {

		}
	},
	{
		ATTRS: {

			/**
			 * A callback function to execute after field evaluation.
			 * @property aftervalidate
			 * @type Function
			 * @return {boolen} Custom validation,default true
			 */
			aftervalidate: {
				validator: Lang.isFunction,
				value: function(){return true}
			},

			/**
			 * The CSS rule to find the submit button for your form. When defined, will automatically disable the button.
			 * @property submitbtn
			 * @type String
			 */
			submitbtn: {
				value: 'button[type=submit]',
				validator: Lang.isString
			},

			/**
			 * A callback function to execute in place of normal form submission; passed the event and a reference to `this`; execution context is the form.
			 * @property submitfx
			 * @type Function
			 */
			submitfx: {
				validator: Lang.isFunction,
				value: null
			},
			/**
			 * A callback function to execute after field evaluation.
			 * @property errtip
			 * @type Function
			 */
			errtip: {
				validator: Lang.isObject,
				value: null
			}			
			
		}
	});

	/**
	 * ����html5������,���洢������Ϣ����derrinfo 
	 * @private
	 */
	Y.mix(Y.Node.ATTRS, {
		autofocus: {
			getter: function() {
				return _has(this._node,AUTOFOCUS);
			},
			setter: function(val) {
				return _setter(this._node,AUTOFOCUS,val);
			},
			validator: Lang.isBoolean
		},
		max: {
			getter: function() {
				return _getter(this._node,MAX);
			},
			setter: function(val) {
				return _setter(this._node,MAX,val);
			},
			validator: Lang.isNumber
		},
		min: {
			getter: function() {
				return _getter(this._node,MIN);
			},
			setter: function(val) {
				return _setter(this._node,MIN,val);
			},
			validator: Lang.isNumber
		},
		pattern: {
			getter: function() {
				return _getter(this._node,PATTERN);
			},
			setter: function(val) {
				return _setter(this._node,PATTERN,val);
			},
			validator: Lang.isString
		},
		derrinfo: {
			getter: function() {
				return _getter(this._node,ERRINFO);
			},
			setter: function(val) {
				return _setter(this._node,ERRINFO,val);
			},
			validator: Lang.isString
		},		
		placeholder: {
			getter: function() {
				return _getter(this._node,PLACEHOLDER);
			},
			setter: function(val) {
				return _setter(this._node,PLACEHOLDER,val);
			},
			validator: Lang.isString
		},
		required: {
			getter: function() {
				return _has(this._node,REQUIRED);
			},
			setter: function(val) {
				return _setter(this._node,REQUIRED,val);
			},
			validator: Lang.isBoolean
		},
		step: {
			getter: function() {
				return _getter(this._node,STEP);
			},
			setter: function(val) {
				return _setter(this._node,STEP,val);
			},
			validator: Lang.isNumber
		}
	});
	
	Y.YUI3FormSupport = yui3_form_support;
	
	/**
	 * ��֤�ؼ��������֤���Ƿ���ȷ.
	 * @method Y.idCard 
	 * @param  elNode {Node} node����ӿ�.
	 * @public
	 */
	Y.YUI3FormSupport.isIDCard = function(node){//���֤��
		var v = node.getValue(),
			_v = v,
			arrSplit = true,
			re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
			
		if (v.length == 15) {
			v = v.slice(0, 6) + '19' + v.slice(6) + '1';
		}
		arrSplit = v.match(re);
		if (!arrSplit) {
			return false;
		}
		
		//���18λ���֤��У�����Ƿ���ȷ
		//У��λ����ISO 7064:1983.MOD 11-2�Ĺ涨���ɣ�X������Ϊ������10
		if(_v.length == 18){
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
	};
	
},'3.3.0',{
	requires:['form-postip']	
});
