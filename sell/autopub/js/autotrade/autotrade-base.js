/**
 * Y.AutoTradeBase
 * @description ������Ʒҳ���ƺ������ѡ��
 * @author huya.nzb@taobao.com
 * @date 2013-02-27
 * @version 0.0.1
 */
 
YUI.add('autotrade-base', function(Y) {

/**
 * ��Ʒҳ�߼�
 * @module autotrade
 * @main autotrade
 */

/**
 * ���ƺ������ѡ��
 * @module autotrade
 * @submodule autotrade-base
 */
    
	/**
     * ���ƺ������ѡ���캯��
     * @class AutoTradeBase
     * @for AutoTrade
     * @constructor
     */
    function AutoTradeBase() {}
    
	/**
     * DOM�ڵ㻺��Map
     * @property NODES
     * @static
     */
    AutoTradeBase.NODES = {
        carId: '#car_id',
        cityName: '#city_name',
        cityCode: '#city_code',
        newCar: '#new_car',
        newCarCon: '.at-newcar',
        newCarNote: '.at-carid .at-note',
        itemId: '#J_item_id',
        cityCon: '.at-city .at-iptcon',
        carIdCon: '.at-carid .at-iptcon',
        submitBtn: '#J_at_submit'
    };
    
    Y.mix(AutoTradeBase, {
        
		/**
         * ģ���ʼ��
         * @method initializer
         * @public
         */ 
        initializer: function() {
            this._nodes = {};
            this.publish('submit');
        },
        
		/**
         * ģ������
         * @method destructor
         * @public
         */ 
        destructor: function() {},
        
		/**
         * ��Ⱦģ��
         * @method render
		 * @chainable
         * @public
         */ 
        render: function() {
			try {
				this._params = Y.QueryString.parse(location.search.substring(1) || '');
			} catch (e) {}
			this._params = this._params || {};
            this._getNodeCached();
            this._renderAutoForm();
			return this;
        },
        
		/**
         * ��ȡDOM�ڵ㻺��
         * @method _getNodeCached
         * @protected
         */ 
        _getNodeCached: function() {
            var nodes = this._nodes;
            nodes['form'] = Y.one('#J_ins_detail form');
            Y.Object.each(AutoTradeBase.NODES, function(v, k) {
                if (Y.Lang.isArray(k)) {
                    nodes[k] = nodes['form'].all(v)
                } else {
                    nodes[k] = nodes['form'].one(v);
                }
            });
        },
        
		/**
         * ��Ⱦ�ύ��
         * @method _renderAutoForm
         * @protected
         */ 
        _renderAutoForm: function() {
            this._renderTranslator();
            this._renderCitySuggestion();
            this._bindAutoForm();
        },
        
		/**
         * ��Ⱦ����ѡ�����
         * @method _renderCitySuggestion
         * @protected
         */ 
        _renderCitySuggestion: function() {
            var search = this._parseSearchCity(),
                suggest = this._filterSuggestCity(search);
            
            //��ʼ���������    
            this.citySuggestion = new Y.AutoCitySuggestion({
                width: '360px',
                inputNode: '#city_name',
                cityCodeInputNode: '#city_code',
                provinceCodeInputNode: '#province_code',
                source: search,
				currentCityCode: this._params.cityCode || window['cityCode'],
                defParentNode: 'useOwnContainer',
                plugins: [{fn:Y.Plugin.AutoCompletePaginator, cfg: {pageSize: 8}}]
            });
            
            //�޸ĳ��ƺ�ǰ׺
            this.citySuggestion.on('citySelect', function(e) {
                var nodes = this._nodes,
                    raw = e.raw || {},
                    supportNewCar = raw.supportNewCar,
                    prefix = this.translator.translate(e.cityName),
                    carIdVal = Y.Lang.trim(nodes.carId.get('value'));
                
                if (prefix && carIdVal.indexOf(prefix) < 0) {
                    nodes.carId.setAttribute('data-prefix', prefix);
                    nodes.carId.set('value', prefix);
                }
                
                if (!supportNewCar) {
                    nodes.carIdCon.removeClass('at-iptcon-disabled');
                    nodes.carId.set('disabled', false);
                    nodes.newCar.set('checked', false);
                }
                
                nodes.newCarNote.setStyle('display', supportNewCar ? '' : 'none');
                nodes.newCarCon.toggleClass('hidden', !supportNewCar);
                
                //setTimeout(function() {
				nodes.carId.focus();
                //}, 100);
            }, this);
			
			//��ʼ����URL��������ֵ����ʱHack
			if (this._params['newCar']) {
				this._nodes.newCar.set('checked', true);
			}
			//��ʼ����URL��������ֵ����ʱHack
			if (this._params['carId']) {
				this._nodes.carId.set('value', this._params['carId']);
			}
			
            //��Ⱦ�������
            this.citySuggestion.render();
        },
        
		/**
         * ����֧�ֳ����б�
         * @method _parseSearchCity
		 * @return {Array} search ���س����б�����
         * @protected
         */ 
        _parseSearchCity: function() {
            var data = window.AutoTradeCityData || '',
                search = [],
                item;
            
            if (typeof data == 'string') {
                data = data.split('��');
            }
            while (data && data.length) {
                item = data.shift();
                if (item) {
                    item = item.split('��');
                    search.push({
                        cityName: item[0],
                        cityCode: item[1],
                        py: item[2],
                        spy: item[3],
                        supportNewCar: Number(item[4])
                    });
                }
            }
            
            return search;
        },
        
		/**
         * �������ų����б�
         * @method _filterSuggestCity
		 * @return {Array} suggest �������ų����б�����
         * @protected
         */ 
        _filterSuggestCity: function(search) {
            var suggest = window.CitySuggestionData && window.CitySuggestionData.suggest,
                panelGroup, cityGroup, cityData, cityName, group, i, j;
            
            function getCityData(name) {
                var data = null;
                Y.Array.some(search, function(city) {
                    if (city.cityName.indexOf(name) === 0) {
                        data = Y.merge(city);
                        data.cityName = name;
                        return true;
                    }
                }, this);
                return data;
            }
            
            if (suggest && Y.Lang.isArray(suggest)) {
                Y.Array.each(suggest, function(pgroup) {
                    j = 0;
                    panelGroup = pgroup['panelGroup'];
                    while (j < panelGroup.length) {
                        i = 0;
                        cityGroup = panelGroup[j]['cityGroup'];
                        while (i < cityGroup.length) {
                            cityData = getCityData(cityGroup[i].cityName);
                            if (cityData) {
                                cityGroup[i] = cityData;
                                i++;
                            } else {
                                cityGroup.splice(i, 1);
                            }
                        }
                        if (cityGroup.length) {
                            j++;
                        } else {
                            panelGroup.splice(j, 1);
                        }
                    }
                }, this);
            }
            return suggest;    
        },
        
		/**
         * ��Ⱦ���ƺ������ת�����
         * @method _renderTranslator
         * @protected
         */ 
        _renderTranslator: function() {
            this.translator = new Y.CarIdTranslator(Y.CarIdTranslator.Data);
        },
        
		/**
         * �󶨱�����¼�
         * @method _bindAutoForm
         * @protected
         */ 
        _bindAutoForm: function() {
            var _this = this,
				nodes = this._nodes,
                citySuggestion = this.citySuggestion;
            
            //У�鳵����ʻ����
            nodes.cityName.on('focus', function(e) {
                this._toggleItemErr(nodes.cityCon, true);
            }, this);
            nodes.cityName.on('blur', function(e) {
                if (!citySuggestion.AC._mouseOverList) {
                    this._validateCity();
                }
            }, this);
            citySuggestion.AC.after('visibleChange', function(e) {
                if (!e.newVal && !nodes.cityCon.hasClass('yui3-autocitysuggestion-focused')) {
                    this._validateCity();
                }
            }, this);
            
            //���ƺű߿�focus, blur, hover״̬��ʽ��У��
            nodes.carId.on('hover', function(e) {
                nodes.carIdCon.addClass('at-iptcon-hovered');
            }, function(e) {
                nodes.carIdCon.removeClass('at-iptcon-hovered');
            });
            nodes.carId.on('focus', function(e) {
                nodes.carIdCon.addClass('at-iptcon-focused');
                this._toggleItemErr(nodes.carIdCon, true);
            }, this);
            nodes.carId.on('blur', function(e) {
                nodes.carIdCon.removeClass('at-iptcon-focused');
                this._validateCarId();
            }, this);
			
			function toggleNewCar(focus) {
				var checked = nodes.newCar.get('checked')
					prefix = nodes.carId.getAttribute('data-prefix');
				
                nodes.carIdCon.toggleClass('at-iptcon-disabled', checked);
				if (checked && prefix) {
					nodes.carId.set('value', prefix + '*');
				}
                nodes.carId.set('disabled', checked);
                _this._toggleItemErr(nodes.carIdCon, true);
                if (focus && !checked) {
                    nodes.carId.focus();
                } 
			}
            
            //����³�δ����У��
            nodes.newCar.on('click', function(e) {
                toggleNewCar(true);
            });
			toggleNewCar();
            
            //���ύ
            function onFormSubmit(e) {
                var _this = this,
                    valid = true,
                    nodes = this._nodes;
                    
                e && e.preventDefault();
                valid = this._validateCity() && valid;
                valid = this._validateCarId() && valid;
                
                if (valid) {
					// ��У��ͨ��������submit�¼�����AutoTradeStepManager�б�����
                    function fireSubmit() {
                        _this.fire('submit', {
                            cityCode: nodes.cityCode.get('value'),
                            cityName: Y.Lang.trim(nodes.cityName.get('value')).replace(/-/g, ''), // ���ƺŹ��ˡ�-������
                            cityPrefix: nodes.carId.getAttribute('data-prefix'),
                            carId: Y.Lang.trim(nodes.carId.get('value')),
                            newCar: nodes.newCar.get('checked'),
                            itemId: nodes.itemId.get('value')
                        });
                    }
                    Y.CheckLogin.check(function(isLogin) {
                        if (isLogin) {
                            fireSubmit();
                        }
                    }, this);
                   //fireSubmit();
                }
            }
            nodes.form.on('submit', onFormSubmit, this);
            nodes.submitBtn.on('click', onFormSubmit, this);
			
			//��URLֱ�Ӵ�����ֵ����ʱHack
			if (this._params['cityCode'] && (this._params['carId'] || this._params['newCar'])) {
				nodes.carId.blur();
				onFormSubmit.call(this);
			}
        },
        
		/**
         * У������ֶ�
         * @method _validateCity
		 * @return {Boolean} valid
         * @protected
         */ 
        _validateCity: function() {
            var nodes = this._nodes,
                cityCodeVal = nodes.cityCode.get('value'),
                valid = false;
            
            if (cityCodeVal) { valid = true; }
            
            this._toggleItemErr(nodes.cityCon, valid);
            
            return valid;
        },
        
		/**
         * У�鳵�ƺ��ֶ�
         * @method _validateCarId
		 * @return {Boolean} valid
         * @protected
         */ 
        _validateCarId: function() {
            var nodes = this._nodes,
                carIdPattern = /^([\u4e00-\u9fa5]|(wj)){1}([a-zA-Z]){1}([a-z0-9A-Z]){4,6}$/,
				prefix = ['wj', 'WJ', '��', '��', '��', '��', '��', '��', '��', '��', '��', '��','��'],
                valid = true,
                carIdVal;
			
			//ƽ����̨��Ҫ��ȥ����-��
            nodes.carId.set('value', nodes.carId.get('value').replace(/-/g, ''));
			carIdVal = Y.Lang.trim(nodes.carId.get('value'));
            
            if (!nodes.newCar.get('checked')) {
				if (carIdVal && carIdPattern.test(carIdVal)) {
					for (var i = 0; i < prefix.length; i++) {
						if (carIdVal.indexOf(prefix[i]) == 0) {
							valid = false;
							break;
						}
					}
				} else {
					valid = false;
				}
            }
            
            this._toggleItemErr(nodes.carIdCon, valid);
            
            return valid;
        },
        
		/**
         * ����У����
         * @method _toggleItemErr
         * @protected
         */ 
        _toggleItemErr: function(con, valid) {
            var err = con.next('.at-err'),
                note = con.next('.at-note');
            
            err.toggleClass('hidden', valid);
            note.toggleClass('hidden', !valid);
        }
            
    }, false, null, 4);
    
    Y.AutoTradeBase = AutoTradeBase;
    
}, '0.0.1', {
    requires: ['stepmanager', 'step', 'overlay', 'autocitysuggestion', 'autocomplete-paginator', 'caridtranslator', 'check-login']
});