// 页面内容初始，为父页面提供接口
(function(){
    var S = KISSY, D = S.DOM, E = S.Event,
        App = S.namespace('TB.Sell.Modules', true);

    function UploadSpace(){}


    S.augment(UploadSpace,S.EventTarget,{
        init:function(){
            this.panels = D.query('.J_Panel');
        },
        toggle:function(which){
            S.each(this.panels,function(p){
                if(p.getAttribute('data-module') === which && D.hasClass(p,'hidden')){
                    D.removeClass(p,'hidden');
                }else{
                    D.addClass(p,'hidden');
                }
            });
            this.fireResize();
        },
        fireResize:function(){
            this.fire('resize',{height:document.body.offsetHeight});
        }
    });


    App.uploadSpace = new UploadSpace();
})();



(function() {
    var S = KISSY, D = S.DOM, E = S.Event,
        Uploader = YAHOO.widget.Uploader,
        App = S.namespace('TB.Sell.Modules', true),

    // 作为调用对象的参数的一部分
    // 在这里直接省略了。
    // 单独使用时需要取消注释
    defConfig = {
        /*
        swfURL: 'uploader.swf',
        allowMultiple: true,
        fileFilter: [
            {
                description: '图片文件(*.jpg;*.png;*.gif;*.jpeg)',
                extensions: '*.jpg;*.png;*.gif;*.jpeg'
            }
        ],
        simUPloadLimit: 5,
        uploadSrc: 'upload.php'
        */
    };

    var ns = {}, cfg = {}, Event = S.mix({}, S.EventTarget);

    // flash资源ready以后执行。
    function handleContentReady(e){
        ns.uploader.setAllowMultipleFiles(cfg.allowMultiple);
        ns.uploader.setFileFilters(cfg.fileFilter);
        ns.uploader.setSimUploadLimit(cfg.simUPloadLimit);

        fireImplementEvent.call(this, e);
    }
    function fireImplementEvent(e) {
        Event.fire(e.type, {data: e});
    }
    
    // 对外提供的可用接口
    var implement = {
        init: function(elem, config) {
            cfg = S.merge(defConfig, config);
            ns.elem = S.get(elem);
			if(!ns.elem){return;}
            ns.container = ns.elem.parentNode;

            Uploader.SWFURL = cfg.swfURL;

            var uploader = new Uploader(ns.elem, null);
            ns.uploader = uploader;

            uploader.addListener('contentReady', handleContentReady);

            uploader.addListener('fileSelect', fireImplementEvent);
            uploader.addListener('uploadStart', fireImplementEvent);
            uploader.addListener('uploadProgress', fireImplementEvent);
            uploader.addListener('uploadCompleteData', fireImplementEvent);
            uploader.addListener('uploadError', fireImplementEvent);
            uploader.addListener('uploadCancel', fireImplementEvent);
            return this;
        },
        /**
         * 绑定提供的监听事件
         * @param {string} type 监听的事件类型
         * @param {function} fn 监听的事件主体
         */
        bind: function(type, fn) {
            Event.on(type, fn);
            return this;
        },
        /**
         * 上传所有选择的文件
         * @param {object} mark map数据。为同时需要提交的其他数据，key-value。
         */
        doUpload: function(mark) {
            ns.uploader.uploadAll(cfg.uploadSrc, 'POST', mark);
            return this;
        },
        /**
         * 在flash中移除指定的文件信息
         * @param {string} id flash中存储文件的标识
         */
        removeFile: function(id) {
            ns.uploader.removeFile(id);
            return this;
        },
        /**
         * 清除flash中保存的文件列表
         */
        clearFileList: function() {
            ns.uploader.clearFileList();
            return this;
        },
        /**
         * bug: 无法触发自定义事件
         */
        cancel: function(fileId) {
            ns.uploader.cancel(fileId);
            return this;
        },
        /**
         * 禁用/启用本地浏览
         * @param {boolean} disable 是否禁用。禁用为true，可用为flase
         */
        disable: function(disable) {
            if(disable) {
                ns.uploader.disable();
                D.addClass(ns.container, 'disabled');
            }else {
                ns.uploader.enable();
                D.removeClass(ns.container, 'disabled');
            }
            return this;
        }
    };

    App.FlashUploader = implement;
})();

