import express from 'express';
let fs = require('fs')
import { createServer } from 'http';
import { PubSub } from 'apollo-server';
import { ApolloServer, gql } from 'apollo-server-express';
// import { makeExecutableSchema } from 'graphql-tools';

// let fs = require('fs')
// var fetch = require('node-fetch')
// // var parser = require('xml2json')

// 
// This gathers up the date time stamp for fananalytics
var currentdate = new Date();
var today = currentdate.getDate() + "-"
    + (currentdate.getMonth() + 1) + "-"
    + currentdate.getFullYear() + "_@_"
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

//
// fanAnalytics file name
var fanAnalyticsLog = 'fanAnalytics_' + today + '.txt'
// -------------------- sig term stuff ----------------------------
//
// open the fan analytics logger
var fanLogger = fs.createWriteStream(fanAnalyticsLog, { 'flags': 'a' })


//
// the next section handle ctl-C, and various process kill commands gracefully.
// I want to control how the system stops so the log is written correctly.
//
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    fanLogger.end()
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);

    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
// -------------------- sig term stuff ----------------------------


let messageList = [
  { id: 0, content: 'Hello!' },
  { id: 1, content: 'Bye!' },
]
let nextId = messageList.length

//
// as you can see from this structure the players are on hole {1, 2, 3, 4}
let thePlayers = [
  { FirstName: "Joan", LastName: "Jet", ID: 1, Hole: 1, HoleLocation: "TEE", Country: "ISR"},
  { FirstName: "Ruth", LastName: "Crist", ID: 2, Hole: 1, HoleLocation: "TEE", Country: "ENG" },
  { FirstName: "Beth", LastName: "Flick", ID: 3, Hole: 1, HoleLocation: "TEE", Country: "ISR" },
  { FirstName: "Julie", LastName: "Ant", ID: 4, Hole: 1, HoleLocation: "FWY", Country: "ENG" },
  { FirstName: "Ginny", LastName: "Grey", ID: 5, Hole: 1, HoleLocation: "FWY", Country: "ISR" },
  { FirstName: "Paula", LastName: "Lamb", ID: 6, Hole: 1, HoleLocation: "GRN", Country: "USA" },
  { FirstName: "Ingid", LastName: "Jones", ID: 7, Hole: 2, HoleLocation: "TEE", Country: "ISR" },
  { FirstName: "Kelly", LastName: "Smith", ID: 8, Hole: 2, HoleLocation: "FWY", Country: "USA" },
  { FirstName: "Eilean", LastName: "Rams", ID: 9, Hole: 2, HoleLocation: "GRN", Country: "ISR" },
  { FirstName: "Barb", LastName: "Sharp", ID: 10, Hole: 4, HoleLocation: "FWY", Country: "ISR" },
  { FirstName: "Carol", LastName: "Adams", ID: 11, Hole: 4, HoleLocation: "FWY", Country: "THA" },
  { FirstName: "Faith", LastName: "Hope", ID: 12, Hole: 4, HoleLocation: "GRN", Country: "CAN" }
]
let numberOfPlayers = thePlayers.length

const app = express();

const pubsub = new PubSub();
const MESSAGE_CREATED = 'MESSAGE_FOO';
const PLAYER_CREATED = 'PLAYER_CREATED';
const NEW_PLAYER_TOPIC = 'NEW_PLAYER_TOPIC';
const UPDATE_PLAYER_TOPIC = 'UPDATE_PLAYER_TOPIC';

const typeDefs = gql`
# the following are queries
#
# query {
#  getMessages
# }
#
# mutation {
#  addNewMessage(message: "Hello James")
# }
#
# subscription {
#  newMessage
# }
#
type Query {
    messages: [Message]!
    # players: [Player2!]!
    # player(id: ID!): Player
    playersTest: [Player2!]!    # read a test feed from a file or from ECS
}

type Mutation {
    addMessage(message: String!): Message!
    # addPlayer(firstName: String!, lastName: String!, hole: Int!, holeLocation: String!, country: String!): Player2
    createPlayer(firstName: String!, lastName: String!, hole: Int!, holeLocation: String!, country: String!): Player2!
    updatePlayerPositionOnCourse(id: Int!, hole: Int!, holeLocation: String!): Player2!
}

type Subscription {
  messageCreated: Message
  addPlayer: Player2
  updatePlayer: Player2
}

type Message {
  id: String
  content: String
}

type Player2 {
    FirstName: String!
    LastName: String!
    ID: ID!
    Hole: Int
    HoleLocation: String!
    RoundToPar: String
    CumulativeToPar: String
    Rank: String
    Country: String!
}

`;



const resolvers = {
  Query: {
    messages: () => messageList,
    playersTest: () => {
      // // let fileName = 'shortFeed.json'
      // // let fileName = 'feed144.json'
      // let fileName = 'aList.json'

      // var raw = fs.readFileSync(fileName, 'utf8');
      // let someText = raw.replace(/(\r\n\t|\n|\r\t)/gm, "");
      // var zzz = JSON.parse(someText)
      // // console.log(zzz.GolfDataFeed.Tournament.Locatorboard.Player)
      // return zzz.GolfDataFeed.Tournament.Locatorboard.Player
      return thePlayers
    }
  },
  Mutation: {
    addMessage: (root, args) => {
      nextId = nextId + 1
      let m = {
        id: nextId,
        content: args.message
      }
      console.log("a->", m)
      pubsub.publish(MESSAGE_CREATED, { messageCreated: m })
      messageList.push(m)
      return m
    },
    createPlayer: (root, args) => {
      console.log("args->", args)
      const player = {
        ID: (numberOfPlayers + 1),
        FirstName: args.firstName,
        LastName: args.lastName,
        Hole: args.hole,
        HoleLocation: args.holeLocation,
        RoundToPar: 1,
        CumulativeToPar: "3",
        Rank: "2",
        Country: "USA"
      }
      thePlayers.push(player)
      pubsub.publish(NEW_PLAYER_TOPIC, { [createPlayer]: player })
      return player
    },
    updatePlayerPositionOnCourse: (root, args) => {
      console.log("search players->", args)
      let plr = thePlayers.find(el => {
        return el.ID === args.id
      })
      console.log("plr->", plr, args.id)
      if (plr !== null) {
        plr.Hole = args.hole
        plr.HoleLocation = args.holeLocation
        console.log("changed player ->", plr)
        pubsub.publish(UPDATE_PLAYER_TOPIC, { updatePlayer: plr })
        return plr
      }
      return args
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(MESSAGE_CREATED),
    },
    addPlayer: {
      subscribe: () => pubsub.asyncIterator(PLAYER_CREATED),
    },
    updatePlayer: {
      subscribe: () => pubsub.asyncIterator(UPDATE_PLAYER_TOPIC),
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});


/*
These are sample query, mutation or subscriptions for each schema item

 query {
   getMessages {
     id
     content
   } 
 }

 query {
   playersTest {
     FirstName
     LastName
     Hole
     HoleLocation
     Country
     ID
   }
 }

 mutation {
   createPlayer(firstName: "julia", lastName: "spadoni", hole: 6, holeLocation: "TEE", country: "USA"){
     FirstName
   }
 }
 mutation {
   updatePlayerPositionOnCourse(id: 1, hole: 1, holeLocation: "FWY"){
     ID
     Hole
   }
 }
 mutation {
   addNewMessage(message: "zippy the pin head"){
     id
     content
   }
 }

 subscription {
   newMessage {
     id
     content
   }
 }

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

*/