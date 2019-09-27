var app = angular.module('debateBingo', ['ngMaterial', 'ngMessages', 'ngRoute'])
    .config(function ($mdThemingProvider, $locationProvider, $routeProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('red');

        $routeProvider
            .when('/', {
                templateUrl: 'templates/home.html'
            })
            .when('/:code', {
                templateUrl: 'templates/board.html'
            });
    });

app.controller('welcomeCtrl', function ($scope, $timeout, $http, $location) {
    host = $location.host().toLowerCase();
    if (host.includes("localhost")){
        apiHost = "https://api.novicedebatebingo.com";
    } else {
        apiHost = "https://api." + host;
    }

    if (host === "novicedebatebingo.com") {
        $scope.division = "novice";
    } else if (host === "varsitydebatebingo.com") {
        $scope.division = "varsity"
    } else {
        $scope.division = "testing"
    }

    $scope.boardCode = "";
    $scope.buttonText = "New Board";

    var changeTimeout = $timeout(function() {
        if ($scope.boardCode !== "") {
            $scope.buttonText = "Go to " + $scope.boardCode;
        } else {
            $scope.buttonText = "New Board";
        }
    }, 100);

    $scope.$watch('boardCode', function () {
        changeTimeout.cancel;
        changeTimeout = $timeout(function() {
            if ($scope.boardCode !== "") {
                $scope.buttonText = "Go to " + $scope.boardCode;
            } else {
                $scope.buttonText = "New Board";
            }
        }, 1000);
    }, true);

    $scope.goToBoard = goToBoard;

    function goToBoard() {
        if ($scope.boardCode === "") {
            var onSuccess = function(response) {
                var newBoardID = response.data.board.code;
                $location.path('/' + newBoardID);
            };

            var onError = function(data) {
                console.error("Error creating new board.", data);
            };

            $http.post(apiHost + '/boards', {division: $scope.division})
                .then(onSuccess, onError)
        } else {
            $location.path('/' + $scope.boardCode);
        }
    }
});

app.controller('homeCtrl', function ($scope, $location) {
    host = $location.host().toLowerCase();

    if (host === "novicedebatebingo.com") {
        $scope.division = "Novice";
    } else if (host === "varsitydebatebingo.com") {
        $scope.division = "Varsity"
    } else {
        $scope.division = "Testing"
    }
});

app.controller('bingoCtrl', function ($scope, $http, $routeParams, $timeout, $location) {
    $scope.fields = [];
    $scope.bingo = false;
    $scope.previousBingo = false;
    $scope.firstLoad = true;
    $scope.boardCode = $routeParams.code;

    host = $location.host().toLowerCase();

    if (host.includes("localhost")){
        apiHost = "https://api.novicedebatebingo.com";
    } else {
        apiHost = "https://api." + host;
    }

    if (host === "novicedebatebingo.com") {
        $scope.division = "novice";
    } else if (host === "varsitydebatebingo.com") {
        $scope.division = "varsity"
    } else {
        $scope.division = "testing"
    }

    $http({
        method: 'GET',
        url: apiHost + '/boards/' + $scope.boardCode
    }).then(function successCallback(response) {
        data = response.data;
        updateGrid(data)

    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    function clickCell(x, y) {
        var onSuccess = function(response) {
            updateGrid(response.data);
            $scope.firstLoad = false;
        };

        var onError = function(data) {
            console.error("Error posting toggle event", data);
        };

        $http.post(apiHost + '/toggleBox', { board_id: $scope.boardCode, coordinates: {x: x, y: y}})
            .then(onSuccess, onError)

    }

    function updateGrid(data) {
        $scope.grid = new Array(5);
        for (x = 0; x < 5; x++) {
            $scope.grid[x] = new Array(5);
        }

        for (x = 0; x < 5; x++) {
            for (y = 0; y < 5; y++) {
                $scope.grid[x][y] = {content: data.boxes[x][y].content, checked: data.boxes[x][y].checked, coordinates: data.boxes[x][y].coordinates};
            }
        }

        if (data.bingo) {
            if (!$scope.previousBingo && !$scope.firstLoad){
                $scope.bingo = true;
                $scope.previousBingo = true;
            }
            bingoTimeout = $timeout(function() {
               $scope.bingo = false;
            }, 5000);
        }

    }

    $scope.clickCell = clickCell
});



