import { isObserver } from './utils';

const methodMap = new WeakMap<any, string[]>();

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
  return (target: any, name: string, descriptor?: PropertyDescriptor) => {
    function push(instance: any, arg: any): void {
      for (const observerKey of methodMap.get(target) || []) {
        const _observer = instance[observerKey];

        if (isObserver<any>(_observer)) {
          _observer.next(arg);
        }
      }
    }


    const methods = methodMap.get(target) || [];

    methods.push(observer);
    methodMap.set(target, methods);

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