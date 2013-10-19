/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')

var random_data_fn = "./test/rand-1024.dat.json"
  , random_data = JSON.parse( fs.readFileSync(random_data_fn) )
  , inorder_data = random_data.slice() //shallow copy
  , strCmp = function(a,b){
      assert.ok(typeof a == 'string')
      assert.ok(typeof b == 'string')
      if (a < b) return -1
      if (a > b) return 1
      if (a == b) return 0
      throw new Error("WTF! strCmp")
    }

// make inorder_data "inorder", currently random
inorder_data.sort(function(a,b){ return strCmp(a.key, b.key) })

describe("RBTree get & exists", function(){
  var tree

  it("construct & populate tree w/randomized data", function(){
    tree = new RBTree(strCmp)

    for (var i=0; i<random_data.length; i+=1) {
      tree.put(random_data[i].key, random_data[i].val)
    }
  })

  var data = []
  it("build a duplicate of the raw date with inorder", function(){
    tree.inorder(function(k,v){
      data.push({key: k, val: v})
    })
  })

  it("compare duplicate inorder data with inorder data file", function(){
    assert.ok(inorder_data.length == data.length, "not the same length")
    for (var i=0; i<data.length; i+=1) {
      assert.ok( inorder_data[i].key == data[i].key, "not the same key" )
      assert.ok( inorder_data[i].val == data[i].val, "not the same val" )
    }
  })

})