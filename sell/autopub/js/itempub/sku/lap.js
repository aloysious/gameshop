/**
 * Large Array Processor (LAP)
 * @author ake<ake.wgk@taobao.com | wgk1987@gmail.com>
 */
KISSY.add(function(S) {
    var isRuning = false,
        config = {
            duration: 300,
            delay: 50
        },
        lapQueue = [],
        lapItem = null;
    var lap = {
            // 每一项数据的处理函数
            handle: function(handler) {
                this.handlers.push(handler);
            },
            // 每一批数据的处理函数
            batch: function(handler) {
                this.batchs.push(handler);
            },
            // 所有数据都处理完成以后要执行的回调
            then: function(callback) {
                this.callbacks.push(callback);
            },
            // 开始批处理
            // 如果存在多个实例，会放到队列最后,
            // 在当前批处理完成以后自动开始处理队列最先的实例
            start: function() {
                var self = this,
                    data = self.data;
                if(isRuning) {
                    lapQueue.push(self);
                    return;
                }
                isRuning = true;
                lapItem = lapQueue.shift() || self;

                self.then(function() {
                    isRuning = false;
                    lapQueue[0] && lapQueue[0].start();
                });
                doHandleIt(data, self);
                // 避免当前实例被多次执行
                self.start = function() {
                    if(self.isPause) {
                        self.isPause = false;
                        doHandleIt(data, self);
                    }
                };
            },
            // 暂停处理
            pause: function() {
                this.isPause = true;
            },
            // callback的最后一个函数是程序定义的，会执行相关的操作。
            stop: function() {
                this.isStop = true;

                this.data.length = 0;
                // 如果是pause状态下, 直接触发callback
                if(this.isPause) {
                    S.each(this.callbacks, function(callback) {
                        callback();
                    });
                }
            }
        };

    // 避免直接进入while操作，导致锁定线程。
    function doHandleIt(data, lap) {
        if(data.length === 0) {
            if(!this.isStop) {
                S.each(this.callbacks, function(callback) {
                    callback();
                });
            }
            return;
        }
        setTimeout(function() {
            handleIt(data, lap);
        }, 0);
    }

    // 分批处理 主体函数
    // 在指定的时间范围内循环处理数据，
    // 如果处理时间超过，则在一定的间隔之后继续处理余下的数据。
    function handleIt(data, lap) {
        var endtime = +new Date + lap.duration,
            localIndex = -1;
        // 至少执行一次，避免duration设置的太小，无法执行函数。。
        do{
            var _data = data.shift();
            lap.doIndex ++;
            localIndex ++;
            S.each(lap.handlers, function(handler) {
                handler(_data, lap.doIndex, localIndex);
            });
        } while(data.length > 0 && endtime > +new Date && !lap.isPause);
        S.each(lap.batchs, function(batch) {
            batch(lap.doIndex);
        });

        if(lap.isPause && data.length > 0) return;
        if (data.length > 0) {
            setTimeout(function() {
                //S.log('another loop: '+ lap.doIndex);
                handleIt(data, lap);
            }, lap.delay);
        } else{
            lap.isStop = true;
            S.each(lap.callbacks, function(callback) {
                callback();
            });
        }
    }

    // 创建一个对象，允许用户对处理队列进行一定的操作。
    // 可以多次执行，创建多个。
    // 多个处理程序会形成队列依次执行。
    function process(data, cfg) {
        var conf = S.merge(config, cfg),
            variables = {
                data: [].concat(data),
                doIndex: -1,
                isFinish: false,
                callbacks: [],
                handlers: [],
                batchs: []
            };
        return S.merge(conf, variables, lap);
    }

    return process;
});
