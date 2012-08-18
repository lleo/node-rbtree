exports = module.exports = RBTree

var assert = require('assert')
  , util = require('util')

var RED = 'red'
  , BLACK = 'black'

function RBTree(cmp) {
  assert.ok(typeof cmp === 'function')
  this.root = null
  this.cmp = cmp

  this.putcov = {}
  this.putinc = function(p){
    if (this.putcov[p] === undefined) this.putcov[p] = 0
    this.putcov[p]++
  }
  this.delcov = {}
  this.delinc = function(p){
    if (this.delcov[p] === undefined) this.delcov[p] = 0
    this.delcov[p]++
  }
}

RBTree.RBTree = RBTree
RBTree.Node = Node
RBTree.RED = RED
RBTree.BLACK = BLACK

//
// Utility functions
//

//reparent's 'node' into 'orig's position
//  orig must be non-null
//  node may be null
RBTree.prototype.replaceNode = function replaceNode(orig, node) {
  assert.ok(orig)
  if (orig.parent) {
    if (orig.parent.ln === orig)
      orig.parent.ln = node
    else
      orig.parent.rn = node
  }
  else
    this.root = node

  if (node) node.parent = orig.parent
}

RBTree.prototype.rotateLeft = function rotateLeft(node) {
  var parent = node.parent
    , right = node.rn

  //re-parent node & right
  if (parent) {
    if (node.isLeftNode()) {
      parent.ln = right
    }
    else {
      parent.rn = right
    }
  }
  else
    this.root = right

  right.parent = parent
  node.parent = right

  //handle orphaned node
  node.rn = right.ln
  if (right.ln) right.ln.parent = node

  right.ln = node

  return right //new root of this tree
}

RBTree.prototype.rotateRight = function rotateRight(node) {
  var parent = node.parent
    , left = node.ln

  //re-parent node & left
  if (parent) {
    if (node.isLeftNode())
      parent.ln = left
    else
      parent.rn = left
  }
  else
    this.root = left

  left.parent = parent
  node.parent = left

  //handle orphaned node
  node.ln = left.rn
  if (left.rn) left.rn.parent = node

  left.rn = node

  return left //new root of this tree
}

//generalized color getter; nulls are considered BLACK
function color(n) {
  return n === null ? BLACK : n.color
}

// returns a Node
RBTree.prototype._find = function(root, key){
  if (arguments.length === 1) {
    key = root
    root = this.root
  }
  var cur = root
  while (cur) {
    var cmp = this.cmp(key, cur.key)
    if ( cmp === 0 ) break
    cur = cmp < 0 ? cur.ln : cur.rn
  }
  return cur
}


RBTree.prototype.inorder = function(fn, reverse){
  if (reverse === undefined) reverse = false
  assert.equal(typeof reverse, 'boolean')
  var stack = []
    , cur

  cur = this.root

  while ( (cur!==null) || (stack.length>0) ) {

    while (cur) {
      stack.push(cur)
      if (reverse) cur = cur.rn
      else cur = cur.ln
    }

    cur = stack.pop()

    fn(cur.key, cur.val)

    if (reverse) cur = cur.ln
    else cur = cur.rn
  }//while

}

RBTree.prototype.exists = function(key){
  var cur = this._find(key)
  return cur !== null
}

//return found key's value, or undefined
RBTree.prototype.get = function(key){
  var cur = this._find(key)
  if (cur) return cur.value
  return undefined
}

