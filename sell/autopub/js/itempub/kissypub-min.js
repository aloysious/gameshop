/**
 combined files : 

/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/mvc.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/imgpreview.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/picmanager.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/fileinfo.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/imgspace.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/fileupload.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/upload/itempic.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/basegroup.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/officialgroup.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/customgroup.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/imagetable.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/lap.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/combotable.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/datacenter.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku/manager.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/itempub/sku.js
/home/a.tbcdn.cn/app/dp/insure/autopub/js/publish.js
**/

KISSY.add("itempub/mvc", function(S) {
  S.log("mvc is started");
  var D = S.DOM, J = S.JSON;
  var pipe = new S.Base;
  function Model(ns) {
    this.namespace = ns
  }
  S.augment(Model, {set:function(k, v) {
    var self = this;
    if(S.isObject(k)) {
      S.each(k, function(v, k) {
        self.set(k, v)
      });
      return
    }
    pipe.set(self.namespace + ":" + k, v)
  }, get:function(k) {
    return pipe.get(this.namespace + ":" + k)
  }, onDataChange:function(need, run) {
    var x = [], self = this;
    if(S.isUndefined(need)) {
      run.apply(self.control);
      return
    }
    if(S.isString(need)) {
      need = [need]
    }
    S.each(need, function(n, i) {
      if(n.indexOf(":") === -1) {
        n = need[i] = self.namespace + ":" + n
      }
      x.push("after" + capitalFirst(n) + "Change")
    });
    function invoke() {
      var vs = [], r;
      try {
        S.each(need, function(n) {
          var v = pipe.get(n);
          if(S.isUndefined(v) || S.isNull(v)) {
            throw"datadeletion";
          }
          vs.push(v)
        })
      }catch(e) {
        return
      }
      r = run.apply(self.control, vs);
      r && self.set(r)
    }
    pipe.on(x.join(" "), invoke);
    invoke()
  }});
  var View = function(model) {
    this.model = model
  };
  S.augment(View, {getData:function(dataContainer) {
    this.model.set(J.parse(D.html(dataContainer)))
  }, update:function(key, value) {
    this.model.set(key, value)
  }, use:function(view) {
    this.model.onDataChange(view.need, view.run)
  }});
  var Control = function(ns) {
    if(pipe[ns]) {
      S.log("namespace" + ns + "is used!");
      return
    }
    pipe[ns] = true;
    this.model = new Model(ns);
    this.model.control = this;
    this.view = new View(this.model)
  };
  S.augment(Control, View);
  function capitalFirst(s) {
    s = s + "";
    return s.charAt(0).toUpperCase() + s.substring(1)
  }
  S.log("mvc is ok");
  S.log(["pipeData:", pipe.__attrVals]);
  return Control
});

KISSY.add("itempub/upload/imgpreview", function(S) {
  var TRANSPARNT_IMG;
  function _filterPreload(src) {
    var img = document.createElement("div"), o;
    img.style.cssText = ";width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;" + 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod="image",src="' + src + '")';
    document.body.appendChild(img);
    o = {height:img.offsetHeight, width:img.offsetWidth};
    img.parentNode.removeChild(img);
    S.log(o);
    return o
  }
  function picPreview(cfg) {
    this.cfg = cfg || {}
  }
  S.augment(picPreview, {pvSupported:true, _oldResizeImg:function(img, o) {
    var self = this;
    if(!o) {
      if(img.complete) {
        o = img
      }else {
        img.onload = function() {
          self._oldResizeImg(img, img)
        };
        return
      }
    }
    var tW = this.cfg.maxWidth || 0, tH = this.cfg.maxHeight || 0, oH = o.height, oW = o.width, ratio = oH / oW;
    if(oH > tH) {
      oH = tH;
      oW = tH / ratio
    }
    if(oW > tW) {
      oW = tW;
      oH = tW * ratio
    }
    img.style.width = oW + "px";
    img.style.height = oH + "px"
  }, _resizeImg:S.UA.ie === 6 ? function(img) {
    this._oldResizeImg(img)
  } : function(img) {
    var cfg = this.cfg;
    if(cfg.maxWidth) {
      img.style.width = "auto";
      img.style.maxWidth = cfg.maxWidth + "px"
    }
    if(cfg.maxHeight) {
      img.style.height = "auto";
      img.style.maxHeight = cfg.maxHeight + "px"
    }
  }, previewByUrl:function(src, callback) {
    var img = new Image;
    this._resizeImg(img);
    img.src = src;
    callback(img)
  }, preview:function(inpEl, callback) {
    var file = inpEl.files, supportFile = file && (file = file[0]), proto = this.constructor.prototype, IE = S.UA.ie;
    if(supportFile && window.FileReader) {
      proto.preview = function(inpEl, callback) {
        var reader = new FileReader, self = this;
        reader.onload = function(e) {
          self.previewByUrl(e.target.result, callback)
        };
        reader.onerror = function(e) {
          self._notSupport(inpEl, callback)
        };
        reader.readAsDataURL(inpEl.files[0])
      }
    }else {
      if(supportFile && file.getAsDataURL) {
        proto.preview = function(inpEl, callback) {
          this.previewByUrl(inpEl.files[0].getAsDataURL(), callback)
        }
      }else {
        if(IE > 6 && IE < 9) {
          TRANSPARNT_IMG = IE > 7 ? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" : "http://img01.taobaocdn.com/tps/i1/T1M8CjXf8lXXXXXXXX-1-1.gif";
          proto.preview = function(inpEl, callback) {
            var file, img, preImg;
            inpEl.select();
            try {
              file = document.selection.createRange().text
            }catch(e) {
              proto.preview = this._notSupport;
              this.preview(inpEl, callback);
              return
            }finally {
              document.selection.empty()
            }
            preImg = _filterPreload(file);
            img = new Image;
            img.src = TRANSPARNT_IMG;
            this._oldResizeImg(img, preImg);
            img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod="scale",src="' + file + '")';
            callback(img)
          }
        }else {
          if(IE === 6) {
            proto.preview = function(inpEl, callback) {
              this.previewByUrl(inpEl.value, callback)
            }
          }else {
            proto.preview = this._notSupport
          }
        }
      }
    }
    this.preview(inpEl, callback)
  }, _notSupport:function(inpEl, callback) {
    var proto = this.constructor.prototype;
    proto.pvSupported = false;
    proto._notSupport = function(inpEl, callback) {
      var file = inpEl.value, img, x;
      x = file.lastIndexOf("\\");
      if(x === -1) {
        x = file.lastIndexOf("/")
      }
      file = file.substr(x + 1);
      img = document.createElement("ins");
      img.title = file;
      img.className = "img";
      img.innerHTML = file;
      callback(img, true)
    };
    this._notSupport(inpEl, callback)
  }});
  return picPreview
});

