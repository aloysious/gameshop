/**
 * Y.AutoConfirmSubmit
 * @description 车险接口化确认页表单校验及弹窗处理
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-submit', function(Y) {
 
/**
 * 确认页逻辑
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * 确认页表单校验及弹窗处理
 * @module autoconfirm
 * @submodule autoconfirm-submit
 */
    
    'use strict';
    
    //消息与成功的主内容结构   
    var MSG_BD = '<div class="submitbox-msg"><div>{content}</div></div>',
		SUCCESS_BD = '<div class="submitbox-success">{content}</div>',
        
        //三种状态的按钮尾部结构
        MSG_FOOTER = '<div class="clearfix submitbox-btns"><button class="submitbox-closebtn" type="button" title="关闭"></button></div>',
        SUCCESS_FOOTER = '<div class="clearfix submitbox-btns"><a href="/auto/quote.html?tmpOrderId=' + window['tmpOrderId'] + '" class="submitbox-back">返回报价页面</a><button class="submitbox-agree" type="button" title="同意，提交表单">同意，提交表单</button></div>',
        RANDCODE_FOOTER = '<div class="clearfix submitbox-btns"><button class="submitbox-continue" type="button" title="继续提交">继续提交</button></div>',
        
        //成功与验证码结构
		SUCCESS_TEMPLATE = '<h3 class="success-title">{title}</h3><div class="success-content">{content}</div>',
        RANDCODE_TEMPLATE = [
            '<div class="submitbox-randcode">',
                '<div class="randcode-code ins-g">',
                    '<label class="randcode-label ins-u" for="randcode-text">验证码</label>',
                    '<div class="randcode-content ins-u">',
                        '<input type="text" class="randcode-text" id="randcode-text" />',
                    '</div>',
                    '<p class="randcode-error ins-u hidden"></p>',
                '</div>',
                '<div class="randcode-image ins-g">',
                    '<span class="ins-u"><img src="" alt="" /></span>',
                    '<a class="ins-u" href="#">换一张</a>',
                '</div>',
            '</div>'
        ].join(''),
        
        Lang = Y.Lang,
        isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false,
		rancodeDomain = isDaily ? 'http://stg.pa18.com' : 'http://www.pingan.com';
    
    /**
     * 表单校验及弹窗处理构造函数
     * @class AutoConfirmSubmit
     * @constructor
     */
    function AutoConfirmSubmit() {
        
        /**
         * 核保尝试次数
         * @property count
         * @type Number
         * @default 0
         */
        this.count = 0;
    }
    
    Y.mix(AutoConfirmSubmit, {
        
        /**
         * 初始化
         * @method initializer
         * @public
         */ 
        initializer: function() {
            this.publish('confirmBefore');
            Y.after(this._renderSubmit, this, 'render');
        },
        
        /**
         * 初始化校验函数，渲染弹窗
         * @method _renderSubmit
         * @protected
         */ 
        _renderSubmit: function() {
            Y.CheckForm('J_atc_form', this._afterValidate, this);
            this._bindConfirmBefore();
            this._renderSubmitBox();
        },
        
        /**
         * 提交表单数据
         * @method _submitData
         * @param {EventFacade} e 事件对象
         * @protected
         */        
        _submitData: function(e) {
            var _this = this,
                timeStamp = new Date().getTime();
            
			//unload时缓存数据可能被页面关闭终止，增加在提交表单时缓存数据
			this._saveStorageData();
			
			//重新提交时先清空内容
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
                            
                            //确认投保
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
         * 表单校验正确回调
         * @method _afterValidate
         * @protected
         */ 
        _afterValidate: function() {
            this._submitData();
        },
		
		/**
         * 弹窗显示返回信息
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
         * 数据提交成功，显示返回文案，包括保费变化，商业险特别约定，交强险特别约定等
         * @method _showSuccessContent
         * @param {Object} data 返回文案对象
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
         * 获取成功文案
         * @method _getSuccessContent
         * @param {Object} data 返回文案对象
         * @protected
         */
        _getSuccessContent: function(data) {
            var list = [
                    ['premiumChangeNotice', '保费变化'],
                    ['bizPromise', '商业险特别约定'],
                    ['forcePromise', '交强险特别约定'],
                    ['checkVehicle', '验车提示']
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
         * 显示验证码内容
         * @method _showRandcodeContent
         * @param {Object} data 返回ID对象
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
         * 绑定确认投保处理事件
         * @method _bindConfirmBefore
         * @protected
         */
        _bindConfirmBefore: function() {
            this.on('confirmBefore', function(e) {
                var data = e.data;
                Y.AutoConfirmLoading.hide();
                switch (data.result) {
                    
                    //拒保或出错
                    case 'refuse':
                    case 'error':
						this._showMsgContent(data.msg);
                        break;
                    
                    //成功
                    case 'success':
						this._showSuccessContent(data.data);
                        break;
                    
                    //需要填写验证码
                    case 'checkcode':
                        this._showRandcodeContent(data || {});
                        break;
                }
            });
        },
        
        /**
         * 渲染弹窗
         * @method _renderSubmitBox
         * @protected
         */
        _renderSubmitBox: function() {
            var IE6 = (Y.UA.ie == 6),
                mask = Y.Node.create('<div class="submitbox-mask hidden"></div>'),
                shim = Y.Node.create('<iframe class="submitbox-shim hidden" frameborder="0" src="javascript:false" title="Submit Stacking Shim" tabindex="-1" role="presentation"></iframe>'),
                close = Y.Node.create('<a href="#" class="submitbox-close" title="关闭"></a>'),
                submitBox = new Y.Overlay({
					width: '653px',
                    headerContent: '<h2>中国平安车险公司</h2>',
                    bodyContent: '',
                    footerContent: '',
                    zIndex: 200000,
                    centered: true,
                    visible: false,
					render: true
                });
			
			//更新IE6下遮罩和iframe的大小
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
                Y.AutoConfirmLoading.show('请在为您创建订单...');
                this._createOrder();
            }, '.submitbox-agree', this);
            
            Y.AutoConfirmLoading.render(submitBox.get('boundingBox'));
            
            this._submitBox = submitBox;
            this._submitBoxMask = mask;
            
            this._bindRandcode();
        },
        
        /**
         * 绑定验证码事件
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
         * 刷新验证码
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
         * 校验验证码是否为空
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
                this._toggleRandcodeError(false, '验证码不能为空');
            }
            
            return valid;
        },
        
        /**
         * 切换验证码错误
         * @method _toggleRandcodeError
         * @param {Boolean} show 显示或隐藏
         * @param {String} content 错误文案
         * @protected
         */
        _toggleRandcodeError: function(show, content) {
             var cb = this._submitBox.get('contentBox'),
                 err = cb.one('.randcode-error');
             
             err.setContent(content || '');
             err.toggleClass('hidden', show);
        },
        
        /**
         * 提交验证码
         * @method _submitRandcode
         * @protected
         */
        _submitRandcode: function() {
            var _this = this;
            
            Y.AutoConfirmLoading.show('正在为您提交信息中...');
            
            function handle(data) {
                switch (data.result) {
                    
                    //正常
                    case 'normal':
                        _this._submitData();
                        break;
                    
                    //拒保
                    case 'refuse':
                        _this._showMsgContent(data.promptMsg);
                        Y.AutoConfirmLoading.hide();
                        break;
                    
                    //验证码出错
                    case 'wrong':
                        _this._refreshCode();
                        _this._toggleRandcodeError(false, '请重新输入验证码');
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
         * 跳转至
         * @method _goToUrl
         * @param {String} url 跳转地址
         * @param {Number} delay 延迟时间
         * @protected
         */
        _goToUrl: function(url, delay) {
            Y.later(delay || 3000, this, function() {
                location.href = url || (isDaily ? 'http://trade.daily.taobao.net/trade/itemlist/list_bought_items.htm' : 'http://trade.taobao.com/trade/itemlist/list_bought_items.htm');
            });
        },
        
        /**
         * 创建订单
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
							_this._showMsgContent(res && res.msg || '创建订单失败');
                        }
                    }
                }
            });
        },
        
        /**
         * 查询核保状态
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
            
            Y.AutoConfirmLoading.show('正在为您查询核保状态...');
            
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
                                //返回订单数与被保人数目相同
                                while (data.length) {
                                    d = data.shift();
                                    if (d.result) {
                                        bizOrderIdArr.push(d['biz_order_id']);
                                    }
                                }
                                if (bizOrderIdArr.length) {
                                    Y.AutoConfirmLoading.show('核保成功，转向支付宝付款页...');
                                    _this._goToUrl('/order_pay.html?biz_order_id=' + bizOrderIdArr.join(','), 1000);
                                } else {
                                    //所有订单都核保失败
                                    Y.AutoConfirmLoading.hide();
									_this._showMsgContent('<p>订单核保失败，请重新投保。</p>');
                                }
                                return;
                            }
                        }
                        
                        //核保未完成
                        if (_this.count < 7) {
                            Y.later(1000, _this, function() {
                                _this._getCalcState();
                            });
                        } else {
                            _this.count = 0;
                            //订单还未处理完成，跳至订单列表页
                            Y.AutoConfirmLoading.show('转向我的保单订单列表...');
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
