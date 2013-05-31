/**
 * Y.StepRandcode
 * @description ��֤�벽��
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-randcode', function(Y) {

/**
 * ��֤�벽��
 * @module step-randcode
 */   
    
    'use strict';
    
    var RANDCODE_TEMPLATE = [
			'<div class="step-elem-randcode {type}-randcode" data-type="{type}">',
				'<div class="step-elem randcode-code">',
					'<label class="step-elem-label" for="{id}">{label}</label>',
					'<div class="step-elem-content">',
						'<input type="text" class="step-elem-text" id="{id}" />',
					'</div>',
					'<p class="step-elem-error hidden"></p>',
				'</div>',
				'<div class="randcode-image ins-g">',
					'<span class="ins-u"><img src="" alt="" /></span>',
					'<a class="ins-u" href="#">��һ��</a>',
				'</div>',
			'</div>'
		].join(''),
		
		isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false,
		rancodeDomain = isDaily ? 'http://stg.pa18.com' : 'http://www.pingan.com';
    
	/**
     * ��֤�벽�蹹�캯��
     * @class StepRandcode
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
	 * @uses StepAjax
	 * @uses StepValidate
     * @constructor
     */
    Y.StepRandcode = Y.Base.create('step-randcode', Y.Step, [
        Y.StepStdMod,
        Y.StepLoad,
        Y.StepAjax,
		Y.StepValidate
    ], {
        
		/**
         * ��Ⱦ�ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������
         * @public
         */
        render: function(container, config) {
            var data = this.data = config.data || {};
            if (data.result == 'bizCheck') {
                this._renderRandcode('��֤��', 'biz');
            } else if (data.result == 'forceCheck') {
                this._renderRandcode('��֤��', 'force');
            } else if (data.result == 'bothCheck') {
                this._renderRandcode('��ҵ����֤��', 'biz');
                this._renderRandcode('��ǿ����֤��', 'force');
            } else {}
            
            this._refreshAllCode();
			this._initValidate();
            
            this.addButton('step-btn-continue', '��������', this._onContinueClick);
        },
		
		/**
         * ��ʼ��У�����
         * @method _initValidate
         * @protected
         */
		_initValidate: function() {
			this.setValidateConfig({
				
				//��ҵ����֤��
				'.biz-randcode input': {
					required: {
						error: '��֤�벻��Ϊ��'
					}
				},
				
				//��ǿ����֤��
				'.force-randcode input': {
					required: {
						error: '��֤�벻��Ϊ��'
					}
				}
			});
		},
        
		/**
         * ��Ⱦ��֤��Ԫ��
         * @method _renderRandcode
		 * @param {String} label �ֶ�����
		 * @param {String} type ��֤������
         * @protected
         */
        _renderRandcode: function(label, type) {
            var id = Y.guid(),
                node = Y.Node.create(Y.Lang.sub(RANDCODE_TEMPLATE, {
                    label: label,
                    type: type,
                    id: id
                }));
            
            this.get('body').append(node);
            node.delegate('click', function(e) {
                e.preventDefault();
                this._refreshCode(node, true);
            }, 'a', this);
        },
        
		/**
         * ˢ����֤��
         * @method _refreshCode
		 * @param {Node} elem ��֤��ڵ�
		 * @param {Boolean} focus �Ƿ��ý���
         * @protected
         */
        _refreshCode: function(elem, focus) {
            var _this = this,
                type = elem.getAttribute('data-type'),
                img = new Image();
            
            img.onload = img.onerror = function() {
                var input = elem.one('input');
                input.set('value', '');
                focus && input.focus();
            };
                
            img.src = rancodeDomain + '/ebusiness/auto/ris/combo-query-circ-image.do?refresh=true&flowid=' + (_this.data.flowId || '') + '&type=' + type + '&t=' + new Date().getTime();
            elem.one('.randcode-image span').setContent(img);
        },
        
		/**
         * ˢ��������֤��
         * @method _refreshAllCode
         * @protected
         */
        _refreshAllCode: function() {
            this.get('body').all('.step-elem-randcode').each(function(item) {
                 this._refreshCode(item);   
            }, this);
        },
        
		/**
         * �󶨵���������۰�ť�¼�
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
		
			if (!this.validate()) { return; }
		
            var _this = this,
                map = {
                    orderId: this.data.orderId,
                    flowId: this.data.flowId
                },
                type,
                value;
            
            this.get('body').all('.step-elem-randcode').each(function(item) {
                 type = item.getAttribute('data-type');
                 value = Y.Lang.trim(item.one('input').get('value'));
                 map[type + 'CheckCode'] = value;   
            }, this);
            
            function handle(data) {
                switch (data.result) {
					
					//��������
                    case 'normal':
                        _this.ajaxSaveInputInfo({
                            flowId: _this.data.flowId,
                            orderId: _this.data.orderId   
                        });
                        break;
					
					//�ܱ�
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//��֤�벻��ȷ
                    case 'wrong':
						if (_this.data.result == 'bothCheck') {
							//������֤��ʱ������������������������汨�۽ӿ�
							_this.ajaxSaveInputInfo({
								flowId: _this.data.flowId,
								orderId: _this.data.orderId   
							});
						} else {
							_this._refreshAllCode();
							_this.addError(_this.get('body').one('.biz-randcode input'), '������������֤��');
							_this.addError(_this.get('body').one('.force-randcode input'), '������������֤��');
							Y.StepLoading.hide();
							//��ʾ��֤�벻��ȷ
						}
                        break;
                }
            }
			
            this.load('/json/auto/checkCode.do', map, handle);
        }
        
    }, {
        
		/**
		 * ���ò���
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
		
			/**
			 * @attribute title
			 * @description �������
			 * @type String
			 */
            title: {
                value: '��������֤��'
            },
			
			/**
			 * @attribute preserved
			 * @description ��ת���Ƿ�������
			 * @type Boolean
			 */
            preserved: {
                value: false
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate']
});
