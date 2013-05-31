/**
 * buy-wiew
 * Ͷ��ҳ��ͼ�߼�
 * @author huya.nzb@taobao.com ����
 * @date 2012-02-10
 * @desc Hate it or Love it! Damn!
 * @version 0.0.1
 */

YUI.add('buy-view', function(Y) {

    /**
     * ----------------------------------------------------------------------------------------
     *                                   Short Cuts �ֲ�����
     * ----------------------------------------------------------------------------------------
     */

    var Lang = Y.Lang,
        trim = Lang.trim,
        eUC = encodeURIComponent,
		
		isDaily = location.href.indexOf('daily.taobao.net') > -1 ? true : false,
        
        //У��ͨ����־
        //���þֲ�������Ԥ���ⲿ�����л����
        formValid = false,
        healthValid = false,
		isActivate = false,
        premiumPrice,
        
        //����HTML��ǩ����
        delHtmlTag = function(str) {
            //���˱�ǩ
            //return str.replace(/<\/?.+?>/g, '');
            //���˼����ż�˫���ţ����̨����һ��
            return str.replace(/[<>"]/g, '');
        };
    
	
	//�Ƿ��Ǽ���ҳ��
	Y.on('available', function(evt) {
		if (Y.one('body').hasClass('ins-activate')) {
			isActivate = true;
		}
	}, 'body');
	
	
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Holder Ͷ������Ϣ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * Ͷ������Ϣ
	 * @class Hdr
	 * @name Hdr
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Hdr = {
        
        /**
		 * �Ƿ��Ѿ���Ⱦģ��
		 * @name rendered
		 * @memberof I.Hdr
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.Hdr
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            
            Y.on('contentready', function(evt) {
                that.render();
            }, '.holder-info');
        },
        
        /**
		 * ��Ⱦģ��
		 * @name init
		 * @memberof I.Hdr
		 * @type function
		 * @public
		 */
        render: function() {
            this.holderInfo = Y.one('.holder-info');
            this.scanWidgetList();
			this.bindCHolder();
            this.rendered = true;
        },
		
		/**
		 * �󶨳���Ͷ�����¼�
		 * @name bindCHolder
		 * @memberof I.Hdr
		 * @type function
		 * @public
		 */
		bindCHolder: function() {
			var widgets = this.widgetList.widgets,
				cholder = widgets && widgets['cholder'],
				node = cholder && cholder.node;
				
			if (node) {
				node.all('.ipt-cbx').set('checked', false);
				node.delegate('click', function(e) {
					if (confirm('ȷ��ɾ���ó���Ͷ������')) {
						e.currentTarget.ancestor('.cbx-con').remove(true);
						Y.io('/json/del_holder.html?_input_charset=UTF-8', {
							method: 'POST',
							data: 'name=' + e.currentTarget.previous('.ipt-cbx').get('value'),
							on: {
								complete: function(id, r) {}
							}
						});
						if (!node.one('.cbx-con')) {
							node.addClass('hidden');
						}
					}
				}, '.del-cholder');
				node.delegate('click', function(e) {
					this.updateHolderData(node, e.currentTarget);
				}, '.ipt-cbx', this);
			}
		},
		
		/**
		 * ���³���Ͷ��������
		 * @name updateHolderData
		 * @memberof I.Hdr
		 * @type function
		 * @param node {Node} ����Ͷ���˽ڵ�
		 * @param cholder {Node} ѡ�еĳ���Ͷ����
		 * @public
		 */
		updateHolderData: function(node, cholder) {
			var widgets = this.widgetList.widgets;
			
			if (!cholder) { return; }
			
			if (cholder.get('checked')) {
				node.all('.ipt-cbx').each(function(item) {
					if (item != cholder) {
						item.set('checked', false);
					}
				});
				
				if (window['RECENT_HOLDER_DATA']) {
					var data = window['RECENT_HOLDER_DATA'][cholder.get('value')];
					if (data) {
						Y.Object.each(widgets, function(w) {
							if (w.name !== 'cholder') {
								I.WidgetLang.reset(w);
								I.WidgetLang.initVal(w, data);
								I.WidgetLang.setVal(w, I.WidgetLang.parseElVal(w));
							}
						});
					}
				}
			} else {
				Y.Object.each(widgets, function(w) {
					if (w.name !== 'cholder') {
						I.WidgetLang.reset(w);
					}
				});
			}
			
			if (I.Linkage.isSelfBind && I.Ist.rendered) {
				I.Linkage.syncModLinkageVal(this.widgetList.widgets, I.Ist.insurantInfo.one('.widget-list').widgets);
			}
		},
        
        /**
		 * ɨ��ؼ��б�
		 * @name scanWidgetList
		 * @memberof I.Hdr
		 * @type function
		 * @public
		 */
        scanWidgetList: function() {
            this.widgetList = this.holderInfo.one('.widget-list');
            I.WidgetList.initList(this.widgetList);
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Insurant ����������Ϣ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ��������Ϣ
	 * @class Ist
	 * @name Ist
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Ist = {
        
        /**
		 * �Ƿ��Ѿ���Ⱦģ��
		 * @name rendered
		 * @memberof I.Ist
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            
            Y.on('contentready', function(evt) {
                that.render();
            }, '.insurant-info');
        },
        
        /**
		 * ��Ⱦģ��
		 * @name render
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        render: function() {
            this.insurantInfo = Y.one('.insurant-info');
            this.scanWidgetList();
            this.bindAdd();
            this.rendered = true;
        },
        
        /**
		 * ����Ӷ౻������
		 * @name bindAdd
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        bindAdd: function() {
            var that = this,
                istAdd = this.insurantInfo.one('.ist-add'),
				multiAdd = this.insurantInfo.one('.ist-add-multi');
            
            if (istAdd) {
            
                var istItemTplNode = this.insurantInfo.one('#ist-item-tpl');
                this.istItemTpl = istItemTplNode.get('innerHTML');
                istItemTplNode.remove();
                
                this.maxWidgetList = Number(istAdd.getAttribute('max'));
                this.istNum = this.insurantInfo.one('#InsuredNum');
                
                this.checkWidgetList();
            
                istAdd.on('click', function(e) {
                    e.halt();
                    that.addWidgetList();
                }, this);
                that.insurantInfo.delegate('click', function(e) {
                    e.halt();
                    if (that.insurantInfo.all('.ist-item').size < 2) { return; }
                    that.deleteWidgetList(e.currentTarget.ancestor('.ist-item'));
                }, '.ist-delete');
				
				/* ������� */
				if (multiAdd) {
					this.multiAdd = multiAdd;
					this.multiAddBox = Y.Node.create(this.insurantInfo.one('#J_multi_tpl').get('innerHTML'));
					this.multiAddTextarea = this.multiAddBox.one('#J_multi_textarea');
					this.multiAddInfo = this.multiAddBox.one('.multi-add-info');
					
					this.multiPanel = new Y.Panel({
						bodyContent: this.multiAddBox,
						width: '536px',
						zIndex: 20000,
						centered: true,
						modal: (Y.UA.ie != 6),
						visible: false,
						shim: true,
						render: Y.one('body')
					});
					
					if (Y.UA.ie == 6) {
						this.multiPanelMask = Y.Node.create('<div class="multi-add-mask"></div>');
						this.multiPanelIframe = Y.Node.create('<iframe width="100%" height="100%" frameborder="0" role="presentation" tabindex="-1" src="javascript:false" title="Widget Stacking Shim" class="multi-add-iframe"></iframe>');
						this.multiPanelIframe.setStyle('opacity', '0');
						Y.one('body').prepend(this.multiPanelMask);
						Y.one('body').prepend(this.multiPanelIframe);
						this.multiPanel.after('visibleChange', function(e) {
							if (e.newVal) {
								that.multiPanelMask.setStyles({
									height: that.multiPanelMask.get('docHeight') + 'px',
									display: 'block'
								});
								that.multiPanelIframe.setStyles({
									height: that.multiPanelIframe.get('docHeight') + 'px',
									display: 'block'
								});
							}
						});
					}
					
					//����������
					multiAdd.on('click', function(e) {
						e.halt();
						//this.multiAddBox.removeClass('hidden');
						this.multiPanel.show();
						//if (this.checkMultiAddSize()) {
						this.checkMultiAddSize();
						this.multiAddTextarea.focus();
						//}
					}, this);
					
					//textarea valuechange
					this.multiAddTextarea.on('valueChange', function(e) {
						//if (e.keyCode == 13) {
						this.checkMultiAddSize();
						//}
					}, this);
					
					//���ȷ�ϻ�ȡ��
					this.multiAddBox.delegate('click', function(e) {
						e.halt();
						var target = e.currentTarget;
						if (target.hasClass('multi-add-confirm')) {
							var currentSize = this.istNum.get('value').split(',').length,
								maxSize = this.maxWidgetList,
								istDataList,
								istDataLength,
								istData,
								wlist;
							
							istDataList = this.getMultiIstData();
							istDataLength = istDataList.length;
							
							if (!this.emptyIsts) {
								this.getEmptySize();
							}
							
							while (istDataList.length && currentSize < maxSize) {
								istData = istDataList.shift();
								wlist = this.addWidgetList();
								I.WidgetLang.setVal(wlist.widgets['name'], istData['name']);
								I.WidgetLang.setVal(wlist.widgets['card'], {
									type: 1,
									no: istData['cardNo']
								});
								I.WidgetLang.setVal(wlist.widgets['relation'], '14');
								I.Linkage.syncIDCardLinkageVal(wlist);
								currentSize++;
							}
							
							if (istDataLength) {
								while (this.emptyIsts.length) {
									this.deleteWidgetList(this.emptyIsts.pop().ancestor('.ist-item'));
								}
							}
							
							this.multiAddTextarea.set('value', '');
							this.multiPanel.hide();
							this.emptySize = null;
							this.emptyIsts = null;
							if (Y.UA.ie == 6) {
								this.multiPanelMask.setStyle('display', 'none');
								this.multiPanelIframe.setStyle('display', 'none');
							}
							
						} else {
							this.multiPanel.hide();
							this.emptySize = null;
							this.emptyIsts = null;
							if (Y.UA.ie == 6) {
								this.multiPanelMask.setStyle('display', 'none');
								this.multiPanelIframe.setStyle('display', 'none');
							}
						}
					}, '.multi-add-btns a', this);
					
					//����ر�
					this.multiAddBox.delegate('click', function(e) {
						this.multiPanel.hide();
						this.emptySize = null;
						this.emptyIsts = null;
						if (Y.UA.ie == 6) {
							this.multiPanelMask.setStyle('display', 'none');
							this.multiPanelIframe.setStyle('display', 'none');
						}
					}, '.multi-add-close', this);
				}
            } else if (this.insurantInfo.one('.ist-list')) {
				this.insurantInfo.all('.ist-delete').addClass('hidden');
			}
        },
		
		/**
		 * ��鱻�����Ƿ�Ϊ��
		 * @name isEmptyIst
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
		isEmptyIst: function(list) {
			var widgets = list.widgets,
				isEmpty = true,
				relation = I.WidgetLang.getVal(widgets['relation']),
				name = I.WidgetLang.getVal(widgets['name']),
				cardNo = I.WidgetLang.getVal(widgets['card']).no,
				birthday = I.WidgetLang.getText(widgets['birthday']),
				sex = I.WidgetLang.getVal(widgets['sex']);
			
			if (relation || name || cardNo || birthday || sex) {
				isEmpty = false;
			} 
			
			return isEmpty;
		},
		
		/**
		 * ���Ϊ�յı����˸���
		 * @name getEmptySize
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
		getEmptySize: function() {
			var size = 0,
				ists = [];
			this.insurantInfo.all('.ist-item .widget-list').each(function(ist) {
				if (this.isEmptyIst(ist)) {
					ists.push(ist);
					size++;
				}
			}, this);
			this.emptySize = size;
			this.emptyIsts = ists;
			return size;
		},
		
		/**
		 * ������ӱ����˸���
		 * @name checkMultiAddSize
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
		checkMultiAddSize: function() {
			if (!this.multiAdd) { return 0; }
			var currentSize = this.istNum.get('value').split(',').length,
				emptySize = (!this.emptySize && this.emptySize !== 0) ? this.getEmptySize() : this.emptySize;
				textSize = this.getMultiIstData().length;
				
			if (currentSize - emptySize + textSize > this.maxWidgetList) {
				this.multiAddInfo.setContent('<p>����������<span>0</span>�������ˣ��ѳ���' + (currentSize - emptySize + textSize - this.maxWidgetList) + '��</p>');
				this.multiAddInfo.addClass('multi-add-error');
				return 0;
			} else {
				this.multiAddInfo.setContent('<p>����������<span>' + (this.maxWidgetList + emptySize - currentSize - textSize) + '</span>��������</p>');
				this.multiAddInfo.removeClass('multi-add-error');
				return this.maxWidgetList + emptySize - currentSize - textSize;
			}
		},
		
		/**
		 * ��ȡ������ӱ������������֤
		 * @name getMultiIstData
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
		getMultiIstData: function() {
			if (!this.multiAdd) { return []; }
			var value = this.multiAddTextarea.get('value'),
				pattern = /^\s*([\u4e00-\u9fa5]{2,20})\s*[,��;��|]?\s*(\d{15}|\d{17}(\d|X))\s*$/gim,
				istDataList = [],
				istData = null;
							
			while (istData = pattern.exec(value)) {
				istDataList.push({
					name: istData[1],
					cardNo: istData[2]
				});
			}
						
			istData = null;
			
			return istDataList;
		},
        
        /**
		 * ɨ��ؼ��б�
		 * @name scanWidgetList
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        scanWidgetList: function() {
            var that = this,
                isSingle = this.insurantInfo.one('.info-mod-bd').get('children').item(0).hasClass('widget-list');
                //isSingle = !!!this.insurantInfo.one('.ist-list');
            
			this.isSingle = isSingle;
			
            this.insurantInfo.all('.widget-list').each(function(list, index, all) {
                I.WidgetList.initList(list);
                that.initHdrLinkage(list, false);
            });
            
            if (isSingle) {
                this.initHdrLinkage(this.insurantInfo.one('.widget-list'));
            }
        },
        
        /**
		 * ��ʼ����Ͷ���˵�����
		 * @name initHdrLinkage
		 * @memberof I.Ist
         * @param list {Node} �ؼ��б�� Node�ڵ�
         * @param force {Boolean} �Ƿ���Ҫ���������falseΪֻͬ����Ϣ��
		 * @type function
		 * @public
		 */
        initHdrLinkage: function(list, force) {
            var widgets = list.widgets,
                //selfBind = this.insurantInfo.one('#self_bind'),
                rel = widgets['relation'];
            
            //����������Ͷ���˱��˸�ѡ���Ѿ�ȥ��
            /*if (selfBind) {
                //�Ƿ��б�Ͷ����ΪͶ���˱��˵Ķ�ѡ��
                I.Linkage.isSelfBind = !!selfBind.get('checked');
                I.Linkage.setModLinkage(I.Hdr.widgetList.widgets, widgets);
                selfBind.on('click', function(e) {
                    I.Linkage.isSelfBind = !!selfBind.get('checked');
                    if (I.Linkage.isSelfBind) {
                        I.Linkage.syncModLinkageVal(I.Hdr.widgetList.widgets, widgets);
                    }
                });
            }*/
            if (rel) {
                //�Ƿ�����Ͷ���˹�ϵ������
                var sl = rel['node'].one('select'),
                    _sl = sl._node,
                    _hasSelf = false;
                
                //����Ƿ��б���ѡ��    
                for (var i = 0, l = _sl.options.length; i < l; i++) {
                    if (_sl.options[i].value == '1') {
                        _hasSelf = true;
                        break;
                    }
                }
                
                //������б���
                if (_hasSelf) {
                    if (sl.get('value') == '1') {
                        I.Linkage.isSelfBind = true;
                        I.Linkage.syncModLinkageVal(I.Hdr.widgetList.widgets, widgets);
                    }
                    if (force !== false) {
                        I.Linkage.setModLinkage(I.Hdr.widgetList.widgets, widgets);
                    }
                    sl.on('change', function(e) {
                        if (sl.get('value') == '1') {
                            I.Linkage.isSelfBind = true;
                        } else {
                            I.Linkage.isSelfBind = false;
                        }
                        if (I.Linkage.isSelfBind) {
                            I.Linkage.syncModLinkageVal(I.Hdr.widgetList.widgets, widgets);
                        }
                    });
                }
            }
        },
        
        /**
		 * ��ӱ�������
		 * @name addWidgetList
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        addWidgetList: function() {
            var list = this.insurantInfo.all('.ist-item-num'),
                size = list.size();
                
            if (this.maxWidgetList && this.maxWidgetList <= size) { return; }
                
            var index = Number(list.item(size - 1).getAttribute('num')) + 1,
                newItem  = Y.Node.create(Lang.sub(this.istItemTpl, {
                    listNum: index
                })),
                newItemNum = newItem.one('.ist-item-num');
            
            newItemNum.setContent(size + 1);
            //to remove
			newItemNum.setAttribute('num', index);
            this.insurantInfo.one('.ist-list').appendChild(newItem);
            this.checkWidgetList();
            I.WidgetList.initList(newItem.one('.widget-list'));
            this.initHdrLinkage(newItem.one('.widget-list'), false);
			return newItem.one('.widget-list');
        },
        
        /**
		 * ɾ����������
		 * @name deleteWidgetList
		 * @memberof I.Ist
         * @param list {Node} �ؼ��б� Node�ڵ�
		 * @type function
		 * @public
		 */
        deleteWidgetList: function(list) {
            list.purge(true);
            list.remove(true);
            this.sortWidgetList();
            this.checkWidgetList();
			//this.checkMultiAddSize();
        },
        
        /**
		 * ����౻������
		 * @name sortWidgetList
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        sortWidgetList: function() {
            this.insurantInfo.all('.ist-item-num').each(function(node, index) {
                node.setContent(index + 1);
            });
        },
        
        /**
		 * ���౻�����˵���Ŀ�Ƿ��� 1
		 * @name checkWidgetList
		 * @memberof I.Ist
		 * @type function
		 * @public
		 */
        checkWidgetList: function() {
            var list = this.insurantInfo.all('.ist-delete'),
                nums = this.insurantInfo.all('.ist-item-num'),
                size = list.size(),
                r = size < 2 ? false : true,
                numArr = [];
            
            if (r) {
                list.item(0).removeClass('hidden');
            } else {
                list.item(0).addClass('hidden');
            }
            
            //��¼�������˺���
            nums.each(function(item) {
                numArr.push(item.getAttribute('num'));
            });
            this.istNum.set('value', numArr.join(','));
            
            if (I.SwitchPanel.rendered) {
                premiumPrice = I.SwitchPanel.unitPrice * size;
                I.SwitchPanel.updatePremium('form');
            }

            return r;    
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Beneficiary ��������Ϣ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ��������Ϣ
	 * @class Bnf
	 * @name Bnf
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Bnf = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.Bnf
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            
            Y.on('contentready', function(evt) {
                that.render();
            }, '.beneficiary-info');
        },
        
        /**
		 * ��Ⱦ
		 * @name render
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        render: function() {
            this.bnfInfo = Y.one('.beneficiary-info');
            this.bindAdd();
            this.scanWidgetList();
            this.rendered = true;
        },
        
        /**
		 * �����������
		 * @name bindAdd
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        bindAdd: function() {
            var that = this,
                bnfAdd = this.bnfInfo.one('.bnf-add');
            
            
            if (bnfAdd) {
                
                var bnfItemTplNode = this.bnfInfo.one('#bnf-item-tpl');
                this.bnfItemTpl = bnfItemTplNode.get('innerHTML');
                bnfItemTplNode.remove();
                
                this.bnferNum = this.bnfInfo.one('.bnf-num');
                this.bnferTotal = this.bnfInfo.one('.bnf-total');
                this.bnferNumIpt = this.bnfInfo.one('#BenefitNum');
                this.maxBnfer = Number(this.bnferTotal.get('innerHTML'));
                
                this.checkBnfer();
            
                bnfAdd.on('click', function(e) {
                    e.halt();
                    that.addBnfer();
                });
                that.bnfInfo.delegate('click', function(e) {
                    e.halt();
                    if (that.bnfInfo.all('.bnf-item').size < 2) { return; }
                    that.deleteBnfer(e.currentTarget.ancestor('.bnf-item'));
                }, '.bnf-delete');
            }
        },
        
        /**
		 * ��ʼ����������Ϣ
		 * @name scanWidgetList
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        scanWidgetList: function() {
			var that = this;
			this.bnfInfo.all('.widget-list').each(function(list) {
				I.WidgetList.initList(list);
				that.bindCardType(list);
				that.checkCardType(list);
			});
            /*if (window['FORM_INIT_DATA']) {
                this.bnfInfo.all('.bnf-item').each(function(item) {
                    I.WidgetLang.initVal({
                        node: item,
                        type: 'beneficiary',
                        name: 'beneficiary'
                    });
                });
            }*/
        },
        
        /**
		 * ���������
		 * @name addBnfer
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        addBnfer: function() {
            var list = this.bnfInfo.all('.bnf-item'),
                size = list.size(),
				index = Number(list.item(size - 1).getAttribute('num')) + 1,
                newItem,
				l;
                
            if (this.maxBnfer && this.maxBnfer <= size) { return; }
            		
            newItem = Y.Node.create(Lang.sub(this.bnfItemTpl, {
                listNum: index
            }));
			l = newItem.one('.widget-list');
            
            this.bnferNum.setContent(size + 1);
            this.bnfInfo.one('.bnf-list').appendChild(newItem);
            this.checkBnfer();
			I.WidgetList.initList(l);
			this.bindCardType(l);
			this.checkCardType(l);
        },
        
        /**
		 * ɾ��������
		 * @name deleteBnfer
		 * @memberof I.Bnf
         * @param bnfer {Node} ������ Node�ڵ�
		 * @type function
		 * @public
		 */
        deleteBnfer: function(bnfer) {
            bnfer.purge(true);
            bnfer.remove(true);
            this.bnferNum.setContent(Number(this.bnferNum.get('innerHTML')) - 1);
            this.sortBnfer();
            this.checkBnfer();
        },
        
        /**
		 * ����������
		 * @name sortBnfer
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        sortBnfer: function() {
            /*this.bnfInfo.all('.bnf-item').each(function(node, index) {
                node.all('label').each(function(el) {
                    el.setAttribute('for', el.getAttribute('for').replace(/-\d+$/, '-' + index));
                });
                node.all('input,select').each(function(el) {
                    el.setAttribute('id', el.getAttribute('id').replace(/-\d+$/, '-' + index));
                    el.setAttribute('name', el.getAttribute('name').replace(/-\d+$/, '-' + index));
                });
            });*/
        },
        
        /**
		 * �����������Ŀ�Ƿ�Ϊ 1
		 * @name checkBnfer
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        checkBnfer: function() {
            var list = this.bnfInfo.all('.bnf-delete'),
				nums = this.bnfInfo.all('.bnf-item'),
				numArr = [],
                size = list.size(),
                r = size < 2 ? false : true;
            
            if (r) {
                list.item(0).removeClass('hidden');
            } else {
                list.item(0).addClass('hidden');
            }
            
			//��¼�������˺���
            nums.each(function(item) {
                numArr.push(item.getAttribute('num'));
            });
            this.bnferNumIpt.set('value', numArr.join(','));

            return r;    
        },
        
        /**
		 * ��ȡ�������б���ʾֵ
		 * @name getBnferListText
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
        getBnferListText: function() {
            var list = this.bnfInfo.all('.bnf-item .widget-list'),
                data = [],
				cardVal;
            
            list.each(function(node) {
				cardVal = I.WidgetLang.getVal(node.widgets['card']);
                data.push([
                    I.WidgetLang.getText(node.widgets['name']),
                    I.WidgetLang.getText(node.widgets['ratio']) + '%',
                    I.WidgetLang.getText(node.widgets['relation']),
                    cardVal.text,
                    cardVal.no,
                    I.WidgetLang.getText(node.widgets['birthday'])
                ]);
            });
            
            return data;
        },
		
		/**
		 * ��֤�������¼�
		 * @name bindCardType
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
		bindCardType: function(list) {
			var widgets = list.widgets,
				card = widgets['card'];
			
			card.typeNode.on('change', function(e) {
				this.checkCardType(list);
			}, this);
		},
		
		/**
		 * ���֤�������Ƿ�Ϊ��������
		 * @name checkCardType
		 * @memberof I.Bnf
		 * @type function
		 * @public
		 */
		checkCardType: function(list) {
			var widgets = list.widgets,
				card = widgets['card'],
				cardType = I.WidgetLang.getVal(card).type,
				//isBirth = (cardType == '��������') ? true : false;
				isBirth = (cardType == '6') ? true : false;
			
			isBirth && card.noNode.set('value', '');
			card.noNode.set('disabled', isBirth);
			card.noNode.toggleClass('ipt-txt-disabled', isBirth);
			card.noNode.previous('label').toggleClass('widget-label-unrequired', isBirth);
		}
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Other ������Ϣ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ������Ϣ
	 * @class Other
	 * @name Other
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Other = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.Other
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.Other
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            
            Y.on('contentready', function(evt) {
                that.render();
            }, '.other-info');
        },
        
        /**
		 * ��Ⱦ
		 * @name render
		 * @memberof I.Other
		 * @type function
		 * @public
		 */
        render: function() {
            this.otherInfo = Y.one('.other-info');
            this.scanWidgetList();
            this.rendered = true;
        },
        
        /**
		 * ɨ��ؼ��б�
		 * @name scanWidgetList
		 * @memberof I.Other
		 * @type function
		 * @public
		 */
        scanWidgetList: function() {
            this.widgetList = this.otherInfo.one('.widget-list');
            this.widgetList && I.WidgetList.initList(this.widgetList);
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Order Detail ������ϸ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ������ϸ
	 * @class OD
	 * @name OD
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.OD = {
    
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.OD
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.OD
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            
            Y.on('contentready', function(evt) {
                that.render();
            }, '.order-info');
        },
        
        /**
		 * ��Ⱦ
		 * @name render
		 * @memberof I.OD
		 * @type function
		 * @public
		 */
        render: function() {
            this.orderInfo = Y.one('.order-info');
            this.scanWidgetList();
            this.rendered = true;
        },
        
        /**
		 * ɨ��ؼ��б�
		 * @name scanWidgetList
		 * @memberof I.OD
		 * @type function
		 * @public
		 */
        scanWidgetList: function() {
            this.widgetList = this.orderInfo.one('.widget-list');
            this.widgetList && I.WidgetList.initList(this.widgetList);
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Form Validator ��У��
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ���߼�
	 * @class Form
	 * @name Form
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Form = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.Form
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��
		 * @name init
		 * @memberof I.Form
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            Y.on('contentready', function(evt) {
                that.render();
            }, '#ins_widget_form');
        },
        
        /**
		 * ��Ⱦ
		 * @name render
		 * @memberof I.Form
		 * @type function
		 * @public
		 */
        render: function() {
            this.formNode = Y.one('#ins_widget_form');
            this.initValidator();
            this.rendered = true;
        },
		
		/**
		 * �ύ����Ͷ������Ϣ
		 * @name saveCHolderData
		 * @memberof I.Form
		 * @type function
		 * @public
		 */
		saveCHolderData: function() {
			if (Y.one('#J_save_holder') && Y.one('#J_save_holder').get('checked')) {
				var cdata = this.serializeFormData({
					id: 'ins_widget_form',
					container: I.Hdr.widgetList
				});
				Y.io('/json/save_holder.html?_input_charset=UTF-8', {
					method: 'POST',
					data: cdata,
					on: {
						complete: function(id, r) {}
					}
				});
			}
		},
        
        /**
		 * ��ʼ��У����
		 * @name initValidator
		 * @memberof I.Form
		 * @type function
		 * @public
		 */
        initValidator: function() {
            Y.CheckForm('ins_widget_form', this.afterValidate, this);
        },
        
        /**
		 * ��У��ɹ��ص�
		 * @name afterValidate
		 * @memberof I.Form
		 * @type function
		 * @public
		 */
        afterValidate: function() {
            formValid = true;
			this.saveCHolderData();
			if (this.formNode.one('.activate-btn')) {
				I.Activate.activate();
			} else {
				if (I.SwitchPanel.rendered) {
					I.SwitchPanel.switchToPanel(I.SwitchPanel.panels['health'] ? 'health' : 'order');
				}
			}
        },
        
        /**
		 * ��ȡ��Ԫ��ֵ���ο�io-form 3.4.1��
		 * @name serializeFormData
		 * @memberof I.Form
         * @param c {Object} �������� c = {id: 'ins_form', useDisabled: true}
		 * @param s {String} Key-value data defined in the configuration object.
		 * @type function
		 * @public
		 */
        serializeFormData: function(c, s) {
			c = c || {};
            var data = [],
                df = c.useDisabled || false,
                item = 0,
                id = (typeof c.id === 'string') ? c.id : c.id.getAttribute('id'),
                e, f, n, v, d, i, il, j, jl, o;

            if (!id) { return null; }

            f = Y.config.doc.getElementById(id);

            // Iterate over the form elements collection to construct the
			// label-value pairs.
			for (i = 0, il = f.elements.length; i < il; ++i) {
				e = f.elements[i];
				d = e.disabled;
				n = e.name;
				
				if (c.container && !c.container.contains(e)) { continue; }

				if (df ? n : n && !d) {
					n = eUC(n) + '=';
					v = eUC(e.value);

					switch (e.type) {
						// Safari, Opera, FF all default options.value from .text if
						// value attribute not specified in markup
						case 'select-one':
							if (e.selectedIndex > -1) {
								o = e.options[e.selectedIndex];
								data[item++] = n + eUC(o.attributes.value && o.attributes.value.specified ? o.value : o.text);
							}
							break;
						case 'select-multiple':
							if (e.selectedIndex > -1) {
								for (j = e.selectedIndex, jl = e.options.length; j < jl; ++j) {
									o = e.options[j];
									if (o.selected) {
									  data[item++] = n + eUC(o.attributes.value && o.attributes.value.specified ? o.value : o.text);
									}
								}
							}
							break;
						case 'radio':
						case 'checkbox':
							if (e.checked) {
								data[item++] = n + v;
							}
							break;
						case 'file':
							// stub case as XMLHttpRequest will only send the file path as a string.
						case undefined:
							// stub case for fieldset element which returns undefined.
						case 'reset':
							// stub case for input type reset button.
						case 'button':
							// stub case for input type button elements.
							break;
						case 'submit':
						default:
							data[item++] = n + v;
					}
				}
			}
			return s ? data.join('&') + "&" + s : data.join('&');       
        },
        
        /**
		 * �ύ������
		 * @name submitFormData
		 * @memberof I.Form
         * @param callback {Function} ��ɻص�����
         * @param context {Object} ִ��������
		 * @type function
		 * @public
		 */
        submitFormData: function(callback, context) {
            var formNode = this.formNode,
                url = this.formNode.getAttribute('action'),
                method = this.formNode.getAttribute('method'),
                timeStamp = +new Date();
            
            if (!formValid || !healthValid) { return; }
            
            Y.io(url + '?_input_charset=UTF-8', {
                method: method.toUpperCase(),
                data: 't=' + timeStamp,
                on: {
                    complete: function(id, r) {
                        callback.call(context || null, id, r);
                    }
                },
                form: {
                    id: formNode
                }
            });
        }
         
    };
	
	I.Activate = {
		rendered: false,
		init: function() {
            var that = this;
            Y.on('contentready', function(evt) {
                that.render();
            }, '#ins_widget_form');
        },
		render: function() {
			healthValid = true;
			I.CheckOrder.getDOMNodes.call(this);
			this.showAnnouce();
			this.rendered = true;
		},
		activate: function() {
			if (!formValid || this.confirmNode.hasClass('activating')) { return; }
			if (this.agreeCheck.get('checked')) {
				this.confirmNode.addClass('activating');
				this.errTip.addClass('hidden');
				//�ύ������
				I.Form.submitFormData(function(id, r) {
					//�ύ��ɺ���˱�״̬
                    this.count = 0;
                    I.CheckOrder.getCalcState.call(this, window['singlePolicy'] ? 1 : (I.Ist.rendered && I.Ist.insurantInfo.all('.ist-list .widget-list').size() || 1));
				}, this);
				this.loadingImg.setStyle('display', '');
				this.showCalcState('<p>���ڴ������У����Ժ�...</p>');
			} else {
				this.errTip.removeClass('hidden');
			}
		},
		showAnnouce: function() {
			var ac = Y.one('.form-info .announce-content'),
				t;
			if (ac && (t = ac.one('textarea'))) {
				ac.set('innerHTML', t.get('value'));
			}
		},
		showCalcState: function() {
			return I.CheckOrder.showCalcState.apply(this, arguments);
		},
		goToUrl: function() {
			return I.CheckOrder.goToUrl.apply(this, arguments);
		}
	};
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   WidgetList �ؼ��б�
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * �ؼ��б��߼�
	 * @class WidgetList
	 * @name WidgetList
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.WidgetList = {
        
        /**
		 * ��ʼ���ؼ��б�
		 * @name initList
		 * @memberof I.WidgetList
         * @param list {Node} �ؼ��б� Node�ڵ�
		 * @type function
		 * @public
		 */
        initList: function(list) {
            list.widgets = {};
            this.initWidgets(list);
            this.initWidgetLinkage(list);
        },
        
        /**
		 * ��ʼ�����пؼ�
		 * @name initWidgets
		 * @memberof I.WidgetList
         * @param list {Node} �ؼ��б� Node�ڵ�
		 * @type function
		 * @public
		 */
        initWidgets: function(list) {
            var widgetItems = list.all('.widget-item'),
                name = '',
                type = '';
                
            widgetItems.each(function(node) {
                name = node.getAttribute('widget');
                type = node.getAttribute('type');
                if (name) {
                    //Node�ڵ㡢���͡�����
                    list.widgets[name] = {
                        node: node,
                        type: type,
                        name: name
                    };
                    
                    //����ʼֵ
                    if (window['FORM_INIT_DATA']) {
                        I.WidgetLang.initVal(list.widgets[name], window['FORM_INIT_DATA']);
                    }
                    //�ȳ�ʼ������
                    if (I.Widgets[type] && I.Widgets[type].init) {
                        I.Widgets[type].init(list.widgets[name]);
                    }
                    //���ʼ������
                    if (I.Widgets[name] && I.Widgets[name].init) {
                        I.Widgets[name].init(list.widgets[name]);
                    }
                }
            });
        },
        
        /**
		 * ��ʼ���ؼ��������
		 * @name initWidgetLinkage
		 * @memberof I.WidgetList
         * @param list {Node} �ؼ��б� Node�ڵ�
		 * @type function
		 * @public
		 */
        initWidgetLinkage: function(list) {
            var widgets = list.widgets;
            
            //���֤���������ڼ��Ա�����
            if (widgets['card'] && (widgets['birthday'] || widgets['sex'])) {
                I.Linkage.setIDCardLinkage(list);
            }
            
        },
        
        /**
		 * ��ȡ�ؼ��б����ʾֵ
		 * @name getWidgetListText
		 * @memberof I.WidgetList
         * @param list {Node} �ؼ��б� Node�ڵ�
		 * @type function
		 * @public
		 */
        getWidgetListText: function(list) {
            var widgets = list.widgets,
                data = {};
            
            Y.Object.each(widgets, function(v, k) {
                data[k] = I.WidgetLang.getText(v);
            });
            
            return data;
        }
    };
    
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   WidgetLang �ؼ�ͨ�÷���ͳһ�ӿ�
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * �ؼ�ͨ�÷���ͳһ�ӿ�
	 * @class WidgetLang
	 * @name WidgetLang
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.WidgetLang = {
        
        /**
		 * ��������
		 * @name _batch
		 * @memberof I.WidgetLang
		 * @type function
		 * @private
		 */
        _batch: function() {
            var args = arguments,
                method = args[0],
                bindArgs = Array.prototype.slice.call(args, 1),
                widget = bindArgs[0],
                type = widget['type'],
                name = widget['name'];
            
            if (I.Widgets[name] && I.Widgets[name][method]) {
                return I.Widgets[name][method].apply(I.Widgets[name], bindArgs);
            } else if (I.Widgets[type] && I.Widgets[type][method]) {
                return I.Widgets[type][method].apply(I.Widgets[type], bindArgs);
            } else {
                return I.Widgets['def'][method].apply(I.Widgets['def'], bindArgs);
            }
        },
        
        /**
		 * ��ȡ�ؼ�ֵ
		 * @name getVal
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
		 * @type function
		 * @public
		 */
        getVal: function(widget) {
            return this._batch('getVal', widget);
        },
        
        /**
		 * ���ÿؼ�ֵ
		 * @name setVal
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
         * @param val {String | Array | Object} ��Ҫ���õ�ֵ
		 * @type function
		 * @public
		 */
        setVal: function(widget, val) {
            return this._batch('setVal', widget, val);
        },
        
        /**
		 * ��������
		 * @name setLinkage
		 * @memberof I.WidgetLang
         * @param a {Object} �ؼ����� a
         * @param b {Object} �ؼ����� b
		 * @type function
		 * @public
		 */
        setLinkage: function(a, b) {
            return this._batch('setLinkage', a, b);
        },
        
        /**
		 * ��ȡ��ʾ�ı�
		 * @name getText
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
		 * @type function
		 * @public
		 */
        getText: function(widget) {
            return this._batch('getText', widget);
        },
        
        /**
		 * ��ʼ��ֵ
		 * @name initVal
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
         * @param data {Object} ֵ����
		 * @type function
		 * @public
		 */
        initVal: function(widget, data) {
            return this._batch('initVal', widget, data);
        },
		
		/**
		 * ����ֵ���ÿգ�
		 * @name reset
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
		 * @type function
		 * @public
		 */
        reset: function(widget) {
            return this._batch('reset', widget);
        },
		
		/**
		 * ���ؼ���ı�Ԫ�ص�ֵת����getVal���صĸ�ʽ��For setVal��
		 * @name parseElVal
		 * @memberof I.WidgetLang
         * @param widget {Object} �ؼ�����
		 * @type function
		 * @public
		 */
		parseElVal: function(widget) {
            return this._batch('parseElVal', widget);
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Widgets �ؼ������б�
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * �ؼ������б�
	 * @class Widgets
	 * @name Widgets
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Widgets = {
        
        /**
         * Ĭ���������
         * @class def
         * @name def
         * @memberof I.Widgets
         * @type object
         * @public
         */
        def: {
            getVal: function(widget) {
                var v = '',
                    node = widget['node'],
                    type = widget['type'];
                    
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('checked')) {
                                v = item.get('value');
                            }
                        });
                        return v;
                    case 'select':
                        return node.one('select').get('value');
                    case 'checkbox': 
                        v = [];
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (item.get('checked')) {
                                v.push(item.get('value'));
                            }
                        });
                        return v.join(',');
                    case 'text':
                        return node.one('input[type="text"],textarea').get('value');
                    default:
                        return v;
                }
            },
            setVal: function(widget, val) {
                var node = widget['node'],
                    type = widget['type'];
                
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('value') == val) {
                                item.set('checked', true);
                            }
                        });
                        return val;
                    case 'select':
                        node.one('select').set('value', val);
                        return val;
                    case 'checkbox': 
                        var valArr = (val || '').split(','),
                            valObj = {};
                        while (valArr.length) {
                            valObj[valArr.pop()] = 1;
                        }
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (valObj[item.get('value')]) {
                                item.set('checked', true);
                            } else {
                                item.set('checked', false);
                            }
                        });
                        return val;
                    case 'text':
                        node.one('input[type="text"],textarea').set('value', val);
                        return val;
                    default:
                        return val;
                }
            },
            setLinkage: function(a, b) {
                var that = this,
                    node = a['node'],
                    type = a['type'];
                
                switch (type) {
                    case 'radio':
                        node.delegate('click', function(e) {
                            if (I.Linkage.isSelfBind) {
                                I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                            }
                        }, 'input[type="radio"]');
                        break;
                    case 'select':
                        node.one('select').on('change', function(e) {
                            if (I.Linkage.isSelfBind) {
                                I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                            }
                        });
                        break;
                    case 'checkbox':
                        node.delegate('click', function(e) {
                            if (I.Linkage.isSelfBind) {
                                I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                            }
                        }, 'input[type="checkbox"]');
                        break;
                    case 'text':
                        node.one('input[type="text"],textarea').on('valueChange', function(e) {
                            if (I.Linkage.isSelfBind) {
                                I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                            }
                        });
                        break;
                    default:
                        return;
                }
            },
            getText: function(widget) {
                var t = '',
                    node = widget['node'],
                    type = widget['type'],
                    _t = '',
                    _s;
                    
                switch (type) {
                    case 'radio':
                        node.all('input[type="radio"]').each(function(item) {
                            if (item.get('checked')) {
                                t = item.next('label').get('text');
                            }
                        });
                        return t;
                    case 'select':
                        _s = node.one('select')._node;
                        if (_s.selectedIndex > -1) {
                            _t = _s.options[_s.selectedIndex].text;
                        }
                        return _t;
                    case 'checkbox': 
                        t = [];
                        node.all('input[type="checkbox"]').each(function(item) {
                            if (item.get('checked')) {
                                t.push(item.next('label').get('text'));
                            }
                        });
                        return t.join(' ');
                    case 'text':
                        return node.one('input[type="text"],textarea').get('value');
                    default:
                        return t;
                }
            },
            initVal: function(widget, data) {
                var node = widget['node'];
                
				data = data || {};
                
                //������Ԫ�أ����ó�ʼֵ
                node.all('input,select,textarea').each(function(el) {
                    var _el = el._node,
                        type = _el.type,
                        name = _el.name,
                        val = data[name];
                        
                    if (typeof val !== 'undefined') {
                        switch (type) {
                            case 'select-one':
                                el.set('value', val);
                                break;
                            case 'radio':
                                _el.checked = _el.value == val ? true : false;
                                break;
                            case 'checkbox':
                                var arr = val.split(',');
                                _el.checked = false;
                                for (var i = 0, l = arr.length; i < l; i++) {
                                    if (_el.value == arr[i]) {
                                        _el.checked = true;
                                        break;
                                    }
                                }
                                break;
                            case 'file':
                            case undefined:
                            case 'reset':
                            case 'button':
                            case 'select-multiple':
                            case 'submit':
                                break;
                            default:
                                el.set('value', val);
                        }
                    }
                });
            },
			reset: function(widget) {
				var node = widget['node'],
                    type = widget['type'];
                
                switch (type) {
                    case 'text':
                        node.one('input[type="text"],textarea').set('value', '');
                        break;
                    case 'checkbox': 
                        node.all('input[type="checkbox"]').set('checked', false);
						break;
                    case 'radio':
                        node.all('input[type="radio"]').set('checked', false);
                        break;
                    case 'select':
                        node.one('select').one('option').set('selected', true);
                        break;
                    default:
						break;
                }
				
				return '';
			},
			parseElVal: function(widget) {
				return I.WidgetLang.getVal(widget);
			}
        },
        
        /**
         * �����˵�
         * @class cascade
         * @name cascade
         * @memberof I.Widgets
         * @type object
         * @public
         */
        cascade: {
            initVal: function(widget, data) {
				var node = widget['node'];
                widget.cfg = widget.cfg || [];
				widget.vals = [];
				node.all('select').each(function(item) {
                    n = item.getAttribute('name');
                    if (data) {
                        if (typeof data[n] === 'undefined') {
                            widget.vals.push('');
                        } else {
                            widget.vals.push(data[n]);
                        }
                    }
                });
            },
            init: function(widget) {
                var node = widget['node'],
                    name = widget['name'],
                    //data = window['FORM_INIT_DATA'],
                    casCfg = window['CAS_CFG'],
                    cfg = [],
                    idArr = [],
                    nameArr = [],
                    vals = [],
                    str,
                    mod,
                    n;
				
				widget.cfg = widget.cfg || [];
				widget.vals = widget.vals || [];
                
                //��ȡid��name����ʼ��ֵ����
                node.all('select').each(function(item) {
                    n = item.getAttribute('name');
                    idArr.push(item.getAttribute('id'));
                    nameArr.push(n);
                });
                
                if (idArr.length) {
                    
                    if (node.ancestor('.holder-info')) {
                        mod = 'holder';
                    } else if (node.ancestor('.insurant-info')) {
                        mod = 'insured';
                    } else if (node.ancestor('.other-info')) {
                        mod = 'other';
                    } else {
                        return;
                    }
                    
                    if (casCfg && casCfg[mod] && casCfg[mod][name]) {
                        cfg.push(casCfg[mod][name]);
                        cfg.push(idArr);
                        widget.cfg.push(casCfg[mod][name]);
                        widget.cfg.push(idArr);
                        
                        if (widget.vals.length) {
                            cfg.push(widget.vals.concat());
                        }
                        
                        //��ʼ�������˵�
                        Cascade && Cascade.init.apply(widget, cfg);
                    }
                }
            },
            getVal: function(widget) {
                var node = widget['node'],
                    val = [];
                    
                node.all('select').each(function(item) {
                    val.push(item.get('value'));
                });
                
                return val;
            },
            setVal: function(widget, val) {
                var cfg;
                if (widget.cfg && widget.cfg.length >= 2) {
                    cfg = widget.cfg.concat();
                    cfg.push(val);
                    Cascade && Cascade.init.apply(widget, cfg);
                }
                return val;
            },
            setLinkage: function(a, b) {
                var that = this;
                if (a.cfg && a.cfg.length >= 2 && b.cfg && b.cfg.length >= 2) {
                    a['node'].delegate('change', function(e) {
                        e.stopImmediatePropagation();
                        if (I.Linkage.isSelfBind) {
                            I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                        }
                    }, 'select');
                }
            },
            getText: function(widget) {
                var node = widget['node'],
                    val = '',
                    _t = '',
                    _s;
                
                node.all('select').each(function(item) {
                    _s = item._node;
                    if (_s.selectedIndex > -1) {
                        _t = _s.options[_s.selectedIndex].text;
                    }
                    val = val + _t + ' '; 
                });
                
                return val;
            },
			reset: function(widget) {
				var cfg;
                if (widget.cfg && widget.cfg.length >= 2) {
                    cfg = widget.cfg.concat();
                    Cascade && Cascade.init.apply(widget, cfg);
                }
				return '';
			},
			parseElVal: function(widget) {
				return widget.vals;
			}
        },
        
        /**
         * �̶��绰�����żӺ��룩
         * @class areaphone
         * @name areaphone
         * @memberof I.Widgets
         * @type object
         * @public
         */
        areaphone: {
            init: function(widget) {
                var node = widget['node'],
                    ipts = node.all('input');
                
                widget['area'] = ipts.item(0); 
                widget['no'] = ipts.item(1);
            },
            getVal: function(widget) {
                return {
                    area: trim(widget['area'].get('value')),
                    no: trim(widget['no'].get('value'))
                };
            },
            setVal: function(widget, val) {
                widget['area'].set('value', val['area']);
                widget['no'].set('value', val['no']);
                return val;
            },
            setLinkage: function(a, b) {
                a['area'].on('valueChange', function(e) {
                    if (I.Linkage.isSelfBind) {
                        I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                    }
                });
                a['no'].on('valueChange', function(e) {
                    if (I.Linkage.isSelfBind) {
                        I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                    }
                });
            },
            getText: function(widget) {
                var vals = I.WidgetLang.getVal(widget);
                return vals['area'] + ' - ' + vals['no'];
            },
			reset: function(widget) {
				I.WidgetLang.setVal(widget, {
					area: '',
					no: ''
				});
				return '';
			},
			parseElVal: function(widget) {
				return I.WidgetLang.getVal(widget);
			}
        },
        
        /**
         * ���֤
         * @class card
         * @name card
         * @memberof I.Widgets
         * @type object
         * @public
         */
        card: {
            init: function(widget) {
                var that = this,
					node = widget['node'];
                //����Node�ڵ�
                widget['typeNode'] = node.one('select');
                widget['noNode'] = node.one('input');
				widget['typeNode'].on('change', function(e) {
					that.hideRelWidget(widget);
				});
            },
            getVal: function(widget) {
                var typeNode = widget['typeNode'],
                    _typeNode = typeNode._node,
                    _t = '';
                
                if (_typeNode.selectedIndex > -1) {
                    _t = _typeNode.options[_typeNode.selectedIndex].text;
                }
                    
                //�������ͼ��������
                return {
                    type: widget['typeNode'].get('value'),
                    no: trim(widget['noNode'].get('value')),
                    text: _t
                };
            },
            setVal: function(widget, val) {
                var node = widget['node'];
                widget['typeNode'].set('value', val.type);
                widget['noNode'].set('value', val.no);
				this.hideRelWidget(widget);
                return val;
            },
            setLinkage: function(a, b) {
                var that = this;
                a['typeNode'].on('change', function(e) {
                    if (I.Linkage.isSelfBind) {
                        I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                        //ͬ�������Ա�
                        I.Linkage.syncIDCardLinkageVal(b['node'].ancestor('.widget-list'));
						that.hideRelWidget(b);
                    }
                });
                a['noNode'].on('valueChange', function(e) {
                    if (I.Linkage.isSelfBind) {
                        I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                        //ͬ�������Ա�
                        I.Linkage.syncIDCardLinkageVal(b['node'].ancestor('.widget-list'));
                    }
                });
            },
            getText: function(widget) {
                var v = I.WidgetLang.getVal(widget);
                return v.text + ' ' + v.no;
            },
			reset: function(widget) {
				widget['typeNode'].one('option').set('selected', true);
                widget['noNode'].set('value', '');
				this.hideRelWidget(widget);
				return '';
			},
			parseElVal: function(widget) {
				return I.WidgetLang.getVal(widget);
			},
			hideRelWidget: function(widget) {
				return;
				var list = widget['node'].ancestor('.widget-list'),
					widgets = list.widgets,
					card = widget,
					birthday = widgets['birthday'],
					sex = widgets['sex'],
					type = I.WidgetLang.getVal(card).type;
				
				if (type == 1) {
					birthday && birthday['node'].addClass('hidden');
					sex && sex['node'].addClass('hidden');
				} else {
					birthday && birthday['node'].removeClass('hidden');
					sex && sex['node'].removeClass('hidden');
				}
			}
        },
        
        /**
         * ���ڼ����˵�
         * @class date
         * @name date
         * @memberof I.Widgets
         * @type object
         * @public
         */
        date: {
            init: function(widget, force) {
                var node = widget.node;
				widget['inputNode'] = node.one('input');
                if (force || !widget['inited']) {
                    widget['dc'] = new Y.DateCascade.Input({
                        id: widget['inputNode'].getAttribute('id')
                    });
                    widget['inited'] = 1;
                }
            },
            getVal: function(widget) {
                return {
                    year: widget.dc.get('year') || '',
                    month: widget.dc.get('month') || '',
                    day: widget.dc.get('day') || '',
                    date: widget.dc.get('date')
                };
            },
            getAge: function(widget) {
                var d = new Date(),
                    date = new Date(I.WidgetLang.getVal(widget).date.replace(/-/g, '/'));
                return d.getFullYear() - date.getFullYear() - ((d.getMonth() < date.getMonth() || d.getMonth() == date.getMonth() && d.getDate() < date.getDate()) ? 1 : 0);
            },
            setVal: function(widget, val) {
                if (widget.dc) {
                    //v = val.replace(/-/g, '/');
                    widget.dc.setNewYear(val.year).setNewMonth(val.month).setNewDay(val.day);
                }
                return val;
            },
            setLinkage: function(a, b) {
                var that = this;
                if (a.dc && b.dc) {
                    a['node'].delegate('change', function(e) {
                        e.stopImmediatePropagation();
                        if (I.Linkage.isSelfBind) {
                            I.WidgetLang.setVal(b, I.WidgetLang.getVal(a));
                        }
                    }, 'select');
                }
            },
            getText: function(widget) {
                return I.WidgetLang.getVal(widget).date || '';
            },
			reset: function(widget) {
				I.WidgetLang.setVal(widget, {
					year: '',
                    month: '',
                    day: '',
					date: ''
				});
				return '';
			},
			parseElVal: function(widget) {
				var val = widget['inputNode'].get('value'),
					date = new Date(val.replace(/-/g, '/')),
					isDate = Y.Lang.isDate(date);
					
				return isDate ? {
					year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    date: val
				} : {
					year: '',
                    month: '',
                    day: '',
                    date: ''
				};
			}
        },
        
		//TODO
		//Add setVal, setLinkage, reset Method
        /**
         * ����
         * @class calendar
         * @name calendar
         * @memberof I.Widgets
         * @type object
         * @public
         */
        calendar: {
            init: function(widget) {
                var that = this,
                    node = widget['node'],
                    inputNode = node.one('input'),
                    id = inputNode.getAttribute('id'),
                    val = Lang.trim(inputNode.get('value')),
                    min = inputNode.getAttribute('min-date'),
                    max = inputNode.getAttribute('max-date'),
                    now = new Date(),
                    d,
					s,
                    mi,
                    mx;
                
                widget['inputNode'] = inputNode;
                
                s = new Date(val.replace(/-/g, '/'));
                mi = new Date(min.replace(/-/g, '/'));
                mx = new Date(max.replace(/-/g, '/'));
				d = Lang.isDate(mi) ? mi : now;
				
				if (Lang.isDate(s)) {
					if ((Lang.isDate(mi) && (s.getTime() < mi.getTime())) || (Lang.isDate(mx) && (s.getTime() > mx.getTime()))) {
						inputNode.set('value', '');
						s = now;
					}
				} else {
					inputNode.set('value', '');
					s = now;
				}

                if (inputNode && id) {
                    widget.cld = new Y.Calendar(id, {
                        date: d,
                        selected: s,
                        mindate: mi,
                        maxdate: mx,
                        popup: true,
                        closeable: true
                    }).on('select', function(d) {
                        inputNode.set('value', that.formatDate(d));
                    });
                }
            },
            getVal: function(widget) {
                return widget['inputNode'].get('value');
            },
			setVal: function() {},
			setLinkage: function() {},
            getText: function(widget) {
                return widget['inputNode'].get('value');
            },
            formatDate: function(d) {
                var _Y = d.getFullYear(),
                    _M = d.getMonth() + 1,
                    _D = d.getDate();
                    
                return _Y + '-' + (_M < 10 ? '0' + _M : _M) + '-' + (_D < 10 ? '0' + _D : _D);
            },
			reset: function() {},
			parseElVal: function() {}
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Linkage �ؼ�����
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ������
	 * @class Linkage
	 * @name Linkage
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Linkage = {
        
        /**
		 * ���������Ƿ���Ͷ���˱���
		 * @name isSelfBind
		 * @memberof I.Linkage		 
		 * @type boolean
		 * @public
		 */
        isSelfBind: false,
        
        /**
		 * ����ģ������
		 * @name setModLinkage
		 * @memberof I.Linkage
         * @param hw {Object} Ͷ���� widget
         * @param iw {Object} ������ widget
		 * @type function
		 * @public
		 */
        setModLinkage: function(hw, iw) {
            //��������
            Y.Object.each(hw, function(hwidget, name) {
                var iwidget = iw[name],
                    type = hwidget['type'];
                    
                if (iwidget) {
                    I.WidgetLang.setLinkage(hwidget, iwidget);
                    I.WidgetLang.setLinkage(iwidget, hwidget);
                }
            });
        },
        
        /**
		 * ͬ��ģ����������
		 * @name syncModLinkageVal
		 * @memberof I.Linkage	
         * @param hw {Object} Ͷ���� widget
         * @param iw {Object} ������ widget
		 * @type function
		 * @public
		 */
        syncModLinkageVal: function(hw, iw) {
            //ͬ��Ͷ������Ϣ
            Y.Object.each(hw, function(hwidget, name) {
                var iwidget = iw[name],
                    type = hwidget['type'];
                
                if (iwidget) {
                    I.WidgetLang.setVal(iwidget, I.WidgetLang.getVal(hwidget));
                }
            });
        },
        
        /**
		 * �������֤�����Ա�����
		 * @name setIDCardLinkage
		 * @memberof I.Linkage
         * @param list {Node} ֤���ؼ� Node�ڵ�
		 * @type function
		 * @public
		 */
        setIDCardLinkage: function(list) {
            var that = this,
                widgets = list.widgets,
                cardNode = widgets['card']['node'],
                cardNo = cardNode.one('input');
                    
            cardNo.on('valueChange', function(e) {
                that.syncIDCardLinkageVal(list);
            });
            cardNo.on('blur', function(e) {
                that.syncIDCardLinkageVal(list);
            });
			
			I.Widgets['card'].hideRelWidget(widgets['card']);
        },
        
        /**
		 * ͬ�����֤�����Ա�����
		 * @name syncIDCardLinkageVal
		 * @memberof I.Linkage		
         * @param list {Node} ֤���ؼ� Node�ڵ�
		 * @type function
		 * @public
		 */
        syncIDCardLinkageVal: function(list) {
            var widgets = list.widgets,
                card = widgets['card'],
                birthday = widgets['birthday'],
                sex = widgets['sex'],
                cardVal = I.WidgetLang.getVal(card),
                v = cardVal['no'];
            
            //����������֤������
            if (cardVal.type != '1') { return; }
            
            //�����15λ�������18λ
            if (v.length == 15) {
                v = v.slice(0, 6) + '19' + v.slice(6) + '1';
            }
            //�����18λ
            if (v.length == 18) {
                var _Y = v.slice(6, 10),
                    _M = parseInt(v.slice(10, 12), 10) + '',
                    _D = parseInt(v.slice(12, 14), 10) + '';
                //������Ⱦ���ڿؼ�
                if (birthday) {
                    I.WidgetLang.setVal(birthday, {
                        year: _Y,
                        month: _M,
                        day: _D
                    });
                }
                //ѡ���Ա�
                if (sex) {
                    if (v.slice(-2, -1) % 2 == 0) {
                        //Ů��
                        sex['node'].all('input').item(1).set('checked', true);
                    } else {
                        //����
                        sex['node'].all('input').item(0).set('checked', true);
                    }
                }
            }
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   Health ������֪ҳ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * ������֪ҳ
	 * @class Health
	 * @name Health
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.Health = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.Health
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʼ��ģ��
		 * @name init
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            Y.on('contentready', function(evt) {
                that.render();
            }, '.health-info');
        },
        
        /**
		 * ��Ⱦģ��
		 * @name render
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        render: function() {
            this.healthInfo = Y.one('.health-info');
            this.bindSteps();
            this.rendered = true;
        },
        
        /**
		 * ���¼�����һ������һ����
		 * @name bindSteps
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        bindSteps: function() {
            var that = this;
            this.healthInfo.one('.prev-btn').on('click', function(e) {
                e.halt();
                if (I.SwitchPanel.rendered) {
                    that.resetForm();
                    I.SwitchPanel.switchToPanel('form');
                }
            });
            this.healthInfo.one('.submit-btn').on('click', function(e) {
                e.halt();
                that.validateForm();
            });
        },
        
        /**
		 * ���ñ���֤״̬
		 * @name resetForm
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        resetForm: function() {
            var errBox = Y.one('#submit_error'),
                errList = errBox.one('#J_ErrMsg');
            
            errBox.setStyle('display', 'none');
            errList.empty();
            
            this.healthInfo.all('.err-highlight').removeClass('err-highlight');
        },
        
        /**
		 * У���
		 * @name validateForm
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        validateForm: function() {
            var errBox = Y.one('#submit_error'),
                errList = errBox.one('#J_ErrMsg'),
                valid = true,
                opts;
            
            errList.empty();  
            this.healthInfo.all('.health-anwser').each(function(node, index) {
                opts = node.all('input');
                if (!opts.item(1).get('checked')) {
                    valid = false;
                    node.addClass('err-highlight');
                    if (opts.item(0).get('checked')) {
                        errList.appendChild('<li>' + '��Ǹ���������˷������ ' + (index + 1) + ' ���ܹ���ñ���' + '</li>');
                    } else {
                        errList.appendChild('<li>' + '��ѡ������ ' + (index + 1) + ' ��' + '</li>');
                    }
                } else {
                    node.removeClass('err-highlight');
                }
            });
            
            if (valid) {
                errBox.setStyle('display', 'none');
                this.afterValidate();
            } else {
                errBox.setStyle('display', 'block');
				window.scrollTo(0, 0);
                location.hash = 'error_info';
            }
        },
        
        /**
		 * У����ص�
		 * @name afterValidate
		 * @memberof I.Health
		 * @type function
		 * @public
		 */
        afterValidate: function() {
            healthValid = true;
            if (I.SwitchPanel.rendered) {
                I.SwitchPanel.switchToPanel('order');
            }
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   CheckOrder �����˶�ҳ
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * �����˶�ҳ
	 * @class CheckOrder
	 * @name CheckOrder
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.CheckOrder = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.CheckOrder
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * �˶��������
		 * @name count
		 * @memberof I.CheckOrder
		 * @type number
		 * @public
		 */
        count: 0,
        
        /**
		 * ��ʼ��ģ��
		 * @name init
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            Y.on('contentready', function(evt) {
                that.render();
            }, '.check-order');
        },
        
        /**
		 * ��Ⱦģ��
		 * @name init
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        render: function() {
			this.getDOMNodes();
            this.bindEvents();
            this.rendered = true;
        },
		
		/**
		 * ��ȡDOM�ڵ�
		 * @name getDOMNodes
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
		getDOMNodes: function() {
            this.orderNode = Y.one('.check-order');
            this.agreeCheck = Y.one('#J_Agree');
            this.errTip = Y.one('#J-error-tips');
            this.calcTip = Y.one('#J-tips');
            this.loadingImg = Y.one('#J_Loading');
            this.confirmNode = Y.one('#J-BuyIns');
            this.returnNode = Y.one('#J-return');
		},
        
        /**
		 * ���¼�
		 * @name bindEvents
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        bindEvents: function() {
            var that = this;
            
            this.confirmNode.on('click', function(e) {
                e.halt();
                if (!e.target.hasClass('confirming')) {
                    that.confirm.call(that, e);
                }
            });
            
            this.returnNode.on('click', function(e) {
                e.halt();
                if (that.confirmNode.hasClass('confirming')) { return; }
                that.goBack.call(that, e);
            });
        },
        
        /**
		 * ���ɶ���
		 * @name renderOrder
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderOrder: function() {
            I.Hdr.rendered && this.renderHdrInfo();
            I.Ist.rendered && this.renderIstInfo();
            I.Bnf.rendered && this.renderBnfInfo();
            I.Other.rendered && this.renderOtherInfo();
            I.OD.rendered && this.renderODInfo();
        },
        
        /**
		 * ����һ����񣨶�Ӧһ���ռ��б�
		 * @name renderListInfo
		 * @memberof I.CheckOrder
         * @param list {Node} �ؼ��б� Node�ڵ�
         * @param table {Node} ��Ӧ�������
		 * @type function
		 * @public
		 */
        renderListInfo: function(list, table) {
            var elems = table.all('td'),
                data = I.WidgetList.getWidgetListText(list),
                w;
            
            elems.each(function(node) {
                w = node.getAttribute('widget');
                if (w && data[w]) {
                    node.setContent(delHtmlTag(data[w]));
                }
            });
        },
        
        /**
		 * ��ȾͶ������Ϣ
		 * @name renderHdrInfo
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderHdrInfo: function() {
            this.renderListInfo(I.Hdr.holderInfo.one('.widget-list'), this.orderNode.one('.order-hdr table'));
        },
        
        /**
		 * ��Ⱦ����������Ϣ
		 * @name renderIstInfo
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderIstInfo: function() {
            var that = this,
                ist = this.orderNode.one('.order-ist'),
                single = ist.one('table'),
                multi = ist.one('.order-multi-ist'),
                n;
            
            if (single) {
                that.renderListInfo(I.Ist.insurantInfo.one('.widget-list'), single);
            }
            
            if (multi) {
                if (!this.multiIstTpl) {
                    var xmp = multi.one('xmp');
                    this.multiIstTpl = xmp.get('innerHTML');
                    xmp.remove();
                }
                multi.empty();
                I.Ist.insurantInfo.all('.ist-list .widget-list').each(function(list, index) {
                    n = Y.Node.create(that.multiIstTpl);
                    n.one('.multi-no').setContent(index + 1);
                    that.renderListInfo(list, n.one('table'));
                    multi.appendChild(n);
                });
            }
        },
        
        /**
		 * ��Ⱦ��������Ϣ
		 * @name renderBnfInfo
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderBnfInfo: function() {
            var bnf = this.orderNode.one('.order-bnf'),
                multi = bnf.one('.order-multi-bnf'),
                data = I.Bnf.getBnferListText(),
                i = 0,
                n,
                o;
                
            if (multi) {
                if (!this.multiBnfTpl) {
                    var xmp = multi.one('xmp');
                    this.multiBnfTpl = xmp.get('innerHTML');
                    xmp.remove();
                }
                multi.empty();
                while (data.length) {
                    o = data.shift();
                    n = Y.Node.create(this.multiBnfTpl);
                    n.one('.multi-no').setContent(++i);
                    n.all('td').each(function(item, index) {
                        item.setContent(o[index]);
                    });
                    multi.appendChild(n);
                }
            }
        },
        
        /**
		 * ��Ⱦ������Ϣ
		 * @name renderOtherInfo
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderOtherInfo: function() {
            this.renderListInfo(I.Other.otherInfo.one('.widget-list'), this.orderNode.one('.order-other table'));
        },
        
        /**
		 * ��Ⱦ������ϸ��Ϣ
		 * @name renderODInfo
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        renderODInfo: function() {
            this.renderListInfo(I.OD.orderInfo.one('.widget-list'), this.orderNode.one('.order-detail table'));
        },
        
        /**
		 * ���˱�״̬
		 * @name getCalcState
		 * @memberof I.CheckOrder
         * @param num {Number} ���������������˸�����
		 * @type function
		 * @public
		 */
        getCalcState: function(num) {
            var that = this,
                timeStamp = +new Date(),
                tmpOrderId = window['tmpOrderId'] || '',
                bizOrderId = window['bizOrderId'] || '',
                bizOrderIdArr = [],
                errStr = '',
                i = 1,
                d;
            
            that.count++;
            Y.io('/json/check_status.html', {
                method: 'POST',
                data: (bizOrderId ? ('biz_order_id=' + bizOrderId) : ('tmp_order_id=' + tmpOrderId)) + '&t=' + timeStamp,
                on: {
                    complete: function(id, r) {
                        var res;
                        
                        try {
                            res = eval('(' + r.responseText + ')');
                        } catch (err) {}
                        
                        if (res && res.status && res.data) {
                            that.count = 0;
                            that.loadingImg.setStyle('display', 'none');
                            var data = res.data;
                            if (data.length && Lang.isArray(data)) {
                                //if (data.length == num) {
                                    //���ض������뱻������Ŀ��ͬ
                                    while (data.length) {
                                        d = data.shift();
                                        if (d.result) {
                                            bizOrderIdArr.push(d['biz_order_id']);
                                        } else {
											if (isActivate) {
												errStr += ('<li>����' + i + '�˱�ʧ�ܣ����޸Ļ��������ύ</a>' + (d.text ? ('��ʧ��ԭ��' + d.text) : '') + '</li>');
											} else {
												errStr += ('<li>����' + i + '�˱�ʧ�ܣ���' + '<a href="/ins/buy_edit.html?biz_order_id=' + d['biz_order_id'] +'">�����޸�</a>' + (d.text ? ('��ʧ��ԭ��' + d.text) : '') + '</li>');
											}
                                        }
                                        i++;
                                    }
                                    if (bizOrderIdArr.length) {
                                        //��һ�������ɹ�
                                        //that.showCalcState('<p>�������˺˱��ɹ�' + bizOrderIdArr.length + '�ˣ�ת��֧��������ҳ...</p>');
                                        if (I.Activate.rendered) {
											//����ɹ���ֱ�������б�ҳ
											that.showCalcState('<p>ת���ҵı��������б�...</p>');
											that.goToUrl('', 1000);
										} else {
											that.showCalcState('<p>�������˺˱��ɹ���ת��֧��������ҳ...</p>');
											that.goToUrl('/order_pay.html?biz_order_id=' + bizOrderIdArr.join(','), 1000);
										}
									} else {
                                        //���ж������˱�ʧ��
                                        that.showCalcState('<ul>' + errStr + '</ul>');
                                        that.calcTip.addClass('tip-loaded');
                                    }
                                //} else {
                                    //���ض������뱻������Ŀ����ͬ�����������б�ҳ
                                    //that.showCalcState('<p>ת���ҵı��������б�...</p>');
                                    //that.goToUrl('', 1000);
                                //}
                                return;
                            }
                        }
                        
                        //�˱�δ���
                        if (that.count < 7) {
                            Y.later(1000, that, function() {
                                I.CheckOrder.getCalcState.call(that, num);
                            });
                        } else {
                            that.count = 0;
                            //������δ������ɣ����������б�ҳ
                            that.showCalcState('<p>ת���ҵı��������б�...</p>');
                            that.goToUrl('', 1000);
                        }
                    }
                },
                timeout: 1500
            });
        },
        
        /**
		 * ��ʾ������Ϣ
		 * @name showLoadingText
		 * @memberof I.CheckOrder
         * @param text {String | HTML} ��ʾ������
		 * @type function
		 * @public
		 */
        showCalcState: function(text) {
            this.calcTip.setContent(text);
        },
        
        /**
		 * URL��ת
		 * @name goToUrl
		 * @memberof I.CheckOrder
         * @param url {String} ��ת�ĵ�ַ
         * @param delay {Number} �ӳٵ�ʱ��
		 * @type function
		 * @public
		 */
        goToUrl: function(url, delay) {
            Y.later(delay || 3000, this, function() {
                location.href = url || (isDaily ? 'http://trade.daily.taobao.net/trade/itemlist/list_bought_items.htm' : 'http://trade.taobao.com/trade/itemlist/list_bought_items.htm');
            });
        },
        
        /**
		 * ȷ�϶���
		 * @name confirm
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        confirm: function() {
            //��ֹ������÷���ȷ�϶���
            if (formValid && healthValid) {
                if (this.agreeCheck.get('checked')) {
                    this.confirmNode.addClass('confirming');
                    this.returnNode.addClass('hidden');
                    this.errTip.addClass('hidden');
                    //�ύ������
                    I.Form.submitFormData(function(id, r) {
                        //�ύ��ɺ���˱�״̬
                        this.count = 0;
                        this.getCalcState(window['singlePolicy'] ? 1 : (I.Ist.rendered && I.Ist.insurantInfo.all('.ist-list .widget-list').size() || 1));
                    }, this);
                    this.loadingImg.setStyle('display', '');
                    this.showCalcState('<p>���ڴ������У����Ժ�...</p>');
                } else {
                    this.errTip.removeClass('hidden');
                }
            }
        },
        
        /**
		 * �����޸�
		 * @name goBack
		 * @memberof I.CheckOrder
		 * @type function
		 * @public
		 */
        goBack: function() {
            if (I.SwitchPanel.rendered) {
                I.SwitchPanel.switchToPanel('form');
            }
        }
    };
    
    /**
     * ----------------------------------------------------------------------------------------
     *                                   SwitchPanel �л�����
     * ----------------------------------------------------------------------------------------
     */
    
    /**
	 * �л�����ҳ��
	 * @class SwitchPanel
	 * @name SwitchPanel
	 * @memberof I
	 * @type object
	 * @public
	 */
    I.SwitchPanel = {
        
        /**
		 * ģ���Ƿ��Ѿ���Ⱦ
		 * @name rendered
		 * @memberof I.SwitchPanel
		 * @type boolean
		 * @public
		 */
        rendered: false,
        
        /**
		 * ��ʷ���
		 * @name history
		 * @memberof I.SwitchPanel
		 * @type boolean
		 * @public
		 */
        history: null,
        
        /**
		 * ��ǰ����
		 * @name currentPanel
		 * @memberof I.SwitchPanel
		 * @type boolean
		 * @public
		 */
        currentPanel: 'form',
        
        /**
		 * ��ʼ��ģ��
		 * @name init
		 * @memberof I.SwitchPanel
		 * @type function
		 * @public
		 */
        init: function() {
            var that = this;
            Y.on('contentready', function(evt) {
                that.render();
            }, '.flow-content');
        },
        
        /**
		 * ��Ⱦģ��
		 * @name render
		 * @memberof I.SwitchPanel
		 * @type function
		 * @public
		 */
        render: function() {
            var p = Y.all('.flow-content > article'),
                s = p.size(),
                is;
            
            this.iflow = Y.all('.iflow li');
            this.atcs = p;
            this.con = Y.one('.flow-content');
            
            this.panels = {
                'form': p.item(0),
                'health': s < 3 ? null : p.item(1),
                'order': s < 3 ? p.item(1) : p.item(2)
            };
            
            this.unitPrice = parseFloat(this.panels['form'].one('.premium-price').getAttribute('unit-price'), 10).toFixed(2);
            premiumPrice = this.unitPrice;
            
            //���ܲ����ڱ�������
            if (I.Ist.rendered) {
                is = I.Ist.insurantInfo.all('.ist-list .widget-list').size();
                if (is) {
                    premiumPrice = this.unitPrice * is;
                    this.updatePremium('form');
                }
            }
            
            //���������֪ҳ�����ڣ���У���������Ϊtrue
            healthValid = !this.panels['health'];
            
            this.initHistory();
            
            this.rendered = true;
        },
        
        /**
		 * ��ʼ��History���
		 * @name initHistory
		 * @memberof I.SwitchPanel
		 * @type function
		 * @public
		 */
        initHistory: function() {
            var that = this,
                poll = 200,
                timer;
                
            this.history = new Y.History({
                initialState: {
                    step:'form'
                }
            });
            Y.on('history:change', function (e) {
                if (e.src === Y.HistoryHash.SRC_HASH || e.src === Y.HistoryHTML5.SRC_POPSTATE) {
                    if (e.changed && e.newVal.step && that.currentPanel != e.newVal.step) {
                        if (!formValid) {
                            that.history.replace({step:'form'});
                            that.switchToPanel('form');
                        } else if (e.newVal.step != 'form' && !healthValid) {
                            that.history.replace({step:'health'});
                            that.switchToPanel('health');
                        } else {
                            that.switchToPanel(e.newVal.step);
                        }
                    }
                }
                that.fixedIEHistoryTitle();
            });
            
            if (Y.UA.ie) {
                timer = setInterval(function() {
                    poll--;
                    if (that.fixedIEHistoryTitle() || poll <= 0) {
                        clearInterval(timer);
                    }
                }, 50);
            }
        },
        
        /**
		 * Fixed IE�� Title�ı�� Bug
		 * @name fixedIEHistoryTitle
		 * @memberof I.SwitchPanel
		 * @type function
		 * @public
		 */
        fixedIEHistoryTitle: function() {
            var arr;
            
            if (!Y.UA.ie) { return false; } 
            
            arr = document.title.split('#');
            if (arr.length > 1) {
                document.title = arr[0];
                return true;
            }
            
            return false;
        },
        
        /**
		 * ���µ�ǰ����ı���
		 * @name updatePremium
		 * @memberof I.SwitchPanel
         * @param panel {String} �������
		 * @type function
		 * @public
		 */
        updatePremium: function(panel) {
            var p = this.panels[panel];
            
            if (p && typeof premiumPrice !== 'undefined') {
				try {
					p.one('.premium-price').setContent(parseFloat(premiumPrice, 10).toFixed(2));
				} catch (e) {}
            }
        },
        
        /**
		 * �л���һ������ҳ��
		 * @name switchToPanel
		 * @memberof I.SwitchPanel
         * @param panel {String} �������
		 * @type function
		 * @public
		 */
        switchToPanel: function(panel) {
            var p = this.panels[panel],
                valid = false;
            
            if (p && p != this.currentPanel) {
                window.scrollTo(0, 0);
                
                this.con.addClass('flow-content-loading');
                this.iflow.removeClass('cur');
                this.atcs.addClass('hidden');
                this.iflow.item(this.atcs.indexOf(p)).addClass('cur');
                
                this.currentPanel = panel;
                this.history.add({step:panel});
                
                switch (panel) {
                    case 'order':
                        valid = this.switchToOrder(p);
                        break;
                    case 'health':
                        valid = this.switchToHealth(p);
                        break;
                    case 'form':
                        valid = this.switchToForm(p);
                        break;
                    default:
                        valid = false;
                }

                if (!valid) { return false; }
                
                Y.later(500, this, function() {
                    this.updatePremium(panel);
                    p.removeClass('hidden');
                    this.con.removeClass('flow-content-loading');
                });
            }
        },
        
        /**
		 * �л��������˶�ҳ
		 * @name switchToOrder
		 * @memberof I.SwitchPanel
         * @param p {Node} ������� Node�ڵ�
		 * @type function
		 * @public
		 */
        switchToOrder: function(p) {
            p = p || this.panels['order'];
            
            if (formValid && healthValid) {
                if (!I.CheckOrder.rendered) {
                    p.set('innerHTML', p.one('script.buy-view-template').get('innerHTML'));
					var ac = p.one('.announce-content'),
						t;
					if (ac && (t = ac.one('textarea'))) {
						ac.set('innerHTML', t.get('value'));
					}
                    I.CheckOrder.render();
                }
                I.CheckOrder.renderOrder();
                return true;
            }
            return false;
        },
        
        /**
		 * �л���������֪ҳ
		 * @name switchToHealth
		 * @memberof I.SwitchPanel
         * @param p {Node} ������� Node�ڵ�
		 * @type function
		 * @public
		 */
        switchToHealth: function(p) {
            p = p || this.panels['health'];
            
            if (!formValid) { return false; }
            healthValid = false;
            
            if (!I.Health.rendered) {
                p.set('innerHTML', p.one('xmp').get('innerHTML'));
                I.Health.render();
            }
            
            return true;
        },
        
        /**
		 * �л�������дҳ
		 * @name switchToForm
		 * @memberof I.SwitchPanel
         * @param p {Node} ������� Node�ڵ�
		 * @type function
		 * @public
		 */
        switchToForm: function(p) {
            var errBox = Y.one('#submit_error'),
                errList = errBox.one('#J_ErrMsg');
            
            errBox.setStyle('display', 'none');
            errList.empty();
            p = p || this.panels['form'];
            formValid = false;
            healthValid = this.panels['health'] ? false : true;
            return true;
        }
    };
    
}, '0.0.1', {
    requires: ['node', 'event']
});