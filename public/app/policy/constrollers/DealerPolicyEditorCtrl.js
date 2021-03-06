'use strict'

angular.module('app.policy').controller('DealerPolicyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, DealerPolicyService, ngDialog) {
    var vm = this;
    vm.policy = {};
    vm.clientInfo = {};
    vm.dealerInfo = {};
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];
    vm.rules = [];
    vm.ratesBasedString = "";
    vm.company = {};
    vm.dealers = [];
    vm.clients = [];

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

    DealerPolicyService.getOrgClients()
    .then(function (dealers) {
        vm.dealers = dealers;
    })




    DealerPolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;
        })
    


    vm.loadLevel3Companies = function () {
        if (!vm.policy.level2_company) {
            vm.level3Companies = [];
        } else {
            DealerPolicyService.getSubCompanies(vm.policy.level2_company)
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
            DealerPolicyService.getSubCompanies(vm.policy.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    vm.loadDealerClients = function () {
        if (!vm.policy.dealer) {
            vm.clients = [];
        } else {
            DealerPolicyService.getDealerClients(vm.policy.dealer)
                .then(function (clients) {
                    vm.clients = clients;
                }, function (err) {

                });
        }
    }

    vm.dealerChanged = function () {
        vm.resetRule();
        vm.policy.dealer = vm.dealerInfo._id;
        vm.policy.payment_substract_rate = vm.dealerInfo.payment_substract_rate;
        vm.loadDealerClients();
        vm.updateFee();
    }



    vm.level2Changed = function () {
        vm.resetRule();
        if (!vm.policy.level2_company) {
            vm.policy.level1_company = undefined;
            vm.company = {};
        } else {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
            vm.policy.level1_company = vm.company.catogory._id;
        }
        vm.loadLevel3Companies();
    }

    vm.level3Changed = function () {
        vm.resetRule();
        if (!vm.policy.level3_company) {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
            
        } else {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        }
        vm.loadLevel4Companies();
    }

    vm.level4Changed = function () {
        vm.resetRule();
        if (!vm.policy.level4_company) {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        } else {
            vm.company = vm.level4Companies.find(c => c._id === vm.policy.level4_company);
        }
    }

    vm.resetRule = function() {
        vm.policy.rule = undefined;
        vm.policy.mandatory_fee_income_rate = null;
        vm.policy.commercial_fee_income_rate = null;
        vm.updateFee();
    }

    vm.editable = false;
    if ($state.is("app.policy.dealer.new")) {
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
        DealerPolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                if (policy.client) {
                    policy.client = policy.client._id;
                }
                vm.dealerInfo = policy.dealer;
                if (policy.dealer) {
                    policy.dealer = policy.dealer._id;
                }
                vm.loadDealerClients();
                vm.loadLevel3Companies();
                vm.loadLevel4Companies();
            });
    }

    vm.shouldShowEditButton = function (){
        if(vm.editable) return false;
        if(vm.policy.policy_status == "待审核"){
            return $rootScope.user.userrole.dealerPolicy_to_be_reviewed.edit;
        }else if(vm.policy.policy_status == "待支付"){
            return $rootScope.user.userrole.dealerPolicy_to_be_paid.edit;
        }else if(vm.policy.policy_status == "已支付"){
            return $rootScope.user.userrole.dealerPolicy_paid.edit;
        }
    }

    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    // vm.checkRuleRates = function () {
    //     if (!vm.policy.rule_rates) {
    //         return;
    //     }
    //     var rates = vm.policy.rule_rates;
    //     var policy = vm.policy;
    //     policy.has_warning = false;
    //     if (policy.mandatory_fee > 0) {
    //         if (rates.mandatory_income < policy.mandatory_fee_income_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //         if (rates.mandatory_payment > policy.mandatory_fee_payment_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //     }
    //     if (policy.commercial_fee > 0) {
    //         if (rates.commercial_income < policy.commercial_fee_income_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //         if (rates.commercial_payment > policy.commercial_fee_payment_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //     }

    //     if (policy.tax_fee > 0) {
    //         if (rates.tax_income < policy.tax_fee_income_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //         if (rates.tax_payment > policy.tax_fee_payment_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //     }

    //     if (policy.other_fee > 0) {
    //         if (rates.other_income < policy.other_fee_income_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //         if (rates.other_payment > policy.other_fee_payment_rate) {
    //             policy.has_warning = true;
    //             return;
    //         }
    //     }
    // }

    vm.submit = function () {
        // vm.checkRuleRates();
        if (vm.clientInfo) {
            vm.policy.client = vm.clientInfo._id;
        }

        DealerPolicyService.savePolicy(vm.policy)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                var old = vm.policy;
                vm.policy = {
                    client: old.client,
                    company: old.company,
                    level1_company: old.level1_company, 
                    level2_company: old.level2_company, 
                    level3_company: old.level3_company,
                    level4_company: old.level4_company,
                    dealer: old.dealer,
                    rule: old.rule,
                    mandatory_fee_income_rate: old.mandatory_fee_income_rate,
                    commercial_fee_income_rate: old.commercial_fee_income_rate,
                    payment_substract_rate: old.payment_substract_rate
                };
                if (vm.back) {
                    $state.go("app.policy.dealer.to-be-reviewed");
                }
            }, function (err) { });
    };

    vm.pay = function () {
        vm.checkRuleRates();
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认已支付该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "已支付";
                vm.policy.paid_at = Date.now();
                DealerPolicyService.savePolicy(vm.policy)
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
                vm.policy.approved_at = Date.now();
                DealerPolicyService.savePolicy(vm.policy)
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
                            $state.go("app.policy.dealer.approve", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.policy.dealer.to-be-reviewed");
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
        vm.policy.mandatory_fee_taxed = vm.policy.mandatory_fee / 1.06;
        if (vm.policy.mandatory_fee_taxed) {
            vm.policy.mandatory_fee_taxed = RoundNum(vm.policy.mandatory_fee_taxed, 2);
        }
        vm.policy.commercial_fee_taxed = vm.policy.commercial_fee / 1.06;
        if (vm.policy.commercial_fee_taxed) {
            vm.policy.commercial_fee_taxed = RoundNum(vm.policy.commercial_fee_taxed, 2);
        }

        var divideBy = vm.policy.rates_based_on_taxed ? 106 : 100;

        vm.policy.mandatory_fee_income = vm.policy.mandatory_fee * vm.policy.mandatory_fee_income_rate / divideBy;
        if (vm.policy.mandatory_fee_income) {
            vm.policy.mandatory_fee_income = RoundNum(vm.policy.mandatory_fee_income, 2);
        }
        vm.policy.commercial_fee_income = vm.policy.commercial_fee * vm.policy.commercial_fee_income_rate / divideBy;
        if (vm.policy.commercial_fee_income) {
            vm.policy.commercial_fee_income = RoundNum(vm.policy.commercial_fee_income, 2);
        }

        if (!isNaN(vm.policy.mandatory_fee_income) && !isNaN(vm.policy.commercial_fee_income)) {
            vm.policy.total_income = parseFloat(vm.policy.mandatory_fee_income) + parseFloat(vm.policy.commercial_fee_income);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }

        vm.policy.profit = vm.policy.total_income * vm.policy.payment_substract_rate / 100;
        if (vm.policy.profit) {
            vm.policy.profit = vm.policy.profit.toFixed(2);
            vm.policy.mandatory_fee_payment = vm.policy.mandatory_fee_income * (100 - vm.policy.payment_substract_rate) / 100;
            vm.policy.mandatory_fee_payment = RoundNum(vm.policy.mandatory_fee_payment, 2);
            vm.policy.commercial_fee_payment = vm.policy.commercial_fee_income * (100 - vm.policy.payment_substract_rate) / 100;
            vm.policy.commercial_fee_payment = RoundNum(vm.policy.commercial_fee_payment, 2);
        }
        vm.policy.total_payment = vm.policy.total_income - vm.policy.profit;
        if (vm.policy.total_payment) {
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
        }
    }

    vm.deleteSignPhoto = function () {
        delete vm.policy.sign_photo;
        if (vm.policy._id) {
            DealerPolicyService.updatePhoto(vm.policy)
        }
    };

    vm.deleteOtherPhoto = function () {
        delete vm.policy.other_photo;
        if (vm.policy._id) {
            DealerPolicyService.updatePhoto(vm.policy)
        }
    };

    vm.deleteAgreementPhoto = function () {
        delete vm.policy.agreement_photo;
        if (vm.policy._id) {
            DealerPolicyService.updatePhoto(vm.policy)
        }
    };
    vm.deleteCommercialPhoto = function () {
        delete vm.policy.agreement_photo;
        if (vm.policy._id) {
            DealerPolicyService.updatePhoto(vm.policy)
        }
    };

    vm.deleteMandatoryPhoto = function () {
        delete vm.policy.mandatory_policy_photo;
        if (vm.policy._id) {
            DealerPolicyService.updatePhoto(vm.policy)
        }
    };

    vm.signPhotoChanged = function (files) {
        vm.uploadSignPhoto(files[0]);
    };

    vm.uploadSignPhoto = function (file) {
        DealerPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.sign_photo = fileName;
                if(vm.policy._id){
                    DealerPolicyService.updatePhoto(vm.policy)
                }           
            })
    }

    vm.otherPhotoChanged = function (files) {
        vm.uploadOtherPhoto(files[0]);
    };

    vm.uploadOtherPhoto = function (file) {
        DealerPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.other_photo = fileName;
                if(vm.policy._id){
                    DealerPolicyService.updatePhoto(vm.policy)
                }           
            })
    }

    vm.agreementPhotoChanged = function (files) {
        vm.uploadAgreementPhoto(files[0]);
    };

    vm.uploadAgreementPhoto = function (file) {
        DealerPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.agreement_photo = fileName;
                if(vm.policy._id){
                    DealerPolicyService.updatePhoto(vm.policy)
                }           
            })
    }

    vm.commercialPhotoChanged = function (files) {
        vm.uploadCommercialPhoto(files[0]);
    };

    vm.uploadCommercialPhoto = function (file) {
        DealerPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.commercial_policy_photo = fileName;
                if(vm.policy._id){
                    DealerPolicyService.updatePhoto(vm.policy)
                }           
            })
    }



    vm.commercialPhotoChanged = function (files) {
        vm.uploadCommercialPhoto(files[0]);
    };

    vm.mandatoryPhotoChanged = function (files) {
        vm.uploadMandatoryPhoto(files[0]);
    };

    vm.uploadMandatoryPhoto = function (file) {
        DealerPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.mandatory_policy_photo = fileName;
                if(vm.policy._id){
                    DealerPolicyService.updatePhoto(vm.policy)
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
        return appConfig.policyOssUrl + fileName;
    }

});

angular.module('app.policy').directive('upper', function () {
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

angular.module('app.policy').directive('price', function () {
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

angular.module('app.policy').filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    if (/^[\u4e00-\u9fa5]+$/.test(text)) {
                        if(item['name'].indexOf(text) == 0){
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
                        if(itemMatches){
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


angular.module('app.policy').directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
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