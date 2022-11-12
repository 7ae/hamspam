'use strict';

import { Config } from './Config';
import * as Lib from './Lib';
import { AbstractEmail } from './AbstractEmail';
import { AbstractView } from './AbstractView';
import * as $ from 'jquery';

// Import index.css
$(`<link rel="stylesheet" href="${chrome.runtime.getURL('/css/index.css')}">`).appendTo('head');
// Import popper.js and bootstrap
$('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js"></script>').appendTo('head');

// Create dynamically email object and view object based on the current page's url
for (let conf of Config.getInstance().getConfigurationOf('email')) {
  var anchor = document.createElement('a'); 
  anchor.href = window.location.origin;
  if (anchor.hostname === conf.hostname) {
    var email: AbstractEmail = new Lib[conf.name]();
    var view: AbstractView = new Lib[conf.view]();
    // Remove all old indicators before drawing new
    view.clear();
    
    checkSender();
    checkDeliveryTime();
    checkLinks();
    checkAttachments();
    checkSpamWord();
  }
}

function checkSender(): void {
  var senderElement = email.getSender();
  var sender = email.getSenderString();
  var isTrustedSender = email.isTrustedSender(sender);
  view.showIfIsTrustedSender(senderElement, isTrustedSender);
}

function checkDeliveryTime(): void {
  var deliveryTimeElement = email.getDeliveryTime();
  var deliveryTime = email.getDeliveryTimeString();
  var deliveredLateNight = email.deliveredLateNight(deliveryTime);
  view.showIfDeliveredLateNight(deliveryTimeElement, deliveredLateNight);
}

function checkLinks(): void {
  var linkElements = email.getLink();
  var links = email.getLinkString();
  for (let i = 0; i < links.length; i++) {
    var isMaliciousLink = email.isMaliciousLink(linkElements[i].href);
    view.showMaliciousLink(linkElements[i], isMaliciousLink);
  }
}
  
function checkAttachments(): void {
  var attachmentElements = email.getAttachment();
  var attachments = email.getAttachmentString();
  for (let i = 0; i < attachments.length; i++) {
    var isSuspiciousFile = email.isSuspiciousFile(attachments[i]);
    view.showSuspiciousFile(attachmentElements[i], isSuspiciousFile);
  }
}

function checkSpamWord(): void {
  var spamWords = email.findSpamWords(email.getBody());
  if (spamWords.length > 0) {
    var offset = 0;
    for (let n = 0; n < spamWords.length; n++) {
      var indicatorInnerHTML = view.showSpamWord(spamWords[n][1]);
      // Insert indicator
      email.getBody().innerHTML = email.getBody().innerHTML.substr(0, spamWords[n][0] + offset) + indicatorInnerHTML + email.getBody().innerHTML.substr(spamWords[n][0] + offset);
      // After each indicator is inserted, adds number of characters of inserted indicator to the position of remaining indicators
      offset += indicatorInnerHTML.length;
    }
  }

  // Find all images in email
  var imageSource: Array<string> = new Array<string>();
  for (let image of email.getBody().getElementsByTagName('img') as any) {
    // Select only large enough images
    if (image.width > 100 && image.height > 40) {
      imageSource.push(image.src);
    }
  }
  // Recognize and tests text in images
  email.imageToString(imageSource).then((value: object) => {
    // For text in each image
    for (let imageIdx in Object.values(value)) {
      // Create an HTML element with the text in image as innerHTML
      var span: HTMLElement = document.createElement('span');
      span.innerHTML = Object.values(value)[imageIdx].data.text;
      // Pass the created HTML element to findSpamWords function 
      var spamWords = email.findSpamWords(span);
      // For each spam word found within the HTML element
      for (let spamWordIdx in spamWords) {
        // Insert indicator before the associaited image
        var span: HTMLElement = document.createElement('span');
        span.innerHTML = view.showSpamWord(spamWords[spamWordIdx][1]);
        email.getBody().querySelectorAll('img')[imageIdx].before(span);
      }
    }
  });
}
