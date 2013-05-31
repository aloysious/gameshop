/**
 * @fileoverview ���չ�������ҳ
 * @author lingyu
 * @version 1.0
 */
YUI.namespace('Y.Detail');
YUI.add('item-detail', function(Y) {



	//������Ϣ���ƶ���ȥ�¼�
	Y.on('contentready',function(){


		var getDomain = function() {
			var arr = location.hostname.split('.'), len = arr.length;
			return arr.slice(len - 2).join('.');
		};
		try {
			document.domain = getDomain();
		} catch (e) {}
		

		
		Y.Detail = {};
		var skuMap = {};
	//	var quantity = Y.one("#J_Quantity");
		//���
		//var price = Y.one("#J_Price");
		//�۸�
	//	var pkg = Y.one("#J_CartPackage");
		var mainpic = Y.one("#J_mainpic");
		//��ͼƬ

		var descNode = Y.one('#J_ins_desc .tab-bar');
		var descTabLis = Y.all('#J_ins_desc .tab-bar li');
		var descConDivs = Y.all('#J_ins_desc .tab-pannel section');
		var saleNumber = 0;
		//��������

		//var skuid = Y.one("#J_FSkuId");
		//form�� skuid

		Y.Detail.initSku = function(_sku) {
			skuMap = (_sku.skuMap) ? _sku.skuMap : {};
		};
		var last_sel_li = 0, isShow_bargain = 0, comment = false, saleNumNode = Y.one('.sale-out em');
		//�������첽����
		/*Y.io(saleNumNode.getAttribute('data-url'), {
			data : 't=' + (+new Date),
			on : {
				complete : function(id, o) {
					try {
						eval('var res = ' + o.responseText + ';');
					} catch(e) {
						var res = null;
					}
					if(res) {
						saleNumNode.set('innerHTML', res.soldNum);
						Y.all('.tab-bar li').item(3).one('.cblue').set('innerHTML', res.soldNum);
						//�ɽ�����
						saleNumber = res.soldNum;
					}
				}
			}
		});*/
		
		// --------------------------- ����ѡ����� {{-------------------------------
		var Autoins = false;
		if (Y.one('#city_code') && window.useCitySuggestion) {
			Autoins = {
				render: function() {
					this.getNodes();
					this.renderForm();
					this.renderCsg();
					this.bindCsg();
					this.bind();
				},
				getNodes: function() {
					this.cityNameIpt = Y.one('#city_name');
					this.cityCodeIpt = Y.one('#city_code');
					this.provinceCodeIpt = Y.one('#province_code');
					this.comNameIpt = Y.one('#com_name');
					this.comIdIpt = Y.one('#com_id');
					this.submit = Y.one('#J_submit');
					this.error = Y.one('#J_csgerr');
					this.errorContent = this.error.one('p');
					this.form = this.cityNameIpt.ancestor('form');
				},
				bind: function() {
					this.form.on('submit', this.onFormSubmit, this);
				},
				bindCsg: function() {
					var self = this;
					Y.Do.after(function() {
						self.checkSupport();
					}, this.CS, 'updateCode');
					this.CS.render();
				},
				renderCsg: function() {
					this.CS = new Y.CitySuggestion({
						width: '360px',
						inputNode: '#city_name',
						cityCodeInputNode: '#city_code',
						provinceCodeInputNode: '#province_code',
						classNames: ['auto-citysuggestion'],
						defParentNode: 'useOwnContainer',
						plugins: [{fn:Y.Plugin.AutoCompletePaginator, cfg: {pageSize: 4}}]
					});
				},
				renderForm: function() {
					var comId = this.comIdIpt.get('value'),
						arr = {
							'1003': '����',
							'1005': 'ƽ��',
							'1009': '��ƽ',
							'1011': '̫ƽ��',
							'1012': '���',
							'1014': '�˱�',
							'1017': '��ƽ'
						},
						action = '/auto/insure.html';
						
					/*switch (comId) {
						case '1012':
							action = '/car/simple_quote.html';
							break;
						default:
							action = '/auto/insure.html';
					}*/
					
					this.comNameIpt.set('value', arr[comId]);
					this.form.setAttribute('action', action);
				},
				checkSupport: function() {
					var cityName = this.cityNameIpt.get('value'),
						cityCode = this.cityCodeIpt.get('value'),
						comName = this.comNameIpt.get('value'),
						comId = this.comIdIpt.get('value'),
						support = this.cityNameIpt.getAttribute('data-support'),
						valid = true,
						m;
					
					if (comId == '1017') {
						comId = '1009';
					}
					
					if (cityCode) {
						if (!support || support.indexOf(comId) < 0) {
							valid = false;
							m = '��Ǹ���Ա����ݲ�֧�ָó����û�����' + comName + '����';
						}
					} else {
						valid = false;
						m = '��ѡ���������ȷ�ĳ�����';
					}
					this.toggleError(valid, m);
					return valid;
				},
				onFormSubmit: function(e) {
					e && e.halt();
					if (this.checkSupport()) {
						this.form.submit();
					}
				},
				toggleError: function(valid, m) {
					this.errorContent.setContent(m || '');
					this.error.toggleClass('hidden', valid)
				}
			};
			
			Autoins.render();
		}
		
		
		// --------------------------- ����ѡ����� }}-------------------------------
		
		
		// --------------------------- SKU {{-------------------------------
		// ����suk ����Ӧ��ͼƬ

		Y.all(".color li").on('click', function(e) {
			e.halt();
			var li = e.currentTarget, ul = li.ancestor('ul');
			ul.all("i").remove();
			ul.all("li").removeClass('sel');

			li.append("<i></i>");
			li.addClass('sel');

		});
		//����ײ�����li �����������
		descNode.delegate('click', function(e) {
			var li = descNode.all('li'), curTar = e.currentTarget;
			liIndex = li.indexOf(curTar);

			var preLi = li.item(last_sel_li);
			//�ϴ�ѡ�е�tab��
			if(preLi) {
				preLi.removeClass('sel');
			}

			curTar.addClass('sel');
			last_sel_li = liIndex;

			descConDivs.addClass('hide');

			
			
			switch (liIndex) {
				case 0:
					//��Ʒ����(��ʼ��ʱ�첽 Ĭ��ѡ��)
					Y.one('.J_goods-detail').removeClass('hide');
					break;

				case 1:
					//�ɽ���¼ �첽

					Y.one('.J_bargain-detail').removeClass('hide');
					if(isShow_bargain == 0) {
						isShow_bargain = 1;
						window['mycallback'] = function(data) {
							if( typeof data.html != 'undefined') {
								Y.one('.J_bargain-detail').set('innerHTML', data.html);
							} else {
								Y.one('.J_bargain-detail').set('innerHTML', '<div class="msg msg-attention-shortcut"> <p class="attention naked">��ʱ��û����ҹ���˱��������30��ɽ�0���� </p> </div>');
							}
						};
						//�ɽ���¼�첽����
						Y.Get.script(bargain_url + "&sold_total_num=" + saleNumber + "&callback=mycallback", {
							charset : 'gbk'
						});
					}
					break;
			}
			descTabLis.item(liIndex).addClass('sel');
		}, 'li');
		//��ʼ��������
		
		

		
		
		//ѡ��ͬ��skuȻ��۸�仯��˵���仯

		var sku_arr = [];

		function find_sku(str, arr) {
		
			var findstr = 0;

			for(var i = 0; i < arr.length; i++) {
				if(str.indexOf(arr[i]+";") == -1) {
					findstr++;
					break;
				}
			}
			if(sku_num == arr.length) {
				return findstr;
			} else {
				return 1;
			}
		}


		//ǿ�Ʊ���2λС���ĺ���
		function changeTwoDecimal_f(x)
			{
			var f_x = parseFloat(x);
			if (isNaN(f_x))
			{
			return false;
			}
			var f_x = Math.round(x*100)/100;
			var s_x = f_x.toString();
			var pos_decimal = s_x.indexOf('.');
			if (pos_decimal < 0)
			{
			pos_decimal = s_x.length;
			s_x += '.';
			}
			while (s_x.length <= pos_decimal + 2)
			{
			s_x += '0';
			}
			return s_x;
			}


		
		//SKUѡ��
		Y.on('click', function(e) {
			sku_arr = [];

			var li = Y.all('.r-block li');

			for(var i = 0; i < li.size(); i++) {

				if(li.item(i).hasClass('sel')) {
					sku_arr.push(li.item(i).getAttribute('data-value'));

				}

			}

			for(var item_sku in valItemInfo.skuMap) {

		
				if(find_sku(item_sku, sku_arr) == 0) {

					if(Y.one('#J_OLD_PRI')!=null && Y.one('#J_CX_PRI')!=null){
						//������ڴ�����֪���𣿴����ҵ�����
						if (Y.one('#J_CX_PRI').getAttribute('data-tianping') == 1) { //���ۣ��۸� = ���� + ���ۣ���ƽһ�ڼۻ����ʱHack���ǳ���
							Y.one('#J_CX_PRI').setContent(valItemInfo.skuMap[item_sku].price);
							Y.one('#J_OLD_PRI').setContent(changeTwoDecimal_f(Number(valItemInfo.skuMap[item_sku].price) + 400));
						} else { //�ۿ��ʣ����� = �۸� * �ۿ���
							Y.one('#J_OLD_PRI').setContent(valItemInfo.skuMap[item_sku].price);
							Y.one('#J_CX_PRI').setContent(changeTwoDecimal_f(Number(valItemInfo.skuMap[item_sku].price)* rebate_num ));
						}
						
					} else {
					
						Y.one('#J_ins_detail .price').setContent(valItemInfo.skuMap[item_sku].price);
					}
					Y.one('#J_ins_detail .bx-det-div').setContent(valItemInfo.skuMap[item_sku].info);
					Y.one('#J_ins_detail .bx-det-div').ancestor().removeClass('hide');
					try {
						Y.one('#J_SKU_I').set('value', valItemInfo.skuMap[item_sku].skuId);
					} catch(err) {}
				}
			}

		}, '.r-block li');
		
		
		//��ݹ�������
		var buyNumIpt,
			buyNumMin,
			buyNumMax,
			buyNumErr,
			buyNumVal,
			buyNumValid = false;
		if ((buyNumIpt = Y.one('.buy-num-ipt'))) {
			buyNumErr = Y.one('.buy-num-err');
			buyNumMin = Number(buyNumIpt.getAttribute('min') || 1);
			buyNumMax = Number(buyNumIpt.getAttribute('max'));
			//�������ֵ
			function checkBuyNum(val) {
				buyNumVal = Y.Lang.trim(val);
				if (buyNumVal === '') {
					buyNumIpt.addClass('buy-num-ipt-error');
					buyNumErr.setContent('����д���������').removeClass('hide');
					buyNumValid = false;
				} else {
					buyNumVal = Number(buyNumVal);
					if (Y.Lang.isNumber(buyNumVal)) {
						if ((buyNumVal + '').indexOf('.') > -1) {
							buyNumIpt.addClass('buy-num-ipt-error');
							buyNumErr.setContent('����д������').removeClass('hide');
							buyNumValid = false;
						} else {
							if (buyNumVal < buyNumMin || buyNumVal > buyNumMax) {
								buyNumIpt.addClass('buy-num-ipt-error');
								buyNumErr.setContent('������д�ķ��������������ƣ�').removeClass('hide');
								buyNumValid = false;
							} else {
								buyNumIpt.removeClass('buy-num-ipt-error');
								buyNumErr.addClass('hide');
								buyNumValid = true;
							}
						}
					} else {
						buyNumIpt.addClass('buy-num-ipt-error');
						buyNumErr.setContent('����д��ȷ���֣�').removeClass('hide');
						buyNumValid = false;
					}
				}
			}
			//�޸�ֵ
			buyNumIpt.on('valueChange', function(e) {
				checkBuyNum(e.newVal);
			});
			//�����Ƴ�
			buyNumIpt.on('blur', function(e) {
				checkBuyNum(buyNumIpt.get('value'));
			});
			//��ʼ��������������ֵ
			if (Y.Lang.trim(buyNumIpt.get('value')) !== '') {
				checkBuyNum(buyNumIpt.get('value'));
			}
		}
		
		
		function ReplaceAll(str, sptr, sptr1) {
			while(str.indexOf(sptr) >= 0) {
				str = str.replace(sptr, sptr1);
			}
			return str;
		}

		//submit���¼�
		//���ڼ�����ʼ�����
		if (Y.one('#J_submit')) {
			Y.on('click', function(e) {

				e.halt();

				var ul = Y.all('.r-block');

				for(var i = 0; i < ul.size(); i++) {

					var li = ul.item(i).all('li');

					var li_sel = 0;
					for(var j = 0; j < li.size(); j++) {

						if(li.item(j).hasClass('sel')) {
							li_sel++;
						}
					}

					if(li_sel == 0) {
						var msg = ul.item(i).ancestor('li').one('span').getContent();
						msg = ReplaceAll(msg, '&nbsp;', '');
						msg = ReplaceAll(msg, '��', '');
						msg = ReplaceAll(msg, ':', '');


						alert("��ѡ��" + msg);
						return;
					}

				}
				if (buyNumIpt && !buyNumValid) {
					msg = buyNumErr.getContent();
					buyNumIpt.focus();
					alert(msg);
					return;
				}
				
				if (Autoins) {
					Autoins.onFormSubmit();
					return;
				}

				e.target.ancestor('form').submit();

			}, '#J_submit');
		}
		// --------------------------- SKU }}-------------------------------
		
		// --------------------------- �ղء���������ͼ {{-------------------------------
		//�ղ�����
		(function() {
			var em = Y.one("#J_ReviewCount");
			var api = em.getAttribute('data-api');
			var key = em.getAttribute('data-key');
			Y.jsonp(api + "&callback={callback}", function(resp) {
				em.setContent(resp[key]);
			});
		})();
		// ����

		//���ʽ�۵�չ��
		Y.on('click', function(e) {
			e.halt();
			var tar = e.target, payDl = Y.one('.pay-ms ul');
			if(tar.hasClass('up')) {
				tar.replaceClass('up', 'down');
				payDl.removeClass('expand');
			} else {
				tar.replaceClass('down', 'up');
				payDl.addClass('expand');
			}
		}, '#J_Toggler');
		// ����ͼ����

		Y.all("#J_thumpic li").on('mouseover', function(e) {
			Y.all("#J_thumpic li").removeClass('sel');
			var li = e.currentTarget;
			li.addClass('sel');
			var srcmain = (li.one('img').get('src')).replace('40x40', '310x310');
			mainpic.set('src', srcmain);
		});



		//����ղ�
		Y.on('click',function(e){
			e.halt();
			if(!e.target.getAttribute('data-url')) return;
			var box = new Y.Box({
				head:'����ղ�<a class="close closebtn" style="cursor: pointer;"><img border="0" src="http://img01.taobaocdn.com/tps/i1/T1DeKaXcBxXXXXXXXX-10-10.png"></a>',
				body:'<iframe id="J_BoxIframe" src="'+e.target.getAttribute('data-url')+'" frameborder="0" width="445px" height="100%" style="position:absolute; left:2px; top:28px;" scrolling="no"></iframe>',
				width:455,
				height:265
			});
			box.render();
			
			var inter;
			Y.on('click',function(e){
				e.halt();
				box.close();
				clearInterval(inter);
			},'.close');
			
			var iframe = document.getElementById('J_BoxIframe');
			if (iframe.attachEvent) {
				iframe.attachEvent("onload", function(){
					setIHeight();
					clearInterval(inter);
					inter = setInterval(setIHeight, 1000);
				});
			}
			else {
				iframe.onload = function(){
					setIHeight();
					clearInterval(inter);
					inter = setInterval(setIHeight, 1000);
				};
			}
			function setIHeight(){
				var hh = 230;
				if (!Y.Cookie.get('_nk_')) {
					var hh = 230;
				}
				else {
					try {
						hh = document.getElementById('J_BoxIframe').contentWindow.document.body.scrollHeight;
					} catch (err) {}
				}
				Y.one('#J_BoxIframe').setAttribute('height',hh+'px');
				Y.one('.yui3-widget').setStyle('height',(hh+35));
				Y.one('.yui3-widget .yui3-overlay-content').setStyle('height',(hh+35));
				Y.one('.yui3-widget .yui3-widget-bd').setStyle('height',hh);
			}
		},'.favourite');
		
		/*Y.on('click',function(e){
			e.halt();
			if(!e.target.getAttribute('data-url')) return;
			var box = new Y.Box({
				head:'����ղ�<a class="close closebtn" style="cursor: pointer;"><img border="0" src="http://img01.taobaocdn.com/tps/i1/T1DeKaXcBxXXXXXXXX-10-10.png"></a>',
				body:'<iframe id="J_BoxIframe" src="'+e.target.getAttribute('data-url')+'" frameborder="0" width="445px" height="100%" style="position:absolute; left:2px; top:28px;" scrolling="no"></iframe>',
				width:455,
				height:265
			});
			box.render();
			
			var inter;
			Y.on('click',function(e){
				e.halt();
				box.close();
				clearInterval(inter);
			},'.close');
			
			var iframe = document.getElementById('J_BoxIframe');
			if (iframe.attachEvent) {
				iframe.attachEvent("onload", function(){
					setIHeight();
					clearInterval(inter);
					inter = setInterval(setIHeight, 1000);
				});
			}
			else {
				iframe.onload = function(){
					setIHeight();
					clearInterval(inter);
					inter = setInterval(setIHeight, 1000);
				};
			}
			function setIHeight(){
				if (!Y.Cookie.get('_nk_')) {
					var hh = 230;
				}
				else {
					var hh = document.getElementById('J_BoxIframe').contentWindow.document.body.scrollHeight;
				}
				Y.one('#J_BoxIframe').setAttribute('height',hh+'px');
				Y.one('.yui3-widget').setStyle('height',(hh+35));
				Y.one('.yui3-widget .yui3-overlay-content').setStyle('height',(hh+35));
				Y.one('.yui3-widget .yui3-widget-bd').setStyle('height',hh);
			}
		},'.J_PopupTrigger');*/
		// --------------------------- �ղء���������ͼ }}-------------------------------		
		
		// --------------------------- �����̼���Ϣ {{-------------------------------
		Y.on('mouseenter', function(e) {
		
			Y.one('#shop-info').addClass('expanded');
	
		}, '#shop-info');
		Y.on('mouseleave', function(e) {
			Y.one('#shop-info').removeClass('expanded');
	
		}, '#shop-info', '#shop-info .main-info');
		// --------------------------- �����̼���Ϣ }}-------------------------------
		

		// --------------------------- �������� {{-------------------------------
		//��Ʒ�����ʼ������
		(function() {
		
			
			if((typeof detail_url)=='string'){
			
			var url = Y.all('#J_ins_desc .tab-bar li').item(0).getAttribute('data-url');
			Y.Get.script(detail_url , {
				onSuccess : function(data) {
					Y.one('.J_goods-detail .attributes-list').insert('<div id="J_ins_desc_bd"><div class="ke-post">'+desc+"</div></div>",'after');
				},
				charset : 'gbk'
			});}
		})();
		// --------------------------- �������� }}-------------------------------
		
		//--------------------------- ��ҳ {{-------------------------------
		//�ɽ���¼��ҳ���¼�����
		Y.one('.J_bargain-detail').delegate('click', function(e) {
			e.halt();
			var linku = e.currentTarget.get('href');
			window['callbackres'] = function(data) {
				if( typeof data.html != 'undefined') {
					Y.one('.J_bargain-detail').set('innerHTML', data.html);
				}
			}
			Y.Get.script(linku + "&callback=callbackres", {
				charset : 'gbk'
			});
		}, '.page-bottom a');
		//--------------------------- ��ҳ }}-------------------------------

		//-------------------------- ����̼���Ϣ��ʼ�� {{--------------------------
		
		/**
		 * ����̼���Ϣ��ʼ��
		 * Damn it, such a mess, dirty code is driving me crazy!!!
		 * @motified ���� huya.nzb@taobao.com
		 * @date 2012-05-30
		 */
		
		function showDefShopBasic() {
			var tmp = Y.one('#J_def_shop_basic'),
				txt = tmp.get('value');
				
			Y.one('#J_ins_shop').setContent(txt);
			insertColSubScript(false);
			lightShopWW();
		}
		//������վͼƬlazyload����������
		//�ֶ����hack
		function initPicLazyload() {
			KISSY.use('datalazyload', function(S) {
				var DOM = S.DOM,
					containers = ['.tshop-pbsm-sas10w', '.tshop-pbsm-sms10w', '.tshop-pbsm-sir10w', '.tshop-pbsm-stl10c', '.tshop-pbsm-spr10c', '.tshop-pbsm-ssl10w', 'div.tshop-pbsm-ssd10c'],
					containerObjs = [],
					i,
					N;
				
				for (i = 0, N = containers.length; i < N; ++i) {
					containerObjs = containerObjs.concat(DOM.query(containers[i]));
				}
				
				S.DataLazyload(containerObjs, {
					mod: 'manual',
					diff: 500
				});
			});
		}
		function insertColSubScript(hasRank) {
			var s = document.createElement('script');
			s.text = hasRank 
					 ? "TShop.use('init', function() {TShop.init();});TShop.use('mod~rank', function( T ){T.mods.Rank.init();});"
					 : "TShop.use('init', function() {TShop.init();});";
					 
			Y.one('#J_ins_shop').insert(s, 'after');
			hasRank && initPicLazyload();
		}
		function lightShopWW() {
			if (window.Light && window.Light.light && typeof window.Light.light == 'function') {
				window.Light.light();
			}
		}
		function getColSubInfo() {
			if (!window.shop_col_sub_url) {
				showDefShopBasic();
			} else {
				Y.io(window.shop_col_sub_url, {
					method: 'GET',
					on: {
						success: function(id, r) {
							if (r && Y.Lang.trim(r.responseText)) {
								Y.one('#J_ins_shop').setContent(r.responseText);
								insertColSubScript(true);
								lightShopWW();
							} else {
								showDefShopBasic();
							}
						},
						failure: function(id, r) {
							showDefShopBasic();
						}
					}
				});
			}
		}
		getColSubInfo();
		
		//-------------------------- ����̼���Ϣ��ʼ�� }}--------------------------

		
	}, '.main-content');
	
	
});

