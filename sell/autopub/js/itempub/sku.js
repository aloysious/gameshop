/**
 * �������Ժ�sku��ؽű���ִ�����
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

            // ����Ԫ�ش�������������Ƿ�ִ�ж�Ӧ�ĳ�ʼ������
            elAddGroup && SKUManager.bindAddGroup(elAddGroup, elContainer, config.config);
            elHiddenCPVS && SKUManager.bindAvaialCPVS(elHiddenCPVS);
            elQuantity && SKUManager.bindQuantity(elQuantity);
            elPrice && SKUManager.bindPrice(elPrice);
            // sku��ʼ��
            SKUManager.init(elContainer, config);
        },
        valid: function() {
            // ���û��sku��û���Զ���sku��Ĭ�Ϸ��ص���true��
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
