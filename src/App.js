import React from 'react';

import {decorate, observable, action} from "mobx"


import ShowMap from './ShowMap'
//
// as you can see from this structure the players are on hole {1, 2, 3, 4}
const thePlayers = [
  { FirstName: "Joan", LastName: "Jet", ID: 1, Hole: 1, HoleLocation: "TEE" },
  { FirstName: "Ruth", LastName: "Crist", ID: 2, Hole: 1, HoleLocation: "TEE" },
  { FirstName: "Beth", LastName: "Flick", ID: 3, Hole: 1, HoleLocation: "TEE" },
  { FirstName: "Julie", LastName: "Ant", ID: 4, Hole: 1, HoleLocation: "FWY" },
  { FirstName: "Ginny", LastName: "Grey", ID: 5, Hole: 1, HoleLocation: "FWY" },
  { FirstName: "Paula", LastName: "Lamb", ID: 6, Hole: 1, HoleLocation: "GRN" },
  { FirstName: "Ingid", LastName: "Jones", ID: 7, Hole: 2, HoleLocation: "TEE" },
  { FirstName: "Kelly", LastName: "Smith", ID: 8, Hole: 2, HoleLocation: "FWY" },
  { FirstName: "Eilean", LastName: "Rams", ID: 9, Hole: 2, HoleLocation: "GRN" },
  { FirstName: "Barb", LastName: "Sharp", ID: 10, Hole: 4, HoleLocation: "FWY" },
  { FirstName: "Carol", LastName: "Adams", ID: 11, Hole: 4, HoleLocation: "FWY" },
  { FirstName: "Faith", LastName: "Hope", ID: 12, Hole: 4, HoleLocation: "GRN" }
]

var golfCourse = require('./indy.json')

class Store {

  addPlayer(p) {
    this.players.push(p)
  }

  updatePlayer(inPlyr) {
    let plyr = this.playerList.find(p => {
      return p.ID === inPlyr.ID
    })
    plyr.Hole = inPlyr.Hole
    plyr.HoleLocation = inPlyr.HoleLocation
  }
  players = []
}

decorate(Store, {
  players: observable,
  addPlayer: action,
  updatePlayer: action
})
const playerStore = new Store()



export default class SimpleExample extends React.Component {

  componentWillMount() {
    thePlayers.map( p => {
      return playerStore.addPlayer(p)
    })
    
  }
  render() {
    console.log("l->", playerStore)
    return (
      <ShowMap 
        playerList={playerStore}
        golfCourse={golfCourse} 
      />
    );
  }
}
