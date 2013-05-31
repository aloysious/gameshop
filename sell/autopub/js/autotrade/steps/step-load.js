/**
 * Y.StepLoad
 * @description �ӿڻ��������ݻ�ȡ���ӿڴ���
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-load', function(Y) {

/**
 * ����
 * @module step
 * @main step
 */

/**
 * ������������
 * @module step
 * @submodule step-load
 */
   
	'use strict';
   
	/**
     * �����������ع��캯��
     * @class StepLoad
     * @constructor
     */
    function StepLoad() {}
    
    Y.mix(StepLoad, {
        
		/**
         * ��ȡ����
         * @method load
		 * @param {String} uri �ӿڵ�ַ
		 * @param {Object} data ���͵���̨������
		 * @param {Function} callback �������ݴ���ص�
		 * @param {Boolean} loading �Ƿ���ʾ���ز� Y.StepLoading.show();
		 * @chainable
         * @public
         */
        load: function(uri, data, callback, loading) {
            var retry = 3, //״̬Ϊ4000ʱ����1��
                _this = this;
            
            loading = loading === false ? false : true;
            
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
                            
							//�������Ѿ������٣���ֹͣ����
                            if (this.get('destroyed')) { return; }
                            
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
            
            loading && Y.StepLoading.show();
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
         * �û�¼�������������һ���޸�
         * @method _onInputErr
		 * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onInputErr: function(errMsg) {
            this.forward('step-message', {
                data: {
                    message: '<p>' + (errMsg || '') + '</p>'
                }
            });
        },
        
		/**
         * ���̳�ʱ
         * @method _onFlowTimeout
		 * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onFlowTimeout: function(errMsg) {
            this.forward('step-message', {
                backDisabled: true,
                data: {
                    message: '<p>' + (errMsg || '��Ǹ�����̳�ʱ�������رյ�������Ͷ����') + '</p>'
                } 
            });
        },
        
		/**
         * �����쳣
         * @method _onFlowErr
		 * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onFlowErr: function(errMsg) {
            this.forward('step-message', {
                backDisabled: true,
                data: {
                    message: '<p>' + (errMsg || '��Ǹ�����̷����쳣�������رյ�������Ͷ����') + '</p>'
                } 
            });
        },
        
		/**
         * ϵͳ�쳣
         * @method _onSystemErr
		 * @param {String} errMsg ������Ϣ
         * @protected
         */
        _onSystemErr: function(errMsg) {
			var backable = this.get('parent').isBackable();
			
            this.forward('step-message', {
				backDisabled: !backable,
                data: {
                    message: '<p>' + (errMsg || ('��Ǹ��ϵͳ�����쳣��������' + (backable ? '������һ����' : '') + '�ر����ԣ�')) + '</p>'    
                }
            });
        }
		
    }, false, null, 4);
    
    Y.StepLoad = StepLoad;
    
}, '0.0.1', {
    requires: ['io-base', 'json-parse']
});
