four51.app.controller('QuickOrderCtrl', ['$scope', '$rootScope', 'Product', 'ProductDisplayService', 'Order', 'User', function($scope, $rootScope, Product, ProductDisplayService, Order, User) {
    //Four51 Ctrl seems to complete before this ctrl is loaded
    $scope.$on('treeComplete', function(event, tree) {
        loadProducts();
    });

    if ($scope.tree) {
        loadProducts();
    }

    function loadProducts() {
        $scope.Products = [];
        angular.forEach($scope.tree, function(category) {
            Product.search(category.InteropID, null, null, function(data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.Products.push(data[i]);
                }
            });
            angular.forEach(category.SubCategories, function(dataSub) {
                for (var j = 0; j < dataSub.length; j++) {
                    $scope.Products.push(dataSub[j]);
                }
            });
        });
    }

    $scope.selectProduct = function(p) {
        $scope.selectedProduct = p;
        $scope.LineItem = {};
        $scope.loadingProduct = true;
        Product.get(p.InteropID, function(product) {
            ProductDisplayService.getProductAndVariant(product.InteropID,null, function(data){
                $scope.LineItem.Product = data.product;
                $scope.LineItem.Variant = data.variant;
                ProductDisplayService.setNewLineItemScope($scope);
                ProductDisplayService.setProductViewScope($scope);
                $scope.$broadcast('ProductGetComplete');
                $rootScope.$broadcast('event:ProductChangeComplete');
                $scope.loadingProduct = false;
            });
        });
    };

    function addToOrder(order) {
        Order.save(order, function(data) {
            $scope.user.CurrentOrderID = data.ID;
            User.save($scope.user, function(user) {
                $scope.product = null;
                $scope.LineItem = {};
                $scope.addingToOrder = false;
            });
        });
    }

    $scope.orderProduct = function(item) {
        $scope.addingToOrder = true;
        if ($scope.user.CurrentOrderID) {
            Order.get($scope.user.CurrentOrderID, function(data) {
                var order = data;
                order.LineItems.push(item);
                addToOrder(order);
            });
        }
        else {
            var order = {};
            order.LineItems = [];
            order.LineItems.push(item);
            addToOrder(order);
        }
    };
}]);