RBTree.prototype.put = function(key,val){
  var cur
  if (this.root === null) {
    this.putinc(1)
    this.root = new Node(key, val, null)
    this.root.setBlack()
    return
  }

  var cur = this.root

  while (1) {
    var cmp = this.cmp(key, cur.key)
    assert.ok( cmp%1 === 0, "`cmp` not an integer") //cmp() returns an integer
    assert.ok((cmp===-1)||(cmp===0)||(cmp===1), "invalid value in `cmp`")
    //assert.ok([-1,0,1].indexOf(cmp), "invalid value in `cmp`")
    if (cmp === 0) {
      cur.value = val
      return //no new Node -> so no balancing -> so return from put()
    }
    else if (cmp < 0) {
      if (cur.ln === null) {
        cur.ln = new Node(key, val, cur) //new Nodes are always RED
        cur = cur.ln
        break
      }
      cur = cur.ln
    }
    else /* cmp > 0 */ {
      if (cur.rn === null) {
        cur.rn = new Node(key, val, cur) //new Nodes are always RED
        cur = cur.rn
        break
      }
      cur = cur.rn
    }
  }//while LOOP

  //Balance tree
  //RBT#1 All nodes are either RED or BLACK.
  //RBT#2 The root node is BLACK.
  //RBT#3 All leaves (nulls) are considered BLACK.
  //RBT#4 Both children of RED nodes must be BLACK.
  // correlary: RBT#4.1 if a node is RED it's parent must be BLACK
  //RBT#5 Every path from a node to the leaves must have the same number of
  //      BLACK nodes.
  var uncle, gp
  while (cur) {
    //This loop is just in case we have to propengate a color change up the tree

    //Either we just inserted a new node (always RED), or we are propengating
    // a subtree's root change to RED up the tree.
    assert.ok(cur.isRed())

    //so-called insert_case1
    if (cur.parent === null) {
      this.putinc(2)
      //This is the root node. So According to RBT#2 it must be made BLACK
      cur.setBlack()
      return //or break
    }

    //so-called insert_case2
    if (cur.parent.isBlack()) {
      this.putinc(3)
      //cur is red & parent is black so no RBT criteria is violated
      // RBT#5 hasn't changed cuz cur is RED
      return //or break
    }

    //From here on we know the parent is RED.
    //Hence, we have to fix the violation of RBT#4

    //Also if the parent is RED there has to be a grandparent, because
    // if parent was root it would be black. RBT#2

    uncle = cur.uncle()    //could be null
    gp = cur.grandparent()

    //Since we know the parent is RED We know the grandparent is BLACK RBT#4.1

    //so-called insert_case3
    if (color(uncle) === RED) {
      this.putinc(4)
      //We know the parent is RED. If the uncle is also RED then changing BOTH
      // of them to black does not violate the RBT#5 for the grandparent tree.
      cur.parent.setBlack()
      uncle.setBlack()

      //grandparent has to be BLACK cuz the parent & uncle are RED
      // setting parent&uncle BLACK and grandparent RED means the black-height
      // of the grandparent(inclusive) tree doesn't change.
      gp.setRed()

      //Next we check the validity of the grandparent and up, cuz we changed it
      // and may have violated RBT#2, RBT#4, or RBT#5
      cur = gp
      continue
    }

    //What we know:
    // 1) cur is RED
    // 2) parent is RED
    // 3) uncle is BLACK(or null)
    // 4) grandparent must be BLACK(or null)

    //in the worst-case we do a preparatory rotate.
    // worst-case is cur is the "inner" grandchild of gp
    // aka parent.key < cur.key < gp.key or gp.key < cur.key < parent.key

    //QUESTION: ok its the inner node; why do we do a prepatory rotate?
    // observation#1: parent will be the root of the tree after the last rotate
    // observation#2: the inner grandchild will be moved to the other side of
    //                the new root (parent) as the grandparent's inner node
    //ANSWER: the whole point of this RED/BLACK shit(aka rules) is to propengate
    //        a signal up the tree to indicate a change in the height of the
    //        tree. Red-Black trees can be out of balance at most by a factor of
    //        two: One side all BLACK and the other side alternating RED-BLACK.
    //        Hence the singal is a RED-RED conflict.
    //GIVEN this answer we know that the Grandparent got to long on the side
    // with the RED-RED Child-Parent confict. We are going to rotate the tree
    // at the grandparent node (and twiddle a few colors) to maintain the
    // balance of the subtree. But if the tree got longer on the inside of the
    // parent(the soon to be "subtree root" replacing the grandparent) we need
    // to shorten that inner subtree of the soon to be rotated grandparent tree.
    // Therefor we do a prepatory rotate.

    //so-called insert_case4
    if (cur.isRightNode() && cur.parent.isLeftNode()) {
      this.putinc(5)
      this.rotateLeft(cur.parent)
      cur = cur.ln //cur.ln was cur.parent
    }
    else if (cur.isLeftNode() && cur.parent.isRightNode()) {
      this.putinc(6)
      this.rotateRight(cur.parent)
      cur = cur.rn //cur.rn was cur.parent
    }

    //This is unnecessary. prep-rotate gp is still the same as the
    // no-prep-rotate gp. I'll assert to guarantee it.
//    gp = cur.grandparent()
    assert.ok(gp === cur.grandparent())

    //In the no-prep-rotate case, we are setting the original cur.parent black
    //In the prep-rotate case, we are setting the original cur black

    cur.parent.setBlack()
    gp.setRed()

    //so-called insert_node5
    if (cur.isLeftNode()) {
      this.putinc(7)
      this.rotateRight(gp)
    }
    else {
      this.putinc(8)
      this.rotateLeft(gp)
    }

    break;
    //Man I wish JS had goto's. That fuckwad that wrote gotos-considered-harmful
    //should be shot. Yes goto, like hammers/screwdrivers/guns, CAN BE harmful
    //IF you start wacking/stabbing/shooting at random.
  }//while

  //return
}//put

