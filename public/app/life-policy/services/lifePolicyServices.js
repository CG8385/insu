"use strict";

angular.module('app.life-policy').factory('LifePolicyService',
    ['$q', '$http', 'uuid',
        function ($q, $http, uuid) {
            // return available functions for use in controllers
            return ({
                savePolicy: savePolicy,
                getPolicies: getPolicies,
                getClients: getClients,
                getCompanies: getCompanies,
                getPolicy: getPolicy,
                deletePolicy: deletePolicy,
                searchPolicies: searchPolicies,
                getOrganizations: getOrganizations,
                getSellers: getSellers,
                getFilteredCSV: getFilteredCSV,
                // getSummary: getSummary,
                bulkPay: bulkPay,
                bulkApprove: bulkApprove,
                saveSalary: saveSalary,
                getSalary: getSalary,
                searchSalaries: searchSalaries,
                getFilteredSalaryCSV: getFilteredSalaryCSV,
                deleteSalary: deleteSalary,
                saveStatement: saveStatement,
                getStatement: getStatement,
                searchStatements: searchStatements,
                getFilteredStatementCSV: getFilteredStatementCSV,
                deleteStatement: deleteStatement,
                getManagers: getManagers,
                //getPolicyNames: getPolicyNames,
                getProduct: getProduct,
                getProducts: getProducts,
                getClient: getClient,
                uploadFile: uploadFile,
                updatePhoto: updatePhoto,
                getStsCredential: getStsCredential,
                getSubCompanies: getSubCompanies,
                getLevel1Companies: getLevel1Companies,
                getLevel2Companies: getLevel2Companies,
                getLevel2Orgs: getLevel2Orgs,
                getSubOrgs: getSubOrgs,
            });

            function getLevel2Orgs() {
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/organizations/level2')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getSubOrgs(parentId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/organizations/sub/' + parentId)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function uploadFile(file) {
                document.body.style.cursor='wait';
                var deferred = $q.defer();
                getStsCredential()
                .then(function(credentials){
                    var client = new OSS.Wrapper({
                    region: appConfig.policyOssRegion,
                    accessKeyId: credentials.AccessKeyId,
                    accessKeySecret: credentials.AccessKeySecret,
                    stsToken: credentials.SecurityToken,
                    // bucket: 'cwang1'
                    bucket: appConfig.policyOssBucket,
                    secure: appConfig.policyOssUseSSL
                }, function(err){
                    document.body.style.cursor='default';
                    $.bigBox({
                        title: "上传文件",
                        content: "上传失败，请检查网络",
                        color: "#C46A69",
                        icon: "fa fa-warning shake animated",
                        timeout: 6000
                    });
                    return;
                });

                var ext = /\.[^\.]+$/.exec(file.name); 
                var fileName = uuid.v1() + ext;

                client.multipartUpload(fileName, file).then(function (result) {
                    var url = appConfig.policyOssUrl + fileName;
                    // var url = "http://cwang1.oss-cn-shanghai.aliyuncs.com/" + fileName;
                    $.smallBox({
                            title: "服务器确认信息",
                            content: "扫描件已成功上传",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                    document.body.style.cursor='default';    
                    deferred.resolve(fileName);
                    }).catch(function (err) { 
                    deferred.reject(err);
                    });
                });
                return deferred.promise;
                
            }

            function getStsCredential() {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (false){
                }
                else {
                    // send a post request to the server
                    $http.get('api/sts')
                        // handle success
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data.Credentials);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        // handle error
                        .error(function (data) {
                            deferred.reject(status);
                        });
                }
                // return promise object
                return deferred.promise;
            }

            function updatePhoto(policy) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/life-policies/update-photo", policy)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getClient(clientId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/clients/' + clientId)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function savePolicy(policy) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (policy._id) {
                    policy.updated_at = Date.now();
                    $http.put('/api/life-policies/' + policy._id, policy)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    policy.created_at = Date.now();
                    policy.updated_at = policy.created_at;
                    $http.post('/api/life-policies', policy)
                    // handle success
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                    // handle error
                        .error(function (err) {
                            deferred.reject(status);
                        });
                }
                
                // return promise object
                return deferred.promise;
            }

            function bulkPay(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/life-policies/bulk-pay", policyIds)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function bulkApprove(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/life-policies/bulk-approve", policyIds)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function saveSalary(salary) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (salary._id) {
                    salary.updated_at = Date.now();
                    $http.put('/api/life-salaries/' + salary._id, salary)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    salary.created_at = Date.now();
                    salary.updated_at = salary.created_at;
                    $http.post('/api/life-salaries', salary)
                    // handle success
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                    // handle error
                        .error(function (err) {
                            deferred.reject(status);
                        });
                }
                
                // return promise object
                return deferred.promise;
            }
            
            function saveStatement(statement) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (statement._id) {
                    statement.updated_at = Date.now();
                    $http.put('/api/life-statements/' + statement._id, statement)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    statement.created_at = Date.now();
                    statement.updated_at = statement.created_at;
                    $http.post('/api/life-statements', statement)
                    // handle success
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                    // handle error
                        .error(function (err) {
                            deferred.reject(status);
                        });
                }
                
                // return promise object
                return deferred.promise;
            }
            
            function getSalary(salaryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-salaries/' + salaryId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getStatement(statementId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-statements/' + statementId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getPolicies(type) {
                // create a new instance of deferred
                var deferred = $q.defer();

                var url = "/api/life-policies"
                // if (type == "to-be-paid") {
                //     url = "/api/life-policies/to-be-paid";
                // } else if (type == "paid") {
                //     url = "/api/life-policies/paid";
                // }
                $http.get(url)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getPolicy(policyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-policies/' + policyId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function deletePolicy(policyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-policies/' + policyId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function deleteSalary(salaryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-salaries/' + salaryId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function deleteStatement(statementId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-statements/' + statementId)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getClients() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=individual')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getManagers() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=manager')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getCompanies() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/companies')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            /*
            function getPolicyNames() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/policy-names')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            */
            function getProduct(productId) {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a post request to the server
                $http.get(`api/companies/life-products/${productId}`)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });
                // return promise object
                return deferred.promise;
            }
            function getProducts(companyId) {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a post request to the server
                $http.get(`api/companies/${companyId}/life-products`)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });
                // return promise object
                return deferred.promise;
            }

            function searchPolicies(currentPage, pageSize, type, filterSettings, fromDate, toDate,approvedFromDate, approvedToDate, paidFromDate, paidToDate,policyNoSearch=undefined) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "submit_date";
                var orderByReverse = true;

                if (type == "to-be-reviewed") {
                    filterSettings.policy_status = "待审核";
                    orderByReverse = false;
                } else if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                } else if (type == "rejected") {
                    filterSettings.policy_status = "被驳回";
                    orderByReverse = false;
                }
                var start = new Date(fromDate);
                start.setHours(0, 0, 0, 1);
                var approvedStart = new Date(approvedFromDate);
                approvedStart.setHours(0, 0, 0, 1);
                var paidStart = new Date(paidFromDate);
                paidStart.setHours(0, 0, 0, 1);
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var approvedEnd = new Date(approvedToDate);
                approvedEnd.setHours(23,59,59,0);
                var paidEnd = new Date(paidToDate);
                paidEnd.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: start,
                    toDate: end,
                    approvedFromDate: approvedStart,
                    approvedToDate: approvedEnd,
                    paidFromDate: paidStart,
                    paidToDate: paidEnd,
                    policyNoSearch: policyNoSearch
                };

                
                $http.post("/api/life-policies/search", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function searchSalaries(currentPage, pageSize, type, filterSettings) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = true;
                
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                };

                
                $http.post("/api/life-salaries/search", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function searchStatements(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = true;
                
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                
                $http.post("/api/life-statements/search", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            // function getSummary(type, filterSettings, fromDate, toDate) {
            //     // create a new instance of deferred
            //     var deferred = $q.defer();
            //     var orderBy = "created_at";
            //     var orderByReverse = false;
            //     if (type == "to-be-paid") {
            //         filterSettings.policy_status = "待支付";
            //         orderByReverse = false;
            //     } else if (type == "paid") {
            //         filterSettings.policy_status = "已支付";
            //         orderByReverse = true;
            //     }
            //     var end = new Date(toDate);
            //     end.setDate(end.getDate()+1);
            //     var config = {
            //         filterByFields:filterSettings,
            //         orderBy: orderBy,
            //         orderByReverse: orderByReverse,
            //         requestTrapped: true,
            //         fromDate: fromDate,
            //         toDate: end
            //     };

            //     $http.post("/api/life-policies/summary", config)
            //     // handle success
            //         .success(function (data, status) {
            //             if (status === 200) {
            //                 deferred.resolve(data);
            //             } else {
            //                 deferred.reject(status);
            //             }
            //         })
            //     // handle error
            //         .error(function (err) {
            //             deferred.reject(status);
            //         });

            //     // return promise object
            //     return deferred.promise;
            // }
            
            // function bulkPay(type, filterSettings, fromDate, toDate) {
            //     // create a new instance of deferred
            //     var deferred = $q.defer();
            //     var orderBy = "created_at";
            //     var orderByReverse = false;
            //     if (type == "to-be-paid") {
            //         filterSettings.policy_status = "待支付";
            //         orderByReverse = false;
            //     } else if (type == "paid") {
            //         filterSettings.policy_status = "已支付";
            //         orderByReverse = true;
            //     }
            //     var end = new Date(toDate);
            //     end.setDate(end.getDate()+1);
            //     var config = {
            //         filterByFields:filterSettings,
            //         orderBy: orderBy,
            //         orderByReverse: orderByReverse,
            //         requestTrapped: true,
            //         fromDate: fromDate,
            //         toDate: end
            //     };

            //     $http.post("/api/life-policies/bulk-pay", config)
            //     // handle success
            //         .success(function (data, status) {
            //             if (status === 200) {
            //                 deferred.resolve(data);
            //             } else {
            //                 deferred.reject(status);
            //             }
            //         })
            //     // handle error
            //         .error(function (err) {
            //             deferred.reject(status);
            //         });

            //     // return promise object
            //     return deferred.promise;
            // }
            
            function getFilteredCSV(type, filterSettings, fromDate, toDate,approvedFromDate, approvedToDate, paidFromDate, paidToDate,policyNoSearch=undefined) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "submit_date";
                var orderByReverse = true;
                // if (type == "to-be-paid") {
                //     filterSettings.policy_status = "待支付";
                //     orderByReverse = false;
                // } else if (type == "paid") {
                //     filterSettings.policy_status = "已支付";
                //     orderByReverse = true;
                // }
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var approvedEnd = new Date(approvedToDate);
                approvedEnd.setHours(23,59,59,0);
                var paidEnd = new Date(paidToDate);
                paidEnd.setHours(23,59,59,0);
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end,
                    approvedFromDate: approvedFromDate,
                    approvedToDate: approvedEnd,
                    paidFromDate: paidFromDate,
                    paidToDate: paidEnd,
                    policyNoSearch: policyNoSearch
                };
                $http.post("/api/life-policies/excel", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getFilteredSalaryCSV(type, filterSettings) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                };
                $http.post("/api/life-salaries/excel", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getFilteredStatementCSV(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                var end = new Date(toDate);
                end.setDate(end.getDate()+1);
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };
                $http.post("/api/life-statements/excel", config)
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getOrganizations() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/organizations')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getSellers() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/users?role=seller')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getSubCompanies(parentId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/companies/sub/' + parentId)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getLevel1Companies() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/companies/level1')
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getLevel2Companies() {
                // create a new instance of deferred
                var deferred = $q.defer();
                // send a post request to the server
                $http.get('api/companies/level2')
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

        }]);