/*
this project is a create-react-app project.

That is important - I only use ES5 syntax.  NO decorators (i.e. no '@Observer' syntax)

This is some Graphql magic that happens in index.js.
*/

import React from 'react';
import gql from 'graphql-tag';

import { Query } from 'react-apollo';

import ShowMap from './ShowMap'
//
// DevTools gives us some noce debug tools in the browser
import DevTools from 'mobx-react-devtools';

// 
// The global state store.
//
// This holds all the player info.  It is filled by an initial call to GraphQL
// It provides Mobx actions to getPlayers, addPlayers, updatePlayers
import store from './Store'

//
// this is the initial call to get players
// Notice positions on the map are computed later in the code
const GET_INITIAL_PLAYERS = gql`
query {
  playersTest {
    ID
    FirstName
    LastName
    Hole
    HoleLocation
    Country
  }
}
`;

//
// The course definition file
// var golfCourse = require('./indy.json')
var golfCourse = require('./ArmyNavy.json')

//
// This handles the GraphQL calls,
// filling the Store, and handing off to ShowMap
export default class App extends React.Component {

  render() {

    return (
      <Query query={GET_INITIAL_PLAYERS}>
        {({ data, loading, subscribeToMore }) => {
          if (!data) {
            return null;
          }

          if (loading) {
            return <span>Loading ...</span>;
          }

          /* fill the store with initial data */
          data.playersTest.map(p => {
            return store.addPlayer(p)
          })

          /* draw the map */
          return (
            <div>
              <ShowMap
                thePlayers={store}
                golfCourse={golfCourse}
                subscribeToMore={subscribeToMore}
              />
              <DevTools />
            </div>
          );
        }}
      </Query>
    );
  }
}
