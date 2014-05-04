var db = require('level-sublevel')(require('level-test')()('sets'))

  , object = require('./object')(db)

object.set('obj', 'key', 'value', function () {
  object.set('obj', 'key', 'value', function () {
    object.getAll('obj', function (err, obj) {
      console.log('obj', JSON.stringify(obj, null, 4))
      object.getAll('bar', function (err, obj) {
        console.log('empty object', JSON.stringify(obj, null, 4))
      })
    })
  })
})

// we've also got support for sublevels built in! This
// assumes that the db is object on sublevel

object.sublevel('boo').set('obj', 'key', 'value2', function () {
  object.sublevel('boo').getAll('obj', function (err, obj) {
    console.log('obj from sublevel', JSON.stringify(obj, null, 4))
  })
})