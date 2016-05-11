(function() {
var myApp = angular.module('Directives', []);

myApp.directive("sideMenu", ['WPConfig', 'WP', 'SideMenu', '$location',
function(WPConfig, WP, SideMenu, $location) {
return {
	scope: {},
	restrict: 'E',
	templateUrl: WPConfig.partials + 'side-menu.html',
	controller: ['$scope', function($scope) {
		$scope.items = {
			'posts': {
				'class': 'active',
				'href': '#/',
				'content': 'posts'
			},
			'users': {
				'class': '',
				'href': '#/Login',
				'content': 'Login'
			}
		};

		$scope.click = function(name) {
			setActive(name);
		};

		//////////////////////////////////////////
		// Here to recieve event from root controller
		// According to the event
		// 1) route
		// 2) dicide which item to be actived and its content
		//////////////////////////////////////////
		$scope.$on(SideMenu.Event_ChangeState, function(event, data) {
			if (data.type === SideMenu.Data_Login_Fail ||
				data.type === SideMenu.Data_Logout) {
				console.log("SideMenu.Data_Login_Fail");
				setActive('users');
				setUsersState('Login');
				$location.path("/Login");
			} else if (data.type === SideMenu.Data_Login_Success) {
				console.log("SideMenu.Data_Login_Success");
				$scope.user = data.data;
				setActive('posts');
				setUsersState('Logout');
				$location.path("/");
			}
			getUser();
		});

		//////////////////////////////////////////
		// Defined for inner invoke
		//////////////////////////////////////////
		var getUser = function() {
			$scope.user = WP.users().getCurrentUser() !== undefined ? WP.users().getCurrentUser() : {
				name: 'All'
			}
		};
		var setActive = function(name) {
			var keys = Object.keys($scope.items);
			for (var i = 0; i < keys.length; i++) {
				$scope.items[keys[i]].class = '';
			}
			$scope.items[name].class = 'active';
			console.log($scope.items);
		};

		var setUsersState = function(state) {
			if (state === 'Login') {
				$scope.items.users.href = '#/Login';
				$scope.items.users.content = 'Login';
			} else if (state === 'Logout') {
				$scope.items.users.href = '#/Logout';
				$scope.items.users.content = 'Logout';
			}
		};
		//////////////////////////////////////////
		// initial
		//////////////////////////////////////////
		getUser();
	}]
};
}
]);
})();