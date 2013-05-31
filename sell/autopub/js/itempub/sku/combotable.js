/**
 * 销售属性组合展示表格。
 * 模板渲染的方式来渲染，并且不是一次性渲染，而是根据scroll操作和数据量分批渲染加载。
 */
KISSY.add(function(S, Template, Lap) {
    var D = S.DOM, E = S.Event,
        TEMPLATE_TABLE = '<table border="0" cellspacing="0" style="visibility:hidden;">'+
                '<caption>销售属性匹配表</caption>'+
                '<thead>'+
                    '<tr>'+
                        '{{#each captions as caption}}'+
                        '<th class="J_Map_{{caption.id}}">{{caption.caption}}</th>'+
                        '{{/each}}'+
                        '<th>套餐内容</th>'+
                        '{{#if config.showPrice}}'+
                        '<th>一口价<em>*</em></th>'+
                        '{{/if}}'+
						'<th>数量<em>*</em></th>'+
                        '<th>商家编码</th>'+
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
					'<option>裸机</option>'+
					'<option>合约机</option>'+
					'</select>'+
					'<button>添加合约内容</button>'+
                '</td>'+
            '{{#if config.showPrice}}'+
                '<td class="price">'+
                    '<input type="hidden" name="{{it.id}}:id" value="{{it.data.skuid}}" />'+
                    '<input data-id="{{it.id}}" class="J_MapPrice text" data-type="price" type="money" name="{{it.id}}:p" value="{{it.data.price}}" maxlenth="6" required /> 元'+
                    '{{#if config.isDistribution && it.data.region}}'+
                        '<span class="sku-limit">'+
                        '{{#if it.data.region.indexOf("-") == -1}}'+
                            '(规定售价：{{it.data.region}} 元) '+
                        '{{#else}}'+
                            '(区间：{{it.data.region}} 元)'+
                        '{{/if}}'+
                        '</span>'+
                    '{{/if}}'+
                '</td>'+
            '{{/if}}'+
                '<td class="productid">'+
                  '<input data-id="{{it.id}}" maxlenth="6" class="J_MapProductid text" data-type="tsc" type="text" name="{{it.id}}:tsc" value="{{it.data.tsc}}" required /> 件'+
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
     * 将数据重新组合，返回用于渲染模板的数据源。
     * PS:外部调用这个方法即可，不要单独调用dynamicFunc方法
     * @param {JSON} groupsData 选择的checkbox的数据集合，各个组的数据
     * @param {JSON} comboData 匹配的组合数据项相关的用户数据（price、quantity、productid）
     * @param {JSON} defaultComboData 默认的数据（price、quantity etc.）
     * @param {JSON} distributionData 分销业务相关的数据
     * @returns {JSON} 用于渲染模板的组合数据
     */
    function dataAdapter(group, combo, def, distr) {
        // 构造出函数
        var func = new Function('groups', 'combo', 'defCombo', dynamicFunc(group, distr));
        // 执行并返回数据
        return func(group, combo, def);
    }
    // 根据对应的数据源, 动态构造函数体
    function dynamicFunc(data, distr) {
        var // 构造函数体需要的变量
            body = [], ends = [],
            // 函数体中需要的一些数据收集的变量
            items = [], pvs = [],
            // 额外的数据收集
            captions = [],
            length = data.length,
            region = distr.region;
        body.push('var list = [];\n');

        S.each(data, function(group, idx) {
            // 当前组的size值
            var size = S.reduce(data.slice(idx+1), function(preValue, curItem) {
                    return preValue * curItem.fields.length;
                }, 1);
            // 循环体 头部分
            body.push('KISSY.each(groups[', idx, '].fields, function(it', idx,') {\n');
            body.push('var item = it', idx, ', lump = "";');
            // 给对应的数据对象增加size数据
            body.push('item.size=',size,';\n');

            body.push('if(item.color) {');
            // 针对颜色色块的处理
            body.push("var lumpStruct = KISSY.inArray(item.color, ['", specialColors.join("','"), "']) ? '", TEMPLATE_LUMP_IMG, "' : '", TEMPLATE_LUMP_PIX, "';\n");
            body.push('lump = KISSY.substitute(lumpStruct, {color: item.color});');
            body.push('}\n');
            body.push('item.lump=lump;');

            // 收集整个数据的标题值。
            captions.push('{caption:"'+ group.caption.replace('\\', '\\\\') + '", id:'+ (group.pid || 0)+'}');
            // 收集在最后一层循环中需要用到的数据
            pvs.push('it'+idx+'.pv');
            items.push('it'+idx);
            
            // 最后一层循环的具体操作
            if(idx == length-1) {
                body.push('var id=[',pvs.join(),'].join(";");\n');
                //body.push('console.log("combo:", id, combo[id]);');
                body.push('list.push({\n');
                body.push('id: id, index: list.length, ', (region ? 'priceLimit: "'+region+'", ' : ''), 'data: KISSY.merge(defCombo, combo[id]), items:[', items.join(), ']\n');
                body.push('});\n');
            }

            // 循环体 尾部分
            ends.push('});\n');
        });
        // 补全函数结构字串
        body = body.concat(ends);
        // 获取标题相关的数据
        body.unshift('var captions=[',captions.join(),'];\n');
        // 定义返回数据的表达式
        body.push('return {list: list, captions: captions}');
        // 返回函数体的构造字符串
        return body.join('');
    }

    function batchRender(elMapContainer, data) {
        // 避免在执行效率较低的环境下，连续的/快速的操作带来的数据丢失等问题。
        // 主要原因还是在于lap中settimeout的使用。handleIt与stop之间的问题。
        lap && lap.stop();
        if(lap) {
            S.later(function() {
                batchRender(elMapContainer, data);
            }, 10);
            return;
        }

        var comboCollection = data.list;
        data.config = defConfig;
        // 将数据容器先放到页面中。
        elMapContainer.innerHTML = Template(TEMPLATE_TABLE).render(data);
        var elTable = D.get("table", elMapContainer);

        var fragment = document.createDocumentFragment(),
            tbody = D.get('tbody', elTable);

        // 如果有结构上的改变，则设置scroller到顶部。
        // 避免某些情况下，滚动条在最下面。
        D.scrollTop(elMapContainer, 0);
        lap = Lap(data.list, {duration: defConfig.duration});
        // 每一项数据的处理函数。
        lap.handle(function(it, globalIndex, localIndex) {
            var struct = Template(TEMPLATE_ROW).render({
                it:it,
                config: data.config
            });
            fragment.appendChild(D.create(struct));
        });
        // 每批次数据的处理方法。
        // 数据量大于一个最小值以保证滚动条的出现。
        lap.batch(function(globalIndex) {
            tbody.appendChild(fragment);
            D.css(elTable, 'visibility', 'visible');
            // sku容器宽度修正
            //fixRegion(elMapContainer, elTable);
            D.removeClass(elMapContainer, 'sku-loading');
            if(globalIndex > MIN_SCROLL_COUNT) {
                lap.pause();
            }
            //S.log('batch done', globalIndex);
        });
        // 所有数据都处理完成以后调用
        lap.then(function() {
            tbody.appendChild(fragment);
            lap = null;
            //S.log('process done');
        });
        lap.start();
    }

    // 如果sku表格width超过显示宽度，则显示横向滚动条。
    // 避免表格被遮盖。
    // 如果sku表格height超过最大显示高度，则显示纵向滚动条。
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
        // 避免在ie下总是渲染错误。
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
        // 性能优化的重点。
        // 目前传入的groups里包含了必选的销售属性。
        // 若必选销售属性没有选择，则会导致sku组合数据为空。
        // 目前确认的业务逻辑允许这样操作。若要求组合数据不为空，则在dataAdapter操作之前过滤空销售属性即可。
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

            // 组合表格的loading显示 {{{
            // 设置默认的宽高，用于显示loading信息。
            // 根据sku数量来设置容器的宽高，避免高度变化太过明显。
            D.addClass(elMapContainer, 'sku-loading');
            var expectHeight = 32 * data.list.length;
            expectHeight = expectHeight > 600 ? 600 : expectHeight;
            //D.height(elMapContainer, expectHeight);
            // 宽度固定即可。
            D.width(elMapContainer, 650);
            //S.UA.ie && D.height(elSKUMap, expectHeight);
            // loading END}}}

            D.show(elSKUMap);
            // 正式处理数据组合和展示。
            batchRender(elMapContainer, data);
        }
    }, S.EventTarget);

}, {requires: ['template', './lap']});
