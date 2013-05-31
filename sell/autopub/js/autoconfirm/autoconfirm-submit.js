/**
 * Y.AutoConfirmSubmit
 * @description ���սӿڻ�ȷ��ҳ��У�鼰��������
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-submit', function(Y) {
 
/**
 * ȷ��ҳ�߼�
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * ȷ��ҳ��У�鼰��������
 * @module autoconfirm
 * @submodule autoconfirm-submit
 */
    
    'use strict';
    
    //��Ϣ��ɹ��������ݽṹ   
    var MSG_BD = '<div class="submitbox-msg"><div>{content}</div></div>',
		SUCCESS_BD = '<div class="submitbox-success">{content}</div>',
        
        //����״̬�İ�ťβ���ṹ
        MSG_FOOTER = '<div class="clearfix submitbox-btns"><button class="submitbox-closebtn" type="button" title="�ر�"></button></div>',
        SUCCESS_FOOTER = '<div class="clearfix submitbox-btns"><a href="/auto/quote.html?tmpOrderId=' + window['tmpOrderId'] + '" class="submitbox-back">���ر���ҳ��</a><button class="submitbox-agree" type="button" title="ͬ�⣬�ύ��">ͬ�⣬�ύ��</button></div>',
        RANDCODE_FOOTER = '<div class="clearfix submitbox-btns"><button class="submitbox-continue" type="button" title="�����ύ">�����ύ</button></div>',
        
        //�ɹ�����֤��ṹ
		SUCCESS_TEMPLATE = '<h3 class="success-title">{title}</h3><div class="success-content">{content}</div>',
        RANDCODE_TEMPLATE = [
            '<div class="submitbox-randcode">',
                '<div class="randcode-code ins-g">',
                    '<label class="randcode-label ins-u" for="randcode-text">��֤��</label>',
                    '<div class="randcode-content ins-u">',
                        '<input type="text" class="randcode-text" id="randcode-text" />',
                    '</div>',
                    '<p class="randcode-error ins-u hidden"></p>',
                '</div>',
                '<div class="randcode-image ins-g">',
                    '<span class="ins-u"><img src="" alt="" /></span>',
                    '<a class="ins-u" href="#">��һ��</a>',
                '</div>',
            '</div>'
        ].join(''),
        
        Lang = Y.Lang,
        isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false,
		rancodeDomain = isDaily ? 'http://stg.pa18.com' : 'http://www.pingan.com';
    
    /**
     * ��У�鼰���������캯��
     * @class AutoConfirmSubmit
     * @constructor
     */
    function AutoConfirmSubmit() {
        
        /**
         * �˱����Դ���
         * @property count
         * @type Number
         * @default 0
         */
        this.count = 0;
    }
    
    Y.mix(AutoConfirmSubmit, {
        
        /**
         * ��ʼ��
         * @method initializer
         * @public
         */ 
        initializer: function() {
            this.publish('confirmBefore');
            Y.after(this._renderSubmit, this, 'render');
        },
        
        /**
         * ��ʼ��У�麯������Ⱦ����
         * @method _renderSubmit
         * @protected
         */ 
        _renderSubmit: function() {
            Y.CheckForm('J_atc_form', this._afterValidate, this);
            this._bindConfirmBefore();
            this._renderSubmitBox();
        },
        
        /**
         * �ύ������
         * @method _submitData
         * @param {EventFacade} e �¼�����
         * @protected
         */        
        _submitData: function(e) {
            var _this = this,
                timeStamp = new Date().getTime();
            
			//unloadʱ�������ݿ��ܱ�ҳ��ر���ֹ���������ύ��ʱ��������
			this._saveStorageData();
			
			//�����ύʱ���������
			this._submitBox.set('bodyContent', '');
			this._submitBox.set('footerContent', '');
            this._submitBox.show();
            Y.AutoConfirmLoading.show();
            
			Y.io('/json/auto/needConfirmBeforeCreateOrder.html?_input_charset=UTF-8&tmpOrderId=' + window['tmpOrderId'], {
                method: 'GET',
                data: 't=' + timeStamp,
                on: {
                    complete: function(id, r) {
                        var res;
                        try {
                            res = Y.JSON.parse(r.responseText);
                        } catch (err) {}
                        if (res) {
                            
                            //ȷ��Ͷ��
                            _this.fire('confirmBefore', {
                                data: res    
                            });
                        }
                    }
                },
                form: {
                    id: 'J_atc_form'
                }
            });
        },
        
        /**
         * ��У����ȷ�ص�
         * @method _afterValidate
         * @protected
         */ 
        _afterValidate: function() {
            this._submitData();
        },
		
		/**
         * ������ʾ������Ϣ
         * @method _showMsgContent
         * @protected
         */ 
		_showMsgContent: function(msg) {
			var content = Y.Lang.sub(MSG_BD, {
				content: msg || ''
			});
			this._submitBox.set('bodyContent', content);
            this._submitBox.set('footerContent', MSG_FOOTER);
            Y.AutoConfirmLoading.hide();
		},
		
		/**
         * �����ύ�ɹ�����ʾ�����İ����������ѱ仯����ҵ���ر�Լ������ǿ���ر�Լ����
         * @method _showSuccessContent
         * @param {Object} data �����İ�����
         * @protected
         */ 
		_showSuccessContent: function(data) {
			var content = Y.Lang.sub(SUCCESS_BD, {
				content: this._getSuccessContent(data || {})
			});
			this._submitBox.set('bodyContent', content);
            this._submitBox.set('footerContent', SUCCESS_FOOTER);
		},
        
        /**
         * ��ȡ�ɹ��İ�
         * @method _getSuccessContent
         * @param {Object} data �����İ�����
         * @protected
         */
        _getSuccessContent: function(data) {
            var list = [
                    ['premiumChangeNotice', '���ѱ仯'],
                    ['bizPromise', '��ҵ���ر�Լ��'],
                    ['forcePromise', '��ǿ���ر�Լ��'],
                    ['checkVehicle', '�鳵��ʾ']
                ],
                content = '';
            
            Y.Array.each(list, function(item) {
                if (data[item[0]]) {
                    content += Y.Lang.sub(SUCCESS_TEMPLATE, {
                        title: item[1],
                        content: data[item[0]]
                    });
                }
            });
            
            return content;
        },
        
        /**
         * ��ʾ��֤������
         * @method _showRandcodeContent
         * @param {Object} data ����ID����
         * @protected
         */
        _showRandcodeContent: function(data) {
            var content = RANDCODE_TEMPLATE;
            this._flowId = data.flowId;
            this._orderId = data.orderId;
            this._submitBox.set('bodyContent', content);
            this._submitBox.set('footerContent', RANDCODE_FOOTER);
            this._refreshCode();
        },
        
        /**
         * ��ȷ��Ͷ�������¼�
         * @method _bindConfirmBefore
         * @protected
         */
        _bindConfirmBefore: function() {
            this.on('confirmBefore', function(e) {
                var data = e.data;
                Y.AutoConfirmLoading.hide();
                switch (data.result) {
                    
                    //�ܱ������
                    case 'refuse':
                    case 'error':
						this._showMsgContent(data.msg);
                        break;
                    
                    //�ɹ�
                    case 'success':
						this._showSuccessContent(data.data);
                        break;
                    
                    //��Ҫ��д��֤��
                    case 'checkcode':
                        this._showRandcodeContent(data || {});
                        break;
                }
            });
        },
        
        /**
         * ��Ⱦ����
         * @method _renderSubmitBox
         * @protected
         */
        _renderSubmitBox: function() {
            var IE6 = (Y.UA.ie == 6),
                mask = Y.Node.create('<div class="submitbox-mask hidden"></div>'),
                shim = Y.Node.create('<iframe class="submitbox-shim hidden" frameborder="0" src="javascript:false" title="Submit Stacking Shim" tabindex="-1" role="presentation"></iframe>'),
                close = Y.Node.create('<a href="#" class="submitbox-close" title="�ر�"></a>'),
                submitBox = new Y.Overlay({
					width: '653px',
                    headerContent: '<h2>�й�ƽ�����չ�˾</h2>',
                    bodyContent: '',
                    footerContent: '',
                    zIndex: 200000,
                    centered: true,
                    visible: false,
					render: true
                });
			
			//����IE6�����ֺ�iframe�Ĵ�С
            function sizeMask(visible) {
                if (visible && IE6) {
                    var w = Y.DOM.docWidth() + 'px',
                        h = Y.DOM.docHeight() + 'px';
                        
                    mask.setStyles({
                        width: w,
                        height: h
                    });
                    shim.setStyles({
                        width: w,
                        height: h
                    });
                }
            }
            
            mask.setStyles({
                opacity: 0.6,
                zIndex: 200000
            });
            
            shim.setStyle('zIndex', 200000);
			shim.setStyle('opacity', 0);
            
            submitBox.get('contentBox').append(close);
            submitBox.get('boundingBox').addClass('submitbox');
            IE6 && submitBox.get('boundingBox').insert(shim, 'before');
            submitBox.get('boundingBox').insert(mask, 'before');
            
            submitBox.after('visibleChange', function(e) {
                sizeMask(e.newVal);
                mask.toggleClass('hidden', !e.newVal);
                IE6 && shim.toggleClass('hidden', !e.newVal);
                if (e.newVal && this.get('boundingBox').getY() < 0) {
                    this.get('boundingBox').setY(0);
                }
            });
            
            close.on('click', function(e) {
                e.preventDefault(); 
                submitBox.hide();
                if (submitBox.get('contentBox').one('.submitbox-success')) {
                    window.location.reload();
                }
            });
            
            submitBox.get('contentBox').delegate('click', function(e) {
                e.halt(true);
                submitBox.hide();
            }, '.submitbox-closebtn', this);
            
            submitBox.get('contentBox').delegate('click', function(e) {
                e.halt(true);
                Y.AutoConfirmLoading.show('����Ϊ����������...');
                this._createOrder();
            }, '.submitbox-agree', this);
            
            Y.AutoConfirmLoading.render(submitBox.get('boundingBox'));
            
            this._submitBox = submitBox;
            this._submitBoxMask = mask;
            
            this._bindRandcode();
        },
        
        /**
         * ����֤���¼�
         * @method _bindRandcode
         * @protected
         */
        _bindRandcode: function() {
            var cb = this._submitBox.get('contentBox');
            
            cb.delegate('click', function(e) {
                e.halt();
                if (this._validateRandcode()) {
                    this._submitRandcode();
                }
            }, '.submitbox-continue', this);
            
            cb.delegate('click', function(e) {
                e.halt();
                this._refreshCode();
            }, '.randcode-image a', this);
            
            cb.delegate('blur', function(e) {
                this._validateRandcode();
            }, '.randcode-text', this);
            
            cb.delegate('focus', function(e) {
                this._toggleRandcodeError(true);
            }, '.randcode-text', this);
        },
        
        /**
         * ˢ����֤��
         * @method _refreshCode
         * @protected
         */
        _refreshCode: function() {
            var cb = this._submitBox.get('contentBox'),
                img = new Image();
            
            img.onload = img.onerror = function() {
                var input = cb.one('.randcode-text');
                input.set('value', '');
                input.focus();
            };
                
            img.src = rancodeDomain + '/ebusiness/auto/ris/combo-query-circ-image.do?refresh=true&step=confirm&type=biz&t=' + new Date().getTime();
            cb.one('.randcode-image span').setContent(img);
        },
        
        /**
         * У����֤���Ƿ�Ϊ��
         * @method _validateRandcode
         * @protected
         */
        _validateRandcode: function() {
            var cb = this._submitBox.get('contentBox'),
                txt = cb.one('.randcode-text'),
                val = Y.Lang.trim(txt.get('value')),
                valid = !!val;
            
            if (valid) {
                this._toggleRandcodeError(true);
            } else {
                this._toggleRandcodeError(false, '��֤�벻��Ϊ��');
            }
            
            return valid;
        },
        
        /**
         * �л���֤�����
         * @method _toggleRandcodeError
         * @param {Boolean} show ��ʾ������
         * @param {String} content �����İ�
         * @protected
         */
        _toggleRandcodeError: function(show, content) {
             var cb = this._submitBox.get('contentBox'),
                 err = cb.one('.randcode-error');
             
             err.setContent(content || '');
             err.toggleClass('hidden', show);
        },
        
        /**
         * �ύ��֤��
         * @method _submitRandcode
         * @protected
         */
        _submitRandcode: function() {
            var _this = this;
            
            Y.AutoConfirmLoading.show('����Ϊ���ύ��Ϣ��...');
            
            function handle(data) {
                switch (data.result) {
                    
                    //����
                    case 'normal':
                        _this._submitData();
                        break;
                    
                    //�ܱ�
                    case 'refuse':
                        _this._showMsgContent(data.promptMsg);
                        Y.AutoConfirmLoading.hide();
                        break;
                    
                    //��֤�����
                    case 'wrong':
                        _this._refreshCode();
                        _this._toggleRandcodeError(false, '������������֤��');
                        Y.AutoConfirmLoading.hide();
                        break;
                }
            }
            
            this.load('/json/auto/checkCode.do', {
                flowId: this._flowId,
                orderId: this._orderId
            }, handle);
        },
        
        /**
         * ��ת��
         * @method _goToUrl
         * @param {String} url ��ת��ַ
         * @param {Number} delay �ӳ�ʱ��
         * @protected
         */
        _goToUrl: function(url, delay) {
            Y.later(delay || 3000, this, function() {
                location.href = url || (isDaily ? 'http://trade.daily.taobao.net/trade/itemlist/list_bought_items.htm' : 'http://trade.taobao.com/trade/itemlist/list_bought_items.htm');
            });
        },
        
        /**
         * ��������
         * @method _createOrder
         * @protected
         */
        _createOrder: function() {
            var _this = this,
                timeStamp = new Date().getTime();
                
            Y.io('/json/auto/createOrder.html?tmpOrderId=' + window['tmpOrderId'], {
                method: 'GET',
                data: 't=' + timeStamp,
                on: {
                    complete: function(id, r) {
                        var res;
                        
                        try {
                            res = Y.JSON.parse(r.responseText);
                        } catch (err) {}
                        
                        if (res && res.result == 'success') {
                            _this._getCalcState();
                        } else {
                            Y.AutoConfirmLoading.hide();
							_this._showMsgContent(res && res.msg || '��������ʧ��');
                        }
                    }
                }
            });
        },
        
        /**
         * ��ѯ�˱�״̬
         * @method _getCalcState
         * @protected
         */
        _getCalcState: function() {
            var _this = this,
                timeStamp = +new Date(),
                tmpOrderId = window['tmpOrderId'] || '',
                bizOrderId = window['bizOrderId'] || '',
                bizOrderIdArr = [],
                d;
            
            _this.count++;
            
            Y.AutoConfirmLoading.show('����Ϊ����ѯ�˱�״̬...');
            
            Y.io('/json/check_status.html', {
                method: 'POST',
                data: (bizOrderId ? ('biz_order_id=' + bizOrderId) : ('tmp_order_id=' + tmpOrderId)) + '&t=' + timeStamp,
                on: {
                    complete: function(id, r) {
                        var res;
                        try {
                            res = Y.JSON.parse(r.responseText);
                        } catch (err) {}
                        
                        if (res && res.status && res.data) {
                            _this.count = 0;
                            var data = res.data;
                            if (data.length && Lang.isArray(data)) {
                                //���ض������뱻������Ŀ��ͬ
                                while (data.length) {
                                    d = data.shift();
                                    if (d.result) {
                                        bizOrderIdArr.push(d['biz_order_id']);
                                    }
                                }
                                if (bizOrderIdArr.length) {
                                    Y.AutoConfirmLoading.show('�˱��ɹ���ת��֧��������ҳ...');
                                    _this._goToUrl('/order_pay.html?biz_order_id=' + bizOrderIdArr.join(','), 1000);
                                } else {
                                    //���ж������˱�ʧ��
                                    Y.AutoConfirmLoading.hide();
									_this._showMsgContent('<p>�����˱�ʧ�ܣ�������Ͷ����</p>');
                                }
                                return;
                            }
                        }
                        
                        //�˱�δ���
                        if (_this.count < 7) {
                            Y.later(1000, _this, function() {
                                _this._getCalcState();
                            });
                        } else {
                            _this.count = 0;
                            //������δ������ɣ����������б�ҳ
                            Y.AutoConfirmLoading.show('ת���ҵı��������б�...');
                            _this._goToUrl('', 1000);
                        }
                    }
                },
                timeout: 1500
            });
        }
          
    }, false, null, 4);
    
    Y.AutoConfirmSubmit = AutoConfirmSubmit;
    
}, '0.0.1', {
    requires: ['overlay']
});
