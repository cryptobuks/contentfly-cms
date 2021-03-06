(function() {
    'use strict';

    angular
        .module('app')
        .config(routeConfiguration);

    function routeConfiguration($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: '/ui/default/views/dashboard.html?v=' + APP_VERSION,
                controller: 'DashboardCtrl as vm',
                secure: true
            })
            .when('/error', {
                templateUrl: '/ui/default/views/error.html?v=' + APP_VERSION,
                controller: 'ErrorCtrl as vm',
                secure: true
            })
            .when('/login', {
                templateUrl: '/ui/default/views/login.html?v=' + APP_VERSION,
                controller: 'LoginCtrl as vm'
            })
            .when('/logout', {
                templateUrl: '/ui/default/views/login.html?v=' + APP_VERSION,
                controller: 'LogoutCtrl as vm'
            })
            .when('/list/:entity', {
                templateUrl: '/ui/default/views/list.html?v=' + APP_VERSION,
                controller: 'ListCtrl as vm',
                resolve: { pimEntity: function(){return null;} },
                secure: true
            })
            .when('/list/PIM/:entity', {
                templateUrl: '/ui/default/views/list.html?v=' + APP_VERSION,
                controller: 'ListCtrl as vm',
                resolve: { pimEntity: function(){return true;} },
                secure: true
            })
            .when('/settings', {
                templateUrl: '/ui/default/views/settings.html?v=' + APP_VERSION,
                controller: 'SettingsCtrl as vm',
                secure: true
            })
            .when('/files', {
                templateUrl: '/ui/default/views/files.html?v=' + APP_VERSION,
                controller: 'FilesCtrl as vm',
                resolve: {
                    pimEntity: function(){return true;},
                    modaltitle: function(){return null;},
                    property: function(){return null;},
                    '$uibModalInstance': function(){return null;}
                },
                secure: true
            })
            .otherwise({ redirectTo: '/' });

        for (var route in uiRoutes){
            $routeProvider.when(route, {
                templateUrl: '/custom/Frontend/ui/default/views/' + uiRoutes[route]['templateName'] + '?v=' + CUSTOM_VERSION,
                controller: uiRoutes[route]['controllerName'] + ' as vm',
                secure: uiRoutes[route]['secure']
            })
        }
    }
})();