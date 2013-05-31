KISSY.add(function(S) {
    
    S.log('mvc is started');

	var D = S.DOM,
		J = S.JSON;
    
	var pipe = new S.Base();

	//model��(���ݲ�)
    function Model(ns) {
        this.namespace = ns;
    }

    S.augment(Model, {

		set:function(k, v) {
			var self = this;
			
			if (S.isObject(k)){
				S.each(k, function(v, k) {
					self.set(k, v);
				});
				return;
			}
			
			//S.later(function(){
				pipe.set(self.namespace+":"+k, v);
			//},0);
		},
		
		get:function(k) {
			return pipe.get(this.namespace+":"+k);
		},

		onDataChange:function(need, run) {
			var x = [],self = this;
			
			if (S.isUndefined(need)) {
				run.apply(self.control);
				return;
			}
			if (S.isString(need)) {
				need = [need];
			}
			S.each(need, function(n,i) {                    
				if(n.indexOf(":") === -1){
					n=need[i] = self.namespace + ":" + n;
				}
				x.push("after" + capitalFirst(n) + "Change");
			});
			
			function invoke(){
				var vs = [], r;
				try{
					S.each(need, function(n) {
                        var v = pipe.get(n);
						if (S.isUndefined(v) || S.isNull(v)){
							throw 'datadeletion';
						}
						vs.push(v);
					});
				}catch(e){
//					S.log(e);
					return;
				}
				r = run.apply(self.control,vs);
				r && self.set(r);
			}
			pipe.on(x.join(" "), invoke);
			
			invoke();
		}
	});

    //View�㣨չ�ֲ㣩
    var View = function(model) {
        this.model = model;
    };
    S.augment(View, {
		//������������ȡ����
		//����������<script type="text/data" id[class]="selector">{"data":"with json string"}</script>
		getData : function(dataContainer){
			this.model.set(J.parse(D.html(dataContainer)));
		},
		//�������ݵ����ݲ�
		update : function(key, value) {
			this.model.set(key, value);
		},
		//����չ���߼�
		use : function(view) {
			this.model.onDataChange(view.need, view.run);
		}
	});

	//Control��(���Ʋ�)
    var Control = function(ns) {
		if (pipe[ns]){
			S.log('namespace' + ns + 'is used!');
			return;
		}
		pipe[ns] = true;
        this.model = new Model(ns);
		this.model.control = this;
		this.view = new View(this.model);
    };
    S.augment(Control, View);

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    S.log('mvc is ok');
	S.log(['pipeData:',pipe.__attrVals]);

    return Control;
});
