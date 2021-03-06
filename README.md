# OptionsResolver

This is a port of awesome Symfony component OptionsResolver.
This library processes and validates option object.

[![Build Status](https://travis-ci.org/krachot/options-resolver.svg?branch=master)](https://travis-ci.org/krachot/options-resolver)
[![Code Climate](https://codeclimate.com/github/krachot/options-resolver/badges/gpa.svg)](https://codeclimate.com/github/krachot/options-resolver)

## Installation

```
npm install options-resolver --save
```

## Usage

```js
import createResolver from 'options-resolver';

const resolver = createResolver();
resolver
  .setDefaults({
    'foo': 'bar',
    'baz': 'bam'
  })
  .setRequired('foo')
  .setAllowedTypes('foo', 'string')
  .setAllowedValues('foo', ['bar', 'one'])
;

resolver.resolve({
  'foo': 'one'
}).then((options) => {
  // options is equal to :
  // {
  //    'foo': 'one',
  //    'baz': 'bam'
  // }
});

```

## Run tests

```
npm run test
```

## TODO

* Improve documentation
* Add Express middleware

## Release History

* 1.0.0 First release




