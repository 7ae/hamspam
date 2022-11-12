'use strict';

import * as jsyaml from 'js-yaml';

/*
 * Config - retrieve configuration settings from config.yaml
 * 
 */
export class Config {
  private static instance: Config = null;
  private doc: object;

  /**
   * Constructor for objects of Config
   * @constructor
   * 
   */
  private constructor() { }

  /**
   * Return instance of Config class
   *
   * @return {Config} instance of Config class; if instance is undefined, initialize Config class and return
   * 
   */
  public static getInstance(): Config {
    if (this.instance === null) {
      this.instance = new Config();
      this.instance.readConfigurationFile();
    }
    return this.instance;
  }

  /**
   * Load Configuration File
   * 
   */
  private readConfigurationFile(): void {
    var request = new XMLHttpRequest();
    request.withCredentials = true;
    request.open('GET', chrome.runtime.getURL('/config.yaml'), false);
    request.onload = function() {
      Config.getInstance().doc = jsyaml.safeLoad(request.responseText);
    }
    request.send();
  }

  /**
   * Return configuration settings for certain attribute
   *
   * @param  {string} attr configuration attribute
   * @return {any}         configuration settings associated with the attribute
   * 
   */
  public getConfigurationOf(attr: string): any {
    return this.doc[attr];
  }
}
