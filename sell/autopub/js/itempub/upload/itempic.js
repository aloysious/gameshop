KISSY.add(function(S, MVC, PicManage, fileInfo, ImgSpace, FileUpload) {

    S.log('itemPic is started');

    //	shortcut
    var E = S.Event,
        D = S.DOM;

    var itemPic = new MVC('itemPic');

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
	
    function showSubmitLoading(isLoading, hostTrigger) {
        var elLoader = D.get('.J_SubmitLoader');
        if(isLoading) {
            if(!elLoader) {
                elLoader = D.create('<div class="submit-loader J_SubmitLoader">宝贝图片上传中，请稍后…</div>');
                var parent = hostTrigger ? hostTrigger.parentNode : D.get('div.submit');
                parent && parent.appendChild(elLoader);
            }
            D.show(elLoader);
        }else {
            D.hide(elLoader);
        }
    }

    //逻辑层集合
    var Logics = {
        checkFile:{
            need:'file',
            run:function(file) {

                if ('png|jpg|jpeg|bmp|gif'.indexOf(file.extension.toLowerCase()) === -1) {
                    return this.update({'error':{info:'请选择图片!', file:file}});
                }
                if (file.size && file.size > 500000) {
                    return this.update({'error':{info:'图片大小不能超过500K！', file:file}});
                }

                this.update({'fileVaildated':file});
            }
        }

    };

    //view层逻辑集合
    var Views = {
        //初始化
        init :{
            need:['picManagerWrap','tadgetWrap','picUploadApi','picTadgatSrc', 'data'],
            run:function(picManagerWrap, tadgetWrap, picUploadApi, picTadgatSrc, data) {

                var fileInputs = D.filter('input', function(el) {
                        return el.type === 'file';
                    }, picManagerWrap),
                    self = this;

                var picManager = new PicManage(picManagerWrap, {
                    "maxHeight":88,
                    "maxWidth":88
                });
                var imgSpace = new ImgSpace(tadgetWrap, {'frameSrc':picTadgatSrc,use:['space']});

				var uploader;
                S.each(fileInputs, function(ipt, idx) {
                    var uploader = new FileUpload(ipt, {
                        url:picUploadApi,
                        data:data
                    });
                    uploader.idx = idx + 1;
                    uploader.on('uploadComplete', function(data) {
                        //self.update({'fileUploadCompleteData':{data:data.data,el:ipt}});
                    });
                    uploader.on('uploadError', function() {
                       // self.update('fileUploadXHRErrorData', {el: ipt});
                    });

                    ipt.__uploader = uploader;

                });




                // 图片选择
                E.on(fileInputs, 'change', function(e) {
                    S.log('change');
                    this.value && fileInfo(this, function(f) {
                        f.srcEl = e.target;
                        self.update({'file':f});

                    });

                });

                imgSpace.on('insert', function(data) {
                    var ret = picManager.add(data.src);
                    if(ret.error){
                        ret.info = ret.type=="exist"?'同一张图片不能多次添加':
                                  ret.type === "overnum"?'最多只能选择5张图片':
                                  ret.type;
                        self.update({error:ret});
                    }
                });
                this.update({'picManager':picManager});
            }
        },

        fileChange:{
            need:['fileVaildated','picManager','picManagerWrap'],
            run:function(fileVaildated, picManager,picManagerWrap) {
                var el =   fileVaildated.srcEl,
                    self = this,
                    uploader = el.__uploader,
                    relEl = el.parentNode;

                picManager.update(el, el);

                setTimeout(function() {
                    //uploader.upload({pos:uploader.idx});
                    S.log('loading');
                    //picManager.loading(relEl,1);
                }, 500);
            }
        },
        fileUploadXHRError: {
            need: ['fileUploadXHRErrorData', 'picManager'],
            run: function(fileUploadXHRData, picManager) {
                picManager.loading(fileUploadXHRData.el,0);
            }
        },
        fileUploadComplete:{
            need:['fileUploadCompleteData','picManager'],
            run:function(fileUploadCompleteData,picManager) {
                S.log(fileUploadCompleteData);
                picManager.loading(fileUploadCompleteData.el,0);
                var data = fileUploadCompleteData.data;
                if(data.success){
                    picManager.update(fileUploadCompleteData.el,data.picPath,picManager.pvSupported);
                }

            }
        },
        error:{
            need:['error'],
            run:function(error) {
                // 如果发生错误，并且传递了文件信息。
                // 则清空file表单域数据。
                if(error.file && error.file.srcEl) {
                    clearFileInput(error.file.srcEl);
                }
                alert(error.info);
            }
        }
    };


    // 初始
    itemPic.init = function() {

        var self = this, 
            elConfig = D.get('#J_ModItemPic');

        if(!elConfig) return;
        //获取页内配置参数
        self.getData(elConfig);


        self.update({
            picManagerWrap : S.get('.pic-manager2'),
            tadgetWrap : S.get('.J_picTadget')
        });


        //应用所有的逻辑
        S.each(S.merge(Logics, Views), function(v) {
            self.use(v);
        });
    };

    var timer;
    itemPic.valid = function(updatePipe, trigger) {
        timer && clearTimeout(timer);
        var self = this,
            picManager = self.model.get('picManager');
        // 如果不存在picManager表示当前页面不存在多图模块。
        if(!picManager || !picManager.isLoading()) {
            updatePipe(true);
            return;
        }

        showSubmitLoading(true, trigger);
        validate();

        function validate() {
            S.log('timer validate');
            if(!picManager.isLoading()) {
                showSubmitLoading(false, trigger);
                clearTimeout(timer);
                updatePipe(true);
            }else {
                timer = setTimeout(validate, 500);
            }
        }
    };

    S.log('itemPic is ok!');

    return itemPic;

}, {requires:['../mvc','./picmanager','./fileinfo','./imgspace','./fileupload']});
