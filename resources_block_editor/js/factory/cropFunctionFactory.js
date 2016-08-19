'use strict';
define(['angularAMD'], function(app){
    app.factory('cropFunctionFactory', function(){
        var cropFn = {};
        cropFn.crop = {
            area : {
                left : 0,
                top : 0
            },
            setPosition : function(index) {
                this.area.left = parseInt(angular.element('#obj_'+index).css('left'));
                this.area.top = parseInt(angular.element('#obj_'+index).css('top'));
            },
            open : function($scope) {
                //if ( confirm ( '크롭 하시게?' ) ) {
                    if ( $scope.psdTemplateInfo.currentObj ) {
                        $scope.psdTemplateInfo.currentObj.TransformMode = {
                            Mode : 'crop'
                        }
                    } else {
                        alert ( '크롭할 이미지를 먼저 선택하시게.');
                    }
                //}
            },
            execute : function($scope,commonSvc,appDefaultSettingsFactory,commonFunctionFactory,Notification) {
                //var option = $(evt.target).data('option');
                if ($scope.psdTemplateInfo.currentObj) {
                    if (typeof $scope.psdTemplateInfo.currentObj.TransformMode === 'object') {
                        if ($scope.psdTemplateInfo.currentObj.TransformMode.Mode === 'crop') {
                            try {
                                var result = angular.element('#cropImg').cropper('getCroppedCanvas');
                                var dataUrl = result.toDataURL();
                                dataUrl = dataUrl.split(',');
                                dataUrl = dataUrl[1];

                                var params = {
                                    se_block_idx: $scope.urlParameters.idx
                                    , layer_index: $scope.psdTemplateInfo.currentObj.Index
                                    , image_binary: dataUrl
                                };

                                commonSvc.post($scope.apiUrl.imageCrop, params).then(function (response) {
                                    var _response = response.data;
                                    if (_response.status == appDefaultSettingsFactory.statusCode.success) {
                                        var tmpRectObject = commonFunctionFactory.rectToObject($scope.psdTemplateInfo.currentObj.Rect);

                                        $scope.makeHistory($scope.psdTemplateInfo.currentObj);

                                        var _image = new Image();
                                        _image.src = _response.image_url;
                                        var _obj = {
                                            index: $scope.psdTemplateInfo.currentObj.Index
                                            , loadDone: false
                                            , image: _image
                                            , width: 0
                                            , height: 0
                                        };

                                        _image.onload = function (e) {
                                            _obj.loadDone = true;
                                            _obj.width = _image.width;
                                            _obj.height = _image.height;
                                            if (!$scope.myImage) $scope.myImage = e.target.result;

                                            $scope.psdTemplateInfo.imageObjList[$scope.psdTemplateInfo.currentObj.Index] = _obj;

                                            tmpRectObject.width = _obj.width;
                                            tmpRectObject.height = _obj.height;

                                            angular.extend($scope.psdTemplateInfo.currentObj, {
                                                Rect: commonFunctionFactory.rectToString(tmpRectObject)
                                                , ImageFile: _response.image_url
                                                , TransformMode: {
                                                    Mode: 'none'
                                                },
                                                isSelected: false
                                            });
                                            $scope.$apply();
                                        };
                                        _image.onerror = function (e) {
                                            console.log('이미지 로드 실패');
                                        };

                                        //console.log ( $scope.psdTemplateInfo.imageObjList[$scope.psdTemplateInfo.currentObj.Index] );
                                        //console.log ( $scope.psdTemplateOrdered.layerList[$scope.psdTemplateInfo.currentObj.Index] );
                                    } else {
                                        Notification.error({message: _response.resultMsg, title: '이미지 크랍 변경 실패'});

                                    }
                                }, function (e) {
                                    Notification.error("이미지 크랍 요청 실패");
                                });
                                /*
                                 angular.element('#canvasImg').attr('src' , dataUrl).hide();
                                 var cropBoxData = angular.element('#cropImg').cropper('getData');
                                 var _cropRect = [
                                 parseInt(cropBoxData.x), parseInt(cropBoxData.y),
                                 parseInt(cropBoxData.width), parseInt(cropBoxData.height),
                                 ].toString();
                                 $scope.psdTemplateInfo.currentObj.TransformMode.CropRect = _cropRect;
                                 $scope.psdTemplateInfo.currentObj.ImageFileCanvas = dataUrl;
                                 */
                            } catch (e) {
                                commonFunctionFactory.callWideNotify('이미지 크롭 불가-도메인이 다릅니다.', {type: 'error'});
                                console.log(e);
                            }
                        }
                    }
                }
            }
        };

        return cropFn;
    });
});