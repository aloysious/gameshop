/**
 * Y.AutoConfirmLoad
 * @description ���սӿڻ�ȷ��ҳ��������
 * @author huya.nzb@taobao.com
 * @date 2013-03-10
 * @version 0.0.1
 */

YUI.add('autoconfirm-load', function(Y) {
 
/**
 * ȷ��ҳ�߼�
 * @module autoconfirm
 * @main autoconfirm
 */

/**
 * ��������
 * @module autoconfirm
 * @submodule autoconfirm-load
 */
    
    'use strict';
    
    /**
     * �������ݹ��캯��
     * @class AutoConfirmLoad
     * @constructor
     */
    function AutoConfirmLoad() {}
    
    Y.mix(AutoConfirmLoad, {
        
        /**
         * ��������
         * @method load
         * @param {String} uri �ӿڵ�ַ
         * @param {Object} data ���͵���̨������
         * @param {Function} callback �������ݴ���ص�
         * @chainable
         * @public
         */
        load: function(uri, data, callback) {
            var retry = 1, //״̬Ϊ4000ʱ����1��
                _this = this;
            
            function load() {
                Y.io(uri, {
                    method: 'GET',
                    data: Y.merge(data, {
                        t: new Date().getTime(),
                        _input_charset: 'UTF-8'
                    }),
                    on: {
                        complete: function(id, r) {
                            var res = null;
                            
                            try {
                                res = Y.JSON.parse(r.responseText);
                            } catch (err) {}
                            
                            if (res) {
                                switch (res.state) {
                                    
                                    //��������
                                    case 0:
                                        if (!res.data || !res.data.result) {
                                            _this._onFlowErr(res.errMsg);
                                        } else if (typeof callback == 'function') {
                                            callback.call(_this, Y.merge(res.data || {}, {
                                                flowId: res.flowId,
                                                orderId: res.orderId
                                            }));
                                        } else {}
                                        break;
                                        
                                    //���̳�ʱ
                                    case 560:
                                        _this._onFlowTimeout(res.errMsg);
                                        break;
                                    
                                    //�û�¼�����
                                    case 561:
                                        _this._onInputErr(res.errMsg);
                                        break;
                                    
                                    //ϵͳ�쳣������һ��
                                    case 4000:
                                        if (retry > 0) {
                                            retry--;
                                            load();
                                        } else {
                                            _this._onSystemErr(res.errMsg);
                                        }
                                        break;
                                    
                                    //δ��¼����ת����¼ҳ
                                    case 4001:
                                        _this._redirectToLogin();
                                        break;
                                    
                                    //����Ϊ�����쳣
                                    default:
                                        _this._onFlowErr(res.errMsg);
                                }
                            } else {
                                //���س��������쳣
                                _this._onFlowErr();
                            }
                        }
                    }
                });
            }
            
            load();
            
            return this;
        },
        
        /**
         * ��ת����¼ҳ��
         * @method _redirectToLogin
         * @protected
         */
        _redirectToLogin: function() {
            var isDaily = window.location.href.indexOf('daily.taobao.net') > -1 ? true : false;
            window.location.href = (isDaily ? 'http://login.daily.taobao.net/member/login.jhtml?redirectURL=' : 'https://login.taobao.com/member/login.jhtml?redirectURL=') + encodeURIComponent(window.location.href);
        },
        
        /**
         * �û�¼�����
         * @method _onInputErr
         * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onInputErr: function(errMsg) {
            this._showMsgContent(errMsg);
        },
        
        /**
         * ���̳�ʱ
         * @method _onFlowTimeout
         * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onFlowTimeout: function(errMsg) {
            this._showMsgContent(errMsg || '��Ǹ�����̳�ʱ�������Թرյ������Ի�����Ͷ����');
        },
        
        /**
         * �����쳣
         * @method _onFlowErr
         * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onFlowErr: function() {
            this._showMsgContent(errMsg || '��Ǹ�����̷����쳣�������Թرյ������Ի�����Ͷ����');
        },
        
        /**
         * ϵͳ�쳣
         * @method _onSystemErr
         * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onSystemErr: function() {
            this._showMsgContent(errMsg || '��Ǹ��ϵͳ�����쳣�������Թرյ������Ի�����Ͷ����');
        }
        
    }, false, null, 4);
    
    Y.AutoConfirmLoad = AutoConfirmLoad;
    
}, '0.0.1', {
    requires: ['io-base', 'json-parse']
});