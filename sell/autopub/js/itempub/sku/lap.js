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
            // ÿһ�����ݵĴ�����
            handle: function(handler) {
                this.handlers.push(handler);
            },
            // ÿһ�����ݵĴ�����
            batch: function(handler) {
                this.batchs.push(handler);
            },
            // �������ݶ���������Ժ�Ҫִ�еĻص�
            then: function(callback) {
                this.callbacks.push(callback);
            },
            // ��ʼ������
            // ������ڶ��ʵ������ŵ��������,
            // �ڵ�ǰ����������Ժ��Զ���ʼ����������ȵ�ʵ��
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
                // ���⵱ǰʵ�������ִ��
                self.start = function() {
                    if(self.isPause) {
                        self.isPause = false;
                        doHandleIt(data, self);
                    }
                };
            },
            // ��ͣ����
            pause: function() {
                this.isPause = true;
            },
            // callback�����һ�������ǳ�����ģ���ִ����صĲ�����
            stop: function() {
                this.isStop = true;

                this.data.length = 0;
                // �����pause״̬��, ֱ�Ӵ���callback
                if(this.isPause) {
                    S.each(this.callbacks, function(callback) {
                        callback();
                    });
                }
            }
        };

    // ����ֱ�ӽ���while���������������̡߳�
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

    // �������� ���庯��
    // ��ָ����ʱ�䷶Χ��ѭ���������ݣ�
    // �������ʱ�䳬��������һ���ļ��֮������������µ����ݡ�
    function handleIt(data, lap) {
        var endtime = +new Date + lap.duration,
            localIndex = -1;
        // ����ִ��һ�Σ�����duration���õ�̫С���޷�ִ�к�������
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

    // ����һ�����������û��Դ�����н���һ���Ĳ�����
    // ���Զ��ִ�У����������
    // ������������γɶ�������ִ�С�
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