RBTree.prototype.delete = function(key){
  var cur = this._find(key)

  if (!cur) return false //key NOT FOUND

  //if cur is an internal node
  if (cur.rn && cur.ln) {
    this.delinc(1)
    //have to find a victim
    //victim is the previous in-order node
    var victim = cur.ln
    while (victim.rn) victim = victim.rn

    cur.key = victim.key
    cur.value = victim.value

    cur = victim
  }

  //We know some thing about cur:
  // 1) it has, AT MOST, only one child; either it is the
  //   a) original node found from the search and failed (cur.rn && cur.ln)
  //    or
  //   b) it is the victim node found by the next-in-order-search
  //      and cur.rn === null.
  // 2) ??

  //if cur is RED can just delete it.
  // MY REASONING is that if it is RED it can't have any children, cuz the
  // distance to the null side is 1 by definition and the distance to the child
  // side must be 2 or higher cuz the child side must be BLACK (+1) and then
  // null (+1). The child must be BLACK by RBT#4

  var child = cur.ln ? cur.ln : cur.rn

  if (cur.isRed()) {
    this.delinc(2)
    assert(cur.ln === null, "cur has left child")
    assert(cur.rn === null, "cur has right child")

    if (cur.isLeftNode()) cur.parent.ln = null
    else cur.parent.rn = null

    return true //THE END
  }

  //cur is BLACK

  //if cur has one non-null child
  if (child) {
    this.delinc(3)
    assert.ok(child.isRed(), "child of node-to-be-deleted is NOT RED! WTF!?!")
    assert.ok(child.ln === null)
    assert.ok(child.rn === null)

    child.setBlack()

    this.replaceNode(cur, child)

    return true //THE END
  }

  // THE WORST/MOST-COMPLICATED CASE
  //cur is BLACK with no children
  assert.ok(cur.isBlack())
  assert.ok(cur.ln === null)
  assert.ok(cur.rn === null)

  child = new Nil() //place holder the will be eliminated later
  this.replaceNode(cur, child) //this removes cur from the tree

  cur = child //child is a magic Nil Node to make sure it doesn't get modified
  while (cur) {

    //so-called delete_case1
    if (cur.parent === null) {//this is the tree root
      this.delinc(4)
      break
    }

    var sib = cur.sibling()
    assert.ok(sib !== null) //By RBT#5 a BLACK node MUST have a sibling
                            //BULLSHIT! first time thru cur is Nil
                            //DOUBLE BULLSHIT! cur WAS BLACK then replaceNode'd

    //so-called delete_case2
    if ( sib.isRed() ) {
      this.delinc(5)
      //cur is BLACK and sib it RED, so the sib-side is longer
      //first-time-thru we have deleted cur AND sib-side was already longer
      //so we rotate away from the sib-side

      cur.parent.setRed()
      sib.setBlack()

      if (cur.isLeftNode())
        this.rotateLeft(cur.parent)
      else
        this.rotateRight(cur.parent)

      sib = cur.sibling() //recalculate sibling
      assert.ok(sib !== null) //if sib.isRed by RBT#4 children of sib must be
                              // BLACK and by RBT#5 there must be two children.
                              // So the rotation made one of those children the
                              // new sibling of cur
    }

    //if delete_case2 fires then delete_case3 does not
    // look at cur.parent.setRed above and cur.parent.isBlack below

    //so-called delete_case3
    if (    cur.parent.isBlack()
         && sib.isBlack()
         && color(sib.ln) === BLACK
         && color(sib.rn) === BLACK )
    {
      this.delinc(6)
      sib.setRed()
      cur = cur.parent
      continue
      //We've deleted cur (aka cur-side is -1 BLACK) so we lightened up sib-side
      //by making sib RED. Hence the cur.parent tree is balanced but lighter!
      //So we kick the rebalancing up to the cur.parent level.
    }

    this.delinc(7)

    //so-called delete_case4
    if (    cur.parent.isRed()
         && sib.isBlack()
         && color(sib.ln) === BLACK
         && color(sib.rn) === BLACK )
    {
      this.delinc(8)
      sib.setRed()
      cur.parent.setBlack()
      break
      //First-time-thru, we deleted cur and now we sib.setRed for balance and
      //made cur.parent.setBlack so -1 + 1 == 0 and cur.parent is balanced.
      //Thus we are done.
    }

    //so-called delete_case5
    if (sib.isBlack()) {
      this.delinc(9)
      if (    cur.isLeftNode()
           && color(sib.ln) === RED
           && color(sib.rn) === BLACK )
      {
        this.delinc(10)
        sib.setRed()
        sib.ln.setBlack()
        this.rotateRight(sib) //rotating away from the RED child

        sib = cur.sibling()
        assert.ok(sib !== null)
      }
      else if (    cur.isRightNode()
                && color(sib.ln) === BLACK
                && color(sib.rn) === RED  )
      {
        this.delinc(11)
        sib.setRed()
        sib.rn.setBlack()
        this.rotateLeft(sib)

        sib = cur.sibling()
        assert.ok(sib !== null)
      }
    }

    //so-called delete_case6
    sib.color = cur.parent.color
    cur.parent.setBlack()

    if (cur.isLeftNode()) {
      this.delinc(12)
      sib.rn.setBlack()
      this.rotateLeft(cur.parent)
    }
    else {
      this.delinc(13)
      sib.ln.setBlack()
      this.rotateRight(cur.parent)
    }

    cur = null //THE END
  }//while

  this.replaceNode(child, null) //child was just a place holder for null

  return true
} //delete

