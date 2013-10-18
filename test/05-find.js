/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')
  , format = require('util').format
  , f = format
  , utils = require('../lib/utils')

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
  , inorder_data = random_data.slice()

inorder_data.sort(function(a,b){ return strCmp(a.key, b.key) })

describe("find* family", function(){
  var tree

  it("construct & populate tree w/randomized data", function(){
    tree = new RBTree(strCmp)

    for (var i=0; i<random_data.length; i+=1) {
      tree.put(random_data[i].key, random_data[i].val)
    }
  })

  it('create holes by removing first("a"), middle("ha"), and last("zz") keys"', function(){
    assert.ok( tree.del("a" ) ) //first key
    assert.ok( tree.del("ha") ) //middle key
    assert.ok( tree.del("zz") ) //last key
  })

  // findLeastGT regular
  it('_findLeastGT "gz" expect "h"', function(){
    var node = tree._findLeastGT("gz")
      , expected = "h"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )
  })

  // findLeastGT hole
  it('_findLeastGT hole at "ha" expect "hb"', function(){
    var node = tree._findLeastGT("ha")
      , expected = "hb"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )
  })

  // findLeastGT before hole hole
  it('_findLeastGT key="h" before hole at "ha" expect "hb"', function(){
    var node = tree._findLeastGT("h")
      , expected = "hb"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )
  })

  // findLeastGT at end
  it('_findLeastGT last key="zy" expect undefined', function(){
    var node = tree._findLeastGT("zy")
    assert.equal( typeof node, 'undefined'
                , format('expected node==undefined got node=="%j"', node) )
  })

  // findLeastGE regular
  it('_findLeastGE key="h" expect result="h"', function(){
    var node = tree._findLeastGE("h")
      , expected = "h"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )
  })

  // findLeastGE hole
  it('_findLeastGE key="ha" expect result="hb"', function(){
    var node = tree._findLeastGE("ha")
      , expected = "hb"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )
  })

  // findLeastGE beyond end
  it('_findLeastGE missing last key="zz" expected result=undefined', function(){
    var node = tree._findLeastGE("zz")
    assert.ok( typeof node == 'undefined'
             , format('expected typeof node=="%s" got node=="%j"'
                     , 'undefined', node) )
  })

  // findGreatestLT regular
  it('_findGreatestLT "hc" expect node.key="hb"', function(){
    var node = tree._findGreatestLT("hc")
      , expected = "hb"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )

  })

  // findGreatestLT over hole
  it('_findGreatestLT "hb" expect node.key="h"', function(){
    var node = tree._findGreatestLT("hb")
      , expected = "h"
    assert.equal( node.key, expected
                , format('expected node.key=="%s" got node.key=="%s"'
                        , expected, node.key) )

  })


  // findGreaterLT undefined

  // findGreaterLE regular

  // findGreaterLE over hole

  // findGreaterLE undefined

  // findNext regular
  it('_findNext( _find("gz") ) expect node.key="h"', function(){
    var node = tree._find("gz")
      , next = tree._findNext(node)
    assert.equal(next.key, "h")
  })

  // findNext over hole
  it('_findNext( _find("h") ) expect node.key="hb"', function(){
    var node = tree._find("h")
      , next = tree._findNext(node)
    assert.equal(next.key, "hb")
  })

  // findNext last => undefined
  it('_findNext( last ) expect node == undefined', function(){
    var last_key = inorder_data[inorder_data.length-2].key
    utils.err("last_key=%s", last_key)
    var last = tree._find(last_key)
      , next = tree._findNext(last)

    assert.ok(!next)
  })

  // findPrev regular
  it('_findPrev( _find("h") ) expect node.key="gz"', function(){
    var node = tree._find("h")
      , next = tree._findPrev(node)
    assert.equal(next.key, "gz")
  })

  // findPrev over hole
  it('_findPrev( _find("hb") ) expect node.key="h"', function(){
    var node = tree._find("hb")
      , prev = tree._findPrev(node)
    assert.equal(prev.key, "h")
  })

  // findPrev undefined
  it('_findPrev( first ) expect node == undefined', function(){
    var first = tree._find('aa')
      , prev = tree._findPrev(first)

    assert.ok(!prev)
  })
})