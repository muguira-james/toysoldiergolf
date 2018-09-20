/*
This project was started with create-react-app

This is the base project.  Only enough to show the basic idea.

ShowMap is a component that displays a leaflet based map.  the project is 
designed to show how to combine React and a map that does not have license issues.

The course file is a simple json object that describes where the attributes of the course
are located (holes).

There is another branch: checkout addMobx to see a nicer map, graphql and mobx working together
*/

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
