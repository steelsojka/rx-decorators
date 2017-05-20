import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { spy } from 'sinon';

import { CompleteOn } from './completeOn';

describe('CompleteOn', () => {
  it('should complete the subject when the method is invoked', () => {
    const _spy = spy();

    class MyClass {
      destroy: Function;

      @CompleteOn('destroy') 
      destroyed = new Subject<void>();
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ complete: _spy });

    expect(myClass.destroy).to.be.a('function');

    myClass.destroy();

    expect(_spy.called).to.be.true;
  });  

  it('should wrap the hook method', () => {
    const _spy = spy();

    class MyClass {
      @CompleteOn('destroy') 
      destroyed = new Subject<void>();

      destroy(): any {
        return 'test';
      }
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ complete: _spy });

    expect(myClass.destroy).to.be.a('function');
    expect(myClass.destroy()).to.equal('test');
    expect(_spy.called).to.be.true;
  });  
});