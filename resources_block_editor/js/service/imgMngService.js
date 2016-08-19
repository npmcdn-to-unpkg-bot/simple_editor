/**
 * Created by 김동욱 on 2016-08-05.
 */
export default ['$injector',
    function($injector){
        let $rootScope = $injector.get('$rootScope'); // Here is your tag
        let $q = $injector.get('$q'); // Here is your tag
        let Notification = $injector.get('Notification'); // Here is your tag
        let commonSvc = $injector.get('commonSvc'); // Here is your tag
        let commonFunctionFactory = $injector.get('commonFunctionFactory'); // Here is your tag
        let blockEditorValue = $injector.get('blockEditorValue'); // Here is your tag
        this.imgObjList = [];

        this.getImage = function(index){
            return (this.imgObjList[index])?this.imgObjList[index]:false;
        }

        this.setImage = function(index, obj){
            this.imgObjList[index] = obj;
        }

        this.deleteImage = function(index){
            delete this.imgObjList[index];
        }

        this.loadImage = function(layer){
            if(angular.isUndefined(layer.ImageFile)||!layer.ImageFile)return;
            var _image = new Image()
                , defer = $q.defer();
            _image.src = commonFunctionFactory.imageCachePrevent(layer.ImageFile);
            var _obj = {
                index : layer.Index
                , loadDone : false
                , image : _image
                , width : 0
                , height : 0
            };
            _image.onload = function(e){
                _obj.loadDone = true;
                _obj.width = _image.width;
                _obj.height = _image.height;
                defer.resolve(_obj);
            }
            _image.onerror = function(e){
                commonFunctionFactory.customLogCall('이미지 로드 실패', 'error')
                console.log(layer);
            }
            this.setImage(layer.Index, _obj);
            return defer.promise;
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

        /** 레이어 이미지를 교체 **/
        this.imageChangeFromList = function(layer, ImgObj){
            var defer = $q.defer();
            let historyFactory = $injector.get('historyFactory');
            let layerMngService = $injector.get('layerMngService');
            if(layer.Type=='text'){
                Notification.error(commonFunctionFactory.translate('textLayerCannotChange'));
                defer.reject();
            }else{
                /** check external image **/
                this.checkExternalImage(ImgObj).then((data)=>{
                    var _newLayer = '';
                    if(layer){ //기존 레이어 변경
                        historyFactory.makeHistory(layer);
                        layer.magicWand = _setMagicWandProperty({imageOriginalSrc:data.url});
                        angular.extend(layer, {
                            isAddedLayer:false
                            , ImageFile:data.url
                            , TransformMode : {Mode:'none'}
                        });
                        _newLayer = angular.copy(layer);
                    }else{ //신규 레이어 추가
                        _newLayer = layerMngService.addLayer('image', {
                            ImageFile : data.url
                            , isAddedLayer : false
                            , undoRemoveLayerNewLayer : true //실행취소시 레이어 제거용도
                            , magicWand : _setMagicWandProperty({imageOriginalSrc:data.url})
                        }, data.image.width, data.image.height);
                        historyFactory.makeHistory(_newLayer);
                    }
                    let _imageObj = {
                        index : _newLayer.Index,
                        image : data.image,
                        width : data.image.width,
                        height : data.image.height,
                        loadDone : true
                    };
                    if(ImgObj.mode == 'tagMapping'){
                        /** 가로 비율 중심으로 이미지 사이즈 재계산 **/
                        let _rect = commonFunctionFactory.rectToObject(_newLayer.Rect);
                        let ratio = _rect.width / _imageObj.width;
                        _rect.width = _imageObj.width * ratio;
                        _rect.height = _imageObj.height * ratio;
                        _newLayer.Rect = commonFunctionFactory.rectToString(_rect);
                        _newLayer.TransformMode.Mode = 'transform';
                        layerMngService.setLayerByIndex(_newLayer.Index, _newLayer,true);
                    }
                    $rootScope.currentLayer = _newLayer;
                    var _originalImg = this.getImage(_newLayer.Index);
                    if(_originalImg){
                        angular.extend(_originalImg, _imageObj);
                    }else{
                        this.setImage(_newLayer.Index, _imageObj);
                    }
                    defer.resolve(_imageObj);
                }, function(data){
                    Notification.error(commonFunctionFactory.translate('imageLoadFail'));
                    defer.reject(data);
                });
            }
            return defer.promise;
        };

        /** 도메인이 다른 경우 이미지 업로드 체크 **/
        this.checkExternalImage = function(item){
            let deferred = $q.defer();
            let imgUrl = (item.url)?item.url:item.output_img_file_url;
            let params = {
                mode : 'pre100'
                , input_url : commonFunctionFactory._base64Encode(imgUrl, 'string')
            }
            commonSvc.post(blockEditorValue.api.checkExternalImage, params).then(function(response){
                var _response = response.data;
                var url = '';
                if(_response.status == blockEditorValue.statusCode.success){
                    url = _response.output_url;
                }else{
                    url = _response.input_url;
                }
                /** load imagae **/
                var _image = new Image();
                _image.src = url;
                _image.onload = function(){
                    deferred.resolve({url : url, image : _image});
                }
                _image.onerror = function(){
                    deferred.reject();
                }
            }, function(e){
                Notification.error(commonFunctionFactory.translate('saveFail'));
            });
            return deferred.promise;
        }
    }
]
