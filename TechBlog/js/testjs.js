
var app = angular.module('blogapp', ["firebase", 'ngRoute', 'ngSanitize', 'ui.bootstrap']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'View/Blogmain.html',
            controller: 'blogctrl'
        })
        .when("/login", {
            templateUrl: "Login.html", controller: "LoginCtrl"
        })
        .when('/add', {
            templateUrl: 'View/AddBlog.html',
            controller: 'BlogAddCtrl'
        })
        .when('/contact', {
            templateUrl: 'View/Contact.html',
            controller: 'contactcontroller'
        })
        .when('/userblogs/:Createdby', {
            templateUrl: 'View/UserBlogs.html',
            controller: 'UserBlogsController'
        })
        .when('/detailblog/userblogs/:Createdby', {
            templateUrl: 'View/UserBlogs.html',
            controller: 'UserBlogsController'
        })
       .when('/detailblog/:blogid', {
           templateUrl: 'View/detailblog.html',
           controller: 'DetailBlogCtrl'
       })
     .otherwise({ redirectTo: '/' });
});

var ref = new Firebase("database address");

app.controller('blogctrl', function ($scope, $firebaseArray, Htmlcontent, $filter) {
    var blogs = {};
    $scope.blogs = $firebaseArray(ref);
    $scope.renderHtml = function (html_code) {
        var limit = $filter('limitTo')(html_code, 300);
        return Htmlcontent.fn(limit);
    };
    
    $scope.deleteblog = function (blog) {

        $scope.userlist1.$remove(blog);
    };
    //$scope.complete = function () {
    //    $("#tags").autocomplete({
    //        source: $scope.blogs
    //    });
    //}
});

app.controller('BlogAddCtrl', function ($scope, $firebaseArray, DateService, $modal, Htmlcontent) {
    var blogs = {};
    $scope.blogs = $firebaseArray(ref);
    $scope.addblog = function (blog) {
        var authData = ref.getAuth();
        if (authData) {
            if (blog != null) {
                $scope.blog.Createdby = authData.facebook.displayName;
                blog.createdDate = DateService.fn();
                console.log(blog.createdDate);
                $scope.blogs.$add(blog);
                $scope.blog = {};
                $scope.popover_message = "";
            }
            else {
                alert("Input data");
            }
            console.log("Authenticated user with uid:", authData);
        } else {
            $scope.popover_message = "Please Sign in";
        }
    };
    $scope.append = function (type) {
        $scope.blog.Content = $scope.blog.Content || new String();
        switch (type) {

            case 'code': $scope.blog.Content+="\n"+"<pre><code>Enter code here</code></pre>";
                break;

            case 'blockquote': $scope.blog.Content +="\n"+  "<blockquote>Enter quote here</blockquote>";
                break;

        }
    }
    $scope.showModal = false;
    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;
    };

    $scope.renderHtml = function (html_code) {
   
        return Htmlcontent.fn(html_code);
    };

  
});

