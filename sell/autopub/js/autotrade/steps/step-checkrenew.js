/**
 * Y.StepCheckRenew
 * @description ����Ƿ��������û�����
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-checkrenew', function(Y) {

/**
 * ��ǰͶ������
 * @module step-checkrenew
 */
    
    'use strict';
    
	/**
     * ����Ƿ��������û����蹹�캯��
     * @class StepCheckRenew
	 * @extends Step
	 * @uses StepLoad
	 * @uses StepAjax
     * @constructor
     */
    Y.StepCheckRenew = Y.Base.create('step-checkrenew', Y.Step, [
        Y.StepLoad,
        Y.StepAjax
    ], {
        
		/**
         * ��ʼ��
         * @method initializer
		 * @param {Object} config �����ʼ������
         * @public
         */
        initializer: function(config) {
            this.after('load', function(e) {
                this._checkRenew(config);
            });
        },
        
		/**
         * ��Ⱦ����ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������ 
         * @public
         */
        render:function(container, config) {
            this.data = config.data || {};
        },
        
		/**
         * ����Ƿ��������û�
         * @method _checkRenew
		 * @param {Object} config �����ʼ������ 
         * @protected
         */
        _checkRenew: function(config) {
            var _this = this,
                d = {
                    cityCode: config.cityCode,
                    cityName: config.cityName,
                    carId: config.carId,
					itemId: config.itemId
                };
            
            function handle(data) {
                switch (data.result) {
					
					//�������û�
                    case 'xubao':
                        _this.forward('step-renew', {
                            backDisabled: true,
                            data: data
                        });
                        break;
					
					//���±��û�
                    case 'new':
                        _this._loadNew(data);
                        break;
                    default:
                        break;
                }
            }
            
            this.load('/json/auto/checkRenewal.do', d, handle);
        },
        
		/**
         * ���Ϊ�±�����ת��������Ϣ��дҳ��
         * @method _loadNew
		 * @param {Object} dt �������� 
         * @protected
         */
        _loadNew: function(dt) {
            var _this = this,
                d = {
                    orderId: dt.orderId,
                    flowId: dt.flowId
                };
            
            function handle(data) {
                switch (data.result) {
					
					//��Ҫ¼�복����Ϣ
                    case 'have':
                        _this.forward('step-info', {
                            backDisabled: true,
                            data: data
                        });
                        break;
					
					//����Ҫ¼�복����Ϣ
                    case 'not':
                        _this.ajaxSaveInputInfo({
							orderId: data.orderId,
							flowId: data.flowId
						});
                    default:
                        break;
                }
            }

            this.load('/json/auto/queryInputInfo.do', d, handle);
        }
        
    }, {
	
		/**
		 * ���ò���
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
		
			/**
			 * @attribute preserved
			 * @description ��ת���Ƿ�������
			 * @type Boolean
			 */
            preserved: {
                value: false
            }
        }
    });
    
}, '0.0.1', {
    requires: ['step', 'step-load', 'step-ajax']
});
