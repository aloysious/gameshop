/**
 * 实现文件域异步提交:
 *
 * 将 文件域复制单独form中，上传后文件域清空
 */
KISSY.add(function(S) {

   var E = S.Event,
       io = S.io,
       EVENTS={
			UPLOADCOMPLETE:'uploadComplete',
            UPLOADERROR: 'uploadError'
       };

   var FileUpload = function(inpEls,cfg){
       this.inputs = S.isArray(inpEls)? inpEls : [inpEls];
       this.cfg = cfg || {};
       this.form =  this._createForm();
       this._temInputs = [];
   };

   S.augment(FileUpload,E.Target,{

        _createForm:function(){
			var oForm = document.createElement('form');
            oForm.style.display="none";
            oForm.setAttribute('method','post');
            oForm.setAttribute('enctype','multipart/form-data');
            // ie7- set enctype dynamically  no use
            oForm.setAttribute("encoding",'multipart/form-data');

			document.body.appendChild(oForm);
			return oForm;
		},
        _copyInputs:function(){
            var self = this;
            S.each(this.inputs,function(inpEl,i){
                var next = inpEl.nextSibling,
                    parent = inpEl.parentNode;
                self._temInputs[i] = next ? function(){parent.insertBefore(inpEl,next);}:
                                            function(){parent.appendChild(inpEl);};
                // ie7- not allow clone input[type=file] element with it's value
                self.form.appendChild(inpEl);
            });
        },
        _resume:function(){
            var self = this;
            S.each(self._temInputs,function(rusume,i){
                rusume();
                self._temInputs[i] = null;
            });
        },
        upload:function(data){

            if(data){
                data = S.merge(data,this.cfg.data||{});
            }
            var self = this,
                form = this.form;

            this._copyInputs();

            S.log(data);

            /*io.upload(this.cfg.url,form,'pos=1&asdf=2&ss=2',function(data){
                self.fire(EVENTS.UPLOADCOMPLETE,{data:data});
            },'json');  */

            io({
                url:this.cfg.url,
                type:'post',
                dataType:'json',
                form:form,
                data:data,
                serializeArray:false,
                timeout:20000,
                success:function(data){
                    S.log(['upload complete:', data]);
                    // 上传完清空上传内容
                    data.success&&form.reset();
                    self._resume();
                    self.fire(EVENTS.UPLOADCOMPLETE,{data:data});
                },
                error:function(){
                    S.log('xhr error');
                    // 必须要先resume，file表单域还在创建出来的form中~ by ake
                    self._resume();
                    self.fire(EVENTS.UPLOADERROR);
                },
                complete: function() {
                    S.log('upload handle complete');
                }
            });

        }
   });
   return FileUpload;
});
