/**
 * �����������չʾ���
 * ģ����Ⱦ�ķ�ʽ����Ⱦ�����Ҳ���һ������Ⱦ�����Ǹ���scroll������������������Ⱦ���ء�
 */
KISSY.add(function(S, Template, Lap) {
    var D = S.DOM, E = S.Event,
        TEMPLATE_TABLE = '<table border="0" cellspacing="0" style="visibility:hidden;">'+
                '<caption>��������ƥ���</caption>'+
                '<thead>'+
                    '<tr>'+
                        '{{#each captions as caption}}'+
                        '<th class="J_Map_{{caption.id}}">{{caption.caption}}</th>'+
                        '{{/each}}'+
                        '<th>�ײ�����</th>'+
                        '{{#if config.showPrice}}'+
                        '<th>һ�ڼ�<em>*</em></th>'+
                        '{{/if}}'+
						'<th>����<em>*</em></th>'+
                        '<th>�̼ұ���</th>'+
                    '</tr>'+
                '</thead>'+
                '<tbody>'+
                '</tbody>'+
            '</table>',
        TEMPLATE_ROW = '<tr>'+
            '{{#each it.items as item}}'+
                '{{#if it.index % item.size == 0}}'+
                '<td rowspan="{{item.size}}" {{#if item.color}}class="tile"{{/if}}>'+
                    '{{item.lump}}'+
                    '<span class="J_Map_{{item.id}}">'+
                        '{{item.alias || item.name}}'+
                    '</span>'+
                '</td>'+
                '{{/if}}'+
            '{{/each}}'+
                '<td class="content">'+
                  '<select data-id="{{it.id}}" data-type="insIntro" type="text" name="{{it.id}}:content" value="{{it.data.content}}">'+
					'<option>���</option>'+
					'<option>��Լ��</option>'+
					'</select>'+
					'<button>��Ӻ�Լ����</button>'+
                '</td>'+
            '{{#if config.showPrice}}'+
                '<td class="price">'+
                    '<input type="hidden" name="{{it.id}}:id" value="{{it.data.skuid}}" />'+
                    '<input data-id="{{it.id}}" class="J_MapPrice text" data-type="price" type="money" name="{{it.id}}:p" value="{{it.data.price}}" maxlenth="6" required /> Ԫ'+
                    '{{#if config.isDistribution && it.data.region}}'+
                        '<span class="sku-limit">'+
                        '{{#if it.data.region.indexOf("-") == -1}}'+
                            '(�涨�ۼۣ�{{it.data.region}} Ԫ) '+
                        '{{#else}}'+
                            '(���䣺{{it.data.region}} Ԫ)'+
                        '{{/if}}'+
                        '</span>'+
                    '{{/if}}'+
                '</td>'+
            '{{/if}}'+
                '<td class="productid">'+
                  '<input data-id="{{it.id}}" maxlenth="6" class="J_MapProductid text" data-type="tsc" type="text" name="{{it.id}}:tsc" value="{{it.data.tsc}}" required /> ��'+
                '</td>'+
                '<td class="quantity">'+
                  '<input maxlength="6" data-id="{{it.id}}" class="J_MapQuantity text" data-type="quantity" type="text" name="{{it.id}}:q" value="{{it.data.quantity}}" />'+
                '</td>'+
            '</tr>', 
        TEMPLATE_LUMP_IMG = '<i class="color-lump color-{color}"></i>',
        TEMPLATE_LUMP_PIX = '<i class="color-lump" style="background-color:#{color};"></i>',
        specialColors = ['transparent', 'assortment'],
        defConfig = {
            isDistribution: false,
            showPrice: true,
            delay: 200,
            duration: 300
        },
        MIN_SCROLL_COUNT = 30,
        elMapContainer,
        lap;

    /**
     * ������������ϣ�����������Ⱦģ�������Դ��
     * PS:�ⲿ��������������ɣ���Ҫ��������dynamicFunc����
     * @param {JSON} groupsData ѡ���checkbox�����ݼ��ϣ������������
     * @param {JSON} comboData ƥ��������������ص��û����ݣ�price��quantity��productid��
     * @param {JSON} defaultComboData Ĭ�ϵ����ݣ�price��quantity etc.��
     * @param {JSON} distributionData ����ҵ����ص�����
     * @returns {JSON} ������Ⱦģ����������
     */
    function dataAdapter(group, combo, def, distr) {
        // ���������
        var func = new Function('groups', 'combo', 'defCombo', dynamicFunc(group, distr));
        // ִ�в���������
        return func(group, combo, def);
    }
    // ���ݶ�Ӧ������Դ, ��̬���캯����
    function dynamicFunc(data, distr) {
        var // ���캯������Ҫ�ı���
            body = [], ends = [],
            // ����������Ҫ��һЩ�����ռ��ı���
            items = [], pvs = [],
            // ����������ռ�
            captions = [],
            length = data.length,
            region = distr.region;
        body.push('var list = [];\n');

        S.each(data, function(group, idx) {
            // ��ǰ���sizeֵ
            var size = S.reduce(data.slice(idx+1), function(preValue, curItem) {
                    return preValue * curItem.fields.length;
                }, 1);
            // ѭ���� ͷ����
            body.push('KISSY.each(groups[', idx, '].fields, function(it', idx,') {\n');
            body.push('var item = it', idx, ', lump = "";');
            // ����Ӧ�����ݶ�������size����
            body.push('item.size=',size,';\n');

            body.push('if(item.color) {');
            // �����ɫɫ��Ĵ���
            body.push("var lumpStruct = KISSY.inArray(item.color, ['", specialColors.join("','"), "']) ? '", TEMPLATE_LUMP_IMG, "' : '", TEMPLATE_LUMP_PIX, "';\n");
            body.push('lump = KISSY.substitute(lumpStruct, {color: item.color});');
            body.push('}\n');
            body.push('item.lump=lump;');

            // �ռ��������ݵı���ֵ��
            captions.push('{caption:"'+ group.caption.replace('\\', '\\\\') + '", id:'+ (group.pid || 0)+'}');
            // �ռ������һ��ѭ������Ҫ�õ�������
            pvs.push('it'+idx+'.pv');
            items.push('it'+idx);
            
            // ���һ��ѭ���ľ������
            if(idx == length-1) {
                body.push('var id=[',pvs.join(),'].join(";");\n');
                //body.push('console.log("combo:", id, combo[id]);');
                body.push('list.push({\n');
                body.push('id: id, index: list.length, ', (region ? 'priceLimit: "'+region+'", ' : ''), 'data: KISSY.merge(defCombo, combo[id]), items:[', items.join(), ']\n');
                body.push('});\n');
            }

            // ѭ���� β����
            ends.push('});\n');
        });
        // ��ȫ�����ṹ�ִ�
        body = body.concat(ends);
        // ��ȡ������ص�����
        body.unshift('var captions=[',captions.join(),'];\n');
        // ���巵�����ݵı��ʽ
        body.push('return {list: list, captions: captions}');
        // ���غ�����Ĺ����ַ���
        return body.join('');
    }

    function batchRender(elMapContainer, data) {
        // ������ִ��Ч�ʽϵ͵Ļ����£�������/���ٵĲ������������ݶ�ʧ�����⡣
        // ��Ҫԭ��������lap��settimeout��ʹ�á�handleIt��stop֮������⡣
        lap && lap.stop();
        if(lap) {
            S.later(function() {
                batchRender(elMapContainer, data);
            }, 10);
            return;
        }

        var comboCollection = data.list;
        data.config = defConfig;
        // �����������ȷŵ�ҳ���С�
        elMapContainer.innerHTML = Template(TEMPLATE_TABLE).render(data);
        var elTable = D.get("table", elMapContainer);

        var fragment = document.createDocumentFragment(),
            tbody = D.get('tbody', elTable);

        // ����нṹ�ϵĸı䣬������scroller��������
        // ����ĳЩ����£��������������档
        D.scrollTop(elMapContainer, 0);
        lap = Lap(data.list, {duration: defConfig.duration});
        // ÿһ�����ݵĴ�������
        lap.handle(function(it, globalIndex, localIndex) {
            var struct = Template(TEMPLATE_ROW).render({
                it:it,
                config: data.config
            });
            fragment.appendChild(D.create(struct));
        });
        // ÿ�������ݵĴ�������
        // ����������һ����Сֵ�Ա�֤�������ĳ��֡�
        lap.batch(function(globalIndex) {
            tbody.appendChild(fragment);
            D.css(elTable, 'visibility', 'visible');
            // sku�����������
            //fixRegion(elMapContainer, elTable);
            D.removeClass(elMapContainer, 'sku-loading');
            if(globalIndex > MIN_SCROLL_COUNT) {
                lap.pause();
            }
            //S.log('batch done', globalIndex);
        });
        // �������ݶ���������Ժ����
        lap.then(function() {
            tbody.appendChild(fragment);
            lap = null;
            //S.log('process done');
        });
        lap.start();
    }

    // ���sku���width������ʾ��ȣ�����ʾ�����������
    // �������ڸǡ�
    // ���sku���height���������ʾ�߶ȣ�����ʾ�����������
    function fixRegion(elMapContainer, elTable) {
        var width = D.width(elTable),
            height = D.height(elTable),
            maxWidth = 640,
            maxHeight = 600;
        if(width > maxWidth) {
            D.css(elMapContainer, {
                "width": maxWidth,
                "overflow-x": "auto"
            });
        }else {
            D.css(elMapContainer, {
                "width": "auto",
                "overflow-x": "hidden"
            });
        }

        if(height < maxHeight) {
            D.css(elMapContainer, 'height', 'auto');
            D.css(elMapContainer, 'overflowY', 'hidden');
        }else {
            D.height(elMapContainer, 600);
            D.css(elMapContainer, 'overflowY', 'auto');
        }
        // ������ie��������Ⱦ����
        S.UA.ie && D.height(elMapContainer.parentNode, D.height(elMapContainer));
    }

    return S.mix({
        init: function(elContainer, cfg) {
            elMapContainer = S.get(elContainer);
            defConfig = S.merge(defConfig, cfg);

            this._bindEvent();
        },
        _bindEvent: function() {
            var self = this;
            E.delegate(elMapContainer, 'blur', 'input', function(ev) {
                var target = ev.target;
                self.fire('comboChanged', {target: target});
            });

            E.on(elMapContainer, 'scroll', S.buffer(lazyload, defConfig.delay));

            function lazyload(ev) {
                lap && lap.start();
            }
        },
        // �����Ż����ص㡣
        // Ŀǰ�����groups������˱�ѡ���������ԡ�
        // ����ѡ��������û��ѡ����ᵼ��sku�������Ϊ�ա�
        // Ŀǰȷ�ϵ�ҵ���߼�����������������Ҫ��������ݲ�Ϊ�գ�����dataAdapter����֮ǰ���˿��������Լ��ɡ�
        render: function(groups, combo, def, distr) {
            var self = this,
                elSKUMap = elMapContainer.parentNode,
                data = dataAdapter(groups, combo, def, distr),
                length = data.list.length;

            self.fire('adapter', {renderData: data});
            //S.log(['ComboTable render data:', data, ', the length:', data.list.length]);

            if(length === 0) {
                D.hide(elSKUMap);
                return;
            }

            // ��ϱ���loading��ʾ {{{
            // ����Ĭ�ϵĿ�ߣ�������ʾloading��Ϣ��
            // ����sku���������������Ŀ�ߣ�����߶ȱ仯̫�����ԡ�
            D.addClass(elMapContainer, 'sku-loading');
            var expectHeight = 32 * data.list.length;
            expectHeight = expectHeight > 600 ? 600 : expectHeight;
            //D.height(elMapContainer, expectHeight);
            // ��ȹ̶����ɡ�
            D.width(elMapContainer, 650);
            //S.UA.ie && D.height(elSKUMap, expectHeight);
            // loading END}}}

            D.show(elSKUMap);
            // ��ʽ����������Ϻ�չʾ��
            batchRender(elMapContainer, data);
        }
    }, S.EventTarget);

}, {requires: ['template', './lap']});
