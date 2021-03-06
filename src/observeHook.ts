import { Subject } from 'rxjs/Subject';

import { isFunction, getDescriptor } from './utils';
import { ObserverMap, ObserverMapOptions } from './ObserverMap';

type ObserverEntry = { [key: string]: Subject<any> };

export interface ObserverHookOptions extends ObserverMapOptions {
  completeOn?: string;
}

const observerMap = new ObserverMap();

export function ObserveHook(hook: string, options: ObserverHookOptions = {}): PropertyDecorator {
  return (target: any, name: string | symbol, descriptor?: PropertyDescriptor) => {
    const { completeOn } = options;

    const hookDesc = getDescriptor(target, hook, {
      writable: true,
      enumerable: false,
      configurable: true
    }) as PropertyDescriptor;

    const { value:hookFn } = hookDesc;

    Object.defineProperty(target, hook, {
      configurable: true,
      writable: true,
      enumerable: false,
      ...hookDesc,
      value(...args: any[]): any {
        const returnVal = isFunction(hookFn) ? hookFn.apply(this, args) : undefined;
        const [ observer ] = observerMap.get(this, name);

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
      const completeDesc = getDescriptor(target, completeOn, {
        writable: true,
        enumerable: false,
        configurable: true
      }) as PropertyDescriptor;

      const { value } = completeDesc;

      Object.defineProperty(target, completeOn, {
        ...completeDesc,
        value(...args: any[]): any {
          const returnVal = isFunction(value) ? value.apply(this, args) : undefined;
          const [ observer ] = observerMap.get(this, name);

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
        set(val: any) {
          // The user can overwrite the property if they want to.
          Object.defineProperty(this, name, {
            configurable: true,
            writable: true,
            enumerable: true,
            value: val
          });
        },
        get() {
          const observable = observerMap.create(this, name, options).asObservable();

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

    if (!descriptor.set && !descriptor.get) {
      descriptor = { ...descriptor, writable: true };
    }

    return {
      ...descriptor,
      initializer() {
        return observerMap.create(this, name, options).asObservable();
      }
    };
  };
}