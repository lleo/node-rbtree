/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')

var random_data_fn = "./test/rand-1024.dat.json"
  , random2_data_fn = "./test/rand2-1024.dat.json"
  , random_data = JSON.parse( fs.readFileSync(random_data_fn) )
  , random_data2 = JSON.parse( fs.readFileSync(random2_data_fn) )
  , strCmp = function(a,b){
      assert.ok(typeof a == 'string')
      assert.ok(typeof b == 'string')
      if (a < b) return -1
      if (a > b) return 1
      if (a == b) return 0
      throw new Error("WTF! strCmp")
    }

describe("RBTree entries random", function(){
  var tree

  it("constructor", function(){
    tree = new RBTree(strCmp)
  })

  it("should insert data in random order", function(){
    for (var i=0; i<random_data.length; i+=1) {
      tree.put(random_data[i].key, random_data[i].val)
    }
  })

  it("should delete data in different random order", function(){
     for (var i=0; i<random_data2.length; i+=1) {
      tree.del(random_data2[i].key)
    }
  })
})
