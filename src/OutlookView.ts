'use strict';

import { AbstractView } from './AbstractView';
import { Outlook } from './Outlook';

/*
 * OutlookView - AbstractView childclass for Microsoft Outlook
 *
 * @version 1.0 2019-10
 */
export class OutlookView extends AbstractView {

  /**
   * Constructor for objects of OutlookView
   * @constructor
   * 
   */
  constructor() {
    super();
    // Fix popover to the associated button
    new Outlook().getBody().style.position = 'relative';
  }

  /**
   * Draw indicator near attachments
   *
   * @param {HTMLElement} position         character position to inject indicator into
   * @param {boolean}     isSuspiciousFile whether or not link is suspicious
   */
  public showSuspiciousFile(position: HTMLElement, isSuspiciousFile: boolean): void {
    // Expand attachment pane
    var attachmentPane : HTMLElement = document.querySelector('div.jgenqigMC4s0jMUDuG-YY > div > div');
    attachmentPane.style.height = '100%';
    
    super.showSuspiciousFile(position, isSuspiciousFile);
  }
}
