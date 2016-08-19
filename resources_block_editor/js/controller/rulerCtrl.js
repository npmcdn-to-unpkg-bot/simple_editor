let rulerCtrl = [
    '$rootScope','$scope','Notification','commonFunctionFactory',
    'historyFactory','imgMngService','layerMngService','$filter','$timeout',
    function($rootScope,$scope,Notification,commonFunctionFactory,
             historyFactory,imgMngService,layerMngService,$filter,$timeout){
        /** init data **/
        var myScope = this;
        $scope.$on('blockInfoInitDone',function(name,data){
            myScope.ruler.init(data);
        });

        /** 스크롤 체크 **/
        $scope.$on('setRulerLocationByScroll',function(name,data){
            myScope.ruler.followMenu(data);
        });

        myScope.style = {
            ruler : function(mode){
                if(myScope.blockInfo){
                    if(mode == 'h'){
                        return {width : (parseInt(myScope.blockInfo.width)+400)+'px'}
                    }else{
                        return {height : myScope.blockInfo.height+'px'}
                    }
                }
            }
        }

        /** 룰러 관리 **/
        myScope.ruler = {
            show : true,
            vertical : [],
            horizon : [],
            _leftPixel : false,
            layerSize : false,
            init : function(data){
                let additionalPixel = 500;
                myScope.blockInfo = {
                    width : commonFunctionFactory.makeSum([data.width,additionalPixel]),
                    height : commonFunctionFactory.makeSum([data.height,additionalPixel]),
                };

                $timeout(()=>{
                    /****************************
                     * 왼쪽 판넬 픽셀 계산
                     ****************************/
                    let mainEditorDiv = angular.element('#mainEditorDiv');
                    let mainEditorOffset = mainEditorDiv.offset();
                    let backgroundDiv = angular.element('#backgroundDiv');
                    let backgroundDivOffset = backgroundDiv.offset();
                    let leftScroll = mainEditorDiv.scrollLeft();
                    let tmpLeft = false;
                    if(this.layerSize == false) this.layerSize = data;
                    if(mainEditorOffset.left == 0){
                        //왼쪽 판넬 숨김 상태
                        tmpLeft = Math.abs(backgroundDivOffset.left) - Math.abs(leftScroll);
                    }else{
                        //왼쪽 판넬 보임 상태
                        tmpLeft = Math.abs(backgroundDivOffset.left) - Math.abs(mainEditorOffset.left - leftScroll);
                    }
                    tmpLeft = -Math.abs(parseInt(tmpLeft));
                    if(this._leftPixel == false || this._leftPixel !== tmpLeft){
                        this._leftPixel = tmpLeft;
                    }else if(JSON.stringify(this.layerSize) !== JSON.stringify(data)){
                        this.layerSize = data;
                    }else if(this._leftPixel == tmpLeft){
                        //사이즈 변동 없으면 리턴
                        return;
                    }
                    /****************************
                     * 룰러 렌더
                     ****************************/
                    myScope.ruler.horizon = [];
                    myScope.ruler.vertical = [];
                    myScope.ruler.make('horizon',myScope.blockInfo.width);
                    myScope.ruler.make('vertical',myScope.blockInfo.height);
                },100)
            },
            /** 스크롤에 따른 롤러 위치 생성 **/
                followMenu(data){
                if(data.mode=='v'){
                    let vertical = angular.element('div.ruler.v');
                    let pixel = (data.scroll>=10)?data.scroll+'px':'';
                    vertical.css('left', pixel);
                }else if(data.mode=='h'){
                    let horizontal = angular.element('div.ruler.h');
                    let pixel = (data.scroll>=10)?(data.scroll-40)+'px':'';
                    horizontal.css('top', pixel);
                }
            },
            make : function(mode,size){
                var startPoint = 0;
                if(mode=='horizon'){
                    startPoint = (this._leftPixel==0)?-41:this._leftPixel;
                }
                for(var i=startPoint; i<size; i++){
                    let obj = {
                        className : '',
                        showLabel : false,
                        text : i
                    }
                    if(i%50 === 0){
                        obj.className = 'milestone';
                        if(i>0){
                            obj.showLabel = true;
                        }
                    }else if(i%10 === 0){
                        obj.className = 'major';
                    }
                    this[mode].push(obj);
                }
            }
        }

        /** 메뉴 리스트 **/
        myScope.menuList = {
            show : false,
            menu : [
                {name : 'rulerHideAllToggle'},
                {name : 'rulerToggle'},
                {name : 'guideToggle'},
                {name : 'guideRemove'},
                {name : 'guideRockToggle'},
            ],
            menuToggle(){
                this.show = !this.show;
            },
            menuStyle(){
                if(this.show)return {display : 'inline-block'};
            },
            class(){
                let _class = ['menu-btn', 'unselectable'];
                if(this.show)_class.push('active');
                return _class;
            },
            do(data){
                switch(data.name){
                    case 'rulerHideAllToggle':
                        myScope.ruler.show = !myScope.ruler.show;
                        if(myScope.ruler.show){
                            angular.element('div.rg-overlay').find('.guide').show();
                        }else{
                            angular.element('div.rg-overlay').find('.guide').hide();
                        }
                        break;
                    case 'rulerToggle':
                        myScope.ruler.show = !myScope.ruler.show;
                        break;
                    case 'guideToggle':
                        angular.element('div.rg-overlay').find('.guide').toggle();
                        break;
                    case 'guideRemove':
                        angular.element('div.rg-overlay').find('.guide').remove();
                        break;
                    case 'guideRockToggle':
                        myScope.guide.lock = !myScope.guide.lock;
                        if(myScope.guide.lock == false){
                            angular.element('div.rg-overlay').find('.guide').draggable('disable');
                        }else{
                            angular.element('div.rg-overlay').find('.guide').draggable('enable');
                        }
                        break;
                }
            }
        }

        /** 가이드 라인 관리 **/
        myScope.guide = {
            lock : true,
            add : function(evt,mode){
                //evt.preventDefault();
                //evt.stopPropagation();
                var panelLeft = parseInt(angular.element('aside.layers-pannel').css('left'));
                var _left = '';
                if(panelLeft == 0){//좌측 패널 보임
                    _left = evt.clientX-parseInt($('aside.layers-pannel').css('width'));
                }else{//좌측 패널 숨김
                    _left = evt.clientX;
                }
                _left += 2;

                var parentTo = angular.element(evt.target).parents('div.rg-overlay');
                var guideInfo = angular.element('<span/>',{class : 'info'});
                var axis = ''; //축
                var _className = '';
                var guideCss = {};
                if(mode == 'h'){
                    axis = 'y';
                    _className = 'guide h draggable';
                    guideInfo.css('left',_left+'px');
                    guideCss.width = parseInt(myScope.blockInfo.width)+'px';
                    guideCss.top = angular.element('div.ruler.h').css('top');
                }else{
                    axis = 'x';
                    _className = 'guide v draggable';
                    guideInfo.css('top',evt.clientY+'px');
                    guideCss.height = myScope.blockInfo.height+'px';
                    guideCss.left = angular.element('div.ruler.v').css('left');
                }

                var guide = angular.element("<div/>",{class : _className,css : guideCss});
                guide.draggable({
                    axis : axis,
                    //containment : 'parent',
                    snap : true,
                    snapTolerance : 5,
                    _left : '',
                    start : function(event,drag){
                        var _offset = angular.element('#mainEditorDiv>.wrap-layers').offset();
                        var panelLeft = parseInt(angular.element('aside.layers-pannel').css('left'));
                        if(panelLeft == 0){//좌측 패널 보임
                            this._left = -Math.abs(parseInt(_offset.left)-parseInt(angular.element('aside.layers-pannel').css('width')));
                        }else{//좌측 패널 숨김
                            this._left = -Math.abs(parseInt(_offset.left));
                        }
                        drag.helper.data('dragged', true);
                    },
                    drag : function(event,drag,guide){
                        let pixel = '';
                        if(drag.helper.data('mode') == 'h'){
                            pixel = drag.position.top;
                        }else{
                            pixel = drag.position.left-40;
                        }
                        drag.helper.find('span.info').text(parseInt(pixel)+'px');
                        drag.helper.css('position','');
                    }
                });
                guide.data('mode',mode);
                guide.data('dragged',false);
                guide.append(guideInfo);
                guide.appendTo(parentTo);
                //evt.type = "mousedown.draggable";
                evt.target = guide[0];
                guide.trigger(evt);
            },
            /** 드래그하지 않은 엘리먼트 삭제 **/
                checkNotMoved(evt){
                let _guides = angular.element(evt.target).parents('div.rg-overlay').find('div.guide');
                angular.forEach(_guides,function(obj,index){
                    if(angular.element(obj).data('dragged')==false){
                        angular.element(obj).remove();
                    }
                })
            },
            className : function(guide){
                let mode = guide.mode;
                return `guide ${mode} draggable`;
            }
        }
    }
];
export default rulerCtrl;
