
const isNode = ( typeof process == "object" && /^v\d+\.\d+\.\d+$/.test( process.version ) );
const isBrowser = ! isNode; 

if( isNode ) {
    sleepless = require( "." ).globalize()
} else {
    sleepless = sleepless.globalize();
}
const l = log;

const o = { a:[1,2,3], t:true, f:false, o:{key:'val'}, pi:3.1415, n:null };
const j = JSON.stringify(o, null, 2);

throwIf( o2j(o) !== j );
throwIf( o2j(j2o(j)) !== j );

throwIf( toInt(3) !== 3 );
throwIf( toInt(3.0) !== 3 );
throwIf( toInt("3") !== 3 );
throwIf( toInt("1,234") !== 1234 );

throwIf( toInt("1,234.56") !== 1235 );
throwIf( toInt("-1,234.56") !== -1235 );
throwIf( toInt(-1234.56) !== -1235 );

throwIf( toFlt(3) !== 3 );
throwIf( toFlt(3.0) !== 3 );
throwIf( toFlt("3") !== 3 );
throwIf( toFlt("1,234") !== 1234 );
throwIf( toFlt("1,234.56") !== 1234.56 );
throwIf( toFlt("-1,234.56") !== -1234.56 );
throwIf( toFlt(-1234.56) !== -1234.56 );

throwIf( c2b("10") !== 0.1 );
throwIf( c2b("12345") !== 123.45 );
throwIf( c2b(12345) !== 123.45 );
throwIf( c2b(1) !== 0.01 );
throwIf( b2c("100") !== 10000 );
throwIf( b2c("1.23") !== 123 );
throwIf( b2c("1,234.56") !== 123456 );
throwIf( b2c("1,234.5") !== 123450 );
throwIf( b2c("1,234") !== 123400 );
throwIf( b2c("0.01") !== 1 );
throwIf( b2c("0.01") !== 1 );

throwIf( numFmt(0) !== "0", "foo" );
throwIf( numFmt(0, 1) !== "0.0" );
throwIf( numFmt(0, 4) !== "0.0000" );
throwIf( numFmt(1, 4) !== "1.0000" );
throwIf( numFmt(1.1, 3) !== "1.100" );
throwIf( numFmt(-1.1, 3) !== "-1.100" );
throwIf( numFmt(-1.104, 2) !== "-1.10" );
throwIf( numFmt(1.105, 2) !== "1.11" );
throwIf( numFmt(-1.105, 2) !== "-1.10" );
throwIf( numFmt(1234) !== "1,234" );
throwIf( numFmt(123456) !== "123,456" );
throwIf( numFmt(1234567) !== "1,234,567" );
throwIf( numFmt(1234, 1) !== "1,234.0" );
throwIf( numFmt(1234, 3) !== "1,234.000" );
throwIf( numFmt(1234, 3, ".", "") !== "1234.000" );
throwIf( numFmt(-0.0001, 4, ":") !== "-0:0001" );
throwIf( numFmt(1234, 3, ":", "!") !== "1!234:000" );

throwIf( byteSize(123) !== "123 B" );
throwIf( byteSize(1234) !== "1.2 KB" );
throwIf( byteSize(1234567) !== "1.2 MB" );
throwIf( byteSize(1234567890) !== "1.1 GB" );
throwIf( byteSize(1234567890123) !== "1.1 TB" );

throwIf( toMoney("0.01") !== "0.01" );
throwIf( toMoney("31415.015") !== "31,415.02" );
throwIf( toMoney("31415.01") !== "31,415.01" );
throwIf( toMoney("31415.99") !== "31,415.99" );
throwIf( toMoney(0.01) !== "0.01");
throwIf( toMoney(31415.015) !== "31,415.02");
throwIf( toMoney(31415.01) !== "31,415.01" );
throwIf( toMoney(31415.99) !== "31,415.99" );
throwIf( toMoney(-0.01) !== "-0.01" );
throwIf( toMoney(-31415.016) !== "-31,415.02" );
throwIf( toMoney(-31415.01) !== "-31,415.01" );
throwIf( toMoney(-31415.99) !== "-31,415.99" );
throwIf( toMoney("1,000.00") !== "1,000.00" );

