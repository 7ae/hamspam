'use strict';

import { Config } from './Config';
const { createWorker, createScheduler } = require('tesseract.js');

/*
 * AbstractEmail - scan user's email with a set of predetermined rules created based on common spam attributes
 * 
 * @version 1.0 2019-10
 */

export abstract class AbstractEmail {

  /**
   * Constructor for objects of AbstractEmail
   * @constructor
   * 
   */
  public constructor() { }

  /**
   * Check whether sender is whitelisted
   *
   * @param  {string}  sender an email address
   * @return {boolean}        true if whitelist includes sender;
   *                          false otherwise.
   */
  public isTrustedSender(sender: string): boolean {
    const whitelist = Config.getInstance().getConfigurationOf('sender-whitelist');
    if (whitelist !== undefined && whitelist.length === 0) {
      return false;
    }
    for (let whitelistItem of whitelist) {
      // Wildcard * matches any number of characters pattern
      var regex = new RegExp('^' + whitelistItem.replace(/[+?^${}()|[\]\\]/ig, '\\$&').replace('*', '.*') + '$');
      if (regex.test(sender)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check whether email has been sent late at night
   * 
   * @param  {string}  deliveryTime time
   * @throws {Error}                if delivery time is an invalid date format
*                                   exception occurred
   * @return {boolean}              true if delivery time is not late at night;
   *                                false otherwise.
   */
  public deliveredLateNight(deliveryTime: string): boolean {
    var date = new Date(deliveryTime);
    if (isNaN(date.getTime())) {
      // Leading zero makes invalid date formats valid
      date = new Date('0' + deliveryTime);
    }
    // Use 24 hour format
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error("delivery datetime is an invalid format");
    }

    const deliveryTimeInMinute = (hours * 60) + minutes;
    const lateDeliveryFrom = Config.getInstance().getConfigurationOf('late-delivery').from;
    const lateDeliveryTo = Config.getInstance().getConfigurationOf('late-delivery').to;
    if (deliveryTimeInMinute < lateDeliveryFrom || deliveryTimeInMinute > lateDeliveryTo) {
      return true;
    }
    return false;
  }

  /**
   * Check whether a link is malicious
   * 
   * @param  {string}              uri link address
   * @return {MaliciousLinkType[]}     zero or more rules link address falls under
   */
  public isMaliciousLink(uri: string): AbstractEmail.MaliciousLinkType[] {
    var result: AbstractEmail.MaliciousLinkType[] = [];

    var anchor = document.createElement('a');
    anchor.href = uri;
    // Insecure connection
    if (anchor.protocol === 'http:') {
      result.push(AbstractEmail.MaliciousLinkType.INSECURE_CONNECTION);
    }
    // Contain dash or %
    if (anchor.hostname.indexOf('-' || '%') !== -1) {
      result.push(AbstractEmail.MaliciousLinkType.SPECIALCHAR);
    }
    // Non-standard port number like https over 80 or http over 443
    if (anchor.port !== '' && anchor.protocol !== '') {
      if ((anchor.protocol === 'https:' && anchor.port === '80') || (anchor.protocol === 'http:' && anchor.port === '443')) {
        result.push(AbstractEmail.MaliciousLinkType.NONSTANDARD_PORT);
      }
    }
    // Is ip address
    if (/^\d+\.\d+\.\d+\.\d+$/g.test(anchor.hostname)) {
      result.push(AbstractEmail.MaliciousLinkType.IP_ADDRESS);
    }
    // Contain authentication credentials
    if (/.*\:\/\/.*@.*/g.test(anchor.href)) {
      result.push(AbstractEmail.MaliciousLinkType.AUTHENTICATION_CREDENTIAL);
    }
    // Prefixed with file://
    if (anchor.protocol === 'file:') {
      result.push(AbstractEmail.MaliciousLinkType.FILE);
    }
    // Is shady top-level domain
    if (['work', 'live', 'buzz', 'tk', 'fit', 'top', 'cn', 'rest'].indexOf(anchor.hostname.split('.').pop()) > -1) {
      result.push(AbstractEmail.MaliciousLinkType.TOP_LEVEL_DOMAIN);
    }
    // Hosted on free web hosting providers
    for (let webHostingService of ['weebly.com', 'cognitoforms.com', '0000webhostapp.com', 'jigsy.com', 'jotform.com']) {
      if (anchor.hostname.includes(webHostingService)) {
        result.push(AbstractEmail.MaliciousLinkType.FREE_HOSTING);
      }
    }
    // Redirect to another page, such as shortened url
    var request = new XMLHttpRequest();
    try {
      request.withCredentials = true;
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          if (anchor.href !== request.responseURL) {
            result.push(AbstractEmail.MaliciousLinkType.REDIRECT);
          }
        }
      }
      request.open('HEAD', anchor.href, false);
      request.send();
    } catch (e) {
      console.log(e);
    }

    if (anchor.textContent !== '' && result.length === 0) {
      // Recursively tests a generated link that sets href to link text
      this.isMaliciousLink(anchor.textContent);
    }

    console.log('10');

    return result;
  }

