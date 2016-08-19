let commonFunctionFactory = [
    '$window', '$rootScope', 'commonSvc', 'ngNotify', '$filter',
    function($window, $rootScope, commonSvc, ngNotify, $filter){
        var commFn = {};
        commFn.show = function(msg){
            $window.alert(msg);
        };

        /** 오브젝트 비교 **/
        commFn.compareObject = function(a, b){
            var _a = JSON.stringify(a);
            var _b = JSON.stringify(b);
            return (_a === _b)?true:false;
        }

        /** WIDE 알림창 생성  **/
        commFn.callWideNotify = function(msg, config){
            /** config
             * position : 'top', 'bottom'
             * type : 'error', 'info', 'success', 'warn', 'grimace'
             * duration : 1000
             * sticky : true
             **/
            ngNotify.set(msg, config);
        }

        /** base64 encode **/
        commFn._base64Encode = function(obj, type){
            var _data = (type == 'string')?obj:angular.toJson(obj);
            return btoa(unescape(encodeURIComponent(_data)));
        }

        /** log **/
        commFn.customLogCall = function(str, status, obj){
            var _log = function(css, status, str, obj){
                if(obj) console.log("%c%s", css, "[" + status + "]" + str, obj);
                else console.log("%c%s", css, "[" + status + "]" + str);
            }
            status = status || 'ok';
            switch(status){
                case 'ok':
                    var logCss = "color: green;";
                    _log(logCss, status, str, obj);
                    break;
                case 'error':
                    var logCss = "color: red; font-size: x-large";
                    _log(logCss, status, str, obj);
                    break;
                case 'warning':
                    var logCss = "color: orange;";
                    _log(logCss, status, str, obj);
                    break;
                case 'welcome':
                    var logCss = "font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000"
                    console.log("%c%s", logCss, str);
                    break;
                default:
                    var logCss = "color: black;";
                    _log(logCss, status, str, obj);
                    break;
            }
        }

        /** convert hex to rgb **/
        commFn.hexToRgb = function(hex) {
            if(typeof hex == 'object') return hex;
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                Red: parseInt(result[1], 16),
                Green: parseInt(result[2], 16),
                Blue: parseInt(result[3], 16)
            } : null;
        }

        /** convert rgb to hex **/
        commFn.rgbToHex = function(rgb){
            var _hex = '';
            if(typeof rgb == 'object'){
                _hex = "#" + ((1 << 24) + (rgb.Red << 16) + (rgb.Green << 8) + rgb.Blue).toString(16).slice(1);
            }else if(typeof rgb == 'string' && rgb.indexOf('#') !== -1){
                _hex = rgb;
            }
            return _hex;
        }

        /** convert rgb to string **/
        commFn.rgbToStr = function(rgb, alpha){
            var _rgbStr = '';
            if(alpha){
                _rgbStr = 'rgba('+rgb.Red+","+rgb.Green+","+rgb.Blue+","+alpha*0.01+")";
            }else{
                _rgbStr = 'rgb('+rgb.Red+","+rgb.Green+","+rgb.Blue+")";
            }
            return _rgbStr;
        }

        commFn.strToRgbObj = function(rgb, layer){
            var match = rgb.match(/([\.\d])+/g)
                , rgbObj = {
                    Red : match[0],
                    Green : match[1],
                    Blue : match[2]
                }
            if(match.length==4){ //rgba(0,0,0,0,1)
                layer.FillOpacity = match[3]*100;
            }
            return rgbObj;
        }

        commFn.rectToObject = function(rect){
            var _rect =  rect.split(/[\s,]/).filter(function(str){return /\S/.test(str);});
            return {
                left : _rect[0]
                , top : _rect[1]
                , width : _rect[2]
                , height : _rect[3]
            }
        }

        commFn.rectToString = function(rect){
            var _rect = [];
            for(var name in rect) {
                _rect.push(parseInt(rect[name]));
            }
            return _rect.join();
        }

        /** make search params **/
        commFn.makeSearchParams = function(query){
            var _query = [];
            angular.forEach(query, function(val, idx){
                if(val !== false){_query.push(idx+"="+val);}
            });
            return _query.join(",");
        }

        commFn.bytesToSize = function(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        };

        //get web localStorage
        commFn.getLocalStorage = function(name, defaultValue){
            return (localStorage.getItem(name)!==null)?localStorage.getItem(name):defaultValue;
        }

        //set web localStorage
        commFn.setLocalStorage = function(name, obj){
            localStorage.setItem(name, obj);
        }

        //set web localStorage
        commFn.delLocalStorage = function(name){
            localStorage.removeItem(name);
        }

        //radian to degree
        commFn.radianToDegree = function(radian){
            return radian * (180/Math.PI);
        }

        //degree to Radian
        commFn.degreeToRadian = function(degree){
            return (angular.isUndefined(degree))?false:degree * (Math.PI/180);
        }

        // degree -> 포토샵 degree 로 변경
        commFn.degreeToPhotoshopDegree = function(degree){
            degree = degree%360;
            var _photoshopDeg = (degree < 180 && degree > 0)?degree:degree-360;
            return _photoshopDeg;
        }

        // 포토샵 degree -> degree 로 변경
        commFn.photoshopDegreeToDegree = function(photoshopDegree){
            var degree = '';
            photoshopDegree = parseInt(photoshopDegree);
            if(photoshopDegree < 180 && photoshopDegree > 0){
                degree = photoshopDegree;
            }else if(photoshopDegree < 0){
                degree = photoshopDegree+360;
            }
            return degree;
        }

        commFn.imageCachePrevent = function(src){
            return (/\?(\d)+/.test(src))?src:src +"?"+new Date().getTime();
        }

        commFn.imageCachePreventChar = function(src){
            var char = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            return (/\?(\d)+/.test(src))?src:src +"?"+char;
        }

        commFn.makeSum = function(num){
            var _result = 0;
            for(var i=0;i<num.length;i++){
                _result += parseInt(num[i]);
            }
            return Math.round(_result);
        }

        /** 번역 **/
        commFn.translate = function(key, param){
            return $filter('translate')(key, param);
        }

        /** 인트로 변경 **/
        commFn.toInteger = function(obj){
            var _obj = {};
            angular.forEach(obj, function(val,idx){
                _obj[idx] = parseInt(val);
            })
            return _obj;
        }

        return commFn;
    }
];
export default commonFunctionFactory;