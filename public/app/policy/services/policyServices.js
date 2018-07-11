"use strict";

angular.module('app.policy').factory('PolicyService',
    ['$q', '$http','uuid',
        function ($q, $http,uuid) {
            // return available functions for use in controllers
            return ({
                savePolicy: savePolicy,
                getPolicies: getPolicies,
                getClients: getClients,
                getIndividualClients: getIndividualClients,
                getOrgClients: getOrgClients,
                getCompanies: getCompanies,
                getPolicy: getPolicy,
                deletePolicy: deletePolicy,
                searchPolicies: searchPolicies,
                getOrganizations: getOrganizations,
                getSellers: getSellers,
                getFilteredCSV: getFilteredCSV,
                getSummary: getSummary,
                bulkPay: bulkPay,
                getClient: getClient,
                getSubCompanies: getSubCompanies,
                getLevel2Companies: getLevel2Companies,
                bulkApprove: bulkApprove,
                bulkCheck: bulkCheck,
                uploadFile: uploadFile,
                getCompany: getCompany,
                updatePhoto: updatePhoto,
                getRules: getRules,
                searchImagePolicies: searchImagePolicies,
                bulkProcessImagePolicies: bulkProcessImagePolicies,
                processImagePolicy: processImagePolicy,
                deleteImagePolicy: deleteImagePolicy,
                downloadToBeProcessedImages: downloadToBeProcessedImages,
                downloadProcessedImages: downloadProcessedImages,
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

            function getRules(companyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get(`api/companies/${companyId}/rules`)
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
            
            function getCompany(companyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('api/companies/' + companyId)
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
                    $http.put('/api/policies/' + policy._id, policy)
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
                    $http.post('/api/policies', policy)
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

            function getPolicies(type) {
                // create a new instance of deferred
                var deferred = $q.defer();

                var url = "/api/policies"
                if (type == "to-be-paid") {
                    url = "/api/policies/to-be-paid";
                } else if (type == "paid") {
                    url = "/api/policies/paid";
                }
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

                $http.get('/api/policies/' + policyId)
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

                $http.delete('/api/policies/' + policyId)
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
                $http.get('/api/clients')
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

            function getIndividualClients() {

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

            function getOrgClients() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=organization')
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

            function searchPolicies(currentPage, pageSize, type, filterSettings, fromDate, toDate, approvedFromDate, approvedToDate, paidFromDate, paidToDate,  expireFromDate, expireToDate, policyNoSearch=undefined) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-reviewed") {
                    filterSettings.policy_status = "待审核";
                    orderByReverse = false;
                } else if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                } else if (type == "checked") {
                    filterSettings.policy_status = "已核对";
                    orderByReverse = true;
                } else if (type == "reminder") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = false;
                    orderBy = "effective_date"
                } else if (type == "rejected") {
                    filterSettings.policy_status = "被驳回";
                    orderByReverse = false;
                }

                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var approvedEnd = new Date(approvedToDate);
                approvedEnd.setHours(23,59,59,0);
                var paidEnd = new Date(paidToDate);
                paidEnd.setHours(23,59,59,0);
                var effectiveStart = new Date(expireFromDate);
                effectiveStart.setFullYear(effectiveStart.getFullYear() - 1)
                var effectiveEnd = new Date(expireToDate);
                effectiveEnd.setFullYear(effectiveEnd.getFullYear() - 1)
                effectiveEnd.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end,
                    approvedFromDate: approvedFromDate,
                    approvedToDate: approvedEnd,
                    paidFromDate: paidFromDate,
                    paidToDate: paidEnd,
                    effectiveFromDate: effectiveStart,
                    effectiveToDate: effectiveEnd,
                    policyNoSearch: policyNoSearch
                };


                $http.post("/api/policies/search", config)
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

            function getSummary(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-reviewed") {
                    filterSettings.policy_status = "待审核";
                    orderByReverse = false;
                } else if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                }
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                $http.post("/api/policies/summary", config)
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

            function bulkPay(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/policies/bulk-pay", policyIds)
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
                $http.post("/api/policies/bulk-approve", policyIds)
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

            function bulkCheck(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/policies/bulk-check", policyIds)
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

            function downloadToBeProcessedImages(){
                var deferred = $q.defer();
                $http.get("/api/image-policies/download", {responseType: 'arraybuffer'})
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

            function downloadProcessedImages(fromDate, toDate){
                var deferred = $q.defer();
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    fromDate: fromDate,
                    toDate: end
                };
                $http.post("/api/image-policies/download", config, {responseType: 'arraybuffer'})
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

            function getFilteredCSV(type, filterSettings, fromDate, toDate, approvedFromDate, approvedToDate, paidFromDate, paidToDate, expireFromDate, expireToDate, policyNoSearch=undefined) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                // var expireFromDate1 = expireFromDate;
                // var expireToDate1 = expireToDate;
                if (type == "to-be-reviewed") {
                    filterSettings.policy_status = "待审核";
                    orderByReverse = false;
                } else if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                } else if (type == "checked") {
                    filterSettings.policy_status = "已核对";
                    orderByReverse = true;
                } else if (type == "reminder") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                } else if (type == "rejected") {
                    filterSettings.policy_status = "被驳回";
                    orderByReverse = false;
                }
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var approvedEnd = new Date(approvedToDate);
                approvedEnd.setHours(23,59,59,0);
                var paidEnd = new Date(paidToDate);
                paidEnd.setHours(23,59,59,0);
                var effectiveStart = new Date(expireFromDate);
                effectiveStart.setFullYear(effectiveStart.getFullYear() - 1)
                var effectiveEnd = new Date(expireToDate);
                effectiveEnd.setFullYear(effectiveEnd.getFullYear() - 1)
                effectiveEnd.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end,
                    approvedFromDate: approvedFromDate,
                    approvedToDate: approvedEnd,
                    paidFromDate: paidFromDate,
                    paidToDate: paidEnd,
                    effectiveFromDate: effectiveStart,
                    effectiveToDate: effectiveEnd,
                    policyNoSearch: policyNoSearch
                };

                $http.post("/api/policies/excel", config)
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

            function updatePhoto(policy) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/policies/update-photo", policy)
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

            function searchImagePolicies(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-processed") {
                    filterSettings.status = "待录入";
                    orderByReverse = false;
                } else if (type == "processed") {
                    filterSettings.status = "已录入";
                    orderByReverse = true;
                }

                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };


                $http.post("/api/image-policies/search", config)
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

            function bulkProcessImagePolicies(ids) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/image-policies/bulk-process", ids)
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
            function processImagePolicy(id) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post(`/api/image-policies/${id}/process`)
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
            function deleteImagePolicy(id) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/image-policies/' + id)
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

        }]);