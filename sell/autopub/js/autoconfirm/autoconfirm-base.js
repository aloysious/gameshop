/**
 * Y.AutoConfirmBase
 * @description ���սӿڻ�ȷ��ҳ�����ݴ���
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-base', function(Y) {

/**
 * ȷ��ҳ�߼�
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * �����ݴ���
 * @module autoconfirm
 * @submodule autoconfirm-base
 */
    
    'use strict';
    
	var F = Y.Field;
	
	/**
     * �����ݴ����캯��
     * @class AutoConfirmBase
     * @constructor
     */
    function AutoConfirmBase() {}
    
    Y.mix(AutoConfirmBase, {
        
        /**
         * ��Ⱦģ��
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
			
			//�Ȱ󶨱�������
			F.Event.bind(insured);
			
			//����Ͷ�����뱻������ͬ��
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
         * ���͵�ַ����������б������� Hack
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
         * ��ʼ�����ػ�������
         * @method _initStorageData
         * @protected
         */
		_initStorageData: function() {
			var obj = {},
				form = Y.one('#J_atc_form').getDOMNode(),
				item,
				data;
			
			window['FORM_INIT_DATA'] = window['FORM_INIT_DATA'] || {};
			
			//���á�ͬ�������ˡ��ֶ�ͬ��
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
							
							//checkbox��ѡ�е�ʱ���Ϊ"checkbox=1,2,3"
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
         * �����û���¼�����������ػ���
         * @method _saveStorageData
         * @protected
         */
		_saveStorageData: function() {
		    
		    //ʹ��IO�е����л�����
			var serialize = Y.IO.prototype._serialize;
				
			try {
				Y.StorageLite.setItem('autoconfirmdata', tmpOrderId + '|' + serialize({ id: 'J_atc_form' }));
			} catch (err) {}
		},
		
		/**
         * ���������ϢУ�����������Ϣ��У���̨���������ǰ���Լ��ӣ�
         * @method _addDeliverValidateJSON
         * @protected
         */
		_addDeliverValidateJSON: function() {
		    window['Validator_JSON'] = Y.mix(window['Validator_JSON'] || {}, {
                'deliverName': {
                    'required': {
                        'errmsg': '�ռ�������������д�ռ���������'
                    },
                    'minSize': {
                        'num': '2',
                        'errmsg': '�ռ����������ռ������������� 2~20 ����֮�䡣'
                    },
                    'maxSize': {
                        'num': '20',
                        'errmsg': '�ռ����������ռ������������� 2~20 ����֮�䡣'
                    },
					'regx': {
						'expression': /^[\w\d\u4e00-\u9fa5]+$/,
						'errmsg': '�ռ����������ռ�������Ϊ���ġ���ĸ�����ֵ���ϡ�'
					}
                },
                'deliverMobile': {
                    'required': {
                        'errmsg': '�ռ����ֻ����룺����д�ռ����ֻ����롣'
                    },
                    'regx': {
                        'rule': 'number',
                        'errmsg': '�ռ����ֻ����룺����ȷ��д�ռ����ֻ����롣'
                    },
                    'length': {
                        'num': '11',
                        'errmsg': '�ռ����ֻ����룺����ȷ��д�ռ����ֻ����롣'
                    }
                },
                'townCityCode': {
                    'required': {
                        'errmsg': '�ռ��˵���������д�ռ��˵�����'
                    }
                },
                'deliverAddress': {
                    'required': {
                        'errmsg': '�ռ��˽ֵ���ַ������д�ռ��˽ֵ���ַ��'
                    },
					'regx': {
						'expression': /^[\#\-,��\w\d\u4e00-\u9fa5]+$/,
						'errmsg': '�ռ��˽ֵ���ַ���ֵ���ַΪ��Ӣ�ģ����֣���#������-������,���ȵ���ϣ�����Ϊȫ���֡�'
					}
                }
            });
		}
		
    }, false, null, 4);
    
    Y.AutoConfirmBase = AutoConfirmBase;
    
}, '0.0.1', {
    requires: ['node']
});
