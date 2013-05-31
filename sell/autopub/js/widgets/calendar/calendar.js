/**
 * calendar.js | cubee �����ؼ�
 * autohr:lijing00333@163.com �γ�
 * @class Y.Calendar
 * @param { string } �������ߴ���id 
 * @param { object } ������
 * @return { object } ����һ��calendarʵ��
 * @requires { 'node' }
 * @requires { calendar-skin-default } Ƥ��
 * 
 * Y.Calenar��	
 *	˵����	������������ͨ��new Y.Calendar��renderһ������
 *	ʹ�ã�	new Y.Calendar(id,options);
 *	����:	id:{string}����id
 *	���ã�	selected {date} ѡ�е�����
 *			mindate:{date} ��С��ѡ����
 *			maxdate:{date} ����ѡ����
 *			popup:{boolean} �Ƿ񵯳���Ĭ��false
 *			closeable:{boolean} �Ƿ�ѡ�رգ�����״̬�������ã���Ĭ��Ϊfalse
 *			range_select:{boolean} �Ƿ�ѡ��Χ��Ĭ��Ϊfalse
 *			range:{start:date,end:date} Ĭ��ѡ��Χ
 *			multi_select:{number} ����ҳ����Ĭ��Ϊ1
 *			withtime:{boolean} �����Ƿ���ʾtimeѡ��Ĭ��Ϊfalse
 *			date:{date} Ĭ����ʾ���������ڵ��·ݣ�Ĭ��Ϊ����
 *			navigator:{boolean} �Ƿ����ѡ����ת���·ݣ�Ĭ��Ϊtrue
 			useShim:{boolean} �Ƿ�ʹ��iframe����,ie6Ĭ�ϼ�����
 *		Y.Calendar��ʵ���ķ�����
 *			init:��ʼ��������Ϊoptions
 *			render:��Ⱦ��init��new��ʱ����ã�render����������ʱ����ʱ�̵��ã�����Ϊoptions�����Ա�ɸ���ԭ����
 *			hide:���أ�����ɾ������
 *			show:��ʾ����
 *		
 */
