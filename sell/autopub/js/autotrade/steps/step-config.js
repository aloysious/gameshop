/**
 * Y.StepConfig
 * @description ѡ���������ͺŲ���
 * @author huya.nzb@taobao.com
 * @date 2013-03-05
 * @version 0.0.1
 */
 
YUI.add('step-config', function(Y) {

/**
 * ѡ���������ͺŲ���
 * @module step-config
 */
    
    'use strict';
    
    var LIST_TEMPLATE = '<ul class="config-list">{items}</ul>',
        ITEM_TEMPLATE = '<li><label><input type="radio" data-name="{label}" name="{name}" value="{value}" /><span>{label}</span></label></li>';
    
	/**
     * ѡ���������ͺŲ��蹹�캯��
     * @class StepConfig
	 * @extends Step
	 * @uses StepStdMod
	 * @uses StepLoad
	 * @uses StepAjax
     * @constructor
     */
    Y.StepConfig = Y.Base.create('step-config', Y.Step, [
        Y.StepStdMod,
        Y.StepLoad,
        Y.StepAjax
    ], {
		
		/**
         * ��Ⱦ����ṹ
         * @method render
		 * @param {Node} container ��������
		 * @param {Object} config �����ʼ������ 
         * @public
         */
        render: function(container, config) {
            this.data = config.data || {};
            this._renderList();
            this.addButton('step-btn-continue', '��������', this._onContinueClick);
        },
        
		/**
         * ��Ⱦ�����ͺ��б�
         * @method _renderList
         * @protected
         */
        _renderList: function() {
            var data = this.data,
                id = Y.guid(),
                items = '',
                list;
            
            Y.Array.each(data.models, function(item) {
                items += (Y.Lang.sub(ITEM_TEMPLATE, {
                    name: id,
                    label: item.name,
                    value: item.id
                }));
            });
            
            list = Y.Lang.sub(LIST_TEMPLATE, {
                items: items
            });
            
            this.get('body').append(list);
            
            if (items) {
                this.get('body').one('input').set('checked', true);
            }
        },
        
		/**
         * ���ѡ��һ���ͺ�
         * @method _onContinueClick
         * @protected
         */
        _onContinueClick: function() {
            var _this = this,
                modelId = '',
                modelName = '';
            
            this.get('body').all('input').each(function(item) {
                if (item.get('checked')) {
                    modelId = item.get('value');
                    modelName = item.getAttribute('data-name');
                }    
            });
            
            this.ajaxSaveInputInfo({
                flowId: this.data.flowId,
                orderId: this.data.orderId,
                'vehicle.modelCode': modelId, //������̨�Ĳ������vehicleǰ׺
                'vehicle.modelName': modelName //������̨�Ĳ������vehicleǰ׺
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
                value: '��ѡ��Ͷ�������������ͺ�'    
            },
			
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
    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax']
});
