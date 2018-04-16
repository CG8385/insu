"use strict";

angular.module('app.company').factory('CompanyService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                saveCompany: saveCompany,
                getCompanies: getCompanies,
                getSubCompanies: getSubCompanies,
                getCompany: getCompany,
                deleteCompany: deleteCompany,
                savePolicyName: savePolicyName,
                getPolicyNames: getPolicyNames,
                getPolicyName: getPolicyName,
                deletePolicyName: deletePolicyName,
                saveCompanyCatogory: saveCompanyCatogory,
                getCompanyCatogories: getCompanyCatogories,
                getCompanyCatogory: getCompanyCatogory,
                deleteCompanyCatogory: deleteCompanyCatogory,
                getRules: getRules,
                getRule: getRule,
                saveRule: saveRule,
                deleteRule: deleteRule,
                getPropertyProducts: getPropertyProducts,
                getPropertyProduct: getPropertyProduct,
                savePropertyProduct: savePropertyProduct,
                deletePropertyProduct: deletePropertyProduct,
                getLocations: getLocations
            });

            function getLocations() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/locations/')
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

            function saveCompany(company) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (company._id) {
                    company.updated_at = Date.now();
                    $http.put('api/companies/' + company._id, company)
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
                    company.created_at = Date.now();
                    company.updated_at = company.created_at;
                    $http.post('api/companies', company)
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

            function deleteCompany(companyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/companies/' + companyId)
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

            function getCompanies() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/companies')
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

            function savePolicyName(policyName) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (policyName._id) {
                    policyName.updated_at = Date.now();
                    $http.put('api/policy-names/' + policyName._id, policyName)
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
                    policyName.created_at = Date.now();
                    policyName.updated_at = policyName.created_at;
                    $http.post('api/policy-names', policyName)
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

            function getPolicyName(policyNameId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('api/policy-names/' + policyNameId)
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

            function deletePolicyName(policyNameId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/policy-names/' + policyNameId)
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

            function getPolicyNames() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/policy-names')
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

            function getCompanyCatogories() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('api/companycatogories')
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

            function saveCompanyCatogory(companyCatogory) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (companyCatogory._id) {
                    companyCatogory.updated_at = Date.now();
                    $http.put('api/companycatogories/' + companyCatogory._id, companyCatogory)
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
                    companyCatogory.created_at = Date.now();
                    companyCatogory.updated_at = companyCatogory.created_at;
                    $http.post('api/companycatogories', companyCatogory)
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

            function getCompanyCatogory(companyCatogoryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('api/companycatogories/' + companyCatogoryId)
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

            function deleteCompanyCatogory(companyCatogoryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/companycatogories/' + companyCatogoryId)
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

            function getRules(companyId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
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
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function getRule(ruleId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get(`api/companies/rules/${ruleId}`)
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

            function saveRule(rule) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (rule._id) {
                    rule.updated_at = Date.now();
                    $http.put('api/companies/rules/' + rule._id, rule)
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
                    rule.updated_at = Date.now();
                    $http.post('api/companies/rules', rule)
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
                }

                // return promise object
                return deferred.promise;
            }

            function deleteRule(ruleId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/companies/rules/' + ruleId)
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

            function getPropertyProductS(companyId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get(`api/companies/${companyId}/property-products`)
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

            function getPropertyProduct(productId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get(`api/companies/roperty-products/${productId}`)
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

            function savePropertyProduct(product) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (product._id) {
                    product.updated_at = Date.now();
                    $http.put('api/companies/roperty-products/' + product._id, product)
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
                    product.updated_at = Date.now();
                    $http.post('api/companies/roperty-products', product)
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
                }

                // return promise object
                return deferred.promise;
            }

            function deletePropertyProduct(productId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/companies/roperty-products/' + productId)
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