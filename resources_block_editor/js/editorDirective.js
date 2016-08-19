/**
 * @FileName editorDirective.js
 * @author Kim, Donguk <dwkim02@simplexi.com>
 * @link http://www.xxx.com
 * @Date 2016-08-08
 */
export default {
    customResizable($rootScope){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                element.resizable({
                    handles : attrs.customResizable
                    //,autoHide:true
                    //,containment : '#backgroundDiv'
                    ,create : function(event,ui){
                        //$(event.target).children('.ui-resizable-handle').css('background-color','#ffffff').css('border','1px gray solid');
                    }
                });
                element.on('resizestart',function(evt,ui){
                    var _name = 'obj_'+$rootScope.currentLayer.Index;
                    //this.resizable('option', {alsoResize : _name});
                    angular.element(element).click();
                    $rootScope.currentLayer.TransformMode = {Mode : 'transform'};
                });
                element.on('resizestop',function(evt,ui){
                    scope.resizeEnd(angular.extend({},ui.size,ui.position));
                    scope.$apply();
                });
            },
        };
    },
    myContextmenu($rootScope,Notification,layerMngService){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                element.on('contextmenu',function(evt,a){
                    evt.preventDefault();
                    $rootScope.currentLayer = false;
                    layerMngService.initSelectedLayer();
                    Notification.info('Layer init');
                    scope.$apply();
                })
            },
        };
    },
    scrollCheck(){
        return {
            restrict : 'A',
            link : function(scope,element,attrs){
                element.bind('scroll',function(){
                    if(this.scrollTop+this.offsetHeight>=this.scrollHeight){
                        scope.getImageList('append');
                    }
                });
            }
        };
    },
    graphpaper($timeout){
        return {
            restrict : 'A',
            scope : false,
            link : function(scope,element,attrs){
                scope.$on('rulerInit',function(name,data){
                    if(data.graphpaperShow){
                        let props = {
                            canvasID : 'graphpaper',
                            width : data.width,
                            height : data.height,
                            cellWidth : 5,
                            cellHeight : 5,
                            majorRows : 5,
                            majorCols : 5,
                            majorColor : [0,.2,.5,.5],
                            minorColor : [0,.2,.5,.3]
                        }
                        var graphpaper = new Graphpaper(props);
                        //element.appendChild(graphpaper.element);
                        element.append(graphpaper.element);
                    }else{
                        angular.element('#graphpaper').remove();
                    }
                })
            }
        };
    },
    slySlide($timeout,tagMappingService){
        return {
            restrict : 'A',
            link : function(scope,element,attrs){
                $timeout(function(){
                    var $frame = element;
                    var width = 60;
                    var $slidee = $frame.children('ul').eq(0);
                    var $wrap = $frame.parent();
                    var option = {
                        horizontal : 1,
                        itemNav : 'basic',
                        smart : 1,
                        activateOn : 'click',
                        mouseDragging : 1,
                        touchDragging : 1,
                        releaseSwing : 1,
                        startAt : 0,
                        scrollBar : $wrap.find('.scrollbar'),
                        scrollBy : 1,
                        pagesBar : $wrap.find('.pages'),
                        activatePageOn : 'click',
                        speed : 300,
                        elasticBounds : 1,
                        easing : 'easeOutExpo',
                        dragHandle : 1,
                        dynamicHandle : 1,
                        clickBar : 1,

                        // Automated cycling
                        //cycleBy: 'items', // Enable automatic cycling by 'items' or 'pages'.
                        cycleInterval : 5000,    // Delay between cycles in milliseconds.
                        pauseOnHover : true,  // Pause cycling when mouse hovers over the FRAME.
                        startPaused : false,  // Whether to start in paused sate.

                        // Buttons
                        forward : $wrap.find('.forward'),
                        backward : $wrap.find('.backward'),
                        prev : $wrap.find('.prev'),
                        next : $wrap.find('.next'),
                        prevPage : $wrap.find('.prevPage'),
                        nextPage : $wrap.find('.nextPage')
                    }
                    //$frame.sly(option);
                    var slyObj = new Sly($frame,option).init();
                    slyObj.on('load change',function(){
                        //console.log(this.pos);
                        if(this.pos.dest !== 0&&this.pos.end>500
                            &&(this.pos.dest>this.pos.end-width)){
                            tagMappingService.get(attrs.index,this.pos.dest);
                        }
                    })
                    slyObj.on('active',function(eventName,itemIndex){
                        $timeout(()=>{
                            this.items[itemIndex].el.click();
                        });
                    })
                });
            }
        };
    },
    colorPickerSpectrum($rootScope){
        return {
            restrict : 'A',
            link : function(scope,element,attrs){
                var modelName = attrs.ngModel.split(".");
                var _apply = function(color){
                    if(color&&modelName){
                        scope.$apply(function(){
                            if(modelName.length>2&&scope.currentLayer){
                                scope.currentLayer.Text_Properties[0].Color = color;
                            }else if(scope[modelName[0]]){
                                scope[modelName[0]][modelName[1]] = color;
                            }
                        })
                    }
                };
                var _option = scope.$eval(attrs.colorPickerPlus);
                var spectrum_option = {
                    color : "#f00",
                    showInput : true,
                    showInitial : false,
                    allowEmpty : false,
                    showAlpha : false,
                    disabled : false,
                    localStorageKey : 'testColor',
                    showPalette : true,
                    showPaletteOnly : false,
                    togglePaletteOnly : false,
                    showSelectionPalette : false,
                    clickoutFiresChange : true,
                    showButtons : false,
                    cancelText : 'cancel',
                    chooseText : 'ok',
                    togglePaletteMoreText : 'togglePaletteMoreText',
                    togglePaletteLessText : 'togglePaletteLessText',
                    //containerClassName: string,
                    //replacerClassName: string,
                    //maxSelectionSize: int,
                    preferredFormat : "hex",
                    palette : [
                        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
                    ],
                    //selectionPalette: [string]
                    move : function(color){
                        _apply(color.toHexString());
                    },
                    change : function(color){
                        if(modelName == 'psdTemplateInfo.rgbColorInfo'&&$rootScope.currentLayer){
                            $rootScope.currentLayer.textRenderRequire = true;
                        }
                        _apply(color.toHexString());
                    },
                    show : function(color){
                        angular.element(this).spectrum("set",scope.$eval(attrs.ngModel));
                    }
                }
                element.spectrum(angular.extend(spectrum_option,_option));
                element.on("dragstart.spectrum",function(e,color){
                    //angular.element(this).spectrum("set", color.toHexString());
                    //_apply(color.toHexString())
                });
            }
        };
    },
    loadingButton(commonFunctionFactory){
        return {
            restrict : 'A',
            link : function(scope,element,attrs){
                var buttonText = commonFunctionFactory.translate(attrs.loadingButton);
                scope.$watch('_isImageLoading',function(newVal,oldVal){
                    if(newVal == true){
                        angular.element(element).text('').addClass('isLoading');
                    }else{
                        angular.element(element).text(buttonText).removeClass('isLoading');
                    }
                },false)
            }
        };
    },
    mouseSelection(layerMngService){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                var _myElement = 'div.editorObj';
                element.selectable({
                    //appendTo : '#mainEditorDiv',
                    delay : 100,
                    filter : _myElement,
                    cancel : _myElement,
                    start : function(evt,ui){
                        scope.multiSelectLayer.init();
                        scope.$emit('layerMng.resetCurrentLayer');
                    },
                    selecting : function(evt,ui){
                        scope.$apply(function(){
                            layerMngService.setLayerByIndex(ui.selecting.dataset.layerIndex,{isSelectedGroup : true});
                        });
                    },
                    unselecting : function(evt,ui){
                        scope.$apply(function(){
                            layerMngService.setLayerByIndex(ui.unselecting.dataset.layerIndex,{isSelectedGroup : false});
                        })
                    },
                    selected : function(evt,ui){
                        scope.multiSelectLayer.add(ui.selected.dataset.layerIndex);
                    },
                    stop : function(evt,ui){
                        scope.mouseSelectionStatus(false);
                        //todo 선택 후 레이어 패널에 표시 필요
                        setTimeout(function(){
                            scope.mouseSelectionStatus(true)
                        },100)
                    }
                });
            },
        };
    },
    selectEditable($rootScope,Notification,blockEditorValue){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                var mode = attrs.selectEditable
                    ,tmpCurrentValue = []
                    ,tmpSelectValue = [];

                function _setValue(value){
                    if(value&&$rootScope.currentLayer){
                        scope.$apply(function(){
                            $rootScope.currentLayer.textRenderRequire = true;
                            switch(mode){
                                case "fontTracking":
                                    if(isNaN(value)){
                                        Notification.error('숫자만 입력해주세요');
                                    }else{
                                        $rootScope.currentLayer.Text_Properties[0].Tracking = value;
                                    }
                                    break;
                                case "fontLeading":
                                    if(value == 'true'){
                                        $rootScope.currentLayer.Text_Properties[0].Leading.Auto = true;
                                    }else{
                                        $rootScope.currentLayer.Text_Properties[0].Leading.Auto = false;
                                        $rootScope.currentLayer.Text_Properties[0].Leading.Value = value;
                                    }
                                    break;
                                case "fontSize":
                                    if(isNaN(value)){
                                        Notification.error('숫자만 입력해주세요');
                                    }else{
                                        $rootScope.currentLayer.Text_Properties[0].Size = value;
                                    }
                                    break;
                            }
                        })
                    }
                }

                element.editableSelect({
                    effects : 'fade'
                    ,filter : false
                    ,onCreate : function(element){
                        var option = blockEditorValue.selectOption[mode];
                        angular.forEach(option,function(_option,idx){
                            var _str = "<option value='"+_option.value+"'>"+_option.name+"</option>";
                            element.append(angular.element(_str));
                        })
                    }
                    ,onSelect : function(element){
                        _setValue(element.attr('value'));
                    }
                    ,onKeyup : function(evt){
                        _setValue(evt.currentTarget.value);
                    }
                    ,onShow : function(element){
                    }
                    ,onHide : function(element){
                    }
                });
            },
        };
    },
    errSrc(){
        return {
            link : function(scope,element,attrs){
                element.on('error',function(){
                    attrs.$set('src','/resources_block_editor/img/img-not-found.png');
                });
            }
        };
    },
    degreeInput($rootScope){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                var radius = 27;
                var deg = 0;
                var X = 0,Y = 0;
                var mdown = false;
                var elP = '';
                var childSlider = '';

                function _calculateDeg(e,_childSlider){
                    //var elP = $('#circle').offset();
                    var $slider = _childSlider;
                    var sliderW2 = $slider.width();
                    var sliderH2 = $slider.height();
                    var elPos = {x : elP.left,y : elP.top};
                    var mPos = {x : e.clientX-elPos.x,y : e.clientY-elPos.y};
                    var atan = Math.atan2(mPos.x-radius,mPos.y-radius);
                    deg = -atan/(Math.PI/180)+180; // final (0-360 positive) degrees from mouse position
                    X = Math.round(radius*Math.sin(deg*Math.PI/180));
                    Y = Math.round(radius* -Math.cos(deg*Math.PI/180));
                    $slider.css({left : X+radius-sliderW2,top : Y+radius-sliderH2});
                    // AND FINALLY apply exact degrees to ball rotation
                    $slider.css({WebkitTransform : 'rotate('+deg+'deg)'});
                    $slider.css({'-moz-transform' : 'rotate('+deg+'deg)'});
                    // PRINT DEGREES
                    //$('input[name="angle"]').val(Math.ceil(deg));
                    return parseInt(deg);
                }

                var dragON = function(){
                    mdown = true;
                };
                var dragOFF = function(){
                    mdown = false;
                };
                element
                    .mousedown(dragON)
                    .mouseup(dragOFF).mouseleave(dragOFF)
                    .mousemove(function(evt){
                        if($rootScope.currentLayer&&mdown){
                            elP = $(this).offset();
                            childSlider = $(this).find('div');
                            var deg = _calculateDeg(evt,childSlider);
                            scope.$apply(function(){
                                $rootScope.currentLayer.RotationWeb = deg;
                                scope.$emit('resize.rotateDone',deg);
                            })
                        }
                    });
            },
        };
    },
    rotate(commonFunctionFactory){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                var rotateConfig = {
                    rotationCenterX : 50.0,
                    rotationCenterY : 50.0,
                    wheelRotate : false,
                    angle : false,
                    start : function(event,ui){
                    },
                    rotate : function(event,ui){
                    },
                    stop : function(event,ui){
                        var deg = commonFunctionFactory.radianToDegree(ui.angle.current);
                        deg = deg%360;
                        deg = (deg>0)?deg:360+deg;
                        scope.$emit('resize.rotateDone',parseInt(deg));
                    }
                };
                element.rotatable(rotateConfig);
                scope.$watch('currentLayer',function(newVal,oldVal){
                    if(newVal){
                        var radian = commonFunctionFactory.degreeToRadian(newVal.RotationWeb);
                        element.data('ui-rotatable').angle(radian);
                    }
                });
            },
        };
    },
    /** 룰러 스크롤 체크 **/
    rulerScrollCheck($timeout){
        return {
            restrict : 'A',
            link : function(scope,element,attrs,ngModel){
                let originalLeft = 0;
                let originalTop = 0;
                let semaphore = false;
                let lastTime = 0;
                element.scroll(function(){
                    $timeout(function(){
                        let scrollTop = angular.element(element).scrollTop();
                        let scrollLeft = angular.element(element).scrollLeft();
                        let mode = false;
                        let scroll = false;
                        let eventTime = Date.now();
                        if(originalLeft !== scrollLeft){//스크롤됨
                            mode = 'v';
                            scroll = scrollLeft;
                            originalLeft = scrollLeft;
                        }
                        if(originalTop !== scrollTop){
                            mode = 'h';
                            scroll = scrollTop;
                            originalTop = scrollTop;
                        }
                        if(mode){
                            scope.$broadcast('setRulerLocationByScroll',{mode : mode,scroll : scroll});
                        }
                    },200)
                })
            },
        };
    },
    cropper(){
        return {
            restrict : 'A',
            scope : {imgLayer : '@',callbackFn : '&callbackFn'},
            link : function(scope,element,attrs){
                scope.$watch('imgLayer',function(newValue,oldValue){
                    if(newValue){
                        var _layer = JSON.parse(newValue);
                        if(_layer.TransformMode&&_layer.TransformMode.Mode == 'crop')
                            element.cropper('replace',_layer.ImageFile);
                    }
                });
                element.cropper('reset');
                var options = {
                    //cropBoxResizable : false,
                    //aspectRatio: 16 / 9,
                    //aspectRatio: NaN,
                    //preview: '#canvasImg',
                    //cropBoxMovable : false,
                    //minContainerWidth : _rect.width,
                    //minContainerHeight: _rect.height,
                    viewMode : 0,
                    checkImageOrigin : false,
                    crossOrigin : 'anonymous',
                    background : false,
                    dragCrop : false,
                    crop : function(e){
                        //scope.cropperMethod(e, 'getData');
                    },
                    built : function(a){
                        //element.cropper('setCropBoxData', _rect);
                        //scope.cropperMethod();
                    }
                };
                element.on({
                    'build.cropper' : function(e){
                        //console.log(e.type);
                        //angular.element(e.target).siblings('img').remove();
                    },
                    'built.cropper' : function(e){
                        //console.log(e.type);
                    },
                    'cropstart.cropper' : function(e){
                        //console.log(e.type, e.action);
                    },
                    'cropmove.cropper' : function(e){
                        //console.log(e.type, e.action);
                    },
                    'cropend.cropper' : function(e){
                        //console.log(e.type, e.action);
                        //scope.cropperMethod(e, 'getData');
                        scope.callbackFn({arg : 22});
                    },
                    'crop.cropper' : function(e){
                        //console.log(e.type, e.x, e.y, e.width, e.height, e.rotate, e.scaleX, e.scaleY);
                    },
                    'zoom.cropper' : function(e){
                        //scope.cropperMethod(e, 'getData');
                    }
                });
                element.cropper(options);
            }
        };
    },
    ngThumb($window,$parse){
        return {
            restrict : 'A',
            link : function(scope,el,attrs){
                var file = $parse(attrs.ngThumb);
                scope.$watch(file,function(item){
                    var reader = new FileReader();
                    if(angular.isObject(item)&&item instanceof $window.File){
                        reader.readAsDataURL(item);
                    }
                    reader.onloadend = function(){
                        el.attr('src',reader.result);
                    }
                });
            }
        };
    },
    keepRatio($parse){
        return {
            restrict : 'A',
            link : function(scope,el,attrs){
                el.on('load',function(){
                    var ratio = Math.min(attrs.width/el[0].naturalWidth,attrs.height/el[0].naturalHeight);
                    el[0].width = ratio*el[0].naturalWidth;
                    el[0].height = ratio*el[0].naturalHeight;
                });
            }
        };
    },
    imgPreventDrop(){
        return {
            scope : false,
            link : function(scope,element,attrs){
                element.bind('drop dragover',function(event){
                    event.preventDefault();
                });
            }
        };
    },
    customTooltip(){
        return {
            scope : false,
            link : function(scope,element,attrs){
                element.tooltip({
                    content : attrs.title,
                    show : null,
                    position : {
                        my : "left top",
                        at : "left bottom"
                    },
                    open : function(event,ui){
                        ui.tooltip.animate({top : ui.tooltip.position().top+10},"fast");
                    }
                });
            }
        };
    },
    svgFigure(){
        return {
            restrict : 'E',
            transclude : true,
            scope : {layer : '=layer'},
            templateUrl : "/resources_block_editor/view/svgTemplate.html",
            controller : function($scope,$element,$attrs){
                $scope.setStyle = function(layer){
                    var _style = {};
                    if(layer.ShapeType == 'line'){
                        _style['stroke'] = commonFunctionFactory.rgbToStr(commonFunctionFactory.hexToRgb(layer.FillColor),layer.FillOpacity);
                    }else{
                        _style['fill'] = layer.FillColor;
                        _style['fill-opacity'] = layer.FillOpacity/100;
                        _style['stroke'] = commonFunctionFactory.rgbToStr(commonFunctionFactory.hexToRgb(layer.BolderColor),layer.BolderOpacity);
                    }
                    _style['stroke-width'] = layer.BolderSize;
                    //_style['stroke-opacity'] = layer.FillOpacityStroke/100;
                    if(layer.DashEnable){
                        _style['stroke-dasharray'] = [layer.DashLineWidth,layer.DashLineDistance].toString();
                    }
                    return _style;
                }

                $scope.drawRoundRectPath = function(layer){
                    /*
                     rx ry : Arc에 해당하는 타원의 반지름 (타원의 중심은 자동으로 계산)
                     x-axis-rotation : x축 회전 각도
                     large-arc-flag : 호의 각도가 180도 이상이면 1, 아니면 0
                     sweep-flag : 호의 진행방향이 양의 각도이면 1 (시계방향), 음의 각도 방향이면 0
                     x y : Arc의 끝점 (Arc의 시작점은 현재 위치)
                     */
                    var _rect = commonFunctionFactory.toInteger(commonFunctionFactory.rectToObject(layer.Rect));
                    var _corner = commonFunctionFactory.toInteger(layer.Corner);
                    var _d = "m"+_corner.LeftTop+","+0
                        +"h"+((_corner.LeftTop)?_rect.width-_corner.RightTop-_corner.LeftTop:_rect.width-_corner.RightTop)
                        +"a"+_corner.RightTop+","+_corner.RightTop+" 0 0 1 "+_corner.RightTop+","+_corner.RightTop
                        +"v"+((_corner.RightBottom)?_rect.height-_corner.RightTop-_corner.RightBottom:_rect.height-_corner.RightTop)
                        +"a"+_corner.RightBottom+","+_corner.RightBottom+" 0 0 1 "+ -_corner.RightBottom+","+_corner.RightBottom
                        +"h"+ -Math.abs((_corner.LeftBottom)?_rect.width-_corner.RightBottom-_corner.LeftBottom:_rect.width-_corner.RightBottom)
                        +"a"+_corner.LeftBottom+","+_corner.LeftBottom+" 0 0 1 "+ -_corner.LeftBottom+","+ -_corner.LeftBottom
                        +"v"+ -Math.abs((_corner.LeftTop)?_rect.height-_corner.LeftBottom-_corner.LeftTop:_rect.height-_corner.LeftBottom)
                        +"a"+ -_corner.LeftTop+","+_corner.LeftTop+" 0 0 1 "+_corner.LeftTop+","+ -_corner.LeftTop;
                    return _d;
                }
            },
            link : function(scope,element,attrs){
                var viewBoxMode = (attrs.layerPanel)?true:false;
                scope.$watch('layer',function(layer){
                    if(layer&&layer.Type == 'shape'){
                        var rect = commonFunctionFactory.rectToObject(layer.Rect);
                        var _widthDivide = parseInt(rect.width/2);
                        var viewBox = [0,0,rect.width,rect.height].join(" ");
                        switch(layer.ShapeType){
                            case "Rectangle":
                                scope.rx = layer.Corner.LeftTop;
                                scope.ry = layer.Corner.LeftTop;
                                if(viewBoxMode){
                                    element.find('svg')[0].setAttribute('viewBox',viewBox);
                                    scope.width = '100%';
                                    scope.height = '100%';
                                }else{
                                    scope.width = rect.width;
                                    scope.height = rect.height;
                                }
                                break;
                            case "Ellipse":
                                scope.cx = parseInt(rect.width/2);
                                scope.cy = parseInt(rect.height/2);
                                scope.rx = scope.cx;
                                scope.ry = scope.cy;
                                if(viewBoxMode){
                                    element.find('svg')[0].setAttribute('viewBox',viewBox);
                                    scope.width = '100%';
                                    scope.height = '100%';
                                }else{
                                    scope.width = rect.width;
                                    scope.height = rect.height;
                                }
                                break;
                            case "line": //미사용
                                if(viewBoxMode){
                                    element.find('svg')[0].setAttribute('viewBox',viewBox);
                                    scope.width = '100%';
                                    scope.height = '100%';
                                }else{
                                    scope.width = rect.width;
                                    scope.height = rect.height;
                                }
                                scope.x1 = 0;
                                scope.y1 = 0;
                                scope.x2 = rect.width;
                                scope.y2 = 0;
                                break;
                            case "circle": //미사용
                                scope.width = rect.width;
                                scope.height = rect.height;
                                scope.cx = _widthDivide;
                                scope.cy = _widthDivide;
                                scope.r = _widthDivide;
                                break;
                        }
                    }
                },true)
            }
        };
    }
}
