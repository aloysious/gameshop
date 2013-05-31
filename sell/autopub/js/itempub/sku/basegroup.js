KISSY.add(function(S) {
    var D = S.DOM, E = S.Event,
        CLS_DISABLED = 'disabled';

    /**
     * 设置表单域是否可用。
     */
    function _enable(inputs, isEnable) {
        var val = isEnable ? false : true;
        D.prop(inputs, 'disabled', val);
    }

    /**
     * constructor
     */
    var BaseGroup = function() {
        this.init.apply(this, arguments);
    };

    S.augment(BaseGroup, S.EventTarget, {
        init: function(elGroup) {
            var self = this;
            self.elGroup = elGroup;
            self.isDisabled = D.hasClass(elGroup, CLS_DISABLED);
            self.elBox = D.get('.sku-box', elGroup);
            self.formFields = D.query('input', elGroup);
        },
        disable: function() {
            var self = this;
            if(!self.isDisabled) {
                _enable(self.formFields, false);
                D.addClass(self.elGroup, CLS_DISABLED);
                self.isDisabled = true;
            }
        },
        enable: function() {
            var self = this;
            if(self.isDisabled) {
                _enable(self.formFields, true);
                D.removeClass(self.elGroup, CLS_DISABLED);
                self.isDisabled = false;
            }
        }
    });

    return BaseGroup;
});
