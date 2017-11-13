angular.module('app.wechat', [
  'ui.router',
  'ngRoute'
])
// .config(function ($stateProvider, $urlRouterProvider) {
//         $stateProvider
//         .state('app.wechat.home', {
//             url: '/',
//             templateUrl:"wechat/views/home.html"
//             // data: {
//             //     title: '红叶保险查询系统'
//             // },
//             // views: {
//             //     "content@app": {
//             //         controller: 'WechatController as vm',
//             //         templateUrl: 'wechat/views/home.html'
//             //     }
//             // }
//         })
//         // $urlRouterProvider.otherwise(function ($injector, $location) {
//         //     var $state = $injector.get("$state");
//         //     $state.go("app.wechat.home");
//         // });
//         $urlRouterProvider.otherwise("/");

//     });
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when("/", {templateUrl: "views/home.html", controller: "WechatController as vm"}).
	otherwise({redirectTo: '/'});
}]);