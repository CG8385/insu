'use strict'

angular.module('app.property-policy').controller('PropertyPolicyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, PropertyPolicyService, ngDialog) {
    var vm = this;
    var defaultPolicy = {
        payment_addition: 0,
        payment_substraction: 0
    }
    vm.policy = defaultPolicy;
    vm.clientInfo = {};
    vm.sellerInfo = $rootScope.user;
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];
    vm.products = [];
    vm.ratesBasedString = "";
    vm.company = {};

    //Infinite Scroll Magic
    vm.infiniteScroll = {};
    vm.infiniteScroll.numToAdd = 20;
    vm.infiniteScroll.currentItems = 20;

    vm.resetInfScroll = function () {
        vm.infiniteScroll.currentItems = vm.infiniteScroll.numToAdd;
    };
    vm.addMoreItems = function () {
        vm.infiniteScroll.currentItems += vm.infiniteScroll.numToAdd;
    };


    PropertyPolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;
        })


    vm.loadLevel3Companies = function () {
        if (!vm.policy.level2_company) {
            vm.level3Companies = [];
        } else {
            PropertyPolicyService.getSubCompanies(vm.policy.level2_company)
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
            PropertyPolicyService.getSubCompanies(vm.policy.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    vm.resetProduct = function () {
        vm.policy.product = undefined;
        vm.policy.income_rate = null;
        vm.policy.payment_rate = null;
        vm.updateFee();
    }

    vm.applyProduct = function (product) {
        vm.policy.income_rate = product.income_rate ? product.income_rate  : 0;
        vm.policy.payment_rate = product.payment_rate ? product.payment_rate  : 0;
        vm.updateFee();
    }

    vm.loadProducts = function () {
        var companyId = vm.policy.level4_company ? vm.policy.level4_company : vm.policy.level3_company ? vm.policy.level3_company : vm.policy.level2_company;
        if (companyId) {
            PropertyPolicyService.getProducts(companyId)
                .then(function (products) {
                    vm.products = products;
                })
        } else {
            vm.products = [];
        }

    }

    vm.productChanged = function () {
        if (!vm.policy.product) {
            vm.resetProduct();
        } else {
            var product = vm.products.filter(r => r._id == vm.policy.product)[0];
            vm.applyProduct(product);
        }
    }

    vm.level2Changed = function () {
        vm.resetProduct();
        if (!vm.policy.level2_company) {
            vm.policy.level1_company = undefined;
            vm.company = {};
        } else {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
            vm.policy.level1_company = vm.company.catogory._id;
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


    vm.shouldShowEditButton = function (){
        if(vm.editable) return false;
        if(vm.policy.policy_status == "待审核"){
            return $rootScope.user.userrole.policy_to_be_reviewed.edit;
        }else if(vm.policy.policy_status == "待支付"){
            return $rootScope.user.userrole.policy_to_be_paid.edit;
        }else if(vm.policy.policy_status == "已支付"){
            return $rootScope.user.userrole.policy_paid.edit;
        }else if(vm.policy.policy_status == "被驳回"){
            return $rootScope.user.userrole.policy_rejected.edit;
        }
    }

    vm.shouldShowFinanceSection = function () {
        var ret = false;
        if(vm.policy.policy_status == "待审核"){
            ret = $rootScope.user.userrole.property_policy_to_be_reviewed.aprove;
        }else if(["待支付","已支付"].indexOf(vm.policy.policy_status) != -1){
            ret = $rootScope.user.userrole.property_policy_to_be_paid.pay;
        }
        return ret;
    }

    PropertyPolicyService.getIndividualClients()
        .then(function (clients) {
            vm.clients = clients;
        })


    vm.editable = false;
    if ($state.is("app.property-policy.new")) {
        vm.editable = true;
    }

    vm.getRatesBasedString = function () {
        if (vm.policy.rates_based_on_taxed) {
            return "基于不含税保费";
        } else {
            return "基于含税保费";
        }
    }



    var policyId = $stateParams.policyId;
    if (policyId) {
        PropertyPolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                vm.sellerInfo = policy.seller;
                if (policy.client) {
                    policy.client = policy.client._id;
                }
                policy.seller = policy.seller._id;
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

    vm.checkProductRates = function () {
        if (!vm.policy.product) {
            return;
        }
        var product = vm.policy.product;
        var policy = vm.policy;
        policy.has_warning = false;
        if (policy.total_fee > 0) {
            if (product.income_rate < policy.income_rate) {
                policy.has_warning = true;
                return;
            }
            if (product.payment_rate > policy.payment_rate) {
                policy.has_warning = true;
                return;
            }
        }
    }

    vm.submit = function () {
        vm.checkProductRates();
        if (!vm.policy.organization) {
            // vm.policy.client = vm.clientInfo._id;
            // vm.policy.level2_org = vm.clientInfo.level2_org;
            // vm.policy.level3_org = vm.clientInfo.level3_org;
            // vm.policy.level4_org = vm.clientInfo.level4_org;
            // vm.policy.level5_org = vm.clientInfo.level5_org;
            // vm.policy.organization = vm.clientInfo.level5_org;
            vm.policy.seller = vm.sellerInfo;
            vm.policy.level1_org = vm.sellerInfo.level1_org;
            vm.policy.level2_org = vm.sellerInfo.level2_org;
            vm.policy.level3_org = vm.sellerInfo.level3_org;
            vm.policy.level4_org = vm.sellerInfo.level4_org;
            vm.policy.level5_org = vm.sellerInfo.level5_org;
            vm.policy.organization = vm.sellerInfo.org._id;
        }
        if (vm.policy.policy_status == "被驳回") {
            vm.policy.policy_status = "待审核";
        }
        PropertyPolicyService.savePolicy(vm.policy)
            .then(function (data) {
                if (data.duplicate) {
                    $.SmartMessageBox({
                        title: "发现单号重复保单",
                        content: "系统中已有相同保单号，重复提交？",
                        buttons: '[取消][确认]'
                    }, function (ButtonPressed) {
                        if (ButtonPressed === "确认") {
                            vm.policy.ignore_duplicate = true;
                            PropertyPolicyService.savePolicy(vm.policy)
                                .then(function () {
                                    $.smallBox({
                                        title: "服务器确认信息",
                                        content: "保单已成功保存",
                                        color: "#739E73",
                                        iconSmall: "fa fa-check",
                                        timeout: 5000
                                    });
                                    var old = vm.policy;

                                    vm.policy = {
                                        company: old.company,
                                        level1_company: old.level1_company,
                                        level2_company: old.level2_company,
                                        level3_company: old.level3_company,
                                        level4_company: old.level4_company
                                    };
                                    if (vm.back) {
                                        $state.go("app.property-policy.to-be-reviewed");
                                    }
                                })
                        }
                        if (ButtonPressed === "取消") {

                        }

                    });
                } else {
                    $.smallBox({
                        title: "服务器确认信息",
                        content: "保单已成功保存",
                        color: "#739E73",
                        iconSmall: "fa fa-check",
                        timeout: 5000
                    });
                    var old = vm.policy;
                    vm.policy = {
                        company: old.company,
                        level1_company: old.level1_company,
                        level2_company: old.level2_company,
                        level3_company: old.level3_company,
                        level4_company: old.level4_company,
                        payment_addition: 0,
                        payment_substraction: 0
                    };
                    if (vm.back) {
                        $state.go("app.property-policy.to-be-reviewed");
                    }
                }
            }, function (err) { });
    };

    vm.pay = function () {
        vm.checkProductRates();
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认已支付该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "已支付";
                vm.policy.paid_at = Date.now();
                PropertyPolicyService.savePolicy(vm.policy)
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
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认要批准该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "待支付";
                PropertyPolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为待支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        var ids = $stateParams.ids;
                        if (ids && ids.length > 0) {
                            var id = ids.shift();
                            $state.go("app.property-policy.approve", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.property-policy.to-be-reviewed");
                        }

                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };

    vm.reject = function () {
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认要驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "被驳回";
                PropertyPolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为被驳回",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        var ids = $stateParams.ids;
                        if (ids && ids.length > 0) {
                            var id = ids.shift();
                            $state.go("app.property-policy.approve", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.property-policy.to-be-reviewed");
                        }

                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };

    function RoundNum(num, length) { 
        var number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
        return number;
    }

    vm.updateFee = function () {
        vm.policy.total_fee_taxed = vm.policy.total_fee / 1.06;
        if (vm.policy.total_fee_taxed) {
            vm.policy.total_fee_taxed = RoundNum(vm.policy.total_fee_taxed, 2);
        }

        var divideBy = vm.policy.rates_based_on_taxed ? 106 : 100;

        vm.policy.income = vm.policy.total_fee * vm.policy.income_rate / divideBy;
        if (vm.policy.income) {
            vm.policy.income = RoundNum(vm.policy.income, 2);
            vm.policy.total_income = vm.policy.income;
        }
        
        vm.policy.payment = vm.policy.total_fee * vm.policy.payment_rate / divideBy;

        if (vm.policy.payment) {
            vm.policy.payment = RoundNum(vm.policy.payment, 2);
        }

        vm.policy.total_income = vm.policy.income;
        vm.policy.total_payment = vm.policy.payment;

        if (vm.policy.payment_addition) {
            vm.policy.total_payment = parseFloat(vm.policy.total_payment) + parseFloat(vm.policy.payment_addition);
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
            vm.policy.total_income = parseFloat(vm.policy.total_income) + parseFloat(vm.policy.payment_addition);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }
        if (vm.policy.payment_substraction) {
            vm.policy.total_payment = parseFloat(vm.policy.total_payment) - parseFloat(vm.policy.payment_substraction);
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
            vm.policy.total_income = parseFloat(vm.policy.total_income) -  parseFloat(vm.policy.payment_substraction);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }

    }

    vm.signPhotoChanged = function (files) {
        vm.uploadSignPhoto(files[0]);
    };

    vm.uploadSignPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.sign_photo = fileName;
                if (vm.policy._id) {
                    PropertyPolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.otherPhotoChanged = function (files) {
        vm.uploadOtherPhoto(files[0]);
    };

    vm.uploadOtherPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.other_photo = fileName;
                if (vm.policy._id) {
                    PropertyPolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.identityPhotoChanged = function (files) {
        vm.uploadIdentityPhoto(files[0]);
    };

    vm.uploadIdentityPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.identity_photo = fileName;
                if (vm.policy._id) {
                    PropertyPolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.agreementPhotoChanged = function (files) {
        vm.uploadAgreementPhoto(files[0]);
    };

    vm.uploadAgreementPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.agreement_photo = fileName;
                if (vm.policy._id) {
                    PropertyPolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.policyPhotoChanged = function (files) {
        vm.uploadPolicyPhoto(files[0]);
    };

    vm.uploadPolicyPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.policy_photo = fileName;
                if (vm.policy._id) {
                    PropertyPolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.reviewPhoto = function (fileName) {
        ngDialog.open({
            template: 'app/property-policy/views/photo-review.html',
            className: 'ngdialog-theme-default',
            controller: 'PhotoReviewController1 as vm',
            resolve: {
                data: function () {
                    var val = {};
                    val.fileName = fileName;
                    val.policy = vm.policy;
                    return val;
                }
            }
        });
    }

    vm.getAttachmentUrl = function (fileName) {
        return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + fileName;
    }

});

angular.module('app.property-policy').directive('upper', function () {
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

angular.module('app.property-policy').directive('price', function () {
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


angular.module('app.property-policy').directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
    return {
        link: function (scope, elem, attrs) {
            var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
            $window = angular.element($window);
            elem.css('overflow-y', 'auto');
            elem.css('overflow-x', 'hidden');
            elem.css('height', 'inherit');
            scrollDistance = 0;
            if (attrs.infiniteScrollDistance != null) {
                scope.$watch(attrs.infiniteScrollDistance, function (value) {
                    return (scrollDistance = parseInt(value, 10));
                });
            }
            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.infiniteScrollDisabled != null) {
                scope.$watch(attrs.infiniteScrollDisabled, function (value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }
            $rootScope.$on('refreshStart', function () {
                elem.animate({ scrollTop: "0" });
            });
            handler = function () {
                var container, elementBottom, remaining, shouldScroll, containerBottom;
                container = $(elem.children()[0]);
                elementBottom = elem.offset().top + elem.height();
                containerBottom = container.offset().top + container.height();
                remaining = containerBottom - elementBottom;
                shouldScroll = remaining <= elem.height() * scrollDistance;
                if (shouldScroll && scrollEnabled) {
                    if ($rootScope.$$phase) {
                        return scope.$eval(attrs.infiniteScroll);
                    } else {
                        return scope.$apply(attrs.infiniteScroll);
                    }
                } else if (shouldScroll) {
                    return (checkWhenEnabled = true);
                }
            };
            elem.on('scroll', handler);
            scope.$on('$destroy', function () {
                return $window.off('scroll', handler);
            });
            return $timeout((function () {
                if (attrs.infiniteScrollImmediateCheck) {
                    if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                        return handler();
                    }
                } else {
                    return handler();
                }
            }), 0);
        }
    };
}
]);