KISSY.add("itempub/upload/picmanager", function(S, ImgPreview) {
  var D = S.DOM, E = S.Event;
  var defCfg = {itemSel:".pm-item", dataUrlSel:".J_PicUrl", picElSel:".preview", actSel:".act", sampleSel:".examp", itemcont:".pm-itemcont"};
  var PIC_DATA = "data-picdata";
  function clearFileInput(el) {
    el.value = "";
    if(el.value) {
      S.log("use clear by reset");
      var next = el.nextSibling, parent = el.parentNode;
      var frm = document.createElement("form");
      frm.appendChild(el);
      frm.reset();
      next ? parent.insertBefore(el, next) : parent.appendChild(el)
    }
  }
  function PicManager(container, cfg) {
    if(!container) {
      return
    }
    this.cfg = S.merge(cfg, defCfg);
    this.container = container;
    this.itemLis = S.query(this.cfg.itemSel, container);
    this._initData();
    this._initEvent()
  }
  S.augment(PicManager, ImgPreview, {_initData:function() {
    var self = this, dataUrl, tort, picEl;
    S.each(this.itemLis, function(li, id) {
      dataUrl = S.get(self.cfg.dataUrlSel, li);
      if(id === 0) {
        picEl = S.get(self.cfg.picElSel, li);
        tort = picEl.innerHTML
      }
      if(dataUrl.value) {
        self.update(li, dataUrl.value);
        if(tort && picEl) {
          picEl.innerHTML += tort
        }
      }
    })
  }, _initEvent:function() {
    var self = this;
    E.on(this.container, "click", function(e) {
      var tg = e.target, act;
      if(act = tg.getAttribute("data-act")) {
        self[act](D.parent(tg, self.cfg.itemSel))
      }
    });
    E.on(this.itemLis, "mouseover", function(e) {
      var preview = S.get(self.cfg.picElSel, this), act = S.get(self.cfg.actSel, this);
      if(S.trim(preview.innerHTML)) {
        act.style.display = "block"
      }
    });
    E.on(this.itemLis, "mouseout", function(e) {
      var act = S.get(self.cfg.actSel, this);
      act.style.display = "none"
    })
  }, _changeCont:function(frm, to) {
    var cont = D.get(this.cfg.itemcont, frm), cont2 = D.get(this.cfg.itemcont, to);
    frm.appendChild(cont2);
    to.appendChild(cont)
  }, moveLeft:function(li) {
    var prev = D.prev(li);
    prev && this._changeCont(li, prev)
  }, moveRight:function(li) {
    var next = D.next(li);
    next && this._changeCont(li, next)
  }, del:function(li) {
    this.update(li)
  }, add:function(data) {
    var li, self = this, cont, dataUrl, exist;
    S.each(this.itemLis, function(el) {
      if(dataUrl = S.get(self.cfg.dataUrlSel, el)) {
        if(dataUrl.value === data) {
          exist = true;
          return false
        }
      }
      cont = S.get(self.cfg.itemcont, el);
      if(!cont.getAttribute(PIC_DATA)) {
        li = el;
        return false
      }
    });
    if(exist) {
      return{error:true, type:"exist"}
    }else {
      if(li) {
        this.update(li, data);
        return{result:false}
      }else {
        return{error:true, type:"overnum"}
      }
    }
  }, loading:function(itemEl, load) {
    var el = D.parent(itemEl, this.cfg.itemSel);
    if(load === 1) {
      D.addClass(el, "loading");
      this.disable(itemEl)
    }else {
      D.removeClass(el, "loading");
      this.able(itemEl)
    }
  }, disable:function(itemEl) {
    S.log(["disable", itemEl]);
    var p = D.parent(itemEl, this.cfg.itemcont);
    D.addClass(p, "pm-disabled")
  }, able:function(itemEl) {
    S.log(["able", itemEl]);
    var p = D.parent(itemEl, this.cfg.itemcont);
    D.removeClass(p, "pm-disabled")
  }, update:function(li, pic, noPreview) {
    if(!D.test(li, this.cfg.itemSel)) {
      li = D.parent(li, this.cfg.itemSel)
    }
    var cont = S.get(this.cfg.itemcont, li), dataUrlEl = S.get(this.cfg.dataUrlSel, cont), picEl = S.get(this.cfg.picElSel, cont), dataFormEl = D.filter("input", function(el) {
      return el.type === "file"
    }, cont)[0];
    if(!pic) {
      picEl.innerHTML = "";
      cont.setAttribute(PIC_DATA, "");
      dataUrlEl.value = "";
      clearFileInput(dataFormEl);
      D.removeClass(cont, "hasCont")
    }else {
      S.log("preview");
      if(S.isString(pic)) {
        cont.setAttribute(PIC_DATA, "url");
        dataUrlEl.value = pic;
        clearFileInput(dataFormEl);
        if(!noPreview) {
          picEl.innerHTML = "";
          this.previewByUrl(pic + "_100x100.jpg", function(img) {
            picEl.appendChild(img)
          })
        }
      }else {
        cont.setAttribute(PIC_DATA, "form");
        dataUrlEl.value = "";
        if(!noPreview) {
          picEl.innerHTML = "";
          this.preview(pic, function(img) {
            picEl.appendChild(img)
          })
        }
      }
      D.addClass(cont, "hasCont")
    }
  }, batchUpdateUrl:function(data) {
    var index = 0, self = this, cont;
    S.each(this.itemLis, function(li) {
      cont = S.get(self.cfg.itemcont, li);
      if(cont.getAttribute(PIC_DATA) === "form") {
        self.update(li, data[index++], self.pvSupported)
      }
    })
  }, isLoading:function() {
    var loading = false;
    S.each(this.itemLis, function(li) {
      if(D.hasClass(li, "loading")) {
        loading = true
      }
    });
    return loading
  }});
  return PicManager
}, {requires:["./imgpreview"]});

KISSY.add("itempub/upload/fileinfo", function(S) {
  function fileInfo(inpEl, callback) {
    var file, x, extension, name;
    if(inpEl.files && (file = inpEl.files[0])) {
      name = file.name;
      file.extension = name.substr(name.lastIndexOf(".") + 1);
      callback(file)
    }else {
      file = inpEl.value;
      x = file.lastIndexOf("\\");
      if(x === -1) {
        x = file.lastIndexOf("/")
      }
      name = file.substr(x + 1);
      extension = name.substr(name.lastIndexOf(".") + 1).toLowerCase();
      file = {name:name, extension:extension};
      if("png|jpg|jpeg|bmp|gif".indexOf(extension) !== -1 && S.UA.ie === 6) {
        var img = new Image;
        img.onload = function() {
          file.size = this.fileSize;
          callback(file)
        };
        img.src = inpEl.value
      }else {
        callback(file)
      }
    }
  }
  return fileInfo
});

KISSY.add("itempub/upload/imgspace", function(S) {
  var D = S.DOM, E = S.Event;
  var TOGGLE_CLS = "J_Toggle", BAR_CLS = "imgSpaceBar", FRAME_CLS = "picFrame", INSERT_EVENT = "insert", defCfg = {firstShow:null, use:["space"], frameSrc:"nTadget.html", modulesData:{space:"\u4ece\u56fe\u7247\u7a7a\u95f4\u9009\u62e9", insert:"\u63d2\u5165\u56fe\u7247"}};
  function ImageSpace(container, cfg) {
    this.container = S.get(container);
    this.cfg = S.merge(defCfg, cfg);
    this._init()
  }
  S.augment(ImageSpace, S.EventTarget, {_init:function() {
    this._initBar();
    this.addModules(this.cfg.use);
    if(this.cfg.firstShow) {
      this.toggle(this.cfg.firstShow)
    }
  }, _initBar:function() {
    var self = this, bar = document.createElement("div");
    bar.className = BAR_CLS;
    this.container.appendChild(bar);
    E.on(bar, "click", function(e) {
      var tg = e.target;
      if(D.hasClass(tg, TOGGLE_CLS)) {
        self.toggle(tg.getAttribute("data-module"))
      }
    });
    this.bar = bar
  }, _createFrame:function() {
    var frame = document.createElement("iframe");
    frame.setAttribute("frameBorder", "0");
    frame.className = FRAME_CLS;
    this.container.appendChild(frame);
    return frame
  }, _initCont:function(callback) {
    var self = this;
    this.frame = S.get(FRAME_CLS, this.container) || this._createFrame();
    E.on(this.frame, "load", function() {
      self.modules = self.frame.contentWindow.TB.Sell.Modules.uploadSpace;
      self.modules.on("resize", function(data) {
        self.frame.style.height = data.height + "px"
      });
      self.modules.on("insert", function(data) {
        self.fire(INSERT_EVENT, data)
      });
      self.frame.style.height = self.frame.contentWindow.document.body.offsetHeight + 10 + "px";
      callback.call(self)
    });
    this.frame.src = this.cfg.frameSrc
  }, addModules:function(modules) {
    var self = this;
    modules = S.isArray(modules) ? modules : [modules];
    S.each(modules, function(name) {
      var link = document.createElement("a");
      link.className = TOGGLE_CLS;
      link.setAttribute("data-module", name);
      link.innerHTML = self.cfg.modulesData[name];
      self.bar.appendChild(link)
    })
  }, toggle:function(name) {
    S.each(S.query("." + TOGGLE_CLS, this.bar), function(item) {
      if(item.getAttribute("data-module") === name && !D.hasClass(item, "expanded")) {
        D.addClass(item, "expanded")
      }else {
        D.removeClass(item, "expanded")
      }
    });
    if(!this.frame) {
      this._initCont(function() {
        this.modules.toggle(name)
      })
    }else {
      this.modules.toggle(name)
    }
  }});
  return ImageSpace
});