  /**
   * Check whether attachment file is suspicious
   * 
   * @param  {string}  filename file name
   * @return {boolean}          true if attachment is suspicious;
   *                            false otherwise.
   */
  public isSuspiciousFile(filename: string): boolean {
    const suspiciousFileExtensions = Config.getInstance().getConfigurationOf('suspicious-file-extensions');
    if (suspiciousFileExtensions === undefined) {
      return false;
    }
    if (suspiciousFileExtensions.indexOf(filename.split('.').pop()) >= 0) {
      return true;
    }
    return false;
  }

  /**
   * Check whether email contains spam words
   * 
   * @param  {HTMLElement}             test email body
   * @return {Array<[number, string]>}      pairs of spam word and character position
   */
  public findSpamWords(test: HTMLElement): Array<[number, string]> {
    const emojiToString = {
      '🅰️': 'a',
      '🆎': 'ab',
      '🏧': 'atm',
      '🅱️': 'b',
      '©': 'c',
      '💳': 'card',
      '🆑': 'cl',
      '🆒': 'cool',
      '🆓': 'free',
      '🗽': 'free',
      'ℹ️': 'info',
      '🆔': 'id',
      '🃏': 'j',
      '🆕': 'new',
      '🆖': 'ng',
      '⛔': 'no',
      'Ⓜ️': 'm',
      '🅾️': 'o',
      '🆗': 'ok',
      '🅿️': 'p',
      '🚫': 'no',
      '®': 'r',
      '🎰': 'casino',
      '🆘': 'sos',
      '🎫': 'ticket',
      '🎟': 'ticket',
      '💲': '$',
      '💰': '$',
      '💸': '$',
      '💵': '$',
      '🆙': 'up',
      '🆚': 'vs',
      '🚾': 'wc',
      '❌': 'x',
      '❎': 'x',
      '💤': 'z',
      '#️⃣': '#',
      '*️⃣': '*',
      '0️⃣': 0,
      '1️⃣': 1,
      '2️⃣': 2,
      '3️⃣': 3,
      '4️⃣': 4,
      '5️⃣': 5,
      '6️⃣': 6,
      '7️⃣': 7,
      '8️⃣': 8,
      '🎱': 8,
      '9️⃣': 9,
      '🔟': 10,
      '❓': '?',
      '❔': '?',
      '❗️': '!',
      '❕': '!',
      '‼': '!!',
      '⁉': '!?',
      '〰': '~',
      '➕': '+',
      '➖': '-',
    };
    // Make a deep copy of test string and converts emojis to string
    var regex = new RegExp('(\\' + Object.keys(emojiToString).join('|\\') + ')', 'g');
    var testString: string = test.innerHTML.replace(regex, function (match: string) { return emojiToString[match]; });

    // Convert test string to html
    var span: Element = document.createElement('span');
    var innerSpan: Element = document.createElement('span');
    span.appendChild(innerSpan);
    // Add test string within inner span
    innerSpan.innerHTML = testString;
    var htmlObj = span.firstChild;
    // Stringfy and tests outer span
    for (let element of <Element[]><unknown>htmlObj.parentElement.querySelectorAll(`button.hamspam`)) {
      // Replace all characters in indicator tag and internal tags with spaces
      element.outerHTML = element.outerHTML.replace(/./g, ' ');
    }
    testString = (<Element>htmlObj).innerHTML;

    // Store spam word and its character position
    var tuple: Array<[number, string]> = new Array<[number, string]>();
    for (let spamWord of Config.getInstance().getConfigurationOf('spam-words')) {
      // Match word in paragraphs excluding html tags and attribute
      regex = new RegExp('\\b(' + spamWord.replace(' ', '(\\s+)?') + '(?![^<>]*>))\\b', 'gmi');
      var match: RegExpExecArray;
      while ((match = regex.exec(testString)) != null) {
        tuple.push([match.index, match[0]]);
      }
    }
    // Return 2-tuple of position sorted in ascending order and the spam words
    return tuple.sort((num1, num2) => num1[0] - num2[0]);
  }

