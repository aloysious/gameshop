KISSY.add(function(S,ImgPreview) {
    var D = S.DOM,E = S.Event;

    var defCfg ={
        itemSel:'.pm-item',
        dataUrlSel:'.J_PicUrl',
        picElSel : '.preview',
        actSel :'.act',
        sampleSel:'.examp',
        itemcont : '.pm-itemcont'
    };
    var PIC_DATA = 'data-picdata';

    function clearFileInput(el){
        //var newNode;
        el.value = '';
        // selection problem!!!
        if(el.value){
            S.log('use clear by reset');
            // ref:http://jsperf.com/resume-node

            var next = el.nextSibling,
                parent = el.parentNode;

            var frm = document.createElement('form');
            frm.appendChild(el);
            frm.reset();

            next ? parent.insertBefore(el,next) : parent.appendChild(el);
        }
    }

    function PicManager(container,cfg){
        if(!container){return;}

        this.cfg = S.merge(cfg,defCfg);
        this.container = container;
        this.itemLis = S.query(this.cfg.itemSel,container);
        this._initData();
        this._initEvent();
    }

    S.augment(PicManager,ImgPreview,{
        _initData:function(){
            var self = this,dataUrl,tort,picEl;
            S.each(this.itemLis,function(li,id){
                dataUrl = S.get(self.cfg.dataUrlSel,li);

                // 初始内容处理
                if(id === 0){
                    picEl =S.get(self.cfg.picElSel,li);
                    tort = picEl.innerHTML;
                }
                if(dataUrl.value){
                    self.update(li,dataUrl.value);
                    if(tort&&picEl){
                        picEl.innerHTML += tort;
                    }
                }
            });
        },
        _initEvent:function(){
            var self = this;
            E.on(this.container, 'click', function(e) {
                var tg = e.target,act;
                if(act = tg.getAttribute('data-act')){
                    self[act](D.parent(tg,self.cfg.itemSel));
                }
            });

            E.on(this.itemLis,'mouseover',function(e){
                var preview = S.get(self.cfg.picElSel,this),
                    act = S.get(self.cfg.actSel,this);
                if(S.trim(preview.innerHTML)){
                    act.style.display ='block';
                }
            });
            E.on(this.itemLis,'mouseout',function(e){
                var act = S.get(self.cfg.actSel,this);
                act.style.display ='none';
            });

        },
        _changeCont:function(frm,to){
            var cont = D.get(this.cfg.itemcont,frm),
                cont2 = D.get(this.cfg.itemcont,to);

                frm.appendChild(cont2);
                to.appendChild(cont);
        },
        moveLeft:function(li){
            var prev = D.prev(li);
            prev && this._changeCont(li,prev);
        },
        moveRight:function(li){
            var next = D.next(li);
            next && this._changeCont(li,next);

        },
        del:function(li){
            this.update(li);
        },
        add:function(data){
            var li,self = this,cont,dataUrl,exist;

            // get Empty Li
            S.each(this.itemLis,function(el){

                if(dataUrl = S.get(self.cfg.dataUrlSel,el)){
                    if(dataUrl.value === data){
                        exist = true;
                        return false;
                    }
                }

                cont = S.get(self.cfg.itemcont,el);
                if(!cont.getAttribute(PIC_DATA)){
                    li = el;
                    return false;
                }
            });

            if(exist){
                return {error:true,type:'exist'};
            }else if(li){
                this.update(li,data);
                return {result:false};
            }else{
                return {error:true,type:'overnum'};
            }

        },
        loading:function(itemEl,load){

            var el = D.parent(itemEl,this.cfg.itemSel);

            if(load === 1){
                D.addClass(el,'loading');
                this.disable(itemEl);
            }else{
                D.removeClass(el,'loading');
                this.able(itemEl);
            }
        },
        // loading状态 ipt元素被移动，无需disabled
        disable:function(itemEl){
            S.log(['disable',itemEl]);
            var p = D.parent(itemEl,this.cfg.itemcont);
            //ipt.setAttribute('disabled','true');
            D.addClass(p,'pm-disabled');
        },
        able:function(itemEl){
            S.log(['able',itemEl]);
            var p = D.parent(itemEl,this.cfg.itemcont);
            //ipt.removeAttribute('disabled');
            D.removeClass(p,'pm-disabled');
        },
        update:function(li,pic,noPreview){
            // 传子节点仍可添加
            if(!D.test(li,this.cfg.itemSel)){
                li = D.parent(li,this.cfg.itemSel);
            }

            var cont = S.get(this.cfg.itemcont,li),
                dataUrlEl = S.get(this.cfg.dataUrlSel,cont),
                picEl = S.get(this.cfg.picElSel,cont),
                dataFormEl = D.filter('input',function(el){return el.type === 'file';},cont)[0];

            if(!pic){
                picEl.innerHTML = '';
                cont.setAttribute(PIC_DATA,'');
                dataUrlEl.value = '';
                clearFileInput(dataFormEl);
                D.removeClass(cont,'hasCont');
            }else{
                S.log('preview');
                if(S.isString(pic)){

                    cont.setAttribute(PIC_DATA,'url');
                    dataUrlEl.value = pic;
                    clearFileInput(dataFormEl);

                    if(!noPreview){
                        picEl.innerHTML = '';
                        this.previewByUrl(pic+'_100x100.jpg',function(img){
                             picEl.appendChild(img);
                        });
                    }

                }else{

                    cont.setAttribute(PIC_DATA,'form');
                    dataUrlEl.value = '';

                    if(!noPreview){
                        picEl.innerHTML = '';
                        this.preview(pic,function(img){
                            picEl.appendChild(img);
                        });
                    }
                }
                D.addClass(cont,'hasCont');
            }
        },
        batchUpdateUrl:function(data){

            var index=0,self=this,cont;
            S.each(this.itemLis,function(li){
                cont = S.get(self.cfg.itemcont,li);
                if(cont.getAttribute(PIC_DATA)==='form'){
                    self.update(li,data[index++],self.pvSupported);
                }
            });
        },
        isLoading:function(){
            var loading = false;
            S.each(this.itemLis,function(li){
                if(D.hasClass(li,'loading')){
                    loading=true;
                }
            });

            return loading;
        }
    });
    return PicManager;

},{requires:['./imgpreview']});
