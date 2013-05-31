KISSY.add(function(S, BaseGroup, Template) {
    var D = S.DOM, E = S.Event,

        TEMPLATE = '<div class="sku-group sku-custom">'+
                '<label class="sku-label">'+
                    '<input maxlength="4" class="sku-caption text" pattern="^[^/\$/\^/\:/\;/\,/\./\~/\-/\_]*$" patterninfo="格式输入错误" value="{{caption}}" name="prop_{{pid}}" type="text" />：'+
                '</label>'+
                '<div class="sku-box">'+
                    '<ul class="sku-list">'+
                    '{{#each fields as it}}'+
                      '<li><input maxlength="10" class="text" pattern="^[^/\$/\^/\:/\;/\,/\./\~/\-/\_]*$" patterninfo="格式输入错误" name="prop_{{pid}}_{{it.vid}}" value="{{it.name}}" type="text" /></li>'+
                    '{{/each}}'+
                    '</ul>'+
                    '<div class="sku-custom-operations">'+
                        '<a href="javascript:void(0);" class="sku-delgroup J_SKUDelGroup" title="删除">删除</a>'+
                        '<a href="javascript:void(0);" class="sku-enforce J_SKUApplyData">保存</a>'+
                    '</div>'+
                '</div>'+
            '</div>',
        EMPTY = '',
        CLS_READONLY = 'readonly',
        CLS_BTNEDIT = 'sku-btnedit',
        GUID_PID = 0,
        GUID_VID = 0;

    function fetchNodeData(node) {
        var pv = node.getAttribute('name').replace('prop_', '');

        return {
            id: pv,
            pv: pv.replace('_', ':'),
            name: encodeHTML(node.value)
        };
    }

    function encodeHTML(text) {
        return text && S.escapeHTML(text); //text.replace('<', '&lt;').replace('>', '&gt;');
    }

    // 获取用于渲染模板的数据。
    function getRenderData(data, cfg) {
        // 不用merge方法，可以减少fetcher的计算和叠加量
        var renderData = {
                caption: data.caption || EMPTY,
                pid: data.pid || CustomGroup.getPropId(),
                fields: data.fields || []
            },
            fields = renderData.fields,
            size = cfg.groupSize * 1;

        for(var i = 0; i < size; i++) {
            var item = fields[i];
            if(!item) {
                renderData.fields[i] = {vid: CustomGroup.getValId(), name: ""};
            }
        }
        return renderData;
    }

    var STATE = {
            SAVE: {disabled: false, writeable: true, text: '保存'},
            EDIT: {disabled: false, writeable: false, text: '编辑'},
            AWAIT: {disabled: true, writeable: true, text: '保存'}
        };

    var CustomGroup = function() {
        this.init.apply(this, arguments);
    },
    defConfig = {
        groupSize: 10,
        listContainer: '#J_CustomSKUList',
        extensible: false,
        pid: 0,
        vid: 0
    };

    S.extend(CustomGroup, BaseGroup, {
        init: function(data, config) {
            var self = this,
                cfg = S.merge(defConfig, config),
                // 默认结构构建
                renderData = getRenderData(data, cfg),
                struct = Template(TEMPLATE).render(renderData);
            self.pid = renderData.pid;

            // 继承基类方法和属性。
            CustomGroup.superclass.init.call(self, D.create(struct), cfg);

            self.type = "CustomGroup";
            self.writeable = true;
            self.isSaved = true;
            self.theChange = {rebuild: false, items:{}};
            D.append(self.elGroup, cfg.listContainer);

            self.elCaption = D.get('.sku-caption', self.elGroup);
            self.btnApply = D.get('.J_SKUApplyData', self.elBox);
            self.caption = encodeHTML(D.val(self.elCaption));
            self._bindEvent();

            // 初始化获取数据
            self.fetchData();

            // 初始状态设置
            if(self.fields.length > 0) {
                self.setState(STATE.EDIT);
            }else {
                self.setState(STATE.AWAIT);
            }
        },
        // TODO 事件上可以做一些优化
        _bindEvent: function() {
            var self = this,
                elBox = self.elBox,
                btnApply = self.btnApply,
                textFields = D.query('input.text', self.elGroup),
                bufferDelay = 50;

            S.each(textFields, function(field) {
                // 计时器必须各自独立，否则会相互冲突，导致部分修改无法被记录。
                var timer;
                E.on(field, 'valuechange', function(ev) {
                    timer && timer.cancel();
                    timer = S.later(function() {
                        fnBuffer(ev.target);
                    }, bufferDelay);
                });
            });
            // 该函数会被连续触发，只需要执行最后的一次触发即可。
            function fnBuffer(target) {
                var theChange = self.theChange,
                    isChanged = true,
                    isCaption = D.hasClass(target, 'sku-caption'),
                    oldValue = isCaption ? self.caption : EMPTY,
                    newValue = S.trim(target.value),
                    data = fetchNodeData(target);
                data.context = isCaption ? "caption" : 'text';
                data.target = target;

                // 获取当前表单域，已经存储的值。用来与当前值进行比对
                // 以确定是重新渲染sku表格还是仅更新对应的值即可。
                if(!isCaption) {
                    S.each(self.fields, function(field) {
                        if(field.id == data.id) {
                            oldValue = field.name;
                            return false;
                        }
                    });
                }
                // 值由有到无或由无到有都会使sku组合的表格结构发生变化。
                var empty2text = (oldValue == EMPTY && newValue != EMPTY),
                    text2empty = (oldValue != EMPTY && newValue == EMPTY);
                if(!empty2text && !text2empty) {
                    isChanged = false;
                }
                // 如果结构修改，标记为重新渲染
                // 如果是值变化，标记为修改值即可。
                if(isChanged) {
                    theChange.rebuild = true;
                }else{
                    theChange.items[data.id] = data;
                }
                // 判断是否存在有效的属性值
                var hasCaption = S.trim(self.elCaption.value) !== EMPTY,
                    hasText = S.some(textFields, function(field) {
                        return S.trim(field.value) != EMPTY && field != self.elCaption;
                    });
                // 只有存在属性值，并且属性名都有的情况下，保存按钮才可用。
                self.setState(hasCaption && hasText ? STATE.SAVE : STATE.AWAIT);
                self.isSaved = false;
            }

            E.on(btnApply, 'click', function(ev) {
                ev.halt();
                if(!D.hasClass(btnApply, 'disabled') && !self.isDisabled) {
                    //self.dataApply();
                    self.buttonToggle();
                }
            });

            E.on(D.get('.J_SKUDelGroup', elBox), 'click', function(ev) {
                ev.halt();
                if(confirm('您确定要删除该销售属性？')) {
                    D.remove(self.elGroup);
                    self.fire('remove');
                    self.fire('dataChanged');
                }
            });
        },
        fetchData: function() {
            var self = this;

            self.caption = encodeHTML(S.trim(self.elCaption.value));
            self.fields = self.getDataFromNode();
        },
        getDataNode: function() {
            var self = this,
                // 获取当前显示的、可用的、选中的checkbox元素
                nodes = D.filter('input', function(el) {
                    return !self.isDisabled && el.type === 'text' && S.trim(el.value) !== EMPTY;
                }, self.elBox);
            return nodes;
        },
        getDataFromNode: function() {
            var nodes = this.getDataNode(),
                rt = [];
            S.each(nodes, function(node) {
                rt.push(fetchNodeData(node));
            });
            return rt;
        },
        buttonToggle: function() {
            var self = this;
            if(self.writeable) {
                self.dataApply();
            }else {
                self.setState(STATE.SAVE);
            }
        },
        // 设置按钮的状态。
        setState: function(state) {
            var button = this.btnApply,
                isWriteable = state.writeable,
                method = isWriteable ? 'removeClass' : 'addClass';
            D.text(button, state.text);
            D[state.disabled ? 'addClass' : 'removeClass'](button, 'disabled');

            if(this.writeable !== isWriteable) {
                // 设置按钮的显示样式。保存/编辑样式
                D[method](button, CLS_BTNEDIT);
                // 设置父容器的readOnly ClassName
                D[method](this.elGroup, CLS_READONLY);
                this.writeable = isWriteable;
                // 设置输入框的readOnly属性。
                S.each(this.formFields, function(field) {
                    if(field.type == 'text') {
                        D.prop(field, 'readonly', isWriteable ? false : true);
                    }
                });
            }
        },
        dataApply: function() {
            var self = this,
                theChange = self.theChange;
            // 保存数据之前先做校验，若不通过校验，则不保存数据。
            if(self.fire('validBeforeSave') === false) return;
            if(theChange.rebuild) {
                self.fetchData();
                self.fire('dataChanged');
            }else {
                self.caption = self.elCaption.value;
                self.fire('dataUpdated', {items: theChange.items});
            }
            self.theChange = {rebuild: false, items:{}};
            self.setState(STATE.EDIT);
            self.isSaved = true;
        },
        hasSaved: function() {
            // 如果不可用，则不需要理会数据是否真的保存了。因为这块的数据是无效的。返回投入是便于全局的校验。
            // 如果可用，则根据实际的是否发生变化来判断。
            return this.isDisabled || this.isSaved;
        },
        focus: function() {
            try{
                this.elCaption.focus();
            }catch(ex) {}
        },
        fetchCPVId: function() {
            var self = this,
                vids = [], 
                pid = self.pid,
                rt;
            // 重新获取数据。ie下渲染效率有问题的时候，导致self.fields的数量不对。
            self.fetchData();
            if(self.caption !== EMPTY) {
                S.each(self.fields, function(field) {
                    vids.push(field.pv.replace(pid+':', EMPTY));
                });
                rt = vids.length > 0 ? pid + ':' + vids.join(',') : EMPTY;
            }else {
                rt = EMPTY;
            }

            return rt;
        }
    });

    /**
     * 添加一些静态方法
     */
    S.mix(CustomGroup, {
        setInitializePV: function(pid, vid) {
            pid && (GUID_PID = pid);
            vid && (GUID_VID = vid);
        },
        // 供CustomGroup对象获取pid和vid
        getPropId: function(name) {
            GUID_PID = GUID_PID - 1;
            return GUID_PID;
        },
        getValId: function() {
            GUID_VID -= 1;
            return GUID_VID;
        }
    });

    return CustomGroup;
}, {requires: ['./basegroup', 'template']});
