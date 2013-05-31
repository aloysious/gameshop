/**
 * Y.AutoTradeStepManager
 * @description ������Ʒҳ���۲���
 * @author huya.nzb@taobao.com
 * @date 2013-02-28
 * @version 0.0.1
 */
 
YUI.add('autotrade-stepmanager', function(Y) {

/**
 * ��Ʒҳ�߼�
 * @module autotrade
 * @main autotrade
 */

/**
 * ������Ʒҳ���۲���
 * @module autotrade
 * @submodule autotrade-stepmanager
 */
    
	/**
     * ������Ʒҳ���۲��蹹�캯��
     * @class AutoTradeStepManager
     * @for AutoTrade
     * @constructor
     */    
    function AutoTradeStepManager() {}
    
    Y.mix(AutoTradeStepManager, {
        
		/**
         * ģ���ʼ��
         * @method initializer
         * @public
         */ 
        initializer: function() {
            Y.after(this._bindStepManager, this, 'render');
        },
        
		/**
         * ��ʾ���۵���
         * @method showStepManager
		 * @param {EventFacade} �¼�����
         * @public
         */ 
        showStepManager: function(e) {
            if (!this._stepManager)  {
                this._renderStepManager();
            }
            if (!this._stepBox) {
                this._renderStepBox();
            }
            this._stepBox.show();
            this._checkRenewStep(e);
        },
        
		/**
         * ��ʼ������Ƿ��������û�
         * @method _checkRenewStep
         * @protected
         */
        _checkRenewStep: function(e) {
			// �³�δ����ʱ�����ƺ�Ϊǰ׺�ӡ�*�������硰��A*��
            this._stepManager.forward('step-checkrenew', {
                cityCode: e.cityCode,
                cityName: e.cityName,
                carId: e.newCar ? (e.cityPrefix + '*') : e.carId,
                itemId: e.itemId
            });
        },
        
		/**
         * �󶨱��ύ�����ص�
         * @method _bindStepManager
         * @protected
         */
        _bindStepManager: function() {
            this.on('submit', function(e) {
                this.showStepManager(e);
            });
        },
        
		/**
         * ��Ⱦ����������
         * @method _renderStepManager
         * @protected
         */
        _renderStepManager: function() {
            this._stepManager = new Y.StepManager({
                steps: [
					//������Ϣ��д����
                    Y.StepInfo,
					//��Ϣ����
                    Y.StepMessage,
					//��ǰͶ������
                    Y.StepBefore,
					//��֤�벽��					
                    Y.StepRandcode,
					//����Ƿ��������û�����
                    Y.StepCheckRenew, 
					//�����û����֤ȷ�ϲ���
                    Y.StepRenew, 
					//����������Ϣ����
                    Y.StepConfig,
					//���۷�������
                    Y.StepPlan 
                ],
				useTransition: (Y.UA.ie != 6)
            });
            this._stepManager.on('*:load', function(e) {
                Y.StepLoading.hide();   
            });  
        },
        
		/**
         * ��Ⱦ���۵���
         * @method _renderStepBox
         * @protected
         */
        _renderStepBox: function() {
            var mask = Y.Node.create('<div class="autotrade-stepbox-mask hidden"></div>'),
                close = Y.Node.create('<a href="#" class="autotrade-stepbox-close" title="�ر�"></a>'),
                bottom = Y.Node.create('<div class="autotrade-stepbox-bottom"></div>'),
                stepBox = new Y.Overlay({
                    render: true,
                    visible: false,
                    width: '594px',
                    zIndex: 200000,
                    centered: true
                });
            
            function sizeMask(visible) {
                if (visible && Y.UA.ie == 6) {
                    mask.setStyles({
                        width: Y.DOM.docWidth() + 'px',
                        height: Y.DOM.docHeight() + 'px'
                    });
                }
            }
            
            mask.setStyles({
                opacity: 0.6,
                zIndex: 200000
            });
            bottom.setStyle('opacity', 0.2);
            stepBox.get('boundingBox').addClass('autotrade-stepbox');
            stepBox.get('boundingBox').insert(mask, 'before');
            stepBox.get('boundingBox').append(bottom);
            this._stepManager.render(stepBox.get('contentBox'));
            stepBox.get('contentBox').append(close);
            
            stepBox.after('visibleChange', function(e) {
                sizeMask(e.newVal);
                mask.toggleClass('hidden', !e.newVal);
                if (!e.newVal && this._stepManager) {
                    this._stepManager.clear();
                    Y.StepLoading.hide();
                }
            }, this);
            close.on('click', function(e) {
                e.preventDefault(); 
                stepBox.hide();   
            });
            
            if (!Y.StepLoading.rendered) {
                Y.StepLoading.render(this._stepManager.get('listNode'));
            }
            
            this._stepBox = stepBox;
            this._stepBoxMask = mask;
            this._stepManager._stepBox = this._stepBox;
        }
        
    }, false, null, 4);
    
    Y.AutoTradeStepManager = AutoTradeStepManager;
    
}, '0.0.1', {
    requires: ['stepmanager', 'step', 'overlay', 'io', 'json-parse']
});
