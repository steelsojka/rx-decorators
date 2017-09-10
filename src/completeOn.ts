import { isFunction, isCompleteable, getDescriptor } from './utils';

const hookMap = new WeakMap<any, { [key: string]: string[] }>();

/**
 * Completes an observable when the provided method is invoked or when the provided Observable emits a value.
 * @export
 * @param {string} method  The name of the hook to complete the subject on.
 * @returns {PropertyDecorator} 
 * @example
 * class MyClass {
 *   @CompleteOn('$onDestroy') clicks = new Subject();
 * }
 */
export function CompleteOn(method: string): PropertyDecorator {
  return (target: any, name: string) => {
    const descriptor = getDescriptor(target, method, {
      writable: true,
      configurable: true,
      enumerable: false
    }) as PropertyDescriptor;
    const { value } = descriptor;

    if (!hookMap.has(target)) {
      hookMap.set(target, {});

      Object.defineProperty(target, method, {
        configurable: true,
        writable: true,
        enumerable: false,
        ...descriptor,
        value(this: any, ...args: any[]): any {
          const returnVal = isFunction(value) ? value.apply(this, args) : undefined;
          const hooks = hookMap.get(target);

          if (hooks && hooks[method]) {
            for (const subjectName of hooks[method]) {
              if (isCompleteable(this[subjectName])) {
                this[subjectName].complete();
              }
            }
          }

          return returnVal;
        }
      });
    }

    const hooks = hookMap.get(target) as { [key: string]: string[] };

    if (!Array.isArray(hooks[method])) {
      hooks[method] = [];
    }

    if (hooks[method].indexOf(name) === -1) {
      hooks[method].push(name);
    }
  }
}