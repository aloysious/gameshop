/**
 * Singleton
 */
KISSY.add(function(S, OfficialGroup, CustomGroup, ImageTable, ComboTable, DataCenter) {
    var D = S.DOM, E = S.Event,

        unsaveGroup = null,     // 未保存的自定义销售属性
        FEATURE_IMAG = 'image',

        MAX_SKUCOUNT = 600,
        MAX_CUSTOMGROUPS = 4,   // 最多可增加的自定义销售属性数量上限
        MAX_COMBOGROUPS = 4;    // 有效销售属性的数量上限

    function alertSKUCount(valid) {
        if(!valid) {
            alert('您的销售属性的组合超过600组，会导致页面性能问题，请适量删减至600组以下。');
        }
    }

    //重新渲染错误提示	
    function FormErrorRender(){
        if (typeof WT !== 'undefined' && WT && WT.Form && WT.FormPostip) {
            WT.FormPostip.reposAllTip();
        }
    }

    function getSKUCount(group) {
        // 先获取有效的属性组。
        // 不用getSortGroups方法获取的原因。创建自定义属性且未保存时，该方法返回的groups.combo不包含空的销售属性。
        var groups = DataCenter.getGroups(),
            count = S.reduce(groups, function(val, curr) {
                if(!curr) return val;
                // 如果不是当前操作的组，则获取已经保存的表单数据
                // 若是操作本身，则获取当前操作时的表单数据。
                var nodes = !curr.isDisabled && curr == group ? curr.getDataNode() : curr.fields,
                    length = nodes.length;
                return length > 0 ? val * length : val;
            }, 1),
            rt = count <= MAX_SKUCOUNT;
        return rt;
    }

    /**
     * addCustomGroup 增加一组卖家自定义销售属性
     * @param {Object} data 用于填充属性/属性值的数据源
     */
    function addCustomGroup(elContainer, data, cfg) {
        var group = new CustomGroup(data, cfg);

        // 自定义销售属性，会影响comboTable结构变化的事件触发
        group.on('dataChanged', function(ev) {
            //buildAvailableCPV();
            DataCenter.dataChange();
        });

        group.on('validBeforeSave', function(ev) {
            var rt = getSKUCount(group);
            alertSKUCount(rt);
            return rt;
        });

        // 自定义销售属性值的修改更新
        group.on('dataUpdated', function(ev) {
            var items = ev.items,
                salepropitems = [];
            S.each(items, function(item) {
                var nodes = D.query('.J_Map_'+ item.id, elContainer),
                    // 不用item.name，确保获取的是最新的值。
                    text = S.escapeHTML(item.target.value);
                if(nodes.length > 0) {
                    // 值已经做过转义。
                    D.html(nodes, text);
                }
                // 如果是caption值，不需要对组合数据进行进一步的更新。
                if(item.context !== 'caption') {
                    // 转义后的作为alias传入DataCenter，统一处理
                    item.alias = text;
                    salepropitems.push(item);
                }
            });

            // 更新组合表格的数据。
            DataCenter.updateRender(salepropitems, this);
        });

        // 删除自定义销售属性的事件触发
        group.on('remove', function() {
            DataCenter.removeGroup(this);
        });

        // 将当前的自定义销售属性组加入到数据中心中
        DataCenter.addGroup(group);
    }

    // 当用户没有滚动sku组合表格的滚动条的时候，未渲染的表单域在页面中是不存在的。
    // 如果在编辑宝贝的时候，部分数据没有被渲染出来，会导致数据丢失。
    // 这里将默认的已经存在的sku记录先用隐藏域保存在页面中。
    // 后端优先获取标准的已经渲染的表单域数据。若不存在，则获取带有“:old”的表单域的数据。
    // 到这个步骤时，校验sku是否有效，若有效，则说明有正确的数据。若无效，则使用一口价作为默认价格，库存默认为0，tsc默认为空。
    // 目前后端判断是否有效的条件是： price >0 && quantity >= 0
    function addDefaultHidden(elContainer, data) {
        if(!data) return;
        var fragment = [],//document.createDocumentFragment(),
            tmpl = '<input type="hidden" name="{key}:id:old" value="{skuid}" /><input type="hidden" name="{key}:p:old" value="{price}" /><input type="hidden" name="{key}:q:old" value="{quantity}" /><input type="hidden" name="{key}:tsc:old" value="{tsc}" />';
        S.each(data, function(val, key) {
            var _data = val;
            _data.key = key;
            fragment.push(S.substitute(tmpl, _data));
        });

        fragment.unshift('<div id="defaultSKUHidden" style="display:none;">');
        fragment.push('</div>');

        D.append(D.create(fragment.join('')), elContainer);
    }

    var buildAvailableCPV = function() {
        var rt = [],
            groups = DataCenter.getGroups();
        S.each(groups, function(group) {
            if(group && group.type === 'CustomGroup') {
                rt.push(group.fetchCPVId());
            }
        });
        return rt.join(';');
    };

    return {
        init: function(elContainer, data) {
            var self = this,
                cfg = data.config;
            self.buildOfficialGroup(elContainer, cfg);
            self.buildCustomGroup(elContainer, data.groups, cfg);

            cfg.isDistribution = !!data.distribution;
            self.initComboTable(D.get('#J_SKUMapContainer'), cfg);
            // initDataCenter包含初始的dataChanged事件触发，要放到最后执行。
            self.initDataCenter(data, cfg);

            // 增加sku记录的默认值表单域。
            // 便于后端从中获取原始数据——动态增加的表单域可能并没有全部加载出来。
            addDefaultHidden(elContainer, data.combo);
			
        },
        buildOfficialGroup: function(elContainer, cfg) {
            var elGroups = D.query('.sku-group', elContainer);
            // 初始化处理运营设置的销售属性。
            S.each(elGroups, function(elGroup) {
                var group = new OfficialGroup(elGroup);

                // 如果features中包含 image标识，则初始化imagetable
                if(group.hasFeature(FEATURE_IMAG)) {
                    group.ImageTable = new ImageTable(group, cfg);
                    group.ImageTable.toggle();
                }

                // 官方销售属性，别名的更新
                group.on('dataUpdated', function(ev) {
                    var target = ev.target,
                        nodes = D.query('.J_Map_'+target.id, elContainer);
                    if(nodes.length === 0) return;
                    // 值已经做过转义。
                    D.html(nodes, target.alias || target.name);

                    DataCenter.updateRender(target, this);
                });

                // 定义 combo layout数据发生变化时对应的操作
                group.on('dataChanged', function(ev) {
                    var self = this;
                    self.ImageTable && self.ImageTable.toggle();
                    DataCenter.dataChange();
                });

                group.on('validBeforeSave', function(ev) {
                    var rt = getSKUCount(group);
                    alertSKUCount(rt);
                    return rt;
                });

                DataCenter.addGroup(group);
                // 如果是成套的情况下，最多可以添加的自定义销售属性数量为
                // 4-N.其中N表示当前运营定义的销售属性数量。
                if(cfg.suitable) {
                    MAX_CUSTOMGROUPS --;
                }
            });
        },
        buildCustomGroup: function(elContainer, groupDatas, cfg) {
            // 初始化设置pvid的初始值。
            CustomGroup.setInitializePV(cfg.MAX_PID, cfg.MAX_VID);
            // 初始化用户设置的销售属性组
            S.each(groupDatas, function(group) {
                addCustomGroup(elContainer, group, cfg);
            });
        },
        initComboTable: function(elContainer, data, cfg) {
            ComboTable.init(elContainer, data, cfg);

            // 每次ComboTable的render操作
            // 会触发函数来更新当前的combo数据源。
            // 确保当前渲染的sku组合的数据得到保存。
            ComboTable.on('adapter', function(ev) {
                var data = ev.renderData;
                S.each(data.list, function(it) {
                    DataCenter.setCombo(it.id, it.data);
                });
                DataCenter.setRender(data);

				//移除错误提示
				var SKUNodes = S.all('#J_SKUMapContainer input');
				SKUNodes.each(function(node){
					if(WT.Form)WT.Form.removeFieldElem(node[0]);
				});
                //data.list.length > 0 && this.fire("quantityChanged priceChanged");
            });

            // comboTable中的数据发生修改以后，在combo数据源中进行更新。
            // 同时触发数据更新的事件。
            ComboTable.on('comboChanged', function(ev) {
                var target = ev.target,
                    id = target.getAttribute('data-id'),
                    type = target.getAttribute('data-type'),
                    combo = DataCenter.getCombo(),
                    data = combo[id];
                data[type] = target.value;
                DataCenter.setCombo(id, data);

                // 商家编码不需要进行其他的更新操作。
                type === "quantity" && this.fire('quantityChanged');
                type === "price" && this.fire('priceChanged');

           		if(WT.Form){
					WT.Form.addFieldElem(target);
					WT.Form.handleBlur(target);
				}
            });
        },
        initDataCenter: function(data, cfg) {
            var distributionData = data.distribution || {};
            // 数据中心的初始化。
            DataCenter.init(cfg);

            // 表单若值为空(空格也无效)，则默认不发送参数。
            // 故这里设置一个默认值，使数据正常发送，便于后端判断是元素不存在还是值为空。
            DataCenter.setDefault('skuid', '0');
            DataCenter.on('dataChanged', function(ev) {
                var groups = ev.groups,
                    comboGroups = groups.combo,
                    comboData = this.getCombo(),
                    defData = this.getDefault();
                ComboTable.render(comboGroups, comboData, defData, distributionData);
				FormErrorRender();
            });

            // 设置销售属性组的可用性。disable/enable
            DataCenter.on('dataChanged', function(ev) {
                var groups = ev.groups,
                    length = groups.selected.length,
                    disabled = length >= MAX_COMBOGROUPS ? true : false;

                // 设置invalid分组的销售属性组disable，同时其他的设为enable
                S.each(groups, function(collection, key) {
                    S.each(collection, function(group) {
                        group[S.inArray(group, groups.invalid)&&disabled ? 'disable' : 'enable']();
                    });
                });
            });

            // 初始添加数据源，组合数据
            S.each(data.combo, function(val, key) {
                DataCenter.setCombo(key, val);
            });
            // 是否分销宝贝，添加采购价的默认值
            if(data.distribution) {
                DataCenter.setDefault('caiGouPrice', data.distribution.defaultCaiGouPrice);
                DataCenter.setDefault('region', data.distribution.defaultRegion);
            }

            // 初始的渲染触发
            DataCenter.dataChange();
        },
        bindAvaialCPVS: function(input) {
            var getAvailableCPV = buildAvailableCPV;
            buildAvailableCPV = function() {
                var rt = getAvailableCPV();
                input.value = rt;
            };
        },
        bindAddGroup: function(elAddCustomGroup, elContainer, cfg) {
            E.on(elAddCustomGroup, 'click', function(ev) {
                addCustomGroup(elContainer, {}, cfg);

                var isMaxCount = maxCustomGroup();
                disable(isMaxCount);
				//html5form
				var groupNodes = S.all('#J_CustomSKUList .sku-group');
				groupNodes.item(groupNodes.length - 1).all('input').each(function(node){
           			if(WT.Form)WT.Form.addFieldElem(node[0]);
				});
				FormErrorRender();
            });

            DataCenter.on('dataChanged', function(ev) {
                var groups = ev.groups,
                    length = groups.selected.length,
                    isDisabled = length >= MAX_COMBOGROUPS ? true : maxCustomGroup();

                disable(isDisabled);
            });

            function maxCustomGroup() {
                var customGroups = D.query('div.sku-custom', '#J_CustomSKUList'),
                    length = customGroups.length;
                return length >= MAX_CUSTOMGROUPS;
            }
            
            function disable(isDisabled) {
                var method = isDisabled ? 'addClass' : 'removeClass';
                D.prop(elAddCustomGroup, 'disabled', isDisabled);
                D[method](elAddCustomGroup, 'disabled');
            }

            // 针对ie6的hover效果补丁
            (S.UA.ie === 6) && E.on(elAddCustomGroup, 'mouseenter mouseleave', function(ev) {
                var method = ev.type === "mouseenter" ? 'addClass' : 'removeClass';
                D[method](this, 'hover');
            });
        },
        bindPrice: function(elPrice) {
            E.on(elPrice, 'blur', function(ev) {
                var target = ev.target,
                    price = S.trim(target.value);
                if(DataCenter.getDefault('price') !== price) { 
                    setPrice(price);

                    // 填充价格到当前所有price为空sku中。
                    S.each(D.query('.J_MapPrice'), function(input) {
                        if(S.trim(input.value) === '') {
                            var id = D.attr(input, 'data-id'),
                                combo = DataCenter.getCombo(id);
                            input.value = price;
                            // 同步combo数据。
                            combo.price = price;
                        }
                    });
                    // 更新组合表格的数据。
                    DataCenter.updatePrice(price);
                }
            });
            setPrice(S.trim(elPrice.value));

            function setPrice(value) {
                DataCenter.setDefault("price", value);
            }
        },
        bindQuantity: function(elQuantity) {
            ComboTable.on('quantityChanged', function(ev) {
                var combo = DataCenter.getCombo(),
                    quantity = 0;
                S.each(DataCenter.getRender().list, function(it) {
                    var item = combo[it.id];
                    quantity += item.quantity *1 || 0;
                });
                elQuantity.value = quantity;
            });
        },
        hasSaved: function() {
            buildAvailableCPV();
            var isSaved = true;
            S.each(DataCenter.getGroups(), function(group) {
                if(group && group.type == "CustomGroup" && !group.hasSaved()) {
                    isSaved = false;
                    unsaveGroup = group;
                    return false;
                }
            });

            return isSaved;
        },
        showUnsavedTip: function() {
            Atpanel.send("http://www.atpanel.com/tbsell.100.2", {
                valid: false
            });
            unsaveGroup && unsaveGroup.focus();
            alert('您添加的销售属性有数据未保存，请保存后重新提交。');
        },
        expandColors: function() {
            S.each(DataCenter.getGroups(), function(group) {
                if(group && group.type == "CustomGroup" && !group.hasSaved()) {
                    isSaved = false;
                    unsaveGroup = group;
                    return false;
                }
            });
        }
    };
}, {requires: ['./officialgroup', './customgroup', './imagetable', './combotable', './datacenter']});