KISSY.add("itempub/upload/fileupload", function(S) {
  var E = S.Event, io = S.io, EVENTS = {UPLOADCOMPLETE:"uploadComplete", UPLOADERROR:"uploadError"};
  var FileUpload = function(inpEls, cfg) {
    this.inputs = S.isArray(inpEls) ? inpEls : [inpEls];
    this.cfg = cfg || {};
    this.form = this._createForm();
    this._temInputs = []
  };
  S.augment(FileUpload, E.Target, {_createForm:function() {
    var oForm = document.createElement("form");
    oForm.style.display = "none";
    oForm.setAttribute("method", "post");
    oForm.setAttribute("enctype", "multipart/form-data");
    oForm.setAttribute("encoding", "multipart/form-data");
    document.body.appendChild(oForm);
    return oForm
  }, _copyInputs:function() {
    var self = this;
    S.each(this.inputs, function(inpEl, i) {
      var next = inpEl.nextSibling, parent = inpEl.parentNode;
      self._temInputs[i] = next ? function() {
        parent.insertBefore(inpEl, next)
      } : function() {
        parent.appendChild(inpEl)
      };
      self.form.appendChild(inpEl)
    })
  }, _resume:function() {
    var self = this;
    S.each(self._temInputs, function(rusume, i) {
      rusume();
      self._temInputs[i] = null
    })
  }, upload:function(data) {
    if(data) {
      data = S.merge(data, this.cfg.data || {})
    }
    var self = this, form = this.form;
    this._copyInputs();
    S.log(data);
    io({url:this.cfg.url, type:"post", dataType:"json", form:form, data:data, serializeArray:false, timeout:2E4, success:function(data) {
      S.log(["upload complete:", data]);
      data.success && form.reset();
      self._resume();
      self.fire(EVENTS.UPLOADCOMPLETE, {data:data})
    }, error:function() {
      S.log("xhr error");
      self._resume();
      self.fire(EVENTS.UPLOADERROR)
    }, complete:function() {
      S.log("upload handle complete")
    }})
  }});
  return FileUpload
});

KISSY.add("itempub/upload/itempic", function(S, MVC, PicManage, fileInfo, ImgSpace, FileUpload) {
  S.log("itemPic is started");
  var E = S.Event, D = S.DOM;
  var itemPic = new MVC("itemPic");
  function clearFileInput(el) {
    el.value = "";
    if(el.value) {
      S.log("use clear by reset");
      var next = el.nextSibling, parent = el.parentNode;
      var frm = document.createElement("form");
      frm.appendChild(el);
      frm.reset();
      next ? parent.insertBefore(el, next) : parent.appendChild(el)
    }
  }
  function showSubmitLoading(isLoading, hostTrigger) {
    var elLoader = D.get(".J_SubmitLoader");
    if(isLoading) {
      if(!elLoader) {
        elLoader = D.create('<div class="submit-loader J_SubmitLoader">\u5b9d\u8d1d\u56fe\u7247\u4e0a\u4f20\u4e2d\uff0c\u8bf7\u7a0d\u540e\u2026</div>');
        var parent = hostTrigger ? hostTrigger.parentNode : D.get("div.submit");
        parent && parent.appendChild(elLoader)
      }
      D.show(elLoader)
    }else {
      D.hide(elLoader)
    }
  }
  var Logics = {checkFile:{need:"file", run:function(file) {
    if("png|jpg|jpeg|bmp|gif".indexOf(file.extension.toLowerCase()) === -1) {
      return this.update({error:{info:"\u8bf7\u9009\u62e9\u56fe\u7247!", file:file}})
    }
    if(file.size && file.size > 5E5) {
      return this.update({error:{info:"\u56fe\u7247\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7500K\uff01", file:file}})
    }
    this.update({fileVaildated:file})
  }}};
  var Views = {init:{need:["picManagerWrap", "tadgetWrap", "picUploadApi", "picTadgatSrc", "data"], run:function(picManagerWrap, tadgetWrap, picUploadApi, picTadgatSrc, data) {
    var fileInputs = D.filter("input", function(el) {
      return el.type === "file"
    }, picManagerWrap), self = this;
    var picManager = new PicManage(picManagerWrap, {maxHeight:88, maxWidth:88});
    var imgSpace = new ImgSpace(tadgetWrap, {frameSrc:picTadgatSrc, use:["space"]});
    S.each(fileInputs, function(ipt, idx) {
      var uploader = new FileUpload(ipt, {url:picUploadApi, data:data});
      uploader.idx = idx + 1;
      uploader.on("uploadComplete", function(data) {
        self.update({fileUploadCompleteData:{data:data.data, el:ipt}})
      });
      uploader.on("uploadError", function() {
        self.update("fileUploadXHRErrorData", {el:ipt})
      });
      ipt.__uploader = uploader
    });
    E.on(fileInputs, "change", function(e) {
      S.log("change");
      this.value && fileInfo(this, function(f) {
        f.srcEl = e.target;
        self.update({file:f})
      })
    });
    imgSpace.on("insert", function(data) {
      var ret = picManager.add(data.src);
      if(ret.error) {
        ret.info = ret.type == "exist" ? "\u540c\u4e00\u5f20\u56fe\u7247\u4e0d\u80fd\u591a\u6b21\u6dfb\u52a0" : ret.type === "overnum" ? "\u6700\u591a\u53ea\u80fd\u9009\u62e95\u5f20\u56fe\u7247" : ret.type;
        self.update({error:ret})
      }
    });
    this.update({picManager:picManager})
  }}, fileChange:{need:["fileVaildated", "picManager", "picManagerWrap"], run:function(fileVaildated, picManager, picManagerWrap) {
    var el = fileVaildated.srcEl, self = this, uploader = el.__uploader, relEl = el.parentNode;
    picManager.update(el, el);
    setTimeout(function() {
      uploader.upload({pos:uploader.idx});
      S.log("loading");
      picManager.loading(relEl, 1)
    }, 500)
  }}, fileUploadXHRError:{need:["fileUploadXHRErrorData", "picManager"], run:function(fileUploadXHRData, picManager) {
    picManager.loading(fileUploadXHRData.el, 0)
  }}, fileUploadComplete:{need:["fileUploadCompleteData", "picManager"], run:function(fileUploadCompleteData, picManager) {
    S.log(fileUploadCompleteData);
    picManager.loading(fileUploadCompleteData.el, 0);
    var data = fileUploadCompleteData.data;
    if(data.success) {
      picManager.update(fileUploadCompleteData.el, data.picPath, picManager.pvSupported)
    }
  }}, error:{need:["error"], run:function(error) {
    if(error.file && error.file.srcEl) {
      clearFileInput(error.file.srcEl)
    }
    alert(error.info)
  }}};
  itemPic.init = function() {
    var self = this, elConfig = D.get("#J_ModItemPic");
    if(!elConfig) {
      return
    }
    self.getData(elConfig);
    self.update({picManagerWrap:S.get(".pic-manager2"), tadgetWrap:S.get(".J_picTadget")});
    S.each(S.merge(Logics, Views), function(v) {
      self.use(v)
    })
  };
  var timer;
  itemPic.valid = function(updatePipe, trigger) {
    timer && clearTimeout(timer);
    var self = this, picManager = self.model.get("picManager");
    if(!picManager || !picManager.isLoading()) {
      updatePipe(true);
      return
    }
    showSubmitLoading(true, trigger);
    validate();
    function validate() {
      S.log("timer validate");
      if(!picManager.isLoading()) {
        showSubmitLoading(false, trigger);
        clearTimeout(timer);
        updatePipe(true)
      }else {
        timer = setTimeout(validate, 500)
      }
    }
  };
  S.log("itemPic is ok!");
  return itemPic
}, {requires:["../mvc", "./picmanager", "./fileinfo", "./imgspace", "./fileupload"]});

KISSY.add("itempub/sku/basegroup", function(S) {
  var D = S.DOM, E = S.Event, CLS_DISABLED = "disabled";
  function _enable(inputs, isEnable) {
    var val = isEnable ? false : true;
    D.prop(inputs, "disabled", val)
  }
  var BaseGroup = function() {
    this.init.apply(this, arguments)
  };
  S.augment(BaseGroup, S.EventTarget, {init:function(elGroup) {
    var self = this;
    self.elGroup = elGroup;
    self.isDisabled = D.hasClass(elGroup, CLS_DISABLED);
    self.elBox = D.get(".sku-box", elGroup);
    self.formFields = D.query("input", elGroup)
  }, disable:function() {
    var self = this;
    if(!self.isDisabled) {
      _enable(self.formFields, false);
      D.addClass(self.elGroup, CLS_DISABLED);
      self.isDisabled = true
    }
  }, enable:function() {
    var self = this;
    if(self.isDisabled) {
      _enable(self.formFields, true);
      D.removeClass(self.elGroup, CLS_DISABLED);
      self.isDisabled = false
    }
  }});
  return BaseGroup
});

