/**
 * Singleton
 */
KISSY.add(function(S) {
    var D = S.DOM, E = S.Event,

        PUSH = Array.prototype.push,
        EMPTY = '',

        // sku组合对应的默认数据
        __default = {},
        // sku组合对应的填充数据
        __combo = {},
        // 当前选择的销售属性的数据集合，按组划分
        __groups = [],
        // 用于渲染comboTable的数据源
        __render = {},
        sortGroups = {},
        defConfig = {
            suitable: true
        };

    /**
     * filter 对所有销售属性组进行过滤和分组。不同分组数据不互斥
     * @param {Object} groups 当前的所有销售属性组。包含运营定义和卖家自定义。
     */
    function filter(groups) {
        var combo = [],
            selected = [],
            invalid = [],
            isSuits = true;     // 是否所有销售属性都选择了。
        S.each(groups, function(group) {
            if(group === undefined) return;

            var length = group.fields.length,
                caption = S.trim(group.caption),
                avaialable = length > 0 && caption !== EMPTY;

            // 记录是否存在无效的销售属性。即没有销售属性名称（自定义）或没有销售属性值。
            if(isSuits && !avaialable) {
                isSuits = false;
            }
            if(group.isRequired || avaialable) {
                selected.push(group);
            }else {
                invalid.push(group);
            }

            // 如果存在有效销售属性pv对或销售属性是必选的，
            // 则可以参与sku组合
            if(group.isRequired || avaialable) {
                combo.push(group);
            }
        });

        // 如果销售属性需要成套，且至少一个销售属性有效，且当前有任意一个销售属性组没有勾选。
        // 则不进行sku组合
        if(defConfig.suitable && selected.length > 0 && !isSuits) {
            combo = [];
        }
        return {
            combo: combo, 
            selected: selected, 
            invalid: invalid
        };
    }

    return S.mix({
        init: function(cfg) {
            var self = this;
            defConfig = S.merge(defConfig, cfg);
        },
        dataChange: function() {
            sortGroups = filter(__groups);

            this.fire('dataChanged', {groups: sortGroups});
        },
        setDefault: function(key, value) {
            if(value == undefined) return;
            __default[key] = value;
        },
        getDefault: function(key) {
            return key ? __default[key] : __default;
        },
        setCombo: function(key, value) {
            var item = __combo[key];
            if(!item) {
                __combo[key] = value;
            }
        },
        getCombo: function(key) {
            return key ? __combo[key] : __combo;
        },
        setRender: function(data) {
            __render = data;
        },
        getRender: function() {
            return __render;
        },
        // 根据指定数据，更新render数据源中的销售属性值。
        updateRender: function(items, group) {
            if(!items || items.length === 0) return;
            items = S.makeArray(items);
            // 同步更新comboTable中尚未渲染出来的数据。
            var idx = S.indexOf(group, sortGroups.combo);
            S.each(__render.list, function(it) {
                var pvs = it.id.split(';');
                // 每个数据循环比对。
                S.each(items, function(target, i) {
                    if(pvs[idx] == target.pv) {
                        var item = it.items[idx];
                        item.alias = target.alias || target.name;
                        return false;
                    }
                });
            });
        },
        // 更新数据源中的价格。
        updatePrice: function(price) {
            var self = this;
            S.each(__render.list, function(item) {
                var data = item.data;
                // 如果价格值是空的，则将新价格填充进去。便于后续渲染能正常
                if(data.price === EMPTY) {
                    data.price = price;
                    var combo = self.getCombo(item.id);
                    combo.price = price;
                }
            });
        },
        removeGroup: function(group) {
            // 直接清空内容
            __groups[group.index] = undefined;
        },
        getGroups: function() {
            return __groups;
        },
        addGroup: function(group) {
            group.index = __groups.length;
            __groups.push(group);
        },
        getSortGroups: function(groups) {
            return filter(__groups);
        }
    }, S.EventTarget);
});
