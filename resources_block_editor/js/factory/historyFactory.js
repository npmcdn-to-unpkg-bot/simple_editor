/**
 * Created by 김동욱 on 2015-10-1.
 * 히스토리 관리 기능
 */
export default [
    '$rootScope','$q','commonSvc','commonFunctionFactory','Notification','layerMngService','imgMngService',
    function($rootScope, $q, commonSvc, commonFunctionFactory, Notification,layerMngService,imgMngService){
        var _undo = [], _redo = [];
        var factory = {};

        factory.makeHistory = function(layer){
            if(layer) _undo.push(angular.copy(layer));
        };

        factory.makeHistoryRedo = function(layer){
            _redo.push(angular.copy(layer));
        };

        //되돌리기
        factory.undo = function(){
            if(_undo.length !== 0){
                Notification.info('undo');
                var historyPopLayer = _undo.pop();
                //레이어 삭제
                if(angular.isDefined(historyPopLayer.undoRemoveLayerNewLayer)) {
                    layerMngService.removeLayer(historyPopLayer, true);
                    return;
                }
                //실행취소
                _redo.push(historyPopLayer);
                layerMngService.initSelectedLayer(historyPopLayer);
                if(angular.isUndefined(layerMngService.getLayerByIndex(historyPopLayer.Index))){
                    layerMngService.setLayerByIndex(historyPopLayer.Index,historyPopLayer,true);
                }else{
                    layerMngService.setLayerByIndex(historyPopLayer.Index,historyPopLayer);
                }
                imgMngService.loadImage(historyPopLayer);
            }else{
                Notification.warning(commonFunctionFactory.translate('canNotUndo'));
                layerMngService.backToOriginal();
            }
        };

        //redo
        factory.redo = function(){
            if(_redo.length !== 0){
                var historyPopLayer = _redo.pop();
                $rootScope.currentLayer = false;
                layerMngService.initSelectedLayer();
                //historyPopLayer.isSelected = true;
                layerMngService.setLayerByIndex(historyPopLayer.Index, historyPopLayer, true);
            }else{
                Notification.warning(commonFunctionFactory.translate('canNotRedo'));
            }
        };
        return factory;
    }
]