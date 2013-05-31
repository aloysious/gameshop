
YUI.add('vehicle', function(Y) {

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
    
    var TITLE_TEMPLATE = '<div class="yui3-vehicle-type yui3-vehicle-type-{type}"><strong class="yui3-vehicle-title">{title}</strong>{more}<em class="yui3-vehicle-counter">{counter}个结果</em></div>',
        ITEM_TEMPLATE = '<div class="yui3-vehicle-item" data-brandname={brandName} data-brandid={brandId} data-vid={vehicleId}>{display}<div>',
        MORE_TEMPLATE = '<a href="#" class="yui3-vehicle-more">更多&gt;&gt;</a>',
        BRAND_TEMPLATE = '<div class="yui3-vehicle-brand"></div>';
    
    function _defResultListLocator(results) {
        if (results.code == 0) {
            var r = results.results,
                ret = [],
                result;
            
            if (r && r.length == 1) {
                r = r[0].vehicles;
            }
            Y.Array.each(r, function(item) {
                Y.Array.each(item.vehicles, function(v, index) {
                    v['brand_names'] = item['brand_names'];
                    v['standard_names'] = item['standard_names'];
                    v['counter'] = item['counter'];
                    v['index'] = index;
                    ret.push(v);
                });  
            });
            return ret.length ? ret : null;
        } else {
            return null;
        }
    }
    
    function _defResultTextLocator(result) {
        return [
            result.brand_name,
            result.standard_name,
            result.family_name,
            result.engine_desc,
            result.gearbox_name,
            result.parent_veh_name
        ].join(' ');
    }
    
    function _defResultFormatter(query, results) {
		var _this = this;
        return Y.Array.map(results, function (result) {
            var raw = result.raw,
                display = [
                    raw.standard_names ? raw.brand_name : raw.standard_name,
                    raw.family_name,
                    raw.engine_desc,
                    raw.gearbox_name,
                    raw.parent_veh_name,
                    raw.seat + '(参考价' + (_this.useTaxPrice ? raw.taxprice : raw.price) + ')'
                ].join(' '),
                ret = '';
            
            if (raw.index == 0) {
                ret += Y.Lang.sub(TITLE_TEMPLATE, {
                    type: raw.standard_names ? 'standard' : 'brand',
                    title: raw.standard_names ? raw.standard_names : raw.brand_name,
                    counter: raw.counter,
                    more: (!raw.standard_names && raw.counter > 1) ? MORE_TEMPLATE: ''
                });
            }
            ret += Y.Lang.sub(ITEM_TEMPLATE, {
                brandName: raw.brand_name,
                brandId: raw.brand_id,
                vehicleId: raw.vehicle_id,
                display: display
            });
            
            return ret;
        });
    }
    
    function _defRequestTemplate(query) {
        return Y.Lang.sub('&k={query}&marketdate={marketdate}&brandname={brandname}', {
            query: encodeURIComponent(query || ''),
            marketdate: encodeURIComponent(this.marketdate || ''),
            brandname: encodeURIComponent(this.brandname || '')
        });
    }
    
    function Vehicle() {
        Vehicle.superclass.constructor.apply(this, arguments);
    }
    
    Vehicle.DefACConfig = {
        source: 'http://stg.pa18.com/rsupport/vehicle/model?callback={callback}',
        shim: true,
        activateFirstItem: true,    
        scrollIntoView: false,
        resultListLocator: _defResultListLocator,
        resultTextLocator: _defResultTextLocator,
        resultFormatter: _defResultFormatter,
        width: '600px',
		shim: (Y.UA.ie == 6)
    };
    
    Vehicle.NAME = 'vehicle';
    
    Y.extend(Vehicle, Y.Base, {
        
        initializer: function(config) {
            config || (config = {});
            this.ACConfig = Y.merge(Vehicle.DefACConfig, config, { render: false });
            this.AC = new Y.AutoComplete(this.ACConfig);
			this.AC.useTaxPrice = !!config.useTaxPrice;
            
            this.AC.set('requestTemplate', Y.bind(_defRequestTemplate, this.AC));
            this._setDefParentNode(config.defParentNode);
			this._setPlaceholder();
            Y.before(this._bindMoreClick, this.AC, 'bindUI', this);
            
            if (config.render) {
                this.render();
            }
        },
        
        destructor: function() {
            this.AC.destroy(true);
        },
        
        render: function() {
            this.AC.render();
            this.AC.get('boundingBox').addClass('yui3-vehicle');
            this._renderBrandNode();
            this._bindACEvents();
        },
        
		_setPlaceholder: function() {
            Y.Placeholder.init(this.AC.get('inputNode'));
        },
		
        _bindACEvents: function() {
            this.AC.on('results', this._toggleBrandName);
            this.AC.on('results', this._ACSizeShim);
            this.AC.after('resultsChange', this._ACSizeShim);
            this.AC.after('visibleChange', this._ACSizeShim);
            this.AC.after('valueChange', this._clearBrandName);
            this.AC.get('contentBox').delegate('click', this._onBrandNameClick, '.yui3-vehicle-brand span', this.AC);
        },
        
        _clearBrandName: function(e) {
            if (e.newVal == '') {
                this.brandname = '';
            }
        },
		
		_ACSizeShim: function() {
			if (Y.UA.ie == 6 && this.get('visible')) {
				this.sizeShim();
			}
		},
        
        _toggleBrandName: function(e) {
            if (e.results.length && this.brandname) {
                this._brandNode.setStyle('display', 'block');
            } else {
                this._brandNode.setStyle('display', 'none');
            } 
        },
        
        _onMoreVehicleClick: function(e) {
            var item = e.currentTarget.ancestor('li'),
                result = item.getData('result'),
                brandName = result.raw.brand_name,
                val = Y.Lang.trim(this._inputNode.get('value')),
                newVal = brandName + val;
            
            e.halt(true);
            this.brandname = brandName;
            if (val.substr(0, brandName.length) != brandName){
                this._inputNode.set('value', newVal);
            }
            this._brandNode.setContent('您当前选择的品牌为：<span>' + brandName + '</span>');
            this.set('value', newVal, {
                src: Y.AutoCompleteBase.UI_SRC
            });
            this._inputNode.focus();
        },
        
        _onBrandNameClick: function(e) {
            var val = Y.Lang.trim(this._inputNode.get('value')),
                newVal = val;
                
            if(this.brandname && this.brandname == val.substr(0, this.brandname.length)){
                newVal = val.substr(this.brandname.length);
                this._inputNode.set('value', newVal);
            }
            this._brandNode.setStyle('display', 'none');
            this.brandname = '';
            
            if (newVal !== val) {
                this.set('value', newVal, {
                    src: Y.AutoCompleteBase.UI_SRC
                });
            } else {
                this.sendRequest(val);
            }
            this._inputNode.focus();
        },
        
        _setDefParentNode: function(node) {
            node = Y.one(node);
            this.AC.DEF_PARENT_NODE = node || this.AC.DEF_PARENT_NODE || null;
        },
        
        _renderBrandNode: function() {
            var brandNode = Y.Node.create(BRAND_TEMPLATE);
            this.AC.get('contentBox').prepend(brandNode);
            this.AC._brandNode = brandNode;
        },
        
        _bindMoreClick: function() {
            this.AC._listNode.delegate('click', this._onMoreVehicleClick, '.yui3-vehicle-more', this.AC);
        }
        
    });
    
    Y.Vehicle = Vehicle;
    
}, '0.0.1', {
    requires: ['vehicle-skin', 'placeholder', 'widget-stack', 'autocomplete']
});