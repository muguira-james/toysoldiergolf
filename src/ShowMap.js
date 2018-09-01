/*
compared to the actual application we wrote for React-Native this is ugly!

The original app used the on device Map to render a satellite view of a golf course

This uses the completely free OpenStreet Map to render the golf course

The original app used high resolution images that are propritery to the sponsor.  This
uses silly images of toy soldiers. They look bad but you get the ide of where the players
are rendered on the map.

The flags are from the original app, I should be ok using these.

*/
import React from 'react'

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'

import {observer} from "mobx-react"

import flagImages from './flagImages'
import playerIcons from './playerIcons'


var playerDrawingUtils = require("./PlayerDrawingUtils.js");


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
    let course = this.props.golfCourse
    // convert the prop initialRegion into a Leaflet position
    let pos = this.createMarkerLocation(course.initialRegion);

    // reset the playerDrawing map
    playerDrawingUtils.mapLocationClear()
    console.log("p->", this.props.playerList)
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
            return this.createFlag(f.properties.number, f.properties.FlagLocation)
          })
        }
        {
          this.props.playerList.players.map((p, n) => {
            let name = p.FirstName + " " + p.LastName
            let plyr = this.createPlayer(n + 1, name, p.Hole, p.HoleLocation, course)
            return plyr
          })
        }
      </Map>
    )
  }
}

ShowMap = observer(ShowMap)

export default ShowMap;

