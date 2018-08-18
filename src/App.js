import React from 'react';

import ShowMap from './ShowMap'

var golfCourse = require('./indy.json')

export default class SimpleExample extends React.Component {


  render() {
    return (
      <ShowMap golfCourse={golfCourse} />
    );
  }
}
