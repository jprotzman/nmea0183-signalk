/**
 * Copyright 2016 Signal K and contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Parser = require('../lib')
const chai = require('chai')
const should = chai.Should()

chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('RMB', () => {
  it('Converts OK using individual parser', () => {
    const delta = new Parser().parse(
      '$ECRMB,A,0.000,L,001,002,4653.550,N,07115.984,W,2.505,334.205,0.000,V*04'
    )
    should.equal(delta.updates[0].timestamp, undefined)
    
    delta.updates[0].values.should.contain.an.item.with.property(
      'path',
      'navigation.courseRhumbline.nextPoint'
    )
    delta.updates[0].values.should.contain.an.item.with.property(
      'path',
      'navigation.courseRhumbline.nextPoint.distance'
    )
    delta.updates[0].values.should.contain.an.item.with.property(
      'path',
      'navigation.courseRhumbline.nextPoint.bearingTrue'
    )
    delta.updates[0].values.should.contain.an.item.with.property(
      'path',
      'navigation.courseRhumbline.nextPoint.velocityMadeGood'
    )
    delta.updates[0].values.should.contain.an.item.with.property(
      'path',
      'navigation.courseRhumbline.crossTrackError'
    )
    delta.updates[0].values[0].value.latitude.should.be.closeTo(46.8925, 0.005)
    delta.updates[0].values[0].value.longitude.should.be.closeTo(
      -71.2664,
      0.005
    )
    delta.updates[0].values[1].value.should.be.closeTo(5.832, 0.005)
    delta.updates[0].values[2].value.should.be.closeTo(0, 0.005)
    delta.updates[0].values[3].value.should.be.closeTo(4639.26, 0.005)
    delta.updates[0].values[4].value.should.equal(0)
  })

  it('crossTrackError should be negative to steer right', () => {
    const delta = new Parser().parse(
      '$ECRMB,A,0.432,R,001,002,4653.550,N,07115.984,W,2.505,334.205,0.000,V*1F'
    )
    delta.updates[0].values[4].value.should.be.closeTo(-800.064, 0.005)
  })

  it('crossTrackError should be positive to steer left', () => {
    const delta = new Parser().parse(
      '$ECRMB,A,0.432,L,001,002,4653.550,N,07115.984,W,2.505,334.205,0.000,V*01'
    )
    delta.updates[0].values[4].value.should.be.closeTo(800.064, 0.005)
  })

  it("Doesn't choke on empty sentences", () => {
    const delta = new Parser().parse('$ECRMB,,,,,,,,,,,,,*77')
    should.equal(delta, null)
  })
})
