/**
 * simplexPluginManagerFactory
 * PLUGIN MANAGER LIBRARY - NPAPI을 대체 하기 위한 플러그인 매니저
 * @author dwkim02
 * @date 2016-02-25
 * @version 0.2
 **/
'use strict';
export default [
    '$rootScope','$q','x2js','blockEditorValue',
    function($rootScope,$q,x2js,blockEditorValue){
        var _programList = []; //지원프로그램 정보
        /**************************
         * 프로그램 기본형
         **************************/
        function oProgramBasic(name, socket){
            this.programName = name;
            this._socket = socket
            this._version = false;
            this._failtCnt = 0;
            this._basicFormat = {
                cafe24 : {
                    header : {
                        program : 'background_removal',
                        command : 'send',
                    },
                    message : {
                        interface : 'open_image',
                        image : '',
                        callback_param : ''
                    }
                }
            }
        }
        oProgramBasic.prototype.makeRoot = function(){
            return '<?xml version="1.0" encoding="utf-8"?><cafe24>';
        }
        oProgramBasic.prototype.makeFooter = function(){
            return '</cafe24>';
        }
        oProgramBasic.prototype.makeHeader = function(programName, command){
            var xml = [];
            xml.push('<header>');
            xml.push('<program>' + programName + '</program>');
            xml.push('<command>' + command + '</command>');
            xml.push('</header>');
            return xml.join('');
        }
        oProgramBasic.prototype._makeMessage = function(name, info){
            var xml = [];
            xml.push('<message>');
            xml.push('<interface>' + name + '</interface>');
            for(var idx in info){
                var _str = (typeof info[idx] =='object')?JSON.stringify(info[idx]):info[idx];
                xml.push("<"+idx+">" + _str + "</"+idx+">");
            }
            xml.push('</message>');
            return xml.join('');
        };
        oProgramBasic.prototype.loadPlugin = function(){
            var xml = [];
            xml.push(this.makeRoot());
            xml.push(this.makeHeader(this.programName, 'open'));
            xml.push(this.makeFooter());
            this._send(xml.join(''));
        };
        oProgramBasic.prototype.makeTotalXml = function(mode, name, info){
            var xml = [];
            xml.push(this.makeRoot());
            xml.push(this.makeHeader(this.info.name, mode));
            xml.push(this._makeMessage(name, info));
            xml.push(this.makeFooter());
            return xml.join('');
        };
        oProgramBasic.prototype.getServiceVersion = function(){
            var xml = [];
            xml.push(this.makeRoot());
            xml.push(this.makeHeader('service', 'get_version'));
            xml.push(this.makeFooter());
            return xml.join('');
        };
        oProgramBasic.prototype.sendMessage = function(){};
        oProgramBasic.prototype._send = function(xml){
            this._socket.send(xml);
            //this._socket.send(x2js.json2xml(JSON.stringify(this._basicFormat)));
            //this._socket.send(x2js.json2xml_str(JSON.stringify(this._basicFormat)));
        }
        oProgramBasic.prototype.getVersion = function(){
            return (this._version)?this._version:false;
        }
        oProgramBasic.prototype.setVersion = function(version){
            this._version = version;
        }
        oProgramBasic.prototype.setSocket = function(socket){
            this._failtCnt = 0;
            this._socket = socket;
        }
        /**************************
         * thumbnail_editor
         **************************/
        var thumbnail_editor = function(socket){
            //기본정보
            this.info = {
                name : 'thumbnail_editor'
                , message : {
                    open_image : {
                        image : ''
                    }
                    , set_upload_info : {
                        upload_url : ''
                        , upload_info : {
                            fileType : '', tmallIdx : '', productCode : '', option : ''
                        }
                    }
                    , add_thumbnail : {
                        width : '', height : ''
                    }
                }
            }
            oProgramBasic.call(this, this.info.name, socket);
        }
        thumbnail_editor.prototype = new oProgramBasic();
        thumbnail_editor.prototype.constructor = thumbnail_editor;
        thumbnail_editor.prototype.sendMessage = function(info, socket){
            var mode = 'send';
            socket.send(this.makeTotalXml(mode, 'open_image', info.message));
            socket.send(this.makeTotalXml(mode, 'set_upload_info', info.message));
            socket.send(this.makeTotalXml(mode, 'add_thumbnail', info.message));
        };
        _programList['thumbnail_editor'] = thumbnail_editor;
        /**************************
         * background_removal
         **************************/
        var background_removal = function(socket){
            //기본정보
            this.info = {
                name : 'background_removal'
                , message : {
                    open_image : {
                        image : ''
                    }
                    , upload_image_response : {
                        target : ''
                        , result : ''
                        , message : ''
                    }
                }
            }
            oProgramBasic.call(this, this.info.name, socket);
        }
        background_removal.prototype = new oProgramBasic();
        background_removal.prototype.constructor = background_removal;
        background_removal.prototype.sendMessage = function(info){
            var xml = this.makeTotalXml('send', 'open_image', info.message.open_image);
            this._send(xml);
        };
        background_removal.prototype.add_image = function(info){
            //var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<cafe24>\r\n<header>\r\n   <program>background_removal</program>\r\n   <command>send</command>\r\n</header>\r\n<message>\r\n   <interface>add_image</interface>\r\n  <image>http://1.209.128.197/websocket/_KWH6211.png</image>\r\n<callback_param>value</callback_param>\r\n</message>\r\n</cafe24>";
            //this._socket.send(xml);
            var xml = this.makeTotalXml('send', 'add_image', info.message.add_image);
            this._send(xml);
        };
        _programList['background_removal'] = background_removal;


        /**************************
         * 기본변수 할당
         **************************/
        var pluginServiceInfo = false;
        var resultCode = "0000";
        var statusMsg = '';
        var _errorMsg = {
            '0000' : 'success',
            '0001' : 'Send success',
            '0002' : 'Image upload success',
            '0003' : 'Service open success',
            '9999' : 'WebSocket not support.',
            '9998' : 'WebSocket connection error.',
            "9997" : 'WebSocket status error.',
            "9996" : 'WebSocket open error.',
            "9995" : "pluginServiceNotInstalled",
            "8889" : 'Check parameter - pluginInfo',
            "8888" : 'Not support program name.',
            "8887" : 'Program define error.',
            "7000" : 'Plugin Service information error.',
            "7001" : 'pluginServiceNewVersion',
        };
        var urlWebSocket = "wss://plugin-add-xxx.cafe24.com:35700";
        var urlPluginService = blockEditorValue.api.nukiInfo;
        var supportProgramList = ['thumbnail_editor', 'background_removal'];
        var oSocket = false;
        var oProgram = false;
        var pluginInfo = false;
        var _isProgramSuccessOpen = false;
        var _response = function(resultCode, _data){
            resultCode = resultCode; statusMsg = _errorMsg[resultCode];
            _data = _data || {};
            return {resultCode : resultCode , resultMsg : statusMsg, data : _data};
        }
        /**************************
         * 플러그인 매니저 객체
         **************************/
        return{
            /** 초기화 **/
            init : function(){
                var defer = $q.defer();
                /**************************
                 * 서비스 플러그인 실행 중인지 확인
                 **************************/
                if(_isProgramSuccessOpen && oProgram){
                    defer.resolve(_response('0000'));
                }else{
                    /**************************
                     * 서비스 플러그인 버전 체크
                     **************************/
                    this.getServiceVersion().then(function(pluginServiceInfo){
                        if(!pluginServiceInfo){
                            defer.resolve(_response('7000'));
                        }
                        /**************************
                         * 웹소켓 지원확인
                         **************************/
                        if(typeof window.WebSocket == 'undefined'){
                            defer.resolve(_response('9999'));
                        }
                        /**************************
                         * websocket 생성
                         **************************/
                        try {
                            oSocket = new WebSocket(urlWebSocket);
                            oSocket.onopen = function(evt){
                                defer.resolve(_response('0000'));
                            }
                            oSocket.onerror = function(evt){
                                defer.resolve(_response('9995', pluginServiceInfo));
                            }
                        }catch(exception){
                            defer.resolve(_response('9998'));
                        }
                    });
                }
                return defer.promise;
            }
            , runProgram : function(_pluginInfo){
                /**************************
                 * 프로그램 할당
                 **************************/
                pluginInfo = _pluginInfo;
                if(resultCode == '0000' && pluginInfo && oSocket){
                    /** 프로그래 정보 확인 **/
                    if(typeof pluginInfo.name == 'undefined' || supportProgramList.indexOf(pluginInfo.name) == -1){
                        pluginInfo.callback(_response('8888'));
                    }else{
                        /** 프로그램 정보 할당 **/
                        if(oProgram){
                            oProgram.setSocket(oSocket);
                        }else{
                            oProgram = new _programList[pluginInfo.name](oSocket);
                        }
                        if(!oProgram){
                            pluginInfo.callback(_response('8887'));
                        }else{
                            if(oProgram.getVersion()){
                                /** 열려 있으므로 이미지 추가 **/
                                oProgram.add_image(pluginInfo);
                            }else{
                                /** 최초 호출은 프로그램 정보 호출 **/
                                var xml = oProgram.getServiceVersion();
                                oSocket.send(xml);
                            }
                            // message event
                            oSocket.onmessage = function (event) {
                                function _getXmlValue(resultObj, name){
                                    var _returnValue = '';
                                    if(name == 'command'){
                                        _returnValue = resultObj.cafe24.header.command;
                                    }else if(name == 'result'){
                                        _returnValue = resultObj.cafe24.header.result;
                                    }else if(name == 'message'){
                                        _returnValue = resultObj.cafe24.message;
                                    }
                                    return _returnValue;
                                }
                                if(oSocket.readyState == WebSocket.OPEN){
                                    var xmlDoc = false;
                                    if (window.DOMParser) {
                                        var parser = new DOMParser();
                                        xmlDoc = parser.parseFromString(event.data, "text/xml");
                                    } else { //ie
                                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                                        xmlDoc.async = false;
                                        xmlDoc.loadXML(event.data);
                                    }
                                    var resultObj = x2js.xml2json(xmlDoc);
                                    var command =  _getXmlValue(resultObj, 'command');
                                    if (command) {
                                        var result = _getXmlValue(resultObj, 'result');
                                        switch(command){
                                            case 'get_version' :
                                                if(pluginServiceInfo.version == result){
                                                    if(typeof pluginInfo.mode == 'string' && pluginInfo.mode =='version_check'){
                                                        //version check
                                                        pluginInfo.callback(_response('0000', pluginServiceInfo));
                                                    }else{
                                                        oProgram.setVersion(result);
                                                        oProgram.loadPlugin();
                                                    }
                                                }else{
                                                    pluginInfo.callback(_response('7001', pluginServiceInfo));
                                                }
                                                break;
                                            case 'open' :
                                                if(result == "success"){
                                                    oProgram.sendMessage(pluginInfo);
                                                }else if(result == 'fail'){
                                                    console.log('program already open');
                                                    if(oProgram._failtCnt++>2){
                                                        this.close();
                                                        pluginInfo.callback(_response('9996'));
                                                    }else{
                                                        oProgram.add_image(pluginInfo);
                                                    }
                                                }
                                                break;
                                            case 'recv' :
                                                var _message = _getXmlValue(resultObj, 'message');
                                                if(_message){
                                                    _isProgramSuccessOpen = true;
                                                    if(_message.result == 'success'){
                                                        pluginInfo.callback(_response('0001', _message));
                                                    }else if(_message.result){
                                                        pluginInfo.callback(_response('0002', _message));
                                                    }else{
                                                        console.log(result);
                                                    }
                                                }
                                                break;
                                            case "send" :
                                                if(result == 'success'){
                                                    pluginInfo.callback(_response('0003', _message));
                                                }else if(result == 'fail'){
                                                    oProgram.loadPlugin();
                                                }
                                                break;
                                            default :
                                                pluginInfo.callback();
                                        }
                                    }
                                }else{
                                    pluginInfo.callback(_response('9997'));
                                }
                            };
                            // error event
                            oSocket.onerror = function (event) {
                                pluginInfo.callback(_response('9996'));
                            };
                            // close event
                            oSocket.onclose = function (event) {
                                console.log("webSocket close..");
                            };
                        }
                    }
                }else{
                    pluginInfo.callback(_response('8889'));
                }
            }
            /** 지원하는 프로그램 리스트 **/
            , getSupportProgram : function(){
                return supportProgramList;
            }
            , close : function(){
                oSocket.close();
            }
            , getProgramStatus : function(){
                return _isProgramSuccessOpen;
            }
            , getServiceVersion : function(){
                var defer = $q.defer();
                if(!pluginServiceInfo){
                    var httpRequest;
                    httpRequest = new XMLHttpRequest();
                    if (!httpRequest) {
                        return false;
                    }
                    httpRequest.onreadystatechange = function(){
                        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                            pluginServiceInfo = JSON.parse(httpRequest.responseText);
                            defer.resolve(pluginServiceInfo);
                        }
                    };
                    httpRequest.open('GET', urlPluginService, true);
                    httpRequest.send();
                }
                return defer.promise;
            }
        }
    }
]
