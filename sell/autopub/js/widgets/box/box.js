/**
 * box.js | cubee ������ؼ� 
 * autohr:bachi@taobao.com
 * @class Y.Box
 * @param { object } ������
 * @return { object } ����һ��boxʵ��
 * @requires { 'node','event','overlay','dd-plugin' }
 * @requires { box-skin-default����box-skin-sea } Ƥ��
 * 
 * Y.Box��	
 *	˵����	���ڹ�������ͨ��new Y.Box��renderһ��box������ʹ��Y.Box�����Լ���alert��comfirm��prompt�ȵ�
 *	ʹ�ã�	new Y.Box(options);
 *	���ã�	head:{string} boxͷ��
 *			body:{string} box���ⲿ��
 *			foot:{string} boxβ��
 *			fixed:{boolean} true,box�������Ŵ��ڹ�����������false��box�����Ŵ��ڹ�����������Ĭ��Ϊtrue��ie6��ʼ�ջ����ҳ�������������
 *			afterDrag:{function} ��ק�����Ļص�������Ϊbox����
 *			draggable:{boolean} �Ƿ����ק,Ĭ��Ϊtrue
 *			resizeable:{boolean} �Ƿ��resize��Ĭ��Ϊfalse
 *			afterResize:{function} resize�����Ļص�������Ϊbox����δʵ�֣�
 *			shownImmediately:{boolean} �Ƿ��ʼ�����������ʾ��Ĭ��Ϊtrue
 *			afterHide:{function} ������Ϻ�Ļص�������Ϊbox
 *			afterShow:{function} ��ʾ��ɺ�Ļص�������Ϊbox
 *			onload:{function} ��ʼ����ɺ�Ļص�����render������ִ�У�����Ϊbox
 *			modal:{boolean} �Ƿ����Ӱ��Ĭ��Ϊfalse����Ӱ�Ķ���Ч��δʵ��
 *			beforeUnload:{function} ���ڹر�֮ǰ�Ļص�,����Ϊbox
 *			afterUnload:{function} ���ڹر�֮��Ļص�,����Ϊbox
 *			antijam:{boolean} �Ƿ�����media�����Ĭ��Ϊfalse
 *			maskOpacity:{float} �趨�ڸǲ��͸���ȣ���Χ��[0,1]��Ĭ��Ϊ0.6����modalΪtrueʱ��������
 *		Y.Box��ʵ���ķ�����
 *			init:��ʼ��������Ϊoptions
 *			bringToTop:��box��z-index��������box֮��
 *			render:��Ⱦ��init��new��ʱ����ã�render����������ʱ����ʱ�̵��ã�����Ϊoptions�����Ա�ɸ���ԭ����
 *			close:�رգ���������ɾ��
 *			hide:���أ�����ɾ������
 *			show:��ʾ����
 *			buildParam:�����������init��ʱ�����
 *			parseParam:�����������render��ʱ�����
 *			addMask:�������
 *			removeMask:ɾ������
 *			hideMedias:����media������
 *			showMedias:���media����������
 *		
 */
