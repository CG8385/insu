'use strict'

angular.module('app.company').controller('LifeProductEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.product = {};

    var productId = $stateParams.productId;
    var companyId = $stateParams.companyId;
    if (productId) {
        CompanyService.getLifeProduct(productId)
            .then(function (product) {
                vm.product = product;
                if(vm.product.payment_rate.length ==0){
                    for(var i=0;i<30;i++){
                        vm.product.payment_rate.push({'income_rate':0,'direct_payment_rate':0,'indirect_payment_rate':0,});
                    }
                }
            });
    }else if(companyId) {
        CompanyService.getCompany(companyId)
            .then(function(company){
                vm.product.company = company;
            });
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.submit = function () {
        CompanyService.saveLifeProduct(vm.product)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "寿险费率已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                if (vm.back) {
                    $state.go($stateParams.previousState, { companyId: vm.product.company._id });
                }
            }, function (err) { });
    };



});

