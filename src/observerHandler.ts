import { isObserver } from './utils';

const methodMap = new WeakMap<any, { [key: string]: string[] }>();

/**
 * Creates a method that emits on the given observable name. The first argument is emitted.
 * @export
 * @param {string} observer The name of the observer.
 * @returns {PropertyDecorator}
 * @example
 * class MyClass {
 *   @ObserverHandler('subject') emit: (value: string) => void;
 *
 *   subject = new Subject();
 * }
 *
 * const myClass = new MyClass();
 *
 * myClass.subject.subscribe(v => console.log(v)); // => 'test'
 * myClass.emit('test');
 */
export function ObserverHandler(observer: string): PropertyDecorator {
  return (target: any, name: string | symbol, descriptor?: PropertyDescriptor) => {
    function push(instance: any, arg: any): void {
      const keyMap = methodMap.get(target);

      if (keyMap && keyMap[name]) {
        for (const observerKey of keyMap[name]) {
          const _observer = instance[observerKey];

          if (isObserver<any>(_observer)) {
            _observer.next(arg);
          }
        }
      }
    }

    const keyMap = methodMap.get(target) || {};

    if (!keyMap[name]) {
      keyMap[name] = [];
    }

    keyMap[name].push(observer);
    methodMap.set(target, keyMap);

    if (descriptor) {
      if (!descriptor.get && !descriptor.set) {
        descriptor = { ...descriptor, writable: true };
      }

      return {
        ...descriptor,
        initializer() {
          return function(this: any, arg: any) {
            return push(this, arg);
          };
        }
      }
    }

    return {
      configurable: true,
      enumerable: false,
      set(value: any) {
        Object.defineProperty(this, name, {
          value,
          writable: true,
          enumerable: true,
          configurable: true
        });
      },
      get() {
        const value = function(this: any, arg: any) {
          return push(this, arg);
        };

        Object.defineProperty(this, name, {
          value,
          writable: true,
          enumerable: true,
          configurable: true
        });

        return value;
      }
    };
  };
}