YUI.namespace('Y.Box');
YUI.add('box', function (Y) {

	/*
		�����ϰ汾��yui
	*/

	if(typeof Y.Node.prototype.queryAll == 'undefined'){
		Y.Node.prototype.queryAll = Y.Node.prototype.all;
		Y.Node.prototype.query = Y.Node.prototype.one;
		Y.Node.get = Y.Node.one;
		Y.get = Y.one;
	}

	
	/**
     * Y.Box������
     * @class Y.Box
     * @param 
	 */
	Y.Box = function(){
		this.init.apply(this,arguments);
	};
	/**
	 * ȫ�ֵ�overlays�洢
	 * @static { Array }
	 */
	Y.Box.overlays = [];

	Y.Box.prototype = {
		/**
		 * ��ʼ��
		 * @memberof Y.Box
		 * @param { object } ������
		 * @return this
		 */
		init:function(opt){
			var that = this;
			that.buildParam(opt);

			that.overlay = new Y.Overlay({
				contentBox: "myContent",
				height:that.height,
				width:that.width,
				zIndex:10005,
				visible:false,
				shim:true,
				centered:true,
				headerContent: that.head,
				bodyContent: that.body,
				footerContent:that.foot
			});

			Y.Box.overlays.push(that.overlay);
			//����zindex
			that.bringToTop();
			that.overlay._posNode.on('focus',function(e){
				//e.target.blur();
			});
			that.overlay._posNode.on('mousedown',function(e){
				var widget = Y.Widget.getByNode(e.target);
				if (widget && widget instanceof Y.Overlay) {
					that.bringToTop();
					Y.log('bringToTop()');
				}
				Y.Box._xy = widget._posNode.getXY();
			});
			//����afterdrag
			that.overlay._posNode.on('mouseup',function(e){
				var widget = Y.Widget.getByNode(e.target);
				if (widget && widget instanceof Y.Overlay) {
					var _xy =  widget._posNode.getXY();
					if(_xy[0] != Y.Box._xy[0] || _xy[1] != Y.Box._xy[1]){
						that.afterDrag(widget);
						Y.log('��ק����')
					}
				}
			});

			if(that.resizeable){
				that.resize = new Y.Resize({
					node:that.overlay._posNode
				});
			}

			return this;
		},
		/**
		 * ����㼶��ϵ
		 * @memberof Y.Box
		 * @return this
		 */
		bringToTop:function(){
			var that = this;
			if(Y.Box.overlays.length == 1)return;
			var topIndex = 0;
			for(var i = 0;i<Y.Box.overlays.length;i++){
				var t = Number(Y.Box.overlays[i].get('zIndex'));
				if(t > topIndex)topIndex = t;
			}
			that.overlay.set('zIndex',topIndex+1);
			return this;
		},
		/**
		 * ��Ⱦ����
		 * @memberof Y.Box
		 * @param { object }������
		 * @return this
		 */
		render:function(opt){
			var that = this;
			that.parseParam(opt);
			that.overlay.render("#overlay-align");
			var __x = that.overlay.get('x');
			var __y = that.overlay.get('y');
			if(that.height == 'auto' || that.width == 'auto'){
				var _R = that.overlay._posNode.get('region');
				if(that.height == 'auto'){
					__y -= Number(_R.height/2);
				}
				if(that.width == 'auto'){
					if(Y.UA.ie < 7 && Y.UA.ie > 0 ){//hack for ie6 when width was auto
						//that.overlay._posNode.query('div.yui3-widget-bd').setStyle('width','100%');
						that.overlay.set('width',that.overlay._posNode.query('div.yui3-widget-bd').get('region').width);
					}
					if(Y.UA.ie >= 7  ){//hack for ie7 when width was auto
						that.overlay._posNode.query('div.yui3-widget-bd').setStyle('width','100%');
						that.overlay.set('width',that.overlay._posNode.query('div.yui3-widget-bd').get('region').width);
					}
					__x -= Number(that.overlay._posNode.get('region').width/2);
				}
				that.overlay.move([__x,__y]);
			}
			if(that.shownImmediately)that.overlay.set('visible',true);
			if(that.fixed){
				//ie6ʼ����absolute
				if(/6/i.test(Y.UA.ie)){
					that.overlay._posNode.setStyle('position','absolute');
				}else{
					//��fixed����Ҫ��ȥ��������top
					__y -= Y.get('docscrollY').get('scrollTop');
					__x -= Y.get('docscrollX').get('scrollLeft');
					that.overlay.move([__x,__y]);
					that.overlay._posNode.setStyle('position','fixed');
				}
			}
			if(that.x)that.overlay.set('x',Number(that.x));
			if(that.y)that.overlay.set('y',Number(that.y));
			if(that.draggable){
				that.overlay.headerNode.setStyle('cursor','move');
				if(!that.overlay._posNode.dd){
					that.overlay._posNode.plug(Y.Plugin.Drag);
					//Ĭ����ק�κ�λ��
					that.overlay._posNode.dd.addHandle('.yui3-widget-hd');
				}
			}
			that.onload(that);
			//Y.log('load()');
			if(that.modal){
				that.addMask();
			}
			if(that.antijam){
				that.hideMedias();
			}
			if(that.resizeable){
				try {
					var _hd = that.overlay._posNode.query('.yui3-widget-hd');
					var _bd = that.overlay._posNode.query('.yui3-widget-bd');
					var _ft = that.overlay._posNode.query('.yui3-widget-ft');
					that.resize.on('resize:resize',function(e){
						var o_height = that.overlay._posNode.get('region').height;
						var h_height = _hd.get('region').height;
						var f_height = _ft.get('region').height;
						var b_height = o_height - h_height - f_height - 20 - 2;//��ȥbody�������ڱ߾�,��ȥ�߽�
						_bd.setStyle('height',b_height+'px');
					});
				}catch(e){}
			}
			return this;
		},
		/**
		 * ɾ�������Ӧ����base��
		 * @memberof Y.Box
		 * @param { value }ֵ
		 * @param { array }����
		 * @return this
		 */
		removeArray : function(v, a){
			for(var i=0,m=a.length; i<m; i++){
				if(a[i] == v){
					a.splice(i, 1);
					break;
				}
			}
		},
		/**
		 * �رյ���
		 * @method Y.Box.close
		 * @memberof Y.Box
		 * @return this
		 */
		close:function(){
			var that = this;
			that.beforeUnload(that);
			that.overlay.hide();
			that.showMedias();
			that.removeArray(that.overlay,Y.Box.overlays);
			that.overlay._posNode.remove();
			that.removeMask();
			that.afterUnload(that);
			that = null;
			Y.log('close()');
			return this;
		},
		/**
		 * ���ص���
		 * @method Y.Box.hide
		 * @memberof Y.Box
		 * @return this
		 */
		hide:function(){
			var that = this;
			that.overlay.hide();
			that.showMedias();
			that.afterHide(that);
			return this;
		},
		/**
		 * ��ʾ����
		 * @method Y.Box.show
		 * @memberof Y.Box
		 * @return this
		 */
		show:function(){
			var that = this;
			that.overlay.show();
			that.hideMedias();
			that.afterShow(that);
			return this;
		},
		/**
		 * ��������б�
		 * @method Y.Box.buildParam
		 * @memberof Y.Box
		 * @return this
		 */
		buildParam:function(o){
			var o = o || {};
			this.head = (typeof o.head == 'undefined'||o.head == null)?'':o.head;
			this.body= (typeof o.body== 'undefined'||o.body == null)?'':o.body;
			this.foot= (typeof o.foot== 'undefined'|| o.foot ==null)?'':o.foot;
			//this.anim = (typeof o.anim == 'undefined'||o.anim == null)?true:o.anim;
			this.skin = (typeof o.skin== 'undefined'||o.skin== null)?'default':o.skin;
			this.draggable = (typeof o.draggable == 'undefined'||o.draggable == null)?true:o.draggable;
			this.fixed= (typeof o.fixed == 'undefined'||o.fixed == null)?true:o.fixed;
			this.shownImmediately = (typeof o.shownImmediately == 'undefined'||o.shownImmediately == null)?true:o.shownImmediately;
			this.modal= (typeof o.modal == 'undefined'||o.modal == null)?false:o.modal;
			this.maskOpacity= (typeof o.maskOpacity == 'undefined'||o.maskOpacity == null)?0.6:o.maskOpacity;
			this.x= (typeof o.x == 'undefined'||o.x == null)?false:o.x;
			this.y= (typeof o.y == 'undefined'||o.y == null)?false:o.y;
			this.width = (typeof o.width == 'undefined'||o.width == null)?'300px':o.width;
			this.height = (typeof o.height == 'undefined'||o.height == null)?'auto':o.height;
			this.clickToFront= (typeof o.clickToFront == 'undefined'||o.clickToFront == null)?'':o.clickToFront;
			this.behaviours = (typeof o.behaviours == 'undefined'||o.behaviours == null)?'':o.behaviours;
			this.afterHide = (typeof o.afterHide == 'undefined'||o.afterHide == null)?new Function:o.afterHide;
			this.afterDrag= (typeof o.afterDrag == 'undefined'||o.afterDrag == null)?new Function:o.afterDrag;
			this.afterShow = (typeof o.afterShow== 'undefined'|| o.afterShow == null)?new Function:o.afterShow;
			this.beforeUnload = (typeof o.beforeUnload== 'undefined'||o.beforeUnload == null)?new Function:o.beforeUnload;
			this.afterUnload = (typeof o.afterUnload== 'undefined'||o.afterUnload == null)?new Function:o.afterUnload;
			this.onload = (typeof o.onload== 'undefined'||o.onload == null)?new Function:o.onload;//load ok��Ļص�,����Ϊbox
			this.duration = (typeof o.duration == 'undefined'||o.duration == null)?0.3:o.duration;
			this.antijam = (typeof o.antijam == 'undefined'||o.antijam == null)?false:o.antijam;//�Ƿ����ظ�������
			this.resizeable = (typeof o.resizeable == 'undefined'||o.resizeable == null)?false:o.resizeable;//�Ƿ����ظ�������
			
			return this;
		},
		/**
		 * �������
		 * @method Y.Box.parseParam
		 * @memberof Y.Box
		 * @return this
		 */
		parseParam:function(opt){
			var opt = opt || {};
			for(var i in opt){
				this[i] = opt[i];
			}
			return this;
		},
		/**
		 * ���ظ�������
		 * @method Y.Box.hideMedias
		 * @memberof Y.Box
		 * @return this
		 */
		hideMedias:function(){
			var that = this;
			if(that.antijam == false)return this;
			that.hiddenMedia = [];
			var obj_array = document.body.getElementsByTagName('object');
			for(var i=0, m=obj_array.length; i<m; i++){
				if(obj_array[i].type.indexOf("x-oleobject") > 0){
					that.hiddenMedia.push(obj_array[i]);
					obj_array[i].style.visibility = 'hidden';
				}
			}
			return this;
		},
		/**
		 * �رպ�Ľ������
		 * @method Y.Box.showMedias
		 * @memberof Y.Box
		 * @return this
		 */
		showMedias:function(){
			var that = this;
			if(that.antijam == false)return this;
			if(that.hiddenMedia.length > 0){
				for(var i=0, m=that.hiddenMedia.length; i<m; i++){
					that.hiddenMedia[i].style.visibility = 'visible';
				}
				that.hiddenMedia = new Array();
			}
			return this;
		},
		/**
		 * �������
		 * @method Y.Box.addMask
		 * @memberof Y.Box
		 * @return this
		 */
		addMask:function(){
			var that = this;
			if(Y.one('#t-shade-tmp'))return this;
			var node = Y.Node.create('<div id="t-shade-tmp" style="display: block; z-index: 10004;background-color:black;left:0;position:absolute;top:0;width:100%;display:none"></div>');
			node.setStyle('opacity',that.maskOpacity.toString());
			node.setStyle('height',Y.one('body').get('docHeight')+'px');
			Y.one("html").setStyle('overflow','hidden');
			Y.one('body').append(node);
			node.setStyle('display','block');
			return this;
		},
		/**
		 * ɾ������
		 * @method Y.Box.removeMask
		 * @memberof Y.Box
		 * @return this
		 */
		removeMask:function(){
			var that = this;
			if(Y.Box.overlays.length == 0 && Y.one('#t-shade-tmp')){
				Y.one('#t-shade-tmp').remove();
				Y.one("html").setStyle('overflow','');
			}
			return this;
		}
	};//box prototype end

	/**
	 * Y.Box.alert��ʾ�� 
	 * @method Y.Box.alert
	 *	Y.Box.alert��
	 *		˵����	alert�����򣬻���Y.Box��һ�ֶ���
	 *		ʹ�ã�	Y.Box.alert(msg,callback,options)
	 *		������	msg:{string} ��Ϣ��
	 *				callback:{function} ���ȷ���Ļص�������Ϊbox��Ĭ�ϵ��ȷ����رմ���
	 *				options:{
	 *					title:{string} ����
	 *					closeable:{boolean} �Ƿ��йرհ�ť��Ĭ��Ϊtrue
	 *					closeText:{string} �����Զ��尴ť
	 *					btnText:{string} ȷ����ť���İ�
	 *					�������ֶ�ͬY.Box��options��
	 *				}
	 */
	Y.Box.alert = function(msg,callback,opt){
		if(typeof msg == 'undefined'||msg==null)var msg = '';
		if(typeof callback == 'undefined'||callback == null)var callback = new Function;
		if(typeof opt == 'undefined'||opt == null)var opt = {};
		var title = (typeof opt.title == 'undefined'||opt.title == null)?'��ʾ':opt.title;

		var closeable = (typeof opt.closeable == 'undefined'||opt.closeable == null)?true:opt.closeable;
		var closeText = (typeof opt.closeText == 'undefined'||opt.closeText == null)?'<img src="http://img01.taobaocdn.com/tps/i1/T1DeKaXcBxXXXXXXXX-10-10.png" border=0>':opt.closeText;
		var btnText = (typeof opt.btnText == 'undefined'||opt.btnText == null)?'ȷ��':opt.btnText;
		var cdel = (typeof opt.cdel == 'undefined'||opt.cdel == null)?true:opt.cdel;
		
		var closestr = closeable?'<a class="close closebtn">'+closeText+'</a>':'';
		var headstr = '<span class="title">'+title+'</span>'+closestr;
		
		opt.head = headstr;
		opt.body = msg;
		opt.cdel = cdel;
		opt.foot = '<div align=right><button class="okbtn">'+btnText+'</div>';
		opt._onload = opt.onload || new Function;
		opt.onload = function(box){
			var node = box.overlay._posNode;
			node.query('.okbtn').on('click',function(e){
				e.halt();
				callback(box);
				box.close();
			});
			try{
				node.query('.closebtn').setStyle('cursor','pointer');
				node.query('.closebtn').on('click',function(e){
					e.halt();
					if(opt.cdel){
						box.close();
					}else{
						box.hide();
					}
					
				});
			}catch(e){}
			opt._onload(box);
		};

		var box = new Y.Box(opt);
		return box.render();
	};


	/**
	 * Y.Box.confirm
	 * @method Y.Box.confirm
	 *
	 *	Y.Box.confirm��
	 *		˵����	comfirm�����򣬻���Y.Box��һ�ֶ���
	 *		ʹ�ã�	Y.Box.confirm(msg,callback,options)
	 *		������	msg:{string} ��Ϣ��
	 *				callback:{function} ���ȷ���Ļص�������Ϊbox��Ĭ�ϵ��ȷ����رմ���
	 *				options:{
	 *					title:{string} ����
	 *					yes:{function} ����ǵĻص�������Ϊbox��Ĭ�ϵ����رգ�����Ḳ��callback
	 *					no:{function} �����Ļص�������Ϊbox
	 *					yesText:{string} ��ť���ǡ����İ�
	 *					noText:{string} ��ť"��"���İ�
	 *					cancleBtn:{boolean} �Ƿ���ʾ"�ر�"��ť��Ĭ��Ϊtrue
	 *					cancleText:{string} ��ť��ȡ�������İ�
	 *					�������ֶ�ͬY.Box��options��
	 *				}
	 */
	Y.Box.confirm = function(msg,callback,opt){
		if(typeof msg == 'undefined'||msg == null)var msg = '';
		if(typeof callback == 'undefined'||callback == null)var callback = new Function;
		if(typeof opt == 'undefined'||opt == null)var opt = {};
		var title = (typeof opt.title == 'undefined'||opt.title == null)?'��ʾ':opt.title;

		var closeable = (typeof opt.closeable == 'undefined'||opt.closeable == null)?true:opt.closeable;
		var closeText = (typeof opt.closeText == 'undefined'||opt.closeText == null)?'<img src="http://img01.taobaocdn.com/tps/i1/T1DeKaXcBxXXXXXXXX-10-10.png" border=0>':opt.closeText;
			opt.yes = (typeof opt.yes == 'undefined'||opt.yes == null)?callback:opt.yes;
			opt.no= (typeof opt.no == 'undefined' || opt.no == null)?new Function:opt.no;
		var yesText = (typeof opt.yesText == 'undefined' || opt.yesText == null)?'ȷ��':opt.yesText;
		var noText = (typeof opt.noText == 'undefined' || opt.noText == null)?'ȡ��':opt.noText;
		var cancleBtn = (typeof opt.cancleBtn == 'undefined'||opt.cancleBtn == null)?false:opt.cancleBtn;
		var cancleText = (typeof opt.cancleText == 'undefined'||opt.cancleText == null)?'�ر�':opt.cancleText;


		var canclestr = cancleBtn?'<button class="canclebtn">'+cancleText+'</button>':'';
		var closestr = closeable?'<a class="close closebtn">'+closeText+'</a>':'';
		var headstr = '<span class="title">'+title+'</span>'+closestr;
		opt.head = headstr;
		opt.body = msg;
		opt.foot = '<div align=center><button class="yesbtn">'+yesText+'</button>&nbsp;<button class="nobtn">'+noText+'</button>&nbsp;'+canclestr+'</div>';
		opt._onload = opt.onload || new Function;
		opt.onload = function(box){
			var node = box.overlay._posNode;
			node.query('.yesbtn').on('click',function(e){
				e.halt();
				opt.yes(box);
				box.close();
			});
			node.query('.nobtn').on('click',function(e){
				e.halt();
				opt.no(box);
				box.close();
			});
			if(cancleBtn){
				node.query('.canclebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			}
			try{
				node.query('.closebtn').setStyle('cursor','pointer');
				node.query('.closebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			}catch(e){}
			opt._onload(box);
		};

		var box = new Y.Box(opt);
		return box.render();

	};


});
