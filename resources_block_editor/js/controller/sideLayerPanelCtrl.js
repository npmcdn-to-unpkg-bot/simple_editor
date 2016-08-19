/**
 * Created by 김동욱 on 2016-08-05.
 */
export default [
    '$rootScope','$scope','$filter','blockEditorValue','tagMappingService',
    'Notification','commonFunctionFactory','historyFactory','imgMngService','layerMngService',
    function($rootScope,$scope,$filter,blockEditorValue,tagMappingService,
             Notification,commonFunctionFactory,historyFactory,imgMngService,layerMngService){
        /** init data **/
        var myScope = this;
        /** 태그 매핑 **/
        myScope.tagMapping = tagMappingService;

        /** event listen **/
        $scope.$on('dndList.dragEnd',function(evt,changeIndex,draggedLayer){
            var layerList = $filter('orderObjectBy')(layerMngService.getLayerList(),'zIndex',true);
            var changeLayer = layerList[changeIndex],mode = '';
            if(changeIndex == layerList.length){//최하단으로 이동
                mode = 'bottom';
            }else if(changeLayer&&changeLayer.zIndex>draggedLayer.zIndex){
                mode = 'up';
            }else if(changeLayer&&changeLayer.zIndex<draggedLayer.zIndex){
                mode = 'down';
            }

            switch(mode){
                case "up":
                    // 올림
                    // 1 > 4번으로 변경 : 나(변경후)보다 작거나 같고 나(변경전)보다 큰 애들, (4,3,2)을 1씩 빼준다 =>(3,2,1)
                    var changeLayer = layerList[changeIndex];
                    var changeLayerzIndex = changeLayer.zIndex;
                    layerList.forEach(function(layer,index){
                        if(layer.Index == draggedLayer.Index){
                            layer.zIndex = changeLayerzIndex;
                        }else{
                            if(layer.zIndex<=changeLayer.zIndex&&draggedLayer.zIndex<layer.zIndex){
                                layer.zIndex--;
                            }
                        }
                    })
                    break;
                case "down":
                    // 내림
                    // 4 > 1번으로 변경 : 나(변경후)보다 크거나 같고 나(변경전)보다 작은 애들, (3,2,1)을 1씩 더한다 => (4,3,2)
                    var changeLayer = layerList[changeIndex-1];
                    var changeLayerzIndex = changeLayer.zIndex;
                    layerList.forEach(function(layer,index){
                        if(layer.Index == draggedLayer.Index){
                            layer.zIndex = changeLayerzIndex;
                        }else{
                            if(layer.zIndex>=changeLayer.zIndex&&draggedLayer.zIndex>layer.zIndex){
                                layer.zIndex++;
                            }
                        }
                    })
                    break;
                case "bottom":
                    // 최하단 내림
                    var changeLayer = layerList.pop();
                    layerList.push(changeLayer);
                    var changeLayerzIndex = changeLayer.zIndex;
                    layerList.forEach(function(layer,index){
                        if(layer.Index == draggedLayer.Index){
                            layer.zIndex = changeLayerzIndex;
                        }else{
                            if(layer.zIndex>=changeLayer.zIndex&&draggedLayer.zIndex>layer.zIndex){
                                layer.zIndex++;
                            }
                        }
                    })
                    break;
                case "up":
                    break;
            }
            /** init layer info **/
            layerMngService.setLayer([]);
            angular.forEach(layerList,function(layer,index){
                layerMngService.makeLayerOrderByIndex(layer);
            });
            $scope.$emit('layerMng.layerListChange');
        });

        /** 전체 텍스트 렌더 **/
        myScope.textRenderAll = function(){
            var textLayers = layerMngService.getTextLayerList();
            if(textLayers){
                angular.forEach(textLayers,function(layer,index){
                    if(layer&&layer.textRenderRequire){
                        $scope.textRenderRequest(layer);
                    }
                })
            }
        };

        /** 텍스트 레이어 클래스 **/
        myScope.classTextLayer = function(layer){
            var _class = ['thumb'];
            if(layer.textRendering||layer.textRenderRequire) _class.push('render');
            return _class;
        };

        /** 텍스트 렌더 리퀘스트 버튼 **/
        myScope.textRequestShow = function(layer){
            return (layer.textRendering == false&&layer.textRenderRequire == true)?true:false;
        };

        /** 레이어 리스트 눈표시 클래스 **/
        myScope.classLayerListEys = function(layer){
            return (layer.visible)?'showhide show':'showhide hide';
        };

        /** 레이어 그룹 선택 클래스 **/
        myScope.classLayerToggle = function(layer){
            var _class = [];
            _class.push(layer.Type);
            if(layer.isSelected) _class.push('active');
            if(layer.isSelectedGroup) _class.push('selected');
            if(angular.isDefined(layer.TagInfo)){
                if(layer.TagInfo.show){
                    _class.push('tag-view');
                }
                if(layer.TagInfo.selected){
                    _class.push('tag-chk');
                }
            }
            return _class;
        };

        /** 단일 레이어 선택 버튼 **/
        myScope.editorLayerSelect = function(layer){
            $rootScope.currentLayer = layer;
            $rootScope.$broadcast('multiSelectLayer.init');
            $rootScope.$broadcast('layerMng.layerSetting',layer);
            //layerMngService.setLayerByIndex(layer.Index, {isSelected:true});
            //layer.isSelected = true;
            //$scope.sideTabMove('layer');
        };

        /** 그룹 레이어 선택 버튼 **/
        myScope.selectLayerToggle = function(layer){
            layer.isSelectedGroup = !layer.isSelectedGroup;
            layerMngService.setLayerByIndex(layer.Index,{isSelectedGroup : layer.isSelectedGroup});
            $scope.$emit('multiSelectLayer.groupToggle',layer);
        };

        /** 레이어 숨김/표시 **/
        myScope.sideLayerViewToggle = function(layer){
            layer.visible = !layer.visible;
            layerMngService.setLayerByIndex(layer.Index,{visible : layer.visible});
        };

        /** 레이어 삭제 **/
        myScope.removeLayer = function(evt,layer){
            if(evt.keyCode == 46){//del
                var layerList = $scope.multiSelectLayer.getList();
                if(layerList){
                    angular.forEach(layerList,function(_layer,idx){
                        historyFactory.makeHistory(_layer);
                        layerMngService.deleteLayer(_layer.Index);
                    });
                    $scope.multiSelectLayer.reset();
                }else if(layer.isSelected){
                    historyFactory.makeHistory(_layer);
                    layerMngService.deleteLayer(deleteLayer.Index);
                }
            }
        };

        /** 드래그 드롭 객체 **/
        myScope.dndMng = {
            start : function(layer){
                if($scope.multiSelectLayer.getList()){
                    $scope.multiSelectLayer.init()
                }
            },
            end : function(layer,evt){
            },
            moved : function(index,layer){
                console.log(index);
                //$scope.layerListOrdered.splice(index,1);
                //var layerList = $filter('orderObjectBy')(layerMngService.layerListOrdered,'zIndex',true);
            },
            inserted : function(index,evt,a){
            }
        };

        myScope.editableText = function(layer,text){
            layerMngService.setLayerByIndex(layer.Index,{Name : text});
        };
    }
]
//export default sideLayerPanelCtrl;
