YUI.namespace('Y.CheckForm');
YUI.add('checkform', function (Y) {
    Y.CheckForm = function (formid, callback, context) {
        var form = Y.one('#' + formid),
            that = this;
        if (!form || !Validator) return;
        var formValidator = Validator(Validator_JSON);
        function checkFn (e) {
            e.preventDefault();
            var _form = Y.Node.getDOMNode(form);
            var validator = formValidator.checkForm(_form);
            var errs = validator.ErrArr;
            form.all('.err-highlight').removeClass('err-highlight');
            if (errs.length) {
                var errStr = '';
                for (var i = 0; i < errs.length; i++) {
                    errStr += '<li>' + errs[i] + '</li>';
                }
                Y.one('#J_ErrMsg').set('innerHTML', errStr);
                Y.one('#submit_error').setStyle('display', 'block');
				window.scrollTo(0, 0);
                location.hash = 'error_info';
                var errsObj = validator.ErrObj;
                for (var i in errsObj) {
                    if (!/#B$/.test(i) && _form[i]) {
                        var pn;
                        if (!_form[i].tagName && _form[i][0]) {
                            pn = Y.one(_form[i][0]).ancestor('.widget-item p') || Y.one(_form[i][0]).ancestor('.widget-item');
                        } else {
                            pn = Y.one(_form[i]).ancestor('.widget-item p') || Y.one(_form[i]).ancestor('.widget-item');
                        }
                        if (pn) {
                            pn.addClass('err-highlight');
                        }
                    } else if (/#B$/.test(i)) {
                        var loop_pn, be = i.slice(0, -2);
                        for (var j = 0, e = _form.elements, l = e.length; j < l; j++) {
                            if (e[j].name.indexOf(be + '-') > -1) {
                                loop_pn = Y.one(e[j]).ancestor('.widget-item p') || Y.one(e[j]).ancestor('.widget-item');
                            }
                            if (loop_pn) {
                                loop_pn.addClass('err-highlight');
                            }
                        }
                    }
                }
            } else {
                Y.one('#J_ErrMsg').set('innerHTML', '');
                if (form.getAttribute('valid') == "" || form.getAttribute('valid') == '1') {
                    Y.one('#submit_error').setStyle('display', 'none');
                }
                if (callback) {
                    callback.call(context || that, form);
                } else {
                    form.submit();
                }
            }
        }
        
        function validateItem(e) {
            var item = e.currentTarget.ancestor('.widget-item p') || e.currentTarget.ancestor('.widget-item'),
                valid = true,
                nodes,
                result;
                
            if (item && item.hasClass('err-highlight')) {
                nodes = item.all('input,textarea,select').getDOMNodes();
                Y.Array.some(nodes, function(node) {
                    result = formValidator.validateElem(node);
                    if (result.ErrArr.length) {
                        valid = false;
                        return true;
                    }
                })
                valid && item.removeClass('err-highlight');
            }
        }
        
        form.delegate('blur', function(e) {
            validateItem(e);
        }, 'input');
        form.delegate('blur', function(e) {
            validateItem(e);
        }, 'select');
        form.delegate('click', function(e) {
            validateItem(e);
        }, 'input[type=radio]');
        form.delegate('click', function(e) {
            validateItem(e);
        }, 'input[type=checkbox]');
        
        form.one('.submit-btn').on('click', checkFn);
        form.on('submit', checkFn);
    }
}, '1.0.1', {
    requires: ['validator', 'node', 'event-base', 'event-delegate', 'event-focus']
});