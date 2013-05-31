/**
 * Y.StepRenew
 * @description 续保身份证验证步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-renew', function(Y) {

/**
 * 续保身份证验证步骤
 * @module step-renew
 */   
 
    'use strict';
    
    var RENEW_TEMPLATE = [
        '<div class="step-elem car-id">',
            '<label class="step-elem-label" for="{carid}">身份证号码</label>',
            '<div class="step-elem-content">',
                '<input type="text" class="step-elem-text" id="{carid}" />',
            '</div>',
			'<p class="step-elem-error hidden"></p>',
        '</div>'
    ].join(''),
    
    trim = Y.Lang.trim,
	isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false;
    
	/**
     * 续保身份证验证步骤构造函数
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
         * 渲染结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数
         * @public
         */
        render: function(container, config) {
            var data = this.data = config.data || {};
            
            this.get('body').append(Y.Node.create(Y.Lang.sub(RENEW_TEMPLATE, {
                carid: Y.guid()
            })));
            
            this._carid = this.get('body').one('.car-id input');
			
            this._initValidate();
			
            this.addButton('step-btn-continue', '继续报价', this._onContinueClick);
            this.addButton('step-btn-jump', '跳过，填写新的车辆信息', this._onJumpClick);
        },
		
		/**
         * 初始化校验规则
         * @method _initValidate
         * @protected
         */
		_initValidate: function() {
			this.setValidateConfig({
				'.car-id input': {
					required: {
						error: '身份证不能为空'
					},
					custom: {
						fn: function(v) {
							var _v = v,
								re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
							
							// daily环境放开校验
							if (isDaily) {
								return true;
							}
							
							if (v.length == 15) {
								v = v.slice(0, 6) + '19' + v.slice(6) + '1';
							}
							if (!v.match(re)) {
								return false;
							}
							
							//检查18位身份证的校验码是否正确
							//校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
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
						error: '身份证格式有误'
					}
				}
			});
		},
        
		/**
         * 点击继续报价按钮事件
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
            this.validate() && this._loadNext(0);
        },
        
		/**
         * 点击跳过按钮事件
         * @method _onJumpClick
         * @protected
         */
        _onJumpClick: function() {
            this._loadNext(1);
        },
        
		/**
         * 获取接口参数
         * @method _getIOData
		 * @param {Number} isJump 是否是跳过
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
         * 获取下一步数据
         * @method _loadNext
		 * @param {Number} isJump 是否是跳过
         * @protected
         */
        _loadNext: function(isJump) {
            var _this = this,
                d = this._getIOData(isJump);
                
            function handle(data) {
                switch (data.result) {
					
					//通过验证
                    case 'pass':
                        _this._loadNew(data);
                        break;
					
					//身份证有误
                    case 'idErr':
                        _this.addError(_this._carid, '身份证填写有误');
						Y.StepLoading.hide();
                        break;
					default:
						break;
                }
            }
            
            this.load('/json/auto/confirmRenewal.do', d, handle);
        },
        
		/**
         * 检查是否需要填写车辆信息
         * @method _loadNew
		 * @param {Object} dt 步骤数据
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
                value: '欢迎老朋友！'
            },
			
			/**
			 * @attribute note
			 * @description 步骤标题说明
			 * @type String
			 */
            note: {
                value: '您是我们的老客户，请填写您的身份证号，我们将为您完成专属报价！'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate']
});
