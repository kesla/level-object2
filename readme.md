# level-object2[![build status](https://secure.travis-ci.org/kesla/level-object2.png)](http://travis-ci.org/kesla/level-object2)

A simple object implemented in leveldb

[![NPM](https://nodei.co/npm/level-object2.png?downloads&stars)](https://nodei.co/npm/level-object2/)

[![NPM](https://nodei.co/npm-dl/level-object2.png)](https://nodei.co/npm/level-object2/)

## Deprecated

This seemed like a fun and good idea at the time, but after some consideration I've come to the conclusion that [level-object](https://www.npmjs.org/package/level-object) already does what I want and what I need.

So you should probably use that as well.

## Installation

```
npm install level-object2
```

## Example

### Input

```javascript
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
```

### Output

```
obj from sublevel {
    "key": "value2"
}
obj {
    "key": "value"
}
empty object {}
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

