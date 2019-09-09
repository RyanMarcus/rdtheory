var assert = require("assert");
var rdtheory = require("../rdtheory");

describe('to list functions', function() {
	var A = new rdtheory.Attribute("A");
	var B = new rdtheory.Attribute("B");
	var C = new rdtheory.Attribute("C");

	it("should work on AttributeSets", function () {
		var s = new rdtheory.AttributeSet([A, B]);
		s = s.toList();
		assert(s[0] == "A");
		assert(s[1] == "B");
	});

	it("should work on FDs", function() {
		var s = new rdtheory.FD(A, [B, C]);
		s = s.toList();
		assert(s.lhs[0] == "A");
		assert(s.rhs[0] == "B");
		assert(s.rhs[1] == "C");
	});

	it("should work on FDSets", function() {
		var s = new rdtheory.FD(A, [B, C]);
		var s2 = new rdtheory.FD(A, C);
		var ss = new rdtheory.FDSet([s, s2]);
		ss = ss.toList();
		assert(ss[0].lhs[0] == "A");
		assert(ss[0].rhs[0] == "B");
		assert(ss[0].rhs[1] == "C");

		assert(ss[1].lhs[0] == "A");
		assert(ss[1].rhs[0] == "C");
	});
});

describe('closure', function() {
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

	it("should have values Ssn and Ename", function () {
		var closure =  new rdtheory.AttributeSet([Ssn]).closureUnder(F);
		assert(closure.toString().indexOf("Ssn") != -1, "no Ssn");
		assert(closure.toString().indexOf("Ename") != -1, "no Ename");
		assert(closure.toString().indexOf("Pname") == -1, "also had Pname");
	});

	it("should have values Pnumber, Pname, and Plocation", function () {
		var closure = new rdtheory.AttributeSet([Pnumber]).closureUnder(F);
		assert(closure.toString().indexOf("Pnumber") != -1, "no Pnumber");
		assert(closure.toString().indexOf("Pname") != -1, "no Pname");
		assert(closure.toString().indexOf("Plocation") != -1, "no Plocation");
		assert(closure.toString().indexOf("Ssn") == -1, "also had Ssn");
	});

	it("should have values Pnumber, Pname, Plocation, Ssn, Ename, and Hours", function () {
		var closure = new rdtheory.AttributeSet([Ssn, Pnumber]).closureUnder(F);
		assert(closure.toString().indexOf("Pnumber") != -1, "no Pnumber");
		assert(closure.toString().indexOf("Pname") != -1, "no Pname");
		assert(closure.toString().indexOf("Plocation") != -1, "no Plocation");
		assert(closure.toString().indexOf("Ssn") != -1, "no Ssn");
		assert(closure.toString().indexOf("Ename") != -1, "no Ename");
		assert(closure.toString().indexOf("Hours") != -1, "no Hours");
	});

});

describe('FD cover', function() {

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
	
	var Fp = new rdtheory.FDSet([f1, f2, f4]);
	
	it('should determine that F and G cover each other', function () {
		assert(F.covers(G), "F did not cover G");
		assert(G.covers(F), "G did not cover F");
	});


	it('should determine that G covers Fp, but the other way around', function () {
		assert(!Fp.covers(G), "Fp covered G");
		assert(G.covers(Fp), "G did not Fp");
	});

	describe('equivalentTo', function () {

		it('should determine that F is equiv to G and vice versa', function() {
			assert(F.equivalentTo(G), "F not equiv to G");
			assert(G.equivalentTo(F), "G not equiv to F");
		});

		it('should determine that F is not equiv to G and vice versa', function () {
			assert(!Fp.equivalentTo(G), "Fp equiv to G");
			assert(!G.equivalentTo(Fp), "G equiv to Fp");
		});

	});
	
});

