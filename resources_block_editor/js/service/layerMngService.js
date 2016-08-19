/**
 * Created by 김동욱 on 2016-08-05.
 */
export default [
    '$rootScope','Notification','commonFunctionFactory','imgMngService','$filter','layerInfoConstant',
    function($rootScope,Notification,commonFunctionFactory,imgMngService,$filter,layerInfoConstant){
        var layerListOrdered = [];
        var layerListOrderedOriginal = [];
        var addLayerRectInfo = {left : 10, top : 10,  width : 300, height : 100};
        var indexMin = '';
        var indexMax = 1;

        /** get layer **/
        this.getLayerList = function(){
            return (layerListOrdered)?layerListOrdered:false;
        }

        /** text layer **/
        this.getTextLayerList = function(){
            return layerListOrdered.filter(function(n){return n.Type=='text';})
        }

        /** get layer info by index  **/
        this.getLayerByIndex = function(index){
            return (layerListOrdered[index])?layerListOrdered[index]:false;
        }

        /** get original info by index  **/
        this.getOriginalLayerByIndex = function(index){
            return (layerListOrderedOriginal[index])?layerListOrderedOriginal[index]:false;
        }

        this.setLayer = function(layer){
            layerListOrdered = layer;
        }

        /** set layer info by index **/
        this.setLayerByIndex = function(index, data, replace){
            if(replace == true || angular.isUndefined(layerListOrdered[index])) layerListOrdered[index] = data;
            else angular.extend(layerListOrdered[index], data);
            $rootScope.$broadcast('layerMng.layerListChange', layerListOrdered);
        }

        /** set layer info by index **/
        this.addLayer = function(layer){
            layerListOrdered.push(layer);
        }

        /** delete layer **/
        this.deleteLayer = function(index){
            delete layerListOrdered[index];
            $rootScope.$broadcast('layerMng.layerListChange', layerListOrdered);
        }

        this.backToOriginal = function() {
            layerListOrdered = angular.copy(layerListOrderedOriginal);
        }

        /** 정렬된 레이어 생성 - 자식 구조 해제 **/
        this.makeLayerOrderByIndex = function(layer){
            if(layer){
                if(layer.Type == 'group'){
                    angular.forEach(layer.ChildLayers, function(_layer, val){
                        this.makeLayerOrderByIndex(_layer);
                    })
                }else{
                    /** find minimum index **/
                    if(indexMin == ''){
                        indexMin = layer.Index;
                    }
                    /** find maximum index **/
                    if(indexMax<layer.Index){
                        indexMax = layer.Index;
                    }
                    /** init layer data **/
                    layer.Opacity = (layer.Opacity)?layer.Opacity:100;
                    if(layer.Rotation){
                        layer.RotationWeb = commonFunctionFactory.photoshopDegreeToDegree(layer.Rotation);
                    }
                    if(layer.Type=='image'){
                        if(layer.ImageFile && angular.isUndefined(layer.magicWand)){
                            //magicWand 값이 없을경우 세팅
                            angular.extend(layer, {magicWand :{imageOriginalSrc : layer.ImageFile}});
                        }
                        /** 태그 데이터 초기화 **/
                        if(angular.isDefined(layer.TagInfo)){
                            angular.extend(layer.TagInfo, {
                                show : false,
                                selected : false
                            })
                            //init
                            angular.forEach(layer.TagInfo.list,function(val,idx){
                                if(typeof val == 'string') layer.TagInfo.list[idx] = {name:val,selected:false};
                            })
                        }
                    }else if(layer.Type=='text'){
                        layer.textRendering = false;
                        layer.textRenderRequire = true;
                        if(layer.Text_Properties){
                            layer.Text_Properties[0].Color = commonFunctionFactory.rgbToHex(layer.Text_Properties[0].Color);
                        }
                    }else if(layer.Type=='shape'){
                        layer.FillColor = commonFunctionFactory.rgbToHex(layer.FillColor);
                        layer.BolderColor = commonFunctionFactory.rgbToHex(layer.BolderColor);
                    }
                    layer.visible = (angular.isDefined(layer.visible))?layer.visible:true;
                    layer.isSelectedGroup = false;
                    layerListOrdered[layer.Index] = layer;
                    imgMngService.loadImage(layer);
                }
            }
        }

        /** 선택된 레이어 초기화 **/
        this.initSelectedLayer = function(layer){
            var _currentStatus = (layer)?layer.isSelected:false;
            angular.forEach(layerListOrdered, function(_layer, idx){
                if(_layer) {
                    _layer.isSelected = false;
                    _layer.isSelectedGroup = false;
                }
            });
            if(layer)layer.isSelected = !_currentStatus;
            $rootScope.$broadcast('layerMng.layerListChange', layerListOrdered);
        }

        /** 그룹 레이어 초기화 **/
        this.initSelectedGroupLayer = function(){
            angular.forEach(layerListOrdered, function(_layer,idx){
                if(_layer){
                    _layer.isSelectedGroup = false;
                }
            })
        }

        /** 특정 layer 삭제 **/
        this.removeLayer = function(layer, makeHistory){
            if(makeHistory !== true) $rootScope.$broadcast('history.makeHistory', layer);
            this.initSelectedLayer();
            $rootScope.$broadcast('layerMng.resetCurrentLayer');
            imgMngService.deleteImage(layer.Index);
            this.deleteLayer(layer.Index);
        }

        /** current 삭제 **/
        this.removeCurrent = function(){
            if($rootScope.currentLayer){
                this.removeLayer($rootScope.currentLayer);
                Notification.success(commonFunctionFactory.translate('layerRemoveDone'));
            }else{
                Notification.warning(commonFunctionFactory.translate('layerEmpty'));
            }
        }

        /** 탭키 레이어 순환 선택 **/
        this.layerSelectWithTab = function(evt){
            var _keyList = [];
            angular.forEach(layerListOrdered, function(val, idx){
                if(angular.isDefined(val))_keyList.push(idx);
            })
            var _currentLayer = $rootScope.currentLayer;
            if(_currentLayer){
                var _maxKey = _keyList[_keyList.length-1];
                var _layerIndex = parseInt(_currentLayer.Index);
                if(_layerIndex >= _maxKey){
                    //최대 값이면 처음레이어 선택
                    var _nextIndex = _keyList[0];
                }else{
                    var _indexOf = _keyList.indexOf(_layerIndex);
                    var _nextIndex = _keyList[_indexOf+1];
                }
            }else{
                //선택된 레이어가 없으면 처음레이어 선택
                var _nextIndex = _keyList[0];
            }
            this.setLayerByIndex(_nextIndex, {isSelected:true});
            $rootScope.currentLayer = angular.copy(this.getLayerByIndex(_nextIndex));
            $rootScope.$broadcast('layerMng.layerSetting', $rootScope.currentLayer);
        }

        /** 레이어 복사 **/
        this.layerCopy = function(layer){
            if(layer){
                var _copyLayer = angular.copy(layer);
                var _rect = commonFunctionFactory.rectToObject(_copyLayer.Rect);
                var copyLayerZindex = '';
                //복사한 레이어의 zindex는 원본 위에 위치
                var originalLayer = this.getLayerByIndex(layer.Index);
                var targetLayer = zindexManager.findLayerBiggerThanMe(originalLayer.zIndex);
                if(targetLayer){
                    copyLayerZindex = targetLayer.zIndex;
                    zindexManager.reCalculate(targetLayer);
                }else{
                    copyLayerZindex = originalLayer.zIndex+1;
                }
                _copyLayer = angular.extend(_copyLayer,{
                    isAddedLayer : false
                    , isCopiedLayer : true
                    , undoRemoveLayerNewLayer : true //실행취소시 레이어 제거용도
                    , zIndex : copyLayerZindex
                });
                delete _copyLayer.Index;
                delete _copyLayer.Rect;
                this.addLayer(_copyLayer.Type, _copyLayer, _rect.width, _rect.height);
                Notification.success(commonFunctionFactory.translate('layerCopyDone'));
            }else{
                Notification.warning(commonFunctionFactory.translate('layerEmpty'));
            }
        }

        /** 레이어 z-index 변경 **/
        this.changeLayerStack = function(mode){
            if(!$rootScope.currentLayer){
                Notification.warning(commonFunctionFactory.translate('layerEmpty'));
                return;
            }
            var _currentZINDEX = $rootScope.currentLayer.zIndex, changeIndex='';
            var nextIndex = (mode=='f')?_currentZINDEX+1:_currentZINDEX-1, targetLayer = '';
            if(nextIndex>=zindexManager.getMax()){
                Notification.warning(commonFunctionFactory.translate('layerMaximumHoist'));
                return;
            }
            if(nextIndex == 0){
                Notification.warning(commonFunctionFactory.translate('layerMinimumHoist'));
                return;
            }
            if(mode=='f'){
                //증가시키면 내가 가진 zindex보다 큰 zindex를 가진 첫번째 레이어 검색
                targetLayer = zindexManager.findLayerBiggerThanMe(_currentZINDEX);
            }else if(mode=='b'){
                targetLayer = zindexManager.findLayerSmallerThanMe(_currentZINDEX);
            }
            if(targetLayer){
                changeIndex = targetLayer.zIndex;
                targetLayer.zIndex = _currentZINDEX;
            }else{
                changeIndex = nextIndex;
            }
            $rootScope.$broadcast('history.makeHistory', $rootScope.currentLayer);
            $rootScope.currentLayer.zIndex = changeIndex;
            this.setLayerByIndex($rootScope.currentLayer.Index , {zIndex:changeIndex});
            Notification.info({message: "index : " + changeIndex, delay: 1000});
        }

        /** zindex 관리 **/
        var zindexManager = {
            orderByField : function(field){
                return $filter('orderObjectBy')(layerListOrdered,field);
            },
            getMax : function(){
                var max = 0;
                for(var i=0;i<layerListOrdered.length;i++){
                    if(layerListOrdered[i]&&(max<layerListOrdered[i].zIndex)){
                        max = layerListOrdered[i].zIndex;
                    }
                }
                return ++max;
            },
            findLayerByzIndex : function(zIndex){
                for(var i=0;i<layerListOrdered.length;i++){
                    if(layerListOrdered[i]&&(zIndex==layerListOrdered[i].zIndex)){
                        return layerListOrdered[i];
                    }
                }
                return false;
            },
            findLayerBiggerThanMe : function(zIndex){
                var layerList = this.orderByField('zIndex');
                for(var i=0;i<layerList.length;i++){
                    if(layerList[i]&&(zIndex<layerList[i].zIndex)){
                        return layerList[i];
                    }
                }
                return false;
            },
            findLayerSmallerThanMe : function(zIndex){
                var layerList = this.orderByField('zIndex');
                for(var i=layerList.length;i>=0;i--){
                    if(layerList[i]&&(zIndex>layerList[i].zIndex)){
                        return layerList[i];
                    }
                }
                return false;
            },
            /** 특정 레이어 부터 zindex 재설정 **/
            reCalculate : function(layer){
                angular.forEach(layerListOrdered, function(_layer,index){
                    if(_layer&&(layer.zIndex<=_layer.zIndex)){
                        _layer.zIndex++;
                    }
                })
            }
        }

        /** 레이어 추가 **/
        this.addLayer = function(mode, _attr, width, height){
            var _index = ++indexMax, maxZINDEX = zindexManager.getMax();
            var _tmpRect = {
                left : addLayerRectInfo.left +=10
                , top : addLayerRectInfo.top +=10
                , width : (width)?width:addLayerRectInfo.width
                , height : (height)?height:addLayerRectInfo.height
            }, _rect = commonFunctionFactory.rectToString(_tmpRect);
            /****************
             * 레이어 할당
             ****************/
            var _layer = angular.copy(layerInfoConstant[mode]);
            _layer.Index = _index;
            _layer.zIndex = maxZINDEX;
            _layer.Rect = _rect;
            if(_layer.Type=='shape'){
                if(_attr&&_attr.ShapeType=='line'){
                    //라인은 선두께를 레이어 높이로 설정
                    _tmpRect.height = 8;
                }else if(!height){
                    _tmpRect.height = _tmpRect.width;
                }
                _layer.Rect = commonFunctionFactory.rectToString(_tmpRect);
                _layer.FillColor = commonFunctionFactory.rgbToHex(_layer.FillColor);
                _layer.BolderColor = commonFunctionFactory.rgbToHex(_layer.BolderColor);
            }else if(_layer.Type=='text'){
                _layer.Text_Properties[0].Color = commonFunctionFactory.rgbToHex(_layer.Text_Properties[0].Color);
            }
            if(_attr) angular.extend(_layer, _attr);
            /****************
             * 레이어 초기화
             ****************/
            Notification.success(commonFunctionFactory.translate('layerAddedText', { mode : mode}));
            this.initSelectedLayer(_layer);
            $rootScope.currentLayer = _layer;
            this.setLayerByIndex(_index, _layer, true);
            $rootScope.$broadcast('layerMng.layerSetting', _layer);
            imgMngService.loadImage(_layer);
            return _layer;
        }
    }
]