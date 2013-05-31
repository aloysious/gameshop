/**
 * Y.StepBefore
 * @description ��ǰͶ������
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-before', function(Y) {

/**
 * ��ǰͶ������
 * @module step-before
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="before-handle">{handles}</ul>',
        BIZ_BEFORE_TEMPLATE = '<li><p>��Ͷ����ǿ�գ���ҵ�յȵ���������Ͷ����</p><a href="{link}">Ͷ����ǿ��</a></li>',
        FORCE_BEFORE_TEMPLATE = '<li><p>��Ͷ����ҵ�գ���ǿ�յȵ���������Ͷ����</p><a href="{link}">Ͷ����ҵ��</a></li>',
        BOTH_BEFORE_TEMPLATE = '<li><p>��˶Ա�����Ч���ڣ������С��������뷵���޸ġ�</p><a href="#" class="modify-effect">�޸ı�����Ч����</a></li>';
    
	/**
     * ��ǰͶ�����蹹�캯��
     * @class StepBefore
	 * @extends Step
	 * @uses StepStdMod
     * @constructor
     */
    Y.StepBefore = Y.Base.create('step-before', Y.Step, [
        Y.StepStdMod
    ], {
        
		/**
         * ��ʼ��
         * @method initializer
		 * @param {Object} config �����ʼ������
		 * @param {Object} [config.data] �������� 
         * @public
         */
        initializer: function(config) {
            var data = config.data || {};
            this.set('note', data.promptMsg);
        },
        
		/**
         * ��Ⱦ����ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������ 
         * @public
         */
        render: function(container, config) {
            var html = '',
                data = config.data || {},
				domain = location.href.indexOf('daily.taobao.net') > -1 ? 'http://baoxian.daily.taobao.net' : 'http://baoxian.taobao.com';

            if (data.result == 'bizBefore') {
                html += Y.Lang.sub(BIZ_BEFORE_TEMPLATE, {
					link: domain + '/auto/quote.html?itemFlag=force&tmpOrderId=' + data.orderId
				});
            } else if (data.result == 'forceBefore') {
                html += Y.Lang.sub(FORCE_BEFORE_TEMPLATE, {
					link: domain + '/auto/quote.html?itemFlag=biz&tmpOrderId=' + data.orderId
				});
            } else {}
            html += BOTH_BEFORE_TEMPLATE;
            this.get('body').append(Y.Lang.sub(LIST_TEMPLATE, {
                handles: html
            }));
            this.get('body').delegate('click', function(e) {
                e.preventDefault();
                this.back();
            }, '.modify-effect', this);
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
                value: '��Ŀǰ�ı�����δ����'
            }
        }
        
    });
    
}, '0.0.1', {
    requires: ['step', 'step-stdmod']
});