throwIf( toPct(1) !== "100", toPct(1) );
throwIf( toPct(1.013, 0) !== "101" );
throwIf( toPct(1.016, 0) !== "102" );
throwIf( toPct(0.01, 0) !== "1" );
throwIf( toPct(2.3, 3) !== "230.000" );
throwIf( toPct(-314.15, 2) !== "-31,415.00" );

throwIf( my2ts("") !== 0 );
//throwIf( my2ts("2014-01-02 12:13:14") !== 1388693594 );
throwIf( my2ts(ts2my(1388693594)) !== 1388693594 );

throwIf( dt2ts() !== 0 );
/*
throwIf( ts2us(1384565221) !== "11/15/2013 17:27:01" );
throwIf( ts2us_md(1384565221) !== "11/15" );
throwIf( ts2us_mdy(1384565221) !== "11/15/2013" );
throwIf( ts2us_mdy2(1384565221) !== "11/15/13" );
throwIf( ts2us_hm(1384565221) !== "17:27" );
throwIf( ts2us_mdyhm(1384565221) !== "11/15/2013 17:27" );
throwIf( ts2us_mdy2hm(1384565221) !== "11/15/13 17:27" );
throwIf( ts2us_dMy(1384565221) !== "15-Nov-2013" );
throwIf( ts2us_md(0) !== "" );
throwIf( ts2us_mdy(0) !== "" );
throwIf( ts2us_mdy2(0) !== "" );
throwIf( ts2us_hm(0) !== "" );
throwIf( ts2us_mdyhm(0) !== "" );
throwIf( ts2us_mdy2hm(0) !== "" );
throwIf( ts2us_dMy(0) !== "" );

throwIf( !( us2dt("11/15/2013 17:27:01") instanceof Date) );
throwIf( dt2ts( us2dt("11/15/2013 17:27:01") ) !== 1384565221 );
*/

throwIf( "foO".lcase() !== "foo" );
throwIf( "foO".ucase() !== "FOO" );
throwIf( "foO".ucfirst() !== "FoO" );
throwIf( "foo baR".ucwords() !== "Foo BaR" );
throwIf( "foo bar baz".abbr(7) !== "foo ..." );
throwIf( "foo".abbr(7) != "foo" );		// XXX why doesn't this work with !== ?
throwIf( " \tfoo bar \n".trim() !== "foo bar" );

throwIf( "Foo Bar".toId() !== "foo_bar" );
throwIf( "Foo_Bar".toId() !== "foo_bar" );
throwIf( " Foo_Bar ! ".toId() !== "foo_bar" );
throwIf( "foo_bar".toLabel() !== "Foo Bar" );
throwIf( "foo_bar".toLabel() !== "Foo Bar" );
throwIf( "foo_bar!".toLabel() !== "Foo Bar!" );

//getFile("test.js", "utf8", function(err, data) {
//	throwIf( err, err );
//	throwIf( getFile("test.js").toString() !== data.toString() );
//});

throwIf( "I,\nhave a lovely bunch of coconuts.".looksLike("i have", "coconuts") !== true)

throwIf( "joe@sleepless.com".is_email() !== true );
throwIf( "a@b.cd".is_email() !== true );
throwIf( "aaaaaaaaaaaaaaaaaaaa-_12.aaaa@bbbbbb.cccccccc.dddddddddddddddd".is_email() !== true );
throwIf( "joe.sleepless.com".is_email() !== false );

const Thing = function() {
	this.name = "Mr. Thing";
}

if( isNode ) {
	throwIf( sha1("I have a lovely bunch of coconuts.") !== "9fd0f467384256f02560d0694316b6d9bdfe7c68");
	throwIf( sha256("I have a lovely bunch of coconuts.") !== "1a983ac204ea2bc92d8871d53111e021483c12a3e1ccb8ec59b0d62f3167cb13");
}

