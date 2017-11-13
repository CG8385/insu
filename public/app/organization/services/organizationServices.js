"use strict";

angular.module('app.organization').factory('OrganizationService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                saveOrganization: saveOrganization,
                getOrganizations: getOrganizations,
                getOrganization: getOrganization,
                deleteOrganization: deleteOrganization,
                getSubClients:getSubClients,
                bulkAssign: bulkAssign
            });

            function bulkAssign(data) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/clients/bulk-assign", data)
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

            function getSubClients(orgId) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=individual&organization='+orgId)
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

            function saveOrganization(organization) {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (organization._id) {
                    organization.updated_at = Date.now();
                    $http.put('api/organizations/' + organization._id, organization)
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
                    organization.created_at = Date.now();
                    organization.updated_at = organization.created_at;
                    $http.post('api/organizations', organization)
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

            function getOrganization(organizationId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('api/organizations/' + organizationId)
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

            function deleteOrganization(organizationId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('api/organizations/' + organizationId)
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
                $http.get('api/organizations')
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