function Node(key, val, parent, color) {
  this.key = key
  this.value = val
  this.parent = (parent === undefined) ? null : parent
  this.ln = null
  this.rn = null
  this.color = (color === undefined) ?  RED : color
}

Node.prototype.isRed   = function(){ return this.color === RED }
Node.prototype.isBlack = function(){ return this.color === BLACK }

Node.prototype.setRed   = function(){ this.color = RED }
Node.prototype.setBlack = function(){ this.color = BLACK }

Node.prototype.sibling = function(){
  return this.isLeftNode() ? this.parent.rn : this.parent.ln
}

Node.prototype.uncle = function(){
  assert.ok(this.parent)
  return this.parent.sibling()
}

Node.prototype.grandparent = function(){
  assert.ok(this.parent)
  return this.parent.parent
}

Node.prototype.isRightNode = function(){
  assert.ok(this.parent)
  assert.ok( (this.parent.ln === this) || (this.parent.rn === this) )
  return this.parent.rn === this
}

Node.prototype.isLeftNode = function(){
  assert.ok(this.parent)
  assert.ok( (this.parent.ln === this) || (this.parent.rn === this) )
  return this.parent.ln === this
}

var const_null_prop = { value        : null
                      , writable     : false
                      , configurable : false
                      , enumerable   : true  }
var const_black_prop = { value        : BLACK
                       , writable     : false
                       , configurable : false
                       , enumerable   : true   }
function Nil() {
  this.parent = null
  Object.defineProperty(this, 'key'  , const_null_prop)
  Object.defineProperty(this, 'value', const_null_prop)
  Object.defineProperty(this, 'key'  , const_null_prop)
  Object.defineProperty(this, 'ln'   , const_null_prop)
  Object.defineProperty(this, 'rn'   , const_null_prop)
  Object.defineProperty(this, 'color', const_black_prop)
}

util.inherits(Nil, Node)