YUI.namespace('Y.Calendar');
YUI.add('calendar', function (Y) {
	if(typeof Y.Node.prototype.queryAll == 'undefined'){
		Y.Node.prototype.queryAll = Y.Node.prototype.all;
		Y.Node.prototype.query = Y.Node.prototype.one;
		Y.Node.get = Y.Node.one;
		Y.get = Y.one;
	}
	Y.Calendar = function(){
		this.init.apply(this,arguments);
	};
	Y.mix(Y.Calendar,{
		init:function(id,config){
			var that = this;
			that.id = that.C_Id = id;
			that.buildParam(config);
			//�γ�con
			/*
				that.con������������
				that.id   ��������id
				that.C_Id ��Զ��������������ID
			*/
			if(!that.popup){
				that.con = Y.one('#'+id);
			} else {
				var trigger = Y.one('#'+id);
				that.trigger = trigger;
				that.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
				that.con = Y.Node.create('<div id="'+that.C_Id+'"></div>');
				Y.one('body').appendChild(that.con);
				/*
				var _x = trigger.getXY()[0];
				var _y = trigger.getXY()[1]+trigger.get('region').height;
				that.con.setStyle('left',_x.toString()+'px');
				that.con.setStyle('top',_y.toString()+'px');
				*/
				that.con.setStyle('top','0px');
				that.con.setStyle('position','absolute');
				that.con.setStyle('zIndex','1000');
				that.con.setStyle('background','white');
				that.con.setStyle('display','none');
				if(that.useShim){
					that.shim = Y.Node.create('<iframe border="0" frameborder="0" noscroll="yes" width="'+ that.multi_page * 191 +'px" height="193" class="calendar-iframe"></iframe>');
					that.shim.setStyle('position','absolute');
					that.con.insert(that.shim, 'before');
				}
			}
			that.buildEventCenter();
			that.render();
			that.buildEvent();
			return this;
		},
		/**
		 * �������¼�����
		 */
		buildEventCenter:function(){
			var that = this;
			var config = {
				context:that
			};
			var EventFactory = function(){
				this.publish("select",config);
				this.publish("switch",config);
				this.publish("rangeselect",config);
				this.publish("timeselect",config);
				this.publish("selectcomplete",config);
				this.publish("hide",config);//later
				this.publish("show",config);//later
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		/**
		 * �󶨺��� 
		 */
		on:function(type,foo,context,args){
			var that = this;
			that.EventCenter.subscribe(type,foo,context,args);
			return this;
		},
		render:function(o){
			var that = this;
			var o = o || {};
			that.parseParam(o);
			that.ca = [];

			that.con.addClass('c-call clearfix multi-'+that.multi_page);
			that.con.set('innerHTML','');

			for(var i = 0,_oym = [that.year,that.month]; i<that.multi_page;i++){
				if(i == 0){
					var _prev = true;
				}else{
					var _prev = false;
					_oym = that.computeNextMonth(_oym);
				}
				if(i == (that.multi_page - 1)){
					var _next = true;
				}else {
					var _next = false;	
				}
				that.ca.push(new that.Call({
					year:_oym[0],
					month:_oym[1],
					prev_arrow:_prev,
					next_arrow:_next,
					withtime:that.withtime
				},that));

				that.ca[i].render();
				/*
				that.ca[i].renderUI();
				that.con.appendChild(that.ca[i].node);
				that.ca[i].buildEvent();
				*/
			}
			return this;

		},
		/**
		 * ����d���ǰ������ߺ��죬����date
		 */
		showdate:function(n,d){
			var uom = new Date(d-0+n*86400000);
			uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
			return new Date(uom);
		},
		/**
		 * �������������¼�
		 */
		buildEvent:function(){
			var that = this;
			if(!that.popup)return this;
            //�ı䴰�ڴ�С�����¶�λ
            Y.on('resize', function(e) {
                if (that.con.getStyle('display') == 'none') { return; }
                that.setPos();
            }, Y.config.win);
			//����հ�
			//flush event
			for(var i = 0;i<that.EV.length;i++){
				if(typeof that.EV[i] != 'undefined'){
					that.EV[i].detach();
				}
			}
			that.EV[0] = Y.Node.get('document').on('click',function(e){
				if(e.target.get('id') == that.C_Id)return;
				var f = e.target.ancestor(function(node){
					if(node.get('id') == that.C_Id)return true;
					else return false;
				});
				if(typeof f == 'undefined' || f == null){
					that.hide();
				}
			});
			//�������
			/*
				Y.one('#'+that.id) = that.trigger
			*/
			for(var i = 0;i<that.action.length;i++){
				
				that.EV[1] = Y.one('#'+that.id).on(that.action[i],function(e){
					e.halt();
					//���focus��clickͬʱ���ڵ�hack
					//Y.log(e.type);
					var a = that.action;
					if(that.inArray('click',a) && that.inArray('focus',a)){//ͬʱ����
						if(e.type == 'focus'){
							that.toggle();
						}
					}else if(that.inArray('click',a) && !that.inArray('focus',a)){//ֻ��click
						if(e.type == 'click'){
							that.toggle();
						}
					}else if(!that.inArray('click',a) && that.inArray('focus',a)){//ֻ��focus
						setTimeout(function(){//Ϊ������document.onclick�¼�
							that.toggle();
						},170);
					}else {
						that.toggle();
					}
						
				});

			}
			return this;
		},
		toggle:function(){
			var that = this;
			if(that.con.getStyle('display') == 'none'){
				that.show();
			}else{
				that.hide();
			}
		},

		inArray : function(v, a){
			var o = false;
			for(var i=0,m=a.length; i<m; i++){
				if(a[i] == v){
					o = true;
					break;
				}
			}
			return o;
		},

		/**
		 * ��ʾ 
		 */
		show:function(){
			var that = this;
			that.con.setStyle('display','block');
			if(that.useShim && that.popup){
				that.shim.setStyle('display','block');
			}
			that.setPos();
			return this;
		},
		/**
		 * ���� 
		 */
		hide:function(){
			var that = this;
			that.con.setStyle('display','none');
			if(that.useShim && that.popup){
				that.shim.setStyle('display','none');
			}
			return this;
		},
        /**
         * ���ö�λ
         */
        setPos: function() {
            var that = this;
            var _x = that.trigger.getXY()[0];
			var _y = that.trigger.getXY()[1]+that.trigger.get('region').height;
			that.con.setStyle('left',_x.toString()+'px');
			that.con.setStyle('top',_y.toString()+'px');
			if(that.useShim && that.popup){
				that.shim.setStyle('left',_x.toString()+'px');
				that.shim.setStyle('top',_y.toString()+'px');
			}
            return this;
        },
        handleOffset: function() {
            var that = this,
                data = ['��','һ','��','��','��','��','��'],
                temp = '<span>{$day}</span>',
                offset = that.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i - offset + 7) % 7]
                };
            }
            day_html = that.templetShow(temp, a);

            return {
                day_html:day_html
            };
        },
		/**
		 * ���������б�
		 */
		buildParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			that.date = (typeof o.date == 'undefined' || o.date == null)?new Date():o.date;
			that.selected = (typeof o.selected == 'undefined' || o.selected == null)?that.date:o.selected;
			that.multi_page = (typeof o.multi_page == 'undefined' || o.multi_page == null)?1:o.multi_page;
			that.closeable = (typeof o.closeable == 'undefined' || o.closeable == null)?false:o.closeable;
			that.range_select = (typeof o.range_select == 'undefined' || o.range_select == null)?false:o.range_select;
			that.mindate = (typeof o.mindate == 'undefined' || o.mindate == null)?false:o.mindate;
			that.maxdate = (typeof o.maxdate == 'undefined' || o.maxdate == null)?false:o.maxdate;
			that.multi_select = (typeof o.multi_select== 'undefined' || o.multi_select == null)?false:o.multi_select;
			that.navigator = (typeof o.navigator == 'undefined' || o.navigator == null)?true:o.navigator;
			that.arrow_left = (typeof o.arrow_left == 'undefined' || o.arrow_left == null)?false:o.arrow_left;
			that.arrow_right = (typeof o.arrow_right == 'undefined' || o.arrow_right == null)?false:o.arrow_right;
			that.popup = (typeof o.popup == 'undefined' || o.popup== null)?false:o.popup;
			that.withtime = (typeof o.withtime == 'undefined' || o.withtime == null)?false:o.withtime;
			that.startDay = (typeof o.startday == 'undefined' || o.startDay == null)?0:o.startDay;
			that.action = (typeof o.action == 'undefined' || o.action == null)?['click']:o.action;
            if(o.startDay){
				that.startDay = (7 - o.startDay) % 7;
			}
			if(typeof o.useShim !== 'undefined' && o.useShim === true){
				that.useShim = true;	
			}else if(typeof o.useShim !== 'undefined' && o.useShim === false){
				that.useShim = false;	
			}else if(Y.UA.ie === 6){
				that.useShim = true;	
			}else{
				that.useShim = false;
			}
			if(typeof o.range != 'undefined' && o.range != null){
				var s = that.showdate(1,new Date(o.range.start.getFullYear()+'/'+(o.range.start.getMonth()+1)+'/'+(o.range.start.getDate())));
				var e = that.showdate(1,new Date(o.range.end.getFullYear()+'/'+(o.range.end.getMonth()+1)+'/'+(o.range.end.getDate())));
				that.range = {
					start:s,
					end:e
				};
				//alert(Y.dump(that.range));
			}else {
				that.range = {
					start:null,
					end:null
				};
			}
			that.EV = [];
			return this;
		},

		/**
		 * ���˲����б�
		 */
		parseParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				that[i] = o[i];
			}
			that.handleDate();
			return this;
		},
		/**
		 * �õ�ĳ���ж�����,��Ҫ���������ж�����
		 */
		getNumOfDays:function(year,month){
			return 32-new Date(year,month-1,32).getDate();
		},

		/**
		 * ģ�庯����Ӧ����base�� 
		 */
		templetShow : function(templet, data){
			var that = this;
			if(data instanceof Array){
				var str_in = '';
				for(var i = 0;i<data.length;i++){
					str_in += that.templetShow(templet,data[i]);
				}
				templet = str_in;
			}else{
				var value_s = templet.match(/{\$(.*?)}/g);
				if(data !== undefined && value_s != null){
					for(var i=0, m=value_s.length; i<m; i++){
						var par = value_s[i].replace(/({\$)|}/g, '');
						value = (data[par] !== undefined) ? data[par] : '';
						templet = templet.replace(value_s[i], value);
					}
				}
			}
			return templet;
		},
		/**
		 * ��������
		 */
		handleDate:function(){
			/*
			that.month
			that.year
			that.selected
			that.mindate
			that.maxdate
			*/
			var that = this;
			var date = that.date;
			that.weekday= date.getDay() + 1;//���ڼ� //ָ�����������ڼ�
			that.day = date.getDate();//����
			that.month = date.getMonth();//�·�
			that.year = date.getFullYear();//���
			return this;
		},
		//get����
		getHeadStr:function(year,month){
			return year.toString() + '��' + (Number(month)+1).toString() + '��';
		},
		//�¼�
		monthAdd:function(){
			var that = this;
			if(that.month == 11){
				that.year++;
				that.month = 0;
			}else{
				that.month++;
			}
			that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/1');
			return this;
		},
		//�¼�
		monthMinus:function(){
			var that = this;
			if(that.month == 0){
				that.year-- ;
				that.month = 11;
			}else{
				that.month--;
			}
			that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/1');
			return this;
		},
		//������һ���µ�����,[2009,11],��:fullYear����:��0��ʼ����
		computeNextMonth:function(a){
			var that = this;
			var _year = a[0];
			var _month = a[1];
			if(_month == 11){
				_year++;
				_month = 0;
			}else{
				_month++;
			}
			return [_year,_month];
		},
		//�����ͷ
		handleArrow:function(){

		},
		//�õ���Χ
		getRange:function(){

		},
		//�õ���ǰѡ��
		getSelect:function(){

		},
		//������ʼ����,d:Date����
		handleRange : function(d){
			var that = this;
			if((that.range.start == null && that.range.end == null )||(that.range.start != null && that.range.end != null)){
				that.range.start = d;
				that.range.end = null;
				that.render();
			}else if(that.range.start != null && that.range.end == null){
				that.range.end = d;
				if(that.range.start.getTime() > that.range.end.getTime()){
					var __t = that.range.start;
					that.range.start = that.range.end;
					that.range.end = __t;
				}
				that.EventCenter.fire('rangeselect',that.range);
				that.render();
			}
			return this;
		},
		//constructor 
		/**
		 * TimeSelectorֻ֧��ѡ�񣬲�֧�ֳ�ʼ��
		 */
		TimeSelector:function(ft,fathor){
			//����------------------
			this.fathor = fathor;
			this.fcon = ft.ancestor('.c-box');//cc����
			this.popupannel = this.fcon.query('.selectime');//��ѡʱ��ĵ�����
			if(typeof fathor._time == 'undefined'){//ȷ����ʼֵ�͵�ǰʱ��һ��
				fathor._time = new Date();
			}
			this.time = fathor._time;
			this.status = 's';//��ǰѡ���״̬��'h','m','s'�����жϸ����ĸ�ֵ
			this.ctime = Y.Node.create('<div class="c-time">ʱ�䣺<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
			this.button = Y.Node.create('<button class="ct-ok">ȷ��</button>');
			//Сʱ
			this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
			//����
			this.m_a = ['00','10','20','30','40','50'];
			//��
			this.s_a = ['00','10','20','30','40','50'];
					

			//�ӿ�----------------
			/**
			 * ������Ӧ������html��ֵ��������a��
			 * ������Ҫƴװ������
			 * ���أ�ƴ�õ�innerHTML,��β��Ҫ��һ���رյ�a
			 * 
			 */
			this.parseSubHtml = function(a){
				var in_str = '';
				for(var i = 0;i<a.length;i++){
					in_str += '<a href="javascript:void(0);" class="item">'+a[i]+'</a>';
				}
				in_str += '<a href="javascript:void(0);" class="x">x</a>';
				return in_str;
			};
			/**
			 * ��ʾselectime����
			 * ����������õ�innerHTML
			 */
			this.showPopup= function(instr){
				var that = this;
				this.popupannel.set('innerHTML',instr);
				this.popupannel.removeClass('hidden');
				var status = that.status;
				var _con = that.ctime;
				that.ctime.queryAll('span').removeClass('on');
				switch(status){
					case 'h':
						that.ctime.query('.h').addClass('on');
						break;
					case 'm':
						that.ctime.query('.m').addClass('on');
						break;
					case 's':
						that.ctime.query('.s').addClass('on');
						break;
				}
			};
			/**
			 * ����selectime����
			 */
			this.hidePopup= function(){
				this.popupannel.addClass('hidden');
			};
			/**
			 * ������������������ļ��裬��������time��ʾ����
			 */
			this.render = function(){
				var that = this;
				var h = that.get('h');
				var m = that.get('m');
				var s = that.get('s');
				that.fathor._time = that.time;
				that.ctime.query('.h').set('innerHTML',h);
				that.ctime.query('.m').set('innerHTML',m);
				that.ctime.query('.s').set('innerHTML',s);
				return that;
			};
			//�����set��get��ֻ�Ƕ�time�Ĳ��������������������������
			/**
			 * set(status,v)
			 * h:2,'2'
			 */
			this.set = function(status,v){
				var that = this;
				var v = Number(v);
				switch(status){
					case 'h':
						that.time.setHours(v);
						break;
					case 'm':
						that.time.setMinutes(v);
						break;
					case 's':
						that.time.setSeconds(v);
						break;
				}
				that.render();
			};
			/**
			 * get(status)
			 */
			this.get = function(status){
				var that = this;
				var time = that.time;
				switch(status){
					case 'h':
						return time.getHours();
						break;
					case 'm':
						return time.getMinutes();
						break;
					case 's':
						return time.getSeconds();
						break;
				}
			};

			/**
			 * add()
			 * ״ֵ̬����ı�����1
			 */
			this.add = function(){
				var that = this;
				var status = that.status;
				var v = that.get(status);
				v++;
				that.set(status,v);
			};
			/**
			 * minus()
			 * ״ֵ̬����ı�����1
			 */
			this.minus= function(){
				var that = this;
				var status = that.status;
				var v = that.get(status);
				v--;
				that.set(status,v);
			};
			

			
			//����---------
			this.init = function(){
				var that = this;
				ft.set('innerHTML','').append(that.ctime);
				ft.append(that.button);
				that.render();
				that.popupannel.on('click',function(e){
					var el = e.target;
					if(el.hasClass('x')){//�ر�
						that.hidePopup();
						return;
					}else if(el.hasClass('item')){//��ѡһ��ֵ
						var v = Number(el.get('innerHTML'));
						that.set(that.status,v);
						that.hidePopup();
						return;
					}
				});
				//ȷ���Ķ���
				that.button.on('click',function(e){
					var d = typeof that.fathor.dt_date == 'undefined'?that.fathor.date:that.fathor.dt_date;
					d.setHours(that.get('h'));
					d.setMinutes(that.get('m'));
					d.setSeconds(that.get('s'));
					that.fathor.EventCenter.fire('timeselect',d);
					if(that.fathor.popup && that.fathor.closeable){
						that.fathor.hide();
					}
				});
				//ctime�ϵļ����¼������¼������Ҽ��ļ���
				//TODO �����Ƿ�ȥ��
				that.ctime.on('keyup',function(e){
					if(e.keyCode == 38 || e.keyCode == 37){//up or left
						e.halt();
						that.add();
					}
					if(e.keyCode == 40 || e.keyCode == 39){//down or right
						e.halt();
						that.minus();
					}
				});
				//�ϵļ�ͷ����
				that.ctime.query('.u').on('click',function(e){
					that.hidePopup();
					that.add();
				});
				//�µļ�ͷ����
				that.ctime.query('.d').on('click',function(e){
					that.hidePopup();
					that.minus();
				});
				//����ѡ��Сʱ
				that.ctime.query('.h').on('click',function(e){
					var in_str = that.parseSubHtml(that.h_a);
					that.status = 'h';
					that.showPopup(in_str);
				});
				//����ѡ�����
				that.ctime.query('.m').on('click',function(e){
					var in_str = that.parseSubHtml(that.m_a);
					that.status = 'm';
					that.showPopup(in_str);
				});
				//����ѡ����
				that.ctime.query('.s').on('click',function(e){
					var in_str = that.parseSubHtml(that.s_a);
					that.status = 's';
					that.showPopup(in_str);
				});
				


			};
			this.init();


		},
		//constructor
		/**
		 * ������������
		 * @constructor Y.Calendar.prototype.Call
		 * @param {object} config ,�����б���Ҫָ�����������������
		 * @param {object} fathor,ָ��Y.Calendarʵ����ָ�룬��Ҫ������Ĳ���
		 * @return ��������ʵ��
		 */
		Call:function(config,fathor){
			//����
			this.fathor = fathor;
			this.month = Number(config.month);
			this.year = Number(config.year);
			this.prev_arrow = config.prev_arrow;
			this.next_arrow = config.next_arrow;
			this.node = null;
			this.timmer = null;//ʱ��ѡ���ʵ��
			this.id = '';
			this.EV = [];
			this.html = [
				'<div class="c-box" id="{$id}">',
					'<div class="c-hd">', 
						'<a href="javascript:void(0);" class="prev {$prev}"><</a>',
						'<a href="javascript:void(0);" class="title">{$title}</a>',
						'<a href="javascript:void(0);" class="next {$next}">></a>',
					'</div>',
					'<div class="c-bd">',
						'<div class="whd">',
							/*
							'<span>��</span>',
							'<span>һ</span>',
							'<span>��</span>',
							'<span>��</span>',
							'<span>��</span>',
							'<span>��</span>',
							'<span>��</span>',
							*/
							fathor.handleOffset().day_html,
						'</div>',
						'<div class="dbd clearfix">',
							'{$ds}',
							/*
							<a href="" class="null">1</a>
							<a href="" class="disabled">3</a>
							<a href="" class="selected">1</a>
							<a href="" class="today">1</a>
							<a href="">1</a>
						*/
						'</div>',
					'</div>',
					'<div class="setime hidden">',
					'</div>',
					'<div class="c-ft {$showtime}">',
						'<div class="c-time">',
							'ʱ�䣺00:00 	&hearts;',
						'</div>',
					'</div>',
					'<div class="selectime hidden"><!--���Դ�ŵ�ѡʱ���һЩ�ؼ�ֵ-->',
					'</div>',
				'</div><!--#c-box-->'
			].join("");
			this.nav_html = [
					'<p>',
					'��',
						'<select value="{$the_month}">',
							'<option class="m1" value="1">01</option>',
							'<option class="m2" value="2">02</option>',
							'<option class="m3" value="3">03</option>',
							'<option class="m4" value="4">04</option>',
							'<option class="m5" value="5">05</option>',
							'<option class="m6" value="6">06</option>',
							'<option class="m7" value="7">07</option>',
							'<option class="m8" value="8">08</option>',
							'<option class="m9" value="9">09</option>',
							'<option class="m10" value="10">10</option>',
							'<option class="m11" value="11">11</option>',
							'<option class="m12" value="12">12</option>',
						'</select>',
					'</p>',
					'<p>',
					'��',
						'<input type="text" value="{$the_year}" onfocus="this.select()"></input>',
					'</p>',
					'<p>',
						'<button class="ok">ȷ��</button><button class="cancel">ȡ��</button>',
					'</p>'
			].join("");

            //���õ����ݸ�ʽ����֤
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n))return false;
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n))return false;
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
                        if (!/^\d+$/i.test(n))return false;
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };

            };


			//����
			/**
			 * ��Ⱦ��������UI
			 */
			this.renderUI = function(){
				var cc = this;
				cc.HTML = '';
				var _o = {};
				_o.prev = '';
				_o.next = '';
				_o.title = '';
				_o.ds = '';
				if(!cc.prev_arrow){
					_o.prev = 'hidden';
				}
				if(!cc.next_arrow){
					_o.next = 'hidden';
				}
				if(!cc.fathor.showtime){
					_o.showtime = 'hidden';
				}
				_o.id = cc.id = 'cc-'+Math.random().toString().replace(/.\./i,'');
				_o.title = cc.fathor.getHeadStr(cc.year,cc.month);
				cc.createDS();
				_o.ds = cc.ds;
				//cc.node = Y.Node.create(cc.fathor.templetShow(cc.html,_o));
				cc.fathor.con.appendChild(Y.Node.create(cc.fathor.templetShow(cc.html,_o)));
				cc.node = Y.one('#'+cc.id);
				if(cc.fathor.withtime){
					var ft = cc.node.query('.c-ft');
					ft.removeClass('hidden');
					cc.timmer = new cc.fathor.TimeSelector(ft,cc.fathor);
				}
				return this;
			};
			/**
			 * �������������¼�
			 */
			this.buildEvent = function(){
				var cc = this;
				var con = Y.one('#'+cc.id);
				//flush event
				for(var i = 0;i<cc.EV.length;i++){
					if(typeof cc.EV[i] != 'undefined'){
						cc.EV[i].detach();
					}
				}
				cc.EV[0] = con.query('div.dbd').on('click',function(e){
					e.halt();
					if(e.target.hasClass('null'))return;
					if(e.target.hasClass('disabled'))return;
					var selectedd = Number(e.target.get('innerHTML'));
					var d = new Date(cc.year+'/'+Number(cc.month+1)+'/'+selectedd);
					/*
					d.setYear(cc.year);
					d.setMonth(cc.month);
					d.setDate(selectedd);
					*/
					//that.callback(d);
					//datetime��date
					cc.fathor.dt_date = d;
					cc.fathor.EventCenter.fire('select',d);
					if(cc.fathor.popup && cc.fathor.closeable){
						cc.fathor.hide();
					}
					if(cc.fathor.range_select){
						cc.fathor.handleRange(d);
					}
					cc.fathor.render({selected:d});
				});
				//��ǰ
				cc.EV[1] = con.query('a.prev').on('click',function(e){
					e.halt();
					cc.fathor.monthMinus().render();
					cc.fathor.EventCenter.fire('switch',new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
				});
				//���
				cc.EV[2] = con.query('a.next').on('click',function(e){
					e.halt();
					cc.fathor.monthAdd().render();
					cc.fathor.EventCenter.fire('switch',new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
				});
				if(cc.fathor.navigator){
					cc.EV[3] = con.query('a.title').on('click',function(e){
						e.halt();
						try{
							cc.timmer.hidePopup();
						}catch(e){}
						var setime_node = con.query('.setime');
						setime_node.set('innerHTML','');
						var in_str = cc.fathor.templetShow(cc.nav_html,{
							the_month:cc.month+1,
							the_year:cc.year
						});
						setime_node.set('innerHTML',in_str);
						setime_node.removeClass('hidden');
						con.query('input').on('keydown',function(e){
							var _month = con.one('.setime select').get('value');
							var _year  = con.one('.setime input').get('value');
							if(e.keyCode == 38){//up
								if (!cc.Verify().isYear(_year))return;
                                if (!cc.Verify().isMonth(_month))return;
								e.target.set('value',Number(e.target.get('value'))+1);
								e.target.select();
							}
							if(e.keyCode == 40){//down
								if (!cc.Verify().isYear(_year))return;
                                if (!cc.Verify().isMonth(_month))return;
								e.target.set('value',Number(e.target.get('value'))-1);
								e.target.select();
							}
							if(e.keyCode == 13){//enter
								con.query('.setime').addClass('hidden');
								if (!cc.Verify().isYear(_year))return;
                                if (!cc.Verify().isMonth(_month))return;
								cc.fathor.render({
									date:new Date(_year+'/'+_month+'/01')
								})
								cc.fathor.EventCenter.fire('switch',new Date(_year+'/'+_month+'/01'));
							}
						});
					});
					cc.EV[4] = con.query('.setime').on('click',function(e){
						e.halt();
						if(e.target.hasClass('ok')){
							var _month = con.query('.setime').query('select').get('value');
							var _year  = con.query('.setime').query('input').get('value');
							con.query('.setime').addClass('hidden');
							if (!cc.Verify().isYear(_year))return;
                            if (!cc.Verify().isMonth(_month))return;
							cc.fathor.render({
								date:new Date(_year+'/'+_month+'/01')
							})
							cc.fathor.EventCenter.fire('switch',new Date(_year+'/'+_month+'/01'));
						}else if(e.target.hasClass('cancel')){
							con.query('.setime').addClass('hidden');
						}
					});
				}
				return this;

			};
			/**
			 * �õ���ǰ��������node����
			 */
			this.getNode = function(){
				var cc = this;
				return cc.node;
			};
			/**
			 * �������ڵ�html
			 */
			this.createDS = function(){
				var cc = this;
				var s = '';
				var startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + cc.fathor.startDay + 7) % 7;//���µ�һ�������ڼ�
				var k = cc.fathor.getNumOfDays(cc.year,cc.month + 1) + startweekday;
				
				for(var i = 0;i< k;i++){
					//prepare data {{
					if(/532/.test(Y.UA.webkit)){//hack for chrome
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					}else {
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+2-startweekday).toString());
					}
					var _td_e = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					//prepare data }}
					if(i < startweekday){//null
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}else if( cc.fathor.mindate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+2-startweekday)).getTime() < (cc.fathor.mindate.getTime()+1)  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';
						
					}else if(cc.fathor.maxdate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+1-startweekday)).getTime() > cc.fathor.maxdate.getTime()  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';


					}else if((cc.fathor.range.start != null && cc.fathor.range.end != null) //����ѡ��Χ
								&& (
									_td_s.getTime()>=cc.fathor.showdate(1,cc.fathor.range.start).getTime() 
										&& _td_e.getTime() < cc.fathor.showdate(1,cc.fathor.range.end).getTime()) ){
								
								//alert(Y.dump(_td_s.getDate()));
								
							if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//���첢��ѡ��
								s+='<a href="javascript:void(0);" class="range today">'+(i - startweekday + 1)+'</a>';
							}else{
								s+= '<a href="javascript:void(0);" class="range">'+(i - startweekday + 1)+'</a>';
							}

					}else if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//today
						s += '<a href="javascript:void(0);" class="today">'+(i - startweekday + 1)+'</a>';

					}else if(i == (startweekday + cc.fathor.selected.getDate() - 1) 
								&& cc.month == cc.fathor.selected.getMonth() 
								&& cc.year == cc.fathor.selected.getFullYear()){//selected
						s += '<a href="javascript:void(0);" class="selected">'+(i - startweekday + 1)+'</a>';
					}else{//other
						s += '<a href="javascript:void(0);">'+(i - startweekday + 1)+'</a>';
					}
				}
				if(k%7 != 0){
					for(var i = 0;i<(7-k%7);i++){
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}
				}
				cc.ds = s;
				return this;
			};
			/**
			 * ��Ⱦ 
			 */
			this.render = function(){
				var cc = this;
				cc.renderUI();
				cc.buildEvent();
				return this;
			};


		}//Call constructor over
		
	},0,null,4);

},'3.0.0',{requires:['node']});

