'use strict';

import * as $ from 'jquery';
import 'bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { AbstractEmail } from './AbstractEmail';

/**
 * AbstractView - inject various indicators into user's page depending on security level
 * 
 */
export class AbstractView {
  public static readonly CLASS: string = 'hamspam';
  public static readonly BR: string = '<br aria-hidden="true">';
  public static readonly INDICATOR_SECURE: string = '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
  public static readonly INDICATOR_WARNING: string = '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/></svg>';
  public static readonly INDICATOR_CRITICAL: string = '<svg height="24" viewBox="0 0 24 24" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/></svg>';
  public static readonly SENDER_SECURE_TITLE: string = 'Whitelisted Sender';
  public static readonly SENDER_SECURE_DESCRIPTION: string = 'Sender is in your email address whitelist.';
  public static readonly SENDER_WARNING_TITLE: string = 'Non-Whitelisted Sender';
  public static readonly SENDER_WARNING_DESCRIPTION: string = `Sender is not in your email address whitelist.`;
  public static readonly DELIVERY_TIME_CRITICAL_TITLE: string = 'Night Owl';
  public static readonly DELIVERY_TIME_CRITICAL_DESCRIPTION: string = 'Email received during the late night hours is usually sent from other countries or marketing automation.';
  public static readonly DELIVERY_TIME_SECURE_TITLE: string = 'Morning Lark';
  public static readonly DELIVERY_TIME_SECURE_DESCRIPTION: string = `Email was received during the daytime in your ${AbstractView.BR} local time zone.`;
  public static readonly LINK_SECURE_TITLE: string = 'Safe Link';
  public static readonly LINK_SECURE_DESCRIPTION: string = 'Link passed all tests and appears to be safe.';
  public static readonly LINK_CRITICAL_TITLE: string = 'Unsafe Link';
  public static readonly LINK_CRITICAL_DESCRIPTION: {} = {
    9999: 'Link may be unsafe because:',
    [AbstractEmail.MaliciousLinkType.AUTHENTICATION_CREDENTIAL]: 'It contains authentication credentials',
    [AbstractEmail.MaliciousLinkType.FILE]: 'It is a path to files within your computer',
    [AbstractEmail.MaliciousLinkType.INSECURE_CONNECTION]: 'It uses the insecure HTTP server connection',
    [AbstractEmail.MaliciousLinkType.IP_ADDRESS]: 'It is IP address',
    [AbstractEmail.MaliciousLinkType.NONSTANDARD_PORT]: 'It runs on non-standard port number like HTTPS over 80 or HTTP over 443',
    [AbstractEmail.MaliciousLinkType.REDIRECT]: 'It redirects to another page',
    [AbstractEmail.MaliciousLinkType.SPECIALCHAR]: 'It has special characters in the domain name of the URL',
    [AbstractEmail.MaliciousLinkType.TOP_LEVEL_DOMAIN]: 'Top-level domain is shady',
    [AbstractEmail.MaliciousLinkType.FREE_HOSTING]: 'It is hosted on free web hosting providers'
  };
  public static readonly FILE_SECURE_TITLE: string = 'Safe File';
  public static readonly FILE_SECURE_DESCRIPTION: string = 'File passed all tests and appears to be safe';
  public static readonly FILE_WARNING_TITLE: string = 'Suspicious File';
  public static readonly FILE_WARNING_DESCRIPTION: string = `File may contain macro malware that starts ${AbstractView.BR} automatically to infect your computer without ${AbstractView.BR} your knowledge.`;
  public static readonly KEYWORD_CRITICAL_TITLE: string = 'Spam Trigger Word';
  public static KEYWORD_CRITICAL_DESCRIPTION(triggerWord): string {
    return `The keyword or phrase '<i>${triggerWord}</i>' is often used in spam emails.`;
  };
  private popoverIds: string[];

  /**
   * Constructor for objects of AbstractView
   * @constructor
   * 
   */
  constructor() {
    // Initalize array of unique popover ids
    this.popoverIds = [];
  }

