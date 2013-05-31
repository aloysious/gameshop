/**
 * @fileoverview ������������ƽ̨ YUIģ��  
 * @author lingyu.csh@taobao.com 
 * @version 1.0
 */
//Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-35418620-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

(function() {
YUI.GlobalConfig = {
    base: 'http://a.tbcdn.cn/s/yui/' + YUI.version +'/build/',
    combine: true,
    comboBase: 'http://a.tbcdn.cn/??',
    root: 's/yui/' + YUI.version +'/build/',
    charset: 'gbk',
    comboSep: ',',
    maxURLLength: 2048,
    modules: {
        //�����������ݣ���̨�ӿ�
        'csd-search': {
            fullpath: '/baoxian/car/cityprefer/getCityPrefer.do'
        },
        'csd-current': {
            fullpath: '/json/cityCode.do'
        }
    },
    groups: {
        global: {
            root: 'app/dp/insure/framework/',
            comboBase: 'http://a.tbcdn.cn/??',
            combine: true,
            modules: {
                'ins-suggestbar': {
                    path: 'js/ins-suggestbar.js',
                    requires: ['node-base', 'stylesheet']
                },
                //�����Ƽ����ݣ�����framework�ļ�����
                'csd-suggest': {
                    path: 'js/widgets/citysuggestion-data/csd-suggest.js'
                },
                //mytabview
                'mytabview': {
                    path: 'js/widgets/mytabview/mytabview.js',
                    requires: ['base', 'classnamemanager', 'node', 'event', 'event-delegate']
                },
                //mytabview-lazyload
                'mytabview-lazyload': {
                    path: 'js/widgets/mytabview/mytabview-lazyload.js',
                    requires: ['plugin', 'mytabview']
                },
                //mytabview-fade
                'mytabview-fade': {
                    path: 'js/widgets/mytabview/mytabview-fade.js',
                    requires: ['plugin', 'mytabview', 'transition']
                },
                
                //placeholder
                'placeholder': {
                    path: 'js/widgets/placeholder/placeholder.js',
                    requires: ['node', 'event']
                },
                
                //HTMLģ��
                'mustache': {
                    path: 'js/widgets/mustache/mustache.js'
                },
                //autocomplete��ҳ���
                'autocomplete-paginator': {
                    path: 'js/widgets/autocomplete-paginator/autocomplete-paginator.js',
                    requires: ['plugin', 'autocomplete']
                },
                //����ѡ��Ƥ��
                'citysuggestion-skin': {
                    path: 'js/widgets/citysuggestion/citysuggestion-skin.css',
                    type: 'css'
                },
                //����ѡ��
                'citysuggestion': {
                    path: 'js/widgets/citysuggestion/citysuggestion.js',
                    requires: ['citysuggestion-skin', 'csd-current', 'csd-search', 'csd-suggest', 'mustache', 'mytabview', 'mytabview-lazyload', 'widget-stack', 'autocomplete', 'placeholder']
                }
            }
        },
        //�������
        widgets: {
            combine:true,
            base:'http://a.tbcdn.cn/app/dp/insure/autopub/js/widgets/',
            comboBase: 'http://a.tbcdn.cn/??',
            root: 'app/dp/insure/autopub/js/widgets/',
            modules: {

                //��ʾ��
                'box-skin-sea': {
                    path: 'box/sea.css',
                    type: 'css'
                },
                //��ʾ��Ƥ��
                'box': {
                    path: 'box/box.js',
                    requires: ['box-skin-sea', 'node', 'overlay', 'dd-plugin']
                },
                //html5����֤
                'html5form': {
                    path: 'html5form/html5form.js',
                    requires: ['node', 'base', 'widget', 'yui3-form-skin', 'form-postip-skin', 'form-postip']
                },
                //html5����֤Ƥ��
                'yui3-form-skin': {
                    path: 'html5form/yui3-form.css',
                    type: 'css'
                },
                //html5����֤������ʾ
                'form-postip': {
                    path: 'html5form/postip.js',
                    requires: ['node']
                },
                //html5����֤������ʾƤ��
                'form-postip-skin': {
                    path: 'html5form/postip.css',
                    type: 'css'
                },
                //�����˵��������
                'cascade': {
                    path: 'cascade/cascade.js',
                    requires: ['node']
                },
                //���ڼ������
                'datecascade': {
                    path: 'datecascade/datecascade.js',
                    requires: ['node', 'base']
                },
                //�������
                'calendar': {
                    path: 'calendar/calendar.js',
                    requires: ['calendar-skin', 'node']
                },
                //�������Ƥ��
                'calendar-skin': {
                    path: 'calendar/default.css',
                    type: 'css'
                },
                //��У�����
                'validator': {
                    path: 'validator/validator.js'
                },
                //��У����
                'trip-validation':{
                    path: 'trip-validation/trip-validation-core-min.js',
                    requires: ['form-postip']
                },
                //��У��������
                'checkform': {
                    path: 'checkform/checkform.js',
                    requires: ['validator', 'node', 'event-base', 'event-delegate', 'event-focus']
                },
                //��У��������
                'buyins': {
                    path: 'buyins/buyins.js',
                    requires: ['node', 'io']
                },
                //���̹�����
                'stepmanager': {
                    path: 'stepmanager/stepmanager.js',
                    requires: ['node-base', 'event-base', 'base', 'anim', 'step']
                },
                //���̲���
                'step': {
                    path: 'step/step.js',
                    requires: ['node-base', 'event-base', 'event-delegate', 'base']
                },
                'autocitysuggestion-skin': {
                    path: 'autocitysuggestion/autocitysuggestion-skin.css',
                    type: 'css'
                },
                'autocitysuggestion': {
                    path: 'autocitysuggestion/autocitysuggestion.js',
                    requires: ['autocitysuggestion-skin', 'csd-suggest', 'mustache', 'mytabview', 'mytabview-lazyload', 'widget-stack', 'autocomplete', 'placeholder']
                },
                'vehicle-skin': {
                    path: 'vehicle/vehicle-skin.css',
                    type: 'css'
                },
                'vehicle': {
                    path: 'vehicle/vehicle.js',
                    requires: ['vehicle-skin', 'placeholder', 'widget-stack', 'autocomplete']
                },
				'storagelite': {
                    path: 'storagelite/storagelite.js',
                    requires: ['event-base', 'event-custom', 'event-custom-complex', 'json']
                }
            }
        },
        //ϵͳ��ش���
        sys:{
            combine:true,
            comboBase: 'http://a.tbcdn.cn/??',
            root:'app/dp/',
            modules:{
                'hubble': {
                    path: 's/monitor/hubble-min.js',
                    requires: ['event']
                }
            }
        },
        
        autotrade: {
            combine: true, 
            root: 'autotrade/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/js/??',
            modules: {   
                'caridtranslator': {
                    path: 'caridtranslator.js'
                },
                'check-login': {
                    path: 'check-login.js',
                    requires: ['io', 'overlay']
                },
                'autotrade-base': {
                    path: 'autotrade-base.js',
                    requires: ['autocitysuggestion', 'autocomplete-paginator', 'caridtranslator', 'check-login', 'querystring-parse']
                },
                'autotrade-stepmanager': {
                    path: 'autotrade-stepmanager.js',
                    requires: ['stepmanager', 'overlay', 'step-loading', 'step-info', 'step-message', 'step-checkrenew', 'step-renew', 'step-config', 'step-plan', 'step-before', 'step-randcode']
                }
            }
        },
        
        steps: {
            combine: true, 
            root: 'steps/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/js/autotrade/??',
            modules: { 
                'step-loading': {
                    path: 'step-loading.js',
                    requires: ['node']
                },
                'step-stdmod': {
                    path: 'step-stdmod.js',
                    requires: ['node']
                },
                'step-load': {
                    path: 'step-load.js',
                    requires: ['io-base', 'json-parse', 'step-loading']    
                },
                'step-ajax': {
                    path: 'step-ajax.js',
                    requires: ['step-load']    
                },
				'step-validate': {
                    path: 'step-validate.js',
                    requires: ['node-base']    
                },
                'step-message': {
                    path: 'step-message.js',
                    requires: ['step', 'step-stdmod']
                },
                'step-before': {
                    path: 'step-before.js',
                    requires: ['step', 'step-stdmod']
                },
                'step-checkrenew': {
                    path: 'step-checkrenew.js',
                    requires: ['step', 'step-load', 'step-ajax']
                },
                'step-renew': {
                    path: 'step-renew.js',
                    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate']
                },
                'step-info': {
                    path: 'step-info.js',
                    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'vehicle', 'step-validate']
                },
                'step-config': {
                    path: 'step-config.js',
                    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax']
                },
                'step-randcode': {
                    path: 'step-randcode.js',
                    requires: ['step', 'step-stdmod', 'step-load', 'step-ajax', 'step-validate']
                },
                'step-plan': {
                    path: 'step-plan.js',
                    requires: ['step', 'step-stdmod', 'step-load', 'calendar']
                }
            }
        },
		
		fields: {
            combine: true, 
            root: 'fields/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/js/autoconfirm/??',
            modules: {
				'field-event': {
                    path: 'field-event.js',
                    requires: ['event-custom']
                },
				'field-widgets': {
                    path: 'field-widgets.js',
                    requires: ['node', 'event', 'event-delegate', 'event-valuechange', 'cascade', 'datecascade', 'calendar', 'field-event']
                },
				'field-widgetlang': {
                    path: 'field-widgetlang.js',
                    requires: ['node', 'event', 'event-delegate']
                },
				'field-linkage': {
                    path: 'field-linkage.js',
                    requires: ['node', 'event', 'event-delegate', 'field-event']
                },
				'field-widgetlist': {
                    path: 'field-widgetlist.js',
                    requires: ['node', 'event', 'event-delegate']
                }
			}
        },
        
        autoconfirm: {
            combine: true, 
            root: 'autoconfirm/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/js/??',
            modules: {   
                'autoconfirm-base': {
                    path: 'autoconfirm-base.js',
                    requires: ['node', 'field', 'storagelite']
                },
                'autoconfirm-submit': {
                    path: 'autoconfirm-submit.js',
                    requires: ['overlay', 'checkform', 'io', 'json-parse', 'autoconfirm-loading']
                },
                'autoconfirm-loading': {
                    path: 'autoconfirm-loading.js',
                    requires: ['node']
                },
                'autoconfirm-load': {
                    path: 'autoconfirm-load.js',
                    requires: ['io-base', 'json-parse']
                },
				'field': {
					use: ['field-widgets', 'field-widgetlang', 'field-linkage', 'field-widgetlist']
				}
            }
        },
        
        //ǰ���Լ��õ�ģ��
        mode:{
            combine: true, 
            root: 'js/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/??',
            modules: {
                //����ҳ��
                'item-publish': {
                    path: 'item-publish.js?t=20120711',
                    requires: ['node','panel','html5form','overlay','event','event-delegate','event-valuechange']
                },
                //����ҳ��
                'item-detail': {
                    path: 'item-detail.js?t=20130219',
                    requires: ['node','event','event-valuechange','event-delegate','io','jsonp',"overlay",'box','cookie'].concat(window.useCitySuggestion ? ['citysuggestion','autocomplete-paginator'] : [])
                },
                'autotrade': {
                    path: 'autotrade.js',
                    requires: ['autotrade-base', 'autotrade-stepmanager']
                },
                'autoconfirm': {
                    path: 'autoconfirm.js',
                    requires: ['autoconfirm-base', 'autoconfirm-submit', 'autoconfirm-load']
                },
                //Ͷ��ҳ�� View
                'buy-view': {
                    path: 'buy-view.js?t=20120809',
                    requires: ['event-valuechange', 'io', 'history', 'cascade', 'datecascade', 'calendar', 'checkform', 'panel']
                }
            }
        }
    }
};

//���ϵ���ģʽ
//1Ϊδѹ���汾
//2Ϊδѹ��debug�汾
var debugMode = location.search.match(/__yuidebug__=(.*?)(&|$)/);
if (debugMode && debugMode[1]) {
	if (debugMode[1] == '1') {
		YUI.GlobalConfig.filter = 'RAW';
	} else if (debugMode[1] == '2') {
		YUI.GlobalConfig.filter = 'DEBUG';
	}
}

window['YUI_LOARDER_TIME_STAMP'] = '20120420';
window['INS'] = YUI();
window['I'] = window['I'] || {};
})();
