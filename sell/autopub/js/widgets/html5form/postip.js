/**
 *��Զ�λ��ʾ��Ϣ����������ʾ,֧�ֱ��ύhtml5form���<br/>
 *�����ʾ��������ͨ��new Y.Postip��renderһ��tip������ʹ��Y.Postip����tip���ַ�ʽ��tip���ݡ�tip��λ��<br/>
 *ʹ��new Y.Postip(options);<br/>
 *@module postip
 *@class Y.Postip
 *@constructor
 *@param {string|nodes|node} id ��λ��������,������ʽ��'.J-tip',Y.all('.J-tip'),Y.one('.J-tip')
 *@param {object} config ��ʼ������
 *<ul>
 *<li>pos.h:(string) �����ʾ��ˮƽ���뷽ʽ��Ĭ�� left��(oleft,left,center,right,oright,������ֵ��ѡ)</li>
 *<li>pos.v:(string) �����ʾ�Ĵ�ֱ���뷽ʽ��Ĭ�� top��(otop,top,middle,bottom,obottom,������ֵ��ѡ)</li>
 *<li>classname:(string) ��Ե�������ʽ���ã�Ĭ��Ϊ .postip</li>
 *<li>content:(string) ��Ե������������ã���δ���Ϊ��ʱ������Ϊ������relֵ��������innerHTML</li>
 *<li>otip:(object) Ĭ��js�ṹ��һ��tip��ָ��otip�����tipΪotip����</li>
 *</ul>
 */
