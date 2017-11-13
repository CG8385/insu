"use strict";

angular.module('app.employee').factory('EmployeeService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                saveUser: saveUser,
                getSellers: getSellers,
                getFinances: getFinances,
                getUser: getUser,
                deleteUser: deleteUser,
                getOrganizations: getOrganizations
            });

            function saveUser(user) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (user._id) {
                    user.updated_at = Date.now();
                    $http.put('/users/' + user._id, user)
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
                    user.created_at = Date.now();
                    user.updated_at = user.created_at;
                    $http.post('/users', user)
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

            function getUser(userID) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/users/' + userID)
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

            function deleteUser(userId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/users/' + userId)
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

            function getFinances() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/users?role=finance')
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
        }]);