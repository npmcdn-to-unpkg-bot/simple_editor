//layerInfoConstant
export default {
    text: {
        Index: ''
        , zIndex: ''
        , Type: 'text'
        , Rect: ''
        , Name: 'Add text here.'
        , visible: true
        , Antialias: 'crisp'
        , BlandMode: 'normal'
        , Clipped: false
        , Effect_Visible: false
        , Rotation: 0
        , Opacity: 100
        , ImageFile: ''
        , Locked: false
        , Orientation: 'horizontal'
        , Text: 'Add text here.'
        , Text_Properties: [
            {
                "Range"://텍스트 문자 범위
                {
                    "From": 0,//스타일 시작 포인트
                    "To": 8,//스타일 종료 포인트
                    "Length": 8//스타일 범위 길이(생략가능)
                },
                Size: 15
                , Font: 'NanumGothicBold'
                , Color: {Red: 38, Green: 38, Blue: 38}
                , Leading: {Auto: true}
                , Tracking: 0
            }
        ]
        , Paragraph_Properties: [{
            "Range"://문단 범위
            {
                "From": 0,//문단 시작 포인트
                "To": 12,//문단 종료 포인트
                "Length": 12//문단 범위 길이(생략가능)
            },
            "Align": "left"//정렬(left:왼쪽, center:가운데, right:오른쪽)
        }]
        , isSelected: false
        , isSelectedGroup : false //그룹 선택
        , isAddedLayer: true
        , textRendering: false
        , textRenderRequire: true
    },
    image : {
        Index : ''
        , zIndex : ''
        , Type : 'image'
        , Name :'Add image here.'
        , Rect : ''
        , visible : true
        , BlandMode : 'normal'
        , Clipped : false
        , Effect_Visible : false
        , ImageFile : ''
        , Locked : false
        , isSelected : false
        , isSelectedGroup : false //그룹 선택
        , isAddedLayer : true
        , Opacity : 100
        , magicWand : { //누끼툴 정보
            isAutoWorking : false //자동 누끼 진행중인가
            , imageOriginalSrc : false //원본 이미지 주소
            , imageAutoSrc : false //자동 누끼 이미지 주소
            , imageManualSrc : false //수동 누끼 이미지 주소
        }
    },
    shape : {
        Index : ''
        , zIndex : ''
        , Type : 'shape'
        , ShapeType : '' //도형 타입 (Rectangle, Ellipse)
        , Name :'shape'
        , Rect : ''
        , visible : true
        , Opacity : 100 //레이어 투명도
        , FillOpacity : 50 //도형 내부 색상 투명도
        , FillColor : { //도형 내부 색상
            "Red": 255,
            "Green": 255,
            "Blue": 255
        }
        , BolderColor : { //도형 외곽선 색상
            "Red": 0,
            "Green": 0,
            "Blue": 0
        }
        , BolderAlign : 'center'
        , BolderSize : 0 //도형 외곽선 굵기
        , BolderOpacity : 100 //도형 외곽선 투명도
        , DashEnable : false //도형 외곽선 대시 사용
        , DashLineWidth : 10 //외곽선 대시 길이
        , DashLineDistance : 5 //외곽선 대시 간격
        , Rotation : 0 //도형 레이어 회전값
        , CornerEnable : false //모서리 둥글게
        , Corner : {
            LeftTop : 0,
            RightTop : 0,
            LeftBottom : 0,
            RightBottom : 0
        }
        , cornerLink : true //코너 모서리 전체 선택
        , isSelectedGroup : false //그룹 선택
    }
}
