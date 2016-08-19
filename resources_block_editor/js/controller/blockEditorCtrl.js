let blockEditorCtrl = [
    "$rootScope","$scope","$timeout","$q","$interval","$window",'$translate','$uibModal',
    "$filter","$base64",
    "blockUI","Notification",'hotkeys','ipCookie',
    'commonFunctionFactory','loginFactory','historyFactory','fileUploadFactory','simplexPluginManagerFactory',
    'imgMngService','layerMngService','commonSvc','tagMappingService',
    "blockEditorValue","layerInfoConstant",
    function($rootScope,$scope,$timeout,$q,$interval,$window,$translate,$uibModal,$filter,$base64,
             blockUI,Notification,hotkeys,ipCookie,
             commonFunctionFactory,loginFactory,historyFactory,fileUploadFactory,simplexPluginManagerFactory,
             imgMngService,layerMngService,commonSvc,tagMappingService,
             blockEditorValue,layerInfoConstant){

        var previewImageBinary = '';
        var _hostName = window.location.hostname;
        var _karmaTestMode = (_hostName == 'localhost')?true:false;
        /** 접속 프로토콜 검사 **/
        if(_hostName == 'gseo-amallrang-qa.cafe24.com'||_hostName == 'gseo-amallrang.cafe24.com'){
            if(window.location.protocol == 'http:'){
                window.location.href = "https:"+window.location.href.substring(window.location.protocol.length);
            }
        }
        if(!_karmaTestMode){
            /** 파라미터 검사 **/
            if(window.location.search){
                var _urlParameters = window.location.search.substring(1);
                $scope.urlParameters = JSON.parse('{"'+decodeURI(_urlParameters).replace(/"/g,'\\"').replace(/&/g,'","').replace(/=/g,'":"')+'"}');
            }else{
                blockUI.start(commonFunctionFactory.translate('warningParameterMissing'));
                return;
            }
        }
        /** 초기화 **/
        $scope.psdTemplateInfo = {
            size : '',
            rect : '',
            rgbColorInfo : '',
            background_color_hex : '',
            transformMode : '',
            selectionRange : false,
            fontStyle : [],
            fontStyleIdx : '',
            editModeEnabled : true,
            layerDraggable : true,
            layerResizable : true,
        }
        $scope.modifiedTemplateLayers = [];
        //정렬된 레이어
        $scope.layerListOrdered = layerMngService.getLayerList();
        $scope.imageList = {};
        //이미지 검색 세부 탭
        $scope.imageSearchTab = {name : ''};
        $scope.addLayerRectInfo = {left : 10,top : 10,width : 300,height : 100};
        $scope.imageSearchInfo = {};
        //rgb 선택 모드 활성화
        $scope.colorPickerMode = false;
        $scope.fontLang = {
            lang_kr : commonFunctionFactory.getLocalStorage('lang_kr',1)
            ,lang_en : commonFunctionFactory.getLocalStorage('lang_en',1)
            ,lang_cn : commonFunctionFactory.getLocalStorage('lang_cn',0)
            ,lang_jp : commonFunctionFactory.getLocalStorage('lang_jp',0)
        }
        $scope.fontName = {};
        $scope.shapeBorderStyleSelect = {
            value : blockEditorValue.selectOption.shapeBorderStyle[0]
        }
        $scope.toolbarShapeButtonShow = false;
        $scope.layerHistory = historyFactory;
        $scope.tagMapping = tagMappingService; //자동 객체 조합
        $rootScope.currentLayer = false;
        $scope.developementMode = (_hostName.search('dwkim02') != -1)?true:false;
        $scope.templateUrl = blockEditorValue.templateUrl;
        $scope.sideTab = blockEditorValue.templateUrl.sideTab;
        $scope.apiUrl = blockEditorValue.api;
        $scope.logout = loginFactory.logout;
        $scope.fontSizes = blockEditorValue.fontSizes;
        $scope.fontTracking = blockEditorValue.fontTracking;
        $scope.fontLeading = blockEditorValue.fontLeading;
        $scope.fontStyles = {show : [],all : [],lang_kr : [],lang_en : [],lang_cn : [],lang_jp : []};
        $scope.defaultLayerImg = blockEditorValue.defaultLayerImg;
        $scope._selectOption = blockEditorValue.selectOption;
        $scope.masonryOption = {
            'fitWidth' : false
            ,'percentPosition' : true
            ,transitionDuration : '0.8s'
        }
        //이미지 업로드 설정
        $scope.imgDragUpload = fileUploadFactory.make({
            url : blockEditorValue.api.imageUpload,
            alias : 'image_file',
            autoUpload : true,
            fileSizeLimit : 5242880, //5MB
            fileType : ["jpeg","jpg","png","gif","bmp"],
            onSuccessItem : function(fileItem,response,status,headers){
                if(response.status == blockEditorValue.statusCode.success){
                    Notification.success(commonFunctionFactory.translate('fileUploadDone'));
                    if(angular.isDefined(response.layer_idx)&&response.layer_idx){
                        //기존 레이어의 이미지 변경
                        Notification.info(commonFunctionFactory.translate('imageUploadLayerChange',{index : response.layer_idx}));
                        layerMngService.setLayerByIndex(response.layer_idx,{ImageFile : response.url});
                    }else{
                        //신규 레이어 생성하여 이미지 추가
                        Notification.info(commonFunctionFactory.translate('imageAddDone'));
                        var atrr = {
                            ImageFile : response.url
                            ,isAddedLayer : false
                            ,magicWand : {imageOriginalSrc : response.url}
                        }
                        var _layer = $scope.layerMng.addLayer('image',atrr,response.width,response.height);
                        response.layer_idx = _layer.Index;
                    }
                    imgMngService.loadImage({Index : response.layer_idx,ImageFile : response.url});
                }else{
                    Notification.error(commonFunctionFactory.translate('fileUploadFail'));
                }
            }
        })

        /** WATCH START **/
        $scope.$watch('psdTemplateInfo.rect',function(data){
            if(data)$scope.rectSizeChange(data);
        });

        /** 배경 레이어 컬러 변경 **/
        $scope.$watch('psdTemplateInfo.background_color_hex',function(newValue,oldValue){
            if(newValue){
                $scope.blockInfo.background_color = commonFunctionFactory.hexToRgb(newValue);
            }
        });

        /** 변경된 레이어 탐지 **/
        $scope.$watch('currentLayer',function(newLayer,oldValue){
            if(newLayer&&angular.isDefined(newLayer.Index)){
                $scope.rollbackToOriginalData(newLayer);
                $scope.insertModifiedTemplateLayer(newLayer,oldValue);
                /** prevent multi layer select event **/
                if(angular.isDefined(newLayer.TransformMode)&&newLayer.TransformMode.Mode == 'crop'){
                    $scope.multiSelectLayer.disable();
                }
                /** rotation calculate **/
                if(angular.isDefined(newLayer.RotationWeb)){
                    newLayer.Rotation = commonFunctionFactory.degreeToPhotoshopDegree(newLayer.RotationWeb);
                }
                layerMngService.setLayerByIndex(newLayer.Index,newLayer,true);
            }
        },true);

        $scope.$on('layerMng.resetCurrentLayer',function(){
            $scope.layerMng.resetCurrentLayer();
        })

        $scope.$on('multiSelectLayer.init',function(){
            $scope.multiSelectLayer.init();
        })

        $scope.$on('layerMng.layerListChange',function(evt,data){
            $scope.layerListOrdered = layerMngService.getLayerList();
        })

        $scope.$on('layerMng.layerSetting',function(evt,layer){
            $scope.getLayerSetting(layer);
        })

        /** 히스토리 관리 기능 **/
        $scope.$on('history.makeHistory',function(evt,layer){
            if(layer) $scope.layerHistory.makeHistory(layer);
        })

        /** color pick **/
        $scope.$on('colorpicker-closed',function(evt,data){
            if(data.name == 'psdTemplateInfo.rgbColorInfo'&&$rootScope.currentLayer){
                $rootScope.currentLayer.Text_Properties[0].Color = commonFunctionFactory.hexToRgb(data.value);
                $rootScope.currentLayer.textRenderRequire = true;
                $scope.$apply();
            }
        })

        $scope.$on('masonry.reloaded',function(evt,data){
            $scope.mansonryRefresh();
        })

        $scope.$on('resize.rotateDone',function(evt,deg){
            if($rootScope.currentLayer){
                $scope.layerHistory.makeHistory($rootScope.currentLayer);
                $rootScope.currentLayer.Rotation = commonFunctionFactory.degreeToPhotoshopDegree(deg);
                $rootScope.currentLayer.RotationWeb = deg;
                $rootScope.currentLayer.textRenderRequire = true;
            }
        })

        $scope.$on('multiSelectLayer.groupToggle',function(evt,layer){
            if(layer.isSelectedGroup){
                $scope.multiSelectLayer.addGroup(layer);
            }else{
                $scope.multiSelectLayer.removeGroup(layer);
            }
        })
        /***********************************
         * WATCH END
         ***********************************/
        /** 초기화 **/
        $scope.initPsdTemplateData = function(){
            $scope.blockInfo = {}
            $scope.psdTemplateInfo = {
                size : '',
                rect : '',
                rgbColorInfo : '',
                background_color_hex : '',
                transformMode : '',
                selectionRange : false,
                fontStyle : [],
                fontStyleIdx : '',
                editModeEnabled : true,
                layerDraggable : true,
                layerResizable : true,
            }
            $scope.modifiedTemplateLayers = [];
            /** 정렬된 레이어 **/
            $scope.layerListOrdered = layerMngService.getLayerList();
            $scope.imageList = {};
            /** 이미지 검색 세부 탭 **/
            $scope.imageSearchTab = {name : ''};
            $scope.addLayerRectInfo = {left : 10,top : 10,width : 300,height : 100};
            $scope.imageSearchInfo = {};
            /** rgb 선택 모드 활성화 **/
            $scope.colorPickerMode = false;
            $scope.fontLang = {
                lang_kr : commonFunctionFactory.getLocalStorage('lang_kr',1)
                ,lang_en : commonFunctionFactory.getLocalStorage('lang_en',1)
                ,lang_cn : commonFunctionFactory.getLocalStorage('lang_cn',0)
                ,lang_jp : commonFunctionFactory.getLocalStorage('lang_jp',0)
            }
            $scope.fontName = {};
            /** shape **/
            $scope.shapeBorderStyleSelect.value = $scope._selectOption.shapeBorderStyle[0];
        }

        /** layer 관리 **/
        $scope.layerMng = {
            /** layer zindex **/
            changeLayerStack : function(mode){
                layerMngService.initSelectedGroupLayer();
                layerMngService.changeLayerStack(mode);
            },
            /** 선택된 레이어 초기화 **/
            initSelectedLayer : function(layer){
                layerMngService.initSelectedLayer(layer);
            },
            /** 특정 layer 삭제 **/
            removeLayer : function(){
                var _selectedlayerList = $scope.multiSelectLayer.getList();
                if(_selectedlayerList){
                    angular.forEach(_selectedlayerList,function(_layer,idx){
                        layerMngService.removeLayer(_layer);
                        //tagMappingService.delLayerInfo(_layer.Index);
                    });
                    $scope.multiSelectLayer.reset();
                }else{
                    //tagMappingService.delLayerInfo($rootScope.currentLayer.Index);
                    layerMngService.removeLayer($rootScope.currentLayer);
                }
            },
            /** current 삭제 **/
            removeCurrent : function(){
                layerMngService.removeCurrent();
            },
            /** current 초기화 **/
            resetCurrentLayer : function(){
                $rootScope.currentLayer = false;
            },
            addLayer : function(mode,_attr,width,height){
                return layerMngService.addLayer(mode,_attr,width,height);
            },
            /** 마스크 레이어 클릭 **/
            initMaskLayer : function(evt){
                if(evt&&evt.shiftKey){
                    $scope.layerMng.resetCurrentLayer();
                }
                $scope.getLayerSetting($rootScope.currentLayer,evt);
            },
            /** 레이어 복사 **/
            layerCopy : function(evt){
                evt.preventDefault();
                var _selectedlayerList = $scope.multiSelectLayer.getList();
                if(_selectedlayerList){
                    angular.forEach(_selectedlayerList,function(_layer,idx){
                        layerMngService.layerCopy(_layer);
                    });
                }else{
                    layerMngService.layerCopy($rootScope.currentLayer);
                }
            },
            /** 탭키 레이어 순환 선택 **/
            layerSelectWithTab : function(evt){
                layerMngService.layerSelectWithTab(evt);
            }
        }

        /** 언어권 변경 **/
        $scope.changeLanguage = function(){
            var _expireDate = new Date().getDate()+365;
            ipCookie(blockEditorValue.cookie.lang,$filter('lowercase')($scope.editorPreferLang),{expires : _expireDate});
            $translate.use($scope.editorPreferLang);
        }
        /** 파일 멀티 업로드 모달 **/
        $scope.fileUploadModal = function(){
            $scope.layerMng.resetCurrentLayer();
            $scope.psdUploadFileInfo = false;
            var modalInstance = $uibModal.open({
                animation : true,
                templateUrl : blockEditorValue.templateUrl.fileUpload,
                controller : 'fileUploadCtrl',
                size : 'lg',
                resolve : {
                    items : function(){
                        return {mode : 'img'};
                    }
                }
            });

            modalInstance.result.then(function(selectedItem){
                $scope.selected = selectedItem;
            },function(){
                console.info('Modal dismissed at: '+new Date());
            });
        };

        /** PSD 업로드 모달 **/
        $scope.modalPsdUpload = function(){
            $scope.psdFileUploadInfo = {
                uploading : true,
                info : false
            };
            $scope.layerMng.resetCurrentLayer();
            var modalInstance = $uibModal.open({
                animation : true,
                templateUrl : blockEditorValue.templateUrl.fileUploadPSD,
                controller : 'fileUploadCtrl',
                size : 'lg',
                resolve : {
                    items : function(){
                        return {mode : 'psd',item : $scope.blockInfo};
                    }
                }
            });

            modalInstance.result.then(function(psdFileInfo){
                if(psdFileInfo){
                    $scope.psdFileUploadInfo.uploading = false;
                    $scope.psdFileUploadInfo.info = psdFileInfo;
                    /** 렌더 대기창 생성 **/
                    $scope.blockStatusMng.refreshStart();
                }
            },function(psdFileInfo){
                $scope.psdFileUploadInfo.uploading = false;
                console.info('Modal dismissed at: '+new Date());
            });
        };

        /** 폰트 로컬스토리지 저장 및 필터 적용 **/
        $scope.fontLocalSave = function(){
            let fontSet = new Set();
            angular.forEach($scope.fontLang,function(lang,idx){
                if(lang == '1'){
                    angular.forEach($scope.fontStyles[idx],function(val,idx){
                        if(fontSet.has(val) === false) fontSet.add(val);
                    })
                }
                commonFunctionFactory.setLocalStorage(idx,lang);
            })
            $scope.fontStyles.show = Array.from(fontSet).reverse();
        }

        /** 폰트 호출 **/
        $scope.getTextFont = function(){
            var _query = {lang_kr : 1,lang_en : 1,lang_cn : 1,lang_jp : 1},
                params = {
                    offset : 0
                    ,limit : 1000
                    ,q : commonFunctionFactory.makeSearchParams(_query)
                }
            commonSvc.get($scope.apiUrl.getFontType,params).then(function(response){
                var _response = response.data;
                if(_response.status == blockEditorValue.statusCode.success){
                    angular.forEach(_response.items,function(_font,idx){
                        var _findLangName = ['lang_kr','lang_en','lang_cn','lang_jp'];
                        angular.forEach(_findLangName,function(_name,idx){
                            if(_font[_name] == '1') $scope.fontStyles[_name].push(_font);
                        })
                    })
                    $scope.fontStyles.all = _response.items;
                    $scope.fontLocalSave();
                }else{
                    Notification.error(_response.message);
                    $scope.fontStyles = [];
                }
            },function(e){
                Notification.error(commonFunctionFactory.translate('fontListRequestFail'));
            });
        }

        /** get mall info **/
        $scope.getMallInfo = function(){
            commonSvc.get(blockEditorValue.api.mallLIst).then(function(response){
                var _response = response.data;
                if(_response.status == blockEditorValue.statusCode.success){
                    $scope.mallList = _response.items;
                }
            });
        }

        /** typeahead mall 선택 **/
        $scope.uiSelectMallInfo = function($item,$model,$label,$event){
            //console.log($item);
        }

        /** ui-select shape border style **/
        $scope.uiSelectShapeBorderStyle = function($item,$model,$label,$event){
            if($rootScope.currentLayer){
                $rootScope.currentLayer.DashEnable = $item.dash;
                $rootScope.currentLayer.DashLineWidth = $item.width;
                $rootScope.currentLayer.DashLineDistance = $item.distance;
                $scope.shapeBorderStyleSelect.value = $item;
            }
        }

        /** typeahead 폰트 선택 **/
        $scope.typeaheadFontSelect = function($item,$model,$label,$event){
            if($rootScope.currentLayer&&$rootScope.currentLayer.Text_Properties[0]){
                $rootScope.currentLayer.Text_Properties[0].Font = $item.system_name;
                $rootScope.currentLayer.Text_Properties[0].webFont = $item.web_font;
                $rootScope.currentLayer.textRenderRequire = true;
                //$scope.fontName.value = $item.name;
                $scope.fontName.value = $item;
            }
        }

        /** 클립보드로 부터 이미지 붙여넣기 **/
        $scope.clipboardPasteImage = function(event){
            if(event.target.className == 'sp-input'||event.target.type == 'textarea'){
                //컬러 입력 && TEXTAREA
                return;
            }
            var items = (event.clipboardData||event.originalEvent.clipboardData).items;
            for(var index in items){
                var item = items[index];
                if(item.kind === 'file'){
                    _pasteFromImage(item);
                }else if(item.kind == 'string'){
                    _pasteFromString(item);
                }else{
                    //Notification.error('[붙여넣기]이미지 타입이 아닙니다.');
                }
            }
        }

        function _pasteFromImage(item){
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function(event){
                var _dataUrl = event.target.result;
                _dataUrl = _dataUrl.split(',');
                _dataUrl = _dataUrl[1];
                var params = {
                    se_block_idx : $scope.urlParameters.idx
                    ,layer_index : 0
                    ,image_binary : _dataUrl
                };
                commonSvc.post($scope.apiUrl.imageCrop,params).then(function(response){
                    var _response = response.data;
                    if(_response.status == blockEditorValue.statusCode.success){
                        var attr = {
                            ImageFile : _response.image_url
                            ,isAddedLayer : false
                            ,undoRemoveLayerNewLayer : true
                        }
                        $scope.layerMng.addLayer('image',attr,_response.image_width,_response.image_height);
                    }else{
                        Notification.error(commonFunctionFactory.translate('imageUploadFailByPaste'));
                    }
                });
            }; // data url!
            reader.readAsDataURL(blob);
        }

        function _pasteFromString(item){
            item.getAsString(function(str){
                if($rootScope.currentLayer&&$rootScope.currentLayer.Type == 'text'){
                    $scope.$apply(function(){
                        $rootScope.currentLayer.Text = str;
                    });
                }
            })
        }

        $scope.getLayerSettingDisable = false;
        /** 레이어 선택 초기화 **/
        $scope.getLayerSetting = function(layer,evt){
            if($scope.getLayerSettingDisable == true){
                //이전 이벤트가 드래그엔드 이벤트라면 아무것도 하지 않음
                return;
            }
            if(evt&&evt.shiftKey){
                var _selectedlayerList = $scope.multiSelectLayer.getList()
                    ,_layerIndex = evt.target.dataset.layerIndex
                    ,_exist = false;
                if(_selectedlayerList){
                    /** 이미 선택된 레이어라면 제거 **/
                    for(var i = 0; i<_selectedlayerList.length; i++){
                        if(_selectedlayerList[i].Index == _layerIndex){
                            _selectedlayerList.splice(i,1);
                            angular.element(evt.target).removeClass('ui-selected');
                            _exist = true;
                            break;
                        }
                    }
                }
                /** 다중 레이어 추가 **/
                if(_exist === false){
                    $scope.multiSelectLayer.add(_layerIndex);
                    angular.element(evt.target).addClass('ui-selected');
                }
            }else{
                //resizable 초기화
                _makeResizableLayer(layer);
                $scope.multiSelectLayer.init().enable();
                $scope.layerMng.initSelectedLayer(layer);
                layer.isSelected = true;
                $rootScope.currentLayer = layer;
                $scope.psdTemplateInfo.rect = commonFunctionFactory.rectToObject(layer.Rect);
                if(layer.Type == 'text'&&angular.isDefined(layer.Text_Properties[0])){
                    /** 폰트 데이터 설정 **/
                    var _property = layer.Text_Properties[0];
                    $scope.fontName.value = _searchFontData(_property.Font);
                    //Tracking
                    angular.element('input[name=selectEditableTracking]').val(_property.Tracking);
                    //Leading
                    var _leading = 'Auto';
                    if(angular.isDefined(_property.Leading)){
                        if(_property.Leading.Auto !== true&&angular.isDefined(_property.Leading.Value)){
                            var _leading = _property.Leading.Value;
                        }
                    }else{
                        _property.Leading = {Auto : true};
                    }
                    angular.element('input[name=selectEditableLeading]').val(_leading);
                    //Font size
                    layer.Text_Properties[0].Size = Math.round(_property.Size);
                    angular.element('input[name=selectEditableFontSize]').val(layer.Text_Properties[0].Size);
                }else if(layer.Type == 'shape'){
                    $scope.shapeBorderStyleSelect.value = _searchBorderStyle(layer);
                }
            }
            $scope.sideTabMove('layer');
        }

        /** resizable 초기화 **/
        function _makeResizableLayer(layer){
            var resizableElement = angular.element('div[name=maskLayer]').find('.ui-resizable-handle');
            if(layer.Type == 'shape'&&layer.ShapeType == 'line'){
                var showClass = ['.ui-resizable-em','.ui-resizable-wm'];
                resizableElement.hide().end().find(showClass.toString()).show();
            }else{
                resizableElement.show();
            }
            //angular.element('div[name=maskLayer]').resizable("option","handles","s");
            //angular.element('div[name=maskLayer]').resizable("destroy");
        }


        $scope.checkExistCurrentObjDisable = true;
        $scope.mouseSelectionStatus = function(status){
            $scope.checkExistCurrentObjDisable = status;
        }
        /** 배경레이어 선택시 초기화 **/
        $scope.checkExistCurrentObj = function(evt){
            if($scope.checkExistCurrentObjDisable === false){
                //이전 이벤트가 드래그엔드 이벤트라면 아무것도 하지 않음
                return;
            }
            if(evt.target == evt.currentTarget){
                $scope.layerMng.resetCurrentLayer();
                $scope.multiSelectLayer.init();
                $scope.sideTabMove('layer');
            }
        }

        /** 폰트 검색 **/
        function _searchFontData(systemName){
            systemName = systemName||'NanumGothicBold';
            var _result = {name : systemName},_continue = true;
            angular.forEach($scope.fontStyles.all,function(_font,idx){
                if(_continue&&_font.system_name == systemName){
                    _result = angular.copy(_font);
                    _continue = false;
                }
            })
            return _result;
        }

        /** border style 검색 **/
        function _searchBorderStyle(layer){
            var _borderStyle = '';
            if(layer.DashEnable){
                for(var i = 0; i<$scope._selectOption.shapeBorderStyle.length; i++){
                    if($scope._selectOption.shapeBorderStyle[i].width == layer.DashLineWidth){
                        _borderStyle = $scope._selectOption.shapeBorderStyle[i];
                        break;
                    }
                }
            }else{
                _borderStyle = $scope._selectOption.shapeBorderStyle[0];
            }
            return _borderStyle;
        }

        /** 크롭 모드 시작 **/
        $scope.startCropMode = function(){
            if($rootScope.currentLayer&&$rootScope.currentLayer.Type == 'image'&&$rootScope.currentLayer.ImageFile){
                $rootScope.currentLayer.TransformMode = {Mode : 'crop'};
            }else{
                Notification.info("CROP MODE DISABLE");
            }
        }

        /** 크롭 모드 해제 **/
        $scope.destroyCrop = function(){
            if($rootScope.currentLayer&&angular.isDefined($rootScope.currentLayer.TransformMode)){
                $scope.multiSelectLayer.enable();
                var original = layerMngService.getOriginalLayerByIndex($rootScope.currentLayer.Index);
                if(original&&angular.isDefined(original.TransformMode)){
                    $rootScope.currentLayer.TransformMode = original.TransformMode;
                }else{
                    $rootScope.currentLayer.TransformMode.Mode = 'none';
                }
            }
        }

        $scope.cropperMethodWithHot = function(evt,hotkey){
            if(evt.keyCode == 13&&angular.isDefined($rootScope.currentLayer.TransformMode)
                &&$rootScope.currentLayer.TransformMode.Mode == 'crop'){
                $scope.cropperMethod(evt,'getCroppedCanvas');
            }
        }
        /** 이미지 크롭 **/
        $scope.cropperMethod = function(evt,method){
            var option = angular.element(evt.target).data('option');
            if(method === 'getCroppedCanvas'){
                try{
                    var _cropObj = angular.element('#cropImg');
                    var _cropBox = _cropObj.cropper('getCropBoxData');
                    var _cropRect = {width : _cropBox.width,height : _cropBox.height};
                    var _canvas = _cropObj.cropper('getCroppedCanvas',_cropRect);
                    var dataUrl = _canvas.toDataURL();
                    //var result = angular.element('#cropImg').cropper(method);
                    //var dataUrl = result.toDataURL();
                    dataUrl = dataUrl.split(',');
                    dataUrl = dataUrl[1];
                    var params = {
                        se_block_idx : $scope.urlParameters.idx
                        ,layer_index : $rootScope.currentLayer.Index
                        ,image_binary : dataUrl
                    };
                    /** 크롭된 이미지 파일 전송 **/
                    $scope.binaryImageUpload($scope.apiUrl.imageCrop,params).then(function(response){
                        var _layer = layerMngService.getLayerByIndex(response.layer_index)
                            ,layerRect = commonFunctionFactory.rectToObject(_layer.Rect);
                        _layer.Rect = commonFunctionFactory.rectToString(angular.extend(layerRect,_cropRect));
                        $scope.layerHistory.makeHistoryRedo(_layer);
                    })
                }catch(e){
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('imageCropModeFail'),{type : 'error'});
                    console.log(e);
                }
            }else if(method == 'zoom'){
                var option = angular.element(evt.target).data('option');
                angular.element('#cropImg').cropper('zoom',option)
            }
        }

        /** 이미지 바이너리 업로드 **/
        $scope.binaryImageUpload = function(url,params){
            var defer = $q.defer();
            commonSvc.post(url,params).then(function(response){
                var _response = response.data;
                if(_response.status == blockEditorValue.statusCode.success){
                    var _layer = layerMngService.getLayerByIndex(_response.layer_index)
                        ,_rect = commonFunctionFactory.rectToObject(_layer.Rect);
                    _rect.height = _response.image_height;
                    _rect.width = _response.image_width;
                    /** history **/
                    delete _layer.undoRemoveLayerNewLayer;
                    $scope.layerHistory.makeHistory(_layer);
                    imgMngService.loadImage({
                        Index : _response.layer_index,
                        ImageFile : _response.image_url
                    }).then(function(){
                        /** 이미지 파일 교체 **/
                        _layer.Rect = commonFunctionFactory.rectToString(_rect);
                        _layer.TransformMode = {Mode : 'none'};
                        _layer.isSelected = false;
                        _layer.ImageFile = _response.image_url;
                        $scope.layerMng.initSelectedLayer();
                        layerMngService.setLayerByIndex(_response.layer_index,_layer,true)
                        defer.resolve(_response);
                    })
                }else{
                    Notification.error({
                        message : _response.resultMsg,
                        title : commonFunctionFactory.translate('fileUploadFail')
                    });
                }
            });
            return defer.promise;
        }

        $scope.rectSizeChange = function(data,mode){
            if($rootScope.currentLayer){
                angular.forEach(data,function(val,idx){
                    if(!val) data[idx] = 0;
                })
                if(mode == 'width'||mode == 'height'){
                    $rootScope.currentLayer.TransformMode = {Mode : 'transform'};
                }
                var rect = [data.left,data.top,data.width,data.height];
                $rootScope.currentLayer.Rect = commonFunctionFactory.rectToString(rect);
                if($rootScope.currentLayer.Type == 'text')$rootScope.currentLayer.textRenderRequire = true;
            }
        };

        /** 텍스트 렌더 이미지 제거 **/
        $scope.textImageReset = function(){
            if($rootScope.currentLayer){
                $scope.layerHistory.makeHistory($rootScope.currentLayer);
                $rootScope.currentLayer.textRenderRequire = true;
                $rootScope.currentLayer.ImageFile = '';
            }
        }

        /** 텍스트 렌더 요청 **/
        var _textRenderQueue = [];
        $scope.textRenderRequest = function(_layer,_test){
            if($scope.developementMode){
                Notification.warning("개발 서버 입니다.");
            }else if(!_layer||_layer.Type != 'text'){
                Notification.warning(commonFunctionFactory.translate('layerEmpty'));
            }else if(!_layer.Text){
                Notification.warning(commonFunctionFactory.translate('textEmpty'));
            }else if(_layer.textRendering){
                Notification.warning(commonFunctionFactory.translate('textRendering'));
            }else{ //success
                Notification.info(commonFunctionFactory.translate('textRenderRequest'));
                /** 텍스트 렌더 정보 세팅 **/
                _layer = _makeTextRenderData(_layer);
                var params = {
                    mode : 'banner'
                    ,se_block_idx : $scope.urlParameters.idx
                    ,layer_index : _layer.Index
                    ,render_type : (_test)?1:0
                    ,json_data : commonFunctionFactory._base64Encode(_layer)
                }
                _layer.Text_Properties[0].Color = commonFunctionFactory.rgbToHex(_layer.Text_Properties[0].Color);
                commonSvc.post($scope.apiUrl.textRenderRequest,params).then(function(response){
                    var _response = response.data;
                    if(_response.status == blockEditorValue.statusCode.success){
                        Notification.success(_response.resultMsg);
                        var _tmpLayer = {
                            layer_index : _layer.Index
                            ,ImageFile : _layer.ImageFile
                            ,failCount : 0
                            ,interval : false
                        }
                        var _textRenderObj = angular.extend(_response.resultData,_tmpLayer);
                        var _interValTime = (_test)?5000:2000;
                        _textRenderObj.interval = $interval(_textRenderCheck,_interValTime,100,false,_textRenderObj);
                        _textRenderQueue.push(_textRenderObj);
                    }else{
                        Notification.error({
                            message : _response.resultMsg,
                            title : commonFunctionFactory.translate('textRenderFail')
                        });
                        _layer.textRendering = false;
                    }
                },function(e){
                    Notification.error(commonFunctionFactory.translate('textRenderFail'));
                    $rootScope.currentLayer.textRendering = false;
                });
            }
        }

        /** 텍스트 렌더 정보 세팅 **/
        function _makeTextRenderData(layer){
            var _textLength = layer.Text.length;
            layer.textRendering = true;
            layer.Text = layer.Text.replace(/\n/g,'\r');
            //layer.Name = layer.Text.substr(0,5);
            layer.Text_Properties[0].Color = commonFunctionFactory.hexToRgb(layer.Text_Properties[0].Color);
            layer.Text_Properties[0].Range.To = _textLength;
            layer.Text_Properties[0].Range.Length = _textLength;
            if(layer.Text_Properties[0].Leading&&layer.Text_Properties[0].Leading.Auto) layer.Text_Properties[0].Leading = {Auto : true};
            layer.Paragraph_Properties[0].Range.To = _textLength+1;
            layer.Paragraph_Properties[0].Range.Length = _textLength+1;
            delete layer.ImageFile;
            return layer;
        }

        /** check text render result **/
        function _textRenderCheck(_textRenderInfo){
            if(_textRenderInfo.failCount>20){
                Notification.error(commonFunctionFactory.translate('textRenderFail')+".. index="+_textRenderInfo.layer_index);
                layerMngService.setLayerByIndex(_textRenderInfo.layer_index,{textRendering : false});
                _textRenderQueue.shift();
                $interval.cancel(_textRenderInfo.interval);
                return;
            }
            var params = {idx : _textRenderInfo.se_json_to_image_idx};
            commonSvc.get($scope.apiUrl.textRenderCheck,params).then(function(response){
                var _response = response.data;
                if(_response.status == blockEditorValue.statusCode.success){
                    if(_response.resultData.status == '22'){ //complete
                        var _resultData = _response.resultData;
                        /** 기존 레이어 이미지 변경 **/
                        _textRenderQueue.shift();
                        $interval.cancel(_textRenderInfo.interval);
                        layerMngService.setLayerByIndex(_resultData.layer_index,{
                            isAddedLayer : false,
                            textRendering : false,
                            textRenderRequire : false,
                            ImageFile : _resultData.image_url
                        });
                        imgMngService.loadImage({
                            Index : _resultData.layer_index
                            ,ImageFile : _resultData.image_url
                        });
                        Notification.success(commonFunctionFactory.translate('textRenderSuccess'));
                    }else if(_response.resultData.status == '33'){//error
                        _textRenderQueue.shift();
                        $interval.cancel(_textRenderInfo.interval);
                        layerMngService.setLayerByIndex(_resultData.layer_index,{textRendering : false});
                        Notification.error(commonFunctionFactory.translate('textRenderError'));
                    }else{
                        _textRenderInfo.failCount++;
                    }
                }else{
                    Notification.error(_response.resultMsg);
                }
            });
        }

        /** 이미지 리스트 호출 **/
        $scope.getImageListByEnter = function(evt){
            if(evt.keyCode == 13)$scope.getImageList();
        }
        var _offsetInfo = {
            imagePre100 : 0
            ,imageDesign : 0
            ,imageMy : 0
        }
        $scope._isImageLoading = false;
        /** 이미지 리스트 호출 **/
        $scope.getImageList = function(isAppend){
            if($scope._isImageLoading == true){
                Notification.info(commonFunctionFactory.translate('searching'));
                return;
            }
            var mode = $scope.imageSearchTab.name
                ,limit = 50,offset = (angular.isUndefined(isAppend))?0:_offsetInfo[mode]
                ,_successCode = blockEditorValue.statusCode.success;
            switch(mode){
                case "imagePre100":
                    if(isAppend == 'append')return false;
                    if(!$scope.imageSearchInfo.prd_code){
                        Notification.info(commonFunctionFactory.translate('inputProductCode'));
                        return;
                    }
                    var params = {
                        mall_id : $scope.imageSearchInfo.mallInfo.mall_id
                        ,shop_no : $scope.imageSearchInfo.mallInfo.shop_no
                        ,prd_code : $scope.imageSearchInfo.prd_code
                        ,type : $scope.imageSearchInfo.productType
                    };
                    break;
                case "imageDesign":
                    var _query = {};
                    if($scope.imageSearchInfo.mallInfo)
                        _query.shop_idx = $scope.imageSearchInfo.mallInfo.id;
                    if($scope.imageSearchInfo.imageSearchType)
                        _query.le_type = $scope.imageSearchInfo.imageSearchType;
                    if($scope.imageSearchInfo.imageSearchCategory)
                        _query.category = $scope.imageSearchInfo.imageSearchCategory;
                    if($scope.imageSearchInfo.searchValue)
                        _query[$scope.imageSearchInfo.searchMode] = $scope.imageSearchInfo.searchValue;
                    var params = {limit : limit,offset : offset};
                    if(Object.keys(_query).length)
                        params.q = commonFunctionFactory.makeSearchParams(_query);
                    break;
                case "imageMy":
                    var params = {
                        order : $scope.imageSearchInfo.orderType+":"+$scope.imageSearchInfo.order
                        ,limit : limit
                        ,offset : offset
                    };
                    break;
                default:
                    return;
            }
            $scope._isImageLoading = true;
            /** get list **/
            commonSvc.get($scope.apiUrl[mode],params).success(function(response){
            //commonSvc.get('/resources_block_editor/se_image.json').success(function(response){
                $scope._isImageLoading = false;
                if(response.status == _successCode){
                    if(response.items.length == 0){
                        Notification.warning(commonFunctionFactory.translate('searchResultEmpty'));
                    }else{
                        Notification.success('['+mode+']'+commonFunctionFactory.translate('imageLoadDone'));
                        _offsetInfo[mode] += limit;
                        if(isAppend == 'append'){
                            $scope.imageList[mode].push.apply($scope.imageList[mode],response.items);
                        }else{
                            $scope.imageList[mode] = response.items;
                        }
                        $scope.mansonryRefresh();
                    }
                }else{
                    if(isAppend == 'append'){
                        //nothing
                    }else{
                        $scope.imageList[mode] = [];
                    }
                    Notification.info(response.message);
                }
            })
        }

        $scope.showImageSizeInfo = function(image){
            if(angular.isDefined(image.image_width)&&image.image_width&&angular.isDefined(image.image_height)&&image.image_height){
                return true;
            }else{
                return false;
            }
        }

        /** 내 이미지 리스트 삭제 **/
        $scope.removeImgList = function(img,evt){
            var params = {idx : img.idx};
            commonSvc.delete($scope.apiUrl.imageRemove,params).success(function(response){
                if(response.status == blockEditorValue.statusCode.success){
                    Notification.success(commonFunctionFactory.translate('imageDelDone'));
                    $scope.getImageList();
                }else{
                    Notification.error(response.message);
                }
            })
        }

        $scope.mansonryRefresh = function(){
            var _element = angular.element('.grid');
            _element.imagesLoaded(function(){
                setTimeout(function(){
                    _element.masonry();
                },800);
            })
        }

        $scope.getImageSrc = function(img){
            if(!img)return;
            var _src = '';
            if(img.url_thumb&& !$scope.developementMode){
                _src = img.url_thumb;
            }else if(img.url){
                _src = img.url;
            }else if(img.output_img_file_url){
                _src = img.output_img_file_url;
            }
            return _src;
        }

        /** 레이어 스타일 설정 **/
        $scope.setStyle = function(_layer){
            $scope.draggedItem = false;
            var _imgObj = imgMngService.getImage(_layer.Index);
            if(_layer.Text == ''||typeof _layer.Rect == 'undefined') return;
            var _rect = commonFunctionFactory.rectToObject(_layer.Rect);
            if(angular.isUndefined(_layer.zIndex))_layer.zIndex = _layer.Index;
            var _index = (_layer.zIndex)?_layer.zIndex:_layer.Index;
            var _transform = (_layer.RotationWeb)?'rotate('+_layer.RotationWeb+'deg)':'';
            var style = {
                position : 'absolute'
                ,top : _rect.top+"px"
                ,left : _rect.left+"px"
                ,width : _rect.width+"px"
                ,height : _rect.height+"px"
                ,opacity : _layer.Opacity*0.01
                ,'z-index' : _index
                ,transform : _transform
            };
            if(!_layer.visible)style['display'] = 'none';
            if(_layer.Type == 'text'){
                //var _fontSize = _property.Size+"px";
                var _fontSize = "13px";
                style['font-size'] = _fontSize;
                if(_layer.textRendering){
                    //style['background-image'] = 'url("/resources_block_editor/img/ajax-loader.gif")';
                    style['background-repeat'] = 'no-repeat';
                    style['background-size'] = 'auto';
                    style['background-position'] = 'center';
                }else if(_layer.ImageFile){
                    var _image = _layer.ImageFile;
                    style['background-image'] = 'url("'+_image+'")';
                    style['background-repeat'] = 'no-repeat';
                    style['background-size'] = 'auto';
                }
            }else if(_layer.Type == 'image'){
                var _image = (_layer.ImageFileCanvas)?_layer.ImageFileCanvas:_layer.ImageFile;
                style['background-image'] = 'url("'+_image+'")';
                style['background-repeat'] = 'no-repeat';
                style['background-size'] = (_layer.TransformMode)?_layer.TransformMode.background_size:'auto';
                if(_layer.TransformMode&&_layer.TransformMode.Mode == 'crop'&& !_layer.ImageFileCanvas){
                    style['background-position'] = _layer.TransformMode.cropPosition;
                }
                if(angular.isDefined(_layer.TransformMode)){
                    var transformMode = '',width = 0,height = 0,imgWidth = _imgObj.width,imgHeight = _imgObj.height;
                    switch(_layer.TransformMode.Mode){
                        case "none" :
                            if(_imgObj.loadDone == false){
                                //style['background-image'] = 'url("/resources_block_editor/img/ajax-loader.gif")';
                            }else{
                                _layer.ImageFileCanvas = false;
                                transformMode = 'auto';
                                //none 모드는 이미지 풀 사이즈로 보여줌
                                style.width = imgWidth;
                                style.height = imgHeight;
                                /** 레이어 사이즈를 이미지 크기로 변경 **/
                                _rect.width = imgWidth;
                                _rect.height = imgHeight;
                                _layer.Rect = commonFunctionFactory.rectToString(_rect);
                            }
                            break;
                        case "transform" :
                            _layer.ImageFileCanvas = false;
                            transformMode = _rect.width+'px'+" "+_rect.height+"px";
                            break;
                        case "ratio_width" :
                            _layer.ImageFileCanvas = false;
                            var ratio = _rect.width/imgWidth;
                            height = imgHeight*ratio;
                            transformMode = _rect.width+'px'+" "+height+"px";
                            style.width = _rect.width;
                            style.height = imgHeight;
                            break;
                        case "ratio_height" :
                            _layer.ImageFileCanvas = false;
                            transformMode = 'contain';
                            break;
                        case "crop" :
                            _layer.ImageFileCanvas = false;
                            transformMode = _rect.width+'px'+" "+_rect.height+"px";
                            //cropFunctionFactory.crop.open($scope);
                            break;
                    }
                    style['background-size'] = transformMode;
                }
            }
            return style;
        }

        /** 웹 텍스트 스타일 **/
        $scope.textWebStyle = function(layer){
            if(angular.isUndefined(layer)||angular.isUndefined(layer.Text_Properties)) return false;
            var _textProperty = layer.Text_Properties[0]
                ,textDecoration = (_textProperty.UnderLine)?'underline':''
                ,lineHeight = (_textProperty.Leading)?_textProperty.Leading+'%':''
                ,webFont = (_textProperty.webFont)?_textProperty.webFont:''
                ,color = (_textProperty.Color)?_textProperty.Color:'';
            if(!textDecoration) textDecoration = (_textProperty.Strike)?'line-through':'';
            return {
                color : color
                ,'font-family' : webFont
                ,'font-style' : (_textProperty.Italic)?'italic':'normal'
                ,'font-size' : _textProperty.Size+'px'
                ,'letter-spacing' : _textProperty.Tracking+'px'
                ,'line-height' : lineHeight
                ,'font-weight' : (_textProperty.Bold)?'bold':''
                ,'text-decoration' : textDecoration
            }
        }

        /** 마스크 레이어 스타일 설정 **/
        $scope.setMaskLayerStyle = function(){
            if(!$rootScope.currentLayer||angular.isUndefined($rootScope.currentLayer.Rect)){
                return {display : 'none'};
            }
            var _layer = $rootScope.currentLayer
                ,_originalLayer = layerMngService.getLayerByIndex(_layer.Index)
                ,_rect = commonFunctionFactory.rectToObject(_layer.Rect)
                ,_transform = (_layer.RotationWeb)?'rotate('+_layer.RotationWeb+'deg)':''
                ,style = '';
            if(Object.keys(_layer).length){
                style = {
                    width : _rect.width+"px"
                    ,height : _rect.height+"px"
                    ,border : '1px dashed #3f4652'
                    ,position : 'absolute'
                    ,top : _rect.top+'px'
                    ,left : _rect.left+'px'
                    ,'z-index' : 8000
                    ,transform : _transform
                };
                if(angular.isDefined(_layer.TransformMode)&&_layer.TransformMode.Mode == 'crop'){
                    style.display = 'none';
                }
            }
            return style;
        }

        /** crop 스타일 설정 **/
        $scope.setCropStyle = function(){
            if(!$rootScope.currentLayer||angular.isUndefined($rootScope.currentLayer.Rect))return;
            var _layer = $rootScope.currentLayer;
            var _rect = commonFunctionFactory.rectToObject(_layer.Rect);
            var style = '';
            if(Object.keys(_layer).length){
                style = {
                    width : _rect.width+"px"
                    ,height : _rect.height+"px"
                    ,position : 'absolute'
                    ,top : parseInt(_rect.top)+'px'
                    ,left : _rect.left+'px'
                    ,'z-index' : 8000
                };
            }
            return style;
        }

        /** 백그라운드 스타일 설정 **/
        $scope.setBackgroundStyle = function(){
            var style = '';
            if($scope.blockInfo&&Object.keys($scope.blockInfo).length){
                style = {
                    width : $scope.blockInfo.rect_width+"px"
                    ,height : $scope.blockInfo.rect_height+"px"
                    ,border : '1px gray solid'
                    ,position : 'absolute'
                    ,'background-color' : objectToRGB($scope.blockInfo.background_color)
                    ,overflow : 'hidden'
                };
            }
            return style;
        }

        /** 이미지 회전 아이콘 스타일 설정 **/
        $scope.setRotateStyle = function(layer){
            if(!layer) return;
            var _rect = commonFunctionFactory.rectToObject(layer.Rect);
            return {left : parseInt(_rect.width)/2};
        }

        function objectToRGB(obj){
            var rgb = (obj)?[obj.Red,obj.Green,obj.Blue]:[28,28,28];
            return "rgb("+rgb.join()+")";
        }

        /** text info 내 font style 이동 **/
        $scope.moveFontStyleInTextInfo = function(type){
            if(angular.isDefined($rootScope.currentLayer)&&$rootScope.currentLayer.Text_Properties){
                $rootScope.currentLayer.textRenderRequire = true;
                switch(type){
                    case "bold" :
                        $rootScope.currentLayer.Text_Properties[0].Bold = !$rootScope.currentLayer.Text_Properties[0].Bold;
                        break;
                    case "italic" :
                        $rootScope.currentLayer.Text_Properties[0].Italic = !$rootScope.currentLayer.Text_Properties[0].Italic;
                        break;
                    case "underline" :
                        $rootScope.currentLayer.Text_Properties[0].UnderLine = !$rootScope.currentLayer.Text_Properties[0].UnderLine;
                        break;
                    case "linethrough" :
                        $rootScope.currentLayer.Text_Properties[0].Strike = !$rootScope.currentLayer.Text_Properties[0].Strike;
                        break;
                }
            }
        }

        /** text info 내 정렬 이동 **/
        $scope.moveAlignInTextInfo = function(type){
            if($rootScope.currentLayer&&$rootScope.currentLayer.Paragraph_Properties){
                $scope.layerHistory.makeHistory($rootScope.currentLayer);
                $rootScope.currentLayer.Paragraph_Properties[0].Align = type;
                $rootScope.currentLayer.textRenderRequire = true;
            }
        }

        /** 사이드 메뉴 이동 **/
        $scope.sideTabMove = function(menu){
            var _sideTabShow = true;
            angular.forEach($scope.sideTab,function(tab,idx){
                if(angular.isObject(tab))tab.show = false; //init
            })
            if(menu == 'toggle'){
                menu = ($scope.sideTab.activeMenu)?$scope.sideTab.activeMenu:'none';
                _sideTabShow = !$scope.sideTab.show;
            }else if(menu == 'image'&&$rootScope.currentLayer.isAddedLayer){
                //기본 이미지는 이미지 업로드 탭으로 이동
                menu = 'search';
            }else if(menu == 'layer'){
                if($rootScope.currentLayer&&$rootScope.currentLayer.isAddedLayer
                    &&$rootScope.currentLayer.Type == 'image'){
                    menu = 'search';
                }else{
                    menu = ($rootScope.currentLayer)?$rootScope.currentLayer.Type:'none';
                }
            }else if(menu == 'tagMapping'){
                //$scope.tagMapping.init($scope.blockInfo.shop_no);
                $scope.tagMapping.init();
            }
            $scope.sideTab.activeMenu = menu;
            $scope.sideTab.show = _sideTabShow;
            if($scope.sideTab[menu])$scope.sideTab[menu].show = true;
            if(menu == 'search')$scope.mansonryRefresh();
            broadCastBlockInit();
        }

        /** resize **/
        $scope.resizeEnd = function(_size){
            if(typeof $rootScope.currentLayer.Rect == 'undefined') return;
            var _currentRect = commonFunctionFactory.rectToObject($rootScope.currentLayer.Rect);
            $scope.layerHistory.makeHistory($rootScope.currentLayer);
            //라인은 레이어 두께 고정
            if($rootScope.currentLayer.ShapeType&&$rootScope.currentLayer.ShapeType == 'line'){
                _size.height = 8;
            }
            var _rect = {
                top : parseInt(_currentRect.top)
                ,left : parseInt(_currentRect.left)
                ,width : parseInt(_size.width)
                ,height : parseInt(_size.height)
            }
            $scope.psdTemplateInfo.rect = _rect;
            $rootScope.currentLayer.Rect = commonFunctionFactory.rectToString(_rect);
            if($rootScope.currentLayer.Type == 'shape'){
                angular.forEach($rootScope.currentLayer.Corner,function(data,index,info){
                    info[index] = 0;
                })
            }
            layerMngService.setLayerByIndex($rootScope.currentLayer.Index,$rootScope.currentLayer,true);
        }

        /** 도형 관리 **/
        $scope.shapeMng = {
            /** 도형 추가 **/
            shapeAdd : function(mode){
                $scope.layerMng.addLayer('shape',{ShapeType : mode,Name : mode});
            },
            /** 사각형 코너 사이즈  변경 **/
            shapeCornerSizeChange : function(name){
                if($rootScope.currentLayer&&$rootScope.currentLayer.cornerLink){
                    var _value = $rootScope.currentLayer.Corner[name]||0;
                    angular.forEach($rootScope.currentLayer.Corner,function(data,idx,arr){
                        arr[idx] = _value;
                    })
                }
                //모서리가 둥근 사각형
                $rootScope.currentLayer.CornerEnable = false;
                for(var index in $rootScope.currentLayer.Corner){
                    if(parseInt($rootScope.currentLayer.Corner[index])>0){
                        $rootScope.currentLayer.CornerEnable = true;
                        layerMngService.setLayerByIndex($rootScope.currentLayer.Index,$rootScope.currentLayer,true);
                        break;
                    }
                }
            },
            borderSizeChange : function(){
                return;
                if($scope.currentLayer.ShapeType == 'line'&&$scope.currentLayer.BolderSize){
                    var _rect = commonFunctionFactory.rectToObject($scope.currentLayer.Rect);
                    if($scope.currentLayer.BolderSize>8){
                        //_rect.height = $scope.currentLayer.BolderSize;
                    }else{
                        _rect.height = 8;
                    }
                    $scope.currentLayer.Rect = commonFunctionFactory.rectToString(_rect);
                    $scope.psdTemplateInfo.rect = _rect;
                }
            }
        }

        /*****************************
         * DRAG AND DROP START
         *****************************/
        $scope.draggedItem = '';
        $scope.jqyDraggable = {
            animate : true
            //, placeholder : 'keep'
            //, applyFilter : 'myFilter'
            ,onStart : 'dragMngObj.dragStart(layer)'
            ,onStop : 'dragMngObj.dragStop(layer)'
            ,onDrag : 'dragMngObj.dragDoing(layer)'
        }

        $scope.dataJqyouiOptions = {
            //containment : 'parent',
            snap : true,
            snapTolerance : 10
        }

        $scope.tmpDragImage = {layer : '',item : ''};
        $scope.dragDrop = function(event,index,item,layer){
            if(angular.isUndefined(layer)){
                $scope.tmpDragImage = {layer : '',item : ''};
            }else{
                $scope.layerMng.initSelectedLayer(layer);
                $rootScope.currentLayer = layer;
                $scope.tmpDragImage = {layer : layer,item : item};
            }
        }

        $scope.imageDragStart = function($event){
            $scope.layerMng.resetCurrentLayer();
        }

        /** 이미지 리스트 드래그 엔드 이벤트 **/
        $scope.imageDragEnd = function(image){
            imgMngService.imageChangeFromList($scope.tmpDragImage.layer,image).then(function(){
                $scope.tmpDragImage = {layer : '',item : ''};
            })
        }

        /** 드래그 관리 객체 **/
        $scope.dragMngObj = {
            dragStart : function(event,drag,layer){
                /*****************************
                 * 레이어 드래그
                 *****************************/
                layer = (layer)?layer:$rootScope.currentLayer;
                layer.RectOriginal = angular.copy(layer.Rect);
                var _selectedlayerList = $scope.multiSelectLayer.getList()
                    ,_currentElementIndex = event.target.dataset.layerIndex
                    ,currentElementCheck = false;
                if(_selectedlayerList){
                    if(event.target.getAttribute('name') == 'maskLayer'){
                        currentElementCheck = true;
                    }else{
                        //선택한 레이어중에 현재 드래그하는 객체가 있는지 확인
                        for(var i = 0; i<_selectedlayerList.length; i++){
                            if(_selectedlayerList[i].Index == _currentElementIndex){
                                currentElementCheck = true;
                                break;
                            }
                        }
                    }
                    if(currentElementCheck){
                        angular.forEach(_selectedlayerList,function(_layer,idx){
                            $scope.layerHistory.makeHistory(_layer);
                            _layer.RectOriginal = angular.copy(_layer.Rect);
                        })
                    }else{
                        //멀티선택 후 선택되지 않은 레이어 이동 시 초기화 시킴
                        $scope.multiSelectLayer.init();
                    }
                }else{ //single layer move
                    $scope.layerHistory.makeHistory(layer);
                }
            },
            dragDoing : function(event,drag,layer){
                var _selectedlayerList = $scope.multiSelectLayer.getList();
                if(_selectedlayerList){ //multi
                    var _top = drag.position.top-drag.originalPosition.top;
                    var _left = drag.position.left-drag.originalPosition.left;
                    //console.log('dragDoing', {top : _top, left : _left});
                    angular.forEach(_selectedlayerList,function(_layer,idx){
                        $scope.multiSelectLayer.dragDoing(_layer,_top,_left);
                    })
                }else{ //single
                    if(layer){
                        $rootScope.currentLayer = false;
                    }else{
                        layer = $rootScope.currentLayer;
                    }
                    if(!layer||angular.isUndefined(layer.RectOriginal)) return;
                    var rect = commonFunctionFactory.rectToObject(layer.RectOriginal);
                    rect.top = parseInt(drag.position.top);
                    rect.left = parseInt(drag.position.left);
                    layer.Rect = commonFunctionFactory.rectToString(rect);
                    layerMngService.setLayerByIndex(layer.Index,{Rect : layer.Rect});
                    $rootScope.currentLayer = layer;
                    $scope.psdTemplateInfo.rect = rect;
                    $scope.$apply();
                }
            },
            dragStop : function(event,drag,layer){
                //$scope.multiSelectLayer.init();
                $scope.getLayerSettingDisable = true;
                setTimeout(function(){
                    $scope.getLayerSettingDisable = false;
                },100)
            }
        }

        /** 마우스 셀렉션 이벤트 객체 **/
        $scope.multiSelectLayer = {
            _elementName : 'div#mainEditorDiv',
            /** 선택된 레이어 리스트 **/
            gruopLayerList : [],
            /** 초기화 **/
            init : function(){
                $scope.layerMng.initSelectedLayer();
                this.gruopLayerList = [];
                angular.element('div.editorObj').removeClass('ui-selected'); //mouse selection
                return this;
            },
            getList : function(){
                return (this.gruopLayerList.length)?this.gruopLayerList:false;
            },
            reset : function(){
                this.gruopLayerList = [];
            },
            /** 마우스 레이어 선택 **/
            add : function(index){
                if(index){
                    var _layer = layerMngService.getLayerByIndex(index)
                    if(_layer){
                        _layer.RectOriginal = angular.copy(_layer.Rect);
                        _layer.isSelectedGroup = true;
                        this.gruopLayerList.push(_layer);
                    }
                }
            },
            addGroup : function(layer){
                this.gruopLayerList.push(layer);
            },
            removeGroup : function(layer){
                for(var i=0;i<this.gruopLayerList.length;i++){
                    if(this.gruopLayerList[i].Index == layer.Index){
                        this.gruopLayerList.splice(i, 1);
                        break;
                    }
                }
            },
            /** 레이어 이동 **/
            dragDoing : function(layer, top, left){
                if(!layer || angular.isUndefined(layer.RectOriginal)) return;
                var rect = commonFunctionFactory.rectToObject(layer.RectOriginal);
                rect.top = commonFunctionFactory.makeSum([rect.top, top]);
                rect.left = commonFunctionFactory.makeSum([rect.left, left]);
                layer.Rect = commonFunctionFactory.rectToString(rect);
                layerMngService.setLayerByIndex(layer.Index, {Rect:layer.Rect});
                $scope.$apply();
            },
            enable : function(){
                angular.element(this._elementName).selectable('enable');
            },
            disable : function(){
                angular.element(this._elementName).selectable('disable');
            }
        }

        /** 이미지 리스트 클릭 이벤트 **/
        $scope.imageChangeByClick = function(image){
            imgMngService.imageChangeFromList($rootScope.currentLayer, image);
        }
        /*****************************
         * DRAG AND DROP END
         *****************************/
        /** 텍스트 행간 데이터 변경 **/
        $scope.textLeadingChange = function(){
            // 숫자면 Auto값 false
            $rootScope.currentLayer.Text_Properties[0].Leading.Auto =
                isNaN($rootScope.currentLayer.Text_Properties[0].Leading.Value);
        }

        /** overlap 오른쪽 메뉴 클릭 **/
        $scope.contextMenuSelected = function(layer, evt){
            $scope.getLayerSetting(layer, evt);
        }

        /** 겹친 레이어 확인 **/
        $scope.intersectLayer = [];
        $scope.checkIntersectLayer = function(evt){
            $scope.intersectLayer = [];
            var offsetPos = $(".wrap-layers > div").offset();
            var _clickX = parseInt(evt.clientX - offsetPos.left);
            var _clickY = parseInt(evt.clientY - offsetPos.top);
            angular.forEach(layerMngService.getLayerList(), function(_layer, index){
                if(angular.isUndefined(_layer))return;
                var _rect = commonFunctionFactory.rectToObject(_layer.Rect);
                var _rectLeft = parseInt(_rect.left);
                var _rectRight = parseInt(_rect.left) + parseInt(_rect.width);
                var _rectTop = parseInt(_rect.top);
                var _rectBottom = parseInt(_rect.top) + parseInt(_rect.height);
                if (_clickX >= _rectLeft && _clickX <= _rectRight && _clickY >= _rectTop && _clickY <= _rectBottom) {
                    $scope.intersectLayer.push(_layer);
                }
            });
            if($scope.intersectLayer.length){
                /** sort array **/
                $scope.intersectLayer.sort(function(a,b){
                    return a.zIndex > b.zIndex ? -1 : a.zIndex<b.zIndex?1:0;
                });
            }
        };

        /** 인덱스 증가 버튼 **/
        $scope.zindexUpButtonContextMenu = function(layer){
            var _index = $scope.intersectLayer.indexOf(layer);
            if(_index > 0){
                var _chageIndex = _index-1
                    , _zIndex = layer.zIndex
                    , _tmpLayer = $scope.intersectLayer[_chageIndex];
                layer.zIndex = _tmpLayer.zIndex;
                _tmpLayer.zIndex = _zIndex;
                $scope.intersectLayer[_chageIndex] = layer;
                $scope.intersectLayer[_index] = _tmpLayer;
                //layerMngService.setOrderedLayerByIndex()
            }
        }

        /** 인덱스 감소 버튼 **/
        $scope.zindexDownButtonContextMenu = function(layer){
            var _index = $scope.intersectLayer.indexOf(layer);
            if(_index < $scope.intersectLayer.length-1){
                var _chageIndex = _index+1
                    , _zIndex = layer.zIndex
                    , _tmpLayer = $scope.intersectLayer[_chageIndex];
                layer.zIndex = _tmpLayer.zIndex;
                _tmpLayer.zIndex = _zIndex;
                $scope.intersectLayer[_chageIndex] = layer;
                $scope.intersectLayer[_index] = _tmpLayer;
            }
        }

        /** 원본크기로 원복 **/
        $scope.rollbackToOriginalData = function(layer){
            if(layer && angular.isDefined(layer.TransformMode) && layer.TransformMode.Mode == 'none'&& layer.ImageFile){
                imgMngService.loadImage({Index : layer.Index, ImageFile:layer.ImageFile}).then(function(data){
                    var _imgInfo = data.image;
                    var _rect = commonFunctionFactory.rectToObject(layer.Rect);
                    _rect.width = _imgInfo.width;
                    _rect.height = _imgInfo.height;
                    layer.Rect = commonFunctionFactory.rectToString(_rect);
                    $scope.psdTemplateInfo.rect = _rect;
                })
            }
        }

        /** 수정된 레이어 관리 **/
        $scope.insertModifiedTemplateLayer = function(layer, originalLayer){
            var alreadyExist = false;
            layer.Action = 'edit';
            if(layer.Type == 'text') layer.Text = layer.Text.replace(/\n\r/g, '\r');
            angular.forEach($scope.modifiedTemplateLayers, function(val, idx){
                if(!alreadyExist && layer.Index == val.Index){
                    $scope.modifiedTemplateLayers[idx] = layer;
                    alreadyExist = true;
                    return;
                }
            })
            if(alreadyExist == false) $scope.modifiedTemplateLayers.push(layer);
        }

        /** 미리보기 START **/
        $scope.preview = function(_mode){
            //var canvas = document.getElementById('canvasModuleEditor');
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var isError = false, defer = $q.defer()
            var errorMsg = {
                add : commonFunctionFactory.translate('checkAddedLayerStatus')
                , crop : commonFunctionFactory.translate('imageCancelCropMode')
            }
            var layerList = layerMngService.getLayerList().filter(function(n){ return n != undefined });
            angular.forEach(layerList, function(layer, idx){
                if(angular.isDefined(layer.isAddedLayer)&&layer.isAddedLayer){isError = 'add';}
                if(angular.isDefined(layer.TransformMode)&&layer.TransformMode.Mode=='crop'){isError = 'crop';}
            })
            if(isError != false){
                commonFunctionFactory.callWideNotify(errorMsg[isError], {position:'top',type:'error'});
                //$interval.cancel(_saveInterval);
                defer.reject();
                return;
            }
            Notification.info({message :commonFunctionFactory.translate('imageTotalLoad'), delay : 1000});
            var loadFinished = true;
            var _orderedImageObj = [];
            /** 이미지 로드 완료 체크 **/
            angular.forEach(layerList, function(layer, idx){
                if(angular.isDefined(layer.visible)&&layer.visible==true){
                    let _imgObj = '';
                    switch(layer.Type){
                        case "text":
                        case "image":
                            _imgObj = imgMngService.getImage(layer.Index);
                            if(angular.isUndefined(_imgObj)) return;
                            if(!_imgObj.loadDone){
                                loadFinished = false;
                                imgMngService.loadImage(layer);
                                commonFunctionFactory.callWideNotify('이미지 로딩 실패', {type : 'error'});
                                blockUI.stop();
                                //$interval.cancel(_saveInterval);
                                console.log(layer);
                            }else if(angular.isDefined(layer.visible)&&layer.visible){
                                /** 이미지 z-index 정렬 **/
                                _orderedImageObj[layer.zIndex] = {layer : layer, img : _imgObj};
                            }
                            break;
                        case "shape":
                            break;
                    }
                    _orderedImageObj[layer.zIndex] = {layer : layer, img : _imgObj};
                }
            });

            if(loadFinished){
                Notification.info({message :commonFunctionFactory.translate('canvasDrawing'), delay : 1000});
                //canvas 설정
                canvas.height = $scope.blockInfo.rect_height;
                canvas.width = $scope.blockInfo.rect_width;
                ctx.fillStyle= objectToRGB($scope.blockInfo.background_color);
                ctx.fillRect(0,0,canvas.width,canvas.height);
                //_orderedImageObj.reverse(); zIndex 높은 것을 먼저 그린다
                angular.forEach(_orderedImageObj, function(_obj, idx){
                    _drawToCanvas(_obj.layer, _obj.img, ctx);
                })
                //setTimeout(function(){_downloadCanvasImg(canvas, _mode);}, 500);
                _downloadCanvasImg(canvas, _mode).then(function(data){
                    defer.resolve(data);
                })
            }
            return defer.promise;
        }

        /** 캔버스 그리기 **/
        function _drawToCanvas(layer, _imgObj, ctx){
            try{
                //ctx.globalCompositeOperation='destination-over';
                //ctx.globalCompositeOperation='lighter';
                ctx.save();
                var ratio = 0,
                    layerImage = _imgObj.image,
                    rect = commonFunctionFactory.rectToObject(layer.Rect),
                    layerWidth = rect.width,
                    layerHeight = rect.height,
                    imgWidth = _imgObj.width,
                    imgHeight = _imgObj.height,
                    mode = (layer.TransformMode)?layer.TransformMode.Mode:'';
                rect.left = parseInt(rect.left);
                rect.top = parseInt(rect.top);
                rect.width = parseInt(rect.width);
                rect.height = parseInt(rect.height);
                /** 투명도 설정 **/
                ctx.globalAlpha = (layer.Opacity)?layer.Opacity * 0.01:1.0;
                /** 회전 설정 **/
                if(layer.RotationWeb) {
                    var _x = parseInt(rect.left)+.5*layerWidth;
                    var _y = parseInt(rect.top)+.5*layerHeight;
                    ctx.translate(_x,_y);
                    ctx.rotate(commonFunctionFactory.degreeToRadian(layer.RotationWeb));
                    rect.left = -Math.abs(parseInt(parseInt(rect.width)>>1));
                    rect.top = -Math.abs(parseInt(parseInt(rect.height)>>1));
                }

                //도형 타입
                if(layer.Type=='shape'){
                    var _x = rect.left+parseInt(rect.width/2)
                        , _y = rect.top+parseInt(rect.height/2);
                    ctx.beginPath();
                    //ctx.globalAlpha = layer.FillOpacity;
                    ctx.fillStyle = commonFunctionFactory.rgbToStr(commonFunctionFactory.hexToRgb(layer.FillColor), layer.FillOpacity);
                    ctx.strokeStyle = commonFunctionFactory.rgbToStr(commonFunctionFactory.hexToRgb(layer.BolderColor), layer.BolderOpacity);
                    ctx.lineWidth = layer.BolderSize;
                    if(layer.DashEnable)ctx.setLineDash([layer.DashLineWidth, layer.DashLineDistance]);
                    switch(layer.ShapeType){
                        case "Rectangle":
                            if(layer.CornerEnable){ //모서리가 둥근 사각형
                                var _corner = commonFunctionFactory.toInteger(layer.Corner);
                                ctx.moveTo(rect.left + _corner.RightTop, rect.top);
                                ctx.lineTo(rect.left + rect.width - _corner.RightTop, rect.top);
                                ctx.quadraticCurveTo(rect.left + rect.width, rect.top, rect.left + rect.width, rect.top + _corner.RightTop);
                                ctx.lineTo(rect.left + rect.width, rect.top + rect.height - _corner.RightBottom);
                                ctx.quadraticCurveTo(rect.left + rect.width, rect.top + rect.height, rect.left + rect.width - _corner.RightBottom, rect.top + rect.height);
                                ctx.lineTo(rect.left + _corner.LeftBottom, rect.top + rect.height);
                                ctx.quadraticCurveTo(rect.left, rect.top + rect.height, rect.left, rect.top + rect.height - _corner.LeftBottom);
                                ctx.lineTo(rect.left, rect.top + _corner.LeftTop);
                                ctx.quadraticCurveTo(rect.left, rect.top, rect.left + _corner.LeftTop, rect.top);
                            }else{
                                ctx.rect(rect.left,rect.top,rect.width,rect.height);
                            }
                            break;
                        case "Ellipse":
                            var kappa = .5522848,
                                ox = (rect.width / 2) * kappa, // control point offset horizontal
                                oy = (rect.height / 2) * kappa, // control point offset vertical
                                xe = rect.left + rect.width, // x-end
                                ye = rect.top + rect.height, // rect.top-end
                                xm = rect.left + rect.width / 2, // x-middle
                                ym = rect.top + rect.height / 2; // rect.top-middle
                            ctx.moveTo(rect.left, ym);
                            ctx.bezierCurveTo(rect.left, ym - oy, xm - ox, rect.top, xm, rect.top);
                            ctx.bezierCurveTo(xm + ox, rect.top, xe, ym - oy, xe, ym);
                            ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                            ctx.bezierCurveTo(xm - ox, ye, rect.left, ym + oy, rect.left, ym);
                            break;
                        case "line":
                            ctx.moveTo(rect.left, rect.top);
                            ctx.lineTo(rect.left+rect.width, rect.top);
                            ctx.strokeStyle = commonFunctionFactory.rgbToStr(commonFunctionFactory.hexToRgb(layer.FillColor), layer.FillOpacity);
                            ctx.lineWidth = layer.BolderSize;
                            ctx.stroke();
                            break;
                        case "circle":
                            ctx.arc(_x,_y,rect.width/2,0,2*Math.PI);
                            break;
                        default:
                            break;
                    }
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }else{ //일반 이미지
                    switch(mode){
                        case "transform":
                            ctx.drawImage(layerImage, 0, 0, imgWidth, imgHeight, rect.left, rect.top, layerWidth, layerHeight);
                            break;
                        case "ratio_width":
                            ratio = layerWidth / imgWidth;
                            var _height = imgHeight * ratio;
                            ctx.drawImage(layerImage, 0, 0, imgWidth, imgHeight, rect.left, rect.top, layerWidth, _height);
                            break;
                        case "ratio_height":
                            ratio = layerHeight / imgHeight;
                            var _width = 0;
                            if(imgWidth > imgHeight){
                                _width = imgWidth;
                            }else{
                                _width = layerWidth / ratio;
                            }
                            ctx.drawImage(layerImage, 0, 0, _width, imgHeight, rect.left, rect.top, layerWidth, layerHeight);
                            break;
                        case "crop":
                            if(layer.TransformMode.CropRect){
                                var cropRect = commonFunctionFactory.rectToObject(layer.TransformMode.CropRect);
                                ctx.drawImage(layerImage, cropRect.left, cropRect.top, cropRect.width, cropRect.height
                                    , rect.left, rect.top, cropRect.width, cropRect.height);
                            }
                            break;
                        default: //none
                            ctx.drawImage(layerImage, 0, 0, imgWidth, imgHeight, rect.left, rect.top, imgWidth, imgHeight);
                    }
                }
                ctx.restore();
            }catch(e){
                console.log(e);
            }
        }

        function _downloadCanvasImg(canvas, _mode){
            try{
                var defer = $q.defer();
                var toDataUrl = canvas.toDataURL("image/png");
                previewImageBinary = toDataUrl;
                defer.resolve(toDataUrl);
                if(_mode != 'data_only'){
                    window.open(toDataUrl,'_blank');
                    /*
                     var _aTag = document.createElement('a');
                     _aTag.download = 'moduleEditorCanvasImage.png';
                     _aTag.href =  toDataUrl.replace("image/png", "image/octet-stream");
                     _aTag.click();
                     */
                }
            }catch(e){
                commonFunctionFactory.callWideNotify('이미지 변환 에러 - '+e.message, {type : 'error', position:'top'});
                blockUI.stop();
                defer.reject();
            }finally{
                return defer.promise;
            }
        }
        /** 미리보기 END **/

        var _saveInterval = '';
        /** 블럭 에디터 상태 관리 **/
        $scope.blockStatusMng = {
            interval : '',
            notEditableStatus : ['113', '131'],
            refreshStart : function(){
                this.getBlockInfo();
                this.interval = $interval(this.getBlockInfo, 5000, 30, false);
            },
            /** 블럭 정보 호출 **/
            getBlockInfo : function(){
                commonSvc.get(blockEditorValue.api.blockInfo+"/"+$scope.urlParameters.idx).then(function(response){
                    var _response = response.data;
                    blockUI.start(commonFunctionFactory.translate('psdRenderProgress'));
                    if(_response.status == blockEditorValue.statusCode.success){
                        var _data = _response.items.pop();
                        switch(_data.se_request_status_idx){
                            case "121"://제작요청 작업진행중 상태
                            case "142"://제작요청 검수완료 상태
                                blockUI.stop();
                                $window.location.reload();
                                break;
                            case "119"://PSD 업로드 에러
                                blockUI.stop();
                                $interval.cancel($scope.blockStatusMng.interval);
                                commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('renderError'), {type:'error', position:'top'});
                                break;
                            case "113"://PSD 업로드중
                            case "131"://제작요청 검수제작중 상태
                            default:
                                Notification.info('wait');
                                break;
                        }
                    }
                });
            },
            /** SAVE **/
            save : function(){
                var isError = false, json_data = [], defer = $q.defer();
                var notifySetting = {position:'top',type:'error'};
                angular.forEach(layerMngService.getLayerList(), function(_layer, idx){
                    var layer = angular.copy(_layer);
                    if(layer && isError==false){
                        if(angular.isDefined(layer.isAddedLayer)&&layer.isAddedLayer){
                            isError = true;
                        }
                        if(layer.undoRemoveLayerNewLayer) delete layer.undoRemoveLayerNewLayer;
                        //rect parse to int
                        layer.Rect = commonFunctionFactory.rectToString(commonFunctionFactory.rectToObject(layer.Rect));
                        if(layer.Type=='shape'){
                            layer.FillColor = commonFunctionFactory.hexToRgb(layer.FillColor);
                            layer.BolderColor = commonFunctionFactory.hexToRgb(layer.BolderColor);
                        }else if(layer.Type=='text'){
                            if(angular.isDefined(layer.Text_Properties)&&layer.Text_Properties[0]){
                                layer.Text_Properties[0].Color = commonFunctionFactory.hexToRgb(layer.Text_Properties[0].Color);
                                if(layer.Text_Properties[0].Leading&& Object.keys(layer.Text_Properties[0].Leading).length==0){
                                    // Leading 비어 있는 경우, 기본값 할당
                                    layer.Text_Properties[0].Leading = {Auto:true};
                                }
                                if(layer.Text_Properties[0].Size==null){
                                    layer.Text_Properties[0].Size = 15;
                                }
                            }
                        }
                        layer.isSelectedGroup = false;
                        json_data[layer.zIndex] = layer;
                    }
                })
                /****************************
                 * ERROR CHECK
                 ***************************/
                if(isError){
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('checkAddedLayerStatus'), notifySetting);
                    defer.reject();
                    return;
                }
                if(!$scope.blockInfo.tag){
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('tagEmpty'), notifySetting);
                    defer.reject();
                    return;
                }
                if($scope.blockInfo.tag&&$scope.blockInfo.tag.join().length>=200){
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('tagLimitExceed'), notifySetting);
                    defer.reject();
                    return;
                }
                if(!previewImageBinary){
                    //commonFunctionFactory.callWideNotify("[저장 실패]미리보기를 실행해 주세요.", notifySetting);
                }
                //save
                blockUI.start(commonFunctionFactory.translate('saving'));
                $scope.preview('data_only').then(function(){
                    _editorSave(json_data).then(function(){
                        defer.resolve();
                    }, function(){
                        defer.reject();
                    })
                })
                return defer.promise;
            },
            errorOption : {type:'error', position:'top', duration:3000},
            sendXHR : function(_url){
                blockUI.start();
                var that = this;
                commonSvc.get(_url).then(function(response){
                    blockUI.stop();
                    if(response.data.status == blockEditorValue.statusCode.success){
                        Notification.success(response.data.message);
                        $scope.blockInfo.se_request_status_idx = response.data.se_request_status_idx;
                        $scope.blockInfo.se_request_status_name = response.data.se_request_status_name;
                        $scope.blockInfo.se_request_status_class = response.data.se_request_status_class;
                        if($scope.blockInfo.se_request_status_idx=='131'){//제작요청 검수제작중 상태
                            $scope.blockStatusMng.refreshStart();
                        }
                    }else{
                        commonFunctionFactory.callWideNotify(response.data.message, that.errorOption);
                    }
                }, function(e){
                    blockUI.stop();
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('saveFail'), that.errorOption);
                });
            },
            /** 검수요청 **/
            inspectionAsk : function(){
                var that = this;
                this.save().then(function(){
                    that.sendXHR(blockEditorValue.api.blockInspectionAsk.replace('[:index:]', $scope.blockInfo.idx));
                },function(){
                    commonFunctionFactory.callWideNotify(commonFunctionFactory.translate('saveFail'), this.errorOption);
                })
            },
            /** 검수요청 취소 **/
            inspectionCancel : function(){
                this.sendXHR(blockEditorValue.api.blockInspectionCancel.replace('[:index:]', $scope.blockInfo.idx));
            },
            /** 검수완료 **/
            inspectionDone : function(){
                this.sendXHR(blockEditorValue.api.blockInspectionDone.replace('[:index:]', $scope.blockInfo.idx));
            },
            /** 검수 버튼 SHOW **/
            showConfirmBtn : function(blockInfo){
                //심플에디터 작업 상태가 "완료-62"이고, 제작 상태가 "작업진행중-121" 상태일 때 요청 가능
                if(blockInfo&&blockInfo.se_canvas_status_idx=='62'&&blockInfo.se_request_status_idx=='121'){
                    return true;
                }else{
                    return false;
                }
            },
            /** 검수 취소 버튼 SHOW **/
            showConfirmCancelBtn : function(blockInfo){
                //심플에디터 작업 상태가 "완료-62"이고, 제작 상태가 "작업진행중-122" 상태일 때 요청 가능
                if(blockInfo&&blockInfo.se_canvas_status_idx=='62'&&blockInfo.se_request_status_idx=='122'){
                    return true;
                }else{
                    return false;
                }
            },
            /** 검수 완료 버튼 SHOW **/
            showConfirmDoneBtn : function(blockInfo){
                //심플에디터 작업 상태가 "완료-62"이고, 제작 상태가 "작업진행중-122" 상태일 때 요청 가능
                if(blockInfo&&blockInfo.se_canvas_status_idx=='62'&&blockInfo.se_request_status_idx=='122'){
                    return true;
                }else{
                    return false;
                }
            }
        }

        /****************************
         * SAVE DATA
         ***************************/
        function _editorSave(json_data){
            if(!previewImageBinary) return;
            var defer = $q.defer();
            //$interval.cancel(_saveInterval);
            json_data = json_data.filter(function(n){ return n != undefined });
            var params = {
                name : $scope.blockInfo.name
                , se_block_type_idx : $scope.blockInfo.se_block_status_idx
                , tag : $scope.blockInfo.tag.join()
                , rect_width : $scope.blockInfo.rect_width
                , rect_height : $scope.blockInfo.rect_height
                , background_color : commonFunctionFactory._base64Encode($scope.blockInfo.background_color)
                , image_binary : previewImageBinary.replace("data:image/png;base64,", "")
                , json_data : commonFunctionFactory._base64Encode(json_data)
                , user_id : $rootScope.userInfo.user_id
                , target_link : ($scope.blockInfo.target_link)?base64.encode($scope.blockInfo.target_link):''
            }

            commonSvc.post($scope.apiUrl.blockInfo+"/"+$scope.urlParameters.idx, params).then(function(response){
                blockUI.stop();
                var _response = response.data;
                if(_response.status == blockEditorValue.statusCode.success){
                    Notification.success(_response.message);
                    $scope.blockInfo.se_request_status_idx = _response.se_request_status_idx;
                    $scope.blockInfo.se_request_status_name = _response.se_request_status_name;
                    $scope.blockInfo.se_request_status_class = _response.se_request_status_class;
                    defer.resolve(_response);
                }else{
                    defer.reject();
                    Notification.error(_response.message);
                }
            }, function(e){
                defer.reject();
                Notification.error(commonFunctionFactory.translate('saveFail'));
            });
            return defer.promise;
        }

        $scope.removeTag = function(index) {
            $scope.blockInfo.tag.splice(index, 1);
        }

        //tag 입력
        $scope.putTag = function(event) {
            var inputValue = event.currentTarget.value, maxLength = 200;
            if ( (event.keyCode === 13 || event.keyCode === 188 || event.keyCode === 32 ) && inputValue.length) {
                //duplicated
                if($scope.blockInfo.tag.indexOf(inputValue) !== -1) {
                    Notification.warning('['+inputValue+']'+commonFunctionFactory.translate('tagDuplicated'));
                    return;
                }
                //length limit
                if(inputValue.length>=maxLength) {
                    Notification.error(commonFunctionFactory.translate('tagLimit200'));
                    return;
                }
                if($scope.blockInfo.tag){
                    $scope.blockInfo.tag.push(inputValue);
                }else{
                    $scope.blockInfo.tag = [inputValue];
                }
                //check length
                if($scope.blockInfo.tag.toString().length>=maxLength) {
                    $scope.blockInfo.tag.pop();
                    Notification.error(commonFunctionFactory.translate('tagLimit200'));
                }
                event.currentTarget.value = '';
                event.preventDefault();
            }
        }

        /** 누끼툴 이미지 주소
         * 이미지 캐시를 제거하기 위해 파라미터 생성
         * 파라미터가 자주 바뀔경우 apply 에러 발생 함
         **/
        $scope.getMagicWandImageSrc = function(key){
            var mode = {a : "imageAutoSrc", m : 'imageManualSrc', o : 'imageOriginalSrc'}
                , _time = new Date()
                , cachePrevent = "?"+_time.getMinutes()+_time.getSeconds()
                , _layer = layerMngService.getLayerByIndex($rootScope.currentLayer.Index), _src = '';
            if(_layer){
                switch(key){
                    case "a":
                        if(_layer.magicWand&&_layer.magicWand!=true&&_layer.magicWand.isAutoWorking!=true){
                            _src = _layer.magicWand[mode[key]];
                        }
                        break;
                    case "m":
                        if(_layer.magicWand && _layer.magicWand != true){
                            _src = _layer.magicWand[mode[key]];
                        }
                        break;
                    case "o":
                        _src = (_layer.magicWand && _layer.magicWand.imageOriginalSrc)?_layer.magicWand.imageOriginalSrc:_layer.ImageFile;
                        break;
                }
            }
            return (_src)?_src+cachePrevent:'';
        }

        $scope.className = {
            /** 메인 화면 클래스 **/
            main : function(){
                var _class = [];
                var wideSideTab = ['search', 'tagMapping'];
                if($scope.sideTab.show == false)_class.push('hide-aside');
                if($scope.sideTab.show&& wideSideTab.indexOf($scope.sideTab.activeMenu)!=-1)_class.push('active-search');
                if(blockEditorValue.templateUrl.leftLayerList.show)_class.push('layers-open');
                return _class;
            },
            body : function(){
                var _class = [];
                if($scope.editorPreferLang=='EN') _class.push('lang-en');
                return _class;
            },
            /** 자동 누끼 클래스 설정 **/
            magicWandAuto : function(){
                if($rootScope.currentLayer.magicWand && $rootScope.currentLayer.magicWand.isAutoWorking == true){
                    return 'loading';
                }else{
                    return '';
                }
            },
            /** layer 클래스 **/
            layer : function(layer){
                var _class = ['editorObj'];
                if(layer.isSelected)_class.push('selected');
                if(layer.isAddedLayer)_class.push('_blank');
                if(layer.isSelectedGroup)_class.push('ui-selected');
                return _class;
            }
        }

        $scope.toggleSideLayer = function(){
            blockEditorValue.templateUrl.leftLayerList.show = !blockEditorValue.templateUrl.leftLayerList.show;
            broadCastBlockInit();
        }

        /** 에디터 이미지 변경 **/
        $scope.magicWandSetMainImage = function(key){
            var src = $scope.getMagicWandImageSrc(key);
            if(src){
                blockUI.start();
                $rootScope.currentLayer.ImageFile = src;
                imgMngService.loadImage($rootScope.currentLayer).then(function(data){
                    blockUI.stop();
                });
            }
        }

        /** 누끼 오브젝트 속성 **/
        function _setMagicWandProperty(attr){
            var _magicWandObj = {
                isAutoWorking : false,
                imageOriginalSrc : false,
                imageAutoSrc : false,
                imageManualSrc : false
            }
            return angular.extend(_magicWandObj, attr);
        }

        /** 자동 누끼툴 실행 **/
        $scope.magicWandAuto = function(){
            var _layer = $rootScope.currentLayer;
            if(!_layer) return;
            if(_layer && _layer.magicWand && _layer.magicWand.isAutoWorking){
                Notification.info(commonFunctionFactory.translate('progressing'));
            }else{
                var _image_url = (_layer.magicWand.imageOriginalSrc)?_layer.magicWand.imageOriginalSrc:'';
                if(!_image_url)return;
                if($scope.developementMode && _image_url.indexOf("http") == -1){
                    _image_url = location.origin + _image_url;
                }
                /** 파일 타입 확인 **/
                if(_checkImageFileType(_image_url)){
                    Notification.error(commonFunctionFactory.translate('imageTypeNotSupport'));
                    return;
                }
                var params = {
                    se_block_idx : $scope.urlParameters.idx
                    , layer_index : _layer.Index
                    , image_url : commonFunctionFactory._base64Encode(_image_url, 'string')
                }
                _layer.magicWand.isAutoWorking = true;
                commonSvc.post($scope.apiUrl.nukiUploadAuto, params, {timeout : 10000}).then(function(response){
                    var _response = response.data;
                    if(_response.status == blockEditorValue.statusCode.success){
                        var imageDefer = imgMngService.loadImage({Index : _response.layer_index, ImageFile:_response.image_url});
                        imageDefer.then(function(){
                            Notification.success(commonFunctionFactory.translate('autoMagicWandDone'));
                            $scope.layerHistory.makeHistory(_layer);
                            _layer.magicWand.isAutoWorking = false;
                            _layer.magicWand.imageAutoSrc = _response.image_url;
                            /** 이미지 파일 교체 **/
                            var _rect = commonFunctionFactory.rectToObject(_layer.Rect)
                            _rect.height = _response.image_height;
                            _rect.width = _response.image_width;
                            _layer.Rect = commonFunctionFactory.rectToString(_rect);
                            _layer.TransformMode = {Mode: 'none'};
                            _layer.isSelected = false;
                            //_layer.ImageFile = _response.image_url;
                            _layer.ImageFile = commonFunctionFactory.imageCachePrevent(_response.image_url);
                            layerMngService.setLayerByIndex(_response.layer_index, _layer, true);
                        })
                    }else{
                        Notification.error(_response.message);
                    }
                })
            }
        }

        /** 수동 누끼툴 실행 **/
        $scope.magicWand = function(){
            if($rootScope.currentLayer && $rootScope.currentLayer.Type=='image'){
                /** 파일 타입 확인 **/
                if(_checkImageFileType($rootScope.currentLayer.ImageFile)){
                    Notification.error(commonFunctionFactory.translate('imageTypeNotSupport'));
                    return;
                }
                /** 서비스 플러그인 실행 **/
                simplexPluginManagerFactory.init().then(function(response){
                    if(response.resultCode == "0000"){
                        blockUI.start('Service plugin opening...');
                        /** 서비스 플러그인 실행 **/
                        commonFunctionFactory.customLogCall("서비스 플러그인 성공", "ok");
                        simplexPluginManagerFactory.runProgram(_servicePluginMakeData());
                        setTimeout(_checkServicePluginRun, 10000);
                    }else if(response.resultCode == "9995"){
                        /** 서비스 플러그인 미설치 **/
                        _servicePluginInstallMsg(response);
                    }
                }, function(e){
                    commonFunctionFactory.customLogCall("플러그인 에러", "error", e);
                    blockUI.stop();
                })
            }
        }

        function _checkImageFileType(src){
            return (/\.(gif)/i).test(src);
        }

        function _checkServicePluginRun(){
            var _status = simplexPluginManagerFactory.getProgramStatus();
            if(_status == false){
                Notification.error(commonFunctionFactory.translate('servicePluginTimeoutError'));
                blockUI.stop();
            }
        }

        /** 프로그램 설정 **/
        function _servicePluginMakeData(){
            var _imageUrl = $rootScope.currentLayer.ImageFile;
            _imageUrl = ($scope.developementMode && _imageUrl.indexOf("http") == -1)?location.origin+_imageUrl:_imageUrl;
            _imageUrl = _imageUrl.replace(/\?(\d)*$/, ''); //remove parameter
            return {
                name : 'background_removal'
                , message : {
                    open_image : {
                        image : _imageUrl
                        , callback_param : {layerIndex : $rootScope.currentLayer.Index}
                    }
                    , add_image : {
                        image : _imageUrl
                        , callback_param : {layerIndex : $rootScope.currentLayer.Index}
                    }
                }
                , callback : function(response){
                    if(response.resultCode == '0000') {
                        Notification.success(response.resultMsg);
                        pluginManager.close();
                    }else if(response.resultCode == '0001'){ //programe open success
                        var _message = response.resultMsg;
                        if(response.data.interface == 'add_image'){
                            _message = commonFunctionFactory.translate('imageAddDone');
                        }else if(response.data.interface == 'open_image'){
                            _message = commonFunctionFactory.translate('imageAddOpen');
                        }
                        Notification.info(_message);
                        blockUI.stop();
                    }else if(response.resultCode == '0002'){ //upload success
                        Notification.info(response.resultMsg);
                        var _layer = JSON.parse(response.data.callback_param);
                        if(_layer.layerIndex){
                            blockUI.start('Uploading...');
                            /** 이미지 바이너리 업로드 **/
                            var params = {
                                se_block_idx: $scope.urlParameters.idx
                                , layer_index: _layer.layerIndex
                                , image_binary: response.data.result
                            };
                            /** 수동 누끼 이미지 변경 **/
                            $scope.binaryImageUpload($scope.apiUrl.nukiUploadManual, params).then(function(data){
                                blockUI.stop();
                                if(data.status == blockEditorValue.statusCode.success){
                                    var _layer = layerMngService.getLayerByIndex(data.layer_index);
                                    data.image_url = commonFunctionFactory.imageCachePrevent(data.image_url);
                                    _layer.magicWand.imageManualSrc = data.image_url;
                                    _layer.ImageFile = data.image_url;
                                    $scope.layerHistory.makeHistory(_layer);
                                    layerMngService.setLayerByIndex(data.layer_index, _layer);
                                }
                            })
                        }else{
                            Notification.error(commonFunctionFactory.translate('layerEmpty'));
                        }
                    }else if(response.resultCode == '0003') {
                        //ok
                    }else if(response.resultCode == '7001'){
                        blockUI.stop();
                        _servicePluginInstallMsg(response);
                    }else{
                        commonFunctionFactory.customLogCall("플러그인 에러", "error", response);
                        Notification.error(response.resultMsg);
                        blockUI.stop();
                    }
                }
            }
        }

        /** 서비스 플러그인 미설치 **/
        function _servicePluginInstallMsg(response){
            let alertMsg = commonFunctionFactory.translate(response.resultMsg);
            var _html = "<span class='notify-error'>"+alertMsg+"<br />" +
                commonFunctionFactory.translate('servicePluginInstall2')+"</span><br>" +
                "<div class='btn-area'>" +
                "<a class='notify-error-a' target='_blank' href='"+response.data.setup_url+"'>DOWN</a></div>";
            var _config = {position:'top',type:'error',html:true,sticky:true};
            commonFunctionFactory.callWideNotify(_html, _config);
        }

        /***********************************
         * HOTKEYS START
         ***********************************/
            //layer save
        hotkeys.add({
            combo: 'ctrl+s',
            description: 'layer save',
            callback: function(evt) {
                evt.preventDefault();
                $scope.blockStatusMng.save();
            }
        });
        //layer copy
        hotkeys.add({
            combo: 'ctrl+j',
            description: 'layer copy',
            callback: function(evt) {
                evt.preventDefault();
                layerMngService.layerCopy($rootScope.currentLayer);
            }
        });
        //layer copy
        hotkeys.add({
            combo: 'tab',
            description: 'layer selected with tab',
            callback: function(evt) {
                evt.preventDefault();
                $scope.layerMng.layerSelectWithTab(evt);
            }
        });
        //text render
        hotkeys.add({
            combo: 'ctrl+enter',
            allowIn: ['TEXTAREA'],
            description: 'text render request',
            callback: function() {
                $scope.textRenderRequest($rootScope.currentLayer);
            }
        });
        //text render - test
        hotkeys.add({
            combo: 'ctrl+shift+enter',
            allowIn: ['TEXTAREA'],
            description: 'text render request - test',
            callback: function() {
                $scope.textRenderRequest($rootScope.currentLayer,true);
            }
        });
        //undo
        hotkeys.add({
            combo: 'ctrl+z',
            description: 'undo',
            callback: function() {
                $scope.layerHistory.undo();
            }
        });
        //redo
        hotkeys.add({
            combo: 'ctrl+shift+z',
            description: 'redo',
            callback: function() {
                $scope.layerHistory.redo();
            }
        });
        //delete
        hotkeys.add({
            combo: ['del'],
            description: 'layer delete',
            callback: function(evt) {
                $scope.layerMng.removeLayer();
            }
        });
        //move
        hotkeys.add({
            combo: ['up', 'down', 'left', 'right'],
            description: 'layer move',
            allowIn: ['DIV', 'INPUT'],
            callback: function(evt) {
                layerMoveObj.setData(1, evt).call();
            }
        });
        //move + shift
        hotkeys.add({
            combo: ['shift+up', 'shift+down', 'shift+left', 'shift+right'],
            description: 'layer move',
            allowIn: ['DIV', 'INPUT'],
            callback: function(evt) {
                layerMoveObj.setData(20, evt).call();
            }
        });
        //crop mode
        hotkeys.add({
            combo: ['c'],
            description: 'crop open',
            allowIn: ['DIV'],
            callback: function(evt) {
                $scope.startCropMode();
            }
        });

        var layerMoveObj  = {
            pixel : '',
            event : '',
            setData : function(pixel, event){
                this.pixel = pixel;
                this.event = event;
                event.preventDefault();
                return this;
            },
            call : function(){
                if($rootScope.currentLayer||$scope.multiSelectLayer.getList()) {
                    var that = this, _selectedlayerList = $scope.multiSelectLayer.getList();
                    if(_selectedlayerList){
                        $scope.layerMng.resetCurrentLayer();
                        angular.forEach(_selectedlayerList, function(_layer, idx){
                            angular.extend(_layer, that._move(_layer));
                        });
                    }else{
                        this._move($rootScope.currentLayer);
                    }
                }
            },
            _move : function(layer){
                if(layer){
                    var _rect = commonFunctionFactory.rectToObject(layer.Rect);
                    var keyName =  this.event.keyIdentifier.toUpperCase();
                    switch(keyName){
                        case 'LEFT':
                            _rect.left = parseInt(_rect.left)-this.pixel;
                            break;
                        case 'RIGHT':
                            _rect.left = parseInt(_rect.left)+this.pixel;
                            break;
                        case 'UP':
                            _rect.top = parseInt(_rect.top)-this.pixel;
                            break;
                        case 'DOWN':
                            _rect.top = parseInt(_rect.top)+this.pixel;
                            break;
                    }
                    $scope.psdTemplateInfo.rect = _rect;
                    layer.Rect = commonFunctionFactory.rectToString(_rect);
                    layerMngService.setLayerByIndex(layer.Index, layer, true);
                    return layer;
                }
            }
        };
        function broadCastBlockInit(){
            $timeout(function(){
                $scope.$broadcast('blockInfoInitDone',{
                    width : $scope.blockInfo.rect_width,
                    height : $scope.blockInfo.rect_height,
                });
            })
        }

        /** 크롬 확장 프로그램 테스트 용도 **/
        window.addEventListener('message', function(event) {
            if(event.data == 'initConnect'){
                Notification.info("구글확장 프로그램 연결 성공");
            }else if(event.data.type == "getCanvasData"){
                $scope.preview('data_only').then(function(response){
                    window.postMessage({img:response},'*');
                })
            }
        });
        /***********************************
         * HOTKEYS END
         ***********************************/
        (function(){
            blockUI.start();
            /** 블럭 정보 호출 **/
            var _idx = (angular.isDefined($scope.urlParameters))?$scope.urlParameters.idx:'';
            commonSvc.get('/resources_block_editor/simpleEditorJson.json').success(function(response){
            //commonSvc.get(blockEditorValue.api.blockInfo+"/"+_idx).success(function(response){
                if(response.status == blockEditorValue.statusCode.success){
                    /** 데이터 체크 **/
                    if(response.total_cnt == 0){
                        blockUI.start(response.message);
                        return;
                    }
                    var _data = response.items.pop();
                    /** 렌더중 인지 확인 **/
                    if($scope.blockStatusMng.notEditableStatus.indexOf(_data.se_request_status_idx)>-1){
                        $scope.blockStatusMng.refreshStart();
                        return;
                    }
                    $scope.blockInfo = _data;
                    $scope.blockInfo.background_color = JSON.parse($scope.blockInfo.background_color);
                    $scope.psdTemplateInfo.background_color_hex = commonFunctionFactory.rgbToHex($scope.blockInfo.background_color);
                    //set language
                    $scope.editorPreferLang = $filter('uppercase')(ipCookie(blockEditorValue.cookie.lang)||'ko');
                    $translate.use($scope.editorPreferLang);
                    /***********************
                     * background layer 존재 여부 확인
                     ***********************/
                    if(!$scope.blockInfo.rect_height||!$scope.blockInfo.rect_width){
                        blockUI.start(commonFunctionFactory.translate('warningBlockInfoMissing'));
                        return;
                    }
                    /***********************
                     * aside > block info > tag 를 쉼표 기준으로 array 변형
                     ***********************/
                    if(_data.tag) $scope.blockInfo.tag = _data.tag.split(",");
                    /***********************
                     * 정렬된 레이어 생성
                     ***********************/
                    var _layerList = JSON.parse(_data.json_data);
                    angular.forEach(_layerList, function(layer, idx){
                        layerMngService.makeLayerOrderByIndex(layer);
                    });
                    /***********************
                     * 오리지널 데이터 저장
                     ***********************/
                    layerMngService.layerListOrderedOriginal = angular.copy(layerMngService.getLayerList());
                    Notification.success(commonFunctionFactory.translate('initComplete'));
                    commonFunctionFactory.customLogCall('Editor init', 'ok');
                    /***********************
                     * 에디터 데이터 초기화
                     ***********************/
                    $scope.getTextFont();
                    $scope.getMallInfo();
                    //psd 파일 업로드 설정
                    blockEditorValue.api.psdUpload = blockEditorValue.api.psdUpload.replace('[:index:]', $scope.blockInfo.idx);
                    blockUI.stop();
                    broadCastBlockInit();
                    commonFunctionFactory.customLogCall('BLOCK EDITOR', 'welcome');
                    angular.element('#mainEditorDiv').selectable();
                }else{
                    blockUI.start(response.message);
                }
            }, function(){
                blockUI.start(commonFunctionFactory.translate('initError'));
            });
        }());
    }
];
export default blockEditorCtrl;