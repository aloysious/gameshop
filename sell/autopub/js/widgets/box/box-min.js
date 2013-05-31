
YUI.namespace('Y.Box');YUI.add('box',function(Y){if(typeof Y.Node.prototype.queryAll=='undefined'){Y.Node.prototype.queryAll=Y.Node.prototype.all;Y.Node.prototype.query=Y.Node.prototype.one;Y.Node.get=Y.Node.one;Y.get=Y.one;}
Y.Box=function(){this.init.apply(this,arguments);};Y.Box.overlays=[];Y.Box.prototype={init:function(opt){var that=this;that.buildParam(opt);that.overlay=new Y.Overlay({contentBox:"myContent",height:that.height,width:that.width,zIndex:10005,visible:false,shim:true,centered:true,headerContent:that.head,bodyContent:that.body,footerContent:that.foot});Y.Box.overlays.push(that.overlay);that.bringToTop();that.overlay._posNode.on('focus',function(e){});that.overlay._posNode.on('mousedown',function(e){var widget=Y.Widget.getByNode(e.target);if(widget&&widget instanceof Y.Overlay){that.bringToTop();Y.log('bringToTop()');}
Y.Box._xy=widget._posNode.getXY();});that.overlay._posNode.on('mouseup',function(e){var widget=Y.Widget.getByNode(e.target);if(widget&&widget instanceof Y.Overlay){var _xy=widget._posNode.getXY();if(_xy[0]!=Y.Box._xy[0]||_xy[1]!=Y.Box._xy[1]){that.afterDrag(widget);Y.log('\u62d6\u62fd\u7ed3\u675f')}}});if(that.resizeable){that.resize=new Y.Resize({node:that.overlay._posNode});}
return this;},bringToTop:function(){var that=this;if(Y.Box.overlays.length==1)return;var topIndex=0;for(var i=0;i<Y.Box.overlays.length;i++){var t=Number(Y.Box.overlays[i].get('zIndex'));if(t>topIndex)topIndex=t;}
that.overlay.set('zIndex',topIndex+1);return this;},render:function(opt){var that=this;that.parseParam(opt);that.overlay.render("#overlay-align");var __x=that.overlay.get('x');var __y=that.overlay.get('y');if(that.height=='auto'||that.width=='auto'){var _R=that.overlay._posNode.get('region');if(that.height=='auto'){__y-=Number(_R.height/2);}
if(that.width=='auto'){if(Y.UA.ie<7&&Y.UA.ie>0){that.overlay.set('width',that.overlay._posNode.query('div.yui3-widget-bd').get('region').width);}
if(Y.UA.ie>=7){that.overlay._posNode.query('div.yui3-widget-bd').setStyle('width','100%');that.overlay.set('width',that.overlay._posNode.query('div.yui3-widget-bd').get('region').width);}
__x-=Number(that.overlay._posNode.get('region').width/2);}
that.overlay.move([__x,__y]);}
if(that.shownImmediately)that.overlay.set('visible',true);if(that.fixed){if(/6/i.test(Y.UA.ie)){that.overlay._posNode.setStyle('position','absolute');}else{__y-=Y.get('docscrollY').get('scrollTop');__x-=Y.get('docscrollX').get('scrollLeft');that.overlay.move([__x,__y]);that.overlay._posNode.setStyle('position','fixed');}}
if(that.x)that.overlay.set('x',Number(that.x));if(that.y)that.overlay.set('y',Number(that.y));if(that.draggable){that.overlay.headerNode.setStyle('cursor','move');if(!that.overlay._posNode.dd){that.overlay._posNode.plug(Y.Plugin.Drag);that.overlay._posNode.dd.addHandle('.yui3-widget-hd');}}
that.onload(that);if(that.modal){that.addMask();}
if(that.antijam){that.hideMedias();}
if(that.resizeable){try{var _hd=that.overlay._posNode.query('.yui3-widget-hd');var _bd=that.overlay._posNode.query('.yui3-widget-bd');var _ft=that.overlay._posNode.query('.yui3-widget-ft');that.resize.on('resize:resize',function(e){var o_height=that.overlay._posNode.get('region').height;var h_height=_hd.get('region').height;var f_height=_ft.get('region').height;var b_height=o_height-h_height-f_height-20-2;_bd.setStyle('height',b_height+'px');});}catch(e){}}
return this;},removeArray:function(v,a){for(var i=0,m=a.length;i<m;i++){if(a[i]==v){a.splice(i,1);break;}}},close:function(){var that=this;that.beforeUnload(that);that.overlay.hide();that.showMedias();that.removeArray(that.overlay,Y.Box.overlays);that.overlay._posNode.remove();that.removeMask();that.afterUnload(that);that=null;Y.log('close()');return this;},hide:function(){var that=this;that.overlay.hide();that.showMedias();that.afterHide(that);return this;},show:function(){var that=this;that.overlay.show();that.hideMedias();that.afterShow(that);return this;},buildParam:function(o){var o=o||{};this.head=(typeof o.head=='undefined'||o.head==null)?'':o.head;this.body=(typeof o.body=='undefined'||o.body==null)?'':o.body;this.foot=(typeof o.foot=='undefined'||o.foot==null)?'':o.foot;this.skin=(typeof o.skin=='undefined'||o.skin==null)?'default':o.skin;this.draggable=(typeof o.draggable=='undefined'||o.draggable==null)?true:o.draggable;this.fixed=(typeof o.fixed=='undefined'||o.fixed==null)?true:o.fixed;this.shownImmediately=(typeof o.shownImmediately=='undefined'||o.shownImmediately==null)?true:o.shownImmediately;this.modal=(typeof o.modal=='undefined'||o.modal==null)?false:o.modal;this.maskOpacity=(typeof o.maskOpacity=='undefined'||o.maskOpacity==null)?0.6:o.maskOpacity;this.x=(typeof o.x=='undefined'||o.x==null)?false:o.x;this.y=(typeof o.y=='undefined'||o.y==null)?false:o.y;this.width=(typeof o.width=='undefined'||o.width==null)?'300px':o.width;this.height=(typeof o.height=='undefined'||o.height==null)?'auto':o.height;this.clickToFront=(typeof o.clickToFront=='undefined'||o.clickToFront==null)?'':o.clickToFront;this.behaviours=(typeof o.behaviours=='undefined'||o.behaviours==null)?'':o.behaviours;this.afterHide=(typeof o.afterHide=='undefined'||o.afterHide==null)?new Function:o.afterHide;this.afterDrag=(typeof o.afterDrag=='undefined'||o.afterDrag==null)?new Function:o.afterDrag;this.afterShow=(typeof o.afterShow=='undefined'||o.afterShow==null)?new Function:o.afterShow;this.beforeUnload=(typeof o.beforeUnload=='undefined'||o.beforeUnload==null)?new Function:o.beforeUnload;this.afterUnload=(typeof o.afterUnload=='undefined'||o.afterUnload==null)?new Function:o.afterUnload;this.onload=(typeof o.onload=='undefined'||o.onload==null)?new Function:o.onload;this.duration=(typeof o.duration=='undefined'||o.duration==null)?0.3:o.duration;this.antijam=(typeof o.antijam=='undefined'||o.antijam==null)?false:o.antijam;this.resizeable=(typeof o.resizeable=='undefined'||o.resizeable==null)?false:o.resizeable;return this;},parseParam:function(opt){var opt=opt||{};for(var i in opt){this[i]=opt[i];}
return this;},hideMedias:function(){var that=this;if(that.antijam==false)return this;that.hiddenMedia=[];var obj_array=document.body.getElementsByTagName('object');for(var i=0,m=obj_array.length;i<m;i++){if(obj_array[i].type.indexOf("x-oleobject")>0){that.hiddenMedia.push(obj_array[i]);obj_array[i].style.visibility='hidden';}}
return this;},showMedias:function(){var that=this;if(that.antijam==false)return this;if(that.hiddenMedia.length>0){for(var i=0,m=that.hiddenMedia.length;i<m;i++){that.hiddenMedia[i].style.visibility='visible';}
that.hiddenMedia=new Array();}
return this;},addMask:function(){var that=this;if(Y.one('#t-shade-tmp'))return this;var node=Y.Node.create('<div id="t-shade-tmp" style="display: block; z-index: 10004;background-color:black;left:0;position:absolute;top:0;width:100%;display:none"></div>');node.setStyle('opacity',that.maskOpacity.toString());node.setStyle('height',Y.one('body').get('docHeight')+'px');Y.one("html").setStyle('overflow','hidden');Y.one('body').append(node);node.setStyle('display','block');return this;},removeMask:function(){var that=this;if(Y.Box.overlays.length==0&&Y.one('#t-shade-tmp')){Y.one('#t-shade-tmp').remove();Y.one("html").setStyle('overflow','');}
return this;}};Y.Box.alert=function(msg,callback,opt){if(typeof msg=='undefined'||msg==null)var msg='';if(typeof callback=='undefined'||callback==null)var callback=new Function;if(typeof opt=='undefined'||opt==null)var opt={};var title=(typeof opt.title=='undefined'||opt.title==null)?'\u63d0\u793a':opt.title;var closeable=(typeof opt.closeable=='undefined'||opt.closeable==null)?true:opt.closeable;var closeText=(typeof opt.closeText=='undefined'||opt.closeText==null)?'<img src="http://img04.taobaocdn.com/tps/i4/T1m6tpXfxBXXXXXXXX-14-14.gif" border=0>':opt.closeText;var btnText=(typeof opt.btnText=='undefined'||opt.btnText==null)?'\u786e\u5b9a':opt.btnText;var closestr=closeable?'<a class="close closebtn">'+closeText+'</a>':'';var headstr='<span class="title">'+title+'</span>'+closestr;opt.head=headstr;opt.body=msg;opt.foot='<div align=right><button class="okbtn">'+btnText+'</div>';opt._onload=opt.onload||new Function;opt.onload=function(box){var node=box.overlay._posNode;node.query('.okbtn').on('click',function(e){e.halt();callback(box);box.close();});try{node.query('.closebtn').setStyle('cursor','pointer');node.query('.closebtn').on('click',function(e){e.halt();box.close();});}catch(e){}
opt._onload(box);};var box=new Y.Box(opt);return box.render();};Y.Box.confirm=function(msg,callback,opt){if(typeof msg=='undefined'||msg==null)var msg='';if(typeof callback=='undefined'||callback==null)var callback=new Function;if(typeof opt=='undefined'||opt==null)var opt={};var title=(typeof opt.title=='undefined'||opt.title==null)?'\u63d0\u793a':opt.title;var closeable=(typeof opt.closeable=='undefined'||opt.closeable==null)?true:opt.closeable;var closeText=(typeof opt.closeText=='undefined'||opt.closeText==null)?'<img src="http://img04.taobaocdn.com/tps/i4/T1m6tpXfxBXXXXXXXX-14-14.gif" border=0>':opt.closeText;opt.yes=(typeof opt.yes=='undefined'||opt.yes==null)?callback:opt.yes;opt.no=(typeof opt.no=='undefined'||opt.no==null)?new Function:opt.no;var yesText=(typeof opt.yesText=='undefined'||opt.yesText==null)?'\u786e\u5b9a':opt.yesText;var noText=(typeof opt.noText=='undefined'||opt.noText==null)?'\u53d6\u6d88':opt.noText;var cancleBtn=(typeof opt.cancleBtn=='undefined'||opt.cancleBtn==null)?false:opt.cancleBtn;var cancleText=(typeof opt.cancleText=='undefined'||opt.cancleText==null)?'\u5173\u95ed':opt.cancleText;var canclestr=cancleBtn?'<button class="canclebtn">'+cancleText+'</button>':'';var closestr=closeable?'<a class="close closebtn">'+closeText+'</a>':'';var headstr='<span class="title">'+title+'</span>'+closestr;opt.head=headstr;opt.body=msg;opt.foot='<div align=right><button class="yesbtn">'+yesText+'</button>&nbsp;<button class="nobtn">'+noText+'</button>&nbsp;'+canclestr+'</div>';opt._onload=opt.onload||new Function;opt.onload=function(box){var node=box.overlay._posNode;node.query('.yesbtn').on('click',function(e){e.halt();opt.yes(box);box.close();});node.query('.nobtn').on('click',function(e){e.halt();opt.no(box);box.close();});if(cancleBtn){node.query('.canclebtn').on('click',function(e){e.halt();box.close();});}
try{node.query('.closebtn').setStyle('cursor','pointer');node.query('.closebtn').on('click',function(e){e.halt();box.close();});}catch(e){}
opt._onload(box);};var box=new Y.Box(opt);return box.render();};}); 