Array.prototype.indexOf = function(val, startAt) {
	var i = startAt;
	if (!i)
		i = 0;
		
	for ( ; i < this.length; i++) {
		if (! this[i])
			continue; 

		if(typeof this[i].equalTo === 'function') {
			if (this[i].equalTo(val))
				return i;
		} else {
			if (this[i] === val)
				return i;
		}
	}

	return -1;
};

function isSubsetOf(a, b) {
	for (var i = 0; i < a.length; i++) {

		if (b.indexOf(a[i]) == -1) {
			return false;
		}
	}

	return true;
}


function unique(myArray) {
	var toR = myArray.slice(0);
	toR = toR.filter(function(elem, pos) {
		return myArray.indexOf(elem) == pos;
	});

	return toR;
}

function union(a, b) {
	return unique(a.concat(b));
}

function difference(a, b) {
	return a.filter(function (i) {
		return b.indexOf(i) == -1;
	});
}

function Attribute(name, type) {
	this.name = name;
	this.type = type;
}

Attribute.prototype.toString = function () {
	return this.name;
};

Attribute.prototype.equalTo = function(other) {
	if (!(other instanceof Attribute))
	    return false;

	return this.name == other.name && this.type == other.type;
};

function AttributeSet(attributes) {
	if (attributes instanceof Attribute) {
		attributes = [attributes];
	}

	this.attributes = attributes;
	this.attributes.sort();
}

AttributeSet.prototype.differenceWith = function(other) {
	return new AttributeSet(difference(this.attributes, other.attributes));
};

AttributeSet.prototype.subsetOf = function(other) {
	return isSubsetOf(this.attributes, other.attributes);
};

AttributeSet.prototype.unionWith = function(other) {
	return new AttributeSet(union(this.attributes, other.attributes));
};

AttributeSet.prototype.clone = function() {
	return new AttributeSet(this.attributes);
};

AttributeSet.prototype.toString = function() {
	var toR = "{";
	this.attributes.forEach(function (i) {
		toR += " " + i + " "; 
	});

	return toR + "}";
};

AttributeSet.prototype.toList = function() {
	var toR = [];
	this.attributes.forEach(function(i) {
		toR.push(i.toString());
	});

	return toR;
};

AttributeSet.prototype.equalTo = function(other) {
	if (!(other instanceof AttributeSet))
		return false;

	if (this.attributes.length != other.attributes.length)
		return false;

	for (var i = 0; i < this.attributes.length; i++) {
		if (!this.attributes[i].equalTo(other.attributes[i]))
			return false;
	}

	return true;
};

AttributeSet.prototype.closureUnder = function(fdset) {
	// get the closure of this attribute X under the set of
	// FDs, fdset

	var Xplus = this.clone();
	var oldXPlus = false;
	do {
		oldXPlus = Xplus.clone();
		for (var idx = 0; idx < fdset.fds.length; idx++) {
			var i = fdset.fds[idx];
			// where each i is an FD Y -> Z
			if (i.lhs.subsetOf(Xplus)) {
				Xplus = Xplus.unionWith(i.rhs);
			}
		}
	} while (!oldXPlus.equalTo(Xplus));
	return Xplus;
};




function FD(lhs, rhs) {
	var l = lhs;
	var r = rhs;

	if (l instanceof Attribute)
		l = new AttributeSet([l]);

	if (l instanceof Array)
		l = new AttributeSet(l);

	if (r instanceof Attribute)
		r = new AttributeSet([r]);

	if (r instanceof Array)
		r = new AttributeSet(r);

	this.lhs = l;
	this.rhs = r;
}

FD.prototype.toString = function() {
	return this.lhs.toString() + " -> " + this.rhs.toString();
};

FD.prototype.equalTo = function(other) {
	return this.lhs.equalTo(other.lhs) && this.rhs.equalTo(other.rhs);
};

FD.prototype.toList = function() {
	var lhs = this.lhs.toList();
	var rhs = this.rhs.toList();
	
	return {'lhs': lhs, 'rhs': rhs};
};


function FDSet(FDs) {
	this.fds = FDs;
	this.fds.sort();
}

FDSet.prototype.toString = function() {
	var toR = "{";
	this.fds.forEach(function (i) {
		toR += " " + i.toString() + " ";
	});
	toR += "}";
	return toR;
};

FDSet.prototype.count = function() {
	return this.fds.length;
};

FDSet.prototype.equalTo = function(other) {
	if (this.fds.length != other.fds.length)
		return false;
	
	for (var i = 0; i < this.fds.length; i++) {
		if (!this.fds[i].equalTo(other.fds[i]))
			return false;
	}
	
	return true;
};

FDSet.prototype.covers = function(other) {
	var curr = this;
	return other.fds.every(function (fd) {
		var Xplus = fd.lhs.closureUnder(curr);
		return isSubsetOf(fd.rhs.attributes, Xplus.attributes);
	});
};

FDSet.prototype.equivalentTo = function(other) {
	return this.covers(other) && other.covers(this);
};

FDSet.prototype.unionWith = function(other) {
	return new FDSet(union(this.fds, other.fds));
};