describe('minimal cover on test schema 1', function() {

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
	it('should only contain B -> D and  D -> A', function () {
		var t1 = new rdtheory.FD(B, D);
		var t2 = new rdtheory.FD(D, A);
		assert(minCover.fds.indexOf(t1) != -1, "did not contain B -> D");
		assert(minCover.fds.indexOf(t2) != -1, "did not contain D -> A");
		assert(minCover.count() == 2, "there weren't two FDs!");
	});
});

describe('minimal cover on test schema 2', function() {
	var A = new rdtheory.Attribute("A");
	var B = new rdtheory.Attribute("B");
	var C = new rdtheory.Attribute("C");

	var f1 = new rdtheory.FD(A, [B, C]);
	var f2 = new rdtheory.FD(A, B);
	var E = new rdtheory.FDSet([f1, f2]);
	var minCover = E.minimalCover();

	it('should contain only A -> B and A -> C', function() {
		var t1 = new rdtheory.FD(A, B);
		var t2 = new rdtheory.FD(A, C);
		assert(minCover.fds.indexOf(t1) != -1, "did not contain A -> B");
		assert(minCover.fds.indexOf(t2) != -1, "did not contain A -> C");
		assert(minCover.count() == 2, "contained some other FD: " + minCover.toString());
	});
});

describe('primary key', function() {
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

	it('should determine the correct key', function() {
		var correctKey = new rdtheory.AttributeSet(Name);
		assert(R.findPossibleKey().equalTo(correctKey), "did not suggest Name as a key, instead suggested: " + R.findPossibleKey());
	});
});

describe('3NF decomposition', function() {
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
	it('should create 5 tables', function() {
		assert(D.getRelations().length == 5, "wasn't 5, was instead: " + D.getRelations().length);
	});

	it('should create tables that each have keys', function() {
		D.getRelations().forEach(function(i) {
			assert(i.findPossibleKey(), "didn't have a key! (value was false)");
		});
	});

	it('should have one table with Address and ZIP and key = address', function() {
		var search = new rdtheory.AttributeSet([Address, ZipCode]);
		var key = new rdtheory.AttributeSet([Address]);
		var has = D.getRelations().some(function (i) {
			if (search.equalTo(i.attr)) {
				if (i.findPossibleKey().equalTo(key))
					return true;
			}

			return false;
		});

		assert(has, "couldn't find such a table");
	});

	it('should have one table with Dept, Pay, Years and key = Dept, Years', function() {
		var search = new rdtheory.AttributeSet([Dept, Pay, YearsEmployed]);
		var key = new rdtheory.AttributeSet([Dept, YearsEmployed]);
		var has = D.getRelations().some(function (i) {
			if (search.equalTo(i.attr)) {
				if (i.findPossibleKey().equalTo(key))
					return true;
			}

			return false;
		});

		assert(has, "couldn't find such a table");
	});

	it('should have one table with Dept, Manager and key = Dept', function() {
		var search = new rdtheory.AttributeSet([Dept, Manager]);
		var key = new rdtheory.AttributeSet([Dept]);
		var has = D.getRelations().some(function (i) {
			if (search.equalTo(i.attr)) {
				if (i.findPossibleKey().equalTo(key))
					return true;
			}

			return false;
		});

		assert(has, "couldn't find such a table");
	});

	it('should have one table with Address, Dept, Name, Phone and key = Name', function() {
		var search = new rdtheory.AttributeSet([Address, Dept, Name, Phone]);
		var key = new rdtheory.AttributeSet([Name]);
		var has = D.getRelations().some(function (i) {
			if (search.equalTo(i.attr)) {
				if (i.findPossibleKey().equalTo(key))
					return true;
			}

			return false;
		});

		assert(has, "couldn't find such a table");
	});

	it('should have one table with Name, Years and key = Name, Years', function() {
		var search = new rdtheory.AttributeSet([Name, YearsEmployed]);
		var key = new rdtheory.AttributeSet([Name, YearsEmployed]);
		var has = D.getRelations().some(function (i) {
			if (search.equalTo(i.attr)) {
				if (i.findPossibleKey().equalTo(key))
					return true;
			}

			return false;
		});

		assert(has, "couldn't find such a table");
	});

});








