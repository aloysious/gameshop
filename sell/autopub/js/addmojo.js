/**
 * @fileoverview 保险自助发布平台 YUI模块  
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
        //城市搜索数据，后台接口
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
                //城市推荐数据，放置framework文件夹里
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
                
                //HTML模板
                'mustache': {
                    path: 'js/widgets/mustache/mustache.js'
                },
                //autocomplete翻页插件
                'autocomplete-paginator': {
                    path: 'js/widgets/autocomplete-paginator/autocomplete-paginator.js',
                    requires: ['plugin', 'autocomplete']
                },
                //城市选择皮肤
                'citysuggestion-skin': {
                    path: 'js/widgets/citysuggestion/citysuggestion-skin.css',
                    type: 'css'
                },
                //城市选择
                'citysuggestion': {
                    path: 'js/widgets/citysuggestion/citysuggestion.js',
                    requires: ['citysuggestion-skin', 'csd-current', 'csd-search', 'csd-suggest', 'mustache', 'mytabview', 'mytabview-lazyload', 'widget-stack', 'autocomplete', 'placeholder']
                }
            }
        },
        //公用组件
        widgets: {
            combine:true,
            base:'http://a.tbcdn.cn/app/dp/insure/autopub/js/widgets/',
            comboBase: 'http://a.tbcdn.cn/??',
            root: 'app/dp/insure/autopub/js/widgets/',
            modules: {

                //提示框
                'box-skin-sea': {
                    path: 'box/sea.css',
                    type: 'css'
                },
                //提示框皮肤
                'box': {
                    path: 'box/box.js',
                    requires: ['box-skin-sea', 'node', 'overlay', 'dd-plugin']
                },
                //html5表单验证
                'html5form': {
                    path: 'html5form/html5form.js',
                    requires: ['node', 'base', 'widget', 'yui3-form-skin', 'form-postip-skin', 'form-postip']
                },
                //html5表单验证皮肤
                'yui3-form-skin': {
                    path: 'html5form/yui3-form.css',
                    type: 'css'
                },
                //html5表单验证错误提示
                'form-postip': {
                    path: 'html5form/postip.js',
                    requires: ['node']
                },
                //html5表单验证错误提示皮肤
                'form-postip-skin': {
                    path: 'html5form/postip.css',
                    type: 'css'
                },
                //下拉菜单级联组件
                'cascade': {
                    path: 'cascade/cascade.js',
                    requires: ['node']
                },
                //日期级联组件
                'datecascade': {
                    path: 'datecascade/datecascade.js',
                    requires: ['node', 'base']
                },
                //日历组件
                'calendar': {
                    path: 'calendar/calendar.js',
                    requires: ['calendar-skin', 'node']
                },
                //日历组件皮肤
                'calendar-skin': {
                    path: 'calendar/default.css',
                    type: 'css'
                },
                //表单校验组件
                'validator': {
                    path: 'validator/validator.js'
                },
                //表单校验框架
                'trip-validation':{
                    path: 'trip-validation/trip-validation-core-min.js',
                    requires: ['form-postip']
                },
                //表单校验错误输出
                'checkform': {
                    path: 'checkform/checkform.js',
                    requires: ['validator', 'node', 'event-base', 'event-delegate', 'event-focus']
                },
                //表单校验错误输出
                'buyins': {
                    path: 'buyins/buyins.js',
                    requires: ['node', 'io']
                },
                //流程管理器
                'stepmanager': {
                    path: 'stepmanager/stepmanager.js',
                    requires: ['node-base', 'event-base', 'base', 'anim', 'step']
                },
                //流程步骤
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
        //系统监控代码
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
        
        //前端自己用的模块
        mode:{
            combine: true, 
            root: 'js/',
            comboBase: 'http://a.tbcdn.cn/app/dp/insure/autopub/??',
            modules: {
                //发布页面
                'item-publish': {
                    path: 'item-publish.js?t=20120711',
                    requires: ['node','panel','html5form','overlay','event','event-delegate','event-valuechange']
                },
                //详情页面
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
                //投保页表单 View
                'buy-view': {
                    path: 'buy-view.js?t=20120809',
                    requires: ['event-valuechange', 'io', 'history', 'cascade', 'datecascade', 'calendar', 'checkform', 'panel']
                }
            }
        }
    }
};

//线上调试模式
//1为未压缩版本
//2为未压缩debug版本
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