app.directive('modal', function () {
    return {
        template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
              '<div class="modal-content">' +
                '<div class="modal-header">' +
                  '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                  '<h4 class="modal-title">{{ title }}</h4>' +
                '</div>' +
                '<div class="modal-body" ng-transclude></div>' +
              '</div>' +
            '</div>' +
          '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function (value) {
                if (value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

app.controller('DetailBlogCtrl', function ($scope, $routeParams, $firebaseObject, $sce, Htmlcontent, DateService) {
    var childref = new Firebase("https://atomtest.firebaseio.com/Blogs/" + $routeParams.blogid);
    $scope.blog = $firebaseObject(childref);
    var globagvar=0;
    var authdata = ref.getAuth();
    $scope.addComment = function (comment) {
        var authData = ref.getAuth();
        if (authData) {
            if (comment != null) {
                $scope.blog.Comments = $scope.blog.Comments || new Array();
                comment.username = authData.facebook.displayName;
                comment.createdDate = DateService.fn();
                comment.fbprofile = ref.getAuth();
                comment.id = comment.username + comment.createdDate + globagvar;
                $scope.blog.Comments.push(comment);
             
                $scope.blog.$save();
                $scope.comment = {};
                $scope.popover_message = "";
                globagvar++;
            }
            else {
                alert("Input data");
                $scope.comment = {};
            }
        }
        else {
            $scope.popover_message = "Please Sign in";
        }
    }
    $scope.increase_likes = function (comment) {
        var authData = ref.getAuth();
        if (authData) {
            comment.likelist = comment.likelist || new Array();
            comment.likes = comment.likes || 0;
            var flag = 0;
            $scope.started = false;
            for (i = 0; i < comment.likelist.length; i++) {
                if (comment.likelist[i] == authData.facebook.displayName) {
                    flag = 1;
                    break;
                }
                console.log(comment.likelist[i]);
            }
            if (flag == 0) {
                comment.likelist.push(authData.facebook.displayName);
                comment.likes = comment.likelist.length;
                $scope.blog.$save();
            }
            else {
                alert("Already clicked");
            }
        }
        else {
            alert("user Not authenticated");
        }

    }
    $scope.decrease_likes = function (comment) {
        var authData = ref.getAuth();
        if (authData) {
            comment.dislikelist = comment.dislikelist || new Array();
            comment.dislikes = comment.dislikes || 0;
            var flag = 0;
            $scope.started = false;
            for (i = 0; i < comment.dislikelist.length; i++) {
                if (comment.dislikelist[i] == authData.facebook.displayName) {
                    flag = 1;
                    break;
                }
            }
            if (flag == 0) {
                comment.dislikelist.push(authData.facebook.displayName);
                comment.dislike = comment.dislikelist.length;
                $scope.blog.$save();
            }
            else {
                alert("Already clicked");
            }
        }
        else {
            alert("user Not authenticated");
        }
    }
    $scope.renderHtml = function (html_code) {
        return Htmlcontent.fn(html_code);
    };
    $scope.add = function (comment) {

        if (ref.getAuth()) {
        $scope.reply_visible = comment.id;
         }
        else
        {
            alert("not authenticated");
        }
    };
    $scope.post_reply = function (data, replycomment) {
        data.nodes = data.nodes || new Array();
        var authData = ref.getAuth();

        var username1 = authData.facebook.displayName;
        var comment = replycomment;
        data.nodes.push({ username: username1, usercomment: replycomment, id: username1 + DateService.fn() + globagvar, createdDate: DateService.fn(), fbprofile: authData, nodes: [] });
        $scope.blog.$save(data);
        $scope.reply_visible = {};
        $scope.reply_comment_data = {};
        globagvar++;

    };
    $scope.isCollapsed = false;

    
    $scope.mouseevebt = function (comment) {
        $scope.comment_likes_data = String(comment.likelist);
     };
});

app.controller('UserBlogsController', function ($scope, $routeParams, $firebaseArray, Htmlcontent, $filter) {
    var rootRef = new Firebase("https://atomtest.firebaseio.com/Blogs");
    var blogs = {};
  
    //var ref = rootRef.child('Createdby')
    //            .startAt($routeParams.Createdby)
    //            .endAt($routeParams.Createdby)
    //            .once('value', function (snap) {
    //                console.log('messages in range', snap.val());

    //            });
    $scope.blogs = $firebaseArray(rootRef);
    $scope.filtername = $routeParams.Createdby;
    $scope.renderHtml = function (html_code) {
        var limit = $filter('limitTo')(html_code, 400);
        return Htmlcontent.fn(limit);
    };

});

app.service('Htmlcontent', function ($sce) {
    return {
        fn: function (html_code) {
            return $sce.trustAsHtml(html_code);
        }
    }
});

app.controller('authenticationController', function ($scope, $firebaseArray) {
    $scope.authUser = function () {
        ref.authWithOAuthPopup("facebook", function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
                $scope.LoginFlag = "Login";
            } else {
                console.log("Authenticated successfully with payload:", authData);
                $scope.LoginFlag = "Logout";
            }
        });
    }
});

app.controller('LoginCtrl', function ($scope, $location, $rootScope) {

    $scope.showModal = false;
    $scope.toggleModal = function () {
       
    };
    if (ref.getAuth())
    {
        $scope.LoginFlag="Logout"
    }
    else
    {
        $scope.LoginFlag = "Login"
    }
    $scope.logout = function (flag) {
        if(flag=='Login')
        {
            $scope.showModal = !$scope.showModal;
         }
        else
        {
            ref.unauth();
            $scope.LoginFlag = "Login";
        }
    }
    $scope.authUser = function () {
        ref.authWithOAuthPopup("facebook", function (error, authData) {
            if (error) {
                //console.log("Login Failed!", error);
                $scope.LoginFlag = "Login";
            } else {
               // console.log("Authenticated successfully with payload:", authData);
                $scope.LoginFlag = "Logout";
                $("#modalid").modal('hide');

            }
        });
    }
   
});

app.service('DateService', function ($filter) {

    return {
        fn: function () {
            var _date = $filter('date')(new Date(), 'MMM dd yyyy HH:mm');
            return _date;
        }
    }
});

app.controller('contactcontroller', function ($scope, $firebaseArray) {

  
});

