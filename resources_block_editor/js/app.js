/****************************
 * CSS
 ***************************/
import '../bower_components/jquery-ui/themes/base/jquery-ui.min.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import '../../node_modules/angular-hotkeys/build/hotkeys.min.css'
import '../bower_components/angular-block-ui/dist/angular-block-ui.min.css';
import '../bower_components/ng-notify/dist/ng-notify.min.css';
import '../bower_components/angular-ui-notification/dist/angular-ui-notification.min.css';
import '../bower_components/angular-ui-select/dist/select.min.css';
import '../bower_components/angular-editable-text/dist/angular-editable-text.min.css';
import '../bower_components/RulersGuides/rulersguides.css';
import '../bower_components/spectrum/spectrum.css';
import '../bower_components/jquery-ui-rotatable/jquery.ui.rotatable.css';
import '../bower_components/cropper/dist/cropper.css';
import '../bower_components/angular-editable-text/dist/angular-editable-text.min.css';
import '../css/select2.css';
import '../css/block-editor.css';
/****************************
 * CORE MODULE
 ***************************/
import "jquery";
import "jquery-ui";
import angular from "angular";
import angular_ui_bootstrap from "angular-ui-bootstrap";
import "angular-translate";
import "angular-sanitize";
import "angular-block-ui";
import "angular-ngNotify";
import "angular-notification";
import "angular-hotkeys";
import "angular-base64";
import "angular-cookie";
import "angular-file-upload";
import "angular-x2js";
import "angular-ui-select";
import "angular-editable-text";
import "../bower_components/RulersGuides/RulersGuides.js";
import "../bower_components/spectrum/spectrum.js";
import "../bower_components/jquery-ui-rotatable/jquery.ui.rotatable.js";
import "../bower_components/cropper/dist/cropper.min.js";
import "../bower_components/jquery-editable-select/dist/jquery-editable-select.min.js";
import "../bower_components/angular-dragdrop/src/angular-dragdrop.min.js";
import "../bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js";
/** masonry START **/
import "../bower_components/jquery-bridget/jquery-bridget.js"
import "../bower_components/ev-emitter/ev-emitter.js"
import "../bower_components/desandro-matches-selector/matches-selector.js"
import "../bower_components/fizzy-ui-utils/utils.js"
import "../bower_components/get-size/get-size.js"
import "../bower_components/outlayer/item.js"
import "../bower_components/outlayer/outlayer.js"
import "../bower_components/masonry/masonry.js"
import "../bower_components/imagesloaded/imagesloaded.js"
import "../bower_components/angular-masonry/angular-masonry.js"
/** masonry END **/
import cats from "./cats.js";
/****************************
 * TEMPLATE HTML TO WEBPACK
 ***************************/
import './../view/blockEditorTopButton.html';
import './../view/blockEditorToolbar.html';
import './../view/blockEditorContents.html';
import './../view/ruler.html';
import './../view/templateTypeahead_font.html';
import './../view/popFileUpload.html';
import './../view/popFileUploadPSD.html';
import './../view/popAutoTagMapping.html';
import './../view/sideLayerList.html';
import './../view/sideBlockInfo.html';
import './../view/sideSearchInfo.html';
import './../view/sideNoneSelected.html';
import './../view/sideImageInfo.html';
import './../view/sideTextInfo.html';
import './../view/sideShapeInfo.html';
import './../view/sideTagMapping.html';
/****************************
 * ANGULAR - VALUE && CONST
 ***************************/
import blockEditorValue from "./value/blockEditorValue.js";
import languageConstant from "./value/languageConstant.js";
import layerInfoConstant from "./value/layerInfoConstant.js";
/****************************
 * ANGULAR - CONTROLLER
 ***************************/
import blockEditorCtrl from "./controller/blockEditorCtrl.js";
import sideLayerPanelCtrl from "./controller/sideLayerPanelCtrl.js";
import rulerCtrl from "./controller/rulerCtrl.js";
import fileUploadCtrl from "./controller/fileUploadCtrl.js";
/****************************
 * ANGULAR - SERVICE
 ***************************/
import commonSvc from "./service/commonService.js";
import layerMngService from "./service/layerMngService.js";
import imgMngService from "./service/imgMngService.js";
import tagMappingService from "./service/tagMappingService.js";
/****************************
 * ANGULAR - FACTORY
 ***************************/
import loginFactory from "./factory/loginFactory.js";
import historyFactory from "./factory/historyFactory.js";
import commonFunctionFactory from "./factory/commonFunctionFactory.js";
import fileUploadFactory from "./factory/fileUploadFactory.js";
import simplexPluginManagerFactory from "./factory/simplexPluginManagerFactory.js";
/****************************
 * ANGULAR - FILTER & DIRECTIVE
 ***************************/
