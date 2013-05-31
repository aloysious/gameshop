/*
 ����ͳ�Ʋ��
 @author ��Х,����<yiminghe@gmail.com>
 */
(function() {
    var S = KISSY;

    S.namespace('EditorPlugins.Wordcount');

    //������������������༭��editor����
    KISSY.EditorPlugins.Wordcount.bind = function(max, editor) {
        var textarea = new S.Node(editor.textarea);
        //�ڵ�ǰtext�༭�������������ڵ�
        var size = 0;
        S.DOM.insertAfter(S.DOM.create('<div class="J_WS">Դ��:������ ' +
            '<em class="J_WordSize">' + size + '</em>/������� ' +
            '<em class="J_WsMax">' + max + '</em> <span class="J_WsTips"></span></div>'),
            textarea.parent('.ke-editor-wrap'));
        var wordsizenode = textarea.parent('.ke-editor-wrap').next('.J_WS')
            .children('.J_WordSize');
        var tips = "��������������������޷������ɹ�";
        S.DOM.css('.J_WordSize', {'font-weight':'bold','color':'green'});
        S.DOM.css('.J_WsMax', 'font-weight', 'bold');
        S.DOM.css('.J_WS', {'font-size':'13px','padding-left':'5px','float':'right','margin':'0 50px 30px 0'});
        S.DOM.css('.J_WsTips', 'color', 'red');
        var _change = function(node, s) {
            if (s <= max) {
                node.text(s).css('color', 'green');
                node.siblings('.J_WsTips').text('');
            }
            else {
                node.text(s).css('color', 'red');
                node.siblings('.J_WsTips').text(tips);
            }
        }, timer;
        //��save�¼�
        editor.ready(function() {
            _change(wordsizenode, editor.getData().length);
            editor.on('save restore', function(ev) {

                if (ev.buffer) {
                    timer && clearTimeout(timer);
                    timer = setTimeout(function() {
                        _change(wordsizenode, editor.getData().length);
                    }, 500);
                } else {
                    _change(wordsizenode, editor.getData().length);
                }
            });
        });
    };
})();
