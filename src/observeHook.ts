import { Subject } from 'rxjs/Subject';

import { isFunction } from './utils';

type ObserverEntry = { [key: string]: Subject<any> };

const observers = new WeakMap<any, ObserverEntry>();

function createObserver(instance: any, name: string): Subject<any> {
  const observer = new Subject();
  let entries = observers.get(instance);

  if (!entries) {
    entries = {};
  }

  entries[name] = observer;

  observers.set(instance, entries);
  
  return observer;
};

function getObserver(instance: any, name: string): Subject<any> | null {
  const entries = observers.get(instance);

  if (entries && entries[name]) {
    return entries[name];
  }

  return null;
}

export function ObserveHook(hook: string, options: { completeOn?: string } = {}): PropertyDecorator {
  return (target: any, name: string, descriptor?: PropertyDescriptor) => {
    const { completeOn } = options;

    const hookDesc = Object.getOwnPropertyDescriptor(target, name) || {};
    const { value:hookFn } = hookDesc;

    Object.defineProperty(target, hook, {
      ...hookDesc,
      value(...args: any[]): any {
        const returnVal = isFunction(hookFn) ? hookFn.apply(this, args) : undefined;
        const observer = getObserver(this, name);

        if (observer) {
          observer.next(args[0]);

          if (!completeOn || completeOn === hook) {
            observer.complete();
          }
        }

        return returnVal;
      }
    });

    if (completeOn && completeOn !== hook) {
      const completeDesc = Object.getOwnPropertyDescriptor(target, completeOn) || {};
      const { value } = completeDesc;

      Object.defineProperty(target, completeOn, {
        ...descriptor,
        value(...args: any[]): any {
          const returnVal = isFunction(value) ? value.apply(this, args) : undefined;
          const observer = getObserver(this, name);

          if (observer) {
            observer.complete();
          }

          return returnVal;
        }
      });
    }

    if (!descriptor) {
      return {
        configurable: true,
        get() {
          const observable = createObserver(this, name).asObservable();

          Object.defineProperty(this, name, {
            configurable: true,
            writable: true,
            enumerable: true,
            value: observable
          });

          return observable;
        }
      };
    } 

    return {
      ...descriptor,
      initializer() {
        return createObserver(this, name).asObservable();
      }
    };
  };
}