import { expect } from 'chai';
import { Observable } from 'rxjs/Observable';
import { spy } from 'sinon';

import { ObserveHook } from './observeHook';

describe('ObserveHook', () => {
  it('should create the hook fn', () => {
    class MyClass {
      destroy: Function;

      @ObserveHook('destroy') destroyed: Observable<any>;
    }  

    const myClass = new MyClass();

    expect(myClass.destroy).to.be.a('function');
  });

  it('should create an observable', () => {
    class MyClass {
      destroy: Function;

      @ObserveHook('destroy') destroyed: Observable<any>;
    }  

    const myClass = new MyClass();

    expect(myClass.destroyed).to.be.an.instanceOf(Observable);
  });

  it('should emit when the hook is invoked', () => {
    const _spy = spy();

    class MyClass {
      destroy: Function;

      @ObserveHook('destroy') destroyed: Observable<any>;
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe(_spy);
    myClass.destroy();

    expect(_spy.called).to.be.true;
  });
});