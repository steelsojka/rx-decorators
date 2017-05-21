import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { spy } from 'sinon';

import { ObserverHandler } from './observerHandler';

describe('ObserverHandler', () => {
  it('should emit on the subject when the method is invoked', () => {
    const _spy = spy();

    class MyClass {
      @ObserverHandler('subject') click;

      subject = new Subject();
    }

    const myClass = new MyClass();

    myClass.subject.subscribe(_spy);
    myClass.click('test');

    expect(_spy.called).to.be.true;
    expect(_spy.getCall(0).args[0]).to.equal('test');
  });

  it('should work with multiple decorators', () => {
    const _spy = spy();
    const _spy2 = spy();

    class MyClass {
      @ObserverHandler('subject') 
      @ObserverHandler('subject2') 
      click;

      subject = new Subject();
      subject2 = new Subject();
    }

    const myClass = new MyClass();

    myClass.subject.subscribe(_spy);
    myClass.subject.subscribe(_spy2);
    myClass.click('test');

    expect(_spy.called).to.be.true;
    expect(_spy.getCall(0).args[0]).to.equal('test');
    expect(_spy2.called).to.be.true;
    expect(_spy2.getCall(0).args[0]).to.equal('test');
  });
});