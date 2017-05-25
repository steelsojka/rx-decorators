import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { spy } from 'sinon';

import { CompleteOn } from './completeOn';

describe('CompleteOn', () => {
  it('should complete the subject when the method is invoked', () => {
    const _spy = spy();

    class MyClass {
      @CompleteOn('destroy') 
      destroyed = new Subject();
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
      destroyed = new Subject();

      destroy() {
        return 'test';
      }
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ complete: _spy });

    expect(myClass.destroy).to.be.a('function');
    expect(myClass.destroy()).to.equal('test');
    expect(_spy.called).to.be.true;
  });  

  it('should invoke the inherited method', () => {
    const _spy = spy();
    const invoked = spy();

    class Test {
      destroy() {
        invoked();  
      }
    }

    class MyClass extends Test {
      @CompleteOn('destroy') 
      destroyed = new Subject();
    }  

    const myClass = new MyClass();

    myClass.destroyed.subscribe({ complete: _spy });
    myClass.destroy();

    expect(_spy.called).to.be.true;
    expect(invoked.called).to.be.true;
  });  
});