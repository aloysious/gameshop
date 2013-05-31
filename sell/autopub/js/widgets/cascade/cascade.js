var Cascade = (function () {
    function splitFn(s, c) {
        return s.split(c);
    }

    function $(id) {
        if (typeof id == 'string') {
            return document.getElementById(id);
        } else if (id) {
            return id;
        }
    }

    function getArr(str) {
        var S1 = [],
            S2 = [],
            S3 = [],
            S4 = [];
        var tmpArr1 = splitFn(str, '#');
        for (var i = 0; i < tmpArr1.length; i++) {
            var tmpArr2 = splitFn(tmpArr1[i], '$');
            S1[i] = tmpArr2[0];
            if (!tmpArr2[1]) continue;
            S2[i] = [];
            S3[i] = [];
            S4[i] = [];
            var tmpArr3 = splitFn(tmpArr2[1], '|');
            for (var j = 0; j < tmpArr3.length; j++) {
                var tmpArr4 = splitFn(tmpArr3[j], '%');
                S2[i][j] = tmpArr4[0];
                if (!tmpArr4[1]) continue;
                S3[i][j] = [];
                S4[i][j] = [];
                var tmpArr5 = splitFn(tmpArr4[1], ',');
                for (var a = 0; a < tmpArr5.length; a++) {
                    var tmpArr6 = splitFn(tmpArr5[a], '!');
                    S3[i][j][a] = tmpArr6[0];
                    if (!tmpArr6[1]) continue;
                    S4[i][j][a] = [];
                    var tmpArr7 = splitFn(tmpArr6[1], '~');
                    for (var b = 0; b < tmpArr7.length; b++) {
                        var tmpArr8 = splitFn(tmpArr7[b], '*');
                        S4[i][j][a][b] = tmpArr8[0];
                        if (!tmpArr8[1]) continue;
                    }
                }
            }
        }
        return [S1, S2, S3, S4];
    }

    function getIndex(arr, value) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === value || new RegExp('_' + value + '$').test(arr[i])) {
                return i;
            }
        }
    }
    return {
        init: function (str, selectsArr, selected) {
            if (!str || !selectsArr || selected && selected.length !== selectsArr.length) return;
            var S = getArr(str),
                SN = [],
                vs = [];
            SN[0] = S[0];
            for (var i = 0; i < selectsArr.length; i++) {
                if (i > 0) $(selectsArr[i]).style.display = 'none';
                selectsArr[i] = $(selectsArr[i]);
                selectsArr[i].length = 0;
                selectsArr[i].options.add(new Option('«Î—°‘Ò', ''));
                if (i === 0) {
                    for (var j = 0; j < S[0].length; j++) {
                        var v = splitFn(S[0][j], '_');
                        selectsArr[i].options.add(new Option(v[0], v[1]));
                    }
                }
            }
            for (var i = 0; i < selectsArr.length - 1; i++) {
                selectsArr[i].onchange = (function (i) {
                    return function () {
                        if (!selectsArr[i + 1]) {
                            return;
                        }
                        if (this.value == '') {
                            for (var a = i + 1; a < selectsArr.length; a++) {
                                selectsArr[a].style.display = 'none';
                            }
                        } else {
                            selectsArr[i + 1].style.display = '';
                            for (var a = i + 2; a < selectsArr.length; a++) {
                                selectsArr[a].style.display = 'none';
                            }
                        }
                        var si = this.selectedIndex,
                            val = this.options[si].text + '_' + this.value;
                        for (var a = i; a < selectsArr.length - 1; a++) {
                            selectsArr[a + 1].length = 1;
                        }
                        if (si !== 0) {
                            switch (i + 1) {
                            case 1:
                                vs[0] = getIndex(SN[0], val);
                                SN[1] = S[1][vs[0]];
                                break;
                            case 2:
                                var _vs0 = typeof (vs[0]) !== 'undefined' ? vs[0] : (selectsArr[0].selectedIndex - 1),
                                    _SN1 = SN[1] || S[1][_vs0];
                                vs[1] = getIndex(_SN1, val);
                                SN[2] = S[2][_vs0][vs[1]];
                                break;
                            case 3:
                                var _vs0 = typeof (vs[0]) !== 'undefined' ? vs[0] : (selectsArr[0].selectedIndex - 1),
                                    _SN1 = SN[1] || S[1][_vs0],
                                    _vs1 = typeof (vs[1]) !== 'undefined' ? vs[1] : (selectsArr[1].selectedIndex - 1),
                                    _SN2 = SN[2] || S[2][_vs0][_vs1];
                                vs[2] = getIndex(_SN2, val);
                                SN[3] = S[3][_vs0][_vs1][vs[2]];
                                break;
                            }
                            for (var j = 0; j < SN[i + 1].length; j++) {
                                var v = splitFn(SN[i + 1][j], '_');
                                selectsArr[i + 1].options.add(new Option(v[0], v[1]));
                            }
                            if (selectsArr[i + 1].length == 2 && !selectsArr[i + 2]) {
                                selectsArr[i + 1].selectedIndex = 1;
                            }
                        }
                    }
                })(i);
            }
            if (selected && selected[0]) {
                var SV = selected,
                    SNS = [],
                    vsA = [];
                selectsArr[0].value = SV[0];
                for (var i = 0; i < SV.length; i++) {
                    var vs;
                    switch (i) {
                    case 0:
                        SNS[0] = S[0];
                        vsA[0] = getIndex(SNS[0], SV[0]);
                        break;
                    case 1:
                        if (typeof (vsA[0]) !== 'undefined') {
                            SNS[1] = S[1][vsA[0]];
                            vsA[1] = getIndex(SNS[1], SV[1]);
                        }
                        break;
                    case 2:
                        if (typeof (vsA[1]) !== 'undefined') {
                            SNS[2] = S[2][vsA[0]][vsA[1]];
                            vsA[2] = getIndex(SNS[2], SV[2]);
                        }
                        break;
                    case 3:
                        if (typeof (vsA[2]) !== 'undefined') {
                            SNS[3] = S[3][vsA[0]][vsA[1]][vsA[2]];
                            vsA[3] = getIndex(SNS[3], SV[3]);
                        }
                        break;
                    }
                }
                for (var j = 1; j < SNS.length; j++) {
                    selectsArr[j].length = 1;
                    for (var a = 0; a < SNS[j].length; a++) {
                        var v = splitFn(SNS[j][a], '_');
                        selectsArr[j].options.add(new Option(v[0], v[1]));
                    }
                    selectsArr[j].value = SV[j];
                    selectsArr[j].style.display = '';
                }
            }
        }
    }
})();