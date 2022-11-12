'use strict';

import { AbstractView } from "./AbstractView";

export class EmailView extends AbstractView {

  constructor() {
    super();
  }

  public showIsTrustedSender(): boolean {
    throw new Error('Not Implemented');
  }
  
  public showDeliveredLateNight(): boolean {
    throw new Error('Not Implemented');
  }

  public showIsMaliciousLink(): boolean {
    throw new Error('Not Implemented');
  }

  public showIsSuspiciousFile(): boolean {
    throw new Error('Not Implemented');
  }

  public showFindTriggerWord(): boolean {
    throw new Error('Not Implemented');
  }
}
