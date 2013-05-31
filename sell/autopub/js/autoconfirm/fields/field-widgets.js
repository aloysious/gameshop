
YUI.add('field-widgets', function(Y) {
	
	Y.namespace('Field');
	var F = Y.Field,
		Lang = Y.Lang,
        trim = Lang.trim;

    /**
     * ----------------------------------------------------------------------------------------
     *                                   Widgets 控件方法列表
     * ----------------------------------------------------------------------------------------
     */
	
	/**
	 * 控件方法列表
	 * @class Widgets
	 * @name Widgets
	 * @memberof I
	 * @type object
	 * @public
	 */
    F.Widgets = {
        
        /**
         * 默认组件方法
         * @class def
         * @name def
         * @memberof F.Widgets
         * @type object
         * @public
         */
        def: {
            getVal: function(widget) {
                var v = '',
                    node = widget['node'],
                    type = widget['type'];
                    
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('checked')) {
                                v = item.get('value');
                            }
                        });
                        return v;
                    case 'select':
                        return node.one('select').get('value');
                    case 'checkbox': 
                        v = [];
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (item.get('checked')) {
                                v.push(item.get('value'));
                            }
                        });
                        return v.join(',');
                    case 'text':
                        return node.one('input[type="text"],textarea').get('value');
                    default:
                        return v;
                }
            },
            setVal: function(widget, val) {
                var node = widget['node'],
                    type = widget['type'];
                
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('value') == val) {
                                item.set('checked', true);
                            }
                        });
                        return val;
                    case 'select':
                        node.one('select').set('value', val);
                        return val;
                    case 'checkbox': 
                        var valArr = (val || '').split(','),
                            valObj = {};
                        while (valArr.length) {
                            valObj[valArr.pop()] = 1;
                        }
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (valObj[item.get('value')]) {
                                item.set('checked', true);
                            } else {
                                item.set('checked', false);
                            }
                        });
                        return val;
                    case 'text':
                        node.one('input[type="text"],textarea').set('value', val);
                        return val;
                    default:
                        return val;
                }
            },
            setLinkage: function(a) {
                var that = this,
                    node = a['node'],
                    type = a['type'],
					name = a['name'],
					list = a['list'];
                
                switch (type) {
                    case 'radio':
                        node.delegate('click', function(e) {
							F.Event.fire('change', {
								name: name,
                                list: list
							});
                        }, 'input[type="radio"]');
                        break;
                    case 'select':
                        node.one('select').on('change', function(e) {
                            F.Event.fire('change', {
								name: name,
								list: list
							});
                        });
                        break;
                    case 'checkbox':
                        node.delegate('click', function(e) {
                            F.Event.fire('change', {
								name: name,
								list: list
							});
                        }, 'input[type="checkbox"]');
                        break;
                    case 'text':
                        node.one('input[type="text"],textarea').on('valueChange', function(e) {
                            F.Event.fire('change', {
								name: name,
								list: list
							});
                        });
                        break;
                    default:
                        return;
                }
            },
            getText: function(widget) {
                var t = '',
                    node = widget['node'],
                    type = widget['type'],
                    _t = '',
                    _s;
                    
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('checked')) {
                                t = item.next('label').get('text');
                            }
                        });
                        return t;
                    case 'select':
                        _s = node.one('select')._node;
                        if (_s.selectedIndex > -1) {
                            _t = _s.options[_s.selectedIndex].text;
                        }
                        return _t;
                    case 'checkbox': 
                        t = [];
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (item.get('checked')) {
                                t.push(item.next('label').get('text'));
                            }
                        });
                        return t.join(' ');
                    case 'text':
                        return node.one('input[type="text"],textarea').get('value');
                    default:
                        return t;
                }
            },
            initVal: function(widget, data) {
                var node = widget['node'];
                
				data = data || {};
                
                //遍历表单元素，设置初始值
                node.all('input,select,textarea').each(function(el) {
                    var _el = el._node,
                        type = _el.type,
                        name = _el.name,
                        val = data[name];
                        
                    if (typeof val !== 'undefined') {
                        switch (type) {
                            case 'select-one':
                                el.set('value', val);
                                break;
                            case 'radio':
                                _el.checked = _el.value == val ? true : false;
                                break;
                            case 'checkbox':
                                var arr = val.split(',');
                                _el.checked = false;
                                for (var i = 0, l = arr.length; i < l; i++) {
                                    if (_el.value == arr[i]) {
                                        _el.checked = true;
                                        break;
                                    }
                                }
                                break;
                            case 'file':
                            case undefined:
                            case 'reset':
                            case 'button':
                            case 'select-multiple':
                            case 'submit':
                                break;
                            default:
                                el.set('value', val);
                        }
                    }
                });
            },
			reset: function(widget) {
				var node = widget['node'],
                    type = widget['type'];
                
                switch (type) {
                    case 'text':
                        node.one('input[type="text"],textarea').set('value', '');
                        break;
                    case 'checkbox': 
                        node.all('input[type="checkbox"]').set('checked', false);
						break;
                    case 'radio':
                        node.all('input[type="radio"]').set('checked', false);
                        break;
                    case 'select':
                        node.one('select').one('option').set('selected', true);
                        break;
                    default:
						break;
                }
				
				return '';
			},
			parseElVal: function(widget) {
				return F.WidgetLang.getVal(widget);
			}
        },
        
        /**
         * 级联菜单
         * @class cascade
         * @name cascade
         * @memberof F.Widgets
         * @type object
         * @public
         */
        cascade: {
            initVal: function(widget, data) {
				var node = widget['node'];
                widget.cfg = widget.cfg || [];
				widget.vals = [];
				node.all('select').each(function(item) {
                    n = item.getAttribute('name');
                    if (data) {
                        if (typeof data[n] === 'undefined') {
                            widget.vals.push('');
                        } else {
                            widget.vals.push(data[n]);
                        }
                    }
                });
            },
            init: function(widget) {
                var node = widget['node'],
                    name = widget['name'],
                    casCfg = window['CAS_CFG'],
                    cfg = [],
                    idArr = [],
                    nameArr = [],
                    vals = [],
                    str,
                    mod,
                    n;
				
				widget.cfg = widget.cfg || [];
				widget.vals = widget.vals || [];
                
                //获取id和name及初始化值数组
                node.all('select').each(function(item) {
                    n = item.getAttribute('name');
                    idArr.push(item.getAttribute('id'));
                    nameArr.push(n);
                });
                
                if (idArr.length) {
                    
                    mod = widget.list.name;
                    
                    if (casCfg && casCfg[mod] && casCfg[mod][name]) {
                        cfg.push(casCfg[mod][name]);
                        cfg.push(idArr);
                        widget.cfg.push(casCfg[mod][name]);
                        widget.cfg.push(idArr);
                        
                        if (widget.vals.length) {
                            cfg.push(widget.vals.concat());
                        }
                        
                        //初始化级联菜单
                        Cascade && Cascade.init.apply(widget, cfg);
                    }
                }
            },
            getVal: function(widget) {
                var node = widget['node'],
                    val = [];
                    
                node.all('select').each(function(item) {
                    val.push(item.get('value'));
                });
                
                return val;
            },
            setVal: function(widget, val) {
                var cfg;
                if (widget.cfg && widget.cfg.length >= 2) {
                    cfg = widget.cfg.concat();
                    cfg.push(val);
                    Cascade && Cascade.init.apply(widget, cfg);
                }
                return val;
            },
            setLinkage: function(a) {
                var that = this,
					name = a['name'],
					list = a['list'];
					
                if (a.cfg && a.cfg.length >= 2) {
                    a['node'].delegate('change', function(e) {
                        e.stopImmediatePropagation();
                        F.Event.fire('change', {
							name: name,
							list: list
						});
                    }, 'select');
                }
            },
            getText: function(widget) {
                var node = widget['node'],
                    val = '',
                    _t = '',
                    _s;
                
                node.all('select').each(function(item) {
                    _s = item._node;
                    if (_s.selectedIndex > -1) {
                        _t = _s.options[_s.selectedIndex].text;
                    }
                    val = val + _t + ' '; 
                });
                
                return val;
            },
			reset: function(widget) {
				var cfg;
                if (widget.cfg && widget.cfg.length >= 2) {
                    cfg = widget.cfg.concat();
                    Cascade && Cascade.init.apply(widget, cfg);
                }
				return '';
			},
			parseElVal: function(widget) {
				return widget.vals;
			}
        },
        
        /**
         * 固定电话（区号加号码）
         * @class areaphone
         * @name areaphone
         * @memberof F.Widgets
         * @type object
         * @public
         */
        areaphone: {
            init: function(widget) {
                var node = widget['node'],
                    ipts = node.all('input');
                
                widget['area'] = ipts.item(0); 
                widget['no'] = ipts.item(1);
            },
            getVal: function(widget) {
                return {
                    area: trim(widget['area'].get('value')),
                    no: trim(widget['no'].get('value'))
                };
            },
            setVal: function(widget, val) {
                widget['area'].set('value', val['area']);
                widget['no'].set('value', val['no']);
                return val;
            },
            setLinkage: function(a, b) {
				var name = a['name'],
					list = a['list'];
					
                a['area'].on('valueChange', function(e) {
                    F.Event.fire('change', {
						name: name,
						list: list
					});
                });
                a['no'].on('valueChange', function(e) {
                    F.Event.fire('change', {
						name: name,
						list: list
					});
                });
            },
            getText: function(widget) {
                var vals = F.WidgetLang.getVal(widget);
                return vals['area'] + ' - ' + vals['no'];
            },
			reset: function(widget) {
				F.WidgetLang.setVal(widget, {
					area: '',
					no: ''
				});
				return '';
			},
			parseElVal: function(widget) {
				return F.WidgetLang.getVal(widget);
			}
        },
        
        /**
         * 身份证
         * @class card
         * @name card
         * @memberof F.Widgets
         * @type object
         * @public
         */
        card: {
            init: function(widget) {
                var that = this,
					node = widget['node'];
                //缓存Node节点
                widget['typeNode'] = node.one('select');
                widget['noNode'] = node.one('input');
				/*widget['typeNode'].on('change', function(e) {
					that.hideRelWidget(widget);
				});*/
            },
            getVal: function(widget) {
                var typeNode = widget['typeNode'],
                    _typeNode = typeNode._node,
                    _t = '';
                
                if (_typeNode.selectedIndex > -1) {
                    _t = _typeNode.options[_typeNode.selectedIndex].text;
                }
                    
                //返回类型及号码对象
                return {
                    type: widget['typeNode'].get('value'),
                    no: trim(widget['noNode'].get('value')),
                    text: _t
                };
            },
            setVal: function(widget, val) {
                var node = widget['node'];
                widget['typeNode'].set('value', val.type);
                widget['noNode'].set('value', val.no);
				//this.hideRelWidget(widget);
                return val;
            },
            setLinkage: function(a) {
                var that = this,
					name = a['name'],
					list = a['list'];
					
                a['typeNode'].on('change', function(e) {
					F.Event.fire('change', {
						name: name,
						list: list
					});
                });
                a['noNode'].on('valueChange', function(e) {
                    F.Event.fire('change', {
						name: name,
						list: list
					});
                });
            },
            getText: function(widget) {
                var v = F.WidgetLang.getVal(widget);
                return v.text + ' ' + v.no;
            },
			reset: function(widget) {
				widget['typeNode'].one('option').set('selected', true);
                widget['noNode'].set('value', '');
				//this.hideRelWidget(widget);
				return '';
			},
			parseElVal: function(widget) {
				return F.WidgetLang.getVal(widget);
			},
			hideRelWidget: function(widget) {
				return;
				var list = widget['node'].ancestor('.widget-list'),
					widgets = list.widgets,
					card = widget,
					birthday = widgets['birthday'],
					sex = widgets['sex'],
					type = F.WidgetLang.getVal(card).type;
				
				if (type == 1) {
					birthday && birthday['node'].addClass('hidden');
					sex && sex['node'].addClass('hidden');
				} else {
					birthday && birthday['node'].removeClass('hidden');
					sex && sex['node'].removeClass('hidden');
				}
			}
        },
        
        /**
         * 日期级联菜单
         * @class date
         * @name date
         * @memberof F.Widgets
         * @type object
         * @public
         */
        date: {
            init: function(widget, force) {
                var node = widget.node;
				widget['inputNode'] = node.one('input');
                if (force || !widget['inited']) {
                    widget['dc'] = new Y.DateCascade.Input({
                        id: widget['inputNode'].getAttribute('id')
                    });
                    widget['inited'] = 1;
                }
            },
            getVal: function(widget) {
                return {
                    year: widget.dc.get('year') || '',
                    month: widget.dc.get('month') || '',
                    day: widget.dc.get('day') || '',
                    date: widget.dc.get('date')
                };
            },
            getAge: function(widget) {
                var d = new Date(),
                    date = new Date(F.WidgetLang.getVal(widget).date.replace(/-/g, '/'));
                return d.getFullYear() - date.getFullYear() - ((d.getMonth() < date.getMonth() || d.getMonth() == date.getMonth() && d.getDate() < date.getDate()) ? 1 : 0);
            },
            setVal: function(widget, val) {
                if (widget.dc) {
                    //v = val.replace(/-/g, '/');
                    widget.dc.setNewYear(val.year).setNewMonth(val.month).setNewDay(val.day);
                }
                return val;
            },
            setLinkage: function(a) {
                var that = this,
					name = a['name'],
					list = a['list'];
					
                if (a.dc) {
                    a['node'].delegate('change', function(e) {
                        e.stopImmediatePropagation();
                        F.Event.fire('change', {
							name: name,
							list: list
						});
                    }, 'select');
                }
            },
            getText: function(widget) {
                return F.WidgetLang.getVal(widget).date || '';
            },
			reset: function(widget) {
				F.WidgetLang.setVal(widget, {
					year: '',
                    month: '',
                    day: '',
					date: ''
				});
				return '';
			},
			parseElVal: function(widget) {
				var val = widget['inputNode'].get('value'),
					date = new Date(val.replace(/-/g, '/')),
					isDate = Y.Lang.isDate(date);
					
				return isDate ? {
					year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    date: val
				} : {
					year: '',
                    month: '',
                    day: '',
                    date: ''
				};
			}
        },
        
		//TODO
		//Add setVal, setLinkage, reset Method
        /**
         * 日历
         * @class calendar
         * @name calendar
         * @memberof F.Widgets
         * @type object
         * @public
         */
        calendar: {
            init: function(widget) {
                var that = this,
                    node = widget['node'],
                    inputNode = node.one('input'),
                    id = inputNode.getAttribute('id'),
                    val = Lang.trim(inputNode.get('value')),
                    min = inputNode.getAttribute('min-date'),
                    max = inputNode.getAttribute('max-date'),
                    now = new Date(),
                    d,
					s,
                    mi,
                    mx;
                
                widget['inputNode'] = inputNode;
                
                s = new Date(val.replace(/-/g, '/'));
                mi = new Date(min.replace(/-/g, '/'));
                mx = new Date(max.replace(/-/g, '/'));
				d = Lang.isDate(mi) ? mi : now;
				
				if (Lang.isDate(s)) {
					if ((Lang.isDate(mi) && (s.getTime() < mi.getTime())) || (Lang.isDate(mx) && (s.getTime() > mx.getTime()))) {
						inputNode.set('value', '');
						s = now;
					}
				} else {
					inputNode.set('value', '');
					s = now;
				}

                if (inputNode && id) {
                    widget.cld = new Y.Calendar(id, {
                        date: d,
                        selected: s,
                        mindate: mi,
                        maxdate: mx,
                        popup: true,
                        closeable: true
                    }).on('select', function(d) {
                        inputNode.set('value', that.formatDate(d));
                    });
                }
            },
            getVal: function(widget) {
                return widget['inputNode'].get('value');
            },
			setVal: function(widget, val) {
			    val = val && new Date(val.replace(/-/g, '/'));
			    if (widget.cld && Y.Lang.isDate(val)) {
    			    widget.cld.render({selected:val});
			    }
			},
			setLinkage: function(a) {
			    var name = a['name'],
			        list = a['list'];
			    
			    widget.cld.on('select', function(d) {
			        F.Event.fire('change', {
                        name: name,
                        list: list
                    });
			    });
			},
            getText: function(widget) {
                return widget['inputNode'].get('value');
            },
            formatDate: function(d) {
                var _Y = d.getFullYear(),
                    _M = d.getMonth() + 1,
                    _D = d.getDate();
                    
                return _Y + '-' + (_M < 10 ? '0' + _M : _M) + '-' + (_D < 10 ? '0' + _D : _D);
            },
			reset: function(widget) {
			    widget['inputNode'].set('value', '');
			},
			parseElVal: function() {}
        }
    };

}, '0.0.1', {
	requires: ['node', 'event', 'event-delegate']
});