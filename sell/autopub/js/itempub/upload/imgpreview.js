/**
 * 图片上传预览
 *
 * 兼容性：
 * firefox  3.0+;
 * IE       8-,10+(maybe);
 * Chrome   10+;
 * Opera    11.1+;
 * Safari   6+(maybe)
 *
 *
 * 1. 路径获取:ie6支持，其他浏览器获取不到, ie7+本地文件可获取，线上文件不可 ；通过select方法 ie78可获取，ie9安全限制无法获取
 * 2. 特性检测尝试:
 *          fakepath不靠谱，ie7 返回真实路径，但本地图片无法显示
 */

KISSY.add(function(S) {


    var TRANSPARNT_IMG;


    function _filterPreload(src){
        var img=document.createElement('div'),
            o;

        //设置sizingMethod = image 获取图片原始尺寸
        img.style.cssText = ";width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;"+
                             'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod="image",src="'+src+'")';

        document.body.appendChild(img);
        o = {height:img.offsetHeight,width:img.offsetWidth};
        img.parentNode.removeChild(img);
        S.log(o);
        return o;
	}

    function picPreview(cfg){
        /*if(!inpEl || !callback){return;}

        this.inpEl = inpEl;
        this.callback = callback; */
        this.cfg = cfg || {};
    }

    S.augment(picPreview,{
        pvSupported:true,
        _oldResizeImg:function(img,o){

            var self = this;

            if(!o){
                if(img.complete){
                    o = img;
                }else{
                    img.onload = function(){
                       self._oldResizeImg(img,img);
                    };
                    return;
                }
            }

            var	tW= this.cfg.maxWidth || 0,
                tH= this.cfg.maxHeight || 0,
                oH = o.height,
                oW = o.width,
                ratio=oH/oW;

            if(oH>tH){
                oH=tH;
                oW=tH/ratio;
            }
            if(oW>tW){
                oW=tW;
                oH=tW*ratio;
            }
            img.style.width=oW+'px';
            img.style.height=oH+'px';
        },
        _resizeImg: S.UA.ie ===6 ?
            function(img){this._oldResizeImg(img);}:
            function(img){
            var cfg = this.cfg;
            //fix for: ie下对于指定width or height 时 max-wh 不再定比缩放
            if(cfg.maxWidth){
                img.style.width='auto';
                img.style.maxWidth = cfg.maxWidth + 'px' ;
            }
            if(cfg.maxHeight){
                img.style.height='auto';
                img.style.maxHeight = cfg.maxHeight + 'px'
            }
        },
        previewByUrl:function(src,callback){
            var img = new Image();
            this._resizeImg(img);
            img.src = src;
            callback(img);
        },
        preview:function(inpEl,callback){

            var file = inpEl.files,
                supportFile = file && (file = file[0]),
                proto = this.constructor.prototype,
                IE = S.UA.ie;

            if(supportFile && window.FileReader){
                proto.preview = function(inpEl,callback){

                    var reader = new FileReader(),
                        self = this;
                    reader.onload = function(e){
                        self.previewByUrl(e.target.result,callback);
                    };
                    reader.onerror = function(e){ // maxthon 3 error
                        self._notSupport(inpEl,callback);
                    };
                    reader.readAsDataURL(inpEl.files[0]);
                }
            }else if(supportFile && file.getAsDataURL ){
                proto.preview = function(inpEl,callback){
                   this.previewByUrl(inpEl.files[0].getAsDataURL(),callback);
                }
            }else if(IE>6 && IE <9){

                TRANSPARNT_IMG = IE>7 ? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==":
                                 "http://img01.taobaocdn.com/tps/i1/T1M8CjXf8lXXXXXXXX-1-1.gif";

                proto.preview = function(inpEl,callback){

                    var file,img,preImg;

                    inpEl.select();

                    try{
                        file = document.selection.createRange().text;
                    }catch(e) {
					    proto.preview = this._notSupport; //ie9,ie8模式失败
                        this.preview(inpEl,callback);
						return;
					} finally {
                        document.selection.empty();
                    }

                    preImg = _filterPreload(file);

                    img = new Image();
                    img.src = TRANSPARNT_IMG;

                    this._oldResizeImg(img,preImg);


                    img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod="scale",src="'+file+'")';

                    callback(img);
                }
            }else if(IE===6){
                proto.preview = function(inpEl,callback){
                    this.previewByUrl(inpEl.value,callback);
                }
            }else{
                proto.preview = this._notSupport;
            }
            this.preview(inpEl,callback);
        },
        _notSupport:function(inpEl,callback){
            var proto = this.constructor.prototype;
            proto.pvSupported = false;
            proto._notSupport = function(inpEl,callback){

                var file = inpEl.value,img,x;

                x = file.lastIndexOf('\\');//window
                if(x === -1){x = file.lastIndexOf('/')} //unix

                file = file.substr(x+1);
                img = document.createElement('ins');
                img.title = file;
                img.className = 'img';
                img.innerHTML = file;
                callback(img,true);
            };
            this._notSupport(inpEl,callback);
        }
    });

    return picPreview;
});

/*img = new Image();
img.onload = function(){
    S.log('onload:'+this.width);
};
img.onerror = function(){
    S.log('error:'+this.width);
};
img.src = file;
S.log('mimeTYPE:');
// S.log(img.mimeType);
S.log(img.complete);
S.log(file); */
