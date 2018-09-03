
import { observable, decorate, action } from "mobx"

//
// The Store class create an ES5 based Mobx Observable object + actions
class Store {

  getPlayers() {            // return all current players
    return this.players
  }

  addPlayer(p) {            // put a player into the store
    this.players.push(p)
  }

  updateAPlayer(inPlyr) {   // find and change a player position 
    console.log("hhh->", inPlyr)
    
    let plyrIndex = this.players.findIndex(p => {
      return p.ID === inPlyr.ID
    })
    if (plyrIndex !== undefined) {
      this.players[plyrIndex] = inPlyr
    }
    //
    // if we can't find that player ID just return without a word
  }

  players = []              // this is the observed array of players
}

//
// ES15 syntax
decorate(Store, {
  players: observable,
  addPlayer: action,
  updateAPlayer: action,
  getPlayers: action,
})

const store = new Store()

export default store;
export { Store };