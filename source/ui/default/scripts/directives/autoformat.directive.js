(function() {
    'use strict';

    angular
        .module('app')
        .directive('pimAutoformat', pimAutoformat);

    function pimAutoformat($filter, localStorageService){
        return {
            restrict: 'AEC',
            scope: { object: '=', schema: '=', long: '=' },
            link: function(scope, element, attrs){
                
                var property = attrs.property;
                var mappedBy = attrs.mappedBy;
                var debug = attrs.debug;
                var long     = attrs.long ? attrs.long : false;
                var type     = scope.schema.properties[property] ? scope.schema.properties[property].type : null;

                //if(debug) console.log("MAPPEDBY 1: " + property + " = " + mappedBy);

                scope.$watch('object', function() {
                    
                    if(scope.object == null || type == null){
                        return;
                    }
                    //if(debug) console.log("MAPPEDBY 2: " + property + " = " + mappedBy);
                    var object = scope.object;
                    //if(mappedBy){
                    //    object = scope.object[mappedBy];
                    //}

                    switch(type) {
                        case 'datetime':
                            //var value = $filter('date')(scope.object[property], 'dd.MM.yyyy');
                            var value = long ? object[property].LOCAL_TIME : object[property].LOCAL;
                            element.text(value);
                            break;
                        case 'boolean':
                            element.text(object[property] ? 'Ja' : 'Nein');
                            break;
                        case 'join':
                            var fullEntity    = scope.schema.properties[property].accept.split('\\');
                            var entity        = fullEntity[(fullEntity.length - 1)];
                            if(fullEntity[0] == 'Areanet'){
                                entity = 'PIM\\' + entity;
                            }
                            var joinSchema    = localStorageService.get('schema')[entity];

                            if(object[property]){
                                var firstProperty = joinSchema.list[Object.keys(joinSchema.list)[0]];
                            
                                element.text(object[property][firstProperty]);
                            }
                            break;
                        case 'select':
                            var value = object[property];
                            var options = scope.schema.properties[property].options;
                            //console.log(options);
                            for(var i = 0; i < options.length; i++){
                                if(options[i].id == value){
                                    element.text(options[i].name);
                                    return;
                                }
                            }
                            element.text(value);
                            break;
                        default:
                            var content = strip_tags(object[property]);
                            if(scope.schema.properties[property].listShorten){
                                if(content.length > scope.schema.properties[property].listShorten){
                                    element.text(content.substr(0, scope.schema.properties[property].listShorten) + '...');
                                }else{
                                    element.text(content);
                                }

                            }else{
                                element.text(content);
                            }

                            break;
                    }

                    switch(property) {
                        case 'user':
                            var alias = object[property] ? object[property].alias : 'admin';
                            element.text(alias);
                            break;
                        default:
                            break;
                    }
                })

                function strip_tags(input, allowed){
                    if (!(typeof input === 'string' || input instanceof String)){
                        return input;
                    }

                    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')

                    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
                    var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

                    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
                    })
                }




            }
        }
    }
})();