FDSet.prototype.differenceWith = function(other) {
	return new FDSet(difference(this.fds, other.fds));
};

FDSet.prototype.minimalCover = function() {
	var E = this;
	var F = new FDSet([]);
	
	// for each X -> [A, B, C...] in E,
	// put X -> A, X -> B, X -> C in F
	E.fds.forEach(function (i) {
		var lhs = i.lhs;
		i.rhs.attributes.forEach(function (j) {
			F.fds.push(new FD(lhs, j));
		});
	});

	F.fds = unique(F.fds); // ensure things stay as a set

	// for each FD X -> A in F
	F.fds.forEach(function (i, idx) {
		// for each attribute B in X
		i.lhs.attributes.forEach(function(b) {
			var FminusXtA = F.differenceWith(new FDSet([i]));
			var XminusBtA = new FD(i.lhs.differenceWith(new AttributeSet(b)), i.rhs);
			var both = FminusXtA.unionWith(new FDSet([XminusBtA]));
			
			if (both.equivalentTo(F)) {
				F.fds[idx] = XminusBtA;
			}
		});
	});

	// for each FD X -> A in F
	for (var i = 0; i < F.fds.length; i++) {
		var FwithoutI = F.differenceWith(new FDSet([F.fds[i]]));
		if (F.equivalentTo(FwithoutI)) {
			F.fds.splice(i, 1);
		}
	}

	return F;
};

FDSet.prototype.toList = function() {
	return this.fds.map(function (i) {
		return i.toList();
	});
};


function Relation(attr, fds) {
	this.attr = attr;
	this.fds = fds;
}

Relation.prototype.equalTo = function(other) {
	return this.attr.equalTo(other.attr) && this.fds.equalTo(other.fds);
};

Relation.prototype.toString = function(withKey) {
	if (!withKey)
		return "R" + this.attr.toString();

	var toR = "R { ";
	var key = this.findPossibleKey();
	this.attr.attributes.forEach(function (i) {
		var curr = new AttributeSet(i);
		if (curr.subsetOf(key)) {
			toR += "*" + i.name + "* ";
		} else {
			toR += i.name + " ";
		}
	});

	toR += "}";

	return toR;
};

Relation.prototype.findPossibleKey = function() {
	var K = this.attr.clone();
	var curr = this;
	

	for (var i = 0; i < K.attributes.length; i++) {
		var A = K.attributes[i];
		var KminusA = K.differenceWith(new AttributeSet([A]));
		var KminusAPlus = KminusA.closureUnder(curr.fds);
		if (curr.attr.subsetOf(KminusAPlus)) {
			K = KminusA;
			i = -1;
		}
	}

	return K;
};

Relation.prototype.decomposeTo3NF = function() {
	var curr = this;
	var G = this.fds.minimalCover();
	var D = {};

	G.fds.forEach(function (i) {
		var newDecomp = i.lhs.attributes.concat(i.rhs.attributes);

		var temp = new AttributeSet(newDecomp);

		var hashKey = i.lhs.toString();
		if (!(hashKey in D)) {
			D[hashKey] = temp;
		} else {
			D[hashKey] = D[hashKey].unionWith(temp);
		}
	});



	var key = this.findPossibleKey();
	// make sure that the key exists somewhere
	var keyExists = false;
	for (var i in D) {
		if (!D.hasOwnProperty(i))
			continue;

		if (key.subsetOf(D[i])) {
			keyExists = true;
			break;
		}
	}

	if (!keyExists) {
		// add the key as a relation
		D.key = key;
	}
	
	

	var toR = [];
	// flatten the decomposition into a list

	for (var d in D) {
		if (!D.hasOwnProperty(d))
			continue;
		toR.push(D[d]);
	}

	// check for redundant relations (relations that are a subset
	// of another relation).
	var orig = toR.slice();
	toR.filter(function (candidate) {
		var invalid = orig.some(function (i) {
			return candidate.subsetOf(i);
		});

		return !invalid;
	});

	// turn each attributeset into a relation
	toR = toR.map(function (i) {
		return new Relation(i, curr.fds);
	});

	return new Schema(toR);

};

Relation.prototype.toList = function() {
	var toR = [];
	var key = this.findPossibleKey();
	this.attr.attributes.forEach(function (i) {
		var curr = new AttributeSet(i);
		if (curr.subsetOf(key)) {
			toR.push({'attr': i.name, 'key': true});
		} else {
			toR.push({'attr': i.name, 'key': false});
		}
	});

	return toR;
};


function Schema(rels) {
	this.rels = rels;
}

Schema.prototype.getRelations = function () {
	return this.rels;
};

Schema.prototype.toList = function() {
	return this.rels.map(function (i) {
		return i.toList();
	});
};





if(typeof module == 'undefined'){
	var exports = window.schemata = {};
	var module = {"exports": exports} ;
}

module.exports.Attribute = Attribute;
module.exports.AttributeSet = AttributeSet;
module.exports.FD = FD;
module.exports.FDSet = FDSet;
module.exports.Relation = Relation;
module.exports.Schema = Schema;


