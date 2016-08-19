let blockEditorValue = {
    statusCode: {
        success: '0000'
    },
    cookie : {
        lang : 'translateLang'
    },
    api : {
        blockInfo : '/api/se_block'
        , blockInspectionAsk : '/api/se_block/[:index:]/request_qa_start' //검수요청
        , blockInspectionCancel : '/api/se_block/[:index:]/request_qa_cancel' //검수요청 취소
        , blockInspectionDone : '/api/se_block/[:index:]/request_qa_end' //검수완료
        , imageUpload : "/api/se_image"
        , imageMy : '/api/se_image' //내이미지
        , imagePre100 : '/api/se_forward' //프리백 이미지
        , imageDesign : '/api/le_item_outputs/search' //디자인 이미지
        , imageProduct : '/api/le_item_outputs' //객체 에디터 - 상품컷
        , imageModel : '/api/le_item_outputs' //객체 에디터 - 모델컷
        , imageEtc : '/api/le_item_outputs' //객체 에디터 - 일반컷
        , imageRemove : '/api/se_image/by_index' //remove
        , textRenderRequest : '/api/se_json_to_image/request'
        , textRenderCheck : '/api/se_json_to_image/check'
        , getFontType : '/api/se_font'
        , imageCrop : '/api/se_image_crop'
        , checkExternalImage : '/api/se_image/external' //외부 이미지 체크
        , nukiUploadManual : '/api/se_image_nuki/tool' //수동 누끼 이미지 업로드
        , nukiUploadAuto : '/api/se_image_nuki/auto' //자동 누끼 이미지
        , nukiInfo : 'api/le_item_outputs/nuki_app'
        , mallLIst : '/api/se_canvas/se_shops'
        , psdUpload : '/api/se_block/[:index:]/request_psd_upload'
        , autoTagMapping : '/api/le_item_outputs/auto_search' //자동객체조합 조회
        , autoTagMappingWeight : '/api/le_item_outputs/[:index:]/select_weight' //자동객체조합 가중치 부여
    },
    templateUrl: {
        blockEditorTopButton: {
            src: '/resources_block_editor/view/blockEditorTopButton.html',
            show: true
        },
        blockEditorToolbar: {
            src: '/resources_block_editor/view/blockEditorToolbar.html',
            show: true
        }
        , blockEditorContents: {
            src: '/resources_block_editor/view/blockEditorContents.html',
            show: true
        }
        , ruler : {
            show : true,
            src : '/resources_block_editor/view/ruler.html',
        }
        , typeaheadFont: '/resources_block_editor/view/templateTypeahead_font.html'
        , fileUpload: '/resources_block_editor/view/popFileUpload.html'
        , fileUploadPSD: '/resources_block_editor/view/popFileUploadPSD.html'
        , popAutoTagMapping: '/resources_block_editor/view/popAutoTagMapping.html'
        , leftLayerList: {
            show: true,
            src: '/resources_block_editor/view/sideLayerList.html'
        }
        , sideTab: {
            show: false,
            block: {
                src: '/resources_block_editor/view/sideBlockInfo.html',
                show: false
            }
            , search: {
                src: '/resources_block_editor/view/sideSearchInfo.html',
                show: false
            }
            , none: {
                src: '/resources_block_editor/view/sideNoneSelected.html',
                show: false
            }
            , image: {
                src: '/resources_block_editor/view/sideImageInfo.html',
                show: false
            }
            , text: {
                src: '/resources_block_editor/view/sideTextInfo.html',
                show: false
            }
            , shape: {
                src: '/resources_block_editor/view/sideShapeInfo.html',
                show: false
            }
            , tagMapping: {
                src: '/resources_block_editor/view/sideTagMapping.html',
                show: false
            }
        }
    },
    selectOption: {
        commentSearchStatus: [
            {name: '전체', val: '전체'},
            {name: '대기', val: '대기'},
            {name: '진행', val: '진행'},
            {name: '완료', val: '완료'}
        ],
        commentSearchStatusEdit: [
            {name: '대기', val: '대기'},
            {name: '진행', val: '진행'},
            {name: '완료', val: '완료'}
        ],
        productImageType : [
            {name : '상품컷' , val : '1'},
            {name : '인물컷 - 전신 이미지' , value : '2'},
            {name : '상품컷 + 인물컷 - 전신' , value : '3'},
            {name : '인물컷 - 상의 이미지' , value : '4'},
            {name : '상품컷 + 인물컷- 상의' , value : '5'}
        ],
        imageSearchType : [
            {name : '전체', val:''},
            {name : 'PSD', val:'psd'},
            {name : '촬영', val:'photo'},
            {name : '일반', val:'normal'},
            {name : '요청', val:'request'}
        ],
        imageSearchCategory : [
            {name : '전체', val:''},
            {name : '모델컷', val:'model'},
            {name : '상품컷', val:'product'},
            {name : '배너', val:'banner'},
            {name : '기타', val:'etc'}
        ],
        fontList: [
            {name: 'italic', val: 'italic'},
            {name: 'Malgun Gothic', val: 'Malgun Gothic'},
            {name: 'Gothic', val: 'Gothic'},
            {name: 'Arial', val: 'Arial'},
            {name: 'Fixedsys', val: 'Fixedsys'},
            {name: 'sans-serif', val: 'sans-serif'},
            {name: '맑은 고딕', val: '맑은 고딕'},
            {name: '나눔 고딕', val: '나눔 고딕'},
            {name: '나눔고딕', val: '나눔고딕'},
        ],
        fontSize: [
            {name: '5', value: 5}
            , {name: '7', value: 7}
            , {name: '10', value: 10}
            , {name: '15', value: 15}
            , {name: '30', value: 30}
            , {name: '40', value: 40}
            , {name: '50', value: 50}
            , {name: '100', value: 100}
            , {name: '150', value: 150}
            , {name: '200', value: 200}
            , {name: '250', value: 250}
            , {name: '300', value: 300}
        ],
        fontTracking: [
            {name: '-100', value: -100}
            , {name: '-75', value: -75}
            , {name: '-50', value: -50}
            , {name: '-40', value: -40}
            , {name: '-25', value: -25}
            , {name: '-10', value: -10}
            , {name: '0', value: 0}
            , {name: '10', value: 10}
            , {name: '25', value: 25}
            , {name: '40', value: 40}
            , {name: '50', value: 50}
            , {name: '75', value: 75}
            , {name: '100', value: 100}
            , {name: '200', value: 200}
        ],
        fontLeading: [
            {name: 'Auto', value: true}
            , {name: '6', value: 6}
            , {name: '8', value: 8}
            , {name: '10', value: 10}
            , {name: '20', value: 20}
            , {name: '30', value: 30}
            , {name: '40', value: 40}
            , {name: '60', value: 60}
            , {name: '80', value: 80}
            , {name: '100', value: 100}
            , {name: '120', value: 120}
            , {name: '150', value: 150}
            , {name: '170', value: 170}
            , {name: '200', value: 200}
        ],
        shapeBorderSize : [
            {name : "1", value : 1},
            {name : "2", value : 2},
            {name : "3", value : 3},
            {name : "4", value : 4},
            {name : "5", value : 5},
            {name : "6", value : 6},
            {name : "7", value : 7},
            {name : "8", value : 8},
            {name : "9", value : 9},
            {name : "10", value : 10},
            {name : "15", value : 15},
            {name : "20", value : 20},
        ],
        shapeBorderStyle : [
            {src:'/resources_block_editor/img/shape_border1.png', dash : false},
            {src:'/resources_block_editor/img/shape_border2.png', dash : true, width : 5, distance : 5},
            {src:'/resources_block_editor/img/shape_border3.png', dash : true, width : 10, distance : 5}
        ]
    },
    defaultLayerImg: {
        text: '/resources_block_editor/img/newText.png',
        image: '/resources_block_editor/img/newImage.png'
    }
};
export default blockEditorValue;

