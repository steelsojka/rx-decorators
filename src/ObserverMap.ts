import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { isFunction } from './utils';

type ObserverEntry = { [key: string]: Subject<any>[] };

export interface ObserverMapOptions {
  cache?: boolean;
  initValue?: any;
}

export class ObserverMap {
  private observers = new WeakMap<any, ObserverEntry>();

  create(instance: any, name: string, options: ObserverMapOptions = {}): Subject<any> {
    const { cache = false, initValue = undefined } = options;
    const observer = cache ? new BehaviorSubject(initValue) : new Subject();
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