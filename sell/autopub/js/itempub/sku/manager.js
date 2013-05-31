/**
 * Singleton
 */
KISSY.add(function(S, OfficialGroup, CustomGroup, ImageTable, ComboTable, DataCenter) {
    var D = S.DOM, E = S.Event,

        unsaveGroup = null,     // δ������Զ�����������
        FEATURE_IMAG = 'image',

        MAX_SKUCOUNT = 600,
        MAX_CUSTOMGROUPS = 4,   // �������ӵ��Զ�������������������
        MAX_COMBOGROUPS = 4;    // ��Ч�������Ե���������

    function alertSKUCount(valid) {
        if(!valid) {
            alert('�����������Ե���ϳ���600�飬�ᵼ��ҳ���������⣬������ɾ����600�����¡�');
        }
    }

    //������Ⱦ������ʾ	
    function FormErrorRender(){
        if (typeof WT !== 'undefined' && WT && WT.Form && WT.FormPostip) {
            WT.FormPostip.reposAllTip();
        }
    }

    function getSKUCount(group) {
        // �Ȼ�ȡ��Ч�������顣
        // ����getSortGroups������ȡ��ԭ�򡣴����Զ���������δ����ʱ���÷������ص�groups.combo�������յ��������ԡ�
        var groups = DataCenter.getGroups(),
            count = S.reduce(groups, function(val, curr) {
                if(!curr) return val;
                // ������ǵ�ǰ�������飬���ȡ�Ѿ�����ı�����
                // ���ǲ����������ȡ��ǰ����ʱ�ı����ݡ�
                var nodes = !curr.isDisabled && curr == group ? curr.getDataNode() : curr.fields,
                    length = nodes.length;
                return length > 0 ? val * length : val;
            }, 1),
            rt = count <= MAX_SKUCOUNT;
        return rt;
    }

    /**
     * addCustomGroup ����һ�������Զ�����������
     * @param {Object} data �����������/����ֵ������Դ
     */
    function addCustomGroup(elContainer, data, cfg) {
        var group = new CustomGroup(data, cfg);

        // �Զ����������ԣ���Ӱ��comboTable�ṹ�仯���¼�����
        group.on('dataChanged', function(ev) {
            //buildAvailableCPV();
            DataCenter.dataChange();
        });

        group.on('validBeforeSave', function(ev) {
            var rt = getSKUCount(group);
            alertSKUCount(rt);
            return rt;
        });

        // �Զ�����������ֵ���޸ĸ���
        group.on('dataUpdated', function(ev) {
            var items = ev.items,
                salepropitems = [];
            S.each(items, function(item) {
                var nodes = D.query('.J_Map_'+ item.id, elContainer),
                    // ����item.name��ȷ����ȡ�������µ�ֵ��
                    text = S.escapeHTML(item.target.value);
                if(nodes.length > 0) {
                    // ֵ�Ѿ�����ת�塣
                    D.html(nodes, text);
                }
                // �����captionֵ������Ҫ��������ݽ��н�һ���ĸ��¡�
                if(item.context !== 'caption') {
                    // ת������Ϊalias����DataCenter��ͳһ����
                    item.alias = text;
                    salepropitems.push(item);
                }
            });

            // ������ϱ������ݡ�
            DataCenter.updateRender(salepropitems, this);
        });

        // ɾ���Զ����������Ե��¼�����
        group.on('remove', function() {
            DataCenter.removeGroup(this);
        });

        // ����ǰ���Զ���������������뵽����������
        DataCenter.addGroup(group);
    }

    // ���û�û�й���sku��ϱ��Ĺ�������ʱ��δ��Ⱦ�ı�����ҳ�����ǲ����ڵġ�
    // ����ڱ༭������ʱ�򣬲�������û�б���Ⱦ�������ᵼ�����ݶ�ʧ��
    // ���ｫĬ�ϵ��Ѿ����ڵ�sku��¼���������򱣴���ҳ���С�
    // ������Ȼ�ȡ��׼���Ѿ���Ⱦ�ı������ݡ��������ڣ����ȡ���С�:old���ı�������ݡ�
    // ���������ʱ��У��sku�Ƿ���Ч������Ч����˵������ȷ�����ݡ�����Ч����ʹ��һ�ڼ���ΪĬ�ϼ۸񣬿��Ĭ��Ϊ0��tscĬ��Ϊ�ա�
    // Ŀǰ����ж��Ƿ���Ч�������ǣ� price >0 && quantity >= 0
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
            // initDataCenter������ʼ��dataChanged�¼�������Ҫ�ŵ����ִ�С�
            self.initDataCenter(data, cfg);

            // ����sku��¼��Ĭ��ֵ����
            // ���ں�˴��л�ȡԭʼ���ݡ�����̬���ӵı�����ܲ�û��ȫ�����س�����
            addDefaultHidden(elContainer, data.combo);
			
        },
        buildOfficialGroup: function(elContainer, cfg) {
            var elGroups = D.query('.sku-group', elContainer);
            // ��ʼ��������Ӫ���õ��������ԡ�
            S.each(elGroups, function(elGroup) {
                var group = new OfficialGroup(elGroup);

                // ���features�а��� image��ʶ�����ʼ��imagetable
                if(group.hasFeature(FEATURE_IMAG)) {
                    group.ImageTable = new ImageTable(group, cfg);
                    group.ImageTable.toggle();
                }

                // �ٷ��������ԣ������ĸ���
                group.on('dataUpdated', function(ev) {
                    var target = ev.target,
                        nodes = D.query('.J_Map_'+target.id, elContainer);
                    if(nodes.length === 0) return;
                    // ֵ�Ѿ�����ת�塣
                    D.html(nodes, target.alias || target.name);

                    DataCenter.updateRender(target, this);
                });

                // ���� combo layout���ݷ����仯ʱ��Ӧ�Ĳ���
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
                // ����ǳ��׵�����£���������ӵ��Զ���������������Ϊ
                // 4-N.����N��ʾ��ǰ��Ӫ�������������������
                if(cfg.suitable) {
                    MAX_CUSTOMGROUPS --;
                }
            });
        },
        buildCustomGroup: function(elContainer, groupDatas, cfg) {
            // ��ʼ������pvid�ĳ�ʼֵ��
            CustomGroup.setInitializePV(cfg.MAX_PID, cfg.MAX_VID);
            // ��ʼ���û����õ�����������
            S.each(groupDatas, function(group) {
                addCustomGroup(elContainer, group, cfg);
            });
        },
        initComboTable: function(elContainer, data, cfg) {
            ComboTable.init(elContainer, data, cfg);

            // ÿ��ComboTable��render����
            // �ᴥ�����������µ�ǰ��combo����Դ��
            // ȷ����ǰ��Ⱦ��sku��ϵ����ݵõ����档
            ComboTable.on('adapter', function(ev) {
                var data = ev.renderData;
                S.each(data.list, function(it) {
                    DataCenter.setCombo(it.id, it.data);
                });
                DataCenter.setRender(data);

				//�Ƴ�������ʾ
				var SKUNodes = S.all('#J_SKUMapContainer input');
				SKUNodes.each(function(node){
					if(WT.Form)WT.Form.removeFieldElem(node[0]);
				});
                //data.list.length > 0 && this.fire("quantityChanged priceChanged");
            });

            // comboTable�е����ݷ����޸��Ժ���combo����Դ�н��и��¡�
            // ͬʱ�������ݸ��µ��¼���
            ComboTable.on('comboChanged', function(ev) {
                var target = ev.target,
                    id = target.getAttribute('data-id'),
                    type = target.getAttribute('data-type'),
                    combo = DataCenter.getCombo(),
                    data = combo[id];
                data[type] = target.value;
                DataCenter.setCombo(id, data);

                // �̼ұ��벻��Ҫ���������ĸ��²�����
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
            // �������ĵĳ�ʼ����
            DataCenter.init(cfg);

            // ����ֵΪ��(�ո�Ҳ��Ч)����Ĭ�ϲ����Ͳ�����
            // ����������һ��Ĭ��ֵ��ʹ�����������ͣ����ں���ж���Ԫ�ز����ڻ���ֵΪ�ա�
            DataCenter.setDefault('skuid', '0');
            DataCenter.on('dataChanged', function(ev) {
                var groups = ev.groups,
                    comboGroups = groups.combo,
                    comboData = this.getCombo(),
                    defData = this.getDefault();
                ComboTable.render(comboGroups, comboData, defData, distributionData);
				FormErrorRender();
            });

            // ��������������Ŀ����ԡ�disable/enable
            DataCenter.on('dataChanged', function(ev) {
                var groups = ev.groups,
                    length = groups.selected.length,
                    disabled = length >= MAX_COMBOGROUPS ? true : false;

                // ����invalid���������������disable��ͬʱ��������Ϊenable
                S.each(groups, function(collection, key) {
                    S.each(collection, function(group) {
                        group[S.inArray(group, groups.invalid)&&disabled ? 'disable' : 'enable']();
                    });
                });
            });

            // ��ʼ�������Դ���������
            S.each(data.combo, function(val, key) {
                DataCenter.setCombo(key, val);
            });
            // �Ƿ������������Ӳɹ��۵�Ĭ��ֵ
            if(data.distribution) {
                DataCenter.setDefault('caiGouPrice', data.distribution.defaultCaiGouPrice);
                DataCenter.setDefault('region', data.distribution.defaultRegion);
            }

            // ��ʼ����Ⱦ����
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

            // ���ie6��hoverЧ������
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

                    // ���۸񵽵�ǰ����priceΪ��sku�С�
                    S.each(D.query('.J_MapPrice'), function(input) {
                        if(S.trim(input.value) === '') {
                            var id = D.attr(input, 'data-id'),
                                combo = DataCenter.getCombo(id);
                            input.value = price;
                            // ͬ��combo���ݡ�
                            combo.price = price;
                        }
                    });
                    // ������ϱ������ݡ�
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
            alert('����ӵ���������������δ���棬�뱣��������ύ��');
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
