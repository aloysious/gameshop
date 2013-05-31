/**
 * Y.StepRandcode
 * @description 验证码步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-randcode', function(Y) {

/**
 * 验证码步骤
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
					'<a class="ins-u" href="#">换一张</a>',
				'</div>',
			'</div>'
		].join(''),
		
		isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false,
		rancodeDomain = isDaily ? 'http://stg.pa18.com' : 'http://www.pingan.com';
    
	/**
     * 验证码步骤构造函数
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
         * 渲染结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数
         * @public
         */
        render: function(container, config) {
            var data = this.data = config.data || {};
            if (data.result == 'bizCheck') {
                this._renderRandcode('验证码', 'biz');
            } else if (data.result == 'forceCheck') {
                this._renderRandcode('验证码', 'force');
            } else if (data.result == 'bothCheck') {
                this._renderRandcode('商业险验证码', 'biz');
                this._renderRandcode('交强险验证码', 'force');
            } else {}
            
            this._refreshAllCode();
			this._initValidate();
            
            this.addButton('step-btn-continue', '继续报价', this._onContinueClick);
        },
		
		/**
         * 初始化校验规则
         * @method _initValidate
         * @protected
         */
		_initValidate: function() {
			this.setValidateConfig({
				
				//商业险验证码
				'.biz-randcode input': {
					required: {
						error: '验证码不能为空'
					}
				},
				
				//交强险验证码
				'.force-randcode input': {
					required: {
						error: '验证码不能为空'
					}
				}
			});
		},
        
		/**
         * 渲染验证码元素
         * @method _renderRandcode
		 * @param {String} label 字段名称
		 * @param {String} type 验证码类型
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
         * 刷新验证码
         * @method _refreshCode
		 * @param {Node} elem 验证码节点
		 * @param {Boolean} focus 是否获得焦点
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
         * 刷新所有验证码
         * @method _refreshAllCode
         * @protected
         */
        _refreshAllCode: function() {
            this.get('body').all('.step-elem-randcode').each(function(item) {
                 this._refreshCode(item);   
            }, this);
        },
        
		/**
         * 绑定点击继续报价按钮事件
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
					
					//返回正常
                    case 'normal':
                        _this.ajaxSaveInputInfo({
                            flowId: _this.data.flowId,
                            orderId: _this.data.orderId   
                        });
                        break;
					
					//拒保
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//验证码不正确
                    case 'wrong':
						if (_this.data.result == 'bothCheck') {
							//两个验证码时，如果出错，继续调用正常保存报价接口
							_this.ajaxSaveInputInfo({
								flowId: _this.data.flowId,
								orderId: _this.data.orderId   
							});
						} else {
							_this._refreshAllCode();
							_this.addError(_this.get('body').one('.biz-randcode input'), '请重新输入验证码');
							_this.addError(_this.get('body').one('.force-randcode input'), '请重新输入验证码');
							Y.StepLoading.hide();
							//显示验证码不正确
						}
                        break;
                }
            }
			
            this.load('/json/auto/checkCode.do', map, handle);
        }
        
    }, {
        
		/**
		 * 配置参数
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
		
			/**
			 * @attribute title
			 * @description 步骤标题
			 * @type String
			 */
            title: {
                value: '请输入验证码'
            },
			
			/**
			 * @attribute preserved
			 * @description 跳转后是否保留步骤
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
