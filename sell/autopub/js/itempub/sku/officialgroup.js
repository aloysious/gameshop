KISSY.add(function(S, BaseGroup) {
    var D = S.DOM, E = S.Event,

        CLS_COLLAPSE = 'collapse',

        EMPTY = '',
        FEATURE_EDIT = 'edit',
        FEATURE_LIST = 'list',
        FEATURE_IMAG = 'image';

    var OfficialGroup = function() {
        //this.init.apply(this, arguments);
        // ִ�л���Ĺ��캯��
        OfficialGroup.superclass.constructor.apply(this, arguments);
    };

    /**
     * ��ȡcheckboxԪ�ص���Ϣ����
     * @param {HTMLElement} node ��ѡ��Ԫ�ؼ���
     * @returns {Object<JSON>} ��ȡ������
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
     * �̳���BaseGroup����
     */
    S.extend(OfficialGroup, BaseGroup, {
        init: function(elGroup, cfg) {
            OfficialGroup.superclass.init.apply(this, arguments);

            var self = this,
                caption = D.attr(elGroup, 'data-caption'),
                features = D.attr(elGroup, 'data-features') || FEATURE_LIST,
                isRequired = D.hasClass(elGroup, 'required');

            self.type = "OfficialGroup";
            // Ĭ�������������Ե�������
            self.caption = caption;
            self.features = features;
            self.isRequired = isRequired;

            // ��ȡ��ʼ�����ݡ�
            self.fetchData();
            // �¼��󶨲���
            self._bindEvent();
        },
        hasFeature: function(feature) {
            return this.features.indexOf(feature) != -1;
        },
        _bindEvent: function() {
            var self = this,
                elBox = self.elBox,
                isEditable = self.hasFeature(FEATURE_EDIT);

            // ��ʼ���󶨸�ѡ��ĵ�� �����¼�
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

                // �����ȫѡ
                if(D.hasClass(target, 'J_CheckAll')) {
                    chkboxs = D.filter(D.query('.J_Checkbox', elBox), function(el) {
                        return el.checked == !checked && !(isCollapse && D.hasClass(D.parent(el, 'li'), 'hide'));
                    });
                    D.prop(chkboxs, 'checked', checked);
                    // ��ȫѡ���checkboxҲ��������������У��ʱ��ͳһ����
                    chkboxs.push(target);
                }
                // ��ȡ�����������Ѿ���ѡ��Ԫ�ص���Ϣ
                self.fetchData();

                if(self.fire('validBeforeSave') === false) {
                    // ���У��ʧ�ܣ�����Ҫ�ع�������
                    // 1. checkbox��ѡ״̬�Ļع�
                    // 2. ���ݵĻع���
                    D.prop(chkboxs, 'checked', !checked);
                    self.fields = oldData;
                    return;
                }

                // ���ڿɱ༭sku�б�������ʾ״̬��
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

                // TODO δ�ı������µ��Ż���
                self.fire('dataUpdated', {target: data});

                // �����������Ϊ�����Ժ�Ĭ���滻Ϊ����ֵ
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
                // ��ȡ��ǰ��ʾ�ġ����õġ�ѡ�е�checkboxԪ��
                els = D.filter('.J_Checkbox', function(el) {
                    var elParent = D.parent(el, 'li');
                    return !(isCollapse && D.hasClass(elParent, 'hide')) && 
                        !self.isDisabled && el.checked === true;
                }, elBox);

            return els;
        },
        /**
         * ��ȡ���checkboxԪ�ص���Ϣ����
         * @param {HTMLElement|Array<HTMLElement>} checkboxs ��ѡ��Ԫ�ؼ���
         * @returns {Array<JSON>} ��ȡ�����ݼ���
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
