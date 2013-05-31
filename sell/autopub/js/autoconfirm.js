/**
 * Y.AutoConfirm
 * @description 车险接口化确认页逻辑
 * @author huya.nzb@taobao.com
 * @date 2013-03-11
 * @version 0.0.1
 */
 
YUI.add('autoconfirm', function(Y) {

/**
 * 车险接口化确认页逻辑
 * @module autoconfirm
 */

    'use strict';

    /**
     * 车险接口化确认页逻辑构造函数
     * @class AutoConfirm
     * @extends Base
     * @uses AutoConfirmBase
     * @uses AutoConfirmLoad
     * @uses AutoConfirmSubmit
     * @constructor
     */     
    Y.AutoConfirm = Y.Base.create('autoconfirm', Y.Base , [
        Y.AutoConfirmBase,
        Y.AutoConfirmLoad,
        Y.AutoConfirmSubmit
    ]);
        
    new Y.AutoConfirm().render();
    
}, '0.0.1', {
    requires: ['autoconfirm-base', 'autoconfirm-submit', 'autoconfirm-load']
});
