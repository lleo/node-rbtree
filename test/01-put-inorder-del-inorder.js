/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')

var inorder_data_fn = "./test/inorder-1024.dat.json"
  , inorder_data = JSON.parse( fs.readFileSync(inorder_data_fn) )

function strCmp(a,b){
  assert.ok(typeof a == 'string')
  assert.ok(typeof b == 'string')
  if (a < b) return -1
  if (a > b) return 1
  if (a == b) return 0
  throw new Error("WTF! strCmp")
}

describe("RBTree entries inorder", function(){
  var tree

  it("constructor", function(){
    tree = new RBTree(strCmp)
  })

  it("should insert data inorder", function(){
    for (var i=0; i<inorder_data.length; i+=1) {
      tree.put(inorder_data[i].key, inorder_data[i]['val'])
    }
  })

  it("should delete data inorder", function(){
    for (var i=0; i<inorder_data.length; i+=1) {
      tree.del(inorder_data[i]['key'])
    }
  })
})