KISSY.add("itempub/sku/officialgroup", function(S, BaseGroup) {
  var D = S.DOM, E = S.Event, CLS_COLLAPSE = "collapse", EMPTY = "", FEATURE_EDIT = "edit", FEATURE_LIST = "list", FEATURE_IMAG = "image";
  var OfficialGroup = function() {
    OfficialGroup.superclass.constructor.apply(this, arguments)
  };
  function fetchNodeData(node) {
    var parent = node.parentNode, elAlias = D.get(".editbox", parent), elName = D.get(".labelname", parent), pv = node.value;
    return{id:pv.replace(":", "-"), pv:pv, alias:encodeHTML(D.val(elAlias)), name:encodeHTML(D.text(elName)), color:node.getAttribute("data-color"), imgThumb:node.getAttribute("data-thumb"), imgPath:node.getAttribute("data-path")}
  }
  function encodeHTML(text) {
    return text && S.escapeHTML(text)
  }
  function toggleDisplayMode(box) {
    var chkboxs = D.query(".J_Checkbox", box);
    S.each(chkboxs, function(chkbox) {
      var parent = D.parent(chkbox, ".sku-item");
      D[chkbox.checked ? "addClass" : "removeClass"](parent, "edit")
    })
  }
  S.extend(OfficialGroup, BaseGroup, {init:function(elGroup, cfg) {
    OfficialGroup.superclass.init.apply(this, arguments);
    var self = this, caption = D.attr(elGroup, "data-caption"), features = D.attr(elGroup, "data-features") || FEATURE_LIST, isRequired = D.hasClass(elGroup, "required");
    self.type = "OfficialGroup";
    self.caption = caption;
    self.features = features;
    self.isRequired = isRequired;
    self.fetchData();
    self._bindEvent()
  }, hasFeature:function(feature) {
    return this.features.indexOf(feature) != -1
  }, _bindEvent:function() {
    var self = this, elBox = self.elBox, isEditable = self.hasFeature(FEATURE_EDIT);
    E.delegate(elBox, "click", function(chkbox) {
      if(D.hasClass(chkbox, "J_Checkbox") || D.hasClass(chkbox, "J_CheckAll")) {
        return true
      }
    }, function(ev) {
      var target = ev.currentTarget, isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE), oldData = self.fields, checked = target.checked, chkboxs = [target];
      if(D.hasClass(target, "J_CheckAll")) {
        chkboxs = D.filter(D.query(".J_Checkbox", elBox), function(el) {
          return el.checked == !checked && !(isCollapse && D.hasClass(D.parent(el, "li"), "hide"))
        });
        D.prop(chkboxs, "checked", checked);
        chkboxs.push(target)
      }
      self.fetchData();
      if(self.fire("validBeforeSave") === false) {
        D.prop(chkboxs, "checked", !checked);
        self.fields = oldData;
        return
      }
      if(isEditable) {
        toggleDisplayMode(elBox)
      }
      self.fire("dataChanged")
    });
    E.delegate(elBox, "blur", function(el) {
      return el.type == "text" && D.hasClass(el, "editbox")
    }, function(ev) {
      var target = ev.target, parent = D.parent(target, "li"), chkbox = D.get(".J_Checkbox", parent), data = fetchNodeData(chkbox);
      self.fire("dataUpdated", {target:data})
    });
    E.on(D.get(".J_SKUMore", self.elGroup), "click", function(ev) {
      ev.halt();
      self.expandGroup()
    })
  }, expandGroup:function() {
    var self = this, isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE);
    if(isCollapse) {
      D.removeClass(self.elBox, CLS_COLLAPSE)
    }
  }, fetchData:function() {
    this.fields = this.getDataFromNode()
  }, getDataNode:function() {
    var self = this, elBox = self.elBox, isCollapse = D.hasClass(self.elBox, CLS_COLLAPSE), els = D.filter(".J_Checkbox", function(el) {
      var elParent = D.parent(el, "li");
      return!(isCollapse && D.hasClass(elParent, "hide")) && !self.isDisabled && el.checked === true
    }, elBox);
    return els
  }, getDataFromNode:function() {
    var nodes = this.getDataNode(), rt = [];
    S.each(nodes, function(node) {
      rt.push(fetchNodeData(node))
    });
    return rt
  }});
  return OfficialGroup
}, {requires:["./basegroup"]});

KISSY.add("itempub/sku/customgroup", function(S, BaseGroup, Template) {
  var D = S.DOM, E = S.Event, TEMPLATE = '<div class="sku-group sku-custom">' + '<label class="sku-label">' + '<input maxlength="4" class="sku-caption text" value="{{caption}}" name="prop_{{pid}}" type="text" />\uff1a' + "</label>" + '<div class="sku-box">' + '<ul class="sku-list">' + "{{#each fields as it}}" + '<li><input maxlength="10" class="text" pattern="^[^/$/^/:/;/,/./~/-/_]*$" patterninfo="\u683c\u5f0f\u8f93\u5165\u9519\u8bef" name="prop_{{pid}}_{{it.vid}}" value="{{it.name}}" type="text" /></li>' + 
  "{{/each}}" + "</ul>" + '<div class="sku-custom-operations">' + '<a href="javascript:void(0);" class="sku-delgroup J_SKUDelGroup" title="\u5220\u9664">\u5220\u9664</a>' + '<a href="javascript:void(0);" class="sku-enforce J_SKUApplyData">\u4fdd\u5b58</a>' + "</div>" + "</div>" + "</div>", EMPTY = "", CLS_READONLY = "readonly", CLS_BTNEDIT = "sku-btnedit", GUID_PID = 0, GUID_VID = 0;
  function fetchNodeData(node) {
    var pv = node.getAttribute("name").replace("prop_", "");
    return{id:pv, pv:pv.replace("_", ":"), name:encodeHTML(node.value)}
  }
  function encodeHTML(text) {
    return text && S.escapeHTML(text)
  }
  function getRenderData(data, cfg) {
    var renderData = {caption:data.caption || EMPTY, pid:data.pid || CustomGroup.getPropId(), fields:data.fields || []}, fields = renderData.fields, size = cfg.groupSize * 1;
    for(var i = 0;i < size;i++) {
      var item = fields[i];
      if(!item) {
        renderData.fields[i] = {vid:CustomGroup.getValId(), name:""}
      }
    }
    return renderData
  }
  var STATE = {SAVE:{disabled:false, writeable:true, text:"\u4fdd\u5b58"}, EDIT:{disabled:false, writeable:false, text:"\u7f16\u8f91"}, AWAIT:{disabled:true, writeable:true, text:"\u4fdd\u5b58"}};
  var CustomGroup = function() {
    this.init.apply(this, arguments)
  }, defConfig = {groupSize:10, listContainer:"#J_CustomSKUList", extensible:false, pid:0, vid:0};
  S.extend(CustomGroup, BaseGroup, {init:function(data, config) {
    var self = this, cfg = S.merge(defConfig, config), renderData = getRenderData(data, cfg), struct = Template(TEMPLATE).render(renderData);
    self.pid = renderData.pid;
    CustomGroup.superclass.init.call(self, D.create(struct), cfg);
    self.type = "CustomGroup";
    self.writeable = true;
    self.isSaved = true;
    self.theChange = {rebuild:false, items:{}};
    D.append(self.elGroup, cfg.listContainer);
    self.elCaption = D.get(".sku-caption", self.elGroup);
    self.btnApply = D.get(".J_SKUApplyData", self.elBox);
    self.caption = encodeHTML(D.val(self.elCaption));
    self._bindEvent();
    self.fetchData();
    if(self.fields.length > 0) {
      self.setState(STATE.EDIT)
    }else {
      self.setState(STATE.AWAIT)
    }
  }, _bindEvent:function() {
    var self = this, elBox = self.elBox, btnApply = self.btnApply, textFields = D.query("input.text", self.elGroup), bufferDelay = 50;
    S.each(textFields, function(field) {
      var timer;
      E.on(field, "valuechange", function(ev) {
        timer && timer.cancel();
        timer = S.later(function() {
          fnBuffer(ev.target)
        }, bufferDelay)
      })
    });
    function fnBuffer(target) {
      var theChange = self.theChange, isChanged = true, isCaption = D.hasClass(target, "sku-caption"), oldValue = isCaption ? self.caption : EMPTY, newValue = S.trim(target.value), data = fetchNodeData(target);
      data.context = isCaption ? "caption" : "text";
      data.target = target;
      if(!isCaption) {
        S.each(self.fields, function(field) {
          if(field.id == data.id) {
            oldValue = field.name;
            return false
          }
        })
      }
      var empty2text = oldValue == EMPTY && newValue != EMPTY, text2empty = oldValue != EMPTY && newValue == EMPTY;
      if(!empty2text && !text2empty) {
        isChanged = false
      }
      if(isChanged) {
        theChange.rebuild = true
      }else {
        theChange.items[data.id] = data
      }
      var hasCaption = S.trim(self.elCaption.value) !== EMPTY, hasText = S.some(textFields, function(field) {
        return S.trim(field.value) != EMPTY && field != self.elCaption
      });
      self.setState(hasCaption && hasText ? STATE.SAVE : STATE.AWAIT);
      self.isSaved = false
    }
    E.on(btnApply, "click", function(ev) {
      ev.halt();
      if(!D.hasClass(btnApply, "disabled") && !self.isDisabled) {
        self.buttonToggle()
      }
    });
    E.on(D.get(".J_SKUDelGroup", elBox), "click", function(ev) {
      ev.halt();
      if(confirm("\u60a8\u786e\u5b9a\u8981\u5220\u9664\u8be5\u9500\u552e\u5c5e\u6027\uff1f")) {
        D.remove(self.elGroup);
        self.fire("remove");
        self.fire("dataChanged")
      }
    })
  }, fetchData:function() {
    var self = this;
    self.caption = encodeHTML(S.trim(self.elCaption.value));
    self.fields = self.getDataFromNode()
  }, getDataNode:function() {
    var self = this, nodes = D.filter("input", function(el) {
      return!self.isDisabled && el.type === "text" && S.trim(el.value) !== EMPTY
    }, self.elBox);
    return nodes
  }, getDataFromNode:function() {
    var nodes = this.getDataNode(), rt = [];
    S.each(nodes, function(node) {
      rt.push(fetchNodeData(node))
    });
    return rt
  }, buttonToggle:function() {
    var self = this;
    if(self.writeable) {
      self.dataApply()
    }else {
      self.setState(STATE.SAVE)
    }
  }, setState:function(state) {
    var button = this.btnApply, isWriteable = state.writeable, method = isWriteable ? "removeClass" : "addClass";
    D.text(button, state.text);
    D[state.disabled ? "addClass" : "removeClass"](button, "disabled");
    if(this.writeable !== isWriteable) {
      D[method](button, CLS_BTNEDIT);
      D[method](this.elGroup, CLS_READONLY);
      this.writeable = isWriteable;
      S.each(this.formFields, function(field) {
        if(field.type == "text") {
          D.prop(field, "readonly", isWriteable ? false : true)
        }
      })
    }
  }, dataApply:function() {
    var self = this, theChange = self.theChange;
    if(self.fire("validBeforeSave") === false) {
      return
    }
    if(theChange.rebuild) {
      self.fetchData();
      self.fire("dataChanged")
    }else {
      self.caption = self.elCaption.value;
      self.fire("dataUpdated", {items:theChange.items})
    }
    self.theChange = {rebuild:false, items:{}};
    self.setState(STATE.EDIT);
    self.isSaved = true
  }, hasSaved:function() {
    return this.isDisabled || this.isSaved
  }, focus:function() {
    try {
      this.elCaption.focus()
    }catch(ex) {
    }
  }, fetchCPVId:function() {
    var self = this, vids = [], pid = self.pid, rt;
    self.fetchData();
    if(self.caption !== EMPTY) {
      S.each(self.fields, function(field) {
        vids.push(field.pv.replace(pid + ":", EMPTY))
      });
      rt = vids.length > 0 ? pid + ":" + vids.join(",") : EMPTY
    }else {
      rt = EMPTY
    }
    return rt
  }});
  S.mix(CustomGroup, {setInitializePV:function(pid, vid) {
    pid && (GUID_PID = pid);
    vid && (GUID_VID = vid)
  }, getPropId:function(name) {
    GUID_PID = GUID_PID - 1;
    return GUID_PID
  }, getValId:function() {
    GUID_VID -= 1;
    return GUID_VID
  }});
  return CustomGroup
}, {requires:["./basegroup", "template"]});

