/**
 * Y.StepInfo
 * @description ������Ϣ¼�벽��
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-info', function(Y) {

/**
 * ������Ϣ¼�벽��
 * @module step-info
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="step-elem-list"></ul>',
	
		//ͨ���ֶ�ģ��
        ELEM_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">{label}</label>',
                '<div class="step-elem-content">',
                    '<input type="text" data-name="{type}" maxlength="{max}" class="step-elem-text elem-value" id="{id}" />',
                '</div>',
				'<p class="step-elem-error hidden"></p>',
            '</li>'
        ].join(''),
		
		//Ʒ���ͺ�ģ��
        MODELID_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">{label}</label>',
                '<div class="step-elem-content">',
                    '<input type="text" data-name="modelName" placeholder="�������ѯ�ͺ�" class="step-elem-text elem-value" id="{id}" />',
                    '<input type="hidden" data-name="modelId" class="modelid-value elem-value" />',
                '</div>',
				'<p class="step-elem-error hidden"></p>',
            '</li>'
        ].join(''),
		
		//ע��Ǽ�����ģ��
        REGISTER_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">ע��Ǽ�����</label>',
                '<div class="step-elem-content">',
                    '<div class="ins-g step-elem-selectcon">',
                        '<span class="ins-u">',
                            '<select class="register-year" id="{id}"></select>',
                        '</span>',
                        '<span class="ins-u">��</span>',
                        '<span class="ins-u">',
                            '<select class="register-month"></select>',
                        '</span>',
                        '<span class="ins-u">��</span>',
                    '</div>',
                    '<input type="hidden" data-name="{type}" class="elem-value" />',
                '</div>',
            '</li>'
        ].join(''),
		
		//������ģ��
        SEATS_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">{label}</label>',
                '<div class="step-elem-content">',
                    '<div class="ins-g step-elem-selectcon">',
                        '<span class="ins-u">',
                            '<select id="{id}" data-name="{type}" class="elem-value"></select>',
                        '</span>',
                    '</div>',
                '</div>',
            '</li>'
        ].join(''),
		
		//�Ƿ������ģ��
		CAR_FLAG_TEMPLATE = [
			'<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
				'<label class="step-elem-label" for="{id}">{label}</label>',
				'<div class="step-elem-content">',
					'<div class="ins-g step-elem-radiocon">',
						'<label class="ins-u"><input type="radio" name="id" class="step-elem-radio" value="1" />��</label>',
						'<label class="ins-u"><input type="radio" name="id" class="step-elem-radio" value="0" checked="checked" />��</label>',
					'</div>',
                '</div>',
            '</li>'
		].join(''),
		
		//�ֶ�����������λ��
		MAX_MAP = {
			name: '30',
            model: '64',
            frameNo: '17',
            engineNo: '20'
		},
        
		//�ֶζ�Ӧ����
        LABEL_MAP = {
			name: '��������',
            modelId: 'Ʒ���ͺ�',
            model: 'Ʒ���ͺ�',
            registerDate: 'ע��Ǽ�����',
            frameNo: '���ܺ�',
            engineNo: '��������',
            seats: '������',
			specialCarFlag: '�Ƿ������',
			specialCarDate: '��������'
        },
        
		//�����ֶ���Ⱦ����
        RENDER_FN = {
            registerDate: '_renderRegisterDate',
            modelId: '_renderModelId',
			specialCarFlag: '_renderCarFlag',
            seats: '_renderSeats'
        };
    
	//TODO
	//�ֶ�ͨ�ÿؼ���
	
	/**
     * ������Ϣ¼�벽�蹹�캯��
     * @class StepInfo
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
	 * @uses StepAjax
	 * @uses StepValidate
     * @constructor
     */
    Y.StepInfo = Y.Base.create('step-info', Y.Step, [
        Y.StepStdMod,
        Y.StepLoad,
        Y.StepAjax,
        Y.StepValidate
    ], {
        
		/**
         * ��������
         * @method destructor
         * @public
         */
        destructor: function() {
            this.vehicleSearch && this.vehicleSearch.destroy();
			if (this._specialCarCalendar) {
				//���������bug�������Ƴ���û�н��document onclick -> hide���¼���
				this._specialCarCalendar.con.empty(true);
                this._specialCarCalendar = null;
                delete this._specialCarCalendar;
			}
        },
        
		/**
         * ��Ⱦ����ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������ 
         * @public
         */
        render: function(container, config) {
            this.data = config.data || {};
            this._elems = {};
            this._renderInfoList();
            this._renderVehicle();
			this._renderCardImg();
			this._renderSpecialCar();
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
				
				//��������
				'.elem-name input': {
					required: {
						error: '����д����'
					},
					custom: {
						error: '������д����ȷ',
						fn: function(v) {
							if (v.length < 2 || v.length > 30) {
								return false;
							}
							return true;
						}
					}
				},
				
				//���ܺ�
				'.elem-frameno input': {
					required: {
						error: '����д���ܺ�'
					},
					custom: {
						error: '���ܺŸ�ʽ����ȷ',
						fn: function(v) {
							if (v.length < 4 || v.length > 17) {
								return false;
							}
							if (/.*([a-zA-Z]|\d|\*)$/.test(v)) {
								return true;
							}
							return false;
						}
					}
				},
				
				//��������
				'.elem-engineno input': {
					required: {
						error: '����д��������'
					},
					custom: {
						error: '�������Ÿ�ʽ����ȷ',
						fn: function(v) {
							if (v.length < 4 || v.length > 20) {
								return false;
							}
							if (/[\u4e00-\u9fa5]+/.test(v)) {
								return false;
							}
							return true;
						}
					}
				},
				
				//Ʒ���ͺ�
				'.elem-model input': {
					required: {
						error: '����дƷ���ͺ�'
					},
					custom: {
						error: 'Ʒ���ͺŸ�ʽ����ȷ',
						fn: function(v) {
							if (v.length > 64) {
								return false;
							}
							if (/[\u4e00-\u9fa5]+/.test(v)) {
								return false;
							}
							return true;
						}
					}
				},
				
				//�����������Ʒ���ͺ�
				'.elem-modelid input': {
					required: {
						error: 'Ʒ���ͺŲ���Ϊ��',
						placeholder: '�������ѯ�ͺ�'
					},
					custom: {
						error: '��ѡ��Ʒ���ͺ�',
						fn: function(v) {
							var elem = this,
								modelId = elem.next('input');
							
							if (modelId.get('value') === '') {
								return false;
							} else {
								return true;
							}
						}
					}
				}
			});
		},
        
		/**
         * ��Ⱦ�ֶ��б�
         * @method _renderInfoList
         * @protected
         */
        _renderInfoList: function() {
            var list = Y.Node.create(LIST_TEMPLATE),
                inputs = this.data.inputs || [],
				arr,
				prefix,
                name,
				elem;

			this.get('body').append(list);
			
            Y.Array.each(inputs, function(item) {
				arr = item.name.split('.');
                prefix = arr[0];
                name = arr[1];
				if (name != 'specialCarDate') {
					this._elems[name] = 1;
					list.append(this._renderInfoElem(name, prefix));
					if (name == 'specialCarFlag') {
						this._elems['specialCarDate'] = 1;
						elem = this._renderInfoElem('specialCarDate', prefix);
						elem.addClass('hidden');
						list.append(elem);
					}
				}
            }, this);
        },
        
		/**
         * ��Ⱦ�ֶ�Ԫ��
         * @method _renderInfoElem
		 * @param {String} type �ֶ�����
		 * @param {String} prefix �ֶ�ǰ׺
         * @protected
         */
        _renderInfoElem: function(type, prefix) {
            var cls = 'elem-' + type.toLowerCase(),
                label = LABEL_MAP[type],
				max = MAX_MAP[type] || '',
                renderFn = RENDER_FN[type];
            
            if (renderFn) {
                return this[renderFn]({
					prefix: prefix,
                    type: type,
                    cls: cls,
					max: max,
                    label: label,
					id: Y.guid()
                });
            } else {
                return label && Y.Node.create(Y.Lang.sub(ELEM_TEMPLATE, {
					prefix: prefix,
                    label: label,
                    type: type,
                    cls: cls,
					max: max,
                    id: Y.guid()
                }));
            }
        },
        
		/**
         * ��ȾƷ���ͺ�
         * @method _renderInfoElem
		 * @param {Object} data �ֶ�����
		 * @return {Node} elem �ֶνڵ�
         * @protected
         */
        _renderModelId: function(data) {
            var elem = Y.Node.create(Y.Lang.sub(MODELID_TEMPLATE, data));
            return elem;
        },
        
		/**
         * ��Ⱦע������
         * @method _renderRegisterDate
		 * @param {Object} data �ֶ�����
		 * @return {Node} elem �ֶνڵ�
         * @protected
         */
        _renderRegisterDate: function(data) {
            var elem = Y.Node.create(Y.Lang.sub(REGISTER_TEMPLATE, data)),
                yearSelect = elem.one('.register-year'),
                monthSelect = elem.one('.register-month'),
                input = elem.one('input'),
                now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth() + 1;
                
            function buildYear() {
                for (var i = year; i > year - 30; i--) {
                    yearSelect._node.add(new Option(i, i), undefined);
                }
                 yearSelect._node.options[0].selected = true;
            }
            
            function buildMonth(y, selected) {
                var max = (parseInt(y, 10) == year) ? month : 12,
                    s = parseInt(selected || 1, 10);
                
                monthSelect._node.innerHTML = '';
                for (var i = 1; i <= max; i++) {
                    if (i < 10) {
                        i = '0' + i;
                    }
                    monthSelect._node.add(new Option(i, i), undefined);
                }
                if (s > max) {
                    monthSelect._node.options[0].selected = true;
                } else {
                    monthSelect._node.options[s - 1].selected = true;
                }
                update();
            }
            
            function update() {
                input.set('value', yearSelect.get('value') + '-' + monthSelect.get('value'));
            }
            
            yearSelect.on('change', function(e) {
                buildMonth(e.target.get('value'), monthSelect.get('value'));
            });
            
            buildYear();
            buildMonth(year, month);
            
            return elem;
        },
        
		/**
         * ��Ⱦ������
         * @method _renderSeats
		 * @param {Object} data �ֶ�����
		 * @return {Node} elem �ֶνڵ�
         * @protected
         */
        _renderSeats: function(data) {
            var elem = Y.Node.create(Y.Lang.sub(SEATS_TEMPLATE, data)),
                select = elem.one('select').getDOMNode();
            
            for (var i = 1; i < 10; i++) {
                select.add(new Option(i, i), undefined);
            }
            select.options[4].selected = true;
            
            return elem;
        },
        
		/**
         * ��ȾƷ���ͺ������������
         * @method _renderVehicle
         * @protected
         */
        _renderVehicle: function() {
            if (this._elems['modelId']) {
                var modelName = this.get('body').one('.elem-modelid input'),
					modelInput = this.get('body').one('.elem-modelid .modelid-value');
                this.vehicleSearch = new Y.Vehicle({
                    inputNode: modelName,
                    defParentNode: 'body',
					useTaxPrice: (this.data.useTaxPrice == '1'),
                    zIndex: 300000,
                    render: true
                });
                this.vehicleSearch.AC.after('select', function(e) {
                    modelInput.set('value', e.result.raw.vehicle_id);
                }, this);
				this.vehicleSearch.AC.on('query', function(e) {
                    modelName.addClass('modelid-loading');  
                });
				this.vehicleSearch.AC.on('results', function(e) {
                    modelName.removeClass('modelid-loading');  
                });
                this.vehicleSearch.AC.on(['query', 'clear', 'results'], function(e) {
                    modelInput.set('value', '');   
                });
            }
        },
		
		/**
         * ��Ⱦ��������
         * @method _renderSpecialCar
         * @protected
         */
		_renderSpecialCar: function() {
			if (!this._elems['specialCarFlag']) { return; }
			
			var carFlagInputs = this.get('body').all('.elem-specialcarflag input'),
				carDate = this.get('body').one('.elem-specialcardate'),
				carDateInput = carDate.one('input'),
				now = new Date();
			
			function getCarFlag() {
				var val = '0';
				carFlagInputs.each(function(item) {
					if (item.get('checked')) {
						val = item.get('value');
					}
				});
				return val;
			}
			
			function check() {
				var val = Number(getCarFlag());
				carDate.toggleClass('hidden', !val);
				this._specialCarCalendar.hide();
			}
			
			function formatDate(d) {
                var _Y = d.getFullYear(),
                    _M = d.getMonth() + 1,
                    _D = d.getDate();
                    
                return _Y + '-' + (_M < 10 ? '0' + _M : _M) + '-' + (_D < 10 ? '0' + _D : _D);
            }
			
			carDateInput.set('value', formatDate(now));
			carDateInput.setAttribute('readonly', 'readonly');
			
			this._specialCarCalendar = new Y.Calendar(carDateInput.getAttribute('id'), {
                date: now,
                selected: now,
                maxdate: now,
                action: ['click', 'focus'],
                popup: true,
                closeable: true
            }).on('select', function(d) {
                carDateInput.set('value', formatDate(d));
            });
			
			this._specialCarCalendar.con.setStyle('zIndex', '200001');
			
			this.on(['back', 'forward'], function() {
				this._specialCarCalendar.hide();
			});
			
			carFlagInputs.on('click', check, this);
			check.call(this);
			this._getCarFlag = getCarFlag;
		},
		
		/**
         * ��Ⱦ�Ƿ������
         * @method _renderSpecialCar
		 * @param {Object} data �ֶ�����
		 * @return {Node} elem �ֶνڵ�
         * @protected
         */
		_renderCarFlag: function(data) {
			var elem = Y.Node.create(Y.Lang.sub(CAR_FLAG_TEMPLATE, data));
			return elem;
		},
		
		/**
         * ��Ⱦ��ʾͼƬ
         * @method _renderCardImg
         * @protected
         */
		_renderCardImg: function() {
			var _this = this,
				body = this.get('body'),
				list = body.one('.step-elem-list'),
				imgCon = Y.Node.create('<div class="elem-card-img hidden"><span></span><div></div></div>'),
				imgArr = imgCon.one('span'),
				imgBd = imgCon.one('div').getDOMNode();
			
			function posImg(target) {
				var parent = target.ancestor('.step-elem'),
					cls = 'elem-' + parent.getAttribute('data-type').toLowerCase() + '-img';
					
				imgBd.className = cls;
				imgCon.removeClass('hidden');
				
				var region = parent.get('region'),
					listTop = list.get('region').top,
					imgArrTop = region.top + (region.height - 11) / 2,
					imgConTop = (imgArrTop - listTop) > 130 ? imgArrTop - 130 : listTop;
				
				imgCon.setStyle('top', imgConTop - listTop + 20);
				imgArr.setXY([null, imgArrTop]);
			}
			
			imgCon.appendTo(body);
			body.all('.elem-model,.elem-registerdate,.elem-frameno,.elem-engineno').each(function(node) {
				var elems = node.all('input,select');
				elems.on('focus', function(e) {
					posImg.call(_this, e.target);
				});
				elems.on('blur', function() {
					imgCon.addClass('hidden');
				});
			}, this);
		},
        
		/**
         * �󶨵���������۰�ť
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
		
			var valid = this.validate();
			if (!valid) { return; }
			
            var elems = this.get('body').all('.elem-value'),
                map = {
                    flowId: this.data.flowId,
                    orderId: this.data.orderId
                },
				prefix,
                type,
				name,
                value;
            
			if (this._elems['specialCarFlag']) {
				map['bizQuote.specialCarFlag'] = this._getCarFlag();
			}

            elems.each(function(item) {
				prefix = item.ancestor('.step-elem').getAttribute('data-prefix');
				name = item.getAttribute('data-name');
				type = prefix + '.' + name;
				value = Y.Lang.trim(item.get('value'));
                map[type] = value;
            });
			
			this.ajaxSaveInputInfo(map);           
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
                value: '����дͶ��������Ϣ'
            },
			
			/**
			 * @attribute note
			 * @description �������ע��
			 * @type String
			 */
            note: {
                value: '�������ڳ�����ʻ֤�����걣���ҵ�������Ϣ'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate', 'vehicle']
});
