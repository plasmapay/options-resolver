import _ from 'lodash';

export default function createResolver() {
  var state = {
    defined: {},
    defaults: {},
    required: {},
    resolved: {},
    normalizers: {},
    allowedValues: {},
    allowedTypes: {},
    lazy: {},
    calling: {},
    locked: false
  };

  var clone = {locked: false};

  function setDefault(option, value) {
    if (state.locked) {
      throw new Error('Default values cannot be set from a lazy option or normalizer.');
    }

    if (!state.defined.hasOwnProperty(option)
      || null === state.defined[option]
      || state.resolved.hasOwnProperty(option)) {
      state.resolved[option] = value;
    }

    state.defaults[option] = value;
    state.defined[option] = true;

    return this;
  }

  function setDefaults(defaults) {
    _.forEach(defaults, (value, option) => {
      setDefault(option, value);
    });

    return this;
  }

  function hasDefault(option) {
    return state.defaults.hasOwnProperty(option);
  }

  function setRequired(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be made required from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    _.forEach(optionNames, (option) => {
      state.defined[option] = true;
      state.required[option] = true;
    });

    return this;
  }

  function isRequired(option) {
    return (state.required.hasOwnProperty(option)
      && null !== state.required[option]);
  }

  function getRequiredOptions() {
    return Object.keys(state.required);
  }

  function isMissing(option) {
    return (isRequired(option) && !hasDefault(option));
  }

  function getMissingOptions() {
    return _.difference(Object.keys(state.required), Object.keys(state.defaults));
  }

  function setDefined(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be defined from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    _.forEach(optionNames, (option) => {
      state.defined[option]= true;
    });

    return this;
  }

  function isDefined(option) {
    return (state.defined.hasOwnProperty(option) && null !== state.defined[option]);
  }

  function getDefinedOptions() {
    return Object.keys(state.defined);
  }

  function setNormalizer(option, normalizer) {
    if (state.locked) {
      throw new Error('Normalizers cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.normalizers[option] = normalizer;
    state.resolved = _.omit(state.resolved, option);

    return this;
  }

  function setAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.allowedValues[option] = Array.isArray(values) ? values : [values];
    state.resolved = _.omit(state.resolved, option);

    return this;
  }

  function addAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    if (!state.allowedValues.hasOwnProperty(option) || null === state.allowedValues[option]) {
      state.allowedValues[option] = values;
    } else {
      state.allowedValues[option] = [...state.allowedValues[option], ...values];
    }

    state.resolved = _.omit(state.resolved, option);

    return this;
  }

  function setAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.allowedTypes[option] = Array.isArray(types) ? types : [types];
    state.resolved = _.omit(state.resolved, option);

    return this;
  }

  function addAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    if (!Array.isArray(types)) {
      types = [types];
    }

    if (!state.allowedTypes.hasOwnProperty(option) || null === state.allowedTypes[option]) {
      state.allowedTypes[option] = types;
    } else {
      state.allowedTypes[option] = [...state.allowedTypes[option], ...types];
    }

    state.resolved = _.omit(state.resolved, option);

    return this;
  }

  function remove(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be removed from a lazy option or normalizer.');
    }

    state.defined       = _.omit(state.defined, optionNames);
    state.defaults      = _.omit(state.defaults, optionNames);
    state.required      = _.omit(state.required, optionNames);
    state.resolved      = _.omit(state.resolved, optionNames);
    state.lazy          = _.omit(state.lazy, optionNames);
    state.normalizers   = _.omit(state.normalizers, optionNames);
    state.allowedValues = _.omit(state.allowedValues, optionNames);
    state.allowedTypes  = _.omit(state.allowedTypes, optionNames);

    return this;
  }

  function clear() {
    if (state.locked) {
      throw new Error('Options cannot be cleared from a lazy option or normalizer.');
    }

    state.defined       = {};
    state.defaults      = {};
    state.required      = {};
    state.resolved      = {};
    state.lazy          = {};
    state.normalizers   = {};
    state.allowedValues = {};
    state.allowedTypes  = {};
    state.calling       = {};

    return this;
  }

  function resolve(options = {}, callback) {
    return new Promise((resolve, reject) => {

      function throwError(err, args) {
        if (_.isFunction(callback)) {
          return callback(err, args);
        }

        return reject(err);
      }

      if (state.locked) {
        const err = new Error('Options cannot be state.resolved from a lazy option or normalizer.');
        return throwError(err);
      }

      clone = _.clone(state, true);
      const definedDiff = _.difference(Object.keys(options), Object.keys(clone.defined));

      if (definedDiff.length) {
        const definedKeys = _.sortBy(Object.keys(clone.defined)).join('", "');
        const diffKeys = _.sortBy(definedDiff).join('", "');
        const err = `The option(s) "${diffKeys}" do not exist. Defined options are: "${definedKeys}"`;
        return throwError(err);
      }

      clone.defaults = _.merge(clone.defaults, options);
      clone.resolved = _.omit(clone.resolved, Object.keys(options));
      clone.lazy = _.omit(clone.lazy, options);

      const requiredDiff = _.difference(Object.keys(clone.required), Object.keys(clone.defaults));
      if (requiredDiff.length) {
        const diffKeys = _.sortBy(requiredDiff).join('", "');
        const err = `The required options "${diffKeys}" are missing`;
        return throwError(err);
      }

      clone.locked = true;
      for (const option in clone.defaults) {
        get(option);
      }

      const resolved = _.clone(clone.resolved, true);
      clone = {locked: false};

      if (_.isFunction(callback)) {
        return callback(undefined, resolved);
      }

      resolve(resolved);
    });
  }

  function get(option) {
    if (!clone.locked) {
      throw new Error('get is only supported within closures of lazy options and normalizers.');
    }

    if (clone.resolved.hasOwnProperty(option)) {
      return clone.resolved[option];
    }

    if (!clone.defaults.hasOwnProperty(option)) {
      if (!clone.defined.hasOwnProperty(option) || null === clone.defined[option]) {
        const definedOptions = Object.keys(clone.defined).join('", "');
        throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
      }

      throw new Error(`The optional option "${option}" has no value set. You should make sure it is set with "isset" before reading it.`);
    }

    let value = clone.defaults[option];

    // @todo : process lazy option
    if (clone.allowedTypes.hasOwnProperty(option)
      && null !== clone.allowedTypes[option]) {
      let valid = false;

      for (let allowedType of clone.allowedTypes[option]) {
        var functionName = 'is' + allowedType.charAt(0).toUpperCase() + allowedType.substr(1).toLowerCase();
        if (_.hasOwnProperty(functionName)) {
          if (_[functionName](value)) {
            valid = true;
            break;
          }

          continue;
        }

        if (typeof value === allowedType) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        // @todo add better log error
        throw new Error(`Invalid type for option "${option}".`);
      }
    }

    if (clone.allowedValues.hasOwnProperty(option)
      && null !== clone.allowedValues[option]) {
      let success = false;
      let printableAllowedValues = [];

      for (let allowedValue of clone.allowedValues[option]) {
        if (_.isFunction(allowedValue)) {
          if (allowedValue(value)) {
            success = true;
            break;
          }

          continue;
        } else if (value === allowedValue) {
          success = true;
          break;
        }

        printableAllowedValues.push(allowedValue);
      }

      if (!success) {
        let message = `The option "${option}" is invalid.`;
        if (printableAllowedValues.length) {
          message += ' Accepted values are : ' + printableAllowedValues.join(', ');
        }

        throw new Error(message);
      }
    }

    if (clone.normalizers.hasOwnProperty(option)
      && null !== clone.normalizers[option]) {
      if (clone.calling.hasOwnProperty(option) && null !== clone.calling[option]) {
        const callingKeys = Object.keys(clone.calling).join('", "');
        throw new Error(`The options "${callingKeys}" have a cyclic dependency`);
      }

      let normalizer = clone.normalizers[option];
      clone.calling[option] = true;
      try {
        value = normalizer(value);
      } finally {
        clone.calling = _.omit(clone.calling, option);
      }
    }

    clone.resolved[option] = value;

    return value;
  }

  return {
    setDefault,
    setDefaults,
    hasDefault,
    setRequired,
    isRequired,
    getRequiredOptions,
    isMissing,
    getMissingOptions,
    setDefined,
    isDefined,
    getDefinedOptions,
    setNormalizer,
    setAllowedValues,
    addAllowedValues,
    setAllowedTypes,
    addAllowedTypes,
    remove,
    clear,
    resolve,
    get
  }
}
