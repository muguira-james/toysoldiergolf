/*
compared to the actual application I wrote for React-Native this is ugly!

The original app used the on device Map to render a satellite view of a golf course

This uses the completely free OpenStreet Map to render the golf course

The original app used high resolution images that are propritery to the sponsor.  

The players in this app are silly images of toy soldiers. They look bad but you get 
the idea of where the players are rendered on the map.

The flags are from the original app.

The players are hard coded here. The branch addMobx uses graphql to bring in the players

*/
import React from 'react'

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'

import flagImages from './flagImages'
import playerIcons from './playerIcons'
 
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

var playerDrawingUtils = require("./PlayerDrawingUtils.js");

//
// as you can see from this structure the players are on hole {1, 2, 3, 4}
// const plyr = [
//   {FirstName: "Joan", LastName: "Jet", ID: 1, Hole: 1, HoleLocation: "TEE"},
//   {FirstName: "Ruth", LastName: "Crist", ID: 2, Hole: 1, HoleLocation: "TEE"},
//   {FirstName: "Beth", LastName: "Flick", ID: 3, Hole: 1, HoleLocation: "TEE"},
//   {FirstName: "Julie", LastName: "Ant", ID: 4, Hole: 1, HoleLocation: "FWY"},
//   {FirstName: "Ginny", LastName: "Grey", ID: 5, Hole: 1, HoleLocation: "FWY"},
//   {FirstName: "Paula", LastName: "Lamb", ID: 6, Hole: 1, HoleLocation: "GRN"},
//   {FirstName: "Ingid", LastName: "Jones", ID: 7, Hole: 2, HoleLocation: "TEE"},
//   {FirstName: "Kelly", LastName: "Smith", ID: 8, Hole: 2, HoleLocation: "FWY"},
//   {FirstName: "Eilean", LastName: "Rams", ID: 9, Hole: 2, HoleLocation: "GRN"},
//   {FirstName: "Barb", LastName: "Sharp", ID: 10, Hole: 4, HoleLocation: "FWY"},
//   {FirstName: "Carol", LastName: "Adams", ID: 11, Hole: 4, HoleLocation: "FWY"},
//   {FirstName: "Faith", LastName: "Hope", ID: 12, Hole: 4, HoleLocation: "GRN"}
// ]

/*
  Draw a Leaflet map with the supplied Course file

*/
class ShowMap extends React.Component {

  // create a location object out of a { Latitude, Longitude }
  createMarkerLocation = (f) => {
    let floc = []
    floc.push(f.latitude)
    floc.push(f.longitude)
    return floc
  }

  // Create an Icon object out of a Leaflet icon
  createMarkerIcon = (number) => {
    let zIcon = L.icon({
      iconUrl: flagImages[number],
      iconSize: [25,25]
    })
    return zIcon
  }

  // return a Leaflet Marker
  createMarker = (number, location) => {
    return (
      <Marker 
        key={number}
        icon={this.createMarkerIcon(number)}
        position={this.createMarkerLocation(location)}
      />
    )
  }

  // return a Leaflet icon, using the image from the players array
  createPlayerIcon = (number) => {
    let zIcon = L.icon({
      iconUrl: playerIcons[number],
      iconSize: [25,25]
    })
    return zIcon
  }

  // return a complete Leaflet player Marker
  createPlayer = (n, name, hole, loc, course) => {
    let plyr = {}
    plyr.HoleLocation = loc
    let latLng = playerDrawingUtils.mapLocationOnHole((hole-1), plyr, course)
    let pos = []
    pos.push(latLng.latitude)
    pos.push(latLng.longitude)

    return (
      <Marker
        position={pos}
        key={n}
        icon={this.createPlayerIcon(n)}
      >
        <Popup>{name}</Popup>
      </Marker>
    )
  }

  // render the current state of the app
  render = () => {
    console.log("p->", this.props.zData)
    let course = this.props.golfCourse
    // convert the prop initialRegion into a Leaflet position
    let pos = this.createMarkerLocation(course.initialRegion);

    // reset the playerDrawing map
    playerDrawingUtils.mapLocationClear()

    if (this.props.zData && this.props.zData.loading) {
      return <div style={{marginTop:60}}>Loading</div>
    }
  
    // 2 error
    if (this.props.zData && this.props.zData.error) {
      console.log("error-->", this.props.zData.error)
      return <div style={{marginTop: 30}}>Error</div>
    
    } 
    return (
      <Map
        center={pos}
        zoom={16}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
          {
            course.Features.map((f, n) => {
              return this.createMarker(f.properties.number, f.properties.FlagLocation)
            })
          }
          {
            this.props.zData.players.map((p, n) => {
              let name = p.FirstName + " " + p.LastName
              let plyr = this.createPlayer(n+1, name, p.Hole, p.HoleLocation, course)
              return plyr
            })
          }
      </Map>
    )
  }
}

//
// This is the graphql magic
// 
// This sets up the query for data.  It uses ggl - NOTE the back quotes
const JAM_QUERY = gql`
  # 2
  query {
      players {
          FirstName
          LastName
          Hole
          HoleLocation
          Country
      }
  }
`

// 3
// wrap the ShowMap component and make it a HOC.  The 'JAM_Query' can be anything you
// want, just be consistent with how you named the query. The 'zData' item is how
// the data will show up in the ShowMap component
export default graphql(JAM_QUERY, { name: 'zData', options: {pollInterval: 60000} }) (ShowMap)

// export default ShowMap;

    