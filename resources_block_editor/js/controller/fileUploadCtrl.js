export default [
    '$rootScope','$scope','commonFunctionFactory'
    ,'$uibModalInstance','items','blockEditorValue','Notification','blockUI','fileUploadFactory','$timeout',
    function($rootScope, $scope,commonFunctionFactory
        ,$uibModalInstance, items, blockEditorValue, Notification, blockUI, fileUploadFactory, $timeout){
        $scope.uploadResult = '';
        if(items.mode == 'psd'){
            /** 업로드 설정 **/
            $scope.psdFileUploadInfo = fileUploadFactory.make({
                url : blockEditorValue.api.psdUpload,
                autoUpload : true,
                queueLimit : 1,
                fileType : ['psd'],
                fileSizeLimit : 209715200, //200MB
                alias : 'psd_file',
                removeAfterUpload : true,
                errorMsg : false,
                onSuccessItem : function(fileItem, response, status, headers){
                    if(response.status == blockEditorValue.statusCode.success){
                        Notification.success(commonFunctionFactory.translate('fileUploadDone'));
                        $scope.uploadResult = fileItem;
                    }else{
                        Notification.error(commonFunctionFactory.translate('fileUploadFail'));
                        this.errorMsg = response.message;
                        fileItem.isError = true;
                        fileItem.isSuccess = false;
                    }
                }
            });
        }else{
            /** 업로드 설정 **/
            $scope.fileUploadInfo = fileUploadFactory.make({
                url : blockEditorValue.api.imageUpload,
                alias : 'image_file',
                autoUpload : false,
                fileSizeLimit : 5242880, //5MB
                fileType : ["jpeg", "jpg", "png", "gif", "bmp"],
                uploadAll : function(){
                    blockUI.start("UPLOAD COMPLETE");
                    $timeout(function(){
                        blockUI.stop();
                        $uibModalInstance.close();
                    },1000)
                }
            });
        }

        /** psd 업로드 진행 상황 **/
        $scope.stylePsdUpload = function(){
            var _style = {};
            _style['position'] = 'absolute';
            _style['line-height'] = '100px';
            _style['width'] = $scope.psdFileUploadInfo.progress+'%';
            _style['height'] = '100%';
            _style['left'] = '40px';
            _style['top'] = '8px';
            _style['font-size'] = '15px';
            _style['color'] = '#FFFFFF';
            _style['background-color'] = '#48E844';
            _style['text-align'] = 'center';
            return _style;
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.uploadResult);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]