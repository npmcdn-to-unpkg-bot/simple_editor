define(['angularAMD'], function(angularAMD){
    return angularAMD.factory('appDefaultSettingsFactory', function(){
        var dateFormat = 'YY/MM/DD';
        var factory = {
                isDevelopMode: false,
                dateFormat: dateFormat,
                statusCode: {
                    success: "0000"
                    , success2 : '200'
                },
                templateUrl: {
                    header: "/resources/view/common/header.html"
                    , search: "/resources/view/common/search.html"
                    , button: "/resources/view/common/button.html"
                    , title: "/resources/view/common/title.html"
                    , paging: "/resources/view/common/paging.html"
                    , contents: "/resources/view/partial/contents.html"
                    , calendar: "/resources/view/common/calendar.html"
                }
            };
        return factory;
    });
})

