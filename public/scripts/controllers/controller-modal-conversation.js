
app.controller('ModalInstanceCtrl', ['$scope','$uibModalInstance','$http',function ($scope,$uibModalInstance,$http) {

    var $ctrl = this;
    $ctrl.defineVlrSin = 'Valor';
    limpar();

    function limpar() {
       $ctrl.errorMessage='';
       $ctrl.sucessoMessage='';
    }

    $ctrl.ok = function() {

        var valores = [];
        limpar();

        if($scope.parametro=='intencao' || $scope.parametro=='textoInt'){

            if($scope.parametro=='intencao'){
                angular.forEach($scope.items, function(its){
                    valores.push(its);
                });
            } else {
                angular.forEach($scope.itemOutros, function(its){
                    valores.push(its);
                });
            }

            if($scope.selection.length==0){
                $ctrl.errorMessage="Selecione na tabela algum registro.";
            }else{

                angular.forEach($scope.selection, function(sel){

                    angular.forEach(valores, function(item){

                        if(item.id==sel){

                            var config = {headers : {'Content-Type': 'application/json; charset=utf-8'}}
                            var data = {
                                intencao: $scope.selectedIntencao ,
                                message: item.msgUser
                            };

                            $http.post('/api/logconversation/intencao',JSON.stringify(data),config).then(

                                function(response){

                                    if(response.status==200){
                                        if(response.data.error){
                                            $ctrl.errorMessage=""+response.data.error;
                                        } else {
                                            $ctrl.sucessoMessage="Intenção associada com sucesso.";
                                            var data1 = { idLog:sel };
                                            $http.post('/api/logconversation/treinamento/status',JSON.stringify(data1),config)
                                            .then(function(response){
                                                console.log('Sucesso /api/logconversation/treinamento/status' + response);
                                                if(response.status==201){
                                                    $scope.buscar();
                                                }
                                            },
                                            function(response){
                                                console.log('Erro '+response);
                                            }
                                            );
                                        }
                                    }
                                },
                                function(erro){
                                    console.log('Erro ' + erro);
                                    $ctrl.errorMessage="Error" + erro;
                                }
                            );
                        }//fim do if
                    });
                });
            }//fim do else
        }

        if($scope.parametro=='entidade' || $scope.parametro=='textoEnt'){

            if($scope.parametro=='entidade'){
                angular.forEach($scope.items, function(its){
                    valores.push(its);
                });
            } else {
                angular.forEach($scope.itemOutros, function(its){
                    valores.push(its);
                });
            }

            if($scope.selection.length==0){
                $ctrl.errorMessage="Selecione na tabela algum registro.";

            } else {

                angular.forEach($scope.selection, function(sel){

                    angular.forEach(valores, function(item){

                        if(item.id == sel){

                            var config = {headers : {'Content-Type': 'application/json; charset=utf-8'}}

                            if($ctrl.defineVlrSin=='Sinonimo'){

                                var data = {
                                    entidade: $scope.selectedEntidade ,
                                    valor: $ctrl.selectedEntidadeValue,
                                    sinonimo: item.msgUser,
                                    idLog:sel
                                };
                                console.log(JSON.stringify(data));
                                $http.post('/api/logconversation/entidade/synonyms',JSON.stringify(data),config).then(

                                    function(response){

                                        if(response.status==200){

                                            if(response.data.error){
                                                $ctrl.errorMessage=""+response.data.error;

                                            }else {
                                                var data1 = { idLog:sel };
                                                $http.post('/api/logconversation/treinamento/status',JSON.stringify(data1),config).then(

                                                    function(response){
                                                        $ctrl.sucessoMessage="Sinonimo criado com sucesso.";
                                                        //console.log('Sucesso ' + JSON.stringify(response));

                                                        if(response.status==201){
                                                            $scope.buscar();
                                                        }
                                                    },
                                                    function(erro){
                                                        $ctrl.errorMessage = "Erro";
                                                        //console.log('Erro ' + JSON.stringify(erro));
                                                    }
                                                );
                                            }
                                        }
                                    },
                                    function(erro){
                                        console.log('Erro '+ erro);
                                        $ctrl.errorMessage="Error " + erro;
                                    }
                                );

                            } else {

                                var data = {
                                    entidade: $scope.selectedEntidade ,
                                    valor: item.msgUser,
                                    id:sel
                                };

                                $http.post('/api/logconversation/entidade',JSON.stringify(data),config).then(
                                    function(response){

                                        if(response.status==200){

                                            if(response.data.error){
                                                $ctrl.errorMessage=""+response.data.error;

                                            } else {

                                                var data1 = { idLog:sel };
                                                $http.post('/api/logconversation/treinamento/status',JSON.stringify(data1),config).then(
                                                    function(response){
                                                        $ctrl.sucessoMessage="Valor da Entidade criado com sucesso.";
                                                        if(response.status==201){
                                                            $scope.buscar();
                                                        }
                                                    },
                                                    function(error){
                                                        console.log('Erro ' + error);
                                                        $ctrl.errorMessage="Error " + error;
                                                     }
                                                );
                                            }
                                        }
                                    },
                                    function(erro){
                                        console.log('Erro '+erro);
                                        $ctrl.errorMessage="Error"+erro;
                                    }
                                );
                            }
                        }//fim do if
                    });
                });
            }//fim do else
        }
    };

    $ctrl.cancel = function() {
        $uibModalInstance.close(false);
        limpar();
    };

    if($scope.parametro=='entidade'){

        try {
            angular.forEach($scope.selection, function(sel){

                angular.forEach($scope.items, function(item){

                    if(item.id==sel){
                        $ctrl.mensagemEntidade=item.msgUser;
                        throw Error();//usado para simular o break, pra não iterar toda lista quando encontrado
                    }
                });
            });

        } catch(e) {
            //console.log(e);
        }

        limpar();

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

        try {
            angular.forEach($scope.selection, function(sel){

                angular.forEach($scope.items, function(item){

                    if(item.id==sel){
                        $ctrl.mensagemIntencao=item.msgUser;
                        throw Error();//usado para simular o break, pra não iterar toda lista quando encontrado
                    }
                });
            });

        } catch(e) {
            //console.log(e);
        }

        limpar();

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

    } else if ($scope.parametro=='textoEnt'){

        try {
            angular.forEach($scope.selection, function(sel){

                angular.forEach($scope.itemOutros, function(item){

                    if(item.id==sel){
                        $ctrl.mensagemEntidade=item.msgUser;
                        throw Error();//usado para simular o break, pra não iterar toda lista quando encontrado
                    }
                });
            });

        } catch(e) {
            //console.log(e);
        }

        limpar();

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

    } else if ($scope.parametro=='textoInt'){

        try {
            angular.forEach($scope.selection, function(sel){

                angular.forEach($scope.itemOutros, function(item){

                    if(item.id==sel){
                        $ctrl.mensagemIntencao=item.msgUser;
                        throw Error();//usado para simular o break, pra não iterar toda lista quando encontrado
                    }
                });
            });

        } catch(e) {
            //console.log(e);
        }

        limpar();

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

    //funcão quando modificado o select da entidade
    $ctrl.onchangeEntidade = function() {

        limpar();

        var entidade = $scope.selectedEntidade;
        if($ctrl.defineVlrSin == 'Sinonimo'){

            $http.get('/api/logconversation/entidade/value/'+entidade).then(
                function(response) {

                    var retorno = [];
                    var data = response.data;
                    var x=0;

                    angular.forEach(data.values, function(val){
                        var jsonParam = {}
                        jsonParam.id=++x;
                        jsonParam.descricao=val.value;
                        retorno.push(jsonParam);
                    });

                    $ctrl.EntidadeValues = retorno;
                },
                function(error){
                    console.log('Error - onchangeEntidade:' + JSON.stringify(error));
                }
            );
        }
    };

    //funcão quando modificado o radio definir valor/sinonimo
    $ctrl.onchangeRadioEnt = function() {

        limpar();

        if($ctrl.defineVlrSin=='Sinonimo'){
            $scope.selectedEntidade ="";
            $ctrl.selectedEntidadeValue="";
        }
    };

}]);