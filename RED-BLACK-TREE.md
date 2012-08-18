# Red-Black Tree

Red-Black trees are binary search trees with additional criteria. If these
criteria are maintained upon insertion and deletion then the red-black tree
will be will be balanced. Insertion and deletion are guaranteed to take
O(log(N)) where N is the number of nodes in the tree.

## Insert

### Red-Red Conflict

## Delete

### Red-Red Conflict

## RBTree Criteria

1) All nodes are either RED or BLACK
2) The root node is BLACK
3) All leaves (nulls) are considered BLACK
4) Both children of RED nodes must be BLACK
5) Every path from a node to the leaves (inclusive) have the same number of
   BLACK nodes.