KISSY.add("itempub/sku/imagetable", function(S, Template) {
  var D = S.DOM, E = S.Event, TEMPLATE_TABLE = '<table border="0" cellspacing="0" class="J_SKUImgTable img-table" style="display:none;">' + "<caption>\u989c\u8272\u5c5e\u6027\u56fe\u7247\u4e0a\u4f20\u8868\u683c</caption>" + "<thead>" + "<tr>" + "<th>{{caption}}</th>" + "<th>\u56fe\u7247\uff08{{#if imgRequired}}\u5fc5\u987b\u4e0a\u4f20\u8be5\u989c\u8272\u5bf9\u5e94\u56fe\u7247{{#else}}\u65e0\u56fe\u7247\u53ef\u4e0d\u586b{{/if}}\uff09</th>" + "{{#if hasImg}}" + "<th>\u5df2\u6709\u56fe\u7247</th>" + 
  "{{/if}}" + "</tr>" + "</thead>" + "<tbody></tbody>" + "</table>", TEMPLATE_TR = '<tr id="J_MapImg_{{item.id}}">' + '<td class="tile">' + "{{item.lump}}" + '<span class="J_Map_{{item.id}}">{{item.alias || item.name}}</span>' + "</td>" + '<td><input type="file" name="cpvf_{{item.pv}}" /></td>' + "{{#if hasImg}}" + '<td class="preview">' + "{{#if item.imgThumb && item.imgPath}}" + '<input type="hidden" name="cpvf_old_{{item.pv}}" value="{{item.imgPath}}" />' + '<a target="_blank" href="{{item.imgThumb}}"><img src="{{item.imgThumb}}_24x24.jpg" /></a>' + 
  '<a class="del" href="javascript:void(0);">\u5220\u9664</a>' + '<a class="undel" data-path="{{item.imgPath}}" href="javascript:void(0);">\u6062\u590d\u5220\u9664</a>' + "{{#else}}" + "\u5f53\u524d\u65e0\u56fe\u7247" + "{{/if}}" + "</td>" + "{{/if}}" + "</tr>", EMPTY = "", defConfig = {imgRequired:false};
  var ImageTable = function() {
    this.init.apply(this, arguments)
  };
  function getAllFields(elContainer) {
    return getDataFromNode(D.query(".J_Checkbox", elContainer))
  }
  function getDataFromNode(nodes) {
    var rt = [];
    S.each(nodes, function(node) {
      var parent = node.parentNode, elAlias = D.get(".editbox", parent), elName = D.get(".labelname", parent), pv = node.value;
      rt.push({id:pv.replace(":", "-"), pv:pv, alias:encodeHTML(D.val(elAlias)), name:encodeHTML(D.text(elName)), color:node.getAttribute("data-color"), imgThumb:node.getAttribute("data-thumb"), imgPath:node.getAttribute("data-path")})
    });
    return rt
  }
  function encodeHTML(text) {
    return text && S.escapeHTML(text)
  }
  S.augment(ImageTable, S.EventTarget, {init:function(skuGroup, cfg) {
    var self = this;
    self.skuGroup = skuGroup;
    self.cfg = S.merge(defConfig, cfg);
    self._buildTable()
  }, _buildTable:function() {
    var self = this, skuGroup = self.skuGroup, caption = skuGroup.caption, groupItems = getAllFields(skuGroup.elGroup), hasImg = S.some(groupItems, function(it) {
      return it.imgThumb && it.imgPath
    });
    var structData = {caption:caption, imgRequired:self.cfg.imgRequired, hasImg:hasImg}, struct = Template(TEMPLATE_TABLE).render(structData), table = D.create(struct), parent = D.get(".sku-box", skuGroup.elGroup);
    self.tbody = D.get("tbody", table);
    self.table = table;
    self._buildTrs(groupItems, hasImg);
    D.append(table, parent);
    self._bindEvent()
  }, _buildTrs:function(groupData, hasImg) {
    var fragment = document.createDocumentFragment(), specialColors = ["transparent", "assortment"], lumpStructImg = '<i class="color-lump color-{color}"></i>', lumpStructPix = '<i class="color-lump" style="background-color:#{color};"></i>';
    S.each(groupData, function(item) {
      var lumpStruct = S.inArray(item.color, specialColors) ? lumpStructImg : lumpStructPix;
      item.lump = S.substitute(lumpStruct, {color:item.color});
      var rowData = {item:item, hasImg:hasImg}, rowStruct = Template(TEMPLATE_TR).render(rowData), row = D.create(rowStruct);
      fragment.appendChild(row)
    });
    this.tbody.appendChild(fragment)
  }, _bindEvent:function() {
    var self = this;
    E.delegate(this.tbody, "click", "a", function(ev) {
      ev.halt();
      var target = ev.target, parent = D.parent(target, "td"), hidden = D.get("input", parent);
      if(D.hasClass(target, "del")) {
        hidden.value = EMPTY;
        D.addClass(parent, "deled")
      }else {
        if(D.hasClass(target, "undel")) {
          hidden.value = target.getAttribute("data-path");
          D.removeClass(parent, "deled")
        }
      }
    })
  }, toggle:function() {
    var self = this, data = self.skuGroup.fields, table = self.table, tbody = self.tbody;
    if(data.length === 0) {
      D.hide(table);
      return
    }
    D.hide(D.query("tr", tbody));
    S.each(data, function(item) {
      var el = D.get("#J_MapImg_" + item.id);
      if(el) {
        D.show(el);
        return
      }
    });
    D.show(table)
  }});
  return ImageTable
}, {requires:["template"]});