  /**
   * Return container of email body
   * 
   * @return {HTMLElement} container of email body
   */
  public abstract getBody(): HTMLElement;

  /**
   * Return container of sender email address
   * 
   * @return {HTMLElement} container of sender email addresss
   */
  public abstract getSender(): HTMLElement;

  /**
   * Return string of sender email address
   * 
   * @return {string} sender email addresss
   */
  public abstract getSenderString(): string;

  /**
   * Return container of delivery time
   * 
   * @return {HTMLElement} container of delivery time
   */
  public abstract getDeliveryTime(): HTMLElement;

  /**
   * Return string of delivery time
   * 
   * @return {string} delivery time
   */
  public abstract getDeliveryTimeString(): string;

  /**
   * Return an array of all links in email
   * 
   * @return {Array<HTMLAnchorElement>} array of anchor tags
   */
  public abstract getLink(): Array<HTMLAnchorElement>;

  /**
   * Return an array of all link text in email
   * 
   * @return {Array<string>} array of link text
   */
  public abstract getLinkString(): Array<string>;

  /**
   * Return an array of containers of all attachments
   * 
   * @return {Array<HTMLElement>} array of containers of attachments
   */
  public abstract getAttachment(): Array<HTMLElement>;

  /**
   * Return an array of attachment file names
   * 
   * @return {Array<string>} array of attachment file names
   */
  public abstract getAttachmentString(): Array<string>;

  /**
   * Recognize text in images
   * 
   * @param {Array<string>}    imageSources image sources
   * @return {Promise<object>}              promise object with the extracted text from images
   */
  public async imageToString(imageSources: Array<string>): Promise<object> {
    const scheduler = createScheduler();
    // Create workers
    var numWorkers = 3;
    while (numWorkers-- > 0) {
      var worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      scheduler.addWorker(worker);
    }
    // Print number of workers
    //console.log(scheduler.getNumWorkers());

    const results = await Promise.all(imageSources.map((oneImageSource) => (
      scheduler.addJob('recognize', oneImageSource)
    )));
    await scheduler.terminate();

    return results;
  }
}

/**
 * MaliciousLinkType - enum class for malicious link type
 * 
 */
export namespace AbstractEmail {
  export enum MaliciousLinkType {
    INSECURE_CONNECTION,
    SPECIALCHAR,
    NONSTANDARD_PORT,
    IP_ADDRESS,
    AUTHENTICATION_CREDENTIAL,
    FILE,
    REDIRECT,
    TOP_LEVEL_DOMAIN,
    FREE_HOSTING
  }
}
