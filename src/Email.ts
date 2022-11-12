'use strict';

import { AbstractEmail } from "./AbstractEmail";

export class Email extends AbstractEmail {
  
  constructor() {
    super();
  }

  public getBody(): HTMLElement {
    throw new Error('Not Implemented');
  }

  public getSender(): HTMLElement {
    throw new Error('Not Implemented');
  }

  public getSenderString(): string {
    throw new Error('Not Implemented');
  }
  
  public getDeliveryTime(): HTMLElement {
    throw new Error('Not Implemented');
  }

  public getDeliveryTimeString(): string {
    throw new Error('Not Implemented');
  }

  public getLink(): Array<HTMLAnchorElement> {
    throw new Error('Not Implemented');
  }
  
  public getLinkString(): Array<string> {
    throw new Error('Not Implemented');
  }

  public getAttachment(): Array<HTMLElement> {
    throw new Error('Not Implemented');
  }

  public getAttachmentString(): Array<string> {
    throw new Error('Not Implemented');
  }
  
  public write(parent: Node, self: Node): void {
    throw new Error('Not Implemented');
  }
}