KISSY.add("itempub/sku/lap", function(S) {
  var isRuning = false, config = {duration:300, delay:50}, lapQueue = [], lapItem = null;
  var lap = {handle:function(handler) {
    this.handlers.push(handler)
  }, batch:function(handler) {
    this.batchs.push(handler)
  }, then:function(callback) {
    this.callbacks.push(callback)
  }, start:function() {
    var self = this, data = self.data;
    if(isRuning) {
      lapQueue.push(self);
      return
    }
    isRuning = true;
    lapItem = lapQueue.shift() || self;
    self.then(function() {
      isRuning = false;
      lapQueue[0] && lapQueue[0].start()
    });
    doHandleIt(data, self);
    self.start = function() {
      if(self.isPause) {
        self.isPause = false;
        doHandleIt(data, self)
      }
    }
  }, pause:function() {
    this.isPause = true
  }, stop:function() {
    this.isStop = true;
    this.data.length = 0;
    if(this.isPause) {
      S.each(this.callbacks, function(callback) {
        callback()
      })
    }
  }};
  function doHandleIt(data, lap) {
    if(data.length === 0) {
      if(!this.isStop) {
        S.each(this.callbacks, function(callback) {
          callback()
        })
      }
      return
    }
    setTimeout(function() {
      handleIt(data, lap)
    }, 0)
  }
  function handleIt(data, lap) {
    var endtime = +new Date + lap.duration, localIndex = -1;
    do {
      var _data = data.shift();
      lap.doIndex++;
      localIndex++;
      S.each(lap.handlers, function(handler) {
        handler(_data, lap.doIndex, localIndex)
      })
    }while(data.length > 0 && endtime > +new Date && !lap.isPause);
    S.each(lap.batchs, function(batch) {
      batch(lap.doIndex)
    });
    if(lap.isPause && data.length > 0) {
      return
    }
    if(data.length > 0) {
      setTimeout(function() {
        handleIt(data, lap)
      }, lap.delay)
    }else {
      lap.isStop = true;
      S.each(lap.callbacks, function(callback) {
        callback()
      })
    }
  }
  function process(data, cfg) {
    var conf = S.merge(config, cfg), variables = {data:[].concat(data), doIndex:-1, isFinish:false, callbacks:[], handlers:[], batchs:[]};
    return S.merge(conf, variables, lap)
  }
  return process
});

KISSY.add("itempub/sku/combotable", function(S, Template, Lap) {
  var D = S.DOM, E = S.Event, TEMPLATE_TABLE = '<table border="0" cellspacing="0" style="visibility:hidden;">' + "<caption>\u9500\u552e\u5c5e\u6027\u5339\u914d\u8868</caption>" + "<thead>" + "<tr>" + "{{#each captions as caption}}" + '<th class="J_Map_{{caption.id}}">{{caption.caption}}</th>' + "{{/each}}" + "{{#if config.showPrice}}" + "<th>\u4e00\u53e3\u4ef7<em>*</em></th>" + "{{/if}}" + "<th>\u5546\u5bb6\u7f16\u7801<em>*</em></th>" + "<th>\u4fdd\u9669\u7b80\u4ecb</th>" + "</tr>" + "</thead>" + 
  "<tbody>" + "</tbody>" + "</table>", TEMPLATE_ROW = "<tr>" + "{{#each it.items as item}}" + "{{#if it.index % item.size == 0}}" + '<td rowspan="{{item.size}}" {{#if item.color}}class="tile"{{/if}}>' + "{{item.lump}}" + '<span class="J_Map_{{item.id}}">' + "{{item.alias || item.name}}" + "</span>" + "</td>" + "{{/if}}" + "{{/each}}" + "{{#if config.showPrice}}" + '<td class="price">' + '<input type="hidden" name="{{it.id}}:id" value="{{it.data.skuid}}" />' + '<input data-id="{{it.id}}" class="J_MapPrice text" data-type="price" type="number" name="{{it.id}}:p" value="{{it.data.price}}" required />' + 
  "{{#if config.isDistribution && it.data.region}}" + '<span class="sku-limit">' + '{{#if it.data.region.indexOf("-") == -1}}' + "(\u89c4\u5b9a\u552e\u4ef7\uff1a{{it.data.region}} \u5143) " + "{{#else}}" + "(\u533a\u95f4\uff1a{{it.data.region}} \u5143)" + "{{/if}}" + "</span>" + "{{/if}}" + "</td>" + "{{/if}}" + '<td class="productid">' + '<input data-id="{{it.id}}" class="J_MapProductid text" data-type="tsc" type="text" name="{{it.id}}:tsc" value="{{it.data.tsc}}" required />' + "</td>" + '<td class="intro">' + 
  '<textarea data-id="{{it.id}}" class="text textarea" data-type="insIntro" type="text" name="{{it.id}}:intro" cols="20">{{it.data.insIntro}}</textarea>' + "</td>" + "</tr>", TEMPLATE_LUMP_IMG = '<i class="color-lump color-{color}"></i>', TEMPLATE_LUMP_PIX = '<i class="color-lump" style="background-color:#{color};"></i>', specialColors = ["transparent", "assortment"], defConfig = {isDistribution:false, showPrice:true, delay:200, duration:300}, MIN_SCROLL_COUNT = 30, elMapContainer, lap;
  function dataAdapter(group, combo, def, distr) {
    var func = new Function("groups", "combo", "defCombo", dynamicFunc(group, distr));
    return func(group, combo, def)
  }
  function dynamicFunc(data, distr) {
    var body = [], ends = [], items = [], pvs = [], captions = [], length = data.length, region = distr.region;
    body.push("var list = [];\n");
    S.each(data, function(group, idx) {
      var size = S.reduce(data.slice(idx + 1), function(preValue, curItem) {
        return preValue * curItem.fields.length
      }, 1);
      body.push("KISSY.each(groups[", idx, "].fields, function(it", idx, ") {\n");
      body.push("var item = it", idx, ', lump = "";');
      body.push("item.size=", size, ";\n");
      body.push("if(item.color) {");
      body.push("var lumpStruct = KISSY.inArray(item.color, ['", specialColors.join("','"), "']) ? '", TEMPLATE_LUMP_IMG, "' : '", TEMPLATE_LUMP_PIX, "';\n");
      body.push("lump = KISSY.substitute(lumpStruct, {color: item.color});");
      body.push("}\n");
      body.push("item.lump=lump;");
      captions.push('{caption:"' + group.caption.replace("\\", "\\\\") + '", id:' + (group.pid || 0) + "}");
      pvs.push("it" + idx + ".pv");
      items.push("it" + idx);
      if(idx == length - 1) {
        body.push("var id=[", pvs.join(), '].join(";");\n');
        body.push("list.push({\n");
        body.push("id: id, index: list.length, ", region ? 'priceLimit: "' + region + '", ' : "", "data: KISSY.merge(defCombo, combo[id]), items:[", items.join(), "]\n");
        body.push("});\n")
      }
      ends.push("});\n")
    });
    body = body.concat(ends);
    body.unshift("var captions=[", captions.join(), "];\n");
    body.push("return {list: list, captions: captions}");
    return body.join("")
  }
  function batchRender(elMapContainer, data) {
    lap && lap.stop();
    if(lap) {
      S.later(function() {
        batchRender(elMapContainer, data)
      }, 10);
      return
    }
    var comboCollection = data.list;
    data.config = defConfig;
    elMapContainer.innerHTML = Template(TEMPLATE_TABLE).render(data);
    var elTable = D.get("table", elMapContainer);
    var fragment = document.createDocumentFragment(), tbody = D.get("tbody", elTable);
    D.scrollTop(elMapContainer, 0);
    lap = Lap(data.list, {duration:defConfig.duration});
    lap.handle(function(it, globalIndex, localIndex) {
      var struct = Template(TEMPLATE_ROW).render({it:it, config:data.config});
      fragment.appendChild(D.create(struct))
    });
    lap.batch(function(globalIndex) {
      tbody.appendChild(fragment);
      D.css(elTable, "visibility", "visible");
      fixRegion(elMapContainer, elTable);
      D.removeClass(elMapContainer, "sku-loading");
      if(globalIndex > MIN_SCROLL_COUNT) {
        lap.pause()
      }
    });
    lap.then(function() {
      tbody.appendChild(fragment);
      lap = null
    });
    lap.start()
  }
  function fixRegion(elMapContainer, elTable) {
    var width = D.width(elTable), height = D.height(elTable), maxWidth = 640, maxHeight = 600;
    if(width > maxWidth) {
      D.css(elMapContainer, {width:maxWidth, "overflow-x":"auto"})
    }else {
      D.css(elMapContainer, {width:"auto", "overflow-x":"hidden"})
    }
    if(height < maxHeight) {
      D.css(elMapContainer, "height", "auto");
      D.css(elMapContainer, "overflowY", "hidden")
    }else {
      D.height(elMapContainer, 600);
      D.css(elMapContainer, "overflowY", "auto")
    }
    S.UA.ie && D.height(elMapContainer.parentNode, D.height(elMapContainer))
  }
  return S.mix({init:function(elContainer, cfg) {
    elMapContainer = S.get(elContainer);
    defConfig = S.merge(defConfig, cfg);
    this._bindEvent()
  }, _bindEvent:function() {
    var self = this;
    E.delegate(elMapContainer, "blur", "input", function(ev) {
      var target = ev.target;
      self.fire("comboChanged", {target:target})
    });
    E.on(elMapContainer, "scroll", S.buffer(lazyload, defConfig.delay));
    function lazyload(ev) {
      lap && lap.start()
    }
  }, render:function(groups, combo, def, distr) {
    var self = this, elSKUMap = elMapContainer.parentNode, data = dataAdapter(groups, combo, def, distr), length = data.list.length;
    self.fire("adapter", {renderData:data});
    if(length === 0) {
      D.hide(elSKUMap);
      return
    }
    D.addClass(elMapContainer, "sku-loading");
    var expectHeight = 32 * data.list.length;
    expectHeight = expectHeight > 600 ? 600 : expectHeight;
    D.height(elMapContainer, expectHeight);
    D.width(elMapContainer, 600);
    S.UA.ie && D.height(elSKUMap, expectHeight);
    D.show(elSKUMap);
    batchRender(elMapContainer, data)
  }}, S.EventTarget)
}, {requires:["template", "./lap"]});

