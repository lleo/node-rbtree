#!/usr/bin/env node

"use strict";

var fs = require('fs')
  , cmdLine = require('commander')
  , assert = require('assert')

function keyOrder(s){
  if (s == "in" || s == "inorder")
    return "inorder"
  if (s == "rev" || s == "reverse")
    return "reverse"
  if (s == "rand" || s == "random")
    return "random"
  return "inorder"
}

cmdLine
.option('-o|--order <order>', 'order of keys where order=in|rev|rand', keyOrder, "inorder")
.option('-n|--number <n>', 'number of key,val pairs to generate', parseInt, 10)
.parse(process.argv)

var order = cmdLine.order
  , numEnts = cmdLine.number
  , strCmp = function(a,b){
      assert.ok(typeof a == 'string')
      assert.ok(typeof b == 'string')
      if (a < b) return -1
      if (a > b) return 1
      if (a == b) return 0
      throw new Error("WTF! strCmp")
    }

//from github.com/lleo/node-bptree/str_ops.js
function inc(str){
  if (str.length == 0) return "a"

  var last = str[str.length-1]
    , rest = str.substr(0, str.length-1)

  if (last == "z") {
    if (rest.length == 0) return "aa"
    else return inc(rest) + "a"
  }
  if (last == "Z") {
    if (rest.length == 0) return "AA"
    else return inc(rest) + "A"
  }
  if (last == "9") {
    if (rest.length == 0) return "10"
    else return inc(rest) + "0"
  }

  return rest + String.fromCharCode( last.charCodeAt(0)+1 )
}

//from github.com/lleo/node-bptree/rand_ops.js
function rand(n) { return Math.random() * n } // [0,n)
function randInt(n) { return Math.floor( rand(n) ) } //[0,n)
function randomize(arr) {
  var i, ri, idx = []
  for (i=0; i<arr.length; i++) idx.push(i)

  function swap(a, b){
    var t = arr[a]
    arr[a] = arr[b]
    arr[b] = t
  }

  for(i=0; i<arr.length; i++) {
    ri = idx[randInt(idx.length)]
    idx.splice(ri,1)
    swap(i, ri)
  }
}

var key = ""
  , data = []

for (var i=0; i<numEnts; i+=1) {
  key = inc(key)
  data[i] = {key: key, val: i}
}

if (order == "inorder")
  data.sort(function(a,b){ return strCmp(a.key, b.key) })
else if (order == "reverse") {
  data.sort(function(a,b){ return strCmp(a.key, b.key) })
  data.reverse()
}
else if (order == "random")
  randomize(data) //based on inc() order

var output = JSON.stringify(data, null, " ")

console.log(output)