  /**
   * Draw indicator with descriptive text
   *
   * @param  {AbstractView.SecurityLevel} level      a security level
   * @param  {string}                     title      tooltip title
   * @param  {string}                     message    tooltip message
   * @param  {Element}                    [position] tooltip location
   * @return {string}                                indicator to inject into page
   */
  public showMessage(level: AbstractView.SecurityLevel, title: string, message: string, position?: Element): string {
    // Create button
    var button: HTMLButtonElement = document.createElement('button');
    button.classList.add(AbstractView.CLASS);

    // Create indicator in button
    button.innerHTML = this.getIndicator(level);

    // Add styles to indicator
    (<HTMLElement>button.firstChild).classList.add(this.getIndicatorClass(level));

    // Generate unique id for this popover to distinguish from other popovers on page
    var uuid = '-' + uuidv4();
    this.popoverIds.push(uuid);
    
    // Create tooltip
    $(button).attr({'data-toggle': 'popover' + uuid, 'onclick': 'return false;', 'data-trigger': 'hover'});
    $(button).attr('role', 'tooltip');
    
    // Allow screen readers to announce popover content without mouse hover
    // TODO: test with screen readers
    $(button).attr({'aria-describedby': 'description' + uuid});
    $(`<div class="sr-only" id="description${uuid}"> ${title}. ${message}<div>`).appendTo((<HTMLElement>button.firstChild));

    $(() => {
      var popover = $('[data-toggle="popover' + uuid + '"]').popover(<any>{
        title: title,
        content: message,
        placement: 'left',
        html: true,
        animation: true,
        // Keep the text of the popover open on mouseover by putting it within popover container
        container: <any>$('[data-toggle="popover' + uuid + '"]'),
        template: '<div class="popover shadow-sm" role="tooltip"><div class="arrow"></div><div class="popover-header"></div><div class="popover-body"></div></div>',
      });
    });

    // Stop the event bubbling on tooltip click
    $(button).on('click keyup', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });

