/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')

var random_data_fn = "./test/rand-1024.dat.json"
  , random_data = JSON.parse( fs.readFileSync(random_data_fn) )
  , strCmp = function(a,b){
      assert.ok(typeof a == 'string')
      assert.ok(typeof b == 'string')
      if (a < b) return -1
      if (a > b) return 1
      if (a == b) return 0
      throw new Error("WTF! strCmp")
    }

describe("RBTree get & exists", function(){
  var tree

  it("construct & populate tree", function(){
    tree = new RBTree(strCmp)

    for (var i=0; i<random_data.length; i+=1) {
      tree.put(random_data[i].key, random_data[i].val)
    }
  })

  var last_idx = random_data.length-1
    , mid_idx  = Math.floor(last_idx/2)
    , last  = random_data[last_idx]
    , mid   = random_data[mid_idx]
    , first = random_data[0]


  it("test exists first", function(){
    assert.ok( tree.exists(first.key) )
  })

  it("test exists mid", function(){
    assert.ok( tree.exists(mid.key) )
  })

  it("test exists last", function(){
    assert.ok( tree.exists(mid.key) )
  })

  it("test non-existant", function(){
    assert.ok( !tree.exists("doesn't exist") )
  })

  it("get first", function(){
    var val = tree.get(first.key)
    assert.ok( first.val, val )
  })

  it("get mid", function(){
    var val = tree.get(mid.key)
    assert.ok( mid.val, val )
  })

  it("get last", function(){
    var val = tree.get(last.key)
    assert.ok( last.val, val )
  })

  it("get non-existant", function(){
    var val = tree.get("doesn't exist")
    assert.ok( typeof val == 'undefined' )
  })
})
