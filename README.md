# rdtheory -- various tools and algorithms from relational database theory

[![NPM](https://nodei.co/npm/rdtheory.png)](https://nodei.co/npm/rdtheory/)

![Jenkins](http://jenkins.rmarcus.info/buildStatus/icon?job=rdtheory.js)

## Installation
	npm install rdtheory

## Usage

### Closure
You can use `rdtheory` to find the closure of a set of attributes under (with respect to) a set of functional dependencies:

	var Ssn  = new rdtheory.Attribute("Ssn");
	var Ename = new rdtheory.Attribute("Ename");
	var Pnumber = new rdtheory.Attribute("Pnumber");
	var Pname = new rdtheory.Attribute("Pname");
	var Plocation = new rdtheory.Attribute("Plocation");
	var Hours = new rdtheory.Attribute("Hours");
	
	var a = new rdtheory.FD(Ssn, Ename);
	var b = new rdtheory.FD(Pnumber, [Pname, Plocation]);
	var c = new rdtheory.FD([Ssn, Pnumber], Hours);
	
	var F = new rdtheory.FDSet([a, b, c]);
	var closure =  new rdtheory.AttributeSet([Ssn]).closureUnder(F);
	console.log(closure.toString()); // will continue "Ssn" and "Ename"

### Coverage testing
You can use `rdtheory` to test if one set of functional dependencies covers another:

	var A = new rdtheory.Attribute("A");
	var C = new rdtheory.Attribute("C");
	var D = new rdtheory.Attribute("D");
	var E = new rdtheory.Attribute("E");
	var H = new rdtheory.Attribute("H");
	
	var f1 = new rdtheory.FD(A, C);
	var f2 = new rdtheory.FD([A, C], D);
	var f3 = new rdtheory.FD(E, [A, D]);
	var f4 = new rdtheory.FD(E, H);
	
	var g1 = new rdtheory.FD(A, [C, D]);
	var g2 = new rdtheory.FD(E, [A, H]);
	
	var F = new rdtheory.FDSet([f1, f2, f3, f4]);
	var G = new rdtheory.FDSet([g1, g2]);
	
	console.log(F.covers(G)) // true
	console.log(G.covers(F)) // true

You can also use coverage tests to perform equivalence tests (`F` is equivelant to `G` if `F` covers `G` and `G` covers `F`):

	console.log(F.equivalentTo(G)) // true

### Minimal covers
You can use `rdtheory` to find a minimal cover of a set of functional dependencies:

	var A = new rdtheory.Attribute("A");
	var B = new rdtheory.Attribute("B");
	var C = new rdtheory.Attribute("C");
	var D = new rdtheory.Attribute("D");
	var E = new rdtheory.Attribute("E");

	var e1 = new rdtheory.FD(B, A);
	var e2 = new rdtheory.FD(D, A);
	var e3 = new rdtheory.FD([A, B], D);
	E = new rdtheory.FDSet([e1, e2, e3]);

	var minCover = E.minimalCover();
	console.log(minCover.toString); // will contain B -> D and D -> A

### Finding primiary keys
You can use `rdtheory` to find the primary keys of a relation:

	var Name = new rdtheory.Attribute('Name');
	var Address = new rdtheory.Attribute('Address');
	var Phone = new rdtheory.Attribute('Phone');
	var ZipCode = new rdtheory.Attribute('ZIP');

	var f1 = new rdtheory.FD(Name, Address);
	var f2 = new rdtheory.FD(Name, Phone);
	var f3 = new rdtheory.FD(Address, ZipCode);

	var attrs = new rdtheory.AttributeSet([Name, Address, Phone, ZipCode]);
	var fds = new rdtheory.FDSet([f1, f2, f3]);
	
	var R = new rdtheory.Relation(attrs, fds);
	console.log(R.findPossibleKey().toString()); // will be Name

### Loseless join and dependency preserving 3NF decomposition
You can use `rdtheory` to decompose a relation into 3NF:


	var Name = new rdtheory.Attribute('Name'); // A
	var Address = new rdtheory.Attribute('Address'); // B
	var Phone = new rdtheory.Attribute('Phone'); // C
	var ZipCode = new rdtheory.Attribute('ZIP'); // D
	var Dept = new rdtheory.Attribute('Dept'); // E
	var Manager = new rdtheory.Attribute('Manager'); // F
	var YearsEmployed = new rdtheory.Attribute('Years'); // G
	var Pay = new rdtheory.Attribute('Pay'); // H

	var f1 = new rdtheory.FD(Name, [Address, Phone, Dept]);
	var f2 = new rdtheory.FD(Dept, Manager);
	var f3 = new rdtheory.FD(Address, ZipCode);
	var f4 = new rdtheory.FD([Dept, YearsEmployed], Pay);
	

	var attrs = new rdtheory.AttributeSet([Name, Address, Phone, ZipCode, Dept, Manager, YearsEmployed, Pay]);
	var fds = new rdtheory.FDSet([f1, f2, f3, f4]);
	
	var R = new rdtheory.Relation(attrs, fds);

	var D = R.decomposeTo3NF();
	console.log(D.toString()); // the decomposition

Obviously, this isn't very well documented (yet). Here's a [demo](http://ryanmarcus.bitbucket.org/schemata/) you can play around with.
