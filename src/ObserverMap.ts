import { Subject } from 'rxjs/Subject';

import { isFunction } from './utils';

type ObserverEntry = { [key: string]: Subject<any>[] };

export class ObserverMap {
  private observers = new WeakMap<any, ObserverEntry>();

  create(instance: any, name: string): Subject<any> {
    const observer = new Subject();
    let entries = this.observers.get(instance);

    if (!entries) {
      entries = {};
    }

    if (!entries[name]) {
      entries[name] = [];
    }

    entries[name].push(observer);

    this.observers.set(instance, entries);
    
    return observer;
  }

  get(instance: any, name: string): Subject<any>[] {
    const entries = this.observers.get(instance);

    if (entries && entries[name]) {
      return entries[name];
    }

    return [];
  }
}