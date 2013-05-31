/**
 * Y.StepInfo
 * @description 车辆信息录入步骤
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-info', function(Y) {

/**
 * 车辆信息录入步骤
 * @module step-info
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="step-elem-list"></ul>',
	
		//通用字段模板
        ELEM_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">{label}</label>',
                '<div class="step-elem-content">',
                    '<input type="text" data-name="{type}" maxlength="{max}" class="step-elem-text elem-value" id="{id}" />',
                '</div>',
				'<p class="step-elem-error hidden"></p>',
            '</li>'
        ].join(''),
		
		//品牌型号模板
        MODELID_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">{label}</label>',
                '<div class="step-elem-content">',
                    '<input type="text" data-name="modelName" placeholder="请输入查询型号" class="step-elem-text elem-value" id="{id}" />',
                    '<input type="hidden" data-name="modelId" class="modelid-value elem-value" />',
                '</div>',
				'<p class="step-elem-error hidden"></p>',
            '</li>'
        ].join(''),
		
		//注册登记日期模板
        REGISTER_TEMPLATE = [
            '<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
                '<label class="step-elem-label" for="{id}">注册登记日期</label>',
                '<div class="step-elem-content">',
                    '<div class="ins-g step-elem-selectcon">',
                        '<span class="ins-u">',
                            '<select class="register-year" id="{id}"></select>',
                        '</span>',
                        '<span class="ins-u">年</span>',
                        '<span class="ins-u">',
                            '<select class="register-month"></select>',
                        '</span>',
                        '<span class="ins-u">月</span>',
                    '</div>',
                    '<input type="hidden" data-name="{type}" class="elem-value" />',
                '</div>',
            '</li>'
        ].join(''),
		
		//车座数模板
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
		
		//是否过户车模板
		CAR_FLAG_TEMPLATE = [
			'<li data-type="{type}" data-prefix="{prefix}" class="step-elem {cls}">',
				'<label class="step-elem-label" for="{id}">{label}</label>',
				'<div class="step-elem-content">',
					'<div class="ins-g step-elem-radiocon">',
						'<label class="ins-u"><input type="radio" name="id" class="step-elem-radio" value="1" />是</label>',
						'<label class="ins-u"><input type="radio" name="id" class="step-elem-radio" value="0" checked="checked" />否</label>',
					'</div>',
                '</div>',
            '</li>'
		].join(''),
		
		//字段输入框输入最长位数
		MAX_MAP = {
			name: '30',
            model: '64',
            frameNo: '17',
            engineNo: '20'
		},
        
		//字段对应名称
        LABEL_MAP = {
			name: '车主姓名',
            modelId: '品牌型号',
            model: '品牌型号',
            registerDate: '注册登记日期',
            frameNo: '车架号',
            engineNo: '发动机号',
            seats: '车座数',
			specialCarFlag: '是否过户车',
			specialCarDate: '过户日期'
        },
        
		//特殊字段渲染函数
        RENDER_FN = {
            registerDate: '_renderRegisterDate',
            modelId: '_renderModelId',
			specialCarFlag: '_renderCarFlag',
            seats: '_renderSeats'
        };
    
	//TODO
	//字段通用控件化
	
	/**
     * 车辆信息录入步骤构造函数
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
         * 析构函数
         * @method destructor
         * @public
         */
        destructor: function() {
            this.vehicleSearch && this.vehicleSearch.destroy();
			if (this._specialCarCalendar) {
				//日历组件的bug，容器移除后没有解除document onclick -> hide的事件绑定
				this._specialCarCalendar.con.empty(true);
                this._specialCarCalendar = null;
                delete this._specialCarCalendar;
			}
        },
        
		/**
         * 渲染步骤结构
         * @method render
		 * @param {Node} container 步骤容器
		 * @param {Object} config 组件初始化参数 
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
            
            this.addButton('step-btn-continue', '继续报价', this._onContinueClick);
        },
		
		/**
         * 初始化校验规则
         * @method _initValidate
         * @protected
         */
		_initValidate: function() {
			this.setValidateConfig({
				
				//车主姓名
				'.elem-name input': {
					required: {
						error: '请填写姓名'
					},
					custom: {
						error: '姓名填写不正确',
						fn: function(v) {
							if (v.length < 2 || v.length > 30) {
								return false;
							}
							return true;
						}
					}
				},
				
				//车架号
				'.elem-frameno input': {
					required: {
						error: '请填写车架号'
					},
					custom: {
						error: '车架号格式不正确',
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
				
				//发动机号
				'.elem-engineno input': {
					required: {
						error: '请填写发动机号'
					},
					custom: {
						error: '发动机号格式不正确',
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
				
				//品牌型号
				'.elem-model input': {
					required: {
						error: '请填写品牌型号'
					},
					custom: {
						error: '品牌型号格式不正确',
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
				
				//带搜索建议的品牌型号
				'.elem-modelid input': {
					required: {
						error: '品牌型号不能为空',
						placeholder: '请输入查询型号'
					},
					custom: {
						error: '请选择品牌型号',
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
         * 渲染字段列表
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
         * 渲染字段元素
         * @method _renderInfoElem
		 * @param {String} type 字段类型
		 * @param {String} prefix 字段前缀
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
         * 渲染品牌型号
         * @method _renderInfoElem
		 * @param {Object} data 字段数据
		 * @return {Node} elem 字段节点
         * @protected
         */
        _renderModelId: function(data) {
            var elem = Y.Node.create(Y.Lang.sub(MODELID_TEMPLATE, data));
            return elem;
        },
        
		/**
         * 渲染注册日期
         * @method _renderRegisterDate
		 * @param {Object} data 字段数据
		 * @return {Node} elem 字段节点
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
         * 渲染车座数
         * @method _renderSeats
		 * @param {Object} data 字段数据
		 * @return {Node} elem 字段节点
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
         * 渲染品牌型号搜索建议组件
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
         * 渲染过户日期
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
         * 渲染是否过户车
         * @method _renderSpecialCar
		 * @param {Object} data 字段数据
		 * @return {Node} elem 字段节点
         * @protected
         */
		_renderCarFlag: function(data) {
			var elem = Y.Node.create(Y.Lang.sub(CAR_FLAG_TEMPLATE, data));
			return elem;
		},
		
		/**
         * 渲染提示图片
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
         * 绑定点击继续报价按钮
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
                value: '请填写投保车辆信息'
            },
			
			/**
			 * @attribute note
			 * @description 步骤标题注释
			 * @type String
			 */
            note: {
                value: '您可以在车辆行驶证或上年保单找到以下信息'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate', 'vehicle']
});
