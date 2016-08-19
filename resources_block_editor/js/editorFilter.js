export default {
    replaceBr : function(){
        return function(str){
            return str.replace(/\r?\n|\r/g,'<br>');
        }
    },
    propsFilter : function(){
        return function(items,props){
            var out = [];
            if(angular.isArray(items)){
                items.forEach(function(item){
                    var itemMatches = false;
                    var keys = Object.keys(props);
                    for(var i = 0; i<keys.length; i++){
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if(item[prop].toString().toLowerCase().indexOf(text) !== -1){
                            itemMatches = true;
                            break;
                        }
                    }
                    if(itemMatches){
                        out.push(item);
                    }
                });
            }else{
                out = items;
            }
            return out;
        }
    },
    orderObjectBy : function(){
        return function(items,field,reverse){
            var filtered = [];
            angular.forEach(items,function(item){
                if(item)filtered.push(item);
            });
            filtered.sort(function(a,b){
                return (a[field]>b[field]?1:-1);
            });
            if(reverse) filtered.reverse();
            return filtered;
        }
    },
    bytes : function(){
        return function(bytes,precision){
            if(isNaN(parseFloat(bytes))|| !isFinite(bytes)) return '-';
            if(typeof precision === 'undefined') precision = 1;
            var units = ['bytes','kB','MB','GB','TB','PB'],
                number = Math.floor(Math.log(bytes)/Math.log(1024));
            return (bytes/Math.pow(1024,Math.floor(number))).toFixed(precision)+' '+units[number];
        }
    },
    /** 글자 수 제한 **/
    limitLength : function(){
        return function(str,length) {
            return str.substr(0,length);
        }
    },
    /** 언어별 폰트 필터링 **/
    fontLangFilter : function(){
        return function(fontList, fontLang){
            var _result = []
                , filterLang = [];
            angular.forEach(fontLang, function(val,idx){
                if(val=='1') filterLang.push(idx);
            })
            if(fontList){
                angular.forEach(fontList, function(_font, idx){
                    var keys = Object.keys(_font)
                        , _continue = true;
                    angular.forEach(filterLang, function(lang, idx){
                        if(_continue && keys.indexOf(lang) != -1){
                            _result.push(_font);
                            _continue = false;
                        }
                    })
                })
            }
            return _result;
        }
    }
};

