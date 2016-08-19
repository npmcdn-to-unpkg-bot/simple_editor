/**
 * Created by 김동욱 on 2016-04-29.
 * 업로드 설정
 */
export default [
    '$rootScope','$q','$filter','commonSvc','commonFunctionFactory','Notification','FileUploader','blockEditorValue',
    function($rootScope,$q,$filter,commonSvc,commonFunctionFactory,Notification,FileUploader,blockEditorValue){
        var onSuccessItem = function(fileItem,response,status,headers){
            if(response.status == blockEditorValue.statusCode.success){
                Notification.success(commonFunctionFactory.translate('fileUploadDone'));
            }else{
                Notification.error(commonFunctionFactory.translate('fileUploadFail'));
                this.errorMsg = response.message;
                fileItem.isError = true;
                fileItem.isSuccess = false;
            }
        };
        var onErrorItem = function(fileItem,response,status,headers){
            Notification.error(commonFunctionFactory.translate('fileUploadFail'));
        };
        var onProgressItem = function(fileItem,progress){
        };
        var onAfterAddingFile = function(fileItem){
            this.errorMsg = '';
        };
        var onBeforeUploadItem = function(fileItem){
        };
        var _filter = {
            fileSize : {
                name : 'fileSize',
                fn : function(fileItem){
                    if(fileItem.size>this.fileSizeLimit){
                        Notification.error(commonFunctionFactory.translate('fileSizeBig'));
                        return false;
                    }else{
                        return true;
                    }
                }
            },
            fileType : {
                name : 'fileType',
                fn : function(fileItem){
                    var filePoint = fileItem.name.substring(fileItem.name.lastIndexOf('.')+1,fileItem.name.length);
                    var fileType = filePoint.toLowerCase();
                    if(this.fileType.indexOf(fileType)> -1){
                        return true;
                    }else{
                        Notification.error(commonFunctionFactory.translate('fileTypeNotAllow',{fileType : fileType}));
                        return false;
                    }
                }
            }
        }

        return {
            make : function(obj){
                if(angular.isUndefined(obj.autoUpload)) obj.autoUpload = false;
                if(angular.isUndefined(obj.removeAfterUpload)) obj.removeAfterUpload = false;

                if(angular.isUndefined(obj.onSuccessItem)){
                    obj.onSuccessItem = onSuccessItem;
                }
                if(angular.isUndefined(obj.onProgressItem)){
                    obj.onProgressItem = onProgressItem;
                }
                if(angular.isUndefined(obj.onErrorItem)){
                    obj.onErrorItem = onErrorItem;
                }
                if(angular.isUndefined(obj.onAfterAddingFile)){
                    obj.onAfterAddingFile = onAfterAddingFile;
                }
                if(angular.isUndefined(obj.onBeforeUploadItem)){
                    obj.onBeforeUploadItem = onBeforeUploadItem;
                }
                //파일 타입 체크
                if(angular.isDefined(obj.fileType)){
                    if(angular.isDefined(obj.filters)){
                        obj.filters.push(_filter.fileType);
                    }else{
                        obj.filters = [_filter.fileType];
                    }
                }
                //파일 사이즈 체크
                if(angular.isDefined(obj.fileSizeLimit)){
                    if(angular.isDefined(obj.filters)){
                        obj.filters.push(_filter.fileSize);
                    }else{
                        obj.filters = [_filter.fileSize];
                    }
                }
                obj.fileSizeShow = function($file){
                    return $filter('bytes')($file.size,1);
                }
                return new FileUploader(obj);
            }
        }
    }
]
