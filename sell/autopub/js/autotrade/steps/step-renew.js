/**
 * Y.StepRenew
 * @description �������֤��֤����
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-renew', function(Y) {

/**
 * �������֤��֤����
 * @module step-renew
 */   
 
    'use strict';
    
    var RENEW_TEMPLATE = [
        '<div class="step-elem car-id">',
            '<label class="step-elem-label" for="{carid}">���֤����</label>',
            '<div class="step-elem-content">',
                '<input type="text" class="step-elem-text" id="{carid}" />',
            '</div>',
			'<p class="step-elem-error hidden"></p>',
        '</div>'
    ].join(''),
    
    trim = Y.Lang.trim,
	isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false;
    
	/**
     * �������֤��֤���蹹�캯��
     * @class StepRenew
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
	 * @uses StepAjax
	 * @uses StepValidate
     * @constructor
     */
    Y.StepRenew = Y.Base.create('step-renew', Y.Step, [
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
            
            this.get('body').append(Y.Node.create(Y.Lang.sub(RENEW_TEMPLATE, {
                carid: Y.guid()
            })));
            
            this._carid = this.get('body').one('.car-id input');
			
            this._initValidate();
			
            this.addButton('step-btn-continue', '��������', this._onContinueClick);
            this.addButton('step-btn-jump', '��������д�µĳ�����Ϣ', this._onJumpClick);
        },
		
		/**
         * ��ʼ��У�����
         * @method _initValidate
         * @protected
         */
		_initValidate: function() {
			this.setValidateConfig({
				'.car-id input': {
					required: {
						error: '���֤����Ϊ��'
					},
					custom: {
						fn: function(v) {
							var _v = v,
								re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
							
							// daily�����ſ�У��
							if (isDaily) {
								return true;
							}
							
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
						},
						error: '���֤��ʽ����'
					}
				}
			});
		},
        
		/**
         * ����������۰�ť�¼�
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
            this.validate() && this._loadNext(0);
        },
        
		/**
         * ���������ť�¼�
         * @method _onJumpClick
         * @protected
         */
        _onJumpClick: function() {
            this._loadNext(1);
        },
        
		/**
         * ��ȡ�ӿڲ���
         * @method _getIOData
		 * @param {Number} isJump �Ƿ�������
         * @protected
         */
        _getIOData: function(isJump) {
            return {
                orderId: this.data.orderId,
                flowId: this.data.flowId,
                idNo: trim(this._carid.get('value')),
                isJump: isJump
            };
        },
        
		/**
         * ��ȡ��һ������
         * @method _loadNext
		 * @param {Number} isJump �Ƿ�������
         * @protected
         */
        _loadNext: function(isJump) {
            var _this = this,
                d = this._getIOData(isJump);
                
            function handle(data) {
                switch (data.result) {
					
					//ͨ����֤
                    case 'pass':
                        _this._loadNew(data);
                        break;
					
					//���֤����
                    case 'idErr':
                        _this.addError(_this._carid, '���֤��д����');
						Y.StepLoading.hide();
                        break;
					default:
						break;
                }
            }
            
            this.load('/json/auto/confirmRenewal.do', d, handle);
        },
        
		/**
         * ����Ƿ���Ҫ��д������Ϣ
         * @method _loadNew
		 * @param {Object} dt ��������
         * @protected
         */
        _loadNew: function(dt) {
            var _this = this,
                d = {
                    orderId: dt.orderId,
                    flowId: dt.flowId
                };

            function handle(data) {
                switch (data.result) {
                    case 'have':
                        _this.forward('step-info', {
                            data: data
                        });
                        break;
                    case 'not':
                        _this.ajaxSaveInputInfo({
                            orderId: data.orderId,
							flowId: data.flowId
                        });
                    default:
                        break;
                }
            }
            
            this.load('/json/auto/queryInputInfo.do', d, handle);
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
                value: '��ӭ�����ѣ�'
            },
			
			/**
			 * @attribute note
			 * @description �������˵��
			 * @type String
			 */
            note: {
                value: '�������ǵ��Ͽͻ�������д�������֤�ţ����ǽ�Ϊ�����ר�����ۣ�'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate']
});
