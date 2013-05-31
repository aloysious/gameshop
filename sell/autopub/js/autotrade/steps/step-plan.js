/**
 * Y.StepPlan
 * @description �ײͱ��۲���
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-plan', function(Y) {

/**
 * �ײͱ��۲���
 * @module step-plan
 */   
 
    'use strict';
    
	//�ײ�˵��ģ��
    var NOTE_TEMPLATE = '<p class="plan-note">{note}</p>',
        
		//�ײͱ��ģ��
		TABLE_TEMPLATE = [
            '<div class="plan-table">',
                '<table cellspacing="5">{content}</table>',
            '</div>'
        ].join(''),
		
		//����ģ��
        ITEM_TEMPLATE = [
            '<td class="plan-item">',
                '<p>',
                    '<span class="item-label">{label}</span>',
                    '<span class="item-value" data-id={id}>{value}</span>',
                    '<b></b>',
                '</p>',
            '</td>'
        ].join(''),
		
		//�ܼ�Ǯģ��
        TOTAL_TEMPLATE = [
            '<td class="plan-total" rowspan="{rowspan}">',
                '<div class="total-price hidden">',
                    '<div>',
                        '<h3>�����ܼ�</h3>',
                        '<strong></strong>',
                    '</div>',
                    '<p class="hidden">��ʱû���ʺ����ĳ����ײͣ�������</p>',
                    '<a href="{quoteLink}">�Զ�����</a>',
                '</div>',
                '<div class="loading-price">',
                    '<p>�������¼��㱨��</p>',
                '</div>',
            '</td>'
        ].join(''),
		
		//��Ч����ģ��
        EFFECT_TEMPLATE = [
            '<ul class="plan-effect">',
                '<li class="ins-g">',
                    '<label class="ins-u effect-date">��ҵ����Ч�ڼ䣺<input type="text" class="biz-date" readonly="readonly" name="effect-syx" value="{biz}" id={bizId} /></label>',
                    '<span class="ins-u effect-day">��</span>',
                    '<span class="ins-u effect-period">0 ʱ �� <em class="effect-end"></em>�� 24 ʱ ֹ</span>',
                '</li>',
                '<li class="ins-g">',
                    '<label class="ins-u effect-date">��ǿ����Ч�ڼ䣺<input type="text" class="force-date" readonly="readonly" name="effect-syx" value="{force}" id={forceId} /></label>',
                    '<span class="ins-u effect-day">��</span>',
                    '<label class="ins-u effect-same"><input type="checkbox" checked="checked" autocomplete="off" />ͬ��ҵ��</label>',
                '</li>',
            '</ul>'
        ].join('');
    
	/**
     * �ײͱ��۲��蹹�캯��
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
         * ��ʼ��
         * @method initializer
		 * @param {Object} config �����ʼ������
         * @public
         */
        initializer: function(config) {
            var data = config.data || {};
			
            this._isRenew = (data.xubao == 1);
			this._domain = location.href.indexOf('daily.taobao.net') > -1 ? 'http://baoxian.daily.taobao.net' : 'http://baoxian.taobao.com';
            
			if (this._isRenew) {
                this.set('title', '������ȵ�Ͷ������');
            } else {
                this.set('title', '���ĳ����ػ��ײ�');
            }
        },
        
		/**
         * ��������
         * @method destructor
         * @public
         */
        destructor: function() {
            if (this.bizCalendar) {
				//���������bug�������Ƴ���û�н��document onclick -> hide���¼���
                this.bizCalendar.con.empty(true);
                this.bizCalendar = null;
                delete this.bizCalendar;
            }
            if (this.forceCalendar) {
				//���������bug�������Ƴ���û�н��document onclick -> hide���¼���
                this.forceCalendar.con.empty(true);
                this.forceCalendar = null;
                delete this.forceCalendar;
            } 
        },
        
		/**
         * ��Ⱦ�ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������
         * @public
         */
        render: function(container, config) {
            this._body = this.get('body');
			
            this.data = config.data || {};
            this.premiumData = config.premiumData || {};
			
			if (this.data.xubao == 1) {
				container.addClass('step-plan-xubao');
			}
			
			
            this.addButton('step-btn-buy', '����Ͷ��', this._onBuyClick);
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
         * ��Ⱦ�ײ�˵���İ�
         * @method _renderPlanNote
		 * @param {Node} container ��������
		 * @param {Object} config ��ʼ������
         * @protected
         */
        _renderPlanNote: function(container, config) {
            var note = this._isRenew ? '���˷�������' : '80%�û�ѡ���Ͷ������';
            
            this._body.append(Y.Lang.sub(NOTE_TEMPLATE, {
                note: note
            }));
        },
        
		/**
         * ��Ⱦ�ײ������б�
         * @method _renderPlanTable
		 * @param {Node} container ��������
		 * @param {Object} config ��ʼ������
         * @protected
         */
        _renderPlanTable: function(container, config) {
            var data = config.data,
                list = data.itemList || [],
                content = '<tr>',
                table,
                td;
            
			//Ͷ�������ֶ�
            content += (Y.Lang.sub(ITEM_TEMPLATE, {
                id: '',
                label: 'Ͷ��������',
                value: data.carId || ''
            }));
            
			//��ʻ�����ֶ�
            content += (Y.Lang.sub(ITEM_TEMPLATE, {
                id: '',
                label: '��ʻ���У�',
                value: data.cityName || ''
            }));
            
			//�չ�����6��������ż��
            while (list.length < 6 || (list.length % 2) == 1) {
                list.push({
                    name: '',
                    text: '--'
                });
            }
            
			//��Ǯ����
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
         * ��Ⱦ��Ч��������
         * @method _renderPlanEffect
		 * @param {Node} container ��������
		 * @param {Object} config ��ʼ������
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
         * ��Ⱦ��Ч�����������
         * @method _getEffectCalendar
		 * @param {Node} input �����Ԫ��
		 * @param {Boolean} isBiz �Ƿ�����ҵ������
		 * @return {Calendar} calendar �������ʵ��
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
         * ��ȡ�۸�
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
					
					//��������
                    case 'normal':
                        _this._syncPremium(data);
                        _this._showTotalPrice();
                        break;
					
					//��ǰͶ��
                    case 'bothBefore':
                    case 'bizBefore':
                    case 'forceBefore':
                        _this._showTotalFail();
                        _this.forward('step-before', {
                            data: data
                        });
                        break;
					
					//�ܱ�
                    case 'refuse':
                        _this._showTotalFail();
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//��Ҫ������֤��
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        _this._showTotalFail();
                        _this.forward('step-randcode', {
                            data: data
                        });
                        break;
					
					//�۸��ȡʧ��
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
         * ��ʾ��ȡ�۸������
         * @method _showPremiumLoading
         * @protected
         */
        _showPremiumLoading: function() {
            this.totalPrice.addClass('hidden');
            this.loadingPrice.removeClass('hidden');
            this.buyBtn.addClass('step-btn-buy-disabled');
        },
        
		/**
         * ��ʾ�ܼ۸�
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
         * ��ʾ��ȡʧ��
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
         * ���¼۸�
         * @method _syncPremium
		 * @param {Object} data �۸����
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
                    node.setContent(map[id]['premium'] + 'Ԫ');
                }
            });
            
            this.totalPrice.one('strong').setContent(data.totalPremium + 'Ԫ');
        },
        
		/**
         * �������ť�¼�
         * @method _onBuyClick
		 * @param {EventFacade} e �¼�����
         * @protected
         */
        _onBuyClick: function(e) {
            if (e.target.hasClass('step-btn-buy-disabled')) { return; }
            Y.StepLoading.show('����Ϊ����ת��ȷ��ҳ...');
            window.location.href = this._domain + '/auto/buyNow.html?tmpOrderId=' + this.data.orderId;
        }
        
    }, {
		
		/**
		 * ���ò���
		 * @property ATTRS
		 * @static
		 */
		ATTRS: {
			
			//TODO Ӧ���ɺ�˶�̬�ṩ�����İ�
			/**
			 * @attribute note
			 * @description �������˵��
			 * @type String
			 */
			note: {
				value: '�ף����ڸ����<span class="step-hd-hot">����100Ԫ</span>Ŷ���ȵ��ȵã����꼴ֹ��'
			}
		
		}
		
	});
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load']
});