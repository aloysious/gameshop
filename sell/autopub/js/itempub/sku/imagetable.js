KISSY.add(function(S, Template) {
    var D = S.DOM, E = S.Event,
        TEMPLATE_TABLE = '<table border="0" cellspacing="0" class="J_SKUImgTable img-table" style="display:none;">'+
            '<caption>颜色属性图片上传表格</caption>'+
            '<thead>'+
                '<tr>'+
                  '<th>{{caption}}</th>'+
                  '<th>图片（{{#if imgRequired}}必须上传该颜色对应图片{{#else}}无图片可不填{{/if}}）</th>'+
                  '{{#if hasImg}}'+
                  '<th>已有图片</th>'+
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
                '<a class="del" href="javascript:void(0);">删除</a>'+
                '<a class="undel" data-path="{{item.imgPath}}" href="javascript:void(0);">恢复删除</a>'+
                '{{#else}}'+
                '当前无图片'+
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
     * 获取checkbox元素的信息数据
     * @param {HTMLElement|Array<HTMLElement>} checkboxs 复选框元素集合
     * @returns {Array<JSON>} 提取的数据集合
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

            // 表格主体的显示和隐藏
            if(data.length === 0) {
                D.hide(table);
                return;
            }

            // 先隐藏所有的行
            D.hide(D.query('tr', tbody));
            // 再根据需要显示指定的行
            S.each(data, function(item) {
                var el = D.get('#J_MapImg_' + item.id);
                // 如果存在元素（可能是隐藏的），则显示之
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
