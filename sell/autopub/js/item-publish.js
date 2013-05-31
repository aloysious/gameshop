/**
 * yiling.zy@taobao.com
 * 保险发布页面js 
 * 2012年2月7日
 */
YUI.add('item-publish',function(Y){
	var $ = Y.one,$$ = Y.all,isInt = false;
	/**
	 * 投保模块
	 * 提交错误后端返回数据填入
	 * @method Y.setDefautValue
	 * @param {json object} o 返回对应节点选中
	 * (o.checkbox 针对checkbox执行选中状态)
	 * (o.input 针对input执行设置直)
	 * (依赖两个方法selectedCheck & setInputValue) 
	 */
	Y.setDefaultValue = function(data){
		if(!isInt){
			defaultInsInfo();
		}
		var checkboxA = data.checkbox,
			inputA = data.input,
			i,j;
		if(checkboxA){
			for(i = 0 ;i < checkboxA.length;i++){
				selectedCheck(checkboxA[i]);	
			}
		}
		if(inputA){
			for(j = 0;j < inputA.length;j++){
				setInputValue(inputA[j]);	
			}
		}
	}
	function selectedCheck(o){
		var checkNodes = document.getElementsByName(o.name),
			checkValues = o.value.split(','),
			i,j,ancestor;	
		for(i = 0;i < checkNodes.length;i++){
			for(j = 0;j < checkValues.length; j++){
				var curNode = $(checkNodes[i]);
				if(curNode.get('value') == checkValues[j]){
					curNode.set('checked',true);
					if((ancestor = curNode.ancestor('.tb-info-table'))){
						ancestor.one('thead input').set('checked',true);
					}
					//默认选中的checkbox一行的状态
					if(curNode.ancestor('tbody')){
						var o = getVariable(curNode);
						insInfoSelected(o);
					}
				}	
			}	
		}
	}
	function setInputValue(o){
		var inputNodes = document.getElementsByName(o.name),
			inputValues = o.value.split(','),
			i,j = 0,parentNode,getIndex,tempValue;	
		for(i = 0;i < inputNodes.length;i++){
			if(!inputNodes[i].disabled){
				tempValue = inputValues.shift();
				inputNodes[i].value = tempValue;	
				if(tempValue && o.dec){
					var parentNode = $(inputNodes[i]).ancestor('.td-i');
					if(parentNode){
						parentNode.one('.zs-span').setContent(tempValue || '');	
					}
				}
			}
		}
	}
	//投保信息选择checkbox时的逻辑
	function insInfoSelected(o){
		var curNode = o.curNode,
			isChecked = o.isChecked,
			parentWrap = o.parentWrap,
			headWeightNode = o.headWeightNode,
			curTrNode = o.curTrNode,
			tempNode;
		headWeightNode.set('checked',true);
		//注释排序可写
		if((tempNode = curTrNode.one('.mod-a'))){
			tempNode.setStyle('visibility','visible');
		}
		if((tempNode = curTrNode.one('.J_zs_input input'))){
			tempNode.set('disabled',false);
		}
		if((tempNode = curTrNode.one('.td-n input'))){
			tempNode.set('disabled',false);
		}
		if(curNode.get('className') == "J_date_radio"){
			if((tempNode = curTrNode.all('.td-c .text'))){
				tempNode.set('disabled',false);
			}
			Y.all('.J_date_radio').each(function(node){
				var radioTrNode = node.get('parentNode').get('parentNode');
				if(node != curNode){
					radioTrNode.one('.mod-a').setStyle('visibility','hidden');
					radioTrNode.one('.J_zs_input input').set('disabled',true);
					if((tempNode = radioTrNode.all('.td-c .text'))){
						tempNode.set('disabled',true);
					}
				}	
			});
		}
	}
	//受益人只选择法定
	function selectBenefit(n){
		var benefitNodes = $$('.J_benefit');
		if(n != -1){
			benefitNodes.item(n).ancestor('table').one('thead input').set('checked',true);
			benefitNodes.item(n).set('checked',true);	
			benefitNodes.set('disabled',true);	
		}else{
			benefitNodes.set('disabled',false);	
		}
	}
	
	function setEditDisabled(item, force) {
		var editIpt = item.next('.J_edit_val');
		if (editIpt) {
			editIpt.set('disabled', force);
		}
	}
	
	function defaultInsInfo(){
		var o;
			
		Y.all('.tb-info-table tbody .td-c input').each(function(node){
			if(node.get('checked')){
				o = getVariable(node);
				insInfoSelected(o);
				setEditDisabled(node, false);
			} else {
				setEditDisabled(node, true);
			}
		});	
	}
	//投保信息取消checkbox时的逻辑
	function insInfoNoSelected(o){
		var curNode = o.curNode,
			isChecked = o.isChecked,
			parentWrap = o.parentWrap,
			headWeightNode = o.headWeightNode,
			curTrNode = o.curTrNode,
			tempNode;
		if((tempNode = curTrNode.one('.mod-a'))){
			tempNode.setStyle('visibility','hidden');
		}
		if((tempNode = curTrNode.one('.J_zs_input input'))){
			tempNode.set('disabled',true);
		}
		if((tempNode = curTrNode.one('.td-n input'))){
			tempNode.set('disabled',true);
		}
		parentWrap.all('tbody input').each(function(node){
			if(node.get('checked')){
				isChecked = true;
			} 	
		});	
		if(!isChecked){
			headWeightNode.set('checked',false);	
		}
		hide_zsinput(curTrNode);
	}
	//获得投保信息所用变量值
	function getVariable(node){
		var tempPW =node.ancestor('table'); 
		return {
			curNode : node,
			isChecked : false,
			parentWrap : tempPW,
			headWeightNode : tempPW.one('thead .td-c input'),
			curTrNode : node.get('parentNode').get('parentNode')
		}	
	}
	//隐藏掉注释输入框和按钮
	function hide_zsinput(TR){
		TR.one('.mod-a').setStyle('display','inline-block');
		TR.one('.J_zs_input').setStyle('display','none');
		TR.one('.zs-span').setStyle('display','inline-block');
		TR.one('.J_zs_input input').set('value',TR.one('.zs-span').getContent());
	}
	function show_zsinput(TR){
		var span_zs = TR.one('.zs-span');
		span_zs.setStyle('display','none');
		TR.one('.mod-a').setStyle('display','none');
		TR.one('.J_zs_input').setStyle('display','block');
		TR.one('.J_zs_input input').set('value',span_zs.getContent());
	}
	//取字节长度
	function validLengthFn(node){
		var valueLength = node.get('value').replace(/[^\x00-\xff]/g, "**").length;
		if(valueLength > 60){
			return false;	
		}else{
			return true;
		}
	}
	//这个是监控宝贝标题的字数
	function check_txt(e){
		var num = parseInt((60 - e.target.get('value').replace(/[^\x00-\xff]/g, "**").length)/2),txtNode = Y.one('#J_limit_show');
		if(num<0){
			txtNode.replaceClass('green-font','red-font');
			txtNode.setContent(0+'字');
			return;
		} else{
			txtNode.replaceClass('red-font','green-font');
			txtNode.setContent(num+'字');
		}
	}
	//取字宝贝描述节长度
	function validDesLengthFn(node){
		//var valueLength = node.get('value').replace(/[^\x00-\xff]/g, "**").length;
		var valueLength = node.get('value').length;
		if(valueLength < 5){
			node.setAttribute('custominfo','字数最少5个');
			return false;	
		}else if(valueLength > 200000){
			node.setAttribute('custominfo','字数最多200000个字');
			return false;
		}
		return true;
	}
	function validTitleLengthFn(node){
		var valueLength = node.get('value').replace(/[^\x00-\xff]/g, "**").length;
		//var valueLength = node.get('value').length;
		if(valueLength > 60){
			node.setAttribute('custominfo','字数最多30个汉字');
			return false;	
		}
		return true;
	}
	Y.on('contentready',function(e){
		var itemDescNode = Y.one('#kissy_textarea_d'),
			itemNoticeNode = Y.all('#kissy_textarea_n'),
			//itemCancelNode = Y.one('#kissy_textarea_c'),
			/**
			 * HTML5表单验证 
			 * @class F 
			 */
		F = new Y.HTML5Form({
			srcNode: '#pubItem',
			submitNode: '.ic-btn',
			multiErrorTip: true	
		}).render();

		INS.Form = F;
		INS.FormPostip = Y.FormPostip;

		//这个是点击注释中的修改小笔的代理事件
		Y.delegate('click',function(e){
			show_zsinput(e.target.ancestor('tr'));
		},'.base-ul','.t-div .mod-a');
		
		
		//这个是注释修改中确定按钮的事件
		Y.delegate('click',function(e){
			var TR = $(e.target.ancestor('tr'));
			var value = TR.one('.J_zs_input input').get('value');
			hide_zsinput(TR);
			TR.one('.zs-span').setContent(value);
			TR.one('.J_zs_input input').set('value',value);
			},'.base-ul','.t-div .J_ok_btn')
			
		//这个是注释修改中取消按钮的事件
		Y.delegate('click',function(e){
			hide_zsinput(e.target.ancestor('tr'));
		},'.base-ul','.t-div .J_cancel_btn');	
			
		//这个是点击数据字典的操作
		Y.delegate('click',function(e){
		   var TR = e.target.ancestor('tbody').all('.J_hide_tr');
		   var target = e.target; 
		   if(e.target.hasClass('J_down')){
				TR.removeClass('hide'); 
				target.setContent('数据字典▲');
				target.removeClass('J_down');
			   } else {
				   target.setContent('数据字典▼');
				   TR.addClass('hide');  
				   target.addClass('J_down');
				   }
	 
			},'.base-ul','.t-div .J_dic');	
		
		Y.each(['blur','keyup'],function(item){
			Y.on(item,function(e){
				check_txt(e);
			},'#J_title_input');
		});
		
		//检查投保份数类型
		//Modified By Huya
		//2012-03-13
		var buyNumType = Y.one('.buy-num-type'),
			buyNumWrapper = Y.one('.buy-num-wrapper'),
			buyNumMax = Y.one('.buy-num-max');
		function checkBuyNumType(e) {
			if (buyNumType.get('value') == '1') {
				buyNumWrapper.addClass('hide');
				buyNumMax.removeAttribute('required');
				F.removeError(buyNumMax, true);
				F.removeFieldElem(buyNumMax);
			} else {
				buyNumWrapper.removeClass('hide');
				buyNumMax.setAttribute('required', '');
				buyNumMax.removeAttribute('isAdded');
				F.addFieldElem(buyNumMax);
			}
		}
		if (buyNumType) {
			buyNumType.on('change', checkBuyNumType);
			checkBuyNumType();
		}
		
		/**
		 * 列表页信息
		 * Modified By Huya
		 * 2012-04-13
		 */
		var listInfoOverlay = new Y.Overlay({
				srcNode: Y.one('.list-info-viewbox'),
				bodyContent: '',
				align: {
					node: Y.one('.list-info-view'),
					points: ['tl', 'bl']
				},
				zIndex: 999,
				render: true,
				visible: false
			}),
			listInfoTitle = Y.one('#J_title_input'),
			listInfoTable = Y.one('.list-info-tb'),
			listInfoPeriod = Y.one('.list-info-period input'),
			listInfoTimer = null,
			listInfoHover = false,
			listInfoTplStart = [
				'<h3>{title}</h3>',
				'<p>保险期间：{period}</p>',
				'<div class="info-tb-wrapper">',
					'<table>'
			].join(''),
			listInfoBody = [
						'<tr>',
							'<td>{type}</td>',
							'<td class="info-coverage">{coverage}</td>',
						'</tr>'
			].join(''),
			listInfoTplEnd = [
					'</table>',
				'</div>',
				'<em>累计售出：9999件</em>',
				'<a href="javascript:void(0)">详细信息&gt;&gt;</a>'
			].join('');
		
		function delHtmlTag(str) {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
		
		function getListInfo() {
			var ipts,
				tpl = '';
				
			listInfoTable.all('tr').each(function(node, index) {
				if (index) {
					ipts = node.all('td input');
					tpl += (Y.Lang.sub(listInfoBody, {
						type: delHtmlTag(Y.Lang.trim(ipts.item(0).get('value'))),
						coverage: delHtmlTag(Y.Lang.trim(ipts.item(1).get('value')))
					}));
				}
			});
			
			return Y.Lang.sub(listInfoTplStart, {
				title: delHtmlTag(Y.Lang.trim(listInfoTitle.get('value'))) || '请填写险种标题',
				period: delHtmlTag(Y.Lang.trim(listInfoPeriod.get('value')))
			}) + tpl + listInfoTplEnd;
		}
		function clearListInfoTimer() {
			if (listInfoTimer) {
				clearTimeout(listInfoTimer);
				listInfoTimer = null;
			}
		}
		function showListInfoOverlay() {
			clearListInfoTimer();
			listInfoHover = true;
			listInfoOverlay.set('bodyContent', getListInfo());
			listInfoOverlay.show();
		}
		function hideListInfoOverlay() {
			clearListInfoTimer();
			listInfoHover = false;
			listInfoTimer = setTimeout(function() {
				if (!listInfoHover) {
					listInfoOverlay.hide();
				}
			}, 300);
		}
		Y.on('hover', showListInfoOverlay, hideListInfoOverlay, '.list-info-view');
		Y.on('hover', showListInfoOverlay, hideListInfoOverlay, '.list-info-viewbox');
		Y.all('.list-info-tb input').on('valueChange', function(e) {
			var max = e.target.ancestor('.list-info-type') ? 20 : 10;
			if (e.newVal.length > max) {
				e.target.set('value', e.newVal.substring(0, max));
			}
		});
		
		/**
		 * 投保模块
		 * 默认判断复选框是否选中
		 */
		defaultInsInfo();
		/**
		 * 投保模块
		 * 点击子复选框
		 */
		var insCheckboxNodes = Y.all('.tb-info-table tbody .td-c input');
		insCheckboxNodes.on('click',function(e){
			var o = getVariable(e.target);
			if(o.curNode.get('type') != 'checkbox' && o.curNode.get('type') != 'radio') return;
			if(o.curNode.get('checked')){
				insInfoSelected(o);
				setEditDisabled(e.target, false);
			}else{
				insInfoNoSelected(o);
				setEditDisabled(e.target, true);
			}
		});
		/**
		 * 投保模块
		 * 点击头部属性模块
		 */
		Y.all('#J_sub_mod input').on('click',function(e){
			var oneNode = Y.one('#J_sub_mod input'),
				curNode = e.target,
				tempI,tempN;
			if(oneNode != curNode){
				oneNode.set('checked',true);		
			}
			if(curNode.get('id') == "J_isone" && curNode.get('checked')){
				$('#J_insmore').set('checked',true);	
				//受益人只能选择法定
				selectBenefit(0);
			}
			if(!oneNode.get('checked')){
				//取消受益人模块
				selectBenefit(-1);	
			}
			if((tempI = (curNode.get('id') == 'J_insmore')) && (tempN = curNode.get('checked'))){
				selectBenefit(0);	
			}
			if(tempI && !tempN){
				//取消受益人模块
				selectBenefit(-1);	
			}
		});
		//初始化检查是否选择多投保人
		//Modified by huya
		//2012-04-05
		if ($('#J_insmore') && $('#J_insmore').get('checked') && $('#J_insmore').previous('input') && $('#J_insmore').previous('input').get('checked')) {
			selectBenefit(0);
		}
		/**
		 * 投保模块
		 * 取消头部复选框将所有内容置为不可用
		 */
		Y.all('.tb-info-table thead').each(function(node){
			node.one('input').on('click',function(e){
				var curNode = e.target,
					parentWrap = curNode.ancestor('table'),
					bodyNodes = parentWrap.all('tbody .td-c input');
				if(!curNode.get('checked')){
					bodyNodes.set('checked',false);
					bodyNodes.each(function(childNode) {
						setEditDisabled(childNode, !childNode.get('checked'));
					});
					parentWrap.all('.mod-a').setStyle('visibility','hidden');
					parentWrap.all('.J_zs_input input').set('disabled',true);
					parentWrap.all('.td-n input').set('disabled',true);
					if(curNode.get('parentNode').get('tagName') == 'P'){
						curNode.get('parentNode').all('input').set('checked',false);	
					}
					parentWrap.all('tr').each(function(node){
						var tempNode; 
						if((tempNode = node.one('.J_zs_input')) && tempNode.getStyle('display') == 'block'){
							hide_zsinput(node);
						}
					});
				}
			});
		});
		var benefitHeadNode = Y.one('.J_benefit');
		if (benefitHeadNode) {
			benefitHeadNode.ancestor('table').one('thead input').on('click',function(e){
				if($('#J_insmore').get('checked') && e.target.get('checked')){
					benefitHeadNode.set('checked',true);	
				}	
			});
		}
		/**
		 * SKU、图片上传文件功能配置及调用
		 */
		KISSY.config({
			packages: [
				{
					name: "js",
					path: "http://a.tbcdn.cn/app/dp/insure/autopub/",
					charset: "gbk"
				}
			]
		});
		KISSY.config({
			map:[
				[/http:\/\/a.tbcdn.cn\/app\/dp\/insure\/autopub\/js\/publish.js$/, "http://a.tbcdn.cn/app/dp/insure/autopub/js/publish-min.js"]
			]
		});
		KISSY.use('js/publish',function(k){
           	F.addFieldElem(Y.all('#J_CustomSKUList .sku-custom input'));
           	//F.addFieldElem(Y.all('.J_MapPrice'));
			//console.log(Y.all('.J_MapPrice'));
		});
		/**
		 * KISSY编译器
		 */
		var editor_plus  ={
		 // 是否监控编辑器所属的表单提交
		 "attachForm" : false,
		 // 编辑器内弹窗z-index下限, 防止互相覆盖, 请保证这个数字整个页面最高
		 "baseZIndex" : 10000,
		 // 自定义样式, 将自己的样式加入编辑器
		 customStyle : "p{color:black;word-wrap:break-word;}",
		 // 是否编辑器初始自动聚焦(光标位于编辑器内)
		 focus : false,
		 pluginConfig : {
			"resize" : {
			   direction : ["y"]
			},
			"draft" : {
			   // 当前编辑器的历史是否要单独保存到一个键值而不是所有编辑器公用
			   saveKey : "taoba",
			   // 分钟设置：每隔几分钟保存一次
			   interval : 5,
			   // 最多保存几条历史记录?
			   limit : 1,
			   // 草稿箱帮助文案, 可不设置
			   helpHtml : "<div " + "style='width:200px;'>" + "<div style='padding:5px;'>草稿箱能够自动保存您最新编辑的正文内容，" + "如果发现内容丢失，" + "请选择恢复编辑历史</div></div>"
			}}} 
		//调用KISYY编译器	
		KISSY.use("editor",function(S,Editor){
			window.kissy_textarea_1 = S.Editor("#kissy_textarea_n",editor_plus).use("font,image,smiley,separator,color,removeformat,resize,list,indent,justify,link,maximize,undo,draft");
			window.kissy_textarea_2 = S.Editor("#kissy_textarea_d",editor_plus).use("font,smiley,separator,color,removeformat,resize,list,indent,justify,link,maximize,undo,draft");
			window.kissy_textarea_3 = S.Editor("#kissy_textarea_c",editor_plus).use("font,image,smiley,separator,color,removeformat,resize,list,indent,justify,link,maximize,undo,draft");
			KISSY.EditorPlugins.Wordcount.bind(25000, kissy_textarea_1);
			KISSY.EditorPlugins.Wordcount.bind(25000, kissy_textarea_2);
			KISSY.EditorPlugins.Wordcount.bind(25000, kissy_textarea_3);
			
			function renderImageSpace() {
				var imgSpaceCreated = false;
				
				//创建图片空间Iframe
				function createSpaceIframe(proxy, width, hook, height, ismultiple){
					height = height || 448;
					var src = location.href.indexOf('daily.taobao.net') > -1 ? 'http://tadget.daily.taobao.net/picture/editor/quick_insert.htm' : 'http://tadget.taobao.com/picture/editor/quick_insert.htm';
					//var src = 'http://tadget.daily.taobao.net/picture/editor/quick_insert.htm';
					var html = '<iframe frameborder="0" width="' + width + '" height="' + height + '" src="' + src + '?proxy=' + encodeURIComponent(proxy) + '&width=' + width + (ismultiple ? '&multiple=true' : '') + '&network=true"' +'></iframe>';
					document.getElementById(hook).innerHTML = html;
					imgSpaceCreated = true;
				}
				
				//插入图片至编辑器
				function insertSpaceImg(url, editor) {
					url = url.split('||');
					var l = url.length, arr;
					while(l--){
						arr = url[l].split('|');
						var data = {
						   src: arr[0],
						   width: arr[1],
						   height: arr[2]
						};
						insert(data, editor);
					}
					function insert(data, editor){
						function doInsert(){
							try{
								editor.insertHtml('<img src="' + data.src + '"' + (data.width ? ' width="' + data.width + '"' : '') + (data.height ? ' width="' + data.height + '"' : '') + ' />');
								editor.focus();
							}catch(e){}
						}
						try{
							doInsert();
						}catch(e){
							//KISSY Editor 在firefox下，如果不聚焦一次直接插入会失败，已经跟承玉说了，他以后会改，但现在保险起见
							setTimeout(doInsert, 200);
						}
					}
				}
				
				//隐藏图片空间Iframe
				function hideSpaceIframe(){
					document.getElementById('J_ins_img_space').style.display = 'none';
				}
				
				//显示图片空间Iframe
				function showSpaceIframe(){
					document.getElementById('J_ins_img_space').style.display = 'block';
				}
				
				//滚动到图片空间处
				function spaceScrollIntoView() {
					Y.one('#J_ins_img_space').scrollIntoView();
				}
				
				//全局插入图片函数，被代理页面调用
				window['insertToEditor'] = function(url) {
					//如果是close，隐藏iframe
					if (url === 'close') {
						hideSpaceIframe();
						return;
					}
					insertSpaceImg(url, window.kissy_textarea_2);
				}
				
				//添加插入图片按钮
				window.kissy_textarea_2.ready(function() {
					this.addButton('space-image', {
						title: '插入图片',
						mode: S.Editor.WYSIWYG_MODE,
						contentCls: 'ke-toolbar-mul-image',
						offClick: function() {
							try {
								window.kissy_textarea_2.execCommand('restoreWindow');
							} catch(err) {}
							if (!imgSpaceCreated) {
								var proxyUrl = location.href.indexOf('daily.taobao.net') > -1 ? 'http://baoxian.daily.taobao.net/sell/iframe/img_upload_proxy.html' : 'http://baoxian.taobao.com/sell/iframe/img_upload_proxy.html';
								createSpaceIframe(proxyUrl + '?' + new Date(), 645, 'J_ins_img_space', 450);
							} else {
								showSpaceIframe();
							}
							spaceScrollIntoView();
						}
					});
				});
			}
			
			renderImageSpace();
		});
		
		
		/**
  	     * 表单验证实现逻辑
 	     */
		//宝贝标题字数验证
		F.setElemAttr(Y.one('#J_title_input'),'validFn',validLengthFn);
		//设置折扣率验证错误提示
		//F.setElemAttr($('#J_rate'),'typeinfo','请正确输入折扣率');
		$('#J_rate') && $('#J_rate').setAttribute('typeinfo','请正确输入折扣率');
		//动态宝贝属性必填项
		Y.all('.J_checkbox_required').each(function(node){
			F.setElemAttrs(node.all('input'),{
				tipAlignNode:node,
				errorTipPos:{v:'25',h:'-25'},
				errorTextTemplate: '<b class="top"></b><p class="top error">{ERROR_TEXT}</p>'
			});
				
		});
        
        //宝贝图片上传
        //Modified By huya
        //2012-03-13
        var imgUploadErrorTip = new Y.FormPostip({pos:{v:30,h:'oleft'},classname:'yui3-html5form-errortip'}),
            imgUploadErrorAlignNode = Y.one('#itemPic'),
            imgUploadNodes = Y.all('#J_PanelLocalList input[type="file"]'),
            imgUploadNodeSize = imgUploadNodes.size();
        
        function validateImgUpload() {
            var imgUploadValid = false,
                l = imgUploadNodeSize,
                i = 0,
                el,
                u;
                
            for (; i < l; i++) {
                el = imgUploadNodes.item(i);
                u = el.ancestor('.pm-itemcont').one('.J_PicUrl');
                if (Y.Lang.trim(el.get('value')) !== '' || Y.Lang.trim(u.get('value')) !== '') {
                    imgUploadValid = true;
                    break;
                }
            }
            
            if (imgUploadValid) {
                imgUploadErrorTip.hide();
            } else {
                imgUploadErrorTip.rendTipUI(imgUploadErrorAlignNode, '<b class="top"></b><p class="error">至少上传一张图片</p>');
            }
            
            return imgUploadValid;
        }
        
		//宝贝描述
		F.setElemAttrs(itemDescNode,{
			errorTipPos:{v:'25',h:'-50'},
			errorTextTemplate: '<b class="top"></b><p class="top error">{ERROR_TEXT}</p>',
			tipAlignNode:Y.one('.dec-title')
		});
		//重要告知描述
		F.setElemAttrs(itemNoticeNode,{
			errorTipPos:{v:'25',h:'-50'},
			errorTextTemplate: '<b class="top"></b><p class="top error">{ERROR_TEXT}</p>',
			tipAlignNode:Y.one('.notice-title')
		});
		/*F.setElemAttrs(itemCancelNode,{
			errorTipPos:{v:'25',h:'-50'},
			errorTextTemplate: '<b class="top"></b><p class="top error">{ERROR_TEXT}</p>',
			tipAlignNode:Y.one('.cancel-title')
		});*/
		//宝贝描述验证字数
		F.setElemAttr(itemDescNode,'validFn',validDesLengthFn);
		//重要告知验证字数
		F.setElemAttr(itemNoticeNode,'validFn',validDesLengthFn);
		//F.setElemAttr(itemCancelNode,'validFn',validDesLengthFn);
		//标题验证字数
		F.setElemAttr($('#J_title_input'),'validFn',validTitleLengthFn);
		F.on('beforeFormValidate', function(e) {
			if(window.kissy_textarea_1){window.kissy_textarea_1.sync();}
			if(window.kissy_textarea_2){window.kissy_textarea_2.sync();}
			if(window.kissy_textarea_3){window.kissy_textarea_3.sync();}
           	F.addFieldElem(Y.all('.J_MapPrice'));
           	F.addFieldElem(Y.all('.J_MapProductid'));
		});
		F.on('afterFormValidate', function(e,isFormValid) {
            var imgUploadValid = validateImgUpload();
            isFormValid = isFormValid && imgUploadValid;
			if(!isFormValid){
				alert('请修复错误提示');
			}
			return isFormValid;
		});
		
		/* ----------------------------------------------------------------------------------------
		 *                               车险接口化城市列表填写
		 * ----------------------------------------------------------------------------------------
		 */
		(function() {
			
			var textarea = Y.one('#J_citylist_textarea');
			if (!textarea) { return; }
			
			var con = textarea.ancestor('.citylist-con'),
				errCon = con.one('.citylist-err'),
				regx = /^[\u4e00-\u9fa5]+，\d{6}，[A-Za-z]+，[A-Za-z]+，[01]；$/i,
				errs = [],
				citys, codes, data;
			
			function validateCityList() {
				var value = textarea.get('value'),
					pattern = Y.UA.ie && Y.UA.ie < 9 ? /\r/ : /\r?\n/,
					list = value.split(pattern),
					i = 0,
					l = list.length,
					end = 0,
					item;
					
				errCon.empty();
				citys = {};
				codes = {};
				data = [];
				for (; i < l; i++) {
					item = list[i];
					text = item.replace(/\n/g, '');
					end += (text.length + (i == 0 ? 0 : 1));
					data.push({
						city: Y.Lang.trim(text),
						end: end,
						line: i + 1
					});
					validateCity(data[i]);	
				}
				return showErr();
			}
			
			function setCursorPos(node, pos) {
				if (node.setSelectionRange) {
					node.focus();
					node.setSelectionRange(pos, pos);
				} else if (node.createTextRange) {
					node.blur();
					var range = node.createTextRange();
					range.collapse(true);
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
					range.select();
				}
			}
			
			function showErr() {
				var err, len = errs.length;
				while (errs.length) {
					err = errs.shift();
					if (err.type == 'format') {
						errCon.appendChild('<li><a href="#" data-line="{line}">第{line}行</a> 输入格式不正确或缺少信息，请参考样例</li>'.replace(/{line}/g, err.data.line));
					} else if (err.type == 'repeat') {
						errCon.appendChild('<li><a href="#" data-line="{line}">第{line}行</a> 城市名称或城市代码与 <a href="#" data-line="{line2}">第{line2}行</a> 重复，请修改</li>'.replace(/{line}/g, err.data.line).replace(/{line2}/g, err.line));
					}
				}
				if (len) {
					errCon.setStyle('display', 'block');
				}
				
				return !len && Y.Object.size(citys);
			}
			
			function validateCity(data) {
				var city = data.city,
					l, d;

				if (city) {
					if (!regx.test(city)) {
						errs.push({
							data: data,
							type: 'format'
						});
					} else {
						d = city.split('，');
						l = citys[d[0]] || codes[d[1]];
						if (l) {
							errs.push({
								data: data,
								type: 'repeat',
								line: l
							});
						} else {
							citys[d[0]] = data.line;
							codes[d[1]] = data.line;
						}
					}
				}
			}
			
			/*textarea.on('blur', function() {
				validateCityList();
			});*/
			textarea.on('focus', function() {
				errCon.empty();
				errCon.setStyle('display', 'none');
			});
			
			Y.one('.citylist-err').delegate('click', function(e) {
				var num = parseInt(e.currentTarget.getAttribute('data-line'), 10) - 1;
				e.halt();
				textarea.scrollIntoView();
				setCursorPos(textarea.getDOMNode(), data[num].end);
			}, 'a');
			
			validateCityList();
			
			textarea.setAttribute('custominfo', '行驶城市有误');
			F.setElemAttrs(textarea, {
				errorTipPos: {v:'25',h:'-50'},
				tipAlignNode: textarea.ancestor('li').one('.li-label'),
				errorTextTemplate: '<b class="top"></b><p class="top error">{ERROR_TEXT}</p>',
				validFn: validateCityList
			});
			
		})();
		
		/* ----------------------------------------------------------------------------------------
		 *                               保险卖家自定义显示公用字段
		 * ----------------------------------------------------------------------------------------
		 * Modified by Huya
		 * @date 2012-07-09
		 */
		(function() {
			var elemDIYPanel = new Y.Panel({
				headerContent: '<h3>请选择显示项目</h3>',
				bodyContent: '',
				footerContent: '<p class="elem-edit-btns"><a class="elem-edit-confirm" href="javascript:void(0)" hideFocus="true" title="确定">确定</a><a class="elem-edit-cancel" href="javascript:void(0)" hideFocus="true" title="取消">取消</a></p>',
				width: '500px',
				zIndex: 20000,
				centered: true,
				modal: (Y.UA.ie != 6),
				visible: false,
				shim: true,
				render: Y.one('body')
			});
			
			if (Y.UA.ie == 6) {
				var elemDIYPanelMask = Y.Node.create('<div class="edit-panel-mask"></div>');
				var elemDIYPanelIframe = Y.Node.create('<iframe width="100%" height="100%" frameborder="0" role="presentation" tabindex="-1" src="javascript:false" title="Widget Stacking Shim" class="edit-panel-iframe"></iframe>');
				elemDIYPanelIframe.setStyle('opacity', '0');
				Y.one('body').prepend(elemDIYPanelMask);
				Y.one('body').prepend(elemDIYPanelIframe);
				elemDIYPanel.after('visibleChange', function(e) {
					if (e.newVal) {
						elemDIYPanelMask.setStyles({
							height: elemDIYPanelMask.get('docHeight') + 'px',
							display: 'block'
						});
						elemDIYPanelIframe.setStyles({
							height: elemDIYPanelIframe.get('docHeight') + 'px',
							display: 'block'
						});
					} else {
						elemDIYPanelMask.setStyle('display', 'none');
						elemDIYPanelIframe.setStyle('display', 'none');
					}
				});
			}
			
			elemDIYPanel.get('contentBox').one('.elem-edit-confirm').on('click', function(e) {
				e.halt();
				saveDIYElem();
				elemDIYPanel.hide();
			});
			elemDIYPanel.get('contentBox').one('.elem-edit-cancel').on('click', function(e) {
				e.halt();
				elemDIYPanel.hide();
			});
			
			function saveDIYElem() {
				var val = [];
				elemDIYPanel.get('contentBox').all('.elem-edit-list input').each(function(node) {
					if (node.get('checked')) {
						val.push(node.get('value'));
					}
				});
				elemDIYPanel.srcNode.next('.J_edit_val').set('value', val.join(','));
			}
			
			function renderDIYElem(srcNode) {
				var list = srcNode.getAttribute('data-list').split(';'),
					val = srcNode.next('.J_edit_val').get('value').split(','),
					valMap = {},
					html = '<ul class="ins-g elem-edit-list">',
					arr;
				
				Y.Array.each(val, function(v) {
					valMap[v] = 1;
				});
				
				Y.Array.each(list, function(item) {
					if (item) {
						arr = item.split(':');
						html += ('<li class="ins-u"><label class="clearfix"><span class="elem-edit-ipt"><input type="checkbox" name="elem-edit-ipt" value="' + arr[1] + '"' + (valMap[arr[1]] ? ' checked="checked"' : '') + ' /></span><span class="elem-edit-lb">' + arr[0] + '</span></label></li>');
					}
				});
				
				html += '</ul>';
				
				elemDIYPanel.set('bodyContent', html);
				elemDIYPanel.show();
			}
			
			Y.all('.J_edit_btn').on('click', function(e) {
				e.halt();
				elemDIYPanel.srcNode = e.target;
				renderDIYElem(e.target);
			});
		})();
		
		
	},'#pubItem')
})
