/**
 * @module rbtree
 */

exports = module.exports = RBTree

var assert = require('assert')
  , util = require('util')

var RED = 'red'
  , BLACK = 'black'

/**
 *
 * @class RBTree
 * @constructor
 * @param {Function} cmp
 */
function RBTree(cmp) {
  assert.ok(typeof cmp === 'function')
  this.root = null
  this.cmp = cmp
}

RBTree.RBTree = RBTree
//RBTree.Node = Node
//RBTree.RED = RED
//RBTree.BLACK = BLACK

//
// Utility functions
//

/**
 * Reparent's `node` into the position `orig` occupied.
 *
 * @method _replaceNode
 * @private
 * @param {Node} orig must be non-null
 * @param {Node}  node may be null
 */
RBTree.prototype._replaceNode = function(orig, node) {
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

/**
 * Perform a rotate-left operation on the tree
 *
 * @method _rotateLeft
 * @private
 * @param {Node} node
 * @return {Node} the new root of this sub-tree
 */
RBTree.prototype._rotateLeft = function(node) {
  var parent = node.parent
    , right = node.rn

  //re-parent node & right
  if (parent) {
    if (node.isLeftChild()) {
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


/**
 * Perform a rotate-right operation on the tree
 *
 * @method _rotateRight
 * @private
 * @param {Node} node
 * @return {Node} the new root of this sub-tree
 */
RBTree.prototype._rotateRight = function(node) {
  var parent = node.parent
    , left = node.ln
  //re-parent node & left
  if (parent) {
    if (node.isLeftChild())
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


/**
 * Find the RBTree Node containing `key`.
 *
 * @method _find
 * @private
 * @param {Key} key
 * @return {Node} the node containing `key`
 */
RBTree.prototype._find = function(key){
  var cur = this.root

  while (cur) {
    var cmp = this.cmp(key, cur.key)
    if ( cmp < 0 /* key < cur.key */) {
      cur = cur.ln
    }
    else if ( cmp > 0 /* key > cur.key */) {
      cur = cur.rn
    }
    else /* cmp === 0; key === cur.key */ {
      break
    }
  }

  return cur
}


/**
 * Find the least/first node.
 *
 * @method _findLeast
 * @private
 * @return {Node} Retuns the first node.
 */
RBTree.prototype._findLeast = function(){
  var cur = this.root

  if (cur) {
    while (cur.ln) {
      cur = cur.ln
    }
  }

  return cur
}


/**
 * Find the greatest/last node.
 *
 * @method _findGreatest
 * @private
 * @return {Node} Returns the last node.
 */
RBTree.prototype._findGreatest = function(){
  var cur = this.root

  if (cur) {
    while (cur.rn) {
      cur = cur.rn
    }
  }

  return cur
}


/**
 * Find the first RBTree Node coming from the low side that is greater-than
 * `key`.
 *
 * @method _findLeastGT
 * @private
 * @param {Key} key
 * @return {Node} the node containing `key`
 */
RBTree.prototype._findLeastGT = function(key){
  var cmp
    , cur = this.root
    , last /* last node satasfying criteria */

  while (cur) {
    cmp = this.cmp(cur.key, key)
    if ( cmp > 0 /* cur.key > key */) {
      last = cur
      cur = cur.ln
    }
    else if ( cmp <= 0 /* cur.key <= key */) {
      cur = cur.rn
    }
  }

  return last
}


/**
 * Find the first RBTree Node coming from the low side that is
 * greater-than-or-equal to `key`.
 *
 * @method _findLeastGE
 * @private
 * @param {Key} key
 * @return {Node} the node containing `key`
 */
RBTree.prototype._findLeastGE = function(key){
  var cmp
    , cur = this.root
    , last /* last node satasfying criteria */

  while (cur) {
    cmp = this.cmp(cur.key, key)
    if ( cmp > 0 /* cur.key > key */) {
      last = cur
      cur = cur.ln
    }
    else if ( cmp < 0 /* cur.key < key */) {
      cur = cur.rn
    }
    else /* cmp == 0; key === cur.key */ {
      return cur
    }
  }

  return last
}


/**
 * Find the first RBTree Node coming from the high side that is less-than `key`.
 *
 * @method _findGreatestLT
 * @private
 * @param {Key} key
 * @return {Node} the node containing `key`
 */
RBTree.prototype._findGreatestLT = function(key){
  var cmp
    , cur = this.root
    , last /* last seen node that satasfied criteria */

  while (cur) {
    cmp = this.cmp(cur.key, key)
    if ( cmp < 0 /* cur.key < key */) {
      last = cur
      cur = cur.rn
    }
    else if ( cmp >= 0 /* cur.key > key */) {
      cur = cur.ln
    }
  }

  return last
}


/**
 * Find the first RBTree Node coming from the high side that is
 * less-than-or-equal to `key`.
 *
 * @method _findGreatestLE
 * @private
 * @param {Key} key
 * @return {Node} the node containing `key`
 */
RBTree.prototype._findGreatestLE = function(key){
  var cmp
    , cur = this.root
    , last /* last node satasfying criteria */

  while (cur) {
    cmp = this.cmp(cur.key, key)
    if ( cmp < 0 /* cur.key < key */) {
      last = cur
      cur = cur.rn
    }
    else if ( cmp > 0 /* cur.key > key */) {
      cur = cur.ln
    }
    else /* cmp == 0; key == cur.key */ {
      return cur
    }
  }

  return last
}


/**
 * Find the next Node after the given Node.
 *
 * @method _findNext
 * @private
 * @param {Node} cur
 * @return {Node}
 */
RBTree.prototype._findNext = function(cur){
  if (cur && cur.rn) {
    cur = cur.rn
    while (cur.ln) {
      cur = cur.ln
    }
    return cur
  }

  var prev
  while (cur) {
    prev = cur
    cur = cur.parent
    if (!prev.parent || prev.isLeftChild()) {
      break
    }
  }

  return cur
}


/**
 * Find the previous Node before the given Node.
 *
 * @method _findPrev
 * @private
 * @param {Node} cur
 * @return {Node}
 */
RBTree.prototype._findPrev = function(cur){
  if (cur && cur.ln) {
    cur = cur.ln
    while (cur.rn) {
      cur = cur.rn
    }
    return cur
  }

  var prev
  while (cur) {
    prev = cur
    cur = cur.parent
    if (!prev.parent || prev.isRightChild()) {
      break
    }
  }

  return cur
}


/**
 * Visit each node in-order an call a function on the `(key,data)`.
 *
 * @method inorder
 * @public
 * @param {Function} fn fn(key, data)
 */
RBTree.prototype.inorder = function(fn, reverse){
  if (reverse == undefined) reverse = false

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


/**
 * Determine if a `key` exists in the tree.
 *
 * @method exists
 * @public
 * @param {Key} key
 * @return {Boolean}
 */
RBTree.prototype.exists = function(key){
  var cur = this._find(key)
  return !!cur
}


/**
 * Retreive the data assosiated with `key`.
 *
 * @method get
 * @public
 * @param {Key} key
 * @return {Object}
 */
RBTree.prototype.get = function(key){
  var cur = this._find(key)
  if (cur) return cur.val
  return undefined
}


/**
 * Insert a `(key,value)` pair into the tree.
 *
 * @method put
 * @public
 * @param {Key} key
 * @param {Value} val
 */
RBTree.prototype.put = function(key, val){
  if (this.root === null) {
    this.root = new Node(key, val, null)
    this.root.setBlack()
    return
  }

  var cur = this.root

  while (1) {
    var cmp = this.cmp(key, cur.key)

    if (cmp === 0) {
      cur.val = val
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
      //This is the root node. So According to RBT#2 it must be made BLACK
      cur.setBlack()
      return //or break
    }

    //so-called insert_case2
    if (cur.parent.isBlack()) {
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
    if (cur.isRightChild() && cur.parent.isLeftChild()) {
      this._rotateLeft(cur.parent)
      cur = cur.ln //cur.ln was cur.parent
    }
    else if (cur.isLeftChild() && cur.parent.isRightChild()) {
      this._rotateRight(cur.parent)
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
    if (cur.isLeftChild()) {
      this._rotateRight(gp)
    }
    else {
      this._rotateLeft(gp)
    }

    break;
    //Man I wish JS had goto's. That fuckwad that wrote gotos-considered-harmful
    //should be shot. Yes goto, like hammers/screwdrivers/guns, CAN BE harmful
    //IF you start wacking/stabbing/shooting at random.
  }//while

  //return
}//put


/**
 * Remove a `key` (and its value) from the tree.
 *
 * @method del
 * @public
 * @param {Key} key
 * @return {Boolean} whether or not the key was found and removed.
 */
/**
 * **depricated** use: [`tree.del()`](#method_del)
 *
 * Remove a `key` (and its value) from the tree.
 *
 * @method delete
 * @deprecated
 * @param {Key} key
 * @return {Boolean} whether or not the key was found and removed.
 */
RBTree.prototype.del =
RBTree.prototype.delete = function(key){
  var cur = this._find(key)

  if (!cur) return false //key NOT FOUND

  //if cur is an internal node
  if (cur.rn && cur.ln) {
    //have to find a victim
    //victim is the previous in-order node
    var victim = cur.ln
    while (victim.rn) victim = victim.rn

    cur.key = victim.key
    cur.val = victim.val

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
    assert(cur.ln === null, "cur has left child")
    assert(cur.rn === null, "cur has right child")

    if (cur.isLeftChild()) cur.parent.ln = null
    else cur.parent.rn = null

    return true //THE END
  }

  //cur is BLACK

  //if cur has one non-null child
  if (child) {
    assert.ok(child.isRed(), "child of node-to-be-deleted is NOT RED! WTF!?!")
    assert.ok(child.ln === null)
    assert.ok(child.rn === null)

    child.setBlack()

    this._replaceNode(cur, child)

    return true //THE END
  }

  // THE WORST/MOST-COMPLICATED CASE
  //cur is BLACK with no children
  assert.ok(cur.isBlack())
  assert.ok(cur.ln === null)
  assert.ok(cur.rn === null)

  child = new Nil() //place holder the will be eliminated later
  this._replaceNode(cur, child) //this removes cur from the tree

  cur = child //child is a magic Nil Node to make sure it doesn't get modified
  while (cur) {

    //so-called delete_case1
    if (cur.parent === null) {//this is the tree root
      break
    }

    var sib = cur.sibling()
    assert.ok(sib !== null) //By RBT#5 a BLACK node MUST have a sibling
                            //BULLSHIT! first time thru cur is Nil
                            //DOUBLE BULLSHIT! cur WAS BLACK then replaceNode'd

    //so-called delete_case2
    if ( sib.isRed() ) {
      //cur is BLACK and sib it RED, so the sib-side is longer
      //first-time-thru we have deleted cur AND sib-side was already longer
      //so we rotate away from the sib-side

      cur.parent.setRed()
      sib.setBlack()

      if (cur.isLeftChild())
        this._rotateLeft(cur.parent)
      else
        this._rotateRight(cur.parent)

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
      sib.setRed()
      cur = cur.parent
      continue
      //We've deleted cur (aka cur-side is -1 BLACK) so we lightened up sib-side
      //by making sib RED. Hence the cur.parent tree is balanced but lighter!
      //So we kick the rebalancing up to the cur.parent level.
    }

    //so-called delete_case4
    if (    cur.parent.isRed()
         && sib.isBlack()
         && color(sib.ln) === BLACK
         && color(sib.rn) === BLACK )
    {
      sib.setRed()
      cur.parent.setBlack()
      break
      //First-time-thru, we deleted cur and now we sib.setRed for balance and
      //made cur.parent.setBlack so -1 + 1 == 0 and cur.parent is balanced.
      //Thus we are done.
    }

    //so-called delete_case5
    if (sib.isBlack()) {
      if (    cur.isLeftChild()
           && color(sib.ln) === RED
           && color(sib.rn) === BLACK )
      {
        sib.setRed()
        sib.ln.setBlack()
        this._rotateRight(sib) //rotating away from the RED child

        sib = cur.sibling()
        assert.ok(sib !== null)
      }
      else if (    cur.isRightChild()
                && color(sib.ln) === BLACK
                && color(sib.rn) === RED  )
      {
        sib.setRed()
        sib.rn.setBlack()
        this._rotateLeft(sib)

        sib = cur.sibling()
        assert.ok(sib !== null)
      }
    }

    //so-called delete_case6
    sib.color = cur.parent.color
    cur.parent.setBlack()

    if (cur.isLeftChild()) {
      sib.rn.setBlack()
      this._rotateLeft(cur.parent)
    }
    else {
      sib.ln.setBlack()
      this._rotateRight(cur.parent)
    }

    cur = null //THE END
  }//while

  this._replaceNode(child, null) //child was just a place holder for null

  return true
} //delete


function Node(key, val, parent, color) {
  this.key = key
  this.val = val
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
  return this.isLeftChild() ? this.parent.rn : this.parent.ln
}

Node.prototype.uncle = function(){
  assert.ok(this.parent)
  return this.parent.sibling()
}

Node.prototype.grandparent = function(){
  assert.ok(this.parent)
  return this.parent.parent
}

Node.prototype.isRightChild = function(){
  assert.ok(this.parent)
  return this.parent.rn === this
}

Node.prototype.isLeftChild = function(){
  assert.ok(this.parent)
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
  Object.defineProperty(this, 'val'  , const_null_prop)
  Object.defineProperty(this, 'ln'   , const_null_prop)
  Object.defineProperty(this, 'rn'   , const_null_prop)
  Object.defineProperty(this, 'color', const_black_prop)
}

util.inherits(Nil, Node)
