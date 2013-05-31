KISSY.add(function(S, Template) {
    var D = S.DOM, E = S.Event,
        TEMPLATE_TABLE = '<table border="0" cellspacing="0" class="J_SKUImgTable img-table" style="display:none;">'+
            '<caption>��ɫ����ͼƬ�ϴ����</caption>'+
            '<thead>'+
                '<tr>'+
                  '<th>{{caption}}</th>'+
                  '<th>ͼƬ��{{#if imgRequired}}�����ϴ�����ɫ��ӦͼƬ{{#else}}��ͼƬ�ɲ���{{/if}}��</th>'+
                  '{{#if hasImg}}'+
                  '<th>����ͼƬ</th>'+
                  '{{/if}}'+
                '</tr>'+
            '</thead>'+
            '<tbody></tbody>'+
        '</table>',
        TEMPLATE_TR = '<tr id="J_MapImg_{{item.id}}">'+
            '<td class="tile">'+
                '{{item.lump}}'+
                '<span class="J_Map_{{item.id}}">{{item.alias || item.name}}</span>'+
            '</td>'+
            '<td><input type="file" name="cpvf_{{item.pv}}" /></td>'+
            '{{#if hasImg}}'+
            '<td class="preview">'+
                '{{#if item.imgThumb && item.imgPath}}'+
                '<input type="hidden" name="cpvf_old_{{item.pv}}" value="{{item.imgPath}}" />'+
                '<a target="_blank" href="{{item.imgThumb}}"><img src="{{item.imgThumb}}_24x24.jpg" /></a>'+
                '<a class="del" href="javascript:void(0);">ɾ��</a>'+
                '<a class="undel" data-path="{{item.imgPath}}" href="javascript:void(0);">�ָ�ɾ��</a>'+
                '{{#else}}'+
                '��ǰ��ͼƬ'+
                '{{/if}}'+
            '</td>'+
            '{{/if}}'+
        '</tr>',
        EMPTY = '',
        defConfig = {
            imgRequired: false
        };

    var ImageTable = function() {
        this.init.apply(this, arguments);
    };

    function getAllFields(elContainer) {
        return getDataFromNode(D.query('.J_Checkbox', elContainer));
    }
    /**
     * ��ȡcheckboxԪ�ص���Ϣ����
     * @param {HTMLElement|Array<HTMLElement>} checkboxs ��ѡ��Ԫ�ؼ���
     * @returns {Array<JSON>} ��ȡ�����ݼ���
     */
    function getDataFromNode(nodes) {
        var rt = [];
        S.each(nodes, function(node) {
            var parent = node.parentNode,
                elAlias = D.get('.editbox', parent),
                elName = D.get('.labelname', parent),
                pv = node.value;

            rt.push({
                id: pv.replace(':', '-'),
                pv: pv,      // propertyId:valueId
                alias: encodeHTML(D.val(elAlias)),
                name: encodeHTML(D.text(elName)),
                color: node.getAttribute('data-color'),
                imgThumb: node.getAttribute('data-thumb'),
                imgPath: node.getAttribute('data-path')
            });
        });
        return rt;
    }

    function encodeHTML(text) {
        return text && S.escapeHTML(text); //text.replace('<', '&lt;').replace('>', '&gt;');
    }

    S.augment(ImageTable, S.EventTarget, {
        init: function(skuGroup, cfg) {
            var self = this;
            self.skuGroup = skuGroup;
            self.cfg = S.merge(defConfig, cfg);

            self._buildTable();
        },
        _buildTable: function() {
            var self = this,
                skuGroup = self.skuGroup,
                caption = skuGroup.caption,
                groupItems = getAllFields(skuGroup.elGroup),
                hasImg = S.some(groupItems, function(it) {
                    return it.imgThumb && it.imgPath;
                });

            var structData = {
                    caption: caption,
                    imgRequired: self.cfg.imgRequired,
                    hasImg: hasImg
                },
                struct = Template(TEMPLATE_TABLE).render(structData),
                table = D.create(struct),
                parent = D.get('.sku-box', skuGroup.elGroup);

            self.tbody = D.get('tbody', table);
            self.table = table;
            self._buildTrs(groupItems, hasImg);

            D.append(table, parent);
            self._bindEvent();
        },
        _buildTrs: function(groupData, hasImg) {
            var fragment = document.createDocumentFragment(),
                specialColors = ['transparent', 'assortment'],
                lumpStructImg = '<i class="color-lump color-{color}"></i>',
                lumpStructPix = '<i class="color-lump" style="background-color:#{color};"></i>';
            S.each(groupData, function(item) {
                var lumpStruct = S.inArray(item.color, specialColors) ? lumpStructImg : lumpStructPix;
                item.lump = S.substitute(lumpStruct, {color: item.color});

                var rowData = {
                        item: item,
                        hasImg: hasImg
                    },
                    rowStruct = Template(TEMPLATE_TR).render(rowData),
                    row = D.create(rowStruct);
                fragment.appendChild(row);
            });
            this.tbody.appendChild(fragment);
        },
        _bindEvent: function() {
            var self = this;
            E.delegate(this.tbody, 'click', 'a', function(ev) {
                ev.halt();
                var target = ev.target,
                    parent = D.parent(target, 'td'),
                    hidden = D.get('input', parent);
                if(D.hasClass(target, 'del')) {
                    hidden.value = EMPTY;
                    D.addClass(parent, 'deled');
                }else if(D.hasClass(target, 'undel')){
                    hidden.value = target.getAttribute('data-path');
                    D.removeClass(parent, 'deled');
                }
            });
        },
        toggle: function() {
            var self = this,
                data = self.skuGroup.fields,
                table = self.table,
                tbody = self.tbody;

            // ����������ʾ������
            if(data.length === 0) {
                D.hide(table);
                return;
            }

            // ���������е���
            D.hide(D.query('tr', tbody));
            // �ٸ�����Ҫ��ʾָ������
            S.each(data, function(item) {
                var el = D.get('#J_MapImg_' + item.id);
                // �������Ԫ�أ����������صģ�������ʾ֮
                if(el) {
                    D.show(el);
                    return;
                }
            });
            D.show(table);
        }
    });

    return ImageTable;
}, {
    requires: ['template']
});
