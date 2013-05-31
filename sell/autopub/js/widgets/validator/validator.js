/**
 *表单校验类，依赖Validator_JSON<br/>
 *Validator_JSON是后台程序吐出来的对象，进行统一规定前后台的规则。<br/>
 *author:kongyan@taobao.com
 *@module validator
 *@class Validator
 */
var Validator = function(vj){
	var ErrObj = {}, ErrArr = [];
	//IE6-8
	var isIE = !-[1,];
	function validate(en, rule){
		var _en = en.replace(/-\d+$/, '');
		var inLoop = vj[_en].inLoop, o = vj[_en][rule], _s = this;
		if(o.condition){
			var condition = o.condition.replace(/#(\w+)/g, function(w1, w2){return '"'+getValue(_s[w2])+'"';});
			if(inLoop){
				var num = en.match(/(\d+)$/)[1];
				//condition = o.condition.replace(/\{(\w+)\}/g, function(w1, w2){return '"'+getValue(_s[w2+'-'+num])+'"';});
				condition = o.condition.replace(/#(\w+)/g, function(w1, w2){return '"'+getValue(_s[w2+'-'+num])+'"';});
			}
			try{
				if(eval(condition)){
					return validatorFunc[rule].call(this, en);
				}else{
					return true;	
				}
			}catch(e){
				return true;
			}
		}else{
			return validatorFunc[rule].call(this, en);
		}
	}
	var generateMsg = function(en, msg){
		if(!ErrObj[en])ErrObj[en] = [];
		ErrObj[en].push(msg);
		ErrArr.push(msg);
	};
	var validatorFunc = {//校验规则函数
		required: function(en){//必填项
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].required, v = trim(getValue(this[en]));
			if(!v){
				generateMsg(en, o.errmsg);
				return false;
			}
			return true;
		},
		minSize: function(en){//最小长度
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].minSize, v = trim(getValue(this[en]));
			if(o.num && o.num > v.length){
				generateMsg(en, o.errmsg);
				return false;
			}
			return true;
		},
		maxSize: function(en){//最大长度
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].maxSize, v = trim(getValue(this[en]));
			if(o.num && o.num < v.length){
				generateMsg(en, o.errmsg);
				return false;
			}
			return true;
		},
		regx: function(en){//正则
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].regx, v = trim(getValue(this[en]));
			var exp;
			if(o.rule){
				switch(o.rule){
					case 'number':
					exp = /^\d+$/;
					break;
					case 'date':
					exp = /^\d{4}-\d{1,2}-\d{1,2}$/;
					break;
					case 'datetime':
					exp = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/;
					break;
					case 'time':
					exp = /^\d{1,2}:\d{1,2}:\d{1,2}$/;
					break;
					case 'email':
					//exp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i;//第一个版本的
					//exp = /^[a-z0-9]([a-z0-9]*[-_\\.]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\\.][a-z]{2,3}([\\.][a-z]{2})?$/i;//后端用的
					exp = /^\w+([-+.]\w+)*@\w([-\w]*\.)?([-\w]+)?\.[a-z]{2,3}$/i;//第二个版本的
					//exp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;//第三个版本的
					break;
                    case 'phone':
                    exp = /^\d{3,4}-\d{6,8}$/;
                    break;
				}
			}else if(o.expression){
				exp = new RegExp(o.expression);
			}
			if(exp && !exp.test(v)){
				generateMsg(en, o.errmsg);
				return false;
			}
			return true;
		},
		dateRange: function(en){//未来多少天的日期范围
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].dateRange, v = trim(getValue(this[en]));
			var dv = new Date(v.replace(/-/g, '/'));
			if(o.min){
				var dm = new Date(o.min.replace(/-/g, '/'));
				if(dm > dv){
					generateMsg(en, o.errmsg);
					return false;
				}
			}
			if(o.max){
				var dm = new Date(o.max.replace(/-/g, '/'));
				if(dm < dv){
					generateMsg(en, o.errmsg);
					return false;
				}
			}
			return true;
		},
		ageRange: function(en){//年龄范围
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].ageRange, v = trim(getValue(this[en]));
			var birthday = new Date(v.replace(/-/g, "/")); 
			var d = new Date(); 
			var age = d.getFullYear()-birthday.getFullYear()-((d.getMonth()<birthday.getMonth()||d.getMonth()==birthday.getMonth()&&d.getDate()<birthday.getDate())?1:0);
			if(o.min&&o.min>age || o.max&&o.max<age){
				generateMsg(en, o.errmsg);	
				return false;
			}
			return true;
		},
		idCard: function(en){//身份证号
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].idCard, v = trim(getValue(this[en]));
			var _v = v, re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
			if(v.length == 15){
				v = v.slice(0, 6)+'19'+v.slice(6)+'1';
			}
			var arrSplit = v.match(re);
			if(!arrSplit){
				generateMsg(en, o.errmsg);
				return false;
			}
			
			//检查出生日期是否正确
			var dtmBirth = new Date(arrSplit[2]+'/'+arrSplit[3]+'/'+arrSplit[4]);
			var bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
			if(!bGoodDay){
				generateMsg(en, o.errmsg);
				return false;
			}
			
			//检查18位身份证的校验码是否正确
			//校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
			if(_v.length == 18){
				var valnum;
				var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
				var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
				var nTemp = 0, i;
				for (i = 0; i < 17; i++) {
					nTemp += v.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if (valnum != v.substr(17, 1).toUpperCase()) {
					generateMsg(en, o.errmsg);
					return false;
				}
			}
			return true;
		},
		idCardUnion: function(en){//身份证号带条件
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].idCardUnion, v = trim(getValue(this[en]));
			var inLoop = vj[_en].inLoop;
			if(v.length == 15){
				v = v.slice(0, 6)+'19'+v.slice(6)+'1';
			}
			if(o.birthdayItem){
                var b = this[inLoop?o.birthdayItem.slice(1, -1)+'-'+en.match(/(\d+)$/)[1]:o.birthdayItem.slice(1)];
                if (b) {
                    var birthday = getValue(b).split('-');
                    for(var i=birthday.length-1; i>0; i--){
                        if(birthday[i].length == 1){
                            birthday[i] = '0' + birthday[i];
                        }
                    }
                    if(birthday.join('') != v.slice(6, 14)){
                        generateMsg(en, o.errmsg);
                        return false;
                    }
                }
			}
			if(o.genderItem){
                var g = this[inLoop?o.genderItem.slice(1, -1)+'-'+en.match(/(\d+)$/)[1]:o.genderItem.slice(1)];
                if (g && getValue(g)%2 != v.slice(-2, -1)%2) {
                    generateMsg(en, o.errmsg);	
                    return false;
                }
			}
			return true;
		},
		length: function(en){
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].length, v = trim(getValue(this[en]));
			if(o.num && o.num != v.length){
				generateMsg(en, o.errmsg);	
				return false;
			}
			return true;
		},
		gt: function(en){//大于某值
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].gt, v = trim(getValue(this[en]));
			if(o.value && o.value >= (v*1)){
				generateMsg(en, o.errmsg);	
				return false;
			}
			return true;
		},
		lt: function(en){//小于某值
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].lt, v = trim(getValue(this[en]));
			if(o.value && o.value <= (v*1)){
				generateMsg(en, o.errmsg);	
				return false;
			}
			return true;
		},
        /*some: function(en){//至少一个不为空
            var _en = en.replace(/-\d+$/, ''), o = vj[_en].some, v = trim(getValue(this[en])),
                _n = en.match(/-\d+$/), r = o.rel;
                
            _n = _n && _n.length ? _n[0] : '';
            if (r && this[r + _n]) {
                if (!v && !trim(getValue(this[r + _n]))) {
                    generateMsg(en, o.errmsg);	
                    return false;
                }
            }
            return true;
        },*/
		custom: function(en){//自定义函数
			var _en = en.replace(/-\d+$/, ''), o = vj[_en].custom, v = trim(getValue(this[en]));
			if(o.validatorName){
				var fb;
				try{
					var fn = eval(o.validatorName);
				}catch(e){
					var fn = function(){return true;}
				}
				if(o.params){
					//fb = new Function('return '+o.validatorName+'('+o.params+');')();
					fb = fn(o.params,en);
				}else{
					//fb = new Function('return '+o.validatorName+'();')();
					fb = fn(en);
				}
				if(!fb){
					generateMsg(en, o.errmsg);
					return false;
				}
			}
			return true;
		}
	};
	
	function validateElem(elem, all) {
	    if (!all) {
    	    ErrObj = {};
            ErrArr = [];
	    }
	    
	    if ((isIE && (elem.getAttribute('disabled') == true || elem.getAttribute('disabled') == 'disabled')) || (!isIE && elem.getAttribute('disabled') == '')) {
	        //不校验disabled的元素
            return {
                ErrObj: ErrObj,
                ErrArr: ErrArr
            };
        }
	    
	    var form = elem.form,
	        en = elem.name,
            _en = en.replace(/-\d+$/, ''),
            j;
            
        if (_en in vj) {
            for (j in vj[_en]) {
                if (j !== 'inLoop') {
                    if (!validate.call(form, en, j)) {
                        break;
                    }
                }
            }
        }
	    
	    return {
	        ErrObj: ErrObj,
	        ErrArr: ErrArr
	    };
	}
	
	function checkForm(form){//检查表单函数
		ErrObj = {};
		ErrArr = [];
		var elements = [], tmpEl;
		for(var i=0,e=form.elements,l=e.length; i<l; i++){
			tmpEl = e[i+1];
			if((tmpEl && tmpEl.name !== e[i].name) || i===l-1){
				elements.push(e[i]);	
			}
		}
		//var elements = form.elements;
		for(var i=0,e=elements,l=e.length; i<l; i++){
			validateElem(e[i], true);
		}
		for(var a in vj){
			if(/#B$/.test(a)){
				var inLoop = vj[a].inLoop, o = vj[a].sum, sum = 0, _s = form, e=form.elements,l=e.length;
				if(o.condition){
					var condition, cName;
					//condition = o.condition.replace(/{(\w+)}/g, function(w1, w2){cName = w2;return '"'+getValue(_s[w2])+'"';});
					condition = o.condition.replace(/#(\w+)/g, function(w1, w2){cName = w2;return '"'+getValue(_s[w2])+'"';});
					if(inLoop){
						var num;
						for(var j=0; j<l; j++){
							var cen = e[j].name;
							if(cen.indexOf(cName) > -1){
								num = cen.match(/(\d+)$/)[1];
								break;
							}
						}
						if(!num){
							break;
						}else{
							//condition = o.condition.replace(/{(\w+)}/g, function(w1, w2){return '"'+getValue(_s[w2+'-'+num])+'"';});
							condition = o.condition.replace(/#(\w+)/g, function(w1, w2){return '"'+getValue(_s[w2+'-'+num])+'"';});
						}
					}
					try{
						if(eval(condition)){

						}else{
							break;	
						}
					}catch(e){
						break;
					}
				}
				for(var i=0,e=form.elements,l=e.length, hasElem = false, be = a.slice(0, -2); i<l; i++){
					var en = e[i].name;
					if(en.indexOf(be+'-')>-1){
						hasElem = true;
						sum += parseInt(getValue(e[i]), 10);
					}
				}
				if(hasElem && sum != o.result){
					generateMsg(a, o.errmsg);
				}
			}
		}
		return {
			ErrObj: ErrObj,
			ErrArr: ErrArr
		};
	}
	function $(id){return document.getElementById(id);}
	function trim(str){return str.replace(/^\s+/g, '').replace(/\s+$/g, '');}
	function getValue(el){
		if(!el)return '';
		if(typeof(el.tagName) != 'undefined'){
			if((el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'hidden')) || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'){
				return el.value;
			}
		}else{
			if(el[0] && el[0].type === 'radio'){
				for(var i=el.length-1; i>=0; i--){
					if(el[i].checked){
						return el[i].value;
					}
				}
			}
			if(el[0] && el[0].type === 'checkbox'){
				var cv = '';
				for(var i=el.length-1; i>=0; i--){
					if(el[i].checked){
						cv += el[i].value;
					}
				}
				return cv;
			}
            if (el.type === 'radio' || el.type === 'checkbox') {
                return el.value;
            }
		}
		return '';
	}
	return {
		checkForm: checkForm,
		validateElem: validateElem
	};
};