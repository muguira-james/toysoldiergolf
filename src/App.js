/*
This project was started with create-react-app

This is the base project.  Only enough to show the basic idea.

ShowMap is a component that displays a leaflet based map.  The project is 
designed to show how to combine React and a map that does not have license issues.

The course file is a simple json object that describes where the attributes of the course
are located (holes).

There is another branch: checkout addMobx to see a nicer map, graphql and mobx working together
*/

import React from 'react';

import ShowMap from './ShowMap'

//
// this version will bring Amazon's Serverless Application Model (SAM) in
//
// We are going to use graphql to bring the player feed data to the app.
//
// In this case the graphql server will be implemented using SAM. Our SAM 
// example will only query for player info.  The Branch AddMobx will demo subscriptions
//
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

const httpLink = new HttpLink({ uri: 'https://0mrexerq6i.execute-api.us-east-1.amazonaws.com/dev/handler' })
//
// setup the Apollo comm parms
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})


var golfCourse = require('./indy.json')

//
// notice that we use ApolloProvider to wrap the ShowMap component
export default class SimpleExample extends React.Component {


  render() {
    return (
      <ApolloProvider client={client} >
        <ShowMap golfCourse={golfCourse} />
      </ApolloProvider>
      
    );
  }
}
