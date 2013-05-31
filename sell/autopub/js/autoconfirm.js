/**
 * Y.AutoConfirm
 * @description ���սӿڻ�ȷ��ҳ�߼�
 * @author huya.nzb@taobao.com
 * @date 2013-03-11
 * @version 0.0.1
 */
 
YUI.add('autoconfirm', function(Y) {

/**
 * ���սӿڻ�ȷ��ҳ�߼�
 * @module autoconfirm
 */

    'use strict';

    /**
     * ���սӿڻ�ȷ��ҳ�߼����캯��
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
