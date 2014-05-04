var subLevel = require('level-sublevel')
  , test = require('tap').test

  , level = require('level-test')()

  , LevelObject = require('./object')

  , collect = function (stream, callback) {
      var array = []

      stream.on('data', function (chunk) {
        array.push(chunk)
      })
      stream.once('end', function () {
        callback(array)
      })
    }


test('getAll() when no data in db', function (t) {
  var object = LevelObject(level('db1'))

  object.getAll('id', function (err, array) {
    t.deepEqual(array, {})
    t.end()
  })
})

test('getAll() when data in db', function (t) {
  var db = level('db2')
    , object = LevelObject(db)

  db.put('id', JSON.stringify({ hello: 'world' }), function () {
    object.getAll('id', function (err, obj) {
      t.deepEqual(obj, { hello: 'world' })
      t.end()
    })
  })
})

test('getAll() returns same data every time', function (t) {
  var db = level('getAll-same-data')
    , object = LevelObject(db)

  db.put('id', JSON.stringify({ 'hello': 'world' }), function () {
    object.getAll('id', function (err, obj) {
      obj.beep = 'boop'
      object.getAll('id', function (err, obj) {
        t.deepEqual(obj, { 'hello': 'world' })
        t.end()
      })
    })
  })  
})

test('set()', function (t) {
  var db = level('db3')
    , object = LevelObject(db)

  object.set('id', 'foo', 'bar', function () {
    object.set('id', 'foo', 'bar', function () {
      object.getAll('id', function (err, obj) {
        t.deepEqual(obj, { foo: 'bar' })
        db.get('id', function (err, data) {
          t.equal(data, '{"foo":"bar"}')
          t.end()
        })
      })
    })
  })
})

test('set() and then remove() and then getAll()', function (t) {
  var db = level('db4')
    , object = LevelObject(db)

  object.set('id', 'foo', 'bar', function () {
    object.getAll('id', function (err, array) {
      t.deepEqual(array, { foo: 'bar' })
      object.remove('id', 'foo', function (err) {
        object.getAll('id', function (err, obj) {
          t.deepEqual(obj, {})
          db.get('id', function (err, data) {
            t.equal(err.notFound, true)
            t.end()
          })
        })
      })
    })
  })
})

test('concurrency when doing set()', function (t) {
  var db = level('db6')
    , object = LevelObject(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          object.getAll('id', function (err, obj) {
            t.deepEqual(obj, { hello: 'world', hello2: 'worldz'})
            t.end()
          })
      }

  object.set('id', 'hello', 'world', done)
  object.set('id', 'hello2', 'worldz', done)
})

test('concurrency when doing remove()', function (t) {
  var db = level('db7')
    , object = LevelObject(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          object.getAll('id', function (err, obj) {
            t.deepEqual(obj, { hell: 'world' })
            t.end()
          })
      }

  object.set('id', 'hello', 'worldz', function () {
    object.remove('id', 'hello', done)
    object.set('id', 'hell', 'world', done)
  })
})

test('sublevel', function (t) {
  var db = subLevel(level('sublevel'))
    , object = LevelObject(db)
    , count = 2
    , done = function () {
        count = count - 1

        if (count === 0)
          object.sublevel('foo').getAll('id', function (err, obj) {
            t.deepEqual(obj, { hell: 'world' })
            t.end()
          })
      }

  object.sublevel('foo').set('id', 'hello', 'worldz', function () {
    object.sublevel('foo').remove('id', 'hello', done)
    object.sublevel('foo').set('id', 'hell', 'world', done)
  })
})

test('same id on main db as in sublevel', function (t) {
  var db = subLevel(level('sublevel-same-id'))
    , object = LevelObject(db)
    , count = 6
    , done = function () {
        count = count - 1

        if (count === 0)
          // use new set-instances to avoid the cache
          LevelObject(db).getAll('id', function (err, array) {
            t.deepEqual(array, { hell: 'world' })
            LevelObject(db).sublevel('foo').getAll('id', function (err, array) {
              t.deepEqual(array, { hell: 'world2' })
              LevelObject(db).sublevel('foo').sublevel('bar').getAll('id', function (err, array) {
                t.deepEqual(array, { hell: 'world3' })
                // check that the cache works as expected also
                object.sublevel('foo').sublevel('bar').getAll('id', function (err, array) {
                  t.deepEqual(array, { hell: 'world3' })
                  t.end()
                })
              })
            })
          })
      }

  object.set('id', 'hello', 'worldz', function () {
    object.remove('id', 'hello', done)
    object.set('id', 'hell', 'world', done)
  })

  object.sublevel('foo').set('id', 'hello', 'worldz2', function () {
    object.sublevel('foo').remove('id', 'hello', done)
    object.sublevel('foo').set('id', 'hell', 'world2', done)
  })

  object.sublevel('foo').sublevel('bar').set('id', 'hello', 'worldz3', function () {
    object.sublevel('foo').sublevel('bar').remove('id', 'hello', done)
    object.sublevel('foo').sublevel('bar').set('id', 'hell', 'world3', done)
  })
})

test('streams', function (t) {
  var db = level('streams')
    , object = LevelObject(db)

  t.plan(3)

  db.put('foo', JSON.stringify({ one: 1, two: 2, three: 3 }), function () {
    db.put('bar', JSON.stringify({ beep: 'boop' }), function () {
      collect(object.createReadStream(), function (array) {
        t.deepEqual(
            array
          , [
              {
                  key: 'bar'
                , value: { beep: 'boop' }
              }
            , {
                  key: 'foo'
                , value: { one: 1, two: 2, three: 3 }
              }
            ]
        )
      })
      collect(object.createValueStream(), function (array) {
        t.deepEqual(
            array
          , [
                { beep: 'boop' }
              , { one: 1, two: 2, three: 3 }
            ]
        )
      })
      collect(object.createKeyStream(), function (array) {
        t.deepEqual(
            array
          , ['bar', 'foo']
        )
      })
    })
  })
})