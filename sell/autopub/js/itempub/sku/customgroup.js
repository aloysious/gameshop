KISSY.add(function(S, BaseGroup, Template) {
    var D = S.DOM, E = S.Event,

        TEMPLATE = '<div class="sku-group sku-custom">'+
                '<label class="sku-label">'+
                    '<input maxlength="4" class="sku-caption text" pattern="^[^/\$/\^/\:/\;/\,/\./\~/\-/\_]*$" patterninfo="��ʽ�������" value="{{caption}}" name="prop_{{pid}}" type="text" />��'+
                '</label>'+
                '<div class="sku-box">'+
                    '<ul class="sku-list">'+
                    '{{#each fields as it}}'+
                      '<li><input maxlength="10" class="text" pattern="^[^/\$/\^/\:/\;/\,/\./\~/\-/\_]*$" patterninfo="��ʽ�������" name="prop_{{pid}}_{{it.vid}}" value="{{it.name}}" type="text" /></li>'+
                    '{{/each}}'+
                    '</ul>'+
                    '<div class="sku-custom-operations">'+
                        '<a href="javascript:void(0);" class="sku-delgroup J_SKUDelGroup" title="ɾ��">ɾ��</a>'+
                        '<a href="javascript:void(0);" class="sku-enforce J_SKUApplyData">����</a>'+
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

    // ��ȡ������Ⱦģ������ݡ�
    function getRenderData(data, cfg) {
        // ����merge���������Լ���fetcher�ļ���͵�����
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
            SAVE: {disabled: false, writeable: true, text: '����'},
            EDIT: {disabled: false, writeable: false, text: '�༭'},
            AWAIT: {disabled: true, writeable: true, text: '����'}
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
                // Ĭ�Ͻṹ����
                renderData = getRenderData(data, cfg),
                struct = Template(TEMPLATE).render(renderData);
            self.pid = renderData.pid;

            // �̳л��෽�������ԡ�
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

            // ��ʼ����ȡ����
            self.fetchData();

            // ��ʼ״̬����
            if(self.fields.length > 0) {
                self.setState(STATE.EDIT);
            }else {
                self.setState(STATE.AWAIT);
            }
        },
        // TODO �¼��Ͽ�����һЩ�Ż�
        _bindEvent: function() {
            var self = this,
                elBox = self.elBox,
                btnApply = self.btnApply,
                textFields = D.query('input.text', self.elGroup),
                bufferDelay = 50;

            S.each(textFields, function(field) {
                // ��ʱ��������Զ�����������໥��ͻ�����²����޸��޷�����¼��
                var timer;
                E.on(field, 'valuechange', function(ev) {
                    timer && timer.cancel();
                    timer = S.later(function() {
                        fnBuffer(ev.target);
                    }, bufferDelay);
                });
            });
            // �ú����ᱻ����������ֻ��Ҫִ������һ�δ������ɡ�
            function fnBuffer(target) {
                var theChange = self.theChange,
                    isChanged = true,
                    isCaption = D.hasClass(target, 'sku-caption'),
                    oldValue = isCaption ? self.caption : EMPTY,
                    newValue = S.trim(target.value),
                    data = fetchNodeData(target);
                data.context = isCaption ? "caption" : 'text';
                data.target = target;

                // ��ȡ��ǰ�����Ѿ��洢��ֵ�������뵱ǰֵ���бȶ�
                // ��ȷ����������Ⱦsku����ǽ����¶�Ӧ��ֵ���ɡ�
                if(!isCaption) {
                    S.each(self.fields, function(field) {
                        if(field.id == data.id) {
                            oldValue = field.name;
                            return false;
                        }
                    });
                }
                // ֵ���е��޻����޵��ж���ʹsku��ϵı��ṹ�����仯��
                var empty2text = (oldValue == EMPTY && newValue != EMPTY),
                    text2empty = (oldValue != EMPTY && newValue == EMPTY);
                if(!empty2text && !text2empty) {
                    isChanged = false;
                }
                // ����ṹ�޸ģ����Ϊ������Ⱦ
                // �����ֵ�仯�����Ϊ�޸�ֵ���ɡ�
                if(isChanged) {
                    theChange.rebuild = true;
                }else{
                    theChange.items[data.id] = data;
                }
                // �ж��Ƿ������Ч������ֵ
                var hasCaption = S.trim(self.elCaption.value) !== EMPTY,
                    hasText = S.some(textFields, function(field) {
                        return S.trim(field.value) != EMPTY && field != self.elCaption;
                    });
                // ֻ�д�������ֵ���������������е�����£����水ť�ſ��á�
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
                if(confirm('��ȷ��Ҫɾ�����������ԣ�')) {
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
                // ��ȡ��ǰ��ʾ�ġ����õġ�ѡ�е�checkboxԪ��
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
        // ���ð�ť��״̬��
        setState: function(state) {
            var button = this.btnApply,
                isWriteable = state.writeable,
                method = isWriteable ? 'removeClass' : 'addClass';
            D.text(button, state.text);
            D[state.disabled ? 'addClass' : 'removeClass'](button, 'disabled');

            if(this.writeable !== isWriteable) {
                // ���ð�ť����ʾ��ʽ������/�༭��ʽ
                D[method](button, CLS_BTNEDIT);
                // ���ø�������readOnly ClassName
                D[method](this.elGroup, CLS_READONLY);
                this.writeable = isWriteable;
                // ����������readOnly���ԡ�
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
            // ��������֮ǰ����У�飬����ͨ��У�飬�򲻱������ݡ�
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
            // ��������ã�����Ҫ��������Ƿ���ı����ˡ���Ϊ������������Ч�ġ�����Ͷ���Ǳ���ȫ�ֵ�У�顣
            // ������ã������ʵ�ʵ��Ƿ����仯���жϡ�
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
            // ���»�ȡ���ݡ�ie����ȾЧ���������ʱ�򣬵���self.fields���������ԡ�
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
     * ���һЩ��̬����
     */
    S.mix(CustomGroup, {
        setInitializePV: function(pid, vid) {
            pid && (GUID_PID = pid);
            vid && (GUID_VID = vid);
        },
        // ��CustomGroup�����ȡpid��vid
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
