'use strict'

angular.module('app.life-policy').controller('LifePolicyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, LifePolicyService, ngDialog) {
    var vm = this;
    vm.policy = {};
    vm.applicant = {};
    vm.clientInfo = {};
    //vm.zy_clientInfo = {};
    vm.managerInfo = {};
    vm.directorInfo = {};
    vm.sellerInfo = $rootScope.user;
    vm.level1Companies = [];
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];
    vm.products = [];

    LifePolicyService.getLevel1Companies()
    .then(function (level1Companies) {
        vm.level1Companies = level1Companies;
    })

    vm.loadLevel2Companies = function () {
        if (!vm.policy.level1_company) {
            vm.level2Companies = [];
        } else {
            LifePolicyService.getSubCompanies(vm.policy.level1_company)
                .then(function (level2Companies) {
                    vm.level2Companies = level2Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel3Companies = function () {
        if (!vm.policy.level2_company) {
            vm.level3Companies = [];
        } else {
            LifePolicyService.getSubCompanies(vm.policy.level2_company)
                .then(function (level3Companies) {
                    vm.level3Companies = level3Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Companies = function () {
        if (!vm.policy.level3_company) {
            vm.level4Companies = [];
        } else {
            LifePolicyService.getSubCompanies(vm.policy.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    vm.level1Changed = function () {
        vm.resetProduct();
        if (!vm.policy.level1_company) {
            vm.company = undefined;
        } else {
            vm.company = vm.level1Companies.find(c => c._id === vm.policy.level1_company);
        }
        vm.loadLevel2Companies();
        vm.loadProducts();
    }

    vm.level2Changed = function () {
        vm.resetProduct();
        if (!vm.policy.level2_company) {
            vm.company = vm.level1Companies.find(c => c._id === vm.policy.level1_company);
        } else {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
        }
        vm.loadLevel3Companies();
        vm.loadProducts();
    }

    vm.level3Changed = function () {
        vm.resetProduct();
        if (!vm.policy.level3_company) {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
        } else {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        }
        vm.loadLevel4Companies();
        vm.loadProducts();
    }

    vm.level4Changed = function () {
        vm.resetProduct();
        if (!vm.policy.level4_company) {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        } else {
            vm.company = vm.level4Companies.find(c => c._id === vm.policy.level4_company);
        }
        vm.loadProducts();
    }

    vm.resetProduct = function () {
        vm.policy.product = undefined;
    }

    vm.loadProducts = function () {
        var companyId = vm.policy.level4_company ? vm.policy.level4_company : vm.policy.level3_company ? vm.policy.level3_company : vm.policy.level2_company;
        if (companyId) {
            LifePolicyService.getProducts(companyId)
                .then(function (products) {
                    vm.products = products;
                })
        } else {
            vm.products = [];
        }
    }

    vm.productChanged = function (subPolicy) {
        for(var i=0;i<vm.products.length;i++){
            if(vm.products[i]._id == subPolicy.product){
                subPolicy.direct_payment_rate = vm.products[i].direct_payment_rate;
                vm.updateFee(subPolicy);
                vm.updateZYPayment();
                break;
            }
        }
    }

    LifePolicyService.getClients()
        .then(function (clients) {
            vm.clients = clients;
        })
    LifePolicyService.getManagers()
        .then(function (managers) {
            vm.managers = managers;
        })
    // LifePolicyService.getCompanies()
    //     .then(function (companies) {
    //         vm.companies = companies;
    //     })
    // LifePolicyService.getPolicyNames()
    //     .then(function (policyNames) {
    //         vm.policyNames = policyNames;
    //     })
    LifePolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    vm.editable = false;

    vm.addSubPolicy = function () {
        vm.policy.sub_policies.push({ 'insurant': '', 'product': '','year': '', 'fee': undefined, 'direct_payment_rate': undefined, 'direct_payment': undefined,'class_payment_rate': undefined, 'class_payment': undefined  });
    };

    vm.removeSubPolicy = function () {
        vm.policy.sub_policies.pop();
    };

    vm.addZyInfo = function () {
        vm.policy.zy_infos.push({ 'zy_rate': undefined, 'zy_payment': undefined, 'zy_client': undefined,'zy_clientInfo':undefined  });
    };

    vm.removeZyInfo = function () {
        vm.policy.zy_infos.pop();
    };

    vm.addInsurant = function () {
        vm.policy.insurants.push({ 'name': '', 'address': '', 'phone': '', 'identity': '', 'sex': '', 'birthday': undefined });
    };
    vm.removeInsurant = function () {
        vm.policy.insurants.pop();
    };

    vm.otherPhotoChanged = function (files) {
        vm.uploadOtherPhoto(files[0]);
    };

    vm.uploadOtherPhoto = function (file) {
        LifePolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.other_photo = fileName;
                if (vm.policy._id) {
                    LifePolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.policyPhotoChanged = function (files) {
        vm.uploadPolicyPhoto(files[0]);
    };

    vm.uploadPolicyPhoto = function (file) {
        LifePolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.policy_photo = fileName;
                if (vm.policy._id) {
                    LifePolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.clientInfoPhotoChanged = function (files) {
        vm.uploadClientInfoPhoto(files[0]);
    };

    vm.uploadClientInfoPhoto = function (file) {
        LifePolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.client_info_photo = fileName;
                if (vm.policy._id) {
                    LifePolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.reviewPhoto = function (fileName, photoOnly) {
        ngDialog.open({
            template: 'app/policy/views/photo-review.html',
            className: 'ngdialog-theme-default',
            controller: 'PhotoReviewController as vm',
            resolve: {
                data: function () {
                    var val = {};
                    val.fileName = fileName;
                    val.policy = vm.policy;
                    val.photoOnly = photoOnly;
                    return val;
                }
            }
        });
    }

    vm.getAttachmentUrl = function (fileName) {
        return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + fileName;
    }


    vm.shouldShowEditButton = function (){
        if(vm.editable) return false;
        if(vm.policy.policy_status == "待审核"){
            return $rootScope.user.userrole.lifePolicy_to_be_reviewed.edit;
        }else if(vm.policy.policy_status == "待支付"){
            return $rootScope.user.userrole.lifePolicy_to_be_paid.edit;
        }else if(vm.policy.policy_status == "已支付"){
            return $rootScope.user.userrole.lifePolicy_paid.edit;
        }else if(vm.policy.policy_status == "被驳回"){
            return $rootScope.user.userrole.lifePolicy_rejected.edit;
        }
    }

    if ($state.is("app.life-policy.new")) {
        vm.policy.sub_policies = [];
        vm.policy.zy_infos = [];
        vm.policy.insurants = [];
        vm.addSubPolicy();
        vm.addZyInfo();
        vm.addInsurant();
        vm.editable = true;
    }



    var policyId = $stateParams.policyId;
    if (policyId) {
        LifePolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                vm.sellerInfo = policy.seller;
                //vm.zy_clientInfo = policy.zy_client;
                //vm.zy_infos = policy.zy_infos;
                vm.managerInfo = policy.manager;
                vm.directorInfo = policy.director;

                policy.client = policy.client._id;
                policy.seller = policy.seller._id;
                //policy.zy_client = policy.zy_client._id;
                for (var i = 0; i < policy.zy_infos.length; i++){
                    policy.zy_infos[i].zy_clientInfo = policy.zy_infos[i].zy_client;
                    policy.zy_infos[i].zy_client = policy.zy_infos[i].zy_clientInfo._id;
                }
                for(var i = 0; i < policy.sub_policies.length; i++){
                    policy.sub_policies[i].product = policy.sub_policies[i].product._id;
                }
                policy.client = policy.client._id;
                policy.manager = policy.manager._id;
                policy.director = policy.director._id;
                vm.loadLevel2Companies();
                vm.loadLevel3Companies();
                vm.loadLevel4Companies();
                vm.loadProducts();
            });
    }

    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }




    vm.submit = function () {
        vm.policy.client = vm.clientInfo._id;
        //if (vm.zy_clientInfo){
        //    vm.policy.zy_client = vm.zy_clientInfo._id;
        //}
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            vm.policy.zy_infos[i].zy_client = vm.policy.zy_infos[i].zy_clientInfo._id;
        }
        if (vm.managerInfo){
            vm.policy.manager = vm.managerInfo._id;
        }
        if (vm.directorInfo){
            vm.policy.director = vm.directorInfo._id;
        }
        LifePolicyService.savePolicy(vm.policy)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.policy = {};
                vm.applicant = {};
                vm.clientInfo = {};
                //vm.zy_clientInfo = {};
                vm.managerInfo = {};
                vm.directorInfo = {};
                vm.policy.sub_policies = [];
                vm.policy.zy_infos = [];
                vm.policy.insurants = [];
                vm.addSubPolicy();
                vm.addZyInfo();
                vm.addInsurant();
                if (vm.back) {
                    $state.go("app.life-policy.to-be-paid");
                }
            }, function (err) { });
    };

    vm.pay = function () {
        vm.policy.client = vm.clientInfo._id;
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            vm.policy.zy_infos[i].zy_client = vm.policy.zy_infos[i].zy_clientInfo._id;
        }
        if (vm.managerInfo){
            vm.policy.manager = vm.managerInfo._id;
        }
        if (vm.directorInfo){
            vm.policy.director = vm.directorInfo._id;
        }
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认已支付该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "已支付";
                vm.policy.paid_at = Date.now();
                LifePolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为已支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }

        });

    };
    vm.approve = function () {
        vm.policy.client = vm.clientInfo._id;
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            vm.policy.zy_infos[i].zy_client = vm.policy.zy_infos[i].zy_clientInfo._id;
        }
        if (vm.managerInfo){
            vm.policy.manager = vm.managerInfo._id;
        }
        if (vm.directorInfo){
            vm.policy.director = vm.directorInfo._id;
        }
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认要批准该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "待支付";
                LifePolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为待支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        $state.go("app.life-policy.to-be-reviewed");
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };

    vm.reject = function () {
        vm.policy.client = vm.clientInfo._id;
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            vm.policy.zy_infos[i].zy_client = vm.policy.zy_infos[i].zy_clientInfo._id;
        }
        if (vm.managerInfo){
            vm.policy.manager = vm.managerInfo._id;
        }
        if (vm.directorInfo){
            vm.policy.director = vm.directorInfo._id;
        }
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认要驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "被驳回";
                LifePolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为被驳回",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        $state.go("app.life-policy.to-be-reviewed");
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };
    vm.updateFee = function (subPolicy) {
        if(subPolicy.fee == undefined) return;
        subPolicy.direct_payment = subPolicy.fee * subPolicy.direct_payment_rate / 100;
        subPolicy.class_payment = subPolicy.fee * subPolicy.class_payment_rate / 100;
        vm.policy.payment_total = 0;
        vm.policy.direct_payment_total = 0;
        for (var i = 0; i < vm.policy.sub_policies.length; i++) {
            vm.policy.payment_total += vm.policy.sub_policies[i].direct_payment;
            vm.policy.payment_total += vm.policy.sub_policies[i].class_payment;
            vm.policy.direct_payment_total += vm.policy.sub_policies[i].direct_payment;
        }
        vm.policy.taxed_payment_total = vm.policy.payment_total / 1.066;
        vm.policy.taxed_direct_payment_total = vm.policy.direct_payment_total / 1.066;
        vm.policy.zy_payment = 0;
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            if (vm.policy.zy_infos[i].zy_rate && vm.policy.taxed_direct_payment_total) {
                vm.policy.zy_payment += vm.policy.taxed_direct_payment_total * vm.policy.zy_infos[i].zy_rate / 100;
            }
        }
        vm.policy.zy_payment = vm.policy.zy_payment.toFixed(2);
        vm.policy.taxed_payment_total = vm.policy.taxed_payment_total.toFixed(2);      
    }

    vm.updateZYPayment = function () {
        vm.policy.zy_payment = 0;
        for (var i = 0; i < vm.policy.zy_infos.length; i++){
            if (vm.policy.zy_infos[i].zy_rate && vm.policy.taxed_direct_payment_total) {
                vm.policy.zy_infos[i].zy_payment = parseFloat(vm.policy.taxed_direct_payment_total) * vm.policy.zy_infos[i].zy_rate / 100;
                vm.policy.zy_payment += vm.policy.zy_infos[i].zy_payment;
                vm.policy.zy_infos[i].zy_payment = vm.policy.zy_infos[i].zy_payment.toFixed(2);
            }
        }
        vm.policy.zy_payment = vm.policy.zy_payment.toFixed(2);
    }
});

angular.module('app.life-policy').directive('upper', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.toUpperCase();
                var re = /[^/u4e00-/u9fa5]/;
                if (re.test(inputValue) && capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});

angular.module('app.life-policy').directive('price', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var removeIllegalInput = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                //    var output = inputValue.replace(/[^(\d|\\.)]/g,'') 
           
                //先把非数字的都替换掉，除了数字和.
                var output = inputValue.replace(/[^\d.]/g, "");
                //必须保证第一个为数字而不是.
                output = output.replace(/^\./g, "");
                //保证只有出现一个.而没有多个.
                output = output.replace(/\.{2,}/g, ".");
                //保证.只出现一次，而不能出现两次以上
                output = output.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                //只允许输入两位小数
                output = output.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');

                if (output !== inputValue) {
                    modelCtrl.$setViewValue(output);
                    modelCtrl.$render();
                }
                return output;
            }
            modelCtrl.$parsers.push(removeIllegalInput);
            removeIllegalInput(scope[attrs.ngModel]);
        }
    };
});

angular.module('app.life-policy').directive('dateFormat', ['$filter',function($filter) {
    var dateFilter = $filter('date');
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function formatter(value) {
                return dateFilter(value, 'yyyy-MM-dd'); //format
            }

            function parser() {
                return ctrl.$modelValue;
            }

            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);

        }
    };
}]);

angular.module('app.life-policy').filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    if (/^[\u4e00-\u9fa5]+$/.test(text)) {
                        if (item['name'].indexOf(text) == 0) {
                            itemMatches = true;
                            break;
                        }
                    } else {
                        var text = props[prop].toUpperCase();
                        var pylist = item['py'];

                        for (var j = 0; j < pylist.length; j++) {
                            if (pylist[j].indexOf(text) == 0) {
                                itemMatches = true;
                                break;
                            }
                        }
                        if (itemMatches) {
                            break;
                        }
                    }


                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});