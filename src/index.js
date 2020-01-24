'use strict';

/**
 * @module serverless-plugin-select-stacks
 *
 * @see {@link https://serverless.com/framework/docs/providers/aws/guide/plugins/}
 *
 * @requires 'bluebird'
 * */
const BbPromise = require('bluebird');

/**
 * @classdesc Select which functions are to be deployed
 * @class Select
 * */
class Select {
  /**
   * @description Serverless Select
   * @constructor
   *
   * @param {!Object} serverless - Serverless object
   * @param {!Object} options - Serverless options
   * */
  constructor(serverless, options) {
    /** Serverless variables */
    this.serverless = serverless;
    this.options = options;

    /** Serverless hooks */
    this.hooks = {
      'after:package:initialize': this.deployHook.bind(this),
      'before:deploy:function:initialize': this.deployHook.bind(this),
    };
  }

  /**
   * @description Deploy hook
   *
   * @fulfil {} — Functions optimized
   * @reject {Error} Optimization error
   *
   * @return {(boolean|Promise)}
   * */
  deployHook() {
    /** Skip function selection */
    if (this.options.noDeploy) {
      return false;
    }

    /** Log select start */
    this.serverless.cli.log('Select: selecting functions for deployment');

    /** Select single function */
    if (this.options.function) {
      return this.selectFunction(this.options.function);
    } else {
      /** Select all functions */
      return this.selectAllFunctions();
    }
  }

  /**
   * @description Select all functions
   *
   * @fulfil {} — All selected functions
   * @reject {Error} Selection error
   *
   * @return {Promise}
   * */
  selectAllFunctions() {
    /** Get functions */
    const allFunctions = this.serverless.service.getAllFunctions();

    /** Select functions for deployment */
    return BbPromise.map(allFunctions, functionName => {
      return this.selectFunction(functionName);
    });
  }

  /**
   * @description Select function
   *
   * @param {string} functionName - Function name
   *
   * @fulfil {} — Selected function
   * @reject {Error} Selection error
   *
   * @return {Promise}
   * */
  selectFunction(functionName) {
    /** Select promise */
    return new BbPromise((resolve, reject) => {
      /** Function object variables */
      const functionObject = this.serverless.service.getFunction(functionName);

      const stacks =
        Array.isArray(functionObject.stacks) && functionObject.stacks.length
          ? functionObject.stacks
          : false;

      /** Deployment stack not selected for function deployment */
      if (
        (stacks &&
          typeof this.options.stack !== 'undefined' &&
          stacks.indexOf(this.options.stack) === -1) ||
        (!stacks && typeof this.options.stack !== 'undefined') ||
        (stacks && typeof this.options.stack === 'undefined')
      ) {
        delete this.serverless.service.functions[functionName];

        /** Reject promise if deploying one function */
        if (this.options.function) {
          return reject(
            'Select: ' +
              functionName +
              ' not selected for deployment in the' +
              this.options.stack || 'BASE' + ' stack.'
          );
        }
      }

      /** Resolve with function object */
      resolve(functionObject);
    });
  }
}

/** Export stages class */
module.exports = Select;
