/**
 * Y.StepAjax
 * @description ����ͨ��Ajax����ģ��
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-ajax', function(Y) {
 
/**
 * ����
 * @module step
 * @main step
 */

/**
 * ����ͨ��Ajax����ģ��
 * @module step
 * @submodule step-ajax
 */
   
	'use strict';
	
	/**
     * ����ͨ��Ajax����ģ�鹹�캯��
     * @class StepAjax
     * @constructor
     */
    function StepAjax() {}
    
    Y.mix(StepAjax, {
        
		/**
         * �����û���д��Ϣ�ӿ�
         * @method ajaxSaveInputInfo
		 * @param {Object} d �ӿڴ���
         * @public
         */
        ajaxSaveInputInfo: function(d) {
            var _this = this;
            
            function handle(data) {
                switch (data.result) {
					
					//��������
                    case 'normal':
                        //����������㱣�Ѽ۸�
                        _this.ajaxDetailQuote(data); 
                        break;
					
					//�ܱ�
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data    
                        });
                        break;
					
					//ѡ����������Ϣ
                    case 'choose':
                        _this.forward('step-config', {
                            data: data    
                        });
                        break;
					
					//��Ҫ������֤��
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        this.forward('step-randcode', {
                            data: data    
                        });
                        break;
                    default:
                        break;
                }
            }
            
            this.load('/json/auto/saveInputInfo.do', d, handle);
        },
        
		/**
         * �ײͱ��۽ӿ�
         * @method ajaxDetailQuote
		 * @param {Object} d �ӿڴ���
         * @public
         */
        ajaxDetailQuote: function(d) {
            var _this = this,
                _d = {
                    flowId: d.flowId,
                    orderId: d.orderId,
                    bizBeginDate: d.bizBeginDate, //��ҵ������
                    forceBeginDate: d.forceBeginDate //��ǿ������    
                };
            
            function handle(data) {
                switch (data.result) {
					
					//����������ʧ�ܣ���ǰͶ��������ת���ײ�ҳ
                    case 'normal':
                    case 'fail':
                    case 'bothBefore':
                    case 'bizBefore':
                    case 'forceBefore':
                        _this.forward('step-plan', {
                            data: d,
                            premiumData: data
                        });
                        break;
					
					//�ܱ�
                    case 'refuse':
                        _this.forward('step-message', {
                            data: data
                        });
                        break;
					
					//��Ҫ������֤��
                    case 'bizCheck':
                    case 'forceCheck':
                    case 'bothCheck':
                        _this.forward('step-randcode', {
                            data: data
                        });
                        break;
                     default:
                        break;
                }
            }
            
            this.load('/json/auto/detailQuote.do', _d, handle);
        }
            
    }, false, null, 4);
    
    Y.StepAjax = StepAjax;
    
}, '0.0.1', {
    requires: ['step-load']
});
