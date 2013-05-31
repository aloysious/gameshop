/**
 * Y.AutoTrade
 * @description ���սӿڻ���Ʒҳ�߼�
 * @author huya.nzb@taobao.com
 * @date 2013-03-01
 * @version 0.0.1
 */
 
YUI.add('autotrade', function(Y) {

/**
 * ���սӿڻ���Ʒҳ�߼�
 * @module autotrade
 */
    
    'use strict';
    
	/**
	 * ���սӿڻ���Ʒҳ�߼����캯��
	 * @class AutoTrade
	 * @extends Base
	 * @uses AutoTradeBase
	 * @uses AutoTradeStepManager
	 * @constructor
	 */   
    Y.AutoTrade = Y.Base.create('autotrade', Y.Base , [
        Y.AutoTradeBase,
        Y.AutoTradeStepManager
    ], {}, {});
        
    new Y.AutoTrade().render();
    
}, '0.0.1', {
    requires: ['autotrade-base', 'autotrade-stepmanager']
});