KISSY.add("itempub/sku/datacenter", function(S) {
  var D = S.DOM, E = S.Event, PUSH = Array.prototype.push, EMPTY = "", __default = {}, __combo = {}, __groups = [], __render = {}, sortGroups = {}, defConfig = {suitable:true};
  function filter(groups) {
    var combo = [], selected = [], invalid = [], isSuits = true;
    S.each(groups, function(group) {
      if(group === undefined) {
        return
      }
      var length = group.fields.length, caption = S.trim(group.caption), avaialable = length > 0 && caption !== EMPTY;
      if(isSuits && !avaialable) {
        isSuits = false
      }
      if(group.isRequired || avaialable) {
        selected.push(group)
      }else {
        invalid.push(group)
      }
      if(group.isRequired || avaialable) {
        combo.push(group)
      }
    });
    if(defConfig.suitable && selected.length > 0 && !isSuits) {
      combo = []
    }
    return{combo:combo, selected:selected, invalid:invalid}
  }
  return S.mix({init:function(cfg) {
    var self = this;
    defConfig = S.merge(defConfig, cfg)
  }, dataChange:function() {
    sortGroups = filter(__groups);
    this.fire("dataChanged", {groups:sortGroups})
  }, setDefault:function(key, value) {
    if(value == undefined) {
      return
    }
    __default[key] = value
  }, getDefault:function(key) {
    return key ? __default[key] : __default
  }, setCombo:function(key, value) {
    var item = __combo[key];
    if(!item) {
      __combo[key] = value
    }
  }, getCombo:function(key) {
    return key ? __combo[key] : __combo
  }, setRender:function(data) {
    __render = data
  }, getRender:function() {
    return __render
  }, updateRender:function(items, group) {
    if(!items || items.length === 0) {
      return
    }
    items = S.makeArray(items);
    var idx = S.indexOf(group, sortGroups.combo);
    S.each(__render.list, function(it) {
      var pvs = it.id.split(";");
      S.each(items, function(target, i) {
        if(pvs[idx] == target.pv) {
          var item = it.items[idx];
          item.alias = target.alias || target.name;
          return false
        }
      })
    })
  }, updatePrice:function(price) {
    var self = this;
    S.each(__render.list, function(item) {
      var data = item.data;
      if(data.price === EMPTY) {
        data.price = price;
        var combo = self.getCombo(item.id);
        combo.price = price
      }
    })
  }, removeGroup:function(group) {
    __groups[group.index] = undefined
  }, getGroups:function() {
    return __groups
  }, addGroup:function(group) {
    group.index = __groups.length;
    __groups.push(group)
  }, getSortGroups:function(groups) {
    return filter(__groups)
  }}, S.EventTarget)
});

