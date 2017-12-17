import { Subject } from 'rxjs/Subject';

import { ObserverMap } from './ObserverMap';
import { CompleteOn } from './completeOn';
import { getDescriptor, isFunction } from './utils';

const observerMap = new ObserverMap();
const metadata = new Map<any, { [key: string]: PropertyObserverOptions }>();

export interface PropertyObserverOptions {
  prop: string;
  completeOn?: string;
  value?: any;
}

function getObserver(context: any, target: any, key: string): Subject<any> {
  const meta = metadata.get(target) || {};

  const [ observer ] = observerMap.get(context, key);

  if (observer) {
    return observer;
  } else if (meta[key]) {
    return observerMap.create(context, key, { cache: true, initValue: meta[key].value });
  }

  throw new Error(`No observer found for key ${key}`);
}

/**
 * Marks a property as an observed property. This is used in conjunction with `PropertyObserver`.
 * The property is replaced with a setter that emits on a `BehaviorSubject`.
 * @export
 * @param {string} [name]
 * @returns {PropertyDecorator}
 */
export function ObservedProperty(name?: string): PropertyDecorator {
  return (target: any, key: string | symbol) => {
    const observers = new WeakMap();
    const values = new WeakMap();

    function getAndSubscribe(context: any): Subject<any> {
      let observer = observers.get(context);

      if (!observer) {
        observer = getObserver(context, target, name || key as string);
        observers.set(context, observer);
        observer
          .asObservable()
          .subscribe((val: any) => values.set(context, val));
      }

      return observer;
    }

    return {
      configurable: true,
      set(val: any) {
        getAndSubscribe(this).next(val);
      },
      get(): any {
        getAndSubscribe(this);

        return values.get(this);
      }
    }
  }
}

export function PropertyObserver(options: PropertyObserverOptions): PropertyDecorator {
  const { completeOn, value:initValue, prop } = options;

  return (target: any, key: string | symbol, descriptor?: PropertyDescriptor) => {
    const meta = metadata.get(target) || {};

    meta[prop] = options;
    metadata.set(target, meta);

    if (completeOn) {
      const descriptor = getDescriptor(target, completeOn, {
        writable: true,
        configurable: true,
        enumerable: false
      }) as PropertyDescriptor;
      const { value:completeHook } = descriptor;

      Object.defineProperty(target, completeOn, {
        configurable: true,
        writable: true,
        enumerable: false,
        ...descriptor,
        value(this: any, ...args: any[]): any {
          const returnVal = isFunction(completeHook) ? completeHook.apply(this, args) : undefined;
          const [ observer ] = observerMap.get(this, prop);

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
          Object.defineProperty(this, key, {
            configurable: true,
            writable: true,
            enumerable: true,
            value: val
          });
        },
        get() {
          const observable = getObserver(this, target, prop)
            .asObservable();

          Object.defineProperty(this, key, {
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
        return getObserver(this, target, prop)
          .asObservable();
      }
    }
  };
}