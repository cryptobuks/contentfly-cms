(function() {
    'use strict';

    angular
        .module('app')
        .controller('FormCtrl', FormCtrl);

    function FormCtrl($scope, $cookies, $uibModalInstance, $location, localStorageService, $timeout, $uibModal, $http, title, entity, object, Upload, moment, EntityService, FileService, readonly) {
        var vm               = this;
        var schemaComplete   = localStorageService.get('schema');
        var objectDataToSave = {};
        var backupForObject  = null;
        var refreshOnCancel  = false;

        //Properties
        vm.doSave           = false;
        vm.entity           = entity;
        vm.schemaOnejoin    = {};
        vm.schema           = schemaComplete[entity];

        vm.object           = {};
        vm.isLoading        = true;
        vm.isSubmit         = false;
        vm.isPush           = vm.schema['settings']['isPush'];
        vm.readonly         = readonly;
        vm.fileUploads      = {};
        vm.forms            = {};
        vm.modaltitle       = title;
        vm.password         = {};
        vm.permissions      = localStorageService.get('permissions');

        //Functions
        vm.save                 = save;
        vm.cancel               = cancel;
        vm.changeValue          = onChangeValue;
        vm.delete               = doDelete;

        //Startup
        init();

        ///////////////////////////////////

        function cancel() {
            if(refreshOnCancel){
                $uibModalInstance.close(vm.object);
            }else{
                $uibModalInstance.dismiss(false);
            }

        }

        function confirmPush(count, title, text, object) {
            var modalInstance = $uibModal.open({
                templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                controller: 'ModalCtrl as vm',
                resolve: {
                    title: function () {
                        return 'Push-Nachricht an ' + count + ' Benutzer versenden';
                    },
                    body: function () {
                        return "<p><b>" + title + "</b></p><p>" + text + "</p><p><br>" + object + "</p>";
                    },
                    hideCancelButton: function () {
                        return false;
                    }
                }
            });

            modalInstance.result.then(
                function(doDelete) {
                    if (doDelete) doSave(true);
                },
                function(){}
            );
        }

        function doDelete(object){

            if(vm.schema.settings.readonly){
                return;
            }

            var modaltitle = 'Wollen Sie den <b title="' + object.id + '">Eintrag ' + (object.id.length > 5 ? object.id.substr(0, 5) + '...' : object.id)  + '</b> wirklich löschen?';
            if(vm.schema.settings.labelProperty){
                modaltitle = 'Wollen Sie <b>' + vm.schema.settings.label + ' ' + object[vm.schema.settings.labelProperty] + '</b> wirklich löschen?';
            }

            var modalInstance = $uibModal.open({
                templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                controller: 'ModalCtrl as vm',
                resolve: {
                    title: function(){ return 'Eintrag löschen'; },
                    body: function(){ return modaltitle; },
                    object: function(){ return object; },
                    hideCancelButton: false
                }
            });

            modalInstance.result.then(
                function (doDelete) {


                    if(doDelete){

                        vm.objectsAvailable = false;
                        vm.objectsNotAvailable = false;

                        var data = {
                            entity: vm.entity,
                            id: object.id
                        };

                        EntityService.delete(data).then(
                            function successCallback(response) {
                                $uibModalInstance.close(vm.object);
                            },
                            function errorCallback(response) {
                                if(response.status == 401){
                                    var modalInstance = $uibModal.open({
                                        templateUrl: '/ui/default/views/partials/relogin.html?v=' + APP_VERSION,
                                        controller: 'ReloginCtrl as vm',
                                        backdrop: 'static'
                                    });

                                    modalInstance.result.then(
                                        function () {
                                            $uibModalInstance.close(false);
                                        },
                                        function () {
                                            $uibModalInstance.close();
                                            $location.path('/logout');
                                        }
                                    );

                                }else{
                                    var modalInstance = $uibModal.open({
                                        templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                                        controller: 'ModalCtrl as vm',
                                        resolve: {
                                            title: function(){ return 'Fehler beim Löschen'; },
                                            body: function(){ return response.data.message; },
                                            hideCancelButton: true
                                        }
                                    });
                                    $uibModalInstance.close(false);
                                }
                            }
                        );
                    }
                },
                function () {

                }
            );
        }

        function doSave(andClose) {
            vm.isSubmit     = true;
            refreshOnCancel = true;

            for (var formName in vm.forms) {
    
                if (!vm.forms[formName].$valid) {
                    return;
                }
            }

            vm.doSave = true;

            if (!vm.object['id']) {

                var data = {
                    entity: entity,
                    data: objectDataToSave
                };

                EntityService.insert(data).then(
                    function successCallback(response) {
                        vm.doSave       = false;
                        vm.object.id    = response.data.id;
                        if(andClose) $uibModalInstance.close(response.data.data);
                    },
                    function errorCallback(response) {

                        vm.doSave = false;

                        if(response.status == 401){
                            var modalInstance = $uibModal.open({
                                templateUrl: '/ui/default/views/partials/relogin.html?v=' + APP_VERSION,
                                controller: 'ReloginCtrl as vm',
                                backdrop: 'static'
                            });

                            modalInstance.result.then(
                                function () {
                                    doSave(vm.object);
                                },
                                function () {
                                    $uibModalInstance.close();
                                    $location.path('/logout');
                                }
                            );

                        }else{
                            var modalInstance = $uibModal.open({
                                templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                                controller: 'ModalCtrl as vm',
                                resolve: {
                                    title: function () {
                                        return 'Fehler beim Anlegen des Datensatzes';
                                    },
                                    body: function () {
                                        return response.data.message;
                                    },
                                    hideCancelButton: true
                                }
                            });
                        }
                    }
                );
            } else {

                var data = {
                    entity: entity,
                    id: vm.object['id'],
                    data: objectDataToSave
                };

                EntityService.update(data).then(
                    function successCallback(response) {
                        vm.doSave = false;
                        if(andClose) $uibModalInstance.close(vm.object);
                    },
                    function errorCallback(response) {
                        vm.doSave = false;

                        if(response.status == 401){
                            var modalInstance = $uibModal.open({
                                templateUrl: '/ui/default/views/partials/relogin.html?v=' + APP_VERSION,
                                controller: 'ReloginCtrl as vm',
                                backdrop: 'static'
                            });

                            modalInstance.result.then(
                                function () {
                                    doSave(vm.object);
                                },
                                function () {
                                    $uibModalInstance.close();
                                    $location.path('/logout');
                                }
                            );

                        }else {
                            var modalInstance = $uibModal.open({
                                templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                                controller: 'ModalCtrl as vm',
                                resolve: {
                                    title: function () {
                                        return response.data.type == 'Areanet\\PIM\\Classes\\Exceptions\\File\\FileExistsException' ? 'Datei überschreiben?' : 'Fehler beim Anlegen des Datensatzes';
                                    },
                                    body: function () {
                                        return response.data.message;
                                    },
                                    hideCancelButton: true
                                }
                            });

                            if (response.data.type == 'Areanet\\PIM\\Classes\\Exceptions\\File\\FileExistsException') {
                                modalInstance.result.then(
                                    function (doOverwrite) {
                                        if (doOverwrite) {
                                            FileService.overwrite(vm.object['id'], response.data.file_id).then(
                                                function successCallback(response) {
                                                },
                                                function errorCallback(response) {
                                                }
                                            );
                                            $uibModalInstance.close(vm.object);
                                        }
                                    },
                                    function () {
                                    }
                                );
                            }
                        }
                    }
                );
            }
        }

        function init(){

            if(object){
                vm.object = object;
            }

            angular.forEach(vm.schema.properties, function (config, key) {
                if (config.type == 'onejoin') {

                    vm.schemaOnejoin[config.tab] = schemaComplete[config.tab];
                    vm.schemaOnejoin[config.tab].properties.id['hide']  = true;
                    vm.schemaOnejoin[config.tab].properties.userCreated['hide'] = true;
                    vm.schemaOnejoin[config.tab].properties.users['hide']       = true;
                    vm.schemaOnejoin[config.tab].properties.groups['hide']      = true;
                    vm.object[key] = vm.object[key] ? vm.object[key] : {};
                }
            });


            if(!object || !object.id || !vm.permissions[entity].readable){
                vm.isLoading = false;
                cancel();
                return;
            }

            var data = {
                entity: entity,
                id: object.id
            };

            EntityService.single(data).then(
                function(response){
                    vm.object = response.data.data;
                    vm.isLoading = false;
                },
                function(data){

                    if(data.status == 401){
                        var modalInstance = $uibModal.open({
                            templateUrl: '/ui/default/views/partials/relogin.html?v=' + APP_VERSION,
                            controller: 'ReloginCtrl as vm',
                            backdrop: 'static'
                        });

                        modalInstance.result.then(
                            function () {
                                init();
                            },
                            function () {
                                $uibModalInstance.close();
                                $location.path('/logout');
                            }
                        );

                    }else {

                        var modalInstance = $uibModal.open({
                            templateUrl: '/ui/default/views/partials/modal.html?v=' + APP_VERSION,
                            controller: 'ModalCtrl as vm',
                            resolve: {
                                title: function () {
                                    return data.statusText;
                                },
                                body: function () {
                                    return data.data.message;
                                },
                                hideCancelButton: function () {
                                    return false;
                                }
                            }
                        });

                        modalInstance.result.then(
                            function (doDelete) {
                                $uibModalInstance.close();
                            },
                            function () {
                                $uibModalInstance.close();
                            }
                        );
                    }
                }
            );
        }

        function save(andClose) {
            if (vm.schema['settings']['isPush']) {

                for (var formName in vm.forms) {
                    if (!vm.forms[formName].$valid) {
                        return;
                    }
                }

                vm.isSubmit = true;

                var data = {
                    entity: 'PIM\\PushToken',
                    count: true
                };


                EntityService.list(data).then(
                    function successCallback(response) {
                        if (vm.object[vm.schema['settings']['pushObject']]) {
                            var res = vm.object[vm.schema['settings']['pushObject']].split("_");

                            var data = {
                                entity: res[0],
                                id: res[1]
                            };

                            EntityService.single(data).then(
                                function successCallback(response2) {
                                    var jsonData = response2.data.data;
                                    confirmPush(response.data.data, vm.object[vm.schema['settings']['pushTitle']], vm.object[$scope.schema['settings']['pushText']], "Link auf " + res[0] + ": " + jsonData["title"]);
                                },
                                function errorCallback(response) {
                                    confirmPush(response.data.data, vm.object[vm.schema['settings']['pushTitle']], vm.object[vm.schema['settings']['pushText']], "Link: --");
                                }
                            );
                        } else {
                            confirmPush(response.data.data, vm.object[vm.schema['settings']['pushTitle']], vm.object[vm.schema['settings']['pushText']], "Link: --");
                        }
                    },
                    function errorCallback(response) {

                    }
                );


            } else {
                doSave(andClose);
            }

        }

        function onChangeValue(key, mainKey, value){

            if(!mainKey) {
                objectDataToSave[key] = value;
            }else{
                if(!objectDataToSave[mainKey]){
                    objectDataToSave[mainKey] = {};
                }
                objectDataToSave[mainKey][key] = value;
            }
        }


    }

})();
