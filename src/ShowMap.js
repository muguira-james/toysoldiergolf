/*
compared to the actual application we wrote for React-Native this is not as pretty!

The original app used the on device Map to render a satellite view of a golf course

This uses the completely free OpenStreet Map to render the golf course

The original app used high resolution images for the players that are propritery to 
the sponsor.  
This uses silly images of toy soldiers. 
They look bad but you get the idea of where the players are rendered on the map.

The flags are from the original app, I should be ok using these.

*/


import React from 'react'
import gql from 'graphql-tag';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'

import { observer } from "mobx-react"
import flagImages from './flagImages'
import playerIcons from './playerIcons'

// the following is the global definition of the state store
import store from './Store'

var playerDrawingUtils = require("./PlayerDrawingUtils.js");

//
// the real-time subscription for player updates
const UPDATE_PLAYER = gql`
subscription {
  updatePlayer{
    FirstName
    LastName
    Hole
    HoleLocation
    ID
    Country
  }
}
`;

/*
  Draw a Leaflet map with the supplied Course file

*/
class ShowMap extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      /* need state.players so we can drive React to render on position changes */
      players: store.players
    }
  }

  componentWillMount() {
    //
    // subscribeToMore is graphql magic to receive subscription updates
    // it takes 2 args: a document type and a query
    this.props.subscribeToMore({
      document: UPDATE_PLAYER,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        // console.log("show->", subscriptionData.data)

        store.updateAPlayer(subscriptionData.data.updatePlayer)
        this.setState({ players: store.getPlayers() })
      },
    });

  }
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
      iconSize: [25, 25]
    })
    return zIcon
  }

  // return a Leaflet Marker
  createFlag = (number, location) => {
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
      iconSize: [25, 25]
    })
    return zIcon
  }

  // return a complete Leaflet player Marker
  createPlayer = (n, name, hole, loc, course) => {
    let plyr = {}
    plyr.HoleLocation = loc
    // notice that hole runs from 1-18
    let latLng = playerDrawingUtils.mapLocationOnHole((hole - 1), plyr, course)
    let pos = []
    pos.push(latLng.latitude)
    pos.push(latLng.longitude)

    //
    // draw a marker and provide a pop-up for the player name if clicked
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

    // the "global" golf course definition
    let course = this.props.golfCourse

    // a local definition of the state of the players
    let aStore = this.state.players

    // convert the prop initialRegion into a Leaflet position
    let pos = this.createMarkerLocation(course.initialRegion);

    // reset the playerDrawing map
    playerDrawingUtils.mapLocationClear()
    let mapLink = 
      '<a href="http://www.esri.com/">Esri</a>';
    let wholink = 
      'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    //
    // note the TileLayer stuff is ESRI.  We can do a lot more
    // in terms of how the map looks!
    return (
      <Map
        center={pos}
        zoom={16}>
        <TileLayer
          url='http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          attribution="&copy; '<a href=&quot;http://www.esri.com/&quot;>Esri</a>; contributors"
          />
        
        {
          /* draw the flags on the holes */
          course.Features.map((f, n) => {
            return this.createFlag(f.properties.number, f.properties.FlagLocation)
          })
        }
        {
          /* draw the players at their current locations */
          aStore.map((p, n) => {
            let name = p.FirstName + " " + p.LastName
            let plyr = this.createPlayer(n + 1, name, p.Hole, p.HoleLocation, course)
            return plyr
          })
        }
      </Map>
    )
  }
}

// make sure ShowMap is an observer of the Store object
export default observer(ShowMap);

/*
this is the default tile set.
//   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        //   attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        // />
      */