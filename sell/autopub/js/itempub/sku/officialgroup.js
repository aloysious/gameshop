KISSY.add(function(S, BaseGroup) {
    var D = S.DOM, E = S.Event,

        CLS_COLLAPSE = 'collapse',

        EMPTY = '',
        FEATURE_EDIT = 'edit',
        FEATURE_LIST = 'list',
        FEATURE_IMAG = 'image';

    var OfficialGroup = function() {
        //this.init.apply(this, arguments);
        // 执行基类的构造函数
        OfficialGroup.superclass.constructor.apply(this, arguments);
    };

    /**
     * 获取checkbox元素的信息数据
     * @param {HTMLElement} node 复选框元素集合
     * @returns {Object<JSON>} 提取的数据
     */
    function fetchNodeData(node) {
        var parent = node.parentNode,
            elAlias = D.get('.editbox', parent),
            elName = D.get('.labelname', parent),
            pv = node.value;
        return {
            id: pv.replace(':', '-'),
            pv: pv,      // propertyId:valueId
            alias: encodeHTML(D.val(elAlias)),
            name: encodeHTML(D.text(elName)),
            color: node.getAttribute('data-color'),
            imgThumb: node.getAttribute('data-thumb'),
            imgPath: node.getAttribute('data-path')
        }; 
    }

    function encodeHTML(text) {
        return text && S.escapeHTML(text); //text.replace('<', '&lt;').replace('>', '&gt;');
    }

    function toggleDisplayMode(box) {
        var chkboxs = D.query('.J_Checkbox', box);
        S.each(chkboxs, function(chkbox) {
            var parent = D.parent(chkbox, '.sku-item');
            D[chkbox.checked ? 'addClass' : 'removeClass'](parent, 'edit');
        });
    }

    /**
     * 继承自BaseGroup对象
     */
    S.extend(OfficialGroup, BaseGroup, {
        init: function(elGroup, cfg) {
            OfficialGroup.superclass.init.apply(this, arguments);

            var self = this,
                caption = D.attr(elGroup, 'data-caption'),
                features = D.attr(elGroup, 'data-features') || FEATURE_LIST,
                isRequired = D.hasClass(elGroup, 'required');

            self.type = "OfficialGroup";
            // 默认设置销售属性的组数据
            self.caption = caption;
            self.features = features;
            self.isRequired = isRequired;

            // 获取初始化数据。
            self.fetchData();
            // 事件绑定操作
            self._bindEvent();
        },
        hasFeature: function(feature) {
            return this.features.indexOf(feature) != -1;
        },
        _bindEvent: function() {
            var self = this,
                elBox = self.elBox,
                isEditable = self.hasFeature(FEATURE_EDIT);

            // 初始化绑定复选框的点击 代理事件
            E.delegate(elBox, 'click', function(chkbox) {
                if(D.hasClass(chkbox, 'J_Checkbox') || D.hasClass(chkbox, 'J_CheckAll')) {
                    return true;
                }
            }, function(ev) {
                var target = ev.currentTarget,
                    isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE),
                    oldData = self.fields,
                    checked = target.checked,
                    chkboxs = [target];

                // 如果是全选
                if(D.hasClass(target, 'J_CheckAll')) {
                    chkboxs = D.filter(D.query('.J_Checkbox', elBox), function(el) {
                        return el.checked == !checked && !(isCollapse && D.hasClass(D.parent(el, 'li'), 'hide'));
                    });
                    D.prop(chkboxs, 'checked', checked);
                    // 把全选这个checkbox也包含进来。便于校验时的统一设置
                    chkboxs.push(target);
                }
                // 获取和设置所有已经勾选的元素的信息
                self.fetchData();

                if(self.fire('validBeforeSave') === false) {
                    // 如果校验失败，则需要回滚操作：
                    // 1. checkbox勾选状态的回滚
                    // 2. 数据的回滚。
                    D.prop(chkboxs, 'checked', !checked);
                    self.fields = oldData;
                    return;
                }

                // 对于可编辑sku列表，设置显示状态。
                if(isEditable) {
                    toggleDisplayMode(elBox);
                }

                self.fire('dataChanged');
            });

            E.delegate(elBox, 'blur', function(el) {
                return el.type == "text" && D.hasClass(el, 'editbox');
            }, function(ev) {
                var target = ev.target,
                    parent = D.parent(target, 'li'),
                    chkbox = D.get('.J_Checkbox', parent),
                    data = fetchNodeData(chkbox);

                // TODO 未改变的情况下的优化。
                self.fire('dataUpdated', {target: data});

                // 如果别名被设为空了以后，默认替换为属性值
                /*
                if(data.alias == EMPTY) {
                    target.value = data.name;
                }
                */
            });

            E.on(D.get('.J_SKUMore', self.elGroup), 'click', function(ev) {
                ev.halt();
                self.expandGroup();
            });
        },
        expandGroup: function() {
            var self = this,
                isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE);
            if(isCollapse) {
                D.removeClass(self.elBox, CLS_COLLAPSE);
            }
        },
        fetchData: function() {
            this.fields = this.getDataFromNode();
        },
        getDataNode: function() {
            var self = this,
                elBox = self.elBox,
                isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE),
                // 获取当前显示的、可用的、选中的checkbox元素
                els = D.filter('.J_Checkbox', function(el) {
                    var elParent = D.parent(el, 'li');
                    return !(isCollapse && D.hasClass(elParent, 'hide')) && 
                        !self.isDisabled && el.checked === true;
                }, elBox);

            return els;
        },
        /**
         * 获取多个checkbox元素的信息数据
         * @param {HTMLElement|Array<HTMLElement>} checkboxs 复选框元素集合
         * @returns {Array<JSON>} 提取的数据集合
         */
        getDataFromNode: function() {
            var nodes = this.getDataNode(),
                rt = [];
            S.each(nodes, function(node) {
                rt.push(fetchNodeData(node));
            });
            return rt;
        }
    });

    return OfficialGroup;
}, {requires: ['./basegroup']});
