/**
 * Singleton
 */
KISSY.add(function(S) {
    var D = S.DOM, E = S.Event,

        PUSH = Array.prototype.push,
        EMPTY = '',

        // sku��϶�Ӧ��Ĭ������
        __default = {},
        // sku��϶�Ӧ���������
        __combo = {},
        // ��ǰѡ����������Ե����ݼ��ϣ����黮��
        __groups = [],
        // ������ȾcomboTable������Դ
        __render = {},
        sortGroups = {},
        defConfig = {
            suitable: true
        };

    /**
     * filter ������������������й��˺ͷ��顣��ͬ�������ݲ�����
     * @param {Object} groups ��ǰ���������������顣������Ӫ����������Զ��塣
     */
    function filter(groups) {
        var combo = [],
            selected = [],
            invalid = [],
            isSuits = true;     // �Ƿ������������Զ�ѡ���ˡ�
        S.each(groups, function(group) {
            if(group === undefined) return;

            var length = group.fields.length,
                caption = S.trim(group.caption),
                avaialable = length > 0 && caption !== EMPTY;

            // ��¼�Ƿ������Ч���������ԡ���û�������������ƣ��Զ��壩��û����������ֵ��
            if(isSuits && !avaialable) {
                isSuits = false;
            }
            if(group.isRequired || avaialable) {
                selected.push(group);
            }else {
                invalid.push(group);
            }

            // ���������Ч��������pv�Ի����������Ǳ�ѡ�ģ�
            // ����Բ���sku���
            if(group.isRequired || avaialable) {
                combo.push(group);
            }
        });

        // �������������Ҫ���ף�������һ������������Ч���ҵ�ǰ������һ������������û�й�ѡ��
        // �򲻽���sku���
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
        // ����ָ�����ݣ�����render����Դ�е���������ֵ��
        updateRender: function(items, group) {
            if(!items || items.length === 0) return;
            items = S.makeArray(items);
            // ͬ������comboTable����δ��Ⱦ���������ݡ�
            var idx = S.indexOf(group, sortGroups.combo);
            S.each(__render.list, function(it) {
                var pvs = it.id.split(';');
                // ÿ������ѭ���ȶԡ�
                S.each(items, function(target, i) {
                    if(pvs[idx] == target.pv) {
                        var item = it.items[idx];
                        item.alias = target.alias || target.name;
                        return false;
                    }
                });
            });
        },
        // ��������Դ�еļ۸�
        updatePrice: function(price) {
            var self = this;
            S.each(__render.list, function(item) {
                var data = item.data;
                // ����۸�ֵ�ǿյģ����¼۸�����ȥ�����ں�����Ⱦ������
                if(data.price === EMPTY) {
                    data.price = price;
                    var combo = self.getCombo(item.id);
                    combo.price = price;
                }
            });
        },
        removeGroup: function(group) {
            // ֱ���������
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
