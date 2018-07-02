import test from 'ava'
import React from 'react'
import { shallow, mount } from 'enzyme';

import Foo from '../src/Root'

test('shallow', t => {
  const wrapper = shallow(<Foo />)
  t.is(wrapper.contains(<div>root</div>), true)
})

