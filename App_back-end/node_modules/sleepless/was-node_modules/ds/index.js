// Copyright 2023 Sleepless Software Inc. All rights reserved.

const fs = require("fs")

function load( f ) {
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
function save( f ) {
    const self = this;
    f = f || self.file;
    self.__proto__.file = f;
    fs.writeFileSync( f, JSON.stringify( self, null, 4 ) );
}

function clear() {
    const self = this;
    for( let key in self ) 
        delete self[ key ];
}

const ldsv = { load:load, save:save, clear:clear }

function F( file, opts ) {
    var self = this;
    self.file = file;
    self.opts = opts || {};
}

F.prototype = ldsv;

function DS( f, opts ) {
    const self = this;
    self.__proto__ = new F( "ds.json", opts );
    self.load( f );
}

DS.prototype = new F();

module.exports = DS;

