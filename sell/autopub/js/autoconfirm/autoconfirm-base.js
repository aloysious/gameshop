/**
 * Y.AutoConfirmBase
 * @description 车险接口化确认页表单数据处理
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-base', function(Y) {

/**
 * 确认页逻辑
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * 表单数据处理
 * @module autoconfirm
 * @submodule autoconfirm-base
 */
    
    'use strict';
    
	var F = Y.Field;
	
	/**
     * 表单数据处理构造函数
     * @class AutoConfirmBase
     * @constructor
     */
    function AutoConfirmBase() {}
    
    Y.mix(AutoConfirmBase, {
        
        /**
         * 渲染模块
         * @method render
         * @chainable
         * @public
         */ 
		render: function() {
			var insured = Y.one('.insured-info .widget-list'),
				holder = Y.one('.holder-info .widget-list'),
				other = Y.one('.other-info .widget-list'),
				deliver = Y.one('.deliver-info .widget-list');
				
			this._addDeliverValidateJSON();
			this._initStorageData();
			Y.on('unload', function() {
				this._saveStorageData();
			}, window, this);
			
			insured && F.WidgetList.initList(insured, 'insured');
			holder && F.WidgetList.initList(holder, 'holder');
			other && F.WidgetList.initList(other, 'other');
			deliver && F.WidgetList.initList(deliver, 'deliver');
			
			//先绑定被保险人
			F.Event.bind(insured);
			
			//设置投保人与被保险人同步
			function setSync(list) {
				var same = null;
				if (list && (same = list.ancestor().one('.same-with-insured input'))) {
					F.Event.bind(list);
					var sync = function() {
						var checked = same.get('checked');
						if (checked) {
							F.Event.bind(list);
							F.Linkage.syncModLinkageVal(insured.widgets, list.widgets);
						} else {
							F.Event.unbind(list);
						}
					}
					same.on('click', sync);
					sync();
				}
			}
			
			setSync(holder);
			setSync(other);
			setSync(deliver);
			
			this._initDeliverTownCity();
			
			return this;
		},
		
		/**
         * 配送地址城市名与城市编码联动 Hack
         * @method _initDeliverTownCity
         * @protected
         */
		_initDeliverTownCity: function() {
			var cityCode = Y.one('#townCityCode'),
				cityName = Y.one('#townCityName'),
				select, index, options, option;
			
			function update() {
				index = select.selectedIndex;
				option = options[index];
				if (option) {
					cityName.set('value', option.text);
				} else {
					cityName.set('value', '');
				}
			}			
			
			if (cityCode && cityName) {
				select = cityCode.getDOMNode();
				options = select.options;
				cityCode.on('change', update);
				update();
			}
		},
		
		/**
         * 初始化本地缓存数据
         * @method _initStorageData
         * @protected
         */
		_initStorageData: function() {
			var obj = {},
				form = Y.one('#J_atc_form').getDOMNode(),
				item,
				data;
			
			window['FORM_INIT_DATA'] = window['FORM_INIT_DATA'] || {};
			
			//设置“同被保险人”字段同步
			var setSame = function(listName, formData) {
				var input = Y.one('#J_same_' + listName),
					name;
					
				if (input) {
					name = input.getAttribute('name');
					if (formData) {
						input.set('checked', !!formData[name]);
					}
				}
			};
			
			try {
				data = Y.StorageLite.getItem('autoconfirmdata');
				if (data) {
					if (data.indexOf(tmpOrderId + '|') < 0) {
						Y.StorageLite.setItem('autoconfirmdata', '');
						data = null;
					} else {
						data = decodeURIComponent(data.split(tmpOrderId + '|')[1] || '');
						data = data.split('&');
						while (data.length) {
							item = data.shift();
							item = item.split('=');
							
							//checkbox多选中的时候存为"checkbox=1,2,3"
							if (item[0] in obj) {
								// serialize bug?
								// checkbox
								obj[item[0]] = obj[item[0]] + ',' + (item[1] || '');
							} else {
								obj[item[0]] = item[1] || '';
							}
						}
						data = obj;
					}
				}
			} catch (err) {}
			
			if (data) {
				setSame('holder', data);
				setSame('other', data);
				setSame('deliver', data);
				window['FORM_INIT_DATA'] = Y.mix(window['FORM_INIT_DATA'], data, false, null);
			}
		},
		
		/**
         * 缓存用户已录入数据至本地缓存
         * @method _saveStorageData
         * @protected
         */
		_saveStorageData: function() {
		    
		    //使用IO中的序列化方法
			var serialize = Y.IO.prototype._serialize;
				
			try {
				Y.StorageLite.setItem('autoconfirmdata', tmpOrderId + '|' + serialize({ id: 'J_atc_form' }));
			} catch (err) {}
		},
		
		/**
         * 添加配送信息校验规则（配送信息的校验后台不输出，得前端自己加）
         * @method _addDeliverValidateJSON
         * @protected
         */
		_addDeliverValidateJSON: function() {
		    window['Validator_JSON'] = Y.mix(window['Validator_JSON'] || {}, {
                'deliverName': {
                    'required': {
                        'errmsg': '收件人姓名：请填写收件人姓名。'
                    },
                    'minSize': {
                        'num': '2',
                        'errmsg': '收件人姓名：收件人姓名必须在 2~20 个字之间。'
                    },
                    'maxSize': {
                        'num': '20',
                        'errmsg': '收件人姓名：收件人姓名必须在 2~20 个字之间。'
                    },
					'regx': {
						'expression': /^[\w\d\u4e00-\u9fa5]+$/,
						'errmsg': '收件人姓名：收件人姓名为中文、字母或数字的组合。'
					}
                },
                'deliverMobile': {
                    'required': {
                        'errmsg': '收件人手机号码：请填写收件人手机号码。'
                    },
                    'regx': {
                        'rule': 'number',
                        'errmsg': '收件人手机号码：请正确填写收件人手机号码。'
                    },
                    'length': {
                        'num': '11',
                        'errmsg': '收件人手机号码：请正确填写收件人手机号码。'
                    }
                },
                'townCityCode': {
                    'required': {
                        'errmsg': '收件人地区：请填写收件人地区。'
                    }
                },
                'deliverAddress': {
                    'required': {
                        'errmsg': '收件人街道地址：请填写收件人街道地址。'
                    },
					'regx': {
						'expression': /^[\#\-,，\w\d\u4e00-\u9fa5]+$/,
						'errmsg': '收件人街道地址：街道地址为中英文，数字，“#”，“-”，“,”等的组合，不能为全数字。'
					}
                }
            });
		}
		
    }, false, null, 4);
    
    Y.AutoConfirmBase = AutoConfirmBase;
    
}, '0.0.1', {
    requires: ['node']
});
