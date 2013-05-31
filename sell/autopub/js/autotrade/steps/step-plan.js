/**
 * Y.StepPlan
 * @description 套餐报价步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-plan', function(Y) {

/**
 * 套餐报价步骤
 * @module step-plan
 */   
 
    'use strict';
    
	//套餐说明模板
    var NOTE_TEMPLATE = '<p class="plan-note">{note}</p>',
        
		//套餐表格模板
		TABLE_TEMPLATE = [
            '<div class="plan-table">',
                '<table cellspacing="5">{content}</table>',
            '</div>'
        ].join(''),
		
		//险种模板
        ITEM_TEMPLATE = [
            '<td class="plan-item">',
                '<p>',
                    '<span class="item-label">{label}</span>',
                    '<span class="item-value" data-id={id}>{value}</span>',
                    '<b></b>',
                '</p>',
            '</td>'
        ].join(''),
		
		//总价钱模板
        TOTAL_TEMPLATE = [
            '<td class="plan-total" rowspan="{rowspan}">',
                '<div class="total-price hidden">',
                    '<div>',
                        '<h3>保费总计</h3>',
                        '<strong></strong>',
                    '</div>',
                    '<p class="hidden">暂时没有适合您的车险套餐，您可以</p>',
                    '<a href="{quoteLink}">自定方案</a>',
                '</div>',
                '<div class="loading-price">',
                    '<p>正在重新计算报价</p>',
                '</div>',
            '</td>'
        ].join(''),
		
		//生效日期模板
        EFFECT_TEMPLATE = [
            '<ul class="plan-effect">',
                '<li class="ins-g">',
                    '<label class="ins-u effect-date">商业险生效期间：<input type="text" class="biz-date" readonly="readonly" name="effect-syx" value="{biz}" id={bizId} /></label>',
                    '<span class="ins-u effect-day">日</span>',
                    '<span class="ins-u effect-period">0 时 至 <em class="effect-end"></em>日 24 时 止</span>',
                '</li>',
                '<li class="ins-g">',
                    '<label class="ins-u effect-date">交强险生效期间：<input type="text" class="force-date" readonly="readonly" name="effect-syx" value="{force}" id={forceId} /></label>',
                    '<span class="ins-u effect-day">日</span>',
                    '<label class="ins-u effect-same"><input type="checkbox" checked="checked" autocomplete="off" />同商业险</label>',
                '</li>',
            '</ul>'
        ].join('');
    
	/**
     * 套餐报价步骤构造函数
     * @class StepPlan
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
     * @constructor
     */    
    Y.StepPlan = Y.Base.create('step-plan', Y.Step, [
        Y.StepStdMod,
        Y.StepLoad
    ], {
        
		/**
         * 初始化
         * @method initializer
		 * @param {Object} config 组件初始化参数
         * @public
         */
        initializer: function(config) {
            var data = config.data || {};
			
            this._isRenew = (data.xubao == 1);
			this._domain = location.href.indexOf('daily.taobao.net') > -1 ? 'http://baoxian.daily.taobao.net' : 'http://baoxian.taobao.com';
            
			if (this._isRenew) {
                this.set('title', '您上年度的投保方案');
            } else {
                this.set('title', '您的车险特惠套餐');
            }
        },
        
		/**
         * 析构函数
         * @method destructor
         * @public
         */
        destructor: function() {
            if (this.bizCalendar) {
				//日历组件的bug，容器移除后没有解除document onclick -> hide的事件绑定
                this.bizCalendar.con.empty(true);
                this.bizCalendar = null;
                delete this.bizCalendar;
            }
            if (this.forceCalendar) {
				//日历组件的bug，容器移除后没有解除document onclick -> hide的事件绑定
                this.forceCalendar.con.empty(true);
                this.forceCalendar = null;
                delete this.forceCalendar;
            } 
        },
        
		/**
         * 渲染结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数
         * @public
         */
        render: function(container, config) {
            this._body = this.get('body');
			
            this.data = config.data || {};
            this.premiumData = config.premiumData || {};
			
			if (this.data.xubao == 1) {
				container.addClass('step-plan-xubao');
			}
			
			
            this.addButton('step-btn-buy', '立刻投保', this._onBuyClick);
            this.buyBtn = this.get('footer').one('.step-btn-buy');
			
            this._renderPlanNote(container, config);
            this._renderPlanTable(container, config);
            this._renderPlanEffect(container, config);
			
            if (this.premiumData.result == 'normal') {
                this._syncPremium(this.premiumData);
                this._showTotalPrice();
            } else {
                this._showTotalFail();
            }
        },
        
		/**
         * 渲染套餐说明文案
         * @method _renderPlanNote
		 * @param {Node} container 步骤容器
		 * @param {Object} config 初始化参数
         * @protected
         */
        _renderPlanNote: function(container, config) {
            var note = this._isRenew ? '按此方案续保' : '80%用户选择的投保方案';
            
            this._body.append(Y.Lang.sub(NOTE_TEMPLATE, {
                note: note
            }));
        },
        
		/**
         * 渲染套餐险种列表
         * @method _renderPlanTable
		 * @param {Node} container 步骤容器
		 * @param {Object} config 初始化参数
         * @protected
         */
        _renderPlanTable: function(container, config) {
            var data = config.data,
                list = data.itemList || [],
                content = '<tr>',
                table,
                td;
            
			//投保车辆字段
            content += (Y.Lang.sub(ITEM_TEMPLATE, {
                id: '',
                label: '投保车辆：',
                value: data.carId || ''
            }));
            
			//行驶城市字段
            content += (Y.Lang.sub(ITEM_TEMPLATE, {
                id: '',
                label: '行驶城市：',
                value: data.cityName || ''
            }));
            
			//凑够至少6个并且是偶数
            while (list.length < 6 || (list.length % 2) == 1) {
                list.push({
                    name: '',
                    text: '--'
                });
            }
            
			//价钱区域
            content += (Y.Lang.sub(TOTAL_TEMPLATE, {
                rowspan: list.length / 2 + 1,
				quoteLink: this._domain + '/auto/quote.html?tmpOrderId=' + data.orderId
            }) + '</tr>');
            
            Y.Array.each(list, function(item, index) {
                 td = Y.Lang.sub(ITEM_TEMPLATE, {
                     id: item.name,
                     label: item.text,
                     value: '--'
                 });
                 if (index % 2) {
                     content += (td + '</tr>');
                 } else {
                     content += ('<tr>' + td);
                 }
            });
            
            table = Y.Lang.sub(TABLE_TEMPLATE, {
                content: content
            });
            
            this._body.append(table);
            
            this.totalPrice = this._body.one('.total-price');
            this.loadingPrice = this._body.one('.loading-price');
        },
        
		/**
         * 渲染生效日期日历
         * @method _renderPlanEffect
		 * @param {Node} container 步骤容器
		 * @param {Object} config 初始化参数
         * @protected
         */
        _renderPlanEffect: function(container, config) {
            if (this._isRenew) { return; }
            
            var _this = this,
                data = config.data,
                biz = data.bizBeginDate || '',
                force = data.forceBeginDate || '',
                effectNode;
            
            effectNode = Y.Node.create(Y.Lang.sub(EFFECT_TEMPLATE, {
                biz: biz,
                force: force,
                bizId: Y.guid(),
                forceId: Y.guid()
            }));
            this._body.append(effectNode);
            
            this.bizInput = effectNode.one('.biz-date'),
            this.forceInput = effectNode.one('.force-date');
            this.sameInput = effectNode.one('.effect-same input');
            this.effectEnd = effectNode.one('.effect-end');
            this.bizCalendar = this._getEffectCalendar(this.bizInput, true);
            this.forceCalendar = this._getEffectCalendar(this.forceInput);
            
            function sameWithBiz() {
                if (this.sameInput.get('checked')) {
                    var bizVal = this.bizInput.get('value'),
                        forceVal = this.forceInput.get('value');
                        
                    if (bizVal != forceVal) {
                        this.forceInput.set('value', bizVal);
                        this.forceCalendar.render({selected:new Date(bizVal.replace(/-/g, '/'))});
                        this._getPremium();
                    }
                }
            }
            
            this.sameInput.on('click', sameWithBiz, this);
            sameWithBiz.call(this);            
        },
        
		/**
         * 渲染生效日期日历组件
         * @method _getEffectCalendar
		 * @param {Node} input 输入框元素
		 * @param {Boolean} isBiz 是否是商业险日期
		 * @return {Calendar} calendar 日历组件实例
         * @protected
         */
        _getEffectCalendar: function(input, isBiz) {
            var _this = this,
                id = input.getAttribute('id'),
                value = Y.Lang.trim(input.get('value')),
                min = new Date(),
                s = new Date(value.replace(/-/g, '/')),
                calendar,
                end;
            
            function formatDate(d) {
                var _Y = d.getFullYear(),
                    _M = d.getMonth() + 1,
                    _D = d.getDate();
                    
                return _Y + '-' + (_M < 10 ? '0' + _M : _M) + '-' + (_D < 10 ? '0' + _D : _D);
            }
            
            min.setDate(min.getDate() + 1);
            if (!Y.Lang.isDate(s) || s.getTime() < min.getTime()) {
                s = min;
                input.set('value', formatDate(min));
            }
                
            calendar = new Y.Calendar(id, {
                date: new Date(),
                selected: s,
                mindate: min,
                action: ['click', 'focus'],
                popup: true,
                closeable: true
            }).on('select', function(d) {
                var date = formatDate(d);
                if (date != input.get('value')) {
                    input.set('value', date);
                    if (_this.sameInput.get('checked')) {
                        if (isBiz) {
                            _this.forceInput.set('value', date);
                            _this.forceCalendar.render({selected:d});
                        } else {
                            _this.sameInput.set('checked', false);
                        }
                    }
                    if (isBiz) {
                        d.setFullYear(d.getFullYear() + 1);
                        d.setDate(d.getDate() - 1);
                        _this.effectEnd.setContent(formatDate(d));
                    }
                    _this._getPremium();
                }
            });
            
            if (isBiz) {
                end = new Date(formatDate(s).replace(/-/g, '/'));
                end.setFullYear(end.getFullYear() + 1);
                end.setDate(end.getDate() - 1);
                this.effectEnd.setContent(formatDate(end));
            }
            
            input.on(['click', 'focus'], function(e) {
                if (isBiz) {
                    this.forceCalendar.hide();
                } else {
                    this.bizCalendar.hide();
                }
            }, this);
            
            calendar.con.setStyle('zIndex', '200001');
            
            return calendar;
        },
        
		/**
         * 获取价格
         * @method _getPremium
         * @protected
         */
        _getPremium: function() {
            var _this = this,
                dt = this.data,
                d = {
                    flowId: dt.flowId,
                    orderId: dt.orderId,
                    bizBeginDate: (this.bizInput && this.bizInput.get('value')) || dt.bizBeginDate,
                    forceBeginDate: (this.forceInput && this.forceInput.get('value')) || dt.forceBeginDate
                };
            
            this._showPremiumLoading();
            
            function handle(data) {
                switch (data.result) {
					
					//返回正常
                    case 'normal':
                        _this._syncPremium(data);
                        _this._showTotalPrice();
                        break;
					
					//提前投保
                    case 'bothBefore':
                    case 'bizBefore':
                    case 'forceBefore':
                        _this._showTotalFail();
                        _this.forward('step-before', {
                            data: data
                        });
                        break;
					
					//拒保
                    case 'refuse':
                        _this._showTotalFail();
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//需要输入验证码
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        _this._showTotalFail();
                        _this.forward('step-randcode', {
                            data: data
                        });
                        break;
					
					//价格获取失败
                    case 'fail':
                        _this._showTotalFail();
                        break;
                     default:
                        break;
                }
            }
            
            this.load('/json/auto/detailQuote.do', d, handle, false);
        },
        
		/**
         * 显示获取价格加载中
         * @method _showPremiumLoading
         * @protected
         */
        _showPremiumLoading: function() {
            this.totalPrice.addClass('hidden');
            this.loadingPrice.removeClass('hidden');
            this.buyBtn.addClass('step-btn-buy-disabled');
        },
        
		/**
         * 显示总价格
         * @method _showTotalPrice
         * @protected
         */
        _showTotalPrice: function() {
            this.totalPrice.removeClass('hidden');
            this.totalPrice.one('div').removeClass('hidden');
            this.totalPrice.one('p').addClass('hidden');
            this.loadingPrice.addClass('hidden');
            this.buyBtn.removeClass('step-btn-buy-disabled');
        },
        
		/**
         * 显示获取失败
         * @method _showTotalFail
         * @protected
         */
        _showTotalFail: function() {
            this.totalPrice.removeClass('hidden');
            this.totalPrice.one('div').addClass('hidden');
            this.totalPrice.one('p').removeClass('hidden');
            this.loadingPrice.addClass('hidden');
            this.buyBtn.addClass('step-btn-buy-disabled');    
        },
        
		/**
         * 更新价格
         * @method _syncPremium
		 * @param {Object} data 价格对象
         * @protected
         */
        _syncPremium: function(data) {
            var list = data.premiumList,
                map = {},
                body = this._body,
                id;
                
            Y.Array.each(list, function(item) {
                map[item['name']] = item;
            });
            
            body.all('.item-value').each(function(node) {
                id = node.getAttribute('data-id');
                if (id && map[id]) {
                    node.setContent(map[id]['premium'] + '元');
                }
            });
            
            this.totalPrice.one('strong').setContent(data.totalPremium + '元');
        },
        
		/**
         * 点击购买按钮事件
         * @method _onBuyClick
		 * @param {EventFacade} e 事件对象
         * @protected
         */
        _onBuyClick: function(e) {
            if (e.target.hasClass('step-btn-buy-disabled')) { return; }
            Y.StepLoading.show('正在为您跳转至确认页...');
            window.location.href = this._domain + '/auto/buyNow.html?tmpOrderId=' + this.data.orderId;
        }
        
    }, {
		
		/**
		 * 配置参数
		 * @property ATTRS
		 * @static
		 */
		ATTRS: {
			
			//TODO 应该由后端动态提供促销文案
			/**
			 * @attribute note
			 * @description 步骤标题说明
			 * @type String
			 */
			note: {
				value: '亲，现在付款可<span class="step-hd-hot">立减100元</span>哦！先到先得，抢完即止！'
			}
		
		}
		
	});
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load']
});