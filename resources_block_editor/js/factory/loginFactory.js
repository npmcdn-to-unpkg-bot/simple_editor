export default [
    "$rootScope","$location","$q","commonSvc","commonFunctionFactory",
    function($rootScope,$location,$q,commonSvc,commonFunctionFactory){
        var factory = {};

        // 로그인
        factory.loginCheck = function(){
            var deferred = $q.defer();
            commonSvc.get('/api/auth/login_check').then(function(response){
                var data = response.data;
                if(angular.isUndefined(data)||data.logged_in == null){
                    window.location = '/login';
                }else{
                    deferred.resolve(data);
                    $rootScope._user = data;
                }
            },function(){
                window.location = '/login';
            })
            return deferred.promise;
        }

        // 로그아웃
        factory.logout = function(){
            commonSvc.post('/api/auth/logout').then(function(response){
                window.location = '/login';
            },function(){
                window.location = '/login';
            })
        }

        //유저 상세 정보
        factory.getUserDetailInfo = function(info){
            var deferred = $q.defer();
            //var params = { q : 'user_id=' + $rootScope._user.user_id };
            var params = {q : 'user_id='+info.user_id};
            commonSvc.get('/api/users',params).then(function(response){
                var _response = response.data;
                if(_response.status == '200'){
                    var user_info = _response.items[0];
                    deferred.resolve(user_info);
                    //commonFunctionFactory.setUserAuthorization(user_info);
                    //commonFunctionFactory.checkUserHaveAuthorization($location.path());
                }
            });
            return deferred.promise;
        }

        /** 권한 확인 **/
        factory.hasRole = function(roles){
            var deferred = $q.defer();
            factory.loginCheck().then(function(info){
                factory.getUserDetailInfo(info).then(function(userInfo){
                    commonFunctionFactory.setUserAuthorization(userInfo);
                    commonFunctionFactory.checkUserHaveAuthorization(roles);
                    deferred.reject(roles)
                })
            })
            //return deferred.promise;
            return deferred;
        }

        return factory;
    }
];