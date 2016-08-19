/**
 * Created by 김동욱 on 2016-07-19.
 * 태그 매핑 관리
 */
export default class tagMappingService {
    constructor($injector){
        /** library start **/
        this.$rootScope = $injector.get('$rootScope');
        this.$uibModal = $injector.get('$uibModal');
        this.$q = $injector.get('$q');
        this.$timeout = $injector.get('$timeout');
        this.blockUI = $injector.get('blockUI');
        this.Notification = $injector.get('Notification');
        this.layerMngService = $injector.get('layerMngService');
        this.commonSvc = $injector.get('commonSvc');
        this.commonFunctionFactory = $injector.get('commonFunctionFactory');
        this.blockEditorValue = $injector.get('blockEditorValue');
        this.imgMngService = $injector.get('imgMngService');
        /** library end **/
        this.tags = {};
        this.limit = 8;
    }

    /** 태그 노출/숨김 **/
    toggleTag(layer){
        if(angular.isDefined(layer.TagInfo)){
            layer.TagInfo.show = !layer.TagInfo.show;
        }
    }

    /** 태그 선택 **/
    tagClick(evt,layer,tag){
        if(tag.selected){
            tag.selected = false;
            layer.TagInfo.selected = false;
            delete this.tags[layer.Index];
        }else{
            angular.forEach(layer.TagInfo.list,function(val,idx){
                val.selected = false;
            });
            tag.selected = true;
            layer.TagInfo.selected = true;
            this.tags[layer.Index] = {
                idx : layer.Index,
                tag : tag.name,
                layerName : layer.Name,
                originalSrc : layer.ImageFile,
                offset : 0,
                currentPage : 1,
                limit : 8
            }
        }
    }

    className(mode, layer){
        /** 자동조합 버튼 클래스 **/
        if(mode=='popupBtn'){
            let _class = ['mapping'];
            if(Object.keys(this.tags).length) _class.push('active');
            return _class;
        }else if(mode=='tag'){
            return (angular.isDefined(layer.TagInfo))?'tag':'';
        }
    }

    /** 자동조합 **/
    popup(){
        if(Object.keys(this.tags).length==0){
            this.Notification.warning(this.commonFunctionFactory.translate('tagEmpty2'));
        }else{
            var modalInstance = this.$uibModal.open({
                animation : true,
                templateUrl : this.blockEditorValue.templateUrl.popAutoTagMapping,
                //controller: 'fileUploadCtrl',
                backdrop : 'static',
                //size: 'sm',
                //windowClass : 'popup-layer hashtag-mapping',
                resolve : {
                    items : function(){
                        let _tags = new Set();
                        angular.forEach(this.tags,function(val,idx){
                            if(val) {
                                val.currentPage = 1;
                                _tags.add(val);
                            }
                        });
                        //return _tags;
                        return this.tags;
                    }.apply(this)
                },
                controller : ($scope,$uibModalInstance,items)=>{
                    $scope.tagsInfo = items;
                    $scope.pagination = {
                        maxSize : 5,
                        limit : 8,
                        pageChange : (tag)=>{
                            let params = {
                                'layer_idx' : tag.idx,
                                'layer_tag' : tag.tag,
                                offset : (tag.currentPage-1)*this.limit,
                                limit : this.limit
                            };
                            this.get(params,tag);
                        }
                    };
                    this.init($scope.tagsInfo);

                    /** 태그 이미지 클릭 **/
                    $scope.tagImgClick = function(list,tag){
                        let selected = (tag.selected)?true:false;
                        angular.forEach(list,function(tag,idx){
                            tag.selected = false;
                        });
                        tag.selected = !selected;
                    }

                    /** 저장 **/
                    $scope.ok=()=>{
                        let _selectedTags = [];
                        /** 태그 데이터 묶음 생성 **/
                        angular.forEach(this.tags, function(_tags,idx){
                            angular.forEach(_tags.list, function(tag,idx2){
                                if(tag.selected) {
                                    var _tmp = angular.merge(tag,{idx : _tags.idx, name:_tags.tag});
                                    _selectedTags.push(_tmp);
                                }
                            })
                        })
                        $uibModalInstance.close(_selectedTags);
                    };

                    $scope.cancel = function(){
                        $uibModalInstance.dismiss('cancel');
                    };
                },
            });

            modalInstance.opened.then(()=>{
                this.$rootScope.$broadcast('layerMng.resetCurrentLayer');
            });

            modalInstance.rendered.then(function(){
                //angular.element('div.modal-content').draggable().resizable();
            });

            modalInstance.result.then((selectedItem)=>{
                /** 선택된 태그 이미지로 기존 이미지를 교체 및 가중치 변경 **/
                angular.forEach(selectedItem,(tag,idx)=>{
                    let _layer = this.layerMngService.getLayerByIndex(tag.idx);
                    let _image = {mode : 'tagMapping', url : tag.url};
                    //기존 이미지 변경
                    this.imgMngService.imageChangeFromList(_layer, _image).then(()=>{
                        //가중치 변경
                        let url = this.blockEditorValue.api.autoTagMappingWeight;
                        url = url.replace('[:index:]', tag.le_item_output_idx);
                        this.commonSvc.post(url, {variation : 1}).then((response)=>{
                            if(response.data.status == this.blockEditorValue.statusCode.success){
                                let data = {tag:tag.name,weight:response.data.current_weight};
                                this.Notification.success(this.commonFunctionFactory.translate('tagMappingWeightSuccess', data));
                            }else{
                                this.Notification.error(this.commonFunctionFactory.translate('tagMappingWeightFail'));
                            }
                        }, function(data){
                            this.Notification.error(commonFunctionFactory.translate('tagMappingWeightFail'));
                        })
                    })
                });
            },function(){
                console.info('Modal dismissed at: '+new Date());
            });
        }
    }

    /** 초기화 **/
    init(tags){
        let _idxList = [];
        let _tagList = [];
        angular.forEach(tags,function(tag,idx){
            _idxList.push(tag.idx);
            _tagList.push(tag.tag);
        });
        let params = {
            'layer_idx[]' : _idxList,
            'layer_tag[]' : _tagList,
            offset : 0,
            limit : this.limit
        };
        this.get(params,tags);
    }

    /** 태그 리스트 호출 **/
    get(params,tags){
        let defer = this.$q.defer();
        let myBlockUI = this.blockUI.instances.get('sideTagMapping');
        myBlockUI.start();
        //this.commonSvc.get('/resources_block_editor/initTagMapping.json',params).then(response=>{
        this.commonSvc.get(this.blockEditorValue.api.autoTagMapping, params).then(response=> {
            myBlockUI.reset();
            if(response.data.status == this.blockEditorValue.statusCode.success){
                let _response = response.data;
                angular.forEach(_response.items,(data,idx)=>{
                    if(angular.isDefined(tags.idx)){
                        tags.list = data.images;
                        tags.totalCnt = data.total_cnt;
                    }else if(angular.isDefined(tags[data.layer_idx])){
                        tags[data.layer_idx].list = data.images;
                        tags[data.layer_idx].totalCnt = data.total_cnt;
                    }
                });
                defer.resolve(tags);
            }else{
                myBlockUI.reset();
                defer.reject(response.data);
            }
        },(response)=>{
            myBlockUI.reset();
            let msg = (response.data)?response.data.message:this.commonFunctionFactory.translate('initError');
            this.Notification.error(msg);
            defer.reject(response.data);
        })
        return defer.promise;
    }
}