if( isBrowser ) {

    // test findNamed() and findNamed1()
    document.body.findNamed1( "msg" ).html( "findNamed1() works!" );

	let o = { x: 3 };
	let j = o2j( o );
	LS.set( "foo", { x: 3 } );
	throwIf( o2j( LS.get( "foo" ) ) != j );
	LS.clear();

	let tpl = QS1( "#r8" );
	throwIf( ! tpl );
	let r8 = rplc8( tpl );
	r8.update( [
		{ foo: "rplc8 foo #1" },
		{ foo: "rplc8 foo #2" },
	]);


}

let test = function(logger) {
	for(var i = 0; i < 6; i++) {
		console.log( "---- level "+i+" ----" );

		logger(i);

		logger(1, "n=1");
		logger(2, "n=2");
		logger(3, "n=3");
		logger(4, "n=4");
		logger(5, "n=5");

		logger.E("f=E");
		logger.W("f=W");
		logger.I("f=I");
		logger.V("f=V");
		logger.D("f=D");
	}
}

test(log5);
test(log5.mkLog("LOG5TEST "))

if( isNode ) {
	let ds = new DS( "test.json" );
	ds.bar = 7;
	ds.save();
	let ds2 = new DS( "test.json" );
	throwIf( ds2.bar !== 7 );
}

rpc( "https://rpc.sleepless.com/rpc/", { api: "ping" }, function( data ) {
	log( o2j( data ) );
}, function(err) {
	throw err;
});

rpc2( "https://rpc.sleepless.com/rpc/", { headers: { "ARG": "foo", } }, { api: "ping", }, function( data ) {
	log( o2j( data ) );
}, function(err) {
	throw err;
});


log( "runq ... " );
function f1( x, y, okay, fail ) {
	this.count += 1;
	okay( x + y )
}
function f2( okay, fail ) {
	this.count += 2;
	okay( this.foo );
}
let my_this = { foo: "bar", count: 0 }
runq = sleepless.runq;
runq( my_this )
.add( f1, 10, 20 )
.add( f2 )
.run( results => {
	throwIf( ! ( results && results.length === 2 && results[ 0 ] === 30 && results[ 1 ] === "bar") );
	throwIf( my_this.count !== 3 );
	log( "runq pass" );
}, error => {
	console.error( error );
} )


log( "runp ... " );
let runp_this = { foo: "bar", count: 0 }
var f = function( num, arg, okay, fail ) {
	this.count += 1;
	const millis = 1000 + ( Math.random() * 1000 );
	log( num + " running for " + millis + " millis ... arg=" + arg );
	setTimeout( function() {
		if( Math.random() >= 0.8 )
			fail( num + " RANDOM ERROR");
		else
			okay( arg );
	}, millis );
}

// run the example form the readme
runp( runp_this )
.add( f, 1, 7 )
.add( f, 2, "foo" )
.add( f, 3, [ 3, 5, 9 ] )
.run( function( results ) {
	// all the functions have completed
	log( results );
	throwIf( results.length !== 3 );
	throwIf( my_this.count !== 3 );
	results.forEach( ( r, i ) => {
		throwIf( ! r.data && ! r.error );	// at least one should be set
		throwIf( r.data && r.error );	// only one should be set
		if( i == 0 && r.data ) {
			throwIf( r.data !== 7 );
		}
		if( i == 1 && r.data ) {
			throwIf( r.data !== "foo" );
		}
		if( i == 2 && r.data ) {
			throwIf( ! ( r.data instanceof Array ) || r.data.length !== 3 );
		}
	} );
	log( "runp pass" );
})


if( isNode ) {
	throwIf( is_file( "./lasdflkasjer" ) !== false );
	throwIf( is_dir( "./lasdflkasjer" ) !== false );
	throwIf( is_file( "./test.js" ) !== true );
	throwIf( is_dir( "." ) !== true );

	is_file( "./lasdflkasjer", b => { throwIf( b !== false ) } )
	is_dir( "./lasdflkasjer", b => { throwIf( b !== false ) } )
	is_file( "./test.js", b => { throwIf( b !== true ) } )
	is_dir( ".", b => { throwIf( b !== true ) } )
}



