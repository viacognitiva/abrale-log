
var app = angular.module('MinhaApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

app.controller('myController', ['$scope', '$log', '$http','$filter','$uibModal', function($scope, $log, $http,$filter,$uibModal) {

            $scope.sortType     = 'name'; // set the default sort type
            $scope.sortReverse  = false;  // set the default sort order
            $scope.searchFish   = '';     // set the default search/filter term

            $scope.buscar = function() {
                $http.get('/api/logconversation').then(function(response) {
                   var retorno = [];

                   var data = response.data;
                   console.log('data '+data);
                    var pos = 0;

                    angular.forEach(data.logs, function(item){
                         var jsonParam = {};
                          angular.forEach(item.response.entities, function(ent){
                               jsonParam.entidade = ent.entity;
                               jsonParam.confidenceEntidade = (ent.confidence*100).toFixed(1)+" %";
                          });
                          angular.forEach(item.response.intents, function(int){
                             jsonParam.intencao = int.intent;
                             jsonParam.confidenceIntencao = (int.confidence*100).toFixed(1) +" %";
                          });

                          angular.forEach(item.response.input, function(text){
                                     if(text.length!=0)jsonParam.msgUser = text;
                           });

                          if(item.response.context.conversation_id.length!=0){
                            jsonParam.conversation_id = item.response.context.conversation_id;
                            jsonParam.data = $filter('date')(item.response_timestamp, "dd-MM-yyyy HH:mm:ss");
                            jsonParam.id=item.log_id;
                          }

                         if(!angular.equals(jsonParam, {})){
                            retorno.push(jsonParam);

                         }
                     });

                     if(retorno.length!=0){
                       retorno.push({selected: {}});
                     }

                      console.log('size data '+retorno.length);
                      $scope.items = retorno;
                      $scope.filteredItems = retorno;

                       if(retorno.length==0 ){
                            $scope.errorMessage='Registro não encontrado.';
                        } else {
                            $scope.errorMessage='';
                        }

                 });
            }

             $scope.sort_by = function(newSortingOrder) {
                   $scope.sortType = newSortingOrder; $scope.sortReverse = !$scope.sortReverse;
             };

             $scope.showDown = function(newSortingOrder) {
                  return $scope.sortType == newSortingOrder && !$scope.sortReverse
             };

             $scope.showUp = function(newSortingOrder) {
                  return $scope.sortType == newSortingOrder && $scope.sortReverse
             };

             $scope.selection = [];

             // Toggle selection
             $scope.toggleSelection = function (id) {
                   var idx = $scope.selection.indexOf(id);
                   // Is currently selected
                   if (idx > -1) {
                     $scope.selection.splice(idx, 1);
                   } // Is newly selected
                   else {
                     $scope.selection.push(id);
                   }
             };

            $scope.aplicar = function () {
                 angular.forEach($scope.selection, function(sel){
                      console.log('checksboxx'+sel)
                  });
             };


            $scope.name = "Wallace";
            var $ctrl = this;
            $scope.modalEntidade = function(size,param) {
                     $scope.parametro=param;
                     $uibModal.open({
                         scope: $scope,
                         animation: true,
                         controllerAs: '$ctrl',
                         // Esse vai exibir o nome do scope atual
                         templateUrl: 'myModalEntidade.html',
                         controller: 'ModalInstanceCtrl',
                         windowClass: 'custom-dialog',
                         backdrop:false,
                         size: size,
                     });
             };


             $scope.modalIntencao = function(size,param) {
                               $scope.parametro=param;
                                  $uibModal.open({
                                      scope: $scope,
                                      animation: true,
                                      controllerAs: '$ctrl',
                                      // Esse vai exibir o nome do scope atual
                                      templateUrl: 'myModalIntencao.html',
                                      controller: 'ModalInstanceCtrl',
                                      windowClass: 'custom-dialog',
                                      backdrop:false,
                                      size: size,
                                  });
              };



}]);

app.controller('ModalInstanceCtrl', ['$scope','$uibModalInstance','$http',function ($scope, $uibModalInstance,$http) {
         console.log('ModalInstanceCtrl');
        var $ctrl = this;
        $ctrl.ok = function() {
                  alert('OK');
                //$uibModalInstance.close($scope.selected.item);
            };

        $ctrl.cancel = function() {
            // $uibModalInstance.dismiss('cancel');
             $uibModalInstance.close(false);
        };

        console.log('$scope.parametro'+$scope.parametro)

        if($scope.parametro=='entidade'){
            $http.get('/api/logconversation/entities').then(function(response) {
                var retorno = [];
                var data = response.data;
                var x=0;
                angular.forEach(data.entities, function(ent){
                   var jsonParam = {}
                   jsonParam.id=++x;
                   jsonParam.descricao=ent.entity;
                   retorno.push(jsonParam);
                });

                $ctrl.entidades = retorno;

            });
       } else if ($scope.parametro=='intencao'){
             $http.get('/api/logconversation/intencoes').then(function(response) {
                            var retorno = [];
                            var data = response.data;
                            var x=0;
                            angular.forEach(data.intents, function(int){
                               var jsonParam = {}
                               jsonParam.id=++x;
                               jsonParam.descricao=int.intent;
                               retorno.push(jsonParam);
                            });

                            $ctrl.intencoes = retorno;

               });
       }


        /*$ctrl.cars = [
            {model : "Ford Mustang", color : "red"},
            {model : "Fiat 500", color : "white"},
            {model : "Volvo XC90", color : "black"}
        ];*/
}]);

