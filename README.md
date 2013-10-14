# Red-Black Tree

[Wikipedia entry for Red-Black Trees][wikipedia-rbtree]

[wikipedia-rbtree]: http://en.wikipedia.org/wiki/Red-black_tree
  "Wikipedia entry for Red-Black Trees"

## RBTree API

### `tree = new RBTree(cmp)`

  `cmp` is a funtion is a function to compare your keys to determine ordering.
  The function will take two of your key type (whatever that will be) and 
  return `-1`, `0`, xor `1`. For `cmp(a,b)`, it returns `-1` if `a < b`, `0`
  if `a == b` and `1` if `a > b`.

### `tree.nelts`

  Number of entries in tree.

### `tree.put(key, value)`

  Insert `key:value` pair. It will over-write a pre-existed entry for `key`.

### `value = tree.get(key)`

  Warning: `value` is `undefined` if the key was not found. However, you could
  have inserted `undefined` as the value of a `key:value` pair. Try not to do
  that as it lessens the effectivity of this method.

### `removed = tree.delete(key)`

  Returns a _boolean_; `true` if deleted, `false` otherwise.

## RBTree Criteria

1. All nodes are either RED or BLACK
2. The root node is BLACK
3. All leaves (nulls) are considered BLACK
4. Both children of RED nodes must be BLACK
5. Every path from a node to the leaves (inclusive) have the same number of
   BLACK nodes.

## Running Tests and Test-coverage

To run tests: `npm test`

To run test coverage:

    npm run-script test-cov
    open jscov.html
