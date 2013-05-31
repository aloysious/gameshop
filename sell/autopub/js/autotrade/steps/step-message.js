/**
 * Y.StepMessage
 * @description ��ʾ��Ϣ����
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-message', function(Y) {

/**
 * ��ʾ��Ϣ����
 * @module step-message
 */    
    'use strict';
    
    var MESSAGE_TEMPLATE = '<div class="message-bd">{message}</div>';
    
	/**
     * ��ʾ��Ϣ���蹹�캯��
     * @class StepMessage
	 * @extends Step
	 * @uses StepStdMod
     * @constructor
     */
    Y.StepMessage = Y.Base.create('step-message', Y.Step, [
        Y.StepStdMod
    ], {
        
		/**
         * ��ʼ������
         * @method initializer
		 * @param {Object} config �����ʼ������
         * @public
         */
        initializer: function(config) {
            var data = this.data = config.data || {};
            if (data.result == 'refuse') {
                this.set('backDisabled', true);
            }
        },
        
		/**
         * ��Ⱦ�ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������
         * @public
         */
        render: function(container, config) {
            this.get('body').setContent(Y.Lang.sub(MESSAGE_TEMPLATE, {
				//����promptMsg��message��������
                message: this.data.promptMsg || this.data.message || ''
            }));           
            this.addButton('step-btn-close', '�ر�', function() {
                this.get('parent')._stepBox.hide();
            });
        }
        
    }, {
        
		/**
		 * ���ò���
		 * @property ATTRS
		 * @static
		 */
        ATTRS: {
			
			/**
			 * @attribute title
			 * @description �������
			 * @type String
			 */
            title: {
                value: '�й�ƽ�����չ�˾'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod']
});
