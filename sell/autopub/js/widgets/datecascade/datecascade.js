/**
 * 日期级联组件 （年、月、日用 year,month,day 表示，避免与 date 混淆）
 * @author huya.nzb@taobao.com 虎牙
 */

YUI.namespace('Y.DateCascade');
YUI.add('datecascade', function(Y) {
 
/**
 * 日期级联组件
 *
 * @module datecascade
 * @submodule datecascade-base
 * @for DateCascade
 * @requires base, node
 */    
    var Lang = Y.Lang,
        Node = Y.Node,
        Attribute = Y.Attribute,
        Base = Y.Base;
	/**
	 * 日期级联组件
	 * @class DateCascade
	 * @extends Base
	 * @constructor
	 */    
    Y.DateCascade = function() {
        Y.DateCascade.superclass.constructor.apply(this, arguments);
    };
    
    Y.DateCascade._instances = {};
    
    Y.DateCascade.NAME = 'datecascade';
    
    Y.DateCascade.ATTRS = {
        
        /**
		 * 组件前缀名，通常为其父容器的id
		 * @attribute id
		 * @type {String}
		 */
        id: {
            value: 'dc'
        },
        
        /**
		 * 日期范围开始时间
		 * @attribute dateStart
		 * @type {String | Date}
		 */
        dateStart: {
            value: new Date('1900/01/01'),
            setter: function(v) {
                var ret = Attribute.INVALID_VALUE;
                if (v) {
                    if (Lang.isDate(v)) {
                        ret = v;
                    } else if (Lang.isDate(new Date(v))) {
                        ret = new Date(v);
                    }
                }
                return ret;
            }  
        },
        
        /**
		 * 日期范围截止时间
		 * @attribute dateEnd
		 * @type {String | Date}
		 */
        dateEnd: {
            value: new Date(),
            setter: function(v) {
                var ret = Attribute.INVALID_VALUE;
                if (v) {
                    if (Lang.isDate(v)) {
                        ret = v;
                    } else if (Lang.isDate(new Date(v))) {
                        ret = new Date(v);
                    }
                }
                return ret;
            }     
        },
        
        /**
		 * 初始化选中日期
		 * @attribute dateDefault
		 * @type {String | Date}
		 */
        dateDefault: {
            value: null,
            setter: function(v) {
                var ret = Attribute.INVALID_VALUE;
                if (v) {
                    if (Lang.isDate(v)) {
                        ret = v;
                    } else if (Lang.isDate(new Date(v))) {
                        ret = new Date(v);
                    }
                }
                return ret;
            }          
        },
        
        /**
         * 当前选中日期
         * @attribute date
         * @type {String}
         */
        date: {
            value: null,
            setter: function(v) {
                //return v !== '' ? v : Attribute.INVALID_VALUE;
				return v;
            }
        },
        
        /**
         * 当前选中年份
         * @attribute year
         * @type {String}
         */
        year: {
            value: null,
            setter: function(v) {
                //return v ? v : Attribute.INVALID_VALUE;
                return v;
            },
            getter: function(v) {
                return v ? parseInt(v, 10) : null;
            }
        },
        
        /**
         * 当前选中年份
         * @attribute month
         * @type {String}
         */
        month: {
            value: null,
            setter: function(v) {
                //return v ? v : Attribute.INVALID_VALUE;
                return v;
            },
            getter: function(v) {
                return v ? parseInt(v, 10) : null;
            }
        },
        
        /**
         * 当前选中年份
         * @attribute day
         * @type {String}
         */
        day: {
            value: null,
            setter: function(v) {
                //return v ? v : Attribute.INVALID_VALUE;
                return v;
            },
            getter: function(v) {
                return v ? parseInt(v, 10) : null;
            }
        }
    };
    
    var dcProto = {
        
        /**
		 * 初始化
		 * @method initializer
		 * @public
		 */
        initializer: function() {
            var that = this, id = that.get('id');            
            that._Y = Y.one('#' + id + '_selectyear');
            that._M = Y.one('#' + id + '_selectmonth');
            that._D = Y.one('#' + id + '_selectday');
            
            that._events = [];
            
            Y.DateCascade._instances[id] = that;
            
            if (!that._Y || !that._M || !that._D) { return; }           
            //月份天数
            that._dayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            that.render();
			that._bindEvent();
        },
        
        /**
		 * 析构函数
		 * @method destructor
		 * @public
		 */
        destructor: function() {
            var that = this;
            
            while (that._events.length) {
                that._events.pop().detach();
            }
            
            delete Y.DateCascade._instances[that.get('id')];
        },
        
        /**
		 * 重置参数
		 * @method _parseParam
		 * @private
		 */
		_parseParam: function(o) {
            var that = this;
			o = o || {};
			for (var p in o) {
                if (o.hasOwnProperty(p)) {
                    that.set(p, o[p]);
                }
			}
		},
        
        /**
		 * 绑定事件
		 * @method _bindEvent
		 * @private
		 */
        _bindEvent: function() {
            var that = this;
            that._events = that._events.concat([
                that._Y.on('change', function(e) {
                    that.set('year', that._Y._node.value);
                    that.setNewMonth(parseInt(that._M.get('value'), 10));
                }),
                that._M.on('change', function(e) {
                    that.set('month', that._M._node.value);
                    that.setNewDay(parseInt(that._D.get('value'), 10));
                }),
                that._D.on('change', function(e) {
                    that.set('day', that._D._node.value);
                    that.set('date', that.getSelectedDate());
                })
            ]);
        },
		
        /**
		 * 渲染结构
		 * @method render
		 * @chainable
		 * @param o {Object} 重置参数对象
		 */
        render: function(o) {
            var that = this;
            
            //重置参数
			that._parseParam(o);
            
			var _ds = that.get('dateStart'), _de = that.get('dateEnd'), _df = that.get('dateDefault'),
                _y = that._Y.get('value'), _m = that._M.get('value'), _d = that._D.get('value');

			that._dsYear = _ds.getFullYear();
			that._dsMonth = _ds.getMonth() + 1;
			that._dsDay = _ds.getDate();
			that._deYear = _de.getFullYear();
			that._deMonth = _de.getMonth() + 1;
			that._deDay = _de.getDate();
			
            //如果是合法的默认日期，初始化各属性值
            if (_df && (that._inDateRange(_df))) {
                var _dfYear = _df.getFullYear() + '', _dfMonth = ((_df.getMonth() + 1) < 10 ? '0' : '') + (_df.getMonth() + 1), _dfDay = (_df.getDate() < 10 ? '0' : '') + _df.getDate();
                that.set('year', _dfYear);
                that.set('month', _dfMonth);
                that.set('day', _dfDay);
                that.set('date', _dfYear + '-' + _dfMonth + '' + _dfDay);
				that.setNewDate(_df);
			} else if (_y || _m || _d) {
                that.setNewDate(_y, _m, _d);
            } else {
				/*that.renderYear().renderMonth().renderDay();               
                //bugfix 如果不手动选中的话，firefox下会默认选中最后一个选项
                that._Y._node.options[0].selected = true;
                that._M._node.options[0].selected = true;
                that._D._node.options[0].selected = true;*/
				that.reset();
			}
            return this;
        },
        
        /**
		 * 检查日期是否在区间内
		 * @method _inDateRange
         * @param date {Date | String}
         * @return {Boolean}
		 * @private
		 */
        _inDateRange: function(date) {
            var that = this, date = that._checkDate(date);
            if (!date) { return; }
            var start = that._dsYear * 10000 + that._dsMonth * 100 + that._dsDay,
				end = that._deYear * 10000 + that._deMonth * 100 + that._deDay,
				date = date.getFullYear() * 10000 + (date.getMonth + 1) * 100 + date.getDate();
			if (date < start || date > end) { return false; }
            return true;
        },
               
        /**
		 * 检查是否是闰年
		 * @method _isLeapYear
         * @param y {String}
         * @return {Boolean}
		 * @private
		 */
        _isLeapYear: function(y) {
            y = parseInt(y, 10);
            return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
        },
                
        /**
		 * 检查日期是否合法
		 * @method _checkDate
         * @param date {Date | String}
         * @return {Date | Boolean}
		 * @private
		 */
        _checkDate: function(date) {
            var r = date && ((Lang.isDate(date) && date) || (Lang.isDate(new Date(date)) && new Date(date)));
            //yui 3.0.0 hack
            return r && r.toString() !== 'Invalid Date' && !isNaN(r) && r;
        },
        
        /**
		 * 获取选中的日期
		 * @method getSelectedDate
		 * @return {String}
		 */
        getSelectedDate: function() {
			var that = this, y = that._Y.get('value'), m = that._M.get('value'), d = that._D.get('value');
			if (!y || !m || !d) { return ''; }
			return y + '-' + m + '-' + d;     
        },
        
        /**
		 * 设置新日期
		 * @method setNewDate
         * @param date {Object | String}
		 * @chainable
		 */
		setNewDate: function(date) {
			var that = this, r;
            if ((r = that._checkDate(date))) {
                var y = r.getFullYear(), m = r.getMonth() + 1, d = r.getDate();
            } else if (Lang.isObject(date)) {
                var y = date.year || null, m = date.month || null, d = date.day || null;
            } else {
                return this;
            }
			if (y != null) { that.setNewYear(y, m != null ? false : true); }
            if (m != null) { that.setNewMonth(m, d != null ? false : true); }
            if (d != null) { that.setNewDay(d); }
			return this;
		},
        
        /**
		 * 设置新年份
		 * @method setNewYear
		 * @chainable
		 * @param y {String}
         * @param l {Boolean} linkage 改变年份时是否联动月份及天数 默认为true
		 */
        setNewYear: function(y, l) {
            var that = this, m = parseInt(that._M.get('value'), 10);
            that.renderYear();
			if (y != that._Y._node.value) {
				that._Y._node.value = y;
				//IE Bugfix, 上一行代码在下拉框没有相对应的值的时候，除IE外的浏览器不改变值
				//IE不选中任何选项，默认为空
				if (that._Y._node.selectedIndex < 0 || that._Y._node.value != y) {
					that._Y._node.options[0].selected = true;
				}
				that.set('year', that._Y._node.value);
			}
			if (l === false) {
				that.set('date', that.getSelectedDate());
				return this;
			}
			that.setNewMonth(m);
            return this;
        },
        
        /**
		 * 设置新月份
		 * @method setNewMonth
		 * @chainable
		 * @param m {String}
         * @param l {Boolean} linkage 改变年份时是否联动天数 默认为true
		 */
        setNewMonth: function(m, l) {
            var that = this, y = parseInt(that._Y.get('value'), 10), d = parseInt(that._D.get('value'), 10), m = (parseInt(m, 10) < 10 ? '0' : '') + parseInt(m, 10);
            that.renderMonth(y);
			if (m != that._M._node.value) {
				that._M._node.value = m;
				if (that._M._node.selectedIndex < 0 || that._M._node.value != m) {
					that._M._node.options[0].selected = true;
				}
				that.set('month', that._M._node.value);
			}
			if (l === false) {
				that.set('date', that.getSelectedDate());
				return this;
			}
			that.setNewDay(d);
            return this;
        },
        
        /**
		 * 设置新天数
		 * @method setNewDay
		 * @chainable
		 * @param d {String}
		 */
        setNewDay: function(d) {
            var that = this, y = parseInt(that._Y.get('value'), 10), m = parseInt(that._M.get('value'), 10), d = (parseInt(d, 10) < 10 ? '0' : '') + parseInt(d, 10);
			that.renderDay(y, m);
			if (d != that._D._node.value) {
				that._D._node.value = d;
				if (that._D._node.selectedIndex < 0 || that._D._node.value != d) {
					that._D._node.options[0].selected = true;
				}
				that.set('day', that._D._node.value);
			}
			that.set('date', that.getSelectedDate());
            return this;
        },
        
        /**
		 * 渲染年份结构
		 * @method renderYear
		 * @chainable
		 */
        renderYear: function() {
            var that = this, r = that._getYearRange(),
                options = that._Y._node.options, l = options.length;
            
            //如果结构相同，则不重新渲染
            if (l > 1 && options[1].value == r.max && options[l - 1].value == r.min) { return this; }
            //利用select的原生方法add添加option，用其他如createElement和createDocumentFragment的方法会导致在IE6下出现延迟
            //但是经测试createElement的方法比add快，WTF?! Still don't know why, just kill IE6!
			that._Y._node.innerHTML = '';
			that._Y._node.add(new Option('-', ''), undefined);
			for (i = r.max; i >= r.min; i--) {
				that._Y._node.add(new Option(i, i), undefined);
			}
			return this;
        },
        
        /**
		 * 渲染月份结构
		 * @method renderMonth
         * @param {String | Number} 当前年份
		 * @chainable
		 */
        renderMonth: function(y) {
            var that = this, r = that._getMonthRange(y), t,
                options = that._M._node.options, l = options.length;
            
			if (l > 1 && options[1].value == r.min && options[l - 1].value == r.max) { return this; }
            that._M._node.innerHTML = '';
			that._M._node.add(new Option('-', ''), undefined);
			for (i = r.min; i <= r.max; i++) {
                t = i >= 10 ? i : '0' + i;
				that._M._node.add(new Option(t, t), undefined);
			}
			return this;
        },
        
        /**
		 * 渲染天数结构
		 * @method renderDay
         * @param {String | Number} y 当前年份
         * @param {String | Number} m 当前月份，不以0开头的十进制数
		 * @chainable
		 */
        renderDay: function(y, m) {
            var that = this, r = that._getDayRange(y, m), t,
                options = that._D._node.options, l = options.length;
            
			if (l > 1 && options[1].value == r.min && options[l - 1].value == r.max) { return this; }
			that._D._node.innerHTML = '';
			that._D._node.add(new Option('-', ''), undefined);
			for (i = r.min; i <= r.max; i++) {
                t = i >= 10 ? i : '0' + i;
				that._D._node.add(new Option(t, t), undefined);
			}
			return this;
        },
		
		/**
		 * 重置日期为空
		 * @method renderDay
		 * @chainable
		 */
		reset: function() {
			var that = this;
			that.renderYear().renderMonth().renderDay(); 
			that._Y._node.options[0].selected = true;
            that._M._node.options[0].selected = true;
            that._D._node.options[0].selected = true;
			that.set('date', '');
			return this;
		},
        
        /**
		 * 获取年份区间
		 * @method _getYearRange
         * @return {Object}
		 * @private
		 */
        _getYearRange: function() {
            var that = this;
            return {
                min: that._dsYear,
                max: that._deYear
            };
        },
        
        /**
		 * 获取月份区间
		 * @method _getMonthRange
         * @param y {Number}
         * @return {Object}
		 * @private
		 */
        _getMonthRange: function(y) {
            var that = this, min = 1, max = 12;
            if (y == that._dsYear) {
                min = that._dsMonth;
            }
            if (y == that._deYear) {
                max = that._deMonth;
            }            
            return {
                min: min,
                max: max
            };
        },
        
        /**
		 * 获取天数区间
		 * @method _getMonthRange
         * @param y {Number}
         * @param m {Number}
         * @return {Object}
		 * @private
		 */
        _getDayRange: function(y, m) {
            var that = this, min = 1, max = 31;
            if (m) {
                if (m != 2) {
                    max = that._dayInMonth[m - 1];
                } else {
                    max = that._isLeapYear(y) ? 29 : 28;
                }
                if (y == that._dsYear && m == that._dsMonth) {
                    min = that._dsDay;
                }
                if (y == that._deYear && m == that._deMonth) {
                    max = that._deDay;
                }
            }            
            return {
                min: min,
                max: max
            };
        }
    };
    
    Y.extend(Y.DateCascade, Base, dcProto);

    /**
     * 日期级联组件扩展 input 实例
     * @author huya.nzb@taobao.com 虎牙
     */

    YUI.namespace('Y.DateCascade.Input');

    /**
     * 日期级联组件扩展 input 实例
     *
     * @module datecascade
     * @submodule datecascade-input
     * @for DateCascade
     * @requires datecascade-base
     */  
 
	/**
	 * 日期级联组件扩展 input 实例
	 * @class DateCascade.Input
	 * @extends DateCascade
	 * @constructor
	 */    
    Y.DateCascade.Input = function() {
        Y.DateCascade.Input.superclass.constructor.apply(this, arguments);
    };
    
    Y.DateCascade.Input.NAME = 'datecascade-input';
    
    Y.extend(Y.DateCascade.Input, Y.DateCascade, {
        
        /**
		 * 初始化
		 * @method initializer
		 * @private
		 */
        initializer: function() {
            var that = this, id = that.get('id');            
            that._buildSelector();            
            that._Y = Y.one('#' + id + '_selectyear');
            that._M = Y.one('#' + id + '_selectmonth');
            that._D = Y.one('#' + id + '_selectday');
            
            that._events = [];
            
            if (!that._Y || !that._M || !that._D) { return; }           
            //月份天数
            that._dayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            that.render();
			that._bindEvent();
        }, 
        
        /**
         * 生成级联菜单结构
         * @method _buildSelector
         * @private
         */
        _buildSelector: function() {
            var that = this, id = that.get('id');
            if (!(that.input = Y.one('#' + id))) { return; }
            if (that.box) { that.box.remove(); }
			that.input.setStyle('display','none');
			that.box = Y.Node.create('<span class="datecascade"><select id="' + id + '_selectyear" class="dc-year"><option value="">-</option></select> 年 <select id="' + id + '_selectmonth" class="dc-month"><option value="">-</option></select> 月 <select id="' + id + '_selectday" class="dc-day"><option value="">-</option></select> 日 </span>');
			that.input.insert(that.box, 'after');
        }, 
        
        /**
		 * 绑定事件
		 * @method _bindEvent
		 * @private
		 */
        _bindEvent: function() {
            var that = this;
            
            that._events = that._events.concat([
                that._Y.on('change', function(e) {
                    that.set('year', that._Y._node.value);
                    that.setNewMonth(parseInt(that._M.get('value'), 10));
                }),
                that._M.on('change', function(e) {
                    that.set('month', that._M._node.value);
                    that.setNewDay(parseInt(that._D.get('value'), 10));
                }),
                that._D.on('change', function(e) {
                    that.set('day', that._D._node.value);
                    that.set('date', that.getSelectedDate());
                }),
                that.after('dateChange', function(e) {
                    that.updateDate();
                })
            ]);
        },
		
        /**
		 * 渲染结构
		 * @method render
		 * @chainable
		 * @param o {Object} 重置参数对象
		 */
        render: function(o) {
            var that = this;
            
            //重置参数
			that._parseParam(o);
            
			var _ds = that.get('dateStart'), _de = that.get('dateEnd'), _df = that.get('dateDefault'),
                _y = that._Y.get('value'), _m = that._M.get('value'), _d = that._D.get('value');

            //如果没有设定dateDefault，则取input的值为dateDefault
            if (!_df) {
                that.set('dateDefault', that.input.get('value').replace(/-/g, "/"));
                _df = that.get('dateDefault');
            }
            
			that._dsYear = _ds.getFullYear();
			that._dsMonth = _ds.getMonth() + 1;
			that._dsDay = _ds.getDate();
			that._deYear = _de.getFullYear();
			that._deMonth = _de.getMonth() + 1;
			that._deDay = _de.getDate();
			
            //如果是合法的默认日期，初始化各属性值
            if (_df && (that._inDateRange(_df))) {
                var _dfYear = _df.getFullYear() + '', _dfMonth = ((_df.getMonth() + 1) < 10 ? '0' : '') + (_df.getMonth() + 1), _dfDay = (_df.getDate() < 10 ? '0' : '') + _df.getDate();
                that.set('year', _dfYear);
                that.set('month', _dfMonth);
                that.set('day', _dfDay);
                that.set('date', _dfYear + '-' + _dfMonth + '' + _dfDay);
				that.setNewDate(_df);
			} else if (_y || _m || _d) {
                that.setNewDate(_y, _m, _d);
            } else {
				that.renderYear().renderMonth().renderDay();               
                //bugfix 如果不手动选中的话，firefox下会默认选中最后一个选项
                that._Y._node.options[0].selected = true;
                that._M._node.options[0].selected = true;
                that._D._node.options[0].selected = true;
			}
            return this;
        },
		
		/**
		 * 重置日期为空
		 * @method renderDay
		 * @chainable
		 */
		reset: function() {
			var that = this;
			that.renderYear().renderMonth().renderDay(); 
			that._Y._node.options[0].selected = true;
            that._M._node.options[0].selected = true;
            that._D._node.options[0].selected = true;
			that.set('date', '');
			that.input.set('value', '');
			return this;
		},
        
        /**
         * 更新input里的值
         * @method updateDate
         * @chainable
         */
        updateDate: function() {
            var that = this, v = that.getSelectedDate();
            //v && that.input.set('value', v);
            that.input.set('value', v);
            return this;
        }     
    });

}, '2.0.0', {
    requires: ['node', 'base']
});
