'use strict'

angular.module('app.company').controller('PropertyProductEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.product = {};



    var productId = $stateParams.productId;
    var companyId = $stateParams.companyId;
    if (productId) {
        CompanyService.getPropertyProduct(productId)
            .then(function (product) {
                vm.product = product;
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
        CompanyService.savePropertyProduct(vm.product)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "财险费率已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                if (vm.back) {
                    console.log($stateParams.previousState);
                    console.log(vm.product.company);
                    $state.go($stateParams.previousState, { companyId: vm.product.company._id });
                }
            }, function (err) { });
    };



}); 

