(function() {
	//var myApp = angular.module('Ctrls', ['WPSerivce', 'ngSanitize']);
	var myApp = angular.module('Ctrls', ['ngSanitize']);

	myApp.controller('Root', ['WPConfig', 'WP', 'WPEvent', '$scope', '$location', 'basicAuthInterceptor', 'SideMenu', '$window',
		function(WPConfig, WP, WPEvent, $scope, $location, basicAuthInterceptor, SideMenu, $window) {
			WPConfig.username = $window.sessionStorage.getItem('username');
			WPConfig.password = $window.sessionStorage.getItem('password');
			basicAuthInterceptor.renew();

			console.log("WPConfig.username:" + WPConfig.username);
			console.log("WPConfig.password:" + WPConfig.password);

			//////////////////////////////////////////
			// Registered function to deal with Login
			//////////////////////////////////////////
			$scope.$on(WPEvent.Login, function(event, data) {
				console.log(data);
				users_validate(data);
			});
			//////////////////////////////////////////
			// Registered function to deal with Logout
			//////////////////////////////////////////
			$scope.$on(WPEvent.Logout, function(event) {
				// 1) Remove username/password from localStorage
				// 2) Set current of WPUsers to undefined
				// 3) Broadcast event --> sideMenu (route and change state)
				$window.sessionStorage.removeItem('username');
				$window.sessionStorage.removeItem('password');

				WP.users().logout();

				$scope.$broadcast(SideMenu.Event_ChangeState, {
					type: SideMenu.Data_Logout,
					data: undefined
				});
			});

			//////////////////////////////////////////
			// Defined for inner invoke
			//////////////////////////////////////////
			var posts_query = function(data) {
				WP.posts().fetchAllPosts(data).then(function(data) {
					$scope.posts = data;

					console.log($scope.posts);
				}, function() {
					console.error('Error while query posts');
				});
			};

			var users_query = function() {
				WP.users().fetchAllUsers().then(function(data) {
					$scope.users = data;
					users_validate();
					console.log($scope.users);
				}, function() {
					console.error('Error while query users');
				});
			};

			var users_validate = function(data) {
				if (!angular.isUndefined(data)) {
					WPConfig.username = data.username;
					WPConfig.password = data.password;
					basicAuthInterceptor.renew();
				}
				WP.users().validate().then(function(data) {
					//////////////////////////////////////////
					// Login validate success
					//////////////////////////////////////////
					// 1) Save username/password to localStorage
					$window.sessionStorage.setItem('username', WPConfig.username);
					$window.sessionStorage.setItem('password', WPConfig.password);
					// 2) Broadcast event --> sideMenu (route and change state)
					$scope.$broadcast(SideMenu.Event_ChangeState, {
						type: SideMenu.Data_Login_Success,
						data: data
					});
					// 3) query posts whose author is current user
					posts_query({
						author: WP.users().getCurrentUser().id
					});
					console.log(data);
				}, function() {
					// Register fail
					$scope.user = {
						name: 'All'
					};
					$scope.$broadcast(SideMenu.Event_ChangeState, {
						type: SideMenu.Data_Login_Fail,
						data: {}
					});
					posts_query();
					console.error('Error while validate');
				});
			};

			//////////////////////////////////////////
			// initial
			// 1) get users
			//    			|
			//					|---success--->validate
			//                             |
			//														 |---success--->posts_query(user)
			//                             |---fail--->posts_query()  
			//////////////////////////////////////////		
			users_query();
		}
	]);

	myApp.controller('Main', ['WP', '$scope',
		function(WP, $scope) {}
	]);

	myApp.controller('Login', ['WPEvent', '$scope',
		function(WPEvent, $scope) {
			$scope.login = function() {
				//////////////////////////////////////////
				// Here just emit Event of Login to ROOT
				//////////////////////////////////////////
				$scope.$emit(WPEvent.Login, $scope.user);
			};
		}
	]);

	myApp.controller('Logout', ['WP', 'WPEvent', '$scope',
		function(WP, WPEvent, $scope) {
			$scope.user = WP.users().getCurrentUser();
			$scope.logout = function() {
				//////////////////////////////////////////
				// Here just emit Event of Logout to ROOT
				//////////////////////////////////////////
				$scope.$emit(WPEvent.Logout);
			};
		}
	]);

})();