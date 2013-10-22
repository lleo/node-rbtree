/* global describe it */

var fs = require('fs')
  , assert = require('assert')
  , RBTree = require('..')
  , format = require('util').format

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
                   .slice()
                   .sort(function(a,b){ return strCmp(a.key, b.key) })

describe("find* family", function(){
  var tree

  it("construct & populate tree w/randomized data", function(){
    tree = new RBTree(strCmp)

    for (var i=0; i<random_data.length; i+=1) {
      tree.put(random_data[i].key, random_data[i].val)
    }
  })

  it('create holes by removing first("a"), middle("ha"), and last("zz") keys', function(){
    assert.ok( tree.del("a" ) ) //first key
    assert.ok( tree.del("ha") ) //middle key
    assert.ok( tree.del("zz") ) //last key
  })

  describe("_findLeast", function(){
    // findLeast to find the first node
    it('_findLeast expect "aa"', function(){
      var node = tree._findLeast()
        , expected = "aa"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })
  })

  describe("_findGreatest", function(){
    // findGreatest to find the last node
    it('_findGreatest expect "zy"', function(){
      var node = tree._findGreatest()
        , expected = "zy"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })
  })

  describe("_findLeastGT", function(){
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
    it('_findLeastGT "h" before hole at "ha" expect "hb"', function(){
      var node = tree._findLeastGT("h")
        , expected = "hb"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })

    // findLeastGT at end
    it('_findLeastGT last key at "zy" expect node == null', function(){
      var node = tree._findLeastGT("zy")
      assert.equal( node, null
                  , format('expected node==undefined got node=="%j"', node) )
    })

  })

  describe("_findLeastGE", function(){
    // findLeastGE regular
    it('_findLeastGE "h" expect "h"', function(){
      var node = tree._findLeastGE("h")
        , expected = "h"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })

    // findLeastGE hole
    it('_findLeastGE hole at "ha" expect "hb"', function(){
      var node = tree._findLeastGE("ha")
        , expected = "hb"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })

    // findLeastGE beyond end
    it('_findLeastGE missing last "zz" expected result=undefined', function(){
      var node = tree._findLeastGE("zz")
      assert.ok( typeof node == 'undefined'
               , node && format('expected node == undefined got node.key=="%s"', node.key) )
    })
  })

  describe("_findGreatestLT", function(){
    // findGreatestLT regular
    it('_findGreatestLT "hc" expect "hb"', function(){
      var node = tree._findGreatestLT("hc")
        , expected = "hb"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )

    })

    // findGreatestLT at hole
    it('_findGreatestLT "ha" expect "h"', function(){
      var node = tree._findGreatestLT("ha")
        , expected = "h"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })

    // findGreatestLT before hole hole
    it('_findGreatestLT "hb" before hole at "ha" expect "h"', function(){
      var node = tree._findGreatestLT("hb")
        , expected = "h"
      assert.equal( node.key, expected
                  , format('expected node.key=="%s" got node.key=="%s"'
                          , expected, node.key) )
    })

    // findGreatestLT beyond beginning
    it('_findGreatestLT "aa" expect node == null', function(){
      var node = tree._findGreatestLT("aa")
      assert.ok( node == null
               , node && format('expected node == null got node.key=="%s"'
                               , node.key) )
    })
  })

  describe("_findGreatestLE", function(){
    // findGreatestLE regular
    it('_findGreatestLE "hb" expect "hb"', function(){
      var node = tree._findGreatestLE("hb")
        , expected = "hb"
      assert.equal( node.key, expected
                  , node && format('expected node.key=="%s" got node.key=="%s"'
                                  , expected, node.key) )

    })

    // findGreatestLE over hole
    it('_findGreatestLE "ha" expect "h"', function(){
      var node = tree._findGreatestLE("ha")
        , expected = "h"
      assert.equal( node.key, expected
                  , node && format('expected node.key=="%s" got node.key=="%s"'
                                  , expected, node.key) )

    })

    // findGreatestLE beyond beginning
    it('_findGreatestLE "a" expect node == undefined', function(){
      var node = tree._findGreatestLE("a")
      assert.ok( typeof node == 'undefined'
               , node && format('expected node == undefined got node.key="%s"', node.key) )
    })
  })

  describe("_findNext", function(){
    // findNext regular
    it('_findNext( _find("gz") ) expect "h"', function(){
      var node = tree._find("gz")
        , next = tree._findNext(node)
      assert.equal(next.key, "h")
    })

    // findNext over hole
    it('_findNext( _find("h") ) expect "hb"', function(){
      var node = tree._find("h")
        , next = tree._findNext(node)
      assert.equal(next.key, "hb")
    })

    // findNext last => undefined
    it('_findNext( _find("zy") ) expect node == undefined', function(){
      var last = tree._find("zy")
        , next = tree._findNext(last)

      assert.ok(!next, next && format("next.key = %s,", next.key))
    })
  })

  describe("_findPrev", function(){
    // findPrev regular
    it('_findPrev( _find("h") ) expect "gz"', function(){
      var node = tree._find("h")
        , next = tree._findPrev(node)
      assert.equal(next.key, "gz")
    })

    // findPrev over hole
    it('_findPrev( _find("hb") ) expect "h"', function(){
      var node = tree._find("hb")
        , prev = tree._findPrev(node)
      assert.equal(prev.key, "h")
    })

    // findPrev undefined
    it('_findPrev( _find("aa") ) expect node == undefined', function(){
      var first = tree._find("aa")
        , prev = tree._findPrev(first)

      assert.ok(!prev)
    })
  })
})