(function() {
    var S = KISSY, D = S.DOM, E = S.Event,
        App = S.namespace('TB.Sell.Modules', true),
    
        CLS_UPLOADING = 'uploading',
        CLS_SELECTED = 'selected',
        ATTR_DISABLED = 'disabled',

        STATE_UNUPLOAD = 'unload',
        STATE_FAILUPLOAD = 'failload',
        MSG_UNUPLOAD = '',

    // 选择的文件列表显示需要的模板字串。
    TEMPLATE = function() {
        return '<div class="upload-table">' +
                '<table>' +
                    '<col width="250" />' +
                    '<col width="150" />' +
                    '<col width="90" />' +
                    '<col width="80" />' +
                    '<thead>' +
                        '<tr>' +
                          '<th>文件名称</th>' +
                          '<th>状态</th>' +
                          '<th>文件大小</th>' +
                          '<th class="cell-act">操作</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td>{name}</td>' +
                            '<td class="{status}">{msg}</td>' +
                            '<td>{size}</td>' +
                            '<td class="cell-act">' +
                                '<a id="{id}" href="#">删除</a>' +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
            '<div class="extra-info">' +
                '<em>{totalSize}</em>（{num} 张图片）' +
            '</div>' +
            '<div class="uploading-tip">' +
                '<span class="alayer"></span>' +
                '<div class="fixPosition">' +
                    '<p>上传中，请稍候...</p>' +
                '</div>' +
            '</div>';
    };
    var ns = {}, 
        cfg = {
            swfURL: 'uploader.swf',
            allowMultiple: true,
            fileFilter: [
                {
                    description: '图片文件(*.jpg;*.png;*.gif;*.jpeg)',
                    extensions: '*.jpg;*.png;*.gif;*.jpeg'
                }
            ],
            simUPloadLimit: 5,
            uploadSrc: 'upload.php',
            maxLength: 30,
            maxSize: 1024,  // 单位：KB
            msgAlertSize: '单张图片大小不允许超过1M',
            msgAlertLength: '一次只能添加最多30张图片',
            msgAlertError: '上传图片发生错误，请稍候重试'
        };

    /**
     * 模板拼装和html渲染
     */
    function showTemplHTML() {
        var template = '',
            size = 0,
            files = ns.files,
            length = files.length,
            extra = {num: length, totalSize: '0KB'};
        // 计算各个file的大小，并计算总大小
        S.each(files, function(file) {
            if(!file.originSize) {
                file.originSize = file.size;
                file.size = convertSize(file.size);
            }
            size += file.originSize;
        });
        extra.totalSize = convertSize(size);

        if(length > 0) {
            template = TEMPLATE();
            // 列表部分的substitute
            template = template.replace(/<tbody>([\S\s]*)<\/tbody>/g, function(tbody, tr) {
                    return '<tbody>' + substituteHTML(tr, files) + '</tbody>';
                });

            // 非列表部分的substitute
            template = S.substitute(template, extra);
        }
        ns.uploadList.innerHTML = template;

        // 设置ie6中最大高度的表现
        if(S.UA.ie === 6) {
            if(length > 7) {
                D.addClass(tableDiv, 'limit-height');
            }
            if(length > 0) {
                var tableDiv = S.get('.upload-table', ns.uploadList),
                    layerHeight = D.height(S.get('table', ns.uploadList));
                if(length > 7) {
                    layerHeight = D.height(tableDiv);
                }
                D.height(ns.uploadList, layerHeight);
            }
        }

        // 设置parent中iframe的显示高度
        fixParentHeight();
    }
    /**
     * 简单模板拼接渲染
     * @param {string} templ 模板字串
     * @param {object} data  渲染的数据
     */
    function substituteHTML(templ, data) {
        var rt = [];
        S.each(data, function(file) {
            rt.push(S.substitute(templ, file));
        });
        return rt.join('');
    }

    /**
     * 设置显示状态，以及html渲染的执行入口
     */
    function renderHTML() {
        var length = ns.files.length,
            method = length > 0 ? 'addClass' : 'removeClass';
        S.DOM[method](ns.elUploadDiv, 'turnoff');
        // 当数量为0时，清理flash内部的列表数据
        (length === 0) && ns.uploader.clearFileList();

        // 最大文件选择的限制
        if(length >= cfg.maxLength) {
            ns.uploader.disable(true);
        }else {
            ns.uploader.disable(false);
        }

        // 重新渲染上传文件列表
        showTemplHTML();
    }

    /**
     * 转换数据大小的显示
     * @param {int} size 要转换的尺寸
     * @return {string}  转换完成的尺寸大小，包含单位信息 B/KB/MB
     */
    function convertSize(size) {
        var rt = 0;
        if(size < 1024) {
            rt = size + 'B';
        }else if(size >= 1024 && size < 1048576) {  // 1024B < size < 1024*1024B
            rt = (size / 1024).toFixed(2) +'KB';
        }else { //if(size >= 1048576 && size < 1073741824) {
            rt = (size / 1048576).toFixed(2) + 'MB';
        }
        return rt;
    }

    /**
     * 提取file数据
     * 若不符合要求，只是给予提示
     * 符合的数据依然进行收集
     */
    function batchFiles(data) {
        var validSize = true,
            validLength = true,
            i = 0, rt = [];
        //ns.files.length = 0;
        S.each(data, function(file) {
            if(i >= cfg.maxLength) {
                validLength = false;
                ns.uploader.removeFile(file.id);
                return false;
            }
            if(file.size > cfg.maxSize * 1024) {
                validSize = false;
                ns.uploader.removeFile(file.id);
                return true;
            }
            // 已经存在的file 不重复添加显示
            if(!S.get('#' + file.id)) {
                file.status = STATE_UNUPLOAD;
                file.message = MSG_UNUPLOAD;
                rt.push(file);
            }
            i++;
            return true;
        });
        // 以此保证添加顺序
        ns.files = ns.files.concat(rt);

        if(!validSize && !validLength) {
            alert(cfg.msgAlertLength + '且' + cfg.msgAlertSize);
        }else if(!validSize) {
            alert(cfg.msgAlertSize);
        }else if(!validLength) {
            alert(cfg.msgAlertLength);
        }
    }

    /**
     * 删除选择的图片
     * @param {string} id 删除指定id的文件信息。
     *                      该id为flash中的标识
     */
    function delFile(id) {
        ns.uploader.removeFile(id);
        S.each(ns.files, function(file, idx) {
            if(file.id == id) {
                ns.files.splice(idx, 1);
                return false;
            }
        });
        renderHTML();
    }

    /**
     * 获取guid，以便取得指定的callbackName。
     * 可以考虑命名空间的方式，以此来允许其他组件访问调用。
     */
    var getMethodGuid = function() {
        var param = KISSY.unparam(location.search.substring(1)),
            guid = param['callbackguid'] || '';

        D.val(S.query('.J_MethodGuid'), guid);
        return guid;
    }(),
    /**
     * 每次渲染html时都调用该方法，使得iframe高度自适应
     */
    fixParentHeight = function() {
        var callbackName = 'resizeIframeHeight' + getMethodGuid,
            doc = document.body,
            method = (parent && parent[callbackName]) ? parent[callbackName] : function(){};

        return function() {
            var height = doc.offsetHeight + 10;
            //method(height);
            App.uploadSpace.fireResize();
        };
    }(),
    /**
     * 获取填充图片用的src字串。当前图片显示在最后会增加
     * _80x80.jpg后缀来渲染合适的图片尺寸，这里的操作就是去除之
     * @param {HTMLElement} img 图片对象
     * @return {string} 最终用于填充的图片url地址
     */
    fetchURL = function(img) {
        var url = img.src,
            reg = /_100x100.jpg$/i;
        url = url.replace(reg, function(match) {
            return "";
        });
        return url;
    },
    /**
     * 将图片填充到外部
     */
    fillBackImage = function(src) {
        App.uploadSpace.fire('insert',{src:src});
    };
        /*var callbackName = 'fnFillImage' + getMethodGuid,
            method = (parent && parent[callbackName]) ? parent[callbackName] : function(){};
            
        return function(src) {
            method(src);
        };
    }();*/

    /**
     * 上传时的状态管理。
     * @param {boolean} beDisable 是否为上传过程。
     */
    function beUploading(beDisable) {
        var elUpload = ns.elUploadDiv,
            actionEls = [
                ns.elCategory,
                ns.btnClear,
                ns.btnSubmit
            ];
        // flash上传 浏览功能的开启和禁用
        ns.uploader.disable(beDisable);
        // 其他按钮的显示和可操作控制
        if(beDisable) {
            D.attr(actionEls, ATTR_DISABLED, true);
            D.addClass(elUpload, CLS_UPLOADING);
        }else {
            D.removeAttr(actionEls, ATTR_DISABLED);
            D.removeClass(elUpload, CLS_UPLOADING);
        }
    }

    /**
     * 上传成功以后触发，对文件对象列表进行操作
     * @param {array} success 操作成功的文件信息。服务器端返回数据
     * @param {array} fails   操作失败的文件列表。服务器端返回
     */
    function endHandle(success, fails) {
        // 文件列表中先减去操作成功的文件对象
        S.each(success, function(f) {
            ns.uploader.removeFile(f.fileId);
            S.each(ns.files, function(file, idx) {
                if(file.id == f.fileId) {
                    ns.files.splice(idx, 1);
                    return false;
                }
            });
        });
        // 增加操作失败的文件对象的错误信息
        S.each(fails, function(f) {
            S.each(ns.files, function(file) {
                if(file.id == f.fileId) {
                    file.status = STATE_FAILUPLOAD;
                    file.msg = f.message;
                    return false;
                }
            });
        });

        // 单独操作成功的文件对象
        if(success.length > 0) {
            successRender(success);
        }
        // 由于减少了成功的文件以及修改了失败的属性
        // 重新渲染选择列表
        renderHTML();
    }

    /**
     * 上传成功文件的操作。将线上的图片地址插入显示列表中。
     * @param {array} success 上传成功的文件列表信息。
     */
    function successRender(success) {
        //location.href = location.href;
        var fragment = document.createDocumentFragment();
        S.each(success, function(file) {
            var item = D.create('<li><img src="'+ file.url +'" alt="" /></li>');
            fragment.appendChild(item);
        });
        D.prepend(fragment, ns.elList);
    }

    var ImageSpace = {
        init: function(config) {
            cfg = S.merge(cfg, config);
            ns.container = S.get('#frame');

            fixParentHeight();
            this.initList();
            this.initUpload();
        },
        initList: function() {
            var select = S.get('#J_SelectCategory'),
                listTable = S.get('#J_ListTable ul');
            ns.elList = listTable;

            // 更改当前显示分类
            E.on(select, 'change', function() {
                select.form.submit();
            });

            // 选择图片操作，填充图片信息到图片组件
            E.on(listTable, 'click', function(e) {
                var target = e.target,
                    img, url;
                if(target.tagName == 'IMG') {
                    img = target;
                    target = target.parentNode;
                }
                if(target.parentNode != listTable) return;

                // 设置selected样式
                D.removeClass(S.query('li', listTable), CLS_SELECTED);
                D.addClass(target, CLS_SELECTED);
                // 获取图片url地址。
                img = img || D.get('img', target);
                url = fetchURL(img);
                fillBackImage(url);
            });

        },
        initUpload: function() {
            if(!S.get('#J_FlashUpload em')){return;}
            var uploader = App.FlashUploader.init('#J_FlashUpload em', cfg);

            ns.files = [];
            ns.uploader = uploader;
            ns.btnSubmit = S.get('#J_Upload');
            //ns.btnCancel = S.get('#J_Cancel');
            ns.btnClear = S.get('#J_Clear');
            ns.elUploadDiv = S.get('.add-upload');
            ns.elCategory = S.get('#J_ToCategory');
            ns.uploadList = S.get('.upload-list', ns.elUploadDiv);

            // 提交上传
            E.on(ns.btnSubmit, 'click', function(e) {
                // 上传过程中按钮不可用
                beUploading(true);
                // 其他的需要提交的参数收集和提交。
                var cate = ns.elCategory.options[ns.elCategory.selectedIndex].value,
                    params = getFormParam(this.form, {
                        category: cate
                    });
                uploader.doUpload(params);
            });
            // 获取表单中文本框和隐藏域的值，并与第二个参数合并。
            function getFormParam(form, extra) {
                var rt = {};
                S.each(form.elements, function(element) {
                    if(element.tagName == 'INPUT' && 
                        (element.type == 'hidden' || element.type == "text")) {
                        rt[element.name] = element.value;
                    }
                });
                return S.mix(rt, extra);
            }
            // 清除所有图片
            E.on(ns.btnClear, 'click', function(e) {
                e.preventDefault();

                if(!D.hasClass(ns.elUploadDiv, CLS_UPLOADING)) {
                    ns.files.length = 0;
                    renderHTML();
                }
            });
            // 删除单张图片
            E.on(ns.uploadList, 'click', function(e) {
                var target = e.target,
                    id  = D.attr(target, 'id');
                if(target.tagName !== 'A' || !id) return;
                e.preventDefault();
                delFile(id);
            });
            /**
             * 取消操作 有bug 2.8.1依然如此。。。
             * @see http://yuilibrary.com/projects/yui2/ticket/2487525
            E.on(ns.btnCancel, 'click', function(e) {
                ns.uploader.cancel();
                // cancel以后不触发任何自定义事件
                // 包括已经发出去的处理请求。
                endHandle(successResult, failResult);
                beUploading(false);
            });
            */

            var remainNumber,                   // 剩余的文件数量
                errorTimes = 0,                 // 出错的次数
                successResult = [],             // 操作成功的文件信息
                failResult = [];                // 操作失败的文件信息
            // 初始化 上传流程需要的变量值
            function _initUploadVar() {
                failResult.length = 0;
                successResult.length = 0;
                errorTimes = 0;
                remainNumber = undefined;
            }
            uploader.bind('fileSelect', function(e) {
                // 获取数据填充到ns.files中。
                batchFiles(e.data.fileList);
                // 根据ns.files的值，设置显示状态、渲染html等
                renderHTML();

            }).bind('uploadStart', function() {
                // 获取总文件数量，每处理一个文件自减1
                if(remainNumber === undefined) {
                    remainNumber = ns.files.length;
                }

            }).bind('uploadCompleteData', function(e) {
                // 每个文件上传成功都会触发该事件
                var data = window.eval('(' + e.data.data + ')');
                data.fileId = e.data.id;
                if(data.status === false) {
                    failResult.push(data);
                }else {
                    successResult.push(data);
                }

                // 在图片全部上传以后统一做一次操作
                if( (--remainNumber) == 0) {
                    endHandle(successResult, failResult);

                    beUploading(false);
                    _initUploadVar();
                }

            }).bind('uploadError', function(e) {
                // 如果失败，无法上传。则不会触发uploadStart等事件，直接执行error事件
                // 执行的次数与simUPloadLimit相关
                // 如果文件数量大于simUPloadLimit值，则执行simUPloadLimit次
                // 如果小于该值，则执行次数与实际的文件数量一致。
                var len = ns.files.length;
                len = len < cfg.simUPloadLimit ? len : cfg.simUPloadLimit;
                errorTimes++;

                // 做计数，只执行一次。
                S.log(e.data);
                if(errorTimes == len) {
                    alert(cfg.msgAlertError);

                    beUploading(false);
                    _initUploadVar();
                }
            });
        }
    };
    App.ImageSpace = ImageSpace;
})();