    if (position) {
      position.prepend(button);
    } else {
      return button.outerHTML;
    }
    button.parentElement.style.display = 'block';
  }

  /**
   * Draw indicator near sender email address
   *
   * @param {HTMLElement} position        character position to inject indicator into
   * @param {boolean}     isTrustedSender whether or not sender email address is trusted
   */
  public showIfIsTrustedSender(position: HTMLElement, isTrustedSender: boolean): void {
    if (isTrustedSender) {
      this.showMessage(AbstractView.SecurityLevel.SECURE, AbstractView.SENDER_SECURE_TITLE, AbstractView.SENDER_SECURE_DESCRIPTION, position);
    } else {
      this.showMessage(AbstractView.SecurityLevel.WARNING, AbstractView.SENDER_WARNING_TITLE, AbstractView.SENDER_WARNING_DESCRIPTION, position);
    }
  }

  /**
   * Draw indicator near email delivery time
   *
   * @param {HTMLElement} position           character position to inject indicator into
   * @param {boolean}     deliveredLateNight whether or not email has been delivered late at night
   */
  public showIfDeliveredLateNight(position: HTMLElement, deliveredLateNight: boolean): void {
    if (deliveredLateNight) {
      this.showMessage(AbstractView.SecurityLevel.CRITICAL, AbstractView.DELIVERY_TIME_CRITICAL_TITLE, AbstractView.DELIVERY_TIME_CRITICAL_DESCRIPTION, position);
    } else {
      this.showMessage(AbstractView.SecurityLevel.SECURE, AbstractView.DELIVERY_TIME_SECURE_TITLE, AbstractView.DELIVERY_TIME_SECURE_DESCRIPTION, position);
    }
  }

  /**
   * Draw indicator near links
   *
   * @param {HTMLElement}                       position          character position to inject indicator into
   * @param {AbstractEmail.MaliciousLinkType[]} maliciousLinkType why link is malicious
   */
  public showMaliciousLink(position: HTMLElement, maliciousLinkType: AbstractEmail.MaliciousLinkType[]): void {
    if (maliciousLinkType.length === 0) {
      this.showMessage(AbstractView.SecurityLevel.SECURE, AbstractView.LINK_SECURE_TITLE, AbstractView.LINK_SECURE_DESCRIPTION, position);
      return;
    }

    var div = document.createElement('div');
    div.textContent = AbstractView.LINK_CRITICAL_DESCRIPTION[9999];
    var ul = document.createElement('ul');
    div.appendChild(ul);

    while (maliciousLinkType.length > 0) {
      var li = document.createElement('li');
      li.innerHTML = AbstractView.LINK_CRITICAL_DESCRIPTION[maliciousLinkType.pop()];
      ul.appendChild(li);
    }
    this.showMessage(AbstractView.SecurityLevel.CRITICAL, AbstractView.LINK_CRITICAL_TITLE, div.outerHTML, position);
  }

  /**
   * Draw indicator near attachments
   *
   * @param {HTMLElement} position         character position to inject indicator into
   * @param {boolean}     isSuspiciousFile whether or not link is suspicious
   */
  public showSuspiciousFile(position: HTMLElement, isSuspiciousFile: boolean): void {
    if (isSuspiciousFile) {
      this.showMessage(AbstractView.SecurityLevel.CRITICAL, AbstractView.FILE_SECURE_TITLE, AbstractView.FILE_SECURE_DESCRIPTION, position);
    } else {
      this.showMessage(AbstractView.SecurityLevel.WARNING, AbstractView.FILE_WARNING_TITLE, AbstractView.FILE_WARNING_DESCRIPTION, position);
    }
  }

  /**
   * Return indicator for spam word, as string
   *
   * @param  {string}  triggerWord         a spam word
   * @return {string}                      indicator as string
   */
  public showSpamWord(triggerWord: string): string {
    return this.showMessage(AbstractView.SecurityLevel.CRITICAL, AbstractView.KEYWORD_CRITICAL_TITLE, AbstractView.KEYWORD_CRITICAL_DESCRIPTION(triggerWord.trim()));
  }

  /**
   * Remove every indicator on page
   *
   */
  public clear(): void {
    var hamspam = document.getElementsByClassName(AbstractView.CLASS);
    if (hamspam.length > 0) {
      for (let i = 0; i < hamspam.length; i) {
        hamspam[0].parentNode.removeChild(hamspam[0]);
      }
    }
  }

  /**
   * Return svg indicator image
   *
   * @param  {AbstractView.SecurityLevel} level security level
   * @return {string}                           svg indicator image
   */
  public getIndicator(level: AbstractView.SecurityLevel): string {
    var enums = {
      [AbstractView.SecurityLevel.SECURE]: AbstractView.INDICATOR_SECURE,
      [AbstractView.SecurityLevel.WARNING]: AbstractView.INDICATOR_WARNING,
      [AbstractView.SecurityLevel.CRITICAL]: AbstractView.INDICATOR_CRITICAL
    }
    return enums[level];
  }
  
  /**
   * Return css class associated with security level for styling indicator
   *
   * @param  {AbstractView.SecurityLevel} level security level
   * @return {string}                           css class that can be added to and style indicator
   */
  public getIndicatorClass(level: AbstractView.SecurityLevel): string {
    var enums = {
      [AbstractView.SecurityLevel.SECURE]: 'hamspam-secure',
      [AbstractView.SecurityLevel.WARNING]: 'hamspam-warning',
      [AbstractView.SecurityLevel.CRITICAL]: 'hamspam-critical'
    }
    return enums[level];
  }
}

/**
 * SecurityLevel - enum class for security level
 * 
 */
export namespace AbstractView {
  export enum SecurityLevel {
    SECURE, WARNING, CRITICAL
  }
}
