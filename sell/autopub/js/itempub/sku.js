/**
 * 销售属性和sku相关脚本的执行入口
 */
KISSY.add(function(S, SKUManager) {
    var E = S.Event,
        D = S.DOM;

    return {
        init: function() {
            var elContainer = D.get('#J_SellProperties');
            if(!elContainer) return;

            var htmlConfig = D.html('#J_SKUConfig'),
                config = S.trim(htmlConfig) ? S.JSON.parse(htmlConfig) : {},
                elAddGroup = D.get('#J_AddCustomSKU'),
                elPrice = D.get('#buynow'),
                elQuantity = D.get('#quantityId'),
                elHiddenCPVS = D.get('#J_AvailableCustomCPV');

            // 根据元素存在与否来决定是否执行对应的初始方法。
            elAddGroup && SKUManager.bindAddGroup(elAddGroup, elContainer, config.config);
            elHiddenCPVS && SKUManager.bindAvaialCPVS(elHiddenCPVS);
            elQuantity && SKUManager.bindQuantity(elQuantity);
            elPrice && SKUManager.bindPrice(elPrice);
            // sku初始化
            SKUManager.init(elContainer, config);
        },
        valid: function() {
            // 如果没有sku或没有自定义sku，默认返回的是true。
            return SKUManager.hasSaved();
        },
        showTip: function() {
            SKUManager.showUnsavedTip();
        },
        expandColors: function() {
            SKUManager.expandColors();
        }
    };
}, {requires:['./sku/manager']});
