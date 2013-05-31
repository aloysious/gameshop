/**
 * autocitysuggestion
 * AutoCitySuggestion 城市选择组件
 * @author 虎牙 huya.nzb@taobao.com
 * @date 2013-03-06
 * @version 2.0
 */

/**
 * 城市选择组件
 *
 * @module autocitysuggestion
 */
YUI.add('autocitysuggestion', function(Y) {
	
	Y.Base.mix(Y.AutoComplete, [Y.WidgetStack]);
	
	//3.5.0后源码中的判断条件boundingBox.one(target.get('id'))低级bug，缺少'#'
	if (Y.AutoComplete.prototype._afterDocClick) {
		Y.AutoComplete.prototype._afterDocClick = function (e) {
			var boundingBox = this._boundingBox,
				target      = e.target;

			if (target !== this._inputNode && target !== boundingBox &&
					!boundingBox.one('#' + target.get('id'))) {
				
				this.hide();
			}
		};
	}
	
	if (YUI.version.indexOf('3.4.') > -1) {
		Y.AutoComplete.prototype._afterMouseOut = function() {
			this._mouseOverList = false;
			this._set('hoveredItem', null);
		}
	}
	
	//城市查询列表及热门城市列表
	window['CitySuggestionData'] = window['CitySuggestionData'] || {};
	CitySuggestionData.search = CitySuggestionData.search || [];
	CitySuggestionData.suggest = CitySuggestionData.suggest || [];
	
	var FILTER_TEXT = ['cityName', 'py', 'spy'],
		HIGHLIGHT_TEXT = ['cityName', 'py'],
		
		DOT = '.',
		CLS_SUGGEST = 'yui3-acsuggest',
		CLS_SUGGEST_TAB = CLS_SUGGEST + '-tab',
		CLS_SUGGEST_TAB_ITEM = CLS_SUGGEST + '-tab-item',
		CLS_SUGGEST_TAB_SELECTED = CLS_SUGGEST + '-tab-selected',
		CLS_SUGGEST_NOTE = CLS_SUGGEST + '-note',
		CLS_SUGGEST_PANEL = CLS_SUGGEST + '-panel',
		CLS_SUGGEST_CONTENT = CLS_SUGGEST + '-content',
		
		FORMAT_TEMPLATE = '<span class="yui3-aclist-cityname">{cityName}</span><span class="yui3-aclist-py">{py}</span>',
		SUGGEST_NODE_TEMPLATE = '<div class="' + CLS_SUGGEST + '"></div>',
		SUGGEST_NOTE_TEMPLATE = '<div class="' + CLS_SUGGEST_NOTE + '"><p class="note-support">支持汉字/拼音/首字母输入查询</p><p class="note-city">县级市也可以投保，请选择所属地级市</p></div>',
		SUGGEST_TAB_TEMPLATE = '<ul class="' + CLS_SUGGEST_TAB + '"><li class="' + CLS_SUGGEST_TAB_ITEM + '">热门城市</li><li class="' + CLS_SUGGEST_TAB_ITEM + '">ABCDEFGH</li><li class="' + CLS_SUGGEST_TAB_ITEM + '">IJKLMNOP</li><li class="' + CLS_SUGGEST_TAB_ITEM + '">QRSTUVWXYZ</li></ul>',
		SUGGEST_CONTENT_TEMPLATE = '<div class="' + CLS_SUGGEST_CONTENT + '"></div>',
		SUGGEST_PANEL_TEMPLATE = '{{#suggest}}<div class="' + CLS_SUGGEST_PANEL + '"><xmp class="yui3-mytabview-lazyload hidden">{{#panelGroup}}<dl><dt>{{groupName}}</dt>{{#cityGroup}}<dd><a href="javascript:void(0);" cityCode="{{cityCode}}" hideFocus="true" provinceCode="{{provinceCode}}">{{cityName}}</a></dd>{{/cityGroup}}</dl>{{/panelGroup}}</xmp></div>{{/suggest}}';
    
	//默认结果显示函数
	function _defResultTextLocator(result) {
		return (result && result.cityName && result.cityName.replace(/市$/, '')) || '';
	}
	
    //默认结果筛选函数
	function _defResultFilters(query, results) {
		query = query.toLowerCase();
		return Y.Array.filter(results, function (result) {
			var raw = result.raw,
				item = '';
				
			for (var i = 0, l = FILTER_TEXT.length; i < l; i++) {
				item = raw[FILTER_TEXT[i]] || '';
				if (item.toLowerCase().indexOf(query) === 0) {
					return true;
				}
			}
			return false;
		});
	}
	
    //默认结果高亮函数
	function _defResultHighlighter(query, results) {
		query = query.toLowerCase();
		return Y.Array.map(results, function (result) {
			var highlighted = {},
				raw = result.raw,
				item = '';
				
			for (var i = 0, l = HIGHLIGHT_TEXT.length; i < l; i++) {
				item = raw[FILTER_TEXT[i]] || '';
				if (FILTER_TEXT[i] == 'cityName') {
					item = item.replace(/市$/, '');
				}
				highlighted[HIGHLIGHT_TEXT[i]] = item.replace(query, '<b class="yui3-ac-highlight">' + query + '</b>');
			}
			return highlighted;
		});
	}
	
    //默认结果格式化函数
	function _defResultFormatter(query, results) {
		return Y.Array.map(results, function (result) {
			var highlighted = result.highlighted;
			return Y.Lang.sub(FORMAT_TEMPLATE, highlighted);
		});
	}
	
	function getClassName(name) {
	    if (name) {
            return Y.ClassNameManager.getClassName(CitySuggestion.NAME, name);
        } else {
            return Y.ClassNameManager.getClassName(CitySuggestion.NAME);
        }
    }
	
    
    /**
     * @class CitySuggestion
     * 城市选择组件构造函数
     * @module CitySuggestion
     */
	function CitySuggestion(cfg) {
		CitySuggestion.superclass.constructor.apply(this, arguments);
        CitySuggestion._instances[Y.stamp(this)] = this;
    }
    
	/**
     *  ------------------------ Public Static Properties ---------------------
     */
	
    CitySuggestion._currentCityCode = CitySuggestionData.current || window['cityCode'];
    //CitySuggestion._currentCityData = null;
    
	CitySuggestion._instances = {};
    
    CitySuggestion._documentClickEvent = null;

    CitySuggestion._ownContainer = null;
    
    //全局Document Click回调，不需要每个实例都绑定一次
    CitySuggestion._onDocumentClick = function(e) {
        Y.Object.each(CitySuggestion._instances, function(instance) {
            instance._onDocumentClick.call(instance, e);
        });
    };
    
    CitySuggestion.DEF_CONFIG = {
        //width: '300px',
        width: '318px',
        shim: true,
        source: CitySuggestionData.search,
        activateFirstItem: true,    
        scrollIntoView: false,
        resultTextLocator: _defResultTextLocator,
        resultFilters: _defResultFilters,
        resultHighlighter: _defResultHighlighter,
        resultFormatter: _defResultFormatter
    };
    
	CitySuggestion.NAME = 'autocitysuggestion';
	
	CitySuggestion.ATTRS = {
		inputNode: {
			value: null,
			setter: Y.one
		},
		cityCodeInputNode: {
			value: null,
			setter: Y.one
		},
		provinceCodeInputNode: {
			value: null,
			setter: Y.one
		},
        defParentNode: {
            value: null,
            setter: Y.one
        },
		focusAfterSelect: {
			value: false
		},
        render: {
            value: false
        },
        suggest: {
            value: CitySuggestionData.suggest    
        },
        currentCityCode: {
            value: CitySuggestion._currentCityCode
        },
        currentCityData: {
            value: null
        }
	};
	
	Y.extend(CitySuggestion, Y.Base, {
    
        /**
         * ---------------------- Lifecycle 方法 ------------------------------
         */
        
        /**
         * 初始化
         * @method initializer
         * @param {Object} cfg 参数对象 
         * @chainable
         */
        initializer: function(cfg) {
            this.rendered = false;
        
			this.ACCfg = Y.merge(CitySuggestion.DEF_CONFIG, cfg, {
				render: false
			});
            
            this._searchData = this.ACCfg.source;
            this._inputNode = this.get('inputNode');
            this._parentNode = this._inputNode.ancestor();
            this._cityCodeInputNode = this.get('cityCodeInputNode');
            this._provinceCodeInputNode = this.get('provinceCodeInputNode');
            
            this._inputEvents = [];
            this._ACEvents = [];
            
            this.publish('select', {
                defaultFn: this._defSelectFn
            });

			this.publish('citySelect', {
				defaultFn: this._defCitySelectFn
			});
            
            this._setPlaceholder();
            
            if (this.get('render')) {
                this.render(cfg);
            }
		},
		
		/**
         * 析构函数
         * @method destructor
         * @chainable
         */		
		destructor: function() {
            while (this._inputEvents.length) {
                this._inputEvents.pop().detach();
            }
            while (this._ACEvents.length) {
                this._ACEvents.pop().detach();
            }
            if (this.AC) {
                this.AC.destroy();
            }
            delete CitySuggestion._instances[Y.stamp(this)];  		
		},
		
		/**
         * 渲染实例
         * @method render
         * @chainable
         */
		render: function() {
			this.renderUI();
			this.bindUI();
			this.syncUI();
			this._getCurrentCity();
            this.rendered = true;
            return this;
		},
		
		/**
         * 渲染实例UI
         * @method renderUI
         * @chainable
         */
		renderUI: function() {
			this._renderAC();
            this._renderKeyNote();
		},
		
		/**
         * 绑定实例UI事件
         * @method bindUI
         * @chainable
         */
		bindUI: function() {
			this._bindInput();
			this._bindAC();
            this._bindACList();
            this._bindKeyNote();
            this._bindDocument();
		},
		
		/**
         * 更新UI
         * @method syncUI
         * @chainable
         */
		syncUI: function() {
        
		},
        
        
        /**
         * ---------------------- 公用 Public API 方法 ------------------------------
         */        
        
        /**
         * 隐藏城市列表
         * @method hide
         * @chainable
         */
        hide: function() {
            this.AC.hide();
            return this;
        },
        
		/**
         * 显示城市列表
         * @method show
         * @chainable
         */
        show: function() {
            this.AC.show();
            return this;
        },
		
		/**
         * 更新选中城市数据
         * @method updateCode
         * @param cityCode {String} 城市代码
         * @param provinceCode {Boolean} 省份代码
         * @param supportCompanies {Boolean} 支持保险公司
         * @chainable
         */		
		updateCode: function(cityCode, provinceCode, supportCompanies) {
            if (cityCode !== '') {
                this._inputNode.removeClass('placeholder');
            }
			this._inputNode.setAttribute('data-support', supportCompanies || '');
			this._cityCodeInputNode && this._cityCodeInputNode.set('value', cityCode || '');
            //可能没有provinceCode的input，需要小心
			this._provinceCodeInputNode && this._provinceCodeInputNode.set('value', provinceCode || '');
            return this;
		},
        
        
        /**
         * ---------------------- 私有 API 方法 ------------------------------
         */         
        
        /**
         * 绑定城市实例事件
         * @method _bindAC
         * @protected
         */
		_bindAC: function() {
			var AC = this.AC;
			
            this._ACEvents = this._ACEvents.concat([
            
                AC.on('query', this._onACQuery, this),
                AC.on('results', this._onACResults, this),
                AC.on('select', this._onACSelect, this),
                
                AC.after('valueChange', this._afterACValueChange, this),
                
                AC.after('resultsChange', this._afterACResultsChange, this),
                AC.after('visibleChange', this._afterACVisibleChange, this),
                AC.after('activeItemChange', this._afterACActiveItemChange, this)
            ]);
		},
		
		/**
         * 绑定Document点击事件
         * @method _bindDocument
         * @protected
         */
        _bindDocument: function() {
            if (!CitySuggestion._documentClickEvent) {
                CitySuggestion._documentClickEvent = Y.on('click', CitySuggestion._onDocumentClick, document);
            }
        },
		
		/**
         * 绑定输入框相关事件
         * @method _bindInput
         * @protected
         */
		_bindInput: function() {
			this._inputEvents = this._inputEvents.concat([
                this._inputNode.on('blur', this._onInputBlur, this),
                this._inputNode.on('focus', this._onInputFocus, this),
                
                this._parentNode.on('click', this._onParentClick, this),
                this._parentNode.on('mouseenter', this._onParentMouseEnter, this),
                this._parentNode.on('mouseleave', this._onParentMouseLeave, this)
            ]);
		},
        
		/**
         * 绑定城市列表事件
         * @method _bindACList
         * @protected
         */
        _bindACList: function() {
            var BB = this.AC.get('boundingBox');
            
            this._ACEvents = this._ACEvents.concat([
                BB.on('mouseenter', this._onACListMouseEnter, this),
                BB.on('mouseleave', this._onACListMouseLeave, this)
            ]);
        },
        
		/**
         * 绑定提示栏事件
         * @method _bindKeyNote
         * @protected
         */
        _bindKeyNote: function() {
            this._ACEvents = this._ACEvents.concat([
                this._keyNoteNode.on('click', this._onKeyNoteClick, this)
            ]);
        },
		
		/**
         * 绑定热门城市列表事件
         * @method _bindSuggest
         * @protected
         */
		_bindSuggest: function() {
			var that = this,
				AC = that.AC,
				//search = CitySuggestionData.search,
				search = this._searchData,
				memory = {};
			
			function getCityData(cityCode) {
				if (!memory[cityCode]) {
					for (var i = 0, l = search.length; i < l; i++) {
						if (cityCode == search[i].cityCode) {
							memory[cityCode] = search[i];
							break;
						}
					}
				}
				return memory[cityCode];
			}
			
			if (that._suggestNode) {
                that._ACEvents.push(
                    that._suggestNode.delegate('click', function(e) {
                        e.halt();
                        var target = e.currentTarget,
                            cityCode = target.getAttribute('cityCode'),
							cityData = getCityData(cityCode) || {
								cityCode: cityCode,
								cityName: target.get('text'),
								provinceCode: target.getAttribute('provinceCode'),
								supportCompanies: ''
							};
                            
                        AC._updateValue(cityData.cityName.replace(/市$/, ''));
                        that.updateCode(cityData.cityCode, cityData.provinceCode, cityData.supportCompanies);
						that.fire('citySelect', {
							cityName: cityData.cityName.replace(/市$/, ''),
							cityCode: cityData.cityCode,
							provinceCode: cityData.provinceCode,
							supportCompanies: cityData.supportCompanies,
							raw: cityData
						});
                        //fixed IE6,7下a标签outline不消失的bug
                        //todo is it really a good solution??!
                        /*if (Y.UA.ie && Y.UA.ie < 8) {
                            target.blur();
                        }*/
                        AC.hide();
                    }, 'dd a')
                );
			}
		},
        
		/**
         * 获取当前IP城市
         * @method _getCurrentCity
         * @protected
         */
        _getCurrentCity: function() {
            var currentCityCode = this.get('currentCityCode'),
                currentCityData = this.get('currentCityData');
				
            if (!currentCityData && currentCityCode) {
                var data = this._searchData,
                    //data = CitySuggestionData.search,
                    cityCode = currentCityCode,
                    l = data.length,
                    i = 0;
                
                for (; i < l; i++) {
                    if (cityCode == data[i].cityCode) {
                        currentCityData = data[i];
                        this.set('currentCityData', currentCityData)
                        break;
                    }
                }
            }
            
            if (currentCityData) {
				this._inputNode.removeClass('placeholder');
                this._inputNode.set('value', currentCityData.cityName.replace(/市$/, ''));
                this.updateCode(currentCityData.cityCode, currentCityData.provinceCode, currentCityData.supportCompanies);
				this.fire('citySelect', {
					cityName: currentCityData.cityName.replace(/市$/, ''),
					cityCode: currentCityData.cityCode,
					provinceCode: currentCityData.provinceCode,
					supportCompanies: currentCityData.supportCompanies,
					raw: currentCityData
				});
			} else {
                //不重置值，保留用户操作，IE下
                var val = this._inputNode.get('value'),
                    plh = this._inputNode.getAttribute('placeholder');
                if (val === '' || val === plh) {
                    this._inputNode.set('value', '');
                    this.updateCode('', '', '');
                }
            }
        },
		
		/**
         * 隐藏热门城市推荐列表
         * @method _hideSuggest
         * @protected
         */
		_hideSuggest: function() {
			if (this._suggestNode) {
				this._suggestNode.hide();
			}
		},
        
		/**
         * 渲染城市列表自动补全实例
         * @method _renderAC
         * @protected
         */
		_renderAC: function() {
			var AC = new Y.AutoComplete(this.ACCfg);

            this.AC = AC;
            
			//注意 3.5.0后有_onDocClick事件，如果不是BB内的元素或inputNode，则将AC隐藏
			//hack
			//源码中的判断条件boundingBox.one(target.get('id'))低级bug，缺少'#'
			AC._afterDocClick = function() {};
			
            this._setDefParentNode();
            this._setACAlign();
			AC.set('zIndex', typeof this.ACCfg.zIndex === 'undefined' ? '999' : this.ACCfg.zIndex);
            
			AC.render();
            
            AC._listNode = AC.get('listNode');
            AC.get('boundingBox').setStyle('position', 'absolute');
            
            this._setACAttrs();
            this._setACCls();
		},
        
		/**
         * 渲染城市列表提示栏
         * @method _renderKeyNote
         * @protected
         */
        _renderKeyNote: function() {
            var keyNoteNode = Y.Node.create('<div class="yui3-aclist-keynote" style="display:none;">支持键盘↑↓及回车键选择</div>'),
                AC = this.AC;
               
            AC._listNode.insert(keyNoteNode, 'before');
            
            this._keyNoteNode = keyNoteNode;
        },
        
		/**
         * 渲染城市推荐列表
         * @method _renderSuggest
         * @protected
         */
		_renderSuggest: function() {
			var AC = this.AC,
			    suggest = this.get('suggest'),
				suggestContent;
		    				
		    suggestContent = (suggest && suggest.length) ? Y.Mustache.to_html(SUGGEST_PANEL_TEMPLATE, {suggest: suggest}) : '<p class="no-suggest">系统维护中，城市列表加载失败，请尝试刷新页面</p>';
				
			this._suggestNode = Y.Node.create(SUGGEST_NODE_TEMPLATE);
			this._suggestNote = Y.Node.create(SUGGEST_NOTE_TEMPLATE);
			this._suggestTab = Y.Node.create(SUGGEST_TAB_TEMPLATE);
			this._suggestContent = Y.Node.create(SUGGEST_CONTENT_TEMPLATE);
			this._suggestContent.appendChild(suggestContent);
            
			this._suggestNode.appendChild(this._suggestNote);
			this._suggestNode.appendChild(this._suggestTab);
			this._suggestNode.appendChild(this._suggestContent);
            
			AC._listNode.insert(this._suggestNode, 'before');
            
            suggest && suggest.length && this._renderSuggestTab();
            
		},
        
		/**
         * 渲染城市推荐列表Tab
         * @method _renderSuggestTab
         * @protected
         */
        _renderSuggestTab: function() {
            var AC = this.AC;
            
            this.MTV = new Y.MyTabView({
                srcNode: this._suggestNode,
                tabSelector: DOT + CLS_SUGGEST_TAB_ITEM,
                panelSelector: DOT + CLS_SUGGEST_PANEL,
                plugins: [{fn:Y.Plugin.MyTabViewLazyload, cfg:{removeAfterLoaded:true}}]
            });
            
            this.MTV.on('switch', function(e) {
                var panel = e.newPanel;
                if (!panel.one('dl') && !panel.one('p')) {
                    panel.setContent('<p class="no-suggest">暂无热门城市，请输入汉字/拼音/首字母查询。</p>');
                }
                AC.sizeShim();
            });
            
            this.MTV.render();
        },
        
		/**
         * 设置弹出框相关属性
         * @method _setACAttrs
         * @protected
         */
        _setACAttrs: function() {
            var BB = this.AC.get('boundingBox');
			//注意，在3.5.0以后的版本中不能重置BB的id，这样会导致绑定的事件失效
            if (this.ACCfg.acattrs) {
                BB.setAttrs(this.ACCfg.acattrs);
            }
        },
        
		/**
         * 设置弹出框class
         * @method _setACAttrs
         * @protected
         */
        _setACCls: function() {
            var BB = this.AC.get('boundingBox'),
                classNames = this.ACCfg.classNames;
            
            BB.addClass(getClassName());
            if (classNames && classNames.length) {
                for (var i = 0, l = classNames.length; i < l; i++) {
                    BB.addClass(classNames[i]);
                }
            }
        },
		
		/**
         * 设置弹出框定位属性
         * @method _setACAlign
         * @protected
         */
        _setACAlign: function() {
            if (!this.ACCfg.align || !this.ACCfg.align.node || !this.ACCfg.align.points) {
                this.AC.set('align', {
                    node: this.AC.get('inputNode').ancestor('.citysuggestion') || this.AC.get('inputNode').ancestor('.autocitysuggestion'),
                    points: ['tl', 'bl']
                });
            }
        },
        
		/**
         * 设置弹出框父元素
         * @method _setDefParentNode
         * @protected
         */
        _setDefParentNode: function() {
            var defParentNode = this.ACCfg.defParentNode;
            
            if (defParentNode === 'useOwnContainer') {
                //style the container yourself, to fixed resize event
                if (!CitySuggestion._ownContainer) {
                    CitySuggestion._ownContainer = Y.Node.create('<div/>');
                    CitySuggestion._ownContainer.addClass(getClassName('container'));
                    CitySuggestion._ownContainer.setStyle('position', 'relative');
                    Y.one('body').prepend(CitySuggestion._ownContainer);
                }
                defParentNode = CitySuggestion._ownContainer;
            }
            
            this.AC.DEF_PARENT_NODE = defParentNode || null;
        },
        
		/**
         * 设置输入框placeholder
         * @method _setPlaceholder
         * @protected
         */
        _setPlaceholder: function() {
            Y.Placeholder.init(this._inputNode);
        },
		
		/**
         * 显示推荐城市
         * @method _showSuggest
         * @protected
         */
		_showSuggest: function(e) {
			var AC = this.AC,
				that = this;

			if (!this._suggestNode) {
				this._renderSuggest();
				this._bindSuggest();
			}
            
			//todo AC._clear();?
            //AutoComplete 翻页组件
            if (AC.paginator) {
                AC.paginator._syncVisibility(false, false);
            }
			AC._listNode.hide();
            this._keyNoteNode.hide();
			this._suggestNode.show();
			AC.show();
            
            if (AC._lastInputKey == 9) {
                delete AC._lastInputKey;
            }
            
			if (!this.inputFocused) {
				this._inputNode.focus();
			}
            //选中input text
            setTimeout(function() {
				that._inputNode.select();
			}, 0);
		},
		

        /**
         * ---------------------- 私有 Callback 函数 ------------------------------
         */  
        
		/**
         * activeItem改变后的回调
         * @method _afterACActiveItemChange
         * @param {EventFacade} e
         * @protected
         */
		_afterACActiveItemChange: function(e) {
			this.prevActiveItem = e.prevVal;
		},
		
		/**
         * 查询结果改变后的回调
         * @method _afterACResultsChange
         * @param {EventFacade} e
         * @protected
         */
        _afterACResultsChange: function(e) {
            this.AC.sizeShim();
        },
        
		/**
         * value改变后的回调
         * @method _afterACValueChange
         * @param {EventFacade} e
         * @protected
         */
        _afterACValueChange: function(e) {
        	var newVal = Y.Lang.trimLeft(e.newVal);
        	if (newVal || newVal.length) { return; }
    		this._showSuggest();
        },
        
		/**
         * 显示隐藏属性改变后的回调
         * @method _afterACVisibleChange
         * @param {EventFacade} e
         * @protected
         */
        _afterACVisibleChange: function(e) {
            var AC = this.AC;
            if (e.newVal) {
				AC.sizeShim();
			} else {
                var v = this._inputNode.get('value'),
                    p = this._inputNode.getAttribute('placeholder');
                
                //如果输入框为空或者等于placeholder，则置空code
                if (v === '' || v === p) {
                    this.updateCode('', '', '');
                }
                
                //如果code为空，默认选择第一个
                if (this._cityCodeInputNode && this._cityCodeInputNode.get('value') === '') {
                    var item = this.prevActiveItem || AC._getFirstItemNode();
                    if (item && item._node) {
						var result = item.getData('result'),
							cityData = result.raw;
						AC._updateValue(cityData.cityName.replace(/市$/, ''));
						this.updateCode(cityData.cityCode, cityData.provinceCode, cityData.supportCompanies);
						this.fire('citySelect', {
							cityName: cityData.cityName.replace(/市$/, ''),
							cityCode: cityData.cityCode,
							provinceCode: cityData.provinceCode,
							supportCompanies: cityData.supportCompanies,
							nextStep: 'blur'
						});
                    }
                }
			}
        },
        
		/**
         * 查询时的回调
         * @method _onACQuery
         * @param {EventFacade} e
         * @protected
         */
        _onACQuery: function(e) {
            var AC = this.AC;
            this.updateCode('', '', '');
			AC._listNode.show();
			this._hideSuggest();
        },
        
		/**
         * 返回查询结果时的回调
         * @method _onACResults
         * @param {EventFacade} e
         * @protected
         */
        _onACResults: function(e) {
            var AC = this.AC;
            
            if (e.results.length) {
				if (this.noResult) {
					this.noResult._node && this.noResult.remove(true);
					this.noResult = null;
				}
                this._keyNoteNode.show();
			} else {
				e.preventDefault();
                this._keyNoteNode.hide();
				AC._clear();
				this.noResult = Y.Node.create('<li class="yui3-aclist-noresult"><p>很抱歉，找不到"<b class="yui3-ac-highlight">' + e.query + '</b>"城市。</p><p>有可能城市名称输入错误或城市不在投保城市范围内。</p></li>');
				AC._listNode.appendChild(this.noResult);
				AC.show();
                AC.sizeShim();
			}
        },
        
		/**
         * 选择下拉列表选项时的回调
         * @method _onACResults
         * @param {EventFacade} e
         * @protected
         */
        _onACSelect: function(e) {
            this.fire('select', e);
        },
        
		/**
         * Document Click回调
         * @method _onDocumentClick
         * @param {EventFacade} e
         * @protected
         */
        _onDocumentClick: function(e) {
            if (!this.mouseOverInput && !this.mouseOverList) {
				this.AC && this.AC.hide();
            }
        },
		
		/**
         * 输入框失去焦点时的回调
         * @method _onDocumentClick
         * @param {EventFacade} e
         * @protected
         */
        _onInputBlur: function(e) {
            this.inputFocused = false;
            this._parentNode.removeClass(getClassName('focused'));
        },
        
		/**
         * 输入框获得焦点时的回调
         * @method _onInputFocus
         * @param {EventFacade} e
         * @protected
         */
        _onInputFocus: function(e) {
            var AC = this.AC;
            
            this.inputFocused = true;
            this._parentNode.addClass(getClassName('focused'));
			if (!AC.get('visible')) {
				this._showSuggest();
			}
        },
        
		/**
         * 提示框点击回调
         * @method _onKeyNoteClick
         * @param {EventFacade} e
         * @protected
         */
        _onKeyNoteClick: function(e) {
            this._inputNode.focus();
        },
        
		/**
         * 输入框父元素点击回调
         * @method _onParentClick
         * @param {EventFacade} e
         * @protected
         */
        _onParentClick: function(e) {
			e.stopPropagation();
            if (e.target !== this._inputNode) {
                //if (!this.inputFocused) {
                    this._inputNode.focus();
					this._inputNode.select();
                    //this._inputNode.set('value', this._inputNode.get('value'));
                //} else {
                    //this.AC.show();
                //}
            } else {
                if (this.inputFocused) {
                    if (!this.AC.get('visible')) {
                        //if (Y.Lang.trim(this._inputNode.get('value')) === '') {
                            this._showSuggest();
                        //} else {
                            //this.AC.show();
                        //}
                    }
                }
            }            
        },
        
		/**
         * 输入框父元素鼠标移进回调
         * @method _onParentMouseEnter
         * @param {EventFacade} e
         * @protected
         */
        _onParentMouseEnter: function(e) {
            this.mouseOverInput = true;
            this.AC._mouseOverList = true;
            this._parentNode.addClass(getClassName('hovered'));
        },
         
		/**
         * 输入框父元素鼠标移出回调
         * @method _onParentMouseLeave
         * @param {EventFacade} e
         * @protected
         */
        _onParentMouseLeave: function(e) {
            this.mouseOverInput = false;
            this.AC._mouseOverList = false;
            this._parentNode.removeClass(getClassName('hovered'));
        },
        
		/**
         * 城市列表鼠标移进回调
         * @method _onACListMouseEnter
         * @param {EventFacade} e
         * @protected
         */
        _onACListMouseEnter: function(e) {
            this.mouseOverList = true;
        },
        
		/**
         * 城市列表鼠标移出回调
         * @method _onACListMouseEnter
         * @param {EventFacade} e
         * @protected
         */
        _onACListMouseLeave: function(e) {
            this.mouseOverList = false;
        },
        
        
        /**
         * ---------------------- 私有默认自定义事件 Select Callback 函数 ------------------------------
         */        
        
		/**
         * 默认自定义事件select的回调
         * @method _defSelectFn
         * @param {EventFacade} e
         * @protected
         */
        _defSelectFn: function(e) {
			var raw = e.result.raw;
			this.updateCode(raw.cityCode, raw.provinceCode, raw.supportCompanies);
			this.fire('citySelect', {
				cityName: raw.cityName.replace(/市$/, ''),
				cityCode: raw.cityCode,
				provinceCode: raw.provinceCode,
				supportCompanies: raw.supportCompanies,
				raw: raw
			});
        },
		
		/**
         * 默认自定义事件citySelect的回调
         * @method _defCitySelectFn
         * @param {EventFacade} e
         * @protected
         */
		_defCitySelectFn: function(e) {
			if (e.nextStep != 'blur' && this.get('focusAfterSelect')) {
				this._inputNode.focus();
			} else {
				this._inputNode.blur();
			}
		}
        
        
	});
	
	//Y.CitySuggestion = CitySuggestion;
	Y.AutoCitySuggestion = CitySuggestion;

}, '1.0.0', {
	requires: ['autocitysuggestion-skin', 'csd-search', 'csd-suggest', 'mustache', 'mytabview', 'mytabview-lazyload', 'widget-stack', 'autocomplete', 'placeholder']
});