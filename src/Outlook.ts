'use strict';

import { AbstractEmail } from "./AbstractEmail";

/*
 * Outlook - AbstractEmail childclass for Microsoft Outlook
 *
 * @version 1.0 2019-10
 */
export class Outlook extends AbstractEmail {
  
  /**
   * Constructor for objects of Outlook
   * @constructor
   * 
   */
  constructor() {
    super();
  }

  /**
   * Return container of email body
   * 
   * @return {HTMLElement} container of email body
   */
  public getBody(): HTMLElement {
    return document.querySelector("._3U2q6dcdZCrTrR_42Nxby.JWNdg1hee9_Rz6bIGvG1c");
  }

  /**
   * Return container of sender email address
   * 
   * @return {HTMLElement} container of sender email addresss
   */
  public getSender(): HTMLElement {
    return document.querySelector("div._3FAYod7kjH9o5HZX_Phvf6 > div._1Lo7BjmdsKZy3IMMxN7mVu > div:nth-child(1)");
  }

  /**
   * Return string of sender email address
   * 
   * @return {string} sender email addresss
   */
  public getSenderString(): string {
    return document.querySelector('div._5CGGutaz4d1vhT3GzbRJq > div > div:nth-child(2) > div > div > span').getAttribute('title');
  }

  /**
   * Return container of delivery time
   * 
   * @return {HTMLElement} container of delivery time
   */
  public getDeliveryTime(): HTMLElement {
    return document.querySelector("div._3FAYod7kjH9o5HZX_Phvf6 > div._1Lo7BjmdsKZy3IMMxN7mVu > div:nth-child(2)");
  }

  /**
   * Return string of delivery time
   * 
   * @return {string} delivery time
   */
  public getDeliveryTimeString(): string {
    return this.getDeliveryTime().textContent;
  }

  /**
   * Return an array of all links in email
   * 
   * @return {Array<HTMLAnchorElement>} array of anchor tags
   */
  public getLink(): Array<HTMLAnchorElement> {
    var elements = this.getBody().parentElement.querySelectorAll('a');
    return Array.prototype.map.call(elements, function(element: HTMLAnchorElement) { return element; });
  }

  /**
   * Return an array of all link text in email
   * 
   * @return {Array<string>} array of link text
   */
  public getLinkString(): Array<string> {
    var elements = this.getBody().parentElement.querySelectorAll('a');
    return Array.prototype.map.call(elements, function(element: HTMLAnchorElement) { return element.textContent; });
  }
  
  /**
   * Return an array of containers of all attachments
   * 
   * @return {Array<HTMLElement>} array of containers of attachments
   */
  public getAttachment(): Array<HTMLElement> {
    var elements = document.querySelectorAll('div.jgenqigMC4s0jMUDuG-YY > div > div > div');
    return Array.prototype.map.call(elements, function(element: Element) { return element; });
  }
  
  /**
   * Return an array of attachment file names
   * 
   * @return {Array<string>} array of attachment file names
   */
  public getAttachmentString(): Array<string> {
    var elements = document.querySelectorAll('div.jgenqigMC4s0jMUDuG-YY > div > div > div');
    return Array.prototype.map.call(elements, function(element: Element) { return element.textContent; });
  }
}
