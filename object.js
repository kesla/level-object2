var encode = require('level-encode')
  , AsyncCache = require('async-cache')

  , Sets = function (db, cache, child) {
      if (!(this instanceof Sets))
        return new Sets(db, cache, child)

      var self = this

      this._children = {}

      if (child) {
        this.db = db
        this.cache = cache
      } else {
        this.db = encode(db, 'json')
        this.cache = AsyncCache({
          load: function (prefixedKey, callback) {
            self.db.get(prefixedKey, function (err, obj) {
              if (err && err.notFound)
                callback(null, {})
              else if (err)
                callback(err)
              else
                callback(null, obj)
            })
          }
        })
      }
    }

Sets.prototype.set = function (id, key, value, callback) {
  var self = this

  this.cache.get(this.prefix(id), function (err, object) {
    if (err) return callback(err)

    object[key] = value

    self.db.put(id, object, callback)
  })
}

Sets.prototype.getAll = function (id, callback) {
  this.cache.get(this.prefix(id), function (err, obj) {
    if (err)
      callback(err)
    else
      callback(null, JSON.parse(JSON.stringify(obj)))
  })
}

Sets.prototype.remove = function (id, key, callback) {
  var self = this

  this.cache.get(this.prefix(id), function (err, obj) {
    if (err) return callback(err)

    if (obj[key] === undefined) return callback()

    delete obj[key]

    if (Object.keys(obj).length === 0)
      self.db.del(id, callback)
    else
      self.db.put(id, obj, callback)
  })
}

Sets.prototype.prefix = function (key) {
  return this.db.db.prefix ? this.db.db.prefix(key) : key
}

Sets.prototype.sublevel = function (sub) {
  this._children[sub] = this._children[sub] || new Sets(this.db.sublevel(sub), this.cache, true)

  return this._children[sub]
};

['createReadStream', 'createValueStream', 'createKeyStream'].forEach(function (key) {
  Sets.prototype[key] = function (opts) {
    return this.db[key](opts)
  }
})

module.exports = Sets
