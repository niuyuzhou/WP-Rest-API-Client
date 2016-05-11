(function() {
	var myApp = angular.module('myApp', ['ngRoute', 'WPSerivce', 'Ctrls', 'Directives']);

	myApp.config(['WPConfig',
		function(WPConfig) {
			WPConfig.baseURL = 'http://localhost/wordpress/';
			WPConfig.partials = 'partials/';
		}
	]);

	myApp.config(['$routeProvider', 'WPConfig',
		function($routeProvider, WPConfig) {
			$routeProvider
				.when('/', {
					templateUrl: WPConfig.partials + 'main.html',
					controller: 'Main'
				})
				.when('/Login', {
					templateUrl: WPConfig.partials + 'login.html',
					controller: 'Login'
				})
				.when('/Logout', {
					templateUrl: WPConfig.partials + 'logout.html',
					controller: 'Logout'
				})
				.otherwise({
					templateUrl: WPConfig.partials + '404.html',
				});
		}
	]);

	myApp.config(['$httpProvider',
		function($httpProvider) {
			$httpProvider.interceptors.push('basicAuthInterceptor');
		}
	]);

})();