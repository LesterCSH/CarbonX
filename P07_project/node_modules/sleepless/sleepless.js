/**

@preserve

Copyright 2021 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 

*/

(function() {

	let M = {};


    const isNode = M.isNode = ( typeof process == "object" && /^v\d+\.\d+\.\d+$/.test( process.version ) );
	const isBrowser = M.isBrowser = ! isNode; 


	// for convenience
    // XXX handle multi-args
	M.log = function( m ) {
		if( typeof m === "object" ) {
			return console.dir( m );
		}
		return console.log( m );
	}

	// throw an Error if a condition is true
	M.throwIf = function(c, s) { if(c) { throw new Error(s || "FAILED ASSERTION"); } }


	// convert and return json as object or null if exception
	M.j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }

	// convert and return object as JSON or null if exception
	M.o2j = function(v, r = null, s = 2) { try { return JSON.stringify(v, r, s) } catch(e) { return null } }


	// convert whatever to float or 0 if not at all numberlike
	// E.g. "123.9" --> 123.9, null --> 0.0, undefined --> 0.0, NaN --> 0.0, 123.9 --> 123.9
    // XXX Not ideal: This coerces to string, then strips out extraneous chars
	M.toFlt = function(v) {
		return parseFloat((""+v).replace(/[^-.0-9]/g, "")) || 0.0;
	}

	// convert whatever to integer or 0 if not at all numberlike
	// E.g. "123" --> 123, null --> 0, undefined --> 0, NaN --> 0, 123 --> 123, -123.9 --> -124
    // XXX Not ideal: see above
	M.toInt = function(v) {
		var n = M.toFlt(v);
		//return Math[n < 0 ? 'ceil' : 'floor'](n);
		return Math.round( n );
	};


	// convert from pennies to dollars
	// E.g.  123456 --> 1234.56
	M.centsToBucks = function(cents) {
		return M.toFlt( M.toInt(cents) / 100 );
	}
	M.c2b = M.centsToBucks;


	// convert dollars to pennies
	// E.g.  1234.56 --> 123456
	M.bucksToCents = function(bucks) {
		return Math.round( (M.toFlt(bucks) * 1000) / 10 );
	}
	M.b2c = M.bucksToCents;


	// format a number into a string with any # of decimal places,
	// and optional alternative decimal & thousand-separation chars
	// numFmt( 1234.56 )	// "1,235"
	// numFmt( 1234.56, 1 )	// "1,234.6"
	// numFmt( 1234.56, 1, "," )	// "1,234,6"
	// numFmt( 1234.56, 1, "_" )	// "1,234_6"
	// numFmt( 1234.56, 1, ",", "." )	// "1.234,6"
	// numFmt( 1234.56, 1, ".", "" )	// "1234.6"
	M.numFmt = function(n, plcs, dot, sep) {
		n = M.toFlt(n);
		sep = typeof sep === "string" ? sep : ",";			// thousands separator char
		dot = typeof dot === "string" ? dot : ".";			// decimal point char
		plcs = M.toInt(plcs);
		var p = Math.pow(10, plcs);
		var n = Math.round( n * p ) / p;
		var sign = n < 0 ? '-' : '';
		n = Math.abs(+n || 0);
		var intPart = parseInt(n.toFixed(plcs), 10) + '';
		var j = intPart.length > 3 ? intPart.length % 3 : 0;
		return sign +
			(j ? intPart.substr(0, j) + sep : '') +
			intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + sep) +
			(plcs ? dot + Math.abs(n - intPart).toFixed(plcs).slice(-plcs) : '');
	}

	// fraction to percent.
	// convert something like 0.12 to a string that looks like "12" with
	// optional alternate decimal and thousands-seperator chars
	// NOTE: there is no "%" added, you have to do that yourself if you want it.
	// toPct( 0.4 ) + "%"		// "40%"
	// toPct( 123.4,",", "." )	// "12,340"
	M.toPct = function(n, plcs, dot, sep) {
		return M.numFmt(n * 100, plcs, dot, sep);
	}


	// Convert whatever to a string that looks like "1,234.56"
	// Add the $ symbol yourself.
	// E.g. toMoney( 1234.56 )				// "1,234.56"
	// E.g. toMoney( 1234.56, 1, ".", "" )	// "1.234,56"
	M.toMoney = function(n, dot, sep) {
		return M.numFmt(n, 2, dot, sep);
	}


	// Returns a human readable string that describes 'n' as a number of bytes,
	// e.g., "1 KB", "21.5 MB", etc.
	M.byteSize = function(sz) {
		if(typeof sz != "number")
			return sz;
		if(sz < 1024)
			return M.numFmt(sz, 0) + " B"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " KB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " MB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " GB"
		sz = sz / 1024
		return M.numFmt(sz, 1) + " TB"
	}


	// Return a Unix timestamp for current time, or for a Date object if provided
	M.time = function( dt ) {
		if( ! dt ) dt = new Date();
		return M.toInt( dt.getTime() / 1000 );
	}


	// Convert "YYYY-MM-YY" or "YYYY-MM-YY HH:MM:SS" to Unix timestamp
	M.my2ts = function(m) {
		if( m.length == 10 && /\d\d\d\d-\d\d-\d\d/.test(m) ) {
			m += " 00:00:00";
		}
		if(m === "0000-00-00 00:00:00") {
			return 0;
		}
		var a = m.split( /[^\d]+/ );
		if(a.length != 6) {
			return 0;
		}
		var year = M.toInt(a[0]);
		var month = M.toInt(a[1]);
		var day = M.toInt(a[2]);
		var hour = M.toInt(a[3]);
		var minute = M.toInt(a[4]);
		var second = M.toInt(a[5]);
		var d = new Date(year, month - 1, day, hour, minute, second, 0);
		return M.toInt(d.getTime() / 1000);
	}

	// Convert Unix timestamp to "YYYY-MM-DD HH:MM:SS"
	M.ts2my = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		return ""+
			d.getFullYear()+
			"-"+
			("0"+(d.getMonth() + 1)).substr(-2)+
			"-"+
			("0"+d.getDate()).substr(-2)+
			" "+ 
			("0"+d.getHours()).substr(-2)+
			":"+
			("0"+d.getMinutes()).substr(-2)+
			":"+
			("0"+d.getSeconds()).substr(-2)+
			"";
	}

	// Convert Unix timestamp to Date object
	// Returns null (NOT a date object for "now" as you might expect) if ts is falsey.
	M.ts2dt = function(ts) {
		ts = M.toInt(ts);
		return ts ? new Date(ts * 1000) : null;
	};

	// Convert Date object to Unix timestamp
	M.dt2ts = function(dt) {
		if(! (dt instanceof Date) )
			return 0;
		return M.toInt(dt.getTime() / 1000);
	};

	// Convert "MM/DD/YYYY HH:MM:SS" to Date object or null if string can't be parsed
	// If year is 2 digits, it will try guess the century (not recommended).
	// Time part (HH:MM:SS) can be omitted and seconds is optional
	// if utc argument is truthy, then return a UTC version
	M.us2dt = function(us, utc) {

		if(!us) {
			return null;
		}

		var m = (""+us).split( /[^\d]+/ );

		if(m.length < 3) {
			return null;
		}
		while(m.length < 7) {
			m.push("0");
		}

		// try to convert 2 digit year to 4 digits (best guess)
		var year = M.toInt(m[2]);
		var nowyear = new Date().getFullYear();
		if(year <= ((nowyear + 10) - 2000))
			year = 2000 + year;
		if(year < 100)
			year = 1900 + year;

		var mon = M.toInt(m[0]) - 1;
		var date = M.toInt(m[1]);

		var hour = M.toInt(m[3]);
		var min = M.toInt(m[4]);
		var sec = M.toInt(m[5]);
		var ms = M.toInt(m[6]);

		if(utc) {
			return new Date(Date.UTC(year, mon, date, hour, min, sec, ms));
		}

		return new Date(year, mon, date, hour, min, sec, ms);
	}

	// Convert "MM/DD/YYYY HH:MM:SS" to Unix timestamp.
	// If utc argument is truthy, then return a UTC version.
	M.us2ts = function(us, utc) {
		return M.dt2ts(M.us2dt(us, utc));
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM:SS" or "" if ts is 0
	M.ts2us = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		return ""+
			("0"+(d.getMonth() + 1)).substr(-2)+
			"/"+
			("0"+d.getDate()).substr(-2)+
			"/"+
			d.getFullYear()+
			" "+ 
			("0"+d.getHours()).substr(-2)+
			":"+
			("0"+d.getMinutes()).substr(-2)+
			":"+
			("0"+d.getSeconds()).substr(-2)+
			"";
	}

	// Convert Unix timestamp to "MM/DD" or "" if ts is 0
	M.ts2us_md = function(ts) {
		return M.ts2us(ts).substr(0, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY" or "" if ts is 0
	M.ts2us_mdy = function(ts) {
		return M.ts2us(ts).substr(0, 10);
	}

	// Convert Unix timestamp to "MM/DD/YY" or "" if ts is 0
	M.ts2us_mdy2 = function(ts) {
        let us = M.ts2us_mdy(ts);
        if( us != "" ) {
            var a = us.split("/");
            a[2] = a[2].substr(2);
            us = a.join("/");
        }
        return us;
	}

	// Convert Unix timestamp to "HH:MM" or "" if ts is 0
	M.ts2us_hm = function(ts) {
		return M.ts2us(ts).substr(11, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM" or "" if ts is 0
	M.ts2us_mdyhm = function(ts) {
        let s = M.ts2us_mdy(ts) + " " + M.ts2us_hm(ts);
		return s != " " ? s : "" ;
	}

	// Convert Unix timestamp to "MM/DD/YY HH:MM" or "" if ts is 0
	M.ts2us_mdy2hm = function(ts) {
        let s = M.ts2us_mdy2(ts) + " " + M.ts2us_hm(ts);
		return s != " " ? s : "" ;
	}

	// Convert Unix timestamp to something like "01-Jan-2016" or "" if ts is 0
	M.ts2us_dMy = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		var month_names = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
		return ""+
			("0"+d.getDate()).substr(-2)+
			"-"+
			month_names[d.getMonth()]+
			"-"+
			d.getFullYear();
	}


	// return an array containing only distinct values.
	// E.g.  [ 1,2,2 ].distinct()		// [1,2]
	Array.prototype.distinct = function( cb ) {
		let hash = {};
		for( let el of this ) {
			hash[ cb ? cb( el ) : (""+el) ] = true;
		}
		return Object.keys( hash );
	}


	// Make all lowercase
	// E.g.  "Foo".lcase()		// "foo"
	String.prototype.lcase = function() { return this.toLowerCase() }

	// Make all uppercase
	// E.g.  "Foo".ucase()		// "FOO"
	String.prototype.ucase = function() { return this.toUpperCase() }

	// Capitalize first word
	// E.g.  "foo bar".ucfirst()		// "Foo bar"
	String.prototype.ucfirst = function() {
		return this.substring(0,1).toUpperCase() + this.substring(1)
	}

	// Capitalize all words
	// E.g.  "foo bar".ucwords()		// "Foo Bar"
	String.prototype.ucwords = function( sep ) {
		sep = sep || /[\s]+/;
		var a = this.split( sep );
		for( var i = 0; i < a.length; i++ ) {
			a[ i ] = a[ i ].ucfirst();
		}
		return a.join( " " );
	}

	// Returns true if the string begins with the prefix string
	// E.g.	"Foobar".startsWith( "Foo" ) 		// true
	// E.g.	"foobar".startsWith( "Foo" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.startsWith === undefined ) {
		String.prototype.startsWith = function(prefix) {
			return this.substr(0, prefix.length) == prefix;
		}
	}

	// Returns true if the string ends with the suffix string
	// E.g.	"Foobar".endsWith( "bar" ) 		// true
	// E.g.	"foobar".endsWith( "Bar" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.endsWith === undefined ) {
		String.prototype.endsWith = function(suffix) {
			return this.substr(-suffix.length) == suffix;
		}
	}

	// Abbreviate to 'l' chars with ellipses
	// E.g. "Foo bar baz".abbr(6)  // "Fo ..."
	String.prototype.abbr = function(l) {
		l = M.toInt(l) || 5;
		if(this.length <= l) {
			return "" + this;	// Cuz ... some times this === a String object, not a literal
		}
		return this.substr(0, l - 4) + " ...";
	}

	// Convert a string from something like "prof_fees" to "Prof Fees"
	String.prototype.toLabel = function() {
		var s = this.replace( /[_]+/g, " " );
		s = s.ucwords();
		return s;
	}

	// Convert a string from something like "Prof. Fees" to  "prof_fees"
	String.prototype.toId = function() {
		var s = this.toLowerCase();
		s = s.replace( /[^a-z0-9]+/g, " " );
		s = s.trim();
		s = s.replace( /\s+/g, "_" );
		return s;
	}

	// Returns true if string contains all of the arguments irrespective of case
	// "I,\nhave a lovely bunch of coconuts".looksLike("i have", "coconuts") == true
	String.prototype.looks_like = function() {
		var a = Array.prototype.slice.call(arguments);        // convert arguments to true array
		var s = "_" + this.toId() + "_"; //.split("_"); //toLowerCase();
		for(var i = 0; i < a.length; i++) {
			var t = "_" + (a[i].toId()) + "_";
			if(s.indexOf(t) == -1)
				return false;
		}
		return true;
	}
    String.prototype.looksLike = String.prototype.looks_like;   // Deprecate

	// Replaces instances of "__key__" in string s,
	// with the values from corresponding key in data.
	String.prototype.substitute = function( data ) {
		let s = this;
		for( let key in data ) {
			let re = new RegExp( "__" + key + "__", "g" );
			s = s.replace( re, "" + data[ key ] );
		}
		return s;
	}

	// Returns true if the string looks like a valid email address
	String.prototype.is_email = function() {
		return /^[A-Za-z0-9_\+-]+(\.[A-Za-z0-9_\+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$/.test(this);
	}

	// Create this:
	//String.prototype.is_url = function() {
	//}


	// Returns a human readable relative time description for a Unix timestmap versus "now"
	// E.M. agoStr( time() - 60 ) 	// "60 seconds ago"
	// E.M. agoStr( time() - 63 ) 	// "1 minute ago"
	// Pass a truthy value for argument 'no_suffix' to suppress the " ago" at the end
	M.ago_str = function(ts, no_suffix) {
		if(ts == 0)
			return "";

		var t = M.time() - ts;
		if(t < 1)
			return "Just now";

		var v = ""
		var round = Math.round
			
		if(t>31536000) v = round(t/31536000,0)+' year'; 
		else if(t>2419200) v = round(t/2419200,0)+' month'; 
		else if(t>604800) v = round(t/604800,0)+' week'; 
		else if(t>86400) v = round(t/86400,0)+' day'; 
		else if(t>3600) v = round(t/3600,0)+' hour'; 
		else if(t>60) v = round(t/60,0)+' minute'; 
		else v = t+' second'; 
			
		if(M.toInt(v) > 1)
			v += 's'; 

		return v + (no_suffix ? "" : " ago");
	}
    M.agoStr = M.ago_str;   // deprecate

	
	// Run some functions in parallel / simultaneously
	// runp() (no args) is DEPRECATED
	M.runp = function( a_this, ...args ) {

		const legacy_runp = function() {
			var o = {};
			var q = [];
			var add = function add() {
				let args = Array.prototype.slice.call(arguments);
				if( typeof args[ 0 ] === "function" ) {
					q.push( args );
					return o;
				}
				let arr = args.shift();
				let fun = args.shift();
				arr.forEach( x => {
					q.push( [ fun, x ].concat( args ) );
				});
				return o;
			};
			var run = function(cb) {
				var errors = [];
				var results = [];
				var num_done = 0;
				if( q.length == 0 ) {
					if(cb) {
						cb(errors, results);
					}
					return;
				}
				q.forEach(function(args, i) {
					let fun = args.shift();
					args.unshift( function(e, r) {
						errors[i] = e || null;
						results[i] = r || null;
						num_done += 1;
						if(num_done == q.length) {
							if(cb) {
								cb(errors, results);
							}
						}
					} );
					fun.apply( null, args );
				});
			};
			o.add = add;
			o.run = run;
			return o;
		};

		if( a_this === undefined && args.length == 0 ) {
			return legacy_runp(); // revert to old behavior
		}

		const calls = [];

		// Add a call 
		const add = function( fun, ...args ) {
			calls.push( { fun, args } );
			return me;
		}

		const run = function( done ) {

			const results = [];
			let num_done = 0;

			// advance the num_done count, then if we're finished, call done()
			const one_done = function() {
				num_done += 1;
				if( num_done == calls.length )
					done( results );
			};

			// step through all the calls and fire them off
			calls.forEach( ( next, i ) => {
				const { fun, args } = next;	// dereference function and args
				// append okay, fail funcs to args
				args.push( function( data ) {
					results[ i ] = { data };	// store data in results and advance done count
					one_done();
				} );
				args.push( function( error ) {
					results[ i ] = { error };	// store error in results and advance done count
					one_done();
				} );
				fun.apply( a_this, args );	// call the function with the remaining array elements as args

			} );

			return me;
		}

		const me = { add, run };

		return me;

	};


	// Run some functions sequentially / synchronously ( see test.js )
	// runq() (no args) is DEPRECATED
	M.runq = function( a_this, ...args ) {

		// This is the old original version
		const legacy_runq = function() {
			var o = {};
			var q = []
			var add = function(f) {
				q.push(f);
				return o;
			};
			var run = function(cb, arg) {
				if(q.length == 0) {
					cb(null, arg);
					return;
				}
				var f = q.shift();
				f(function(e, arg) {
					if(e) {
						q = [];
						cb(e, arg);
					}
					else {
						run(cb, arg);
					}
				}, arg);
			};
			o.add = add
			o.run = run
			return o
		};
		if( a_this === undefined && args.length == 0 ) {
			return legacy_runq(); // revert to old behavior
		}

		const queue = [];		// holds the queued calls
		const results = [];		// collects the results from each call

		// Add a call to the queue
		const add = function( fun, ...args ) {
			queue.push( { fun, args } );
			return me;
		}

		// starts the queue running
		const run = function( _okay, _fail ) {
			const call_one = function() {
				const next = queue.shift();	// get next call from queue, which is an array
				if( ! next ) {
					// queue empty; all done
					_okay( results );
					return;
				}
				const { fun, args } = next;	// dereference function and args
				// append okay and fail args
				args.push( function( data ) {
					results.push( data );	// store the returned results
					setTimeout( call_one, 1 );	// move on to the next call
				} );
				args.push( function( error ) {
					_fail( error );		// call the _fail function; nothing else happens
				} );
				fun.apply( a_this, args );	// call the function with the remaining array elements as args
			};
			call_one();
			return me;
		}

		const me = { add, run };

		return me;
	};


	// Sort of like Markdown, but not really.
	M.t2h = function( t ) {

		// nuke CRs
		t = t.replace(/\r/gi, "\n")

		// remove leading/trailing whitespace on all lines
		// t = t.split( /\n/ ).map( l => l.trim() ).join( "\n" );

		// append/prepend a couple newlines so that regexps below will match at beginning and end
		t = "\n\n" + t + "\n\n";		// note: will cause a <p> to always appear at start of output
		// DEPRECATE - old style
		// hyper link/anchor
		// (link url)
		// (link url alt_display_text)
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*\)/gi, "<a href=\"$1\">$1</a>");
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a href=\"$1\">$2</a>");

		// DEPRECATE - old style
		// hyper link/anchor that opens in new window/tab
		// (xlink url)
		// (xlink url alt_display_text)
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*\)/gi, "<a target=_blank href=\"$1\">$1</a>");
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a target=_blank href=\"$1\">$2</a>");

		// DEPRECATE - old style
		// image
		// (image src title)
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*\)/gi, "<img src=\"$1\">");
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<img src=\"$1\" title=\"$2\">");


		// hyper link/anchor
		t = t.replace( /\^\^\s*([^\s]*)\s*\^\^/gi, "^$1 $1^" );
		t = t.replace( /\^\^\s*([^\s]*)\s+([^\^]+)\^\^/gi, "<a target=_blank href=\"$1\">$2</a>" );
		t = t.replace( /\^\s*([^\s]*)\s*\^/gi, "^$1 $1^" );
		t = t.replace( /\^\s*([^\s]*)\s+([^\^]+)\^/gi, "<a href=\"$1\">$2</a>" );

		// image
		t = t.replace(/\|\s*([^\s\)]+)\s*\|/gi, "(image $1 $1)");
		t = t.replace(/\|\s*([^\s\)]+)\s*([^\)]+)\|/gi, "<img src=\"$1\" title=\"$2\">");

		// figure
		// (figure src caption)
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*\)/gi, "(figure $1 $1)");
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<figure><img src=\"$1\" title=\"$2\"><figcaption>$2</figcaption></figure>");

		// symbols
		// (tm)	
		// (r)
		// (c)
		// (cy)				"(C) 2021"
		// (cm Foocorp)		"(C) 2021 Foocorp All Rights Reserved"
		t = t.replace(/\(tm\)/gi, "&trade;");	
		t = t.replace(/\(r\)/gi, "&reg;");	
		t = t.replace(/\(c\)/gi, "&copy;");
		//t = t.replace(/\(cy\)/gi, "&copy;&nbsp;"+(new Date().getFullYear()));
		//t = t.replace(/\(cm\s([^)]+)\)/gi, "&copy;&nbsp;"+(new Date().getFullYear())+"&nbsp;$1&nbsp;&ndash;&nbsp;All&nbsp;Rights&nbsp;Reserved" )

		// one or more blank lines mark a paragraph
		t = t.replace(/\n\n+/gi, "\n\n<p>\n");
		
		// headings h1 and h2
		// Heading 1
		// =========
		// Heading 2
		// ---------
		// Heading 3
		// - - - - -
		// Heading 4
		// -  -  -  -  -
		// Heading 5
		// -   -   -   -   -
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s\s){4,}-\n/gi, "\n<h5>$1</h5>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s){4,}-\n/gi, "\n<h4>$1</h4>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s){4,}-\n/gi, "\n<h3>$1</h3>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n-{5,}\n/gi, "\n<h2>$1</h2>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n={5,}\n/gi, "\n<h1>$1</h1>\n" );

		// styles
		// //italic//
		// **bold**
		// __underline__
		t = t.replace(/([^:])\/\/(.*)\/\//gi, "$1<i>$2</i>");
		t = t.replace(/\*\*(.*)\*\*/gi, "<b>$1</b>");
		t = t.replace(/__(.*)__/gi, "<u>$1</u>");

		// "
		// block quote text
		// "
		t = t.replace(/\n\s*"\s*\n([^"]+)"\s*\n/gi, "\n<blockquote>$1</blockquote>\n");	// blockquote

		// >
		// centered text
		// >
		t = t.replace(/\n\s*>\s*\n([^>]+)>\s*\n/gi, "\n<div style='text-align:center;'>$1</div>\n");

		// >>
		// right justified text
		// >>
		t = t.replace(/\n\s*>>\s*\n([^>]+)>>\s*\n/gi, "\n<div style='text-align:right'>$1</div>\n");

		// {{
		//     code block
		// }}
		// foo {inline code} bar
		t = t.split( "{{\n" ).join( "<pre><code>" );	// code block
		t = t.split( "}}\n" ).join( "</code></pre>" );
		t = t.replace(/{([^}]+)}/gi, "<code>$1</code>");	// inline code

		// Unordered list
		// - item 
		// - item
		t = t.replace(/\n((\s*-\s+[^\n]+\n)+)/gi, "\n<ul>\n$1\n</ul>");
		t = t.replace(/\n\s*-\s+/gi, "\n<li>");

		// Ordered list 
		// 1. item 1
		// # item 2
		// 1. item 3
		t = t.replace(/\n((\s*(\d+|#)\.?\s+[^\n]+\n)+)/gi, "\n<ol>\n$1\n</ol>");
		t = t.replace(/\n\s*(\d+|#)\.?\s+([^\n]+)/gi, "\n<li>$2</li>");

		// Horiz. rule
		// ---- (4 or more dashes)
		t = t.replace(/\n\s*-{4,}\s*\n/gi, "\n<hr>\n");		// horizontal rule

		// Dashes
		// --  (n-dash)
		// ---  (m-dash)
		t = t.replace(/-{3}/gi, "&mdash;");		// mdash
		t = t.replace(/-{2}/gi, "&ndash;");		// ndash

		if( typeof navigator !== "undefined" ) {
			// Only supported if running in browser

			// (lastModified)		// last modified data of document.
			t = t.replace(/\(\s*lastModified\s*\)/gi, document.lastModified);
		}

		return t;
	};


    // - - - - - - - - - - -
	// The inimitable Log5 ...
    // - - - - - - - - - - -
	(function() {
		var util = null;
		var style = null;
		if( isNode ) {
			util = require( "util" );
			// style = require( "./ansi-styles.js" );
		}
		const n0 = function(n) {
			if(n >= 0 && n < 10)
				return "0"+n
			return n
		}
		const ts = function() {
			var d = new Date()
			return d.getFullYear() + "-" +
				n0(d.getMonth()+1) + "-" +
				n0(d.getDate()) + "_" +
				n0(d.getHours()) + ":" +
				n0(d.getMinutes()) + ":" +
				n0(d.getSeconds())

		}
		const mkLog = function(prefix) {
			prefix = " " + (prefix || "")
			var o = {}
			o.logLevel = 0
			var f = function logFunc( l ) {
				var n = 0, ll = l
				if( typeof l === "number" ) {	// if first arg is a number ...
					if(arguments.length == 1) {	// and it's the only arg ...
						o.logLevel = l			// set logLevel to l
						return logFunc			// and return
					}
					// there are more args after the number
					n = 1	// remove the number from arguments array
				}
				else {
					ll = 0	// first arg is not number, log level for this call is 0
				}
				if( o.logLevel < ll )	// if log level is below the one given in this call ...
					return logFunc;		// just do nothing and return 
				let s = ts() + prefix;
				for( var i = n; i < arguments.length; i++ ) {	// step through args
					let x = arguments[ i ];
					if( x === undefined ) {
						x = "undefined";
					}
					if( typeof x === "object" ) {	// if arg is an object ...
						if( isNode ) {				// and we're in node ...
							x = util.inspect( x, { depth: 10 } );	// convert obj to formatted JSON
						} else {					// otherwise ...
							x = M.o2j( x );			// just convert obj to JSON
						}
					}
					s += x;					// append to the growing string
				}
				if( isNode && style ) {
					if( process.stdout.isTTY ) {
						switch( ll ) {
						case 1:
							s = `${style.red.open}${s}${style.red.close}`;
							break;
						case 2:
							s = `${style.yellow.open}${s}${style.yellow.close}`;
							break;
						case 3:
							break;
						case 4:
							s = `${style.cyan.open}${s}${style.cyan.close}`;
							break;
						case 5:
							s = `${style.magenta.open}${s}${style.magenta.close}`;
							break;
						}
					}
					process.stdout.write( s + "\n" );	// write string to stdout
				} else {
					switch( ll ) {
					case 1: console.error( s ); break;
					case 2: console.warn( s ); break;
					default: console.log( s ); break;
					}
				}
				return logFunc
			}
			f.E = function( s ) { f( 1, "******* " + s ); }    // error
			f.W = function( s ) { f( 2, "- - - - " + s ); }    // warning
			f.I = function( s ) { f( 3, s ); }                 // info
			f.V = function( s ) { f( 4, s ); }                 // verbose
			f.D = function( s ) { f( 5, s ); }                 // debug
			return f;
		}
		const defLog = mkLog("")(3);
		defLog.mkLog = mkLog;
		M.log5 = defLog;
		M.L = defLog;
	})();



	if( isNode ) {

        // - - - - - - - - - - -
		// Node.js only stuff
        // - - - - - - - - - - -

		const fs = require("fs");
		const crypto = require("crypto");
		const https = require("https");


		// Read a file from disk
		// Reads async if callback cb is provided,
		// otherwise reads and returns contents synchronously.
		M.get_file = function(path, enc, cb) {
			if(!cb) {
				return fs.readFileSync(path, enc);
			}
			fs.readFile(path, enc, cb);
		};

		M.getFile = M.get_file; // DEPRECATE in favor of get_file();


		// get fs stat object
		// if cb provided, do it asyncrhonously and call cb
		// returns fs.Stats object or null if error (ENOENT)
		M.file_info = function( path, cb ) {
			let st = null;
			if( ! cb ) {
				// do synchronously
				st = fs.statSync( path, { throwIfNoEntry: false } );
				return st;
			}
			// do async 
			fs.stat( path, ( error, st ) => {
				if( error )
					cb( null );
				else
					cb( st );
			} );
		};

		M.is_file = function( path, cb ) {
			if( ! cb ) {
				let st = M.file_info( path );
				return st ? st.isFile() : false;
			}
			M.file_info( path, st => {
				cb( st ? st.isFile() : false );
			} );
		};

		M.is_dir = function( path, cb ) {
			if( ! cb ) {
				let st = M.file_info( path );
				return st ? st.isDirectory() : false;
			}
			M.file_info( path, st => {
				cb( st ? st.isDirectory() : false );
			} );
		};

		// Return ASCII sha1 for a string
		M.sha1 = function(s) {
			var h = crypto.createHash("sha1");
			h.update(s);
			return h.digest("hex");
		};

		// Return ASCII sha256 for a string
		M.sha256 = function(s) {
			var h = crypto.createHash("sha256");
			h.update(s);
			return h.digest("hex");
		};

		M.rand_hash = function( salt = "" ) {
            return M.sha1( "" + ( Date.now() + Math.random() ) );
			//return M.sha1( salt + ( Date.now() + M.time() ) );
		};

        //M.DS = require( "ds" );
        /*
		// DS (datastore)
		(function() {
			const load = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				try {
					const ds = JSON.parse( fs.readFileSync( f ) );
					for( let key in ds ) 
						self[ key ] = ds[ key ];
				} catch( e ) {
					self.clear();
				} 
			}
			// this may throw exception, but it's up to caller to deal with it.
			const save = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				fs.writeFileSync( f, JSON.stringify( self, null, 4 ) );
			}
			const clear = function() {
				const self = this;
				for( let key in self ) 
					delete self[ key ];
			}
			const ldsv = { load:load, save:save, clear:clear }
			const F = function( file, opts ) {
				var self = this;
				self.file = file;
				self.opts = opts || {};
			}
			F.prototype = ldsv;
			const D = function( f, opts ) {
				const self = this;
				self.__proto__ = new F( "ds.json", opts );
				self.load( f );
			}
			D.prototype = new F();
			M.DS = D
		})();
        */


        // XXX deprecate - fetch()?
		M.rpc = function( url, data, okay = ()=>{}, fail = ()=>{}, _get = false, _redirects = 0 ) {
			if( _get ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			// check for looping
			_redirects = M.toInt( _redirects );
			if( _redirects > 10 ) {
				fail( "Too many redirects" ); // methinks we loopeth
				return;
			}
			const method = _get ? "GET" : "POST";
			let opts = {
				method: method,
				headers: {
					//"Content-Type": "application/json",	// will always send this, and ...
					"Accept": "application/json",		// will accept this in response
				}
			};
			if( method != "GET" )
				opts.headers[ "Content-Type" ] = "application/json";
			let json = "";	// collected response
			let req = https.request( url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {	// if it's an "okay" ...
						let r = M.j2o( json );
						if( ! r ) {
							return fail( "Error parsing response from server." );
						}
						if( r.error ) {
							return fail( r.error );
						}
						okay( r.data, res );		// done!
					} else {
						if( statusCode >= 300 && statusCode < 400 ) {	// if it's a redirect ...
							let url = headers[ "location" ] || headers[ "Location" ];	// get new url
							M.rpc( url, okay, fail, _get, _redirects + 1 );	// recursively try the new location
						} else {	// otherwise ...
							fail( "HTTP Error "+statusCode, json, req );	// just give up.
						}
					}
				});
			});
			req.on( "error", fail );
			req.write( _get ? "" : M.o2j( data ) );
			req.end();
		};


        // XXX deprecate - fetch()?
		M.rpc2 = function( url, opts, data, okay = ()=>{}, fail = ()=>{}, _redirects = 0 ) {

			// check for looping
			_redirects = M.toInt( _redirects );
			if( _redirects > 10 )
				return fail( "Too many redirects" ); // methinks we loopeth

			if( ! opts.method )
				opts.method = "POST";
			if( ! opts.headers )
				opts.headers = {};

			if( opts.method.toUpperCase() == "POST" ) {
				// set content-type for POST requests
				opts.headers[ "Content-Type" ] = "application/json";
			} else {
				// add data to the URL as query args for non-POST requests
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
				data = null;
			}

			let json = "";	// collected response
			let req = https.request( url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {
						// it's an "okay"
						// XXX make this tolerate an empty response
						let r = M.j2o( json );
						if( ! r )
							return fail( "Error parsing response from server." );
						//return okay( r, res );
						if( r.error ) {
							return fail( r.error );
						}
						return okay( r.data, res );		// done!
					} else {
						if( statusCode >= 300 && statusCode < 400 ) {
							// it's a redirect ...
							// get new url
							let url = headers[ "location" ] || headers[ "Location" ];
							// recursively try the new location
							M.rpc2( url, opts, data, okay, fail, _get, _redirects + 1 );
						} else {
							// not a redirect so fail
							return fail( "HTTP Error "+statusCode, json, req );
						}
					}
				});
			});
			req.on( "error", fail );
			req.write( data ? M.o2j( data ) : "" );
			req.end();
		};


		// This is a connect/express middleware that creates okay()/fail() functions on the response
		// object for responding to an HTTP request with a JSON payload.
		// XXX This may not really belong in sleepless.js
		// DEPRECATE and remove
		/*M.mw_fin_json = function( req, res, next ) {
			res.done = ( error, data ) => {
				let json = JSON.stringify( { error, data } );
				res.writeHead( 200, { "Content-Type": "application/json", });
				res.write( json );
				res.end();
			};
			res.fail = ( error, body ) => { res.done( error, body ); };
			res.okay = ( data ) => { res.done( null, data ); };
			next();
		};*/


        //M.sessions = require( "sleepless-sessions" );

        //M.db = require( "db" );

	} else {

        // - - - - - - - - - - -
		// Browser only stuff
        // - - - - - - - - - - -

		M.LS = {
			// XXX Add ttl feature
			get: function( k ) {
				try {
					return M.j2o( localStorage.getItem( k ) );
				} catch( e ) { }
				return null;
			},
			set: function( k, v ) {
				try {
					return localStorage.setItem( k, M.o2j( v ) );
				} catch( e ) { }
				return null;
			},
			clear: function() {
				return localStorage.clear();
			}
		};

		// Navigate to new url
		M.jmp = function(url) { document.location = url; };

		// Reload current page
		M.reload = function() { document.location.reload(); };


		// Make an async HTTP GET request for a URL
		M.get_file = function(url, cb) {
			var x = new XMLHttpRequest();
			x.onload = function() { cb(x.responseText, x); };
			x.open("GET", url);
			x.send();
		};

		// DEPRECATE in favor of get_file();
		M.getFile = M.get_file;


		M.rpc = function( url, data, okay = ()=>{}, fail = ()=>{}, _get = false ) {
			if( _get ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			const method = _get ? "GET" : "POST";
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				let r = M.j2o( xhr.responseText );
				if( ! r ) {
					return fail( "Error parsing response from server." );
				}
				if( r.error ) {
					return fail( r.error );
				}
				okay( r.data, xhr );
			};
			xhr.onerror = fail;
			xhr.open( method, url );
			if( method != "GET" )
				xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.setRequestHeader( "Accept", "application/json" );
			if( method == "POST" && data ) {
				xhr.send( M.o2j( data ) );
			} else {
				xhr.send();
			}
		};

		M.rpc2 = function( url, opts, data, okay = ()=>{}, fail = ()=>{}, _redirects = 0 ) {
			let method = opts.method ? opts.method.ucase() : "POST";
            let headers = opts.headers ? opts.headers : {};
			if( method == "GET" ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				let r = M.j2o( xhr.responseText );
				if( ! r ) {
					return fail( "Error parsing response from server." );
				}
				if( r.error ) {
					return fail( r.error );
				}
				okay( r.data, xhr );
			};
			xhr.onerror = fail;
			xhr.open( method, url );
			if( method != "GET" )
				xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.setRequestHeader( "Accept", "application/json" );
            for( let k in opts.headers ) {
                xhr.setRequestHeader( k, opts.headers[ k ] );
            }
			if( method != "GET" && data ) {
				xhr.send( M.o2j( data ) );
			} else {
				xhr.send();
			}
		};


		// Returns an object constructed from the current page's query args.
		M.query_data = function( key ) {
			var o = {};
			var s = document.location.search;
			if(s) {
				var kv = s.substr(1).split("&")
				for(var i = 0; i < kv.length; i++) {
					var aa = kv[i].split("=");
					o[aa[0]] = decodeURIComponent(aa[1]);
				}
			}
            if( key !== undefined && typeof key === "string" )
                return o[ key ];
			return o
		};

		// DEPRECATE in favor of query_data()
		M.getQueryData = M.query_data;


		// Return all elements matching query selector as an array
		M.QS = function( qs ) {
			return document.querySelectorAll( qs ).toArray();
		};

		// Return first element matching query selector
		M.QS1 = function( qs ) {
			return M.QS( qs )[ 0 ];
		};


		// Convert HTMLCollection to normal array
		HTMLCollection.prototype.toArray = function() {
			let arr = [];
			for(let i = 0; i < this.length; i++) {
				arr.push( this[ i ]);
			}
			return arr;
		};

		// Convert NodeList to normal array
		NodeList.prototype.toArray = HTMLCollection.prototype.toArray;

		// Add a class to an element
		HTMLElement.prototype.addClass = function(c) {
			let cl = this.classList;
			if( ! cl.contains( c ) )
				cl.add( c );
			return this;
		};

		HTMLElement.prototype.hasClass = function(c) {
			return this.classList.contains( c );
		};

		// Remove a class from an element
		HTMLElement.prototype.remClass = function(c) {
			let cl = this.classList;
			if( cl.contains( c ) )
				cl.remove( c );
			return this;
		};

        // Remember original display, then set display to 'none'
        HTMLElement.prototype.hide = function() {
            if( this.style._orig_display === undefined )
                this.style._orig_display = this.style.display;
            this.style.display = "none";
            return this;
        };

        // If original display was remembered, set display to that
        // Note unhide() is not exactly the same as show()
        HTMLElement.prototype.unhide = function() {
            if( this.style._orig_display !== undefined )
                this.style.display = this.style._orig_display;
            return this;
        };


        // Remember original display, then set display to 'inherit'
        HTMLElement.prototype.show = function() {
            if( this.style._orig_display === undefined )
                this.style._orig_display = this.style.display;
            this.style.display = "inherit";
            return this;
        }

        // If original display was remembered, set display to that
        // Note unshow() is not exactly the same as hide()
        HTMLElement.prototype.unshow = HTMLElement.prototype.unhide;


		// Find all child elements matching query selector
		HTMLElement.prototype.find = function( qs ) {
			return this.querySelectorAll( qs ).toArray();
		}

		// Find first child element matching query selector
		HTMLElement.prototype.find1 = function( qs ) {
			return this.find( qs )[ 0 ];
		}

		HTMLElement.prototype.findNamed = function( name ) {
			return this.find( "[name="+name+"]" );
		}

		HTMLElement.prototype.findNamed1 = function( name ) {
			return this.findNamed( name )[ 0 ];
		}

		// Get (or set if v is provided) an attribute's value
		HTMLElement.prototype.attr = function(a, v) {
			if(v !== undefined) {
				this.setAttribute(a, v);
				return this;
			}
			else {
				return this.getAttribute(a);
			}
		};

		// Get (or set if v is provided) an element's value
		HTMLElement.prototype.val = function(v, chg = false) {
			if(v !== undefined) {
				this.value = v;
                if( chg ) {
                    // fire a change event
                    const evt = new Event( "change" );
                    this.dispatchEvent( evt );
                }
				return this;
			}
			else {
				return (this.value || "").trim();
			}
		};

        // fire a fake change event on an element
        HTMLElement.prototype.change = function() {
            const evt = new Event( "change" );
            this.dispatchEvent( evt );
            return this;
        };

		// Get (or set if h is provided) an element's innerHTML
		HTMLElement.prototype.html = function(h) {
			if(h !== undefined) {
				this.innerHTML = h;
				return this;
			}
			else {
				return this.innerHTML;
			}
		};

		// Injects data values into a single DOM element
		HTMLElement.prototype.inject = function( data ) {
			let e = this;

			// Inject into the body of the element
			e.innerHTML = e.innerHTML.substitute( data );

			// Inject into the attributes of the actual tag of the element.
			let attrs = e.attributes;
			for( let i = 0 ; i < attrs.length ; i++ ) {
				let attr = attrs[ i ];
				let val = attr.value;
				if( val ) {
					if( typeof val === "string" ) {
						if( val.match( /__/ ) ) {
							attr.value = val.substitute( data );
						}
					}
				}
			}
			return e;
		}


		// handy thing to grab the data out of a form
		HTMLFormElement.prototype.getData = function() {
			const types = "input select textarea".toUpperCase().split( " " );
			let data = {};
			for( let i = 0 ; i < this.elements.length ; i++ ) {
				const e = this.elements[ i ];
				if( types.includes( e.tagName ) ) {
					data[ e.name ] = e.value;
				}
			}
			return data;
		};

		// Takes an object, copies values into matching named form fields,
		// then sets onchange handlers that update the object values.
		HTMLFormElement.prototype.setData = function( d, change_cb ) {
			for( let e of this.elements ) {
				let k = e.name;
				if( d[ k ] !== undefined ) {
					let v = d[ k ];
					if( e.type == "checkbox" )
						e.checked = !! v;
					else
						e.value = v;
					e.onchange = evt => {
						let v = e.value;
						if( e.type == "checkbox" )
							v = !! e.checked;
						d[ k ] = v;
						if( change_cb )
							change_cb( evt );
					};
				}
			}
		};


		// ---------------------------------------
		// The world renowned rplc8()!
		// ---------------------------------------
		(function() {

			// Replaces instances of "__key__" in string s,
			// with the values from corresponding key in data.
			let substitute = function( s, data ) {
				return s.substitute( data );
			}

			// Injects data values into a single DOM element
			let inject = function( e, data ) {
				return e.inject( data );
			}

			// The main function
			M.rplc8 = function( elem, data, cb ) {

				// If elem isn't a DOM element, then it has to be query selector string
				if( ! ( elem instanceof HTMLElement ) ) {
					if( typeof elem !== "string" ) {
						throw new Error( "rplc8: invalid selector string" );
					}
					let coll = document.querySelectorAll( elem );
					if( coll.length !== 1 ) {
						throw new Error( "rplc8: selector \""+elem+"\" matches "+coll.length+" elements" );
					}
					elem = coll[ 0 ];
				}

				let sib = elem.nextSibling;		// Might be null.
				let mom = elem.parentNode;		// Almost certainly not null.
				let clones = [];

				mom.removeChild( elem );		// Take template out of the DOM.

				let validate_data = function( data ) {
					// Ensure that data is an array or object
					if( ! ( data instanceof Array ) ) {
						// If it's a single object, put it into an array.
						if( typeof data === "object" ) {
							data = [ data ];
						}
						else {
							data = [];
							//throw new Error( "rplc8: Replication is neither array nor object." );
						}
					}

					// Ensure that the first element in the array is an object.
					if( data.length > 0 && typeof data[ 0 ] !== "object" ) {
						throw new Error( "rplc8: Replication data array does not contain objects." );
					}

					return data;
				}

				let obj = { };

				let splice = function( index, remove_count, new_data, cb ) {

					if( index < 0 ) {
						index = clones.length + index;
					}
					if( index > clones.length) {
						index = clones.length;
					}

					let sib = clones[ index ] || null;

					if( index < clones.length ) {
						// remove the old clones
						let n = 0;
						while( n < remove_count && index < clones.length ) {
							let clone = clones.splice( index, 1 )[ 0 ];
							sib = clone.nextSibling;
							mom.removeChild( clone );
							n += 1;
						}
					}

					// insert new clones if data provided
					if( new_data ) {
						data = validate_data( new_data );
						let n = 0
						while( n < data.length ) {
							let d = data[ n ];						// Get data object from array.
							let clone = elem.cloneNode( true );		// Clone template element and
							inject( clone, d );						// inject the data.
							mom.insertBefore( clone, sib );			// Insert it into the DOM
							let i = index + n;
							clones.splice( i, 0, clone );	// insert clone into array
							if( cb ) {								// If call back function provided,
								// then call it with a refreshing function
								cb( clone, d, i, function( new_data, cb ) {
									splice( i, 1, new_data, cb );
								});	
							}
							n += 1;
						}
					}

					return obj;
				}

				let append = function( data, cb ) {
					return splice( clones.length, 0, data, cb );
				}

				let prepend = function( data, cb ) {
					return splice( 0, 0, data, cb );
				}

				let update = function( data, cb ) {
					return splice( 0, clones.length, data, cb );
				}

				let clear = function( index, count ) {
					return splice( index || 0, count || clones.length );
				}

				update( data, cb );

				obj.splice = splice;
				obj.append = append;
				obj.prepend = prepend;
				obj.update = update;
				obj.clear = clear;

				return obj;
			};

			M.rplc8.substitute = substitute;
			M.rplc8.inject = inject;

		})();


		// Lets you navigate through pseudo-pages within an actual page
		// without any actual document fetching from the server.
        // XXX deprecate in favor of navigate
		M.Nav = function(data, new_show) {

			if(typeof data === "function") {
				new_show = data;
				data = null;
			}

			if(!data) {
				// no data object passed in use current query data 
				data = {};
				var a = document.location.search.split(/[?&]/);
				a.shift();
				a.forEach(function(kv) {
					var p = kv.split("=");
					data[p[0]] = (p.length > 1) ? decodeURIComponent(p[1]) : "";
				})
			}

			var state = { pageYOffset: 0, data: data };

			// build URL + query-string from current path and contents of 'data'
			var qs = "";
			for(var k in data) {
				qs += (qs ? "&" : "?") + k + "=" + encodeURIComponent(data[k]);
			}
			var url = document.location.pathname + qs;

			// if browser doesn't support pushstate, just redirect to the url
			if(history.pushState === undefined) {
				document.location = url;
				return;
			}

			if(!Nav.current_show) {
				// 1st time Nav() has been called

				// set current show func to a simple default 
				Nav.current_show = function(data) {
					if(data["page"] !== undefined) {
						// hide all elements with class "page" by setting css display to "none"
						var pages = document.getElementsByClassName('page')
						for(var i = 0; i < pages.length; i++ ) {
							pages[ i ].style.display = "none";
						}
						// jump to top of document
						document.body.scrollIntoView();
						// show the new page
						var p = document.getElementById( "page_"+data.page ).style.display = "inherit";
					}
				}

				if(history.replaceState !== undefined) {
					// set state for the current/initial location
					history.replaceState(state, "", url);
					// wire in the pop handler
					window.onpopstate = function(evt) {
						if(evt.state) {
							var data = evt.state;
							Nav.current_show(evt.state.data);
						}
					}
				}
			}
			else {
				// this is 2nd or later call to Nav()
				state.pageYOffset = window.pageYOffset;
				history.pushState(state, "", url);
			}

			// if new show func supplied, start using that one
			if(new_show) {
				Nav.current_show = new_show;
			}

			Nav.current_show(data);
		};

		// Lets you navigate through pseudo-pages within an actual page
		// without any actual document fetching from the server.
        // navigate( data_object )
        // navigate( data_object, show_function )
        // navigate( show_function )
		M.navigate = function( data, new_show ) {

			if( typeof data === "function" ) {
				new_show = data;
				data = null;
			}

			if( ! data ) {
				// no data object passed in; use current query data 
				//data = {};
				//const a = document.location.search.split( /[?&]/ );	
				//a.shift();
				//a.forEach( function( kv ) {
				//	var p = kv.split( "=" );
				//	data[ p[ 0 ] ] = ( p.length > 1 ) ? decodeURIComponent( p[ 1 ] ) : "";
				//})
				data = query_data();
			}

			var state = { pageYOffset: 0, data };

			// build URL + query-string from current path and contents of 'data'
			let qs = "";
			for( let k in data ) {
				qs += (qs ? "&" : "?") + k + "=" + encodeURIComponent(data[k]);
			}
			const url = document.location.pathname + qs;

			// if browser doesn't support pushstate, just redirect to the url
			if( history.pushState === undefined ) {
				document.location = url;
				return;
			}

            M.Nav2.default_show = function( data ) {
                if( data[ "page" ] !== undefined ) {
                    // hide all elements with class "page" by setting
                    // css display to "none"
                    const pages = M.QS( "page" );
                    for( let p of pages ) {
                        if( p._nav === undefined ) {
                            p._nav = {};
                            p._nav.orig_display = p.style.display;
                        }
                        p.style.display = "none";
                    }
                    // jump to top of document
                    document.body.scrollIntoView();
                    // show the new page
					const pg = data.page;
                    const el = QS1( "page[name=" + pg + "]" );
                    if( el ) {
                        el.style.display = el._nav.orig_display;
                    } else {
                        throw new Error( "Nav2: No page with name " + pg );
                    }
                }
            };

			if( ! Nav2.current_show ) {
				// 1st time Nav2() has been called

				// Set up the built-in default show function
				Nav2.current_show = Nav2.default_show;

				if( history.replaceState !== undefined ) {
					// set state for the current/initial location
					history.replaceState( state, "", url );
					// wire in the pop handler
					window.onpopstate = function( evt ) {
						if( evt.state ) {
							const data = evt.state;
							Nav2.current_show( evt.state.data );
						}
					}
				}

			} else {
				// this is 2nd or later call to Nav2()
				state.pageYOffset = window.pageYOffset;
				history.pushState( state, "", url );
			}

			// if new show func supplied, start using that one
			if( new_show ) {
				Nav2.current_show = new_show;
			}

			Nav2.current_show( data );
		};

        M.Nav2 = M.navigate // XXX Deprecate in favor of navigate()


		// Ties a Javascript object to some user interface elements in the browser DOM.
		// If anything changes in the data object then mod_cb is called.
		// XXX Not great. Don't recommend using this
        // XXX Deprecate
		M.MXU = function( base, data, mod_cb ) {

			const form_types = "input select textarea".toUpperCase().split( " " );

			let named_element = function( name ) {
				return base.querySelector( "[name="+name+"]" );
			}

			let proxy = new Proxy( data, {

				get: function( tgt, prop ) {
					let e = named_element( prop );
					if( e ) {
						let v;
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								v = e.checked;
							}
							else {
								v = e.value;
							}
						}
						else {
							v = e.innerHTML;
						}
						tgt[ prop ] = v;
					}
					return tgt[ prop ];
				},

				set: function( tgt, prop, v ) {
					tgt[ prop ] = v;
					let e = named_element( prop );
					if( e ) {
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								e.checked = !! v;
							}
							else {
								e.value = v;
							}
						}
						else {
							e.innerHTML = v;
						}
					}
					if( mod_cb ) {
						mod_cb( prop, v );
					}
				},

			});

			for(let key in data ) {
				proxy[ key ] = data[ key ];
				let e = named_element( key );
				if( e && form_types.includes( e.tagName ) ) {
					e.onchange = evt => {
						proxy[ key ] = e.value;
					}
				}
			}

			return proxy;
		};


		// FDrop
		/*
		var dt = elem("droptarget");
		FDrop.attach(dt, function(files, evt) {
			files = files;
			var f = files[0];
			FDrop.mk_data_url(f, function(u) {
				dt.innerHTML = "<img height=100 src='"+u+"'><br>name="+f.name+"<br>type="+f.type+"<br>size="+f.size+"<p>data url:<p>"+u;
			});

		});
		*/
		(function() {

			let attach = function(element, cb) {

				let style = element.style
				let old_opacity = style.opacity

				element.ondragenter = function(evt) {
					style.opacity = "0.5";
				}
				element.ondragleave = function(evt) {
					if(evt.target === element)
						style.opacity = old_opacity;
				}

				// for drag/drop to work, element MUST have ondragover AND ondrop defined 
				element.ondragover = function(evt) {
					evt.preventDefault();			// required: ondragover MUST call this.
				}
				element.ondrop = function(evt) {
					evt.preventDefault();			// required
					style.opacity = old_opacity;	// because ondragleave not called on drop (chrome at least)
					let files = evt.dataTransfer.files
					cb(files, evt);
				}

			};

			let mk_data_url = function(f, cb) {
				let reader = new FileReader();
				reader.onload = function() {
					let data = reader.result;
					cb(data);
				};
				reader.readAsDataURL(f);
			};

			let put_file = function( file, url, okay, fail ) {
				let xhr = new XMLHttpRequest();
				xhr.onload = function() {
					okay( xhr );
				}
				xhr.upload.addEventListener("error", fail );
				xhr.open( "PUT", url, true );
				xhr.setRequestHeader( "Content-Type", file.type );
				xhr.send( file );
			};

			M.FDrop = {
				attach,
				mk_data_url,
				put_file,
			};
			
		})();


		// Load an image asyncrhonously, scale it to a specific width/height, convert
		// the image to a "data:" url, and return it via callback.
		M.scale_data_image = function( image_data_url, new_width, new_height, cb ) {
			let img = new Image();
			img.onload = function() {
				let cnv = document.createElement( "canvas" );
				cnv.width = new_width;
				cnv.height = new_height;
				var ctx = cnv.getContext("2d");
				ctx.drawImage(img, 0, 0, new_width, new_height);
				let new_data_url = cnv.toDataURL( "image/jpeg", 0.5 );
				cb( new_data_url );
			}
			img.src = image_data_url;
		};


        /*
        // Joe's experimental components system for browser
        (function() {

            // XXX use fetch()?
            function get_html( url, okay, fail ) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    const html = ( xhr.status == 200 ) ? xhr.responseText : "";
                    okay( html );
                };
                xhr.onerror = fail;
                xhr.open( "GET", url );
                xhr.send();
            };

            const component_store = {};

            async function load( name, path, okay ) {
                const dir = path + "/" + name;
                const html_path = dir + "/" + name + ".html";
                const code_path = dir + "/" + name + ".js";
                const m = await import( code_path );
                const code = m.default;
                get_html( html_path, html => {
                    okay( { code, html } );
                } );
            }

            function inject( root ) {
                if( ! root )
                    root = document;
                // find all the <component> elements
                const elements = root.querySelectorAll( "component" );
                for( let i = 0; i < elements.length; i++ ) {
                    const element = elements[ i ];
                    // use the name attr to find stuff in components dir
                    const path = element.attr( "path" ) || "/components";
                    const name = element.attr( "name" );
                    load( name, path, loaded => {
                        const { code, html } = loaded;
                        const component = { element, code, html, name, path, };
                        component_store[ name ] = component;
                        component.code( component );      // call the module code
                        //console.log( "Component loaded: " + name );
                    } );
                }
            }

            function find( name ) {
                return component_store[ name ];
            }

            M.components = { inject, find, };

        } )();
        */


	}


	// Make all the sleepless functions/objects into globals
    // (if you feel you must, and I often do)
	M.globalize = function() {
		for( const k in M ) {
			globalThis[ k ] = M[ k ];
		}
        return M;
	};


	if(isNode) {
		module.exports = M;
	} else {
		globalThis.sleepless = M;
	}


})();
