KISSY.add(function(S) {
    var D = S.DOM,
        E = S.Event;


    var TOGGLE_CLS = 'J_Toggle',
        BAR_CLS = 'imgSpaceBar',
        FRAME_CLS = 'picFrame',
        INSERT_EVENT = 'insert',
        defCfg = {
            firstShow:null,
            use:['space'],
            frameSrc:'nTadget.html',
            modulesData:{'space':'从图片空间选择','insert':'插入图片'}
        };

    function ImageSpace(container, cfg) {
        this.container = S.get(container);
        this.cfg = S.merge(defCfg, cfg);
        this._init();
    }

    S.augment(ImageSpace, S.EventTarget, {
        _init:function() {
            this._initBar();
            this.addModules(this.cfg.use);
            if (this.cfg.firstShow) {
                this.toggle(this.cfg.firstShow);
            }
        },
        _initBar:function() {
            var self = this,
                bar = document.createElement('div');
            bar.className = BAR_CLS;

            this.container.appendChild(bar);

            // toggle
            E.on(bar, 'click', function(e) {
                var tg = e.target;
                if (D.hasClass(tg, TOGGLE_CLS)) {
                    self.toggle(tg.getAttribute('data-module'));
                    //D.toggleClass(tg,'expanded');
                }
            });

            this.bar = bar;
        },
        _createFrame:function() {
            var frame = document.createElement('iframe');
            frame.setAttribute('frameBorder', '0');
            frame.className = FRAME_CLS;
            this.container.appendChild(frame);
            return frame;
        },
        //@todo: 聚合resize，减少对frame依赖
        _initCont:function(callback) {
            var self = this;
            this.frame = S.get(FRAME_CLS, this.container) || this._createFrame();

            E.on(this.frame, 'load', function() {

                self.modules = self.frame.contentWindow.TB.Sell.Modules.uploadSpace;
                self.modules.on('resize', function(data) {
                    self.frame.style.height = data.height + 'px';
                    //self.frame.style.display= data.height ? '':'none';
                });
                self.modules.on('insert', function(data) {
                    self.fire(INSERT_EVENT, data);
                });
                self.frame.style.height = self.frame.contentWindow.document.body.offsetHeight + 10 + 'px';
                callback.call(self);
            });

            this.frame.src = this.cfg.frameSrc;
        },
        /**
         * 添加模块
         * @param modules <Array>|<String> 模块名称[数组]
         */
        addModules:function(modules) {
            var self = this;
            modules = S.isArray(modules) ? modules : [modules];
            S.each(modules, function(name) {
                var link = document.createElement('a');
                link.className = TOGGLE_CLS;
                link.setAttribute('data-module', name);
                link.innerHTML = self.cfg.modulesData[name];
                self.bar.appendChild(link);
            });
        },
        /**
         * 显示隐藏模块
         * @param name <String> 模块名称
         */
        toggle:function(name) {

            S.each(S.query('.' + TOGGLE_CLS, this.bar), function(item) {
                if (item.getAttribute('data-module') === name && !D.hasClass(item, 'expanded')) {
                    D.addClass(item, 'expanded');
                } else {
                    D.removeClass(item, 'expanded');
                }
            });

            if (!this.frame) {
                this._initCont(function() {
                    this.modules.toggle(name);
                });
            } else {
                this.modules.toggle(name);
            }
        }
    });

    return ImageSpace;
});
