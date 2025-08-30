class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Remove node from doubly linked list
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  // Add node right after head
  _add(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  // Get a value by key (move to front if found)
  get(key) {
    if (!this.cache.has(key)) return -1;
    let node = this.cache.get(key);
    this._remove(node);
    this._add(node);
    return node.value;
  }

  // Insert/Update a value
  put(key, value) {
    if (this.cache.has(key)) {
      this._remove(this.cache.get(key));
    }

    let node = new Node(key, value);
    this._add(node);
    this.cache.set(key, node);

    let evicted = null;

    // If over capacity → remove least recently used
    if (this.cache.size > this.capacity) {
      let lru = this.tail.prev;
      this._remove(lru);
      this.cache.delete(lru.key);
      evicted = { key: lru.key, value: lru.value }; // ✅ track evicted
    }

    return evicted;
  }

  // Get all items in cache (from most recent to least)
  keys() {
    let res = [];
    let node = this.head.next;
    while (node && node !== this.tail) {
      res.push({ key: node.key, value: node.value });
      node = node.next;
    }
    return res;
  }
}

module.exports = LRUCache;
