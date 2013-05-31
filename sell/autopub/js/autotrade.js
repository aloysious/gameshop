/**
 * Y.AutoTrade
 * @description 车险接口化商品页逻辑
 * @author huya.nzb@taobao.com
 * @date 2013-03-01
 * @version 0.0.1
 */
 
YUI.add('autotrade', function(Y) {

/**
 * 车险接口化商品页逻辑
 * @module autotrade
 */
    
    'use strict';
    
	/**
	 * 车险接口化商品页逻辑构造函数
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
