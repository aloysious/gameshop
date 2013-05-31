// ҳ�����ݳ�ʼ��Ϊ��ҳ���ṩ�ӿ�
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

    // ��Ϊ���ö���Ĳ�����һ����
    // ������ֱ��ʡ���ˡ�
    // ����ʹ��ʱ��Ҫȡ��ע��
    defConfig = {
        /*
        swfURL: 'uploader.swf',
        allowMultiple: true,
        fileFilter: [
            {
                description: 'ͼƬ�ļ�(*.jpg;*.png;*.gif;*.jpeg)',
                extensions: '*.jpg;*.png;*.gif;*.jpeg'
            }
        ],
        simUPloadLimit: 5,
        uploadSrc: 'upload.php'
        */
    };

    var ns = {}, cfg = {}, Event = S.mix({}, S.EventTarget);

    // flash��Դready�Ժ�ִ�С�
    function handleContentReady(e){
        ns.uploader.setAllowMultipleFiles(cfg.allowMultiple);
        ns.uploader.setFileFilters(cfg.fileFilter);
        ns.uploader.setSimUploadLimit(cfg.simUPloadLimit);

        fireImplementEvent.call(this, e);
    }
    function fireImplementEvent(e) {
        Event.fire(e.type, {data: e});
    }
    
    // �����ṩ�Ŀ��ýӿ�
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
         * ���ṩ�ļ����¼�
         * @param {string} type �������¼�����
         * @param {function} fn �������¼�����
         */
        bind: function(type, fn) {
            Event.on(type, fn);
            return this;
        },
        /**
         * �ϴ�����ѡ����ļ�
         * @param {object} mark map���ݡ�Ϊͬʱ��Ҫ�ύ���������ݣ�key-value��
         */
        doUpload: function(mark) {
            ns.uploader.uploadAll(cfg.uploadSrc, 'POST', mark);
            return this;
        },
        /**
         * ��flash���Ƴ�ָ�����ļ���Ϣ
         * @param {string} id flash�д洢�ļ��ı�ʶ
         */
        removeFile: function(id) {
            ns.uploader.removeFile(id);
            return this;
        },
        /**
         * ���flash�б�����ļ��б�
         */
        clearFileList: function() {
            ns.uploader.clearFileList();
            return this;
        },
        /**
         * bug: �޷������Զ����¼�
         */
        cancel: function(fileId) {
            ns.uploader.cancel(fileId);
            return this;
        },
        /**
         * ����/���ñ������
         * @param {boolean} disable �Ƿ���á�����Ϊtrue������Ϊflase
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

    // ѡ����ļ��б���ʾ��Ҫ��ģ���ִ���
    TEMPLATE = function() {
        return '<div class="upload-table">' +
                '<table>' +
                    '<col width="250" />' +
                    '<col width="150" />' +
                    '<col width="90" />' +
                    '<col width="80" />' +
                    '<thead>' +
                        '<tr>' +
                          '<th>�ļ�����</th>' +
                          '<th>״̬</th>' +
                          '<th>�ļ���С</th>' +
                          '<th class="cell-act">����</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td>{name}</td>' +
                            '<td class="{status}">{msg}</td>' +
                            '<td>{size}</td>' +
                            '<td class="cell-act">' +
                                '<a id="{id}" href="#">ɾ��</a>' +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
            '<div class="extra-info">' +
                '<em>{totalSize}</em>��{num} ��ͼƬ��' +
            '</div>' +
            '<div class="uploading-tip">' +
                '<span class="alayer"></span>' +
                '<div class="fixPosition">' +
                    '<p>�ϴ��У����Ժ�...</p>' +
                '</div>' +
            '</div>';
    };
    var ns = {}, 
        cfg = {
            swfURL: 'uploader.swf',
            allowMultiple: true,
            fileFilter: [
                {
                    description: 'ͼƬ�ļ�(*.jpg;*.png;*.gif;*.jpeg)',
                    extensions: '*.jpg;*.png;*.gif;*.jpeg'
                }
            ],
            simUPloadLimit: 5,
            uploadSrc: 'upload.php',
            maxLength: 30,
            maxSize: 1024,  // ��λ��KB
            msgAlertSize: '����ͼƬ��С��������1M',
            msgAlertLength: 'һ��ֻ��������30��ͼƬ',
            msgAlertError: '�ϴ�ͼƬ�����������Ժ�����'
        };

    /**
     * ģ��ƴװ��html��Ⱦ
     */
    function showTemplHTML() {
        var template = '',
            size = 0,
            files = ns.files,
            length = files.length,
            extra = {num: length, totalSize: '0KB'};
        // �������file�Ĵ�С���������ܴ�С
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
            // �б��ֵ�substitute
            template = template.replace(/<tbody>([\S\s]*)<\/tbody>/g, function(tbody, tr) {
                    return '<tbody>' + substituteHTML(tr, files) + '</tbody>';
                });

            // ���б��ֵ�substitute
            template = S.substitute(template, extra);
        }
        ns.uploadList.innerHTML = template;

        // ����ie6�����߶ȵı���
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

        // ����parent��iframe����ʾ�߶�
        fixParentHeight();
    }
    /**
     * ��ģ��ƴ����Ⱦ
     * @param {string} templ ģ���ִ�
     * @param {object} data  ��Ⱦ������
     */
    function substituteHTML(templ, data) {
        var rt = [];
        S.each(data, function(file) {
            rt.push(S.substitute(templ, file));
        });
        return rt.join('');
    }

    /**
     * ������ʾ״̬���Լ�html��Ⱦ��ִ�����
     */
    function renderHTML() {
        var length = ns.files.length,
            method = length > 0 ? 'addClass' : 'removeClass';
        S.DOM[method](ns.elUploadDiv, 'turnoff');
        // ������Ϊ0ʱ������flash�ڲ����б�����
        (length === 0) && ns.uploader.clearFileList();

        // ����ļ�ѡ�������
        if(length >= cfg.maxLength) {
            ns.uploader.disable(true);
        }else {
            ns.uploader.disable(false);
        }

        // ������Ⱦ�ϴ��ļ��б�
        showTemplHTML();
    }

    /**
     * ת�����ݴ�С����ʾ
     * @param {int} size Ҫת���ĳߴ�
     * @return {string}  ת����ɵĳߴ��С��������λ��Ϣ B/KB/MB
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
     * ��ȡfile����
     * ��������Ҫ��ֻ�Ǹ�����ʾ
     * ���ϵ�������Ȼ�����ռ�
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
            // �Ѿ����ڵ�file ���ظ������ʾ
            if(!S.get('#' + file.id)) {
                file.status = STATE_UNUPLOAD;
                file.message = MSG_UNUPLOAD;
                rt.push(file);
            }
            i++;
            return true;
        });
        // �Դ˱�֤���˳��
        ns.files = ns.files.concat(rt);

        if(!validSize && !validLength) {
            alert(cfg.msgAlertLength + '��' + cfg.msgAlertSize);
        }else if(!validSize) {
            alert(cfg.msgAlertSize);
        }else if(!validLength) {
            alert(cfg.msgAlertLength);
        }
    }

    /**
     * ɾ��ѡ���ͼƬ
     * @param {string} id ɾ��ָ��id���ļ���Ϣ��
     *                      ��idΪflash�еı�ʶ
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
     * ��ȡguid���Ա�ȡ��ָ����callbackName��
     * ���Կ��������ռ�ķ�ʽ���Դ�����������������ʵ��á�
     */
    var getMethodGuid = function() {
        var param = KISSY.unparam(location.search.substring(1)),
            guid = param['callbackguid'] || '';

        D.val(S.query('.J_MethodGuid'), guid);
        return guid;
    }(),
    /**
     * ÿ����Ⱦhtmlʱ�����ø÷�����ʹ��iframe�߶�����Ӧ
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
     * ��ȡ���ͼƬ�õ�src�ִ�����ǰͼƬ��ʾ����������
     * _80x80.jpg��׺����Ⱦ���ʵ�ͼƬ�ߴ磬����Ĳ�������ȥ��֮
     * @param {HTMLElement} img ͼƬ����
     * @return {string} ������������ͼƬurl��ַ
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
     * ��ͼƬ��䵽�ⲿ
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
     * �ϴ�ʱ��״̬����
     * @param {boolean} beDisable �Ƿ�Ϊ�ϴ����̡�
     */
    function beUploading(beDisable) {
        var elUpload = ns.elUploadDiv,
            actionEls = [
                ns.elCategory,
                ns.btnClear,
                ns.btnSubmit
            ];
        // flash�ϴ� ������ܵĿ����ͽ���
        ns.uploader.disable(beDisable);
        // ������ť����ʾ�Ϳɲ�������
        if(beDisable) {
            D.attr(actionEls, ATTR_DISABLED, true);
            D.addClass(elUpload, CLS_UPLOADING);
        }else {
            D.removeAttr(actionEls, ATTR_DISABLED);
            D.removeClass(elUpload, CLS_UPLOADING);
        }
    }

    /**
     * �ϴ��ɹ��Ժ󴥷������ļ������б���в���
     * @param {array} success �����ɹ����ļ���Ϣ���������˷�������
     * @param {array} fails   ����ʧ�ܵ��ļ��б��������˷���
     */
    function endHandle(success, fails) {
        // �ļ��б����ȼ�ȥ�����ɹ����ļ�����
        S.each(success, function(f) {
            ns.uploader.removeFile(f.fileId);
            S.each(ns.files, function(file, idx) {
                if(file.id == f.fileId) {
                    ns.files.splice(idx, 1);
                    return false;
                }
            });
        });
        // ���Ӳ���ʧ�ܵ��ļ�����Ĵ�����Ϣ
        S.each(fails, function(f) {
            S.each(ns.files, function(file) {
                if(file.id == f.fileId) {
                    file.status = STATE_FAILUPLOAD;
                    file.msg = f.message;
                    return false;
                }
            });
        });

        // ���������ɹ����ļ�����
        if(success.length > 0) {
            successRender(success);
        }
        // ���ڼ����˳ɹ����ļ��Լ��޸���ʧ�ܵ�����
        // ������Ⱦѡ���б�
        renderHTML();
    }

    /**
     * �ϴ��ɹ��ļ��Ĳ����������ϵ�ͼƬ��ַ������ʾ�б��С�
     * @param {array} success �ϴ��ɹ����ļ��б���Ϣ��
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

            // ���ĵ�ǰ��ʾ����
            E.on(select, 'change', function() {
                select.form.submit();
            });

            // ѡ��ͼƬ���������ͼƬ��Ϣ��ͼƬ���
            E.on(listTable, 'click', function(e) {
                var target = e.target,
                    img, url;
                if(target.tagName == 'IMG') {
                    img = target;
                    target = target.parentNode;
                }
                if(target.parentNode != listTable) return;

                // ����selected��ʽ
                D.removeClass(S.query('li', listTable), CLS_SELECTED);
                D.addClass(target, CLS_SELECTED);
                // ��ȡͼƬurl��ַ��
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

            // �ύ�ϴ�
            E.on(ns.btnSubmit, 'click', function(e) {
                // �ϴ������а�ť������
                beUploading(true);
                // ��������Ҫ�ύ�Ĳ����ռ����ύ��
                var cate = ns.elCategory.options[ns.elCategory.selectedIndex].value,
                    params = getFormParam(this.form, {
                        category: cate
                    });
                uploader.doUpload(params);
            });
            // ��ȡ�����ı�����������ֵ������ڶ��������ϲ���
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
            // �������ͼƬ
            E.on(ns.btnClear, 'click', function(e) {
                e.preventDefault();

                if(!D.hasClass(ns.elUploadDiv, CLS_UPLOADING)) {
                    ns.files.length = 0;
                    renderHTML();
                }
            });
            // ɾ������ͼƬ
            E.on(ns.uploadList, 'click', function(e) {
                var target = e.target,
                    id  = D.attr(target, 'id');
                if(target.tagName !== 'A' || !id) return;
                e.preventDefault();
                delFile(id);
            });
            /**
             * ȡ������ ��bug 2.8.1��Ȼ��ˡ�����
             * @see http://yuilibrary.com/projects/yui2/ticket/2487525
            E.on(ns.btnCancel, 'click', function(e) {
                ns.uploader.cancel();
                // cancel�Ժ󲻴����κ��Զ����¼�
                // �����Ѿ�����ȥ�Ĵ�������
                endHandle(successResult, failResult);
                beUploading(false);
            });
            */

            var remainNumber,                   // ʣ����ļ�����
                errorTimes = 0,                 // ����Ĵ���
                successResult = [],             // �����ɹ����ļ���Ϣ
                failResult = [];                // ����ʧ�ܵ��ļ���Ϣ
            // ��ʼ�� �ϴ�������Ҫ�ı���ֵ
            function _initUploadVar() {
                failResult.length = 0;
                successResult.length = 0;
                errorTimes = 0;
                remainNumber = undefined;
            }
            uploader.bind('fileSelect', function(e) {
                // ��ȡ������䵽ns.files�С�
                batchFiles(e.data.fileList);
                // ����ns.files��ֵ��������ʾ״̬����Ⱦhtml��
                renderHTML();

            }).bind('uploadStart', function() {
                // ��ȡ���ļ�������ÿ����һ���ļ��Լ�1
                if(remainNumber === undefined) {
                    remainNumber = ns.files.length;
                }

            }).bind('uploadCompleteData', function(e) {
                // ÿ���ļ��ϴ��ɹ����ᴥ�����¼�
                var data = window.eval('(' + e.data.data + ')');
                data.fileId = e.data.id;
                if(data.status === false) {
                    failResult.push(data);
                }else {
                    successResult.push(data);
                }

                // ��ͼƬȫ���ϴ��Ժ�ͳһ��һ�β���
                if( (--remainNumber) == 0) {
                    endHandle(successResult, failResult);

                    beUploading(false);
                    _initUploadVar();
                }

            }).bind('uploadError', function(e) {
                // ���ʧ�ܣ��޷��ϴ����򲻻ᴥ��uploadStart���¼���ֱ��ִ��error�¼�
                // ִ�еĴ�����simUPloadLimit���
                // ����ļ���������simUPloadLimitֵ����ִ��simUPloadLimit��
                // ���С�ڸ�ֵ����ִ�д�����ʵ�ʵ��ļ�����һ�¡�
                var len = ns.files.length;
                len = len < cfg.simUPloadLimit ? len : cfg.simUPloadLimit;
                errorTimes++;

                // ��������ִֻ��һ�Ρ�
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


