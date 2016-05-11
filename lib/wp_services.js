(function(){
	var myApp = angular.module('WPSerivce', ['ngResource', 'ab-base64']);
	myApp.constant('WPConfig', {
		'baseURL': '',
		'wpRestbaseURL': '/wp-json/wp/v2',
		'wpRestPostsURL': '/posts',
		'wpRestUsersURL': '/users',
		'username': undefined,
		'password': undefined
	});
	
	myApp.constant('WPEvent', {
		'Login': 'WP_Login',
		'Logout': 'WP_Logout'
	});
	
	myApp.constant('SideMenu', {
		'Event_ChangeState': 'Event_ChangeState',
		'Data_Login_Success': 'Data_Login_Success',
		'Data_Logout':  'Data_Logout',
		'Data_Login_Fail': 'Data_Login_Fail'
	});

	myApp.factory('basicAuthInterceptor', ['WPConfig', 'base64', 
		function(WPConfig, base64){			
			var encodedUserNameAndPassword = null;

			if (!angular.isUndefined(WPConfig.username) && 
				!angular.isUndefined(WPConfig.password)) {
				encodedUserNameAndPassword = base64.encode(WPConfig.username + ':' + WPConfig.password);
			}

			return {
				'renew': function() {
					if (!angular.isUndefined(WPConfig.username) && 
						!angular.isUndefined(WPConfig.password)) {
						encodedUserNameAndPassword = base64.encode(WPConfig.username + ':' + WPConfig.password);
					}
				},
				'request': function(config) {
					if (encodedUserNameAndPassword!==null) {
						config.headers['Authorization'] = 'Basic ' + encodedUserNameAndPassword;
					}
					return config;
				}
			}
	}]);
	
	myApp.config(['$httpProvider',
		function($httpProvider){
			$httpProvider.interceptors.push('basicAuthInterceptor');
		}
	]);

	myApp.factory('WPRestPosts', ['$resource', 'WPConfig',
		function($resource, WPConfig){
			return $resource(
				WPConfig.baseURL + WPConfig.wpRestbaseURL + WPConfig.wpRestPostsURL + '/:id',
				{id: '@id'},
				{
					'update': {method: 'POST'}
				}
			);
	}]);
	
	myApp.service('WPPosts', ['$q', 'WPRestPosts',
		function($q, WPRestPosts){
			var posts = [];
			var cache = {};

			var setCache = function() {
				cache = {};
				for (var i=0; i<posts.length; i++) {
					cache[posts[i].id] = i;
				};
			};

			this.getPosts = function() {
				return posts;
			};

			this.fetchAllPosts = function(data) {
				var deferred = $q.defer();
				var author = {};
				if (!angular.isUndefined(data) &&
					!angular.isUndefined(data.author)) 
				{
					author = {author: data.author};
				}
				var posts_ = WPRestPosts.query(author, function(){
					posts = posts_;
					setCache();
					deferred.resolve(posts);
				}, function(){
					console.error('Error while List posts');
					deferred.reject();
				});
				return deferred.promise;
			};
				
			this.id = function(id) {
				var deferred = $q.defer();
				if (typeof(cache[id])==='number') {
					setTimeout(function(){
						deferred.resolve(posts[cache[id]]);
					}, 0);
				} else {
					var post = WPRestPosts.get({id:id}, function(){
						posts.push(post);
						setCache();
						deferred.resolve(post);
					},function(){
						console.error('Error while get post');
						deferred.reject();
					});
				}
				return deferred.promise;
			};
			
			this.update = function(post) {
				var deferred = $q.defer();
				if (!angular.isUndefined(post.id) && !angular.isUndefined(cache[post.id])) {
					var post = WPRestPosts.update(post, function(){
						deferred.resolve(post);
					}, function(){
						deferred.reject();
					});
				} else {
					setTimeout(function(){
						console.error('Error no find in cache');
					}, 0);
					deferred.reject();
				}
				return deferred.promise;
			};
	}]);
	
		myApp.factory('WPRestUsers', ['$resource', 'WPConfig',
		function($resource, WPConfig){
			return $resource(
				WPConfig.baseURL + WPConfig.wpRestbaseURL + WPConfig.wpRestUsersURL + '/:id',
				{id: '@id'},
				{
					'update': {method: 'POST'}
				}
			);
	}]);

		myApp.service('WPUsers', ['$q', 'WPConfig', 'WPRestUsers',
		function($q, WPConfig, WPRestUsers){
			var user = undefined;
			var users = [];
			var cache = {};

			var setCache = function() {
				cache = {};
				for (var i=0; i<users.length; i++) {
					cache[users[i].slug] = i;
				};
			};

			this.fetchAllUsers = function() {
				var deferred = $q.defer();
				var users_ = WPRestUsers.query(function(){
					users = users_;
					setCache();
					deferred.resolve(users);
				}, function(){
					console.error('Error while List users');
					deferred.reject();
				});
				return deferred.promise;
			};

			this.validate = function() {
				var deferred = $q.defer();
				var username, password; 				

				username = WPConfig.username;
				password = WPConfig.password;

				if (!angular.isUndefined(username) && 
					!angular.isUndefined(password) &&
					!angular.isUndefined(users[cache[username]])) 
				{
					var user_ = WPRestUsers.update(users[cache[username]], function(){
						user = user_;
						deferred.resolve(user);
					}, function(){
						deferred.reject();
					});
				} else {
					setTimeout(function(){
						console.error('Error username or password is null');
					}, 0);
					deferred.reject();
				}
				return deferred.promise;
			};

			this.getCurrentUser = function() {
				return user;
			};
			
			this.getUsers = function() {
				return users;
			};
			
			this.logout = function() {
				user = undefined;
			}
	}]);
	
	myApp.factory('WP', ['WPPosts', 'WPUsers',
			function(WPPosts, WPUsers){
				return {
					posts: function(){
						return WPPosts;
					},
					users: function(){
						return WPUsers;
					}
				}
	}]);
})();