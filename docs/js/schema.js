Array.prototype.equalTo = function(other) {
	if (!(other instanceof Array)) 
		return false;

	if (this.length != other.length)
		return false;

	for (var i = 0; i < this.length; i++) {
		if (this[i] != other[i]) {
			return false;
		}
	}

	return true;
};

Array.prototype.contains = function(i) {
	return this.some(function (el) {
		return i == el;
	});
}

function SchemaCtrl($scope) {
	$scope.attributes = ['Email', 'First', 'Last'];
	$scope.fds = [];

	$scope.currentLHS = [];
	$scope.currentRHS = [];

	$scope.minCover = [];
	$scope.decomp = [];

	$scope.addAttribute = function() {
		$scope.attributes.push($scope.attributeText);
		$scope.attributeText = "";
		$scope.updateDecomp();
	};

	$scope.removeAttribute = function(attr) {
		$scope.attributes = $scope.attributes.filter(function (i) {
			return i != attr;
		});

		$scope.fds = $scope.fds.filter(function(i) {
			return (!i.lhs.contains(attr) && !i.rhs.contains(attr));
		});
		$scope.updateMinCover();
		$scope.updateDecomp();
	};


	$scope.addLHSAttribute = function() {
		$scope.currentLHS.push($scope.lhs);
	};

	$scope.addRHSAttribute = function() {
		$scope.currentRHS.push($scope.rhs);
	};

	$scope.addFD = function() {
		$scope.fds.push({'lhs': $scope.currentLHS.slice(0),
				 'rhs': $scope.currentRHS.slice(0)
				});

		$scope.currentLHS = [];
		$scope.currentRHS = [];
		$scope.updateMinCover();
		$scope.updateDecomp();
	};

	$scope.removeFD = function(fd) {
		$scope.fds = $scope.fds.filter(function (i) {
			return !(i.lhs.equalTo(fd.lhs) && i.rhs.equalTo(fd.rhs));
		});

		$scope.updateMinCover();
		$scope.updateDecomp();
	};

	$scope.updateMinCover = function() {
		var attrs = {};
		$scope.attributes.forEach(function (i) {
			attrs[i] = new schemata.Attribute(i);
		});

		var fds = $scope.fds.map(function (i) {
			var lhs = i.lhs.map(function (a) {
				return attrs[a];
			});

			var rhs = i.rhs.map(function(a) {
				return attrs[a];
			});

			return new schemata.FD(lhs, rhs);
		});
		
		var E = new schemata.FDSet(fds);
		
		$scope.minCover = E.minimalCover().toList();
	};

	$scope.updateDecomp = function() {
		var attrs = {};
		var attrSet = [];
		$scope.attributes.forEach(function (i) {
			attrs[i] = new schemata.Attribute(i);
			attrSet.push(attrs[i]);
		});

		var fds = $scope.fds.map(function (i) {
			var lhs = i.lhs.map(function (a) {
				return attrs[a];
			});

			var rhs = i.rhs.map(function(a) {
				return attrs[a];
			});

			return new schemata.FD(lhs, rhs);
		});
		
		attrSet = new schemata.AttributeSet(attrSet);
		fds = new schemata.FDSet(fds);
		var R = new schemata.Relation(attrSet, fds);
		
		var result = R.decomposeTo3NF();
		$scope.decomp = result.toList();
	};
}
