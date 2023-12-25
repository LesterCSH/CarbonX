
const fs = require("fs")
const assert = require("assert")
const DS = require(".")

let ds

ds = new DS()
ds.num = 7
ds.save()
ds = new DS()
assert(ds.num == 7)

ds.save("ds2.json")
ds = new DS()
ds.load("ds2.json")
assert(ds.num == 7)

ds = new DS("ds2.json")
assert(ds.num == 7)


ds.clear()
ds.save()
ds = new DS("ds2.json")
assert(ds.num === undefined)

console.log("All tests passed OK")