KISSY.add("itempub/sku/manager", function(S, OfficialGroup, CustomGroup, ImageTable, ComboTable, DataCenter) {
  var D = S.DOM, E = S.Event, unsaveGroup = null, FEATURE_IMAG = "image", MAX_SKUCOUNT = 600, MAX_CUSTOMGROUPS = 4, MAX_COMBOGROUPS = 4;
  function alertSKUCount(valid) {
    if(!valid) {
      alert("\u60a8\u7684\u9500\u552e\u5c5e\u6027\u7684\u7ec4\u5408\u8d85\u8fc7600\u7ec4\uff0c\u4f1a\u5bfc\u81f4\u9875\u9762\u6027\u80fd\u95ee\u9898\uff0c\u8bf7\u9002\u91cf\u5220\u51cf\u81f3600\u7ec4\u4ee5\u4e0b\u3002")
    }
  }
  function FormErrorRender() {
    if(INS.Form && INS.FormPostip) {
      INS.FormPostip.reposAllTip()
    }
  }
  function getSKUCount(group) {
    var groups = DataCenter.getGroups(), count = S.reduce(groups, function(val, curr) {
      if(!curr) {
        return val
      }
      var nodes = !curr.isDisabled && curr == group ? curr.getDataNode() : curr.fields, length = nodes.length;
      return length > 0 ? val * length : val
    }, 1), rt = count <= MAX_SKUCOUNT;
    return rt
  }
  function addCustomGroup(elContainer, data, cfg) {
    var group = new CustomGroup(data, cfg);
    group.on("dataChanged", function(ev) {
      DataCenter.dataChange()
    });
    group.on("validBeforeSave", function(ev) {
      var rt = getSKUCount(group);
      alertSKUCount(rt);
      return rt
    });
    group.on("dataUpdated", function(ev) {
      var items = ev.items, salepropitems = [];
      S.each(items, function(item) {
        var nodes = D.query(".J_Map_" + item.id, elContainer), text = S.escapeHTML(item.target.value);
        if(nodes.length > 0) {
          D.html(nodes, text)
        }
        if(item.context !== "caption") {
          item.alias = text;
          salepropitems.push(item)
        }
      });
      DataCenter.updateRender(salepropitems, this)
    });
    group.on("remove", function() {
      DataCenter.removeGroup(this)
    });
    DataCenter.addGroup(group)
  }
  function addDefaultHidden(elContainer, data) {
    if(!data) {
      return
    }
    var fragment = [], tmpl = '<input type="hidden" name="{key}:id:old" value="{skuid}" /><input type="hidden" name="{key}:p:old" value="{price}" /><input type="hidden" name="{key}:q:old" value="{quantity}" /><input type="hidden" name="{key}:tsc:old" value="{tsc}" />';
    S.each(data, function(val, key) {
      var _data = val;
      _data.key = key;
      fragment.push(S.substitute(tmpl, _data))
    });
    fragment.unshift('<div id="defaultSKUHidden" style="display:none;">');
    fragment.push("</div>");
    D.append(D.create(fragment.join("")), elContainer)
  }
  var buildAvailableCPV = function() {
    var rt = [], groups = DataCenter.getGroups();
    S.each(groups, function(group) {
      if(group && group.type === "CustomGroup") {
        rt.push(group.fetchCPVId())
      }
    });
    return rt.join(";")
  };
  return{init:function(elContainer, data) {
    var self = this, cfg = data.config;
    self.buildOfficialGroup(elContainer, cfg);
    self.buildCustomGroup(elContainer, data.groups, cfg);
    cfg.isDistribution = !!data.distribution;
    self.initComboTable(D.get("#J_SKUMapContainer"), cfg);
    self.initDataCenter(data, cfg);
    addDefaultHidden(elContainer, data.combo)
  }, buildOfficialGroup:function(elContainer, cfg) {
    var elGroups = D.query(".sku-group", elContainer);
    S.each(elGroups, function(elGroup) {
      var group = new OfficialGroup(elGroup);
      if(group.hasFeature(FEATURE_IMAG)) {
        group.ImageTable = new ImageTable(group, cfg);
        group.ImageTable.toggle()
      }
      group.on("dataUpdated", function(ev) {
        var target = ev.target, nodes = D.query(".J_Map_" + target.id, elContainer);
        if(nodes.length === 0) {
          return
        }
        D.html(nodes, target.alias || target.name);
        DataCenter.updateRender(target, this)
      });
      group.on("dataChanged", function(ev) {
        var self = this;
        self.ImageTable && self.ImageTable.toggle();
        DataCenter.dataChange()
      });
      group.on("validBeforeSave", function(ev) {
        var rt = getSKUCount(group);
        alertSKUCount(rt);
        return rt
      });
      DataCenter.addGroup(group);
      if(cfg.suitable) {
        MAX_CUSTOMGROUPS--
      }
    })
  }, buildCustomGroup:function(elContainer, groupDatas, cfg) {
    CustomGroup.setInitializePV(cfg.MAX_PID, cfg.MAX_VID);
    S.each(groupDatas, function(group) {
      addCustomGroup(elContainer, group, cfg)
    })
  }, initComboTable:function(elContainer, data, cfg) {
    ComboTable.init(elContainer, data, cfg);
    ComboTable.on("adapter", function(ev) {
      var data = ev.renderData;
      S.each(data.list, function(it) {
        DataCenter.setCombo(it.id, it.data)
      });
      DataCenter.setRender(data);
      var SKUNodes = S.all("#J_SKUMapContainer input");
      SKUNodes.each(function(node) {
        INS.Form.removeFieldElem(node[0])
      })
    });
    ComboTable.on("comboChanged", function(ev) {
      var target = ev.target, id = target.getAttribute("data-id"), type = target.getAttribute("data-type"), combo = DataCenter.getCombo(), data = combo[id];
      data[type] = target.value;
      DataCenter.setCombo(id, data);
      type === "quantity" && this.fire("quantityChanged");
      type === "price" && this.fire("priceChanged");
      INS.Form.addFieldElem(target)
    })
  }, initDataCenter:function(data, cfg) {
    var distributionData = data.distribution || {};
    DataCenter.init(cfg);
    DataCenter.setDefault("skuid", "0");
    DataCenter.on("dataChanged", function(ev) {
      var groups = ev.groups, comboGroups = groups.combo, comboData = this.getCombo(), defData = this.getDefault();
      ComboTable.render(comboGroups, comboData, defData, distributionData)
    });
    DataCenter.on("dataChanged", function(ev) {
      var groups = ev.groups, length = groups.selected.length, disabled = length >= MAX_COMBOGROUPS ? true : false;
      S.each(groups, function(collection, key) {
        S.each(collection, function(group) {
          group[S.inArray(group, groups.invalid) && disabled ? "disable" : "enable"]()
        })
      })
    });
    S.each(data.combo, function(val, key) {
      DataCenter.setCombo(key, val)
    });
    if(data.distribution) {
      DataCenter.setDefault("caiGouPrice", data.distribution.defaultCaiGouPrice);
      DataCenter.setDefault("region", data.distribution.defaultRegion)
    }
    DataCenter.dataChange()
  }, bindAvaialCPVS:function(input) {
    var getAvailableCPV = buildAvailableCPV;
    buildAvailableCPV = function() {
      var rt = getAvailableCPV();
      input.value = rt
    }
  }, bindAddGroup:function(elAddCustomGroup, elContainer, cfg) {
    E.on(elAddCustomGroup, "click", function(ev) {
      addCustomGroup(elContainer, {}, cfg);
      var isMaxCount = maxCustomGroup();
      disable(isMaxCount);
      var groupNodes = S.all("#J_CustomSKUList .sku-group");
      groupNodes.item(groupNodes.length - 1).all("input").each(function(node) {
        INS.Form.addFieldElem(node[0])
      });
      FormErrorRender()
    });
    DataCenter.on("dataChanged", function(ev) {
      var groups = ev.groups, length = groups.selected.length, isDisabled = length >= MAX_COMBOGROUPS ? true : maxCustomGroup();
      disable(isDisabled)
    });
    function maxCustomGroup() {
      var customGroups = D.query("div.sku-custom", "#J_CustomSKUList"), length = customGroups.length;
      return length >= MAX_CUSTOMGROUPS
    }
    function disable(isDisabled) {
      var method = isDisabled ? "addClass" : "removeClass";
      D.prop(elAddCustomGroup, "disabled", isDisabled);
      D[method](elAddCustomGroup, "disabled")
    }
    S.UA.ie === 6 && E.on(elAddCustomGroup, "mouseenter mouseleave", function(ev) {
      var method = ev.type === "mouseenter" ? "addClass" : "removeClass";
      D[method](this, "hover")
    })
  }, bindPrice:function(elPrice) {
    E.on(elPrice, "blur", function(ev) {
      var target = ev.target, price = S.trim(target.value);
      if(DataCenter.getDefault("price") !== price) {
        setPrice(price);
        S.each(D.query(".J_MapPrice"), function(input) {
          if(S.trim(input.value) === "") {
            var id = D.attr(input, "data-id"), combo = DataCenter.getCombo(id);
            input.value = price;
            combo.price = price
          }
        });
        DataCenter.updatePrice(price)
      }
    });
    setPrice(S.trim(elPrice.value));
    function setPrice(value) {
      DataCenter.setDefault("price", value)
    }
  }, bindQuantity:function(elQuantity) {
    ComboTable.on("quantityChanged", function(ev) {
      var combo = DataCenter.getCombo(), quantity = 0;
      S.each(DataCenter.getRender().list, function(it) {
        var item = combo[it.id];
        quantity += item.quantity * 1 || 0
      });
      elQuantity.value = quantity
    })
  }, hasSaved:function() {
    buildAvailableCPV();
    var isSaved = true;
    S.each(DataCenter.getGroups(), function(group) {
      if(group && group.type == "CustomGroup" && !group.hasSaved()) {
        isSaved = false;
        unsaveGroup = group;
        return false
      }
    });
    return isSaved
  }, showUnsavedTip:function() {
    Atpanel.send("http://www.atpanel.com/tbsell.100.2", {valid:false});
    unsaveGroup && unsaveGroup.focus();
    alert("\u60a8\u6dfb\u52a0\u7684\u9500\u552e\u5c5e\u6027\u6709\u6570\u636e\u672a\u4fdd\u5b58\uff0c\u8bf7\u4fdd\u5b58\u540e\u91cd\u65b0\u63d0\u4ea4\u3002")
  }, expandColors:function() {
    S.each(DataCenter.getGroups(), function(group) {
      if(group && group.type == "CustomGroup" && !group.hasSaved()) {
        isSaved = false;
        unsaveGroup = group;
        return false
      }
    })
  }}
}, {requires:["./officialgroup", "./customgroup", "./imagetable", "./combotable", "./datacenter"]});

KISSY.add("itempub/sku", function(S, SKUManager) {
  var E = S.Event, D = S.DOM;
  return{init:function() {
    var elContainer = D.get("#J_SellProperties");
    if(!elContainer) {
      return
    }
    var htmlConfig = D.html("#J_SKUConfig"), config = S.trim(htmlConfig) ? S.JSON.parse(htmlConfig) : {}, elAddGroup = D.get("#J_AddCustomSKU"), elPrice = D.get("#buynow"), elQuantity = D.get("#quantityId"), elHiddenCPVS = D.get("#J_AvailableCustomCPV");
    elAddGroup && SKUManager.bindAddGroup(elAddGroup, elContainer, config.config);
    elHiddenCPVS && SKUManager.bindAvaialCPVS(elHiddenCPVS);
    elQuantity && SKUManager.bindQuantity(elQuantity);
    elPrice && SKUManager.bindPrice(elPrice);
    SKUManager.init(elContainer, config)
  }, valid:function() {
    return SKUManager.hasSaved()
  }, showTip:function() {
    SKUManager.showUnsavedTip()
  }, expandColors:function() {
    SKUManager.expandColors()
  }}
}, {requires:["./sku/manager"]});

KISSY.add("itempub/publish", function(S) {
  var args = S.makeArray(arguments);
  S.ready(function() {
    for(var i = 1;i < args.length;i++) {
      var module = args[i] || {};
      module.init && module.init()
    }
  })
}, {requires:["./upload/imgspace.css", "./upload/itempic.css", "./upload/uploadspace.css", "./sku/sku.css", "./upload/itempic", "./sku"]});