import filter from "./editorFilter.js";
import directive from "./editorDirective.js";
/****************************
 * 심플 에디터 초기화
 ***************************/
var app = [
    'angular-route'
    ,'angular-bootstrap-tpls','angular-editable-text','ngDragDrop',''
    ,'','angular-notification','angular-context','','sly'
    ,'cropper','angular-drop-and-drop-list','angular-masonry','spectrum'
    ,'jquery-ui-rotatable','angular-ui-select','jquery-editable-select','angular-xml','angular-file-upload'
    ,'graphpaper'
];
let webApp = angular.module('app',[
    'ui.bootstrap',
    'pascalprecht.translate',
    'ipCookie',
    'base64',
    'cb.x2js',
    'blockUI',
    'ngNotify', //와이드 알림
    'ui-notification', //작은창 알림
    'cfp.hotkeys',
    'angularFileUpload',
    'ui.select',
    'ngSanitize',
    'gg.editableText',
    'ngDragDrop',
    'wu.masonry',
    'dndLists'
])
    .value('blockEditorValue',blockEditorValue)
    .constant('layerInfoConstant',layerInfoConstant)
    .constant('languageConstant',languageConstant)

    .controller('blockEditorCtrl',blockEditorCtrl)
    .controller('sideLayerPanelCtrl',sideLayerPanelCtrl)
    .controller('rulerCtrl',rulerCtrl)
    .controller('fileUploadCtrl',fileUploadCtrl)

    .service('commonSvc',commonSvc)
    .service('layerMngService',layerMngService)
    .service('imgMngService',imgMngService)
    .service('tagMappingService',tagMappingService)

    .factory('loginFactory',loginFactory)
    .factory('historyFactory',historyFactory)
    .factory('commonFunctionFactory',commonFunctionFactory)
    .factory('fileUploadFactory',fileUploadFactory)
    .factory('simplexPluginManagerFactory',simplexPluginManagerFactory)

    .filter('replaceBr',filter.replaceBr)
    .filter('propsFilter',filter.propsFilter)
    .filter('orderObjectBy',filter.orderObjectBy)
    .filter('bytes',filter.bytes)
    .filter('limitLength',filter.limitLength)
    .filter('fontLangFilter',filter.fontLangFilter)

    .directive('customResizable',directive.customResizable)
    .directive('myContextmenu',directive.myContextmenu)
    .directive('scrollCheck',directive.scrollCheck)
    .directive('graphpaper',directive.graphpaper)
    .directive('slySlide',directive.slySlide)
    .directive('colorPickerSpectrum',directive.colorPickerSpectrum)
    .directive('loadingButton',directive.loadingButton)
    .directive('mouseSelection',directive.mouseSelection)
    .directive('selectEditable',directive.selectEditable)
    .directive('errSrc',directive.errSrc)
    .directive('degreeInput',directive.degreeInput)
    .directive('rotate',directive.rotate)
    .directive('rulerScrollCheck',directive.rulerScrollCheck)
    .directive('cropper',directive.cropper)
    .directive('ngThumb',directive.ngThumb)
    .directive('keepRatio',directive.keepRatio)
    .directive('imgPreventDrop',directive.imgPreventDrop)
    .directive('customTooltip',directive.customTooltip)
    .directive('svgFigure',directive.svgFigure)

    .config(function($locationProvider,$httpProvider){
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    })
/** 언어권 설정 **/
    .config(function($translateProvider,languageConstant){
        /** how to use
         * <p>{{'RAW_TO_FILTER' | translate:'{ type: "raw" }' }}</p>
         * <p translate="RAW_TO_DIRECTIVE" translate-values="{ type: 'directives' }"></p>
         **/
        $translateProvider.translations('KO',languageConstant.KO);
        $translateProvider.translations('EN',languageConstant.EN);
        $translateProvider.preferredLanguage('KO');
        $translateProvider.useSanitizeValueStrategy('');
    })
    .config(function(NotificationProvider){
        NotificationProvider.setOptions({
            delay : 1500,
            //startTop: 20,
            //startRight: 10,
            //verticalSpacing: 20,
            //horizontalSpacing: 20,
            positionX : 'right',
            positionY : 'bottom'
        });
    })
    .run(function($rootScope,loginFactory,commonFunctionFactory){
        /** 로그인 체크 **/
        $rootScope.userInfo = {status : 200,user_id : "dwkim02",logged_in : true};
        return;
        loginFactory.loginCheck().then(function(data){
            $rootScope.userInfo = data;
            commonFunctionFactory.customLogCall('login check','ok');
        },function(){
            commonFunctionFactory.customLogCall('login fail','error');
        })
    });