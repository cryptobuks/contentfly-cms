(function() {
    'use strict';

    angular
        .module('app')
        .run(run);

    function run($rootScope, $location, $cookies, localStorageService, $http){

        if ($cookies.get('APPCMS-TOKEN') != null) {
            $http.defaults.headers.common = {
                'APPCMS-TOKEN': $cookies.get('APPCMS-TOKEN')
            };
        }

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {

            $http({
                method: 'GET',
                url: '/api/config'
            }).then(function successCallback(response) {
                if($rootScope.version != response.data.version){
                    $rootScope.newVersion = response.data.version;
                }else{
                    $rootScope.newVersion = null;
                }
            }, function errorCallback(response) {
                $rootScope.newVersion = null;
            });

            if(next.secure){
                //localStorageService.set('localStorageKey','Add this!');
                if ($cookies.get('APPCMS-TOKEN') == null) {
                    $location.path("/login");
                }else{
                    $rootScope.userLoggedIn = true;
                    $rootScope.user = localStorageService.get('user');
                    $rootScope.version = localStorageService.get('version');
                    $rootScope.devmode = localStorageService.get('devmode');
                    $rootScope.frontend = localStorageService.get('frontend');
                    $rootScope.schema = localStorageService.get('schema');
                    $rootScope.permissions = localStorageService.get('permissions');
                    $rootScope.uiblocks = localStorageService.get('uiblocks');
                  
                    var entities = {};
                    for (var entity in $rootScope.schema) {
                        if(entity == '_hash') continue;
                        if(entity.substr(0, 4) == 'PIM\\' || $rootScope.schema[entity]["settings"]["hide"] || !$rootScope.permissions[entity]["readable"]) continue;
                        entities[entity] = $rootScope.schema[entity]["settings"]["label"];
                    }

                    $rootScope.entities = entities;

                }
            }else{
                $rootScope.frontend = localStorageService.get('frontend');
            }
        });
    }

})();