YUI.namespace('Y.FormPostip');
YUI.add('form-postip',function(Y){
	Y.FormPostip = function(){
		this.init.apply(this,arguments);
		Y.FormPostip._instances[Y.stamp(this)] = this;
	};
	Y.FormPostip._instances = {};
	/**
	 * ���¶�λ������ʾ��
	 * @method reposAllTip
	 */
	Y.FormPostip.reposAllTip = function() {
		Y.Object.each(Y.FormPostip._instances, function(item) {
			if (item.get('show')) {
				item.reposTip();
			}
		});
	};
	
	Y.mix(Y.FormPostip,{
		init:function(config){
			var that = this;
			that.relElem = null;
			that.config = config;
			that.isShow = false;
			//��Ⱦ������
			that.render();
			//���쵯����
			that.buildTip();
			that.bindEvent();
			return this;
		},
		buildTip:function(){
			var that = this;
			if(that.oTip)return;
			if(typeof that.Tip == 'undifined' || that.Tip == null){
				var tip = Y.Node.create('<div class="J-tip" style="visibility:hidden;display:inline-block;position:absolute;z-index:1000;top:0"><div class="J-tipbox '+that.oTipclass+'">'+that.content+'</div></div>');
				Y.one('body').appendChild(tip);
				that.oTip = tip;
			}else if(typeof that.Tip == 'object'){
				that.oTip = that.Tip;
			}
			//IE6�������ظ��Ų�
			if(/6/i.test(Y.UA.ie)){
				that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
				that.mark.setStyles({
					'width':that.oTip.get('region').width+'px',
					'height':that.oTip.get('region').height+'px'
				});
				that.oTip.appendChild(that.mark);
			}
			return this;
		},
		/**
		 *�����������init��ʱ�����
		 *@method buildParam
		 *@return this
		 */
		buildParam:function(o){
			var that = this;
			//��������
			var o = (typeof o == 'undefined' || o == null)?{}:o;

			//����¼�����
			that.eventype = (typeof o.eventype=='undifined' || o.eventype==null)?'mouseover':o.eventype;
			that.mouseout = (typeof o.mouseout=='undifined' || o.mouseout==null)?true:false;
			//����Tip���뷽ʽ
			that.pos = (typeof o.pos == 'undefined' || o.pos == null)?{}:o;
			if(o.pos){
				//���Ϊ��ֵʱ��Ϊ�Զ���λ��
				that.pos.hAlign = (typeof o.pos.h=='undifined' || o.pos.h==null)?'left':o.pos.h;
				that.pos.vAlign = (typeof o.pos.v=='undifined' || o.pos.v==null)?'bottom':o.pos.v;
			}
			that.oTipclass = (typeof o.classname=='undifined' || o.classname==null)?'postip':o.classname;
			that.content = (typeof o.content=='undifined' || o.content==null) ? '' : o.content;
			that.Tip = o.otip;
			return this;
		},
		/**
		 *��Ⱦ��init��new��ʱ����ã�render����������ʱ����ʱ�̵��ã�����Ϊoptions�����Ա�ɸ���ԭ����
		 *@method render
		 *@param {object} o ͬ���캯��������config
		 *@return this
		 */
		render:function(o){
			var that = this;
			that.parseParam(o);
			return this;
		},
		/**
		 *���¼�����������������С�����������ֹ�¼�
		 *@method bindEvent 
		 *@return this
		 */
		bindEvent:function(){
			var that = this;
			that.resizeEvent = Y.on('resize', function(e){
				that.reposTip();
			},window);	
			that.oTip.on('click',function(e){
				e.stopPropagation();
			});
			return this;
		},
		//���˲����б�
		parseParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				that.config[i] = o[i];
			}
			that.buildParam(that.config);
			return this;
		}, 
		/**
		 *��Ⱦ����ʾUIȷ����ʾ��λ
		 *@method rendTipUI
		 *@param {node} el ��Զ�λ�ڵ�
		 *@param {string} tipcon ��ȡ��λ��ʾ����		 
		 *@return this
		 */
		rendTipUI:function(el,con){
			this.oTip.one('.J-tipbox').set('innerHTML',con);
			this.posTip(el);
			this.relElem = el;
			if(/6/i.test(Y.UA.ie)){
				this.mark.setStyle('height',this.oTip.get('clientHeight') + 'px');
				this.mark.setStyle('width',this.oTip.get('clientWidth') + 'px');
			}
			this.show();
			return this;
		},
		/**
		 *���¶�λ��Ե����㣬����Ϊ��������
		 *@method posTip
		 *@param {object} o ͬ���캯��config����
		 *@return this
		 */
		posTip:function(o){
			var	that = this
			var _left,_top;	  
			_left = that.getLeft(that.pos.hAlign,o,that.oTip);
			_top = that.getTop(that.pos.vAlign,o,that.oTip);						
			that.oTip.setStyles({
				'left':_left+'px',
				'top':_top+'px'
			});
			//IE6�����ظ����ﲢ��λiframe
			return this;
		},
		/**
		 * ���¶�λ��ʾ��
		 * @method reposTip
		 * @return this
		 */
		reposTip: function() {
			var that = this;
			if (that.relElem) {
				that.posTip(that.relElem);
			}
			return this;
		},

		/**
		 *��������ʾ������ڴ��������߾࣬����Ϊ(pos.h,������,�����ʾ��)
		 *@method getLeft
		 *@param {string} a ��λ���ˮƽ����pos.h�磺'oleft','left','center','right','oright'
		 *@param {object} o ������
		 *@param {object} e �����ʾ��
		 *@return this
		 */
		getLeft:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			//���Ϊ��ֵ
			if(!isNaN(parseInt(Number(a)))){
				return cget[0] + Number(a);
			}else{
				switch(a){
					case 'oleft': 
						return cget[0] - eget.width;
					case 'oright':
						return cget[0] + cget.width;
					case 'center':
						return cget[0] + (cget.width - eget.width)/2;
					case 'right':
						return cget[0] + cget.width - eget.width;
					default:
						return cget[0];				
				}
			}
			return this;
		},
		/**
		 *��������ʾ������ڴ�����Ķ��߾࣬����Ϊ(pos.v,������,�����ʾ��)
		 *@method getTop
		 *@param {string} a ��λ��Դ�ֱ����pos.v�磺'otop','top','middle','bottom','obottom'
		 *@param {object} o ������
		 *@param {object} e �����ʾ��
		 *@return this
		 */
		getTop:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			if(!isNaN(parseInt(Number(a)))){
				return cget[1] + Number(a);
			}else{
				switch(a){
					case 'otop': 
						return cget[1] - eget.height;
					case 'obottom':
						return cget[1] + cget.height;
					case 'middle':
						return cget[1] + (cget.height - eget.height)/2;
					case 'bottom':
						return cget[1] + cget.height - eget.height;
					default:
						return cget[1];				
				}
			}
			return this;
		},
		/**
		 *���Ƶ�������ʾ
		 *@method show
		 *@return this
		 */
		show:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible')return;
			that.oTip.setStyle('visibility','visible');
			return this;
		},
		/**
		 *���Ƶ���������
		 *@method hide
		 *@return this
		 */
		hide:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible'){
				that.oTip.setStyle('visibility','hidden');	
			};
			return this;
		},
		/**
		 * �ж��Ƿ�ǰ��ʾ
		 * @method get
		 * @param {String} attr show
		 * @return {Boolean}
		 */
		get:function(attr){
			if(attr == 'show'){
				return this.oTip.getStyle('visibility') == 'visible'; 
			}
			return null;
		},
		/**
		 * ��_instances������ɾ��ʵ��
		 * @method destroy
		 */
		destroy: function() {
			delete Y.FormPostip._instances[Y.stamp(this)];
			this.oTip.remove(true);
			this.resizeEvent.detach();
		}
		
	},0,null,4);

	//Y.FormPostip = FormPostip;
	
},'',{requires:['node']});
