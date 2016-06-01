(function() {
    'use strict';

    angular
        .module('app')
        .directive('pimDecimal', pimDecimal);


    function pimDecimal(){
        return {
            restrict: 'E',
            scope: {
                key: '=', config: '=', value: '=', isValid: '=', isSubmit: '=', onChangeCallback: '&'
            },
            templateUrl: function(){
                return 'types/decimal/decimal.html'
            },
            link: function(scope, element, attrs){
                if(scope.value === undefined && scope.config.default != null){
                    scope.value = parseFloat(scope.config.default).toFixed(2);
                }

                scope.value = scope.value ? scope.value.replace('.', ',') : null;

                scope.$watch('value',function(data){
                    scope.onChangeCallback({key: scope.key, value: scope.value ? scope.value.replace(',', '.') : null});
                },true)
            }
        }
    }

})();