const express = require("express");
const http = require("http");
const app = express();
const socket = require("socket.io");
const broker = require("./kafka");
const CONSTANTS = require("./constants");

const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Socket setup
 */
const io = socket(server);
const eventsNameSpace = io.of("/events");

broker.eventSubscribe((event, offset) => {
  let room = `${event.aggregateName} ${event.aggregateID}`;
  let key = `${event.aggregateName}:${event.aggregateID}`;

  // Save event to socket store
  console.log("[SOCKET HANDLER] Saving event", room, "to socket store");
  redis.zadd(`PMS:${key}`, offset, JSON.stringify(event));

  if (
    event.eventName === CONSTANTS.EVENTS.REPORT_CREATED ||
    event.eventName == CONSTANTS.EVENTS.AD_CREATED
  ) {
    // users viewing map must receive new reports and ads
    room = "map viewers";
  } else if (event.eventName === CONSTANTS.EVENTS.USER_APPLICATION_CREATED) {
    // users that are admins must receive new applications
    room = "admins";
  }
  event.payload.offset = offset;

  console.log("[SOCKET HANDLER] Sending to client at room", room);
  // emit to client
  eventsNameSpace.to(room).emit("event_received", event);
  return Promise.resolve();
});

eventsNameSpace.on("connection", socket => {
  console.log("[SOCKET HANDLER] Client connected");

  // upon reconnect
  socket.on("initialize", data => {
    console.log("[SOCKET HANDLER] Client reconnecting");
    // join private room
    socket.join(`${CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME} ${data.id}`);

    // join admins room if admin role
    if (data.role == 2) socket.join("admins");
  });

  socket.on("subscribe", data => {
    let room = `${data.aggregateName} ${data.id}`;
    let key = `${data.aggregateName}:${data.id}`;
    console.log("[SOCKET HANDLER] Client joined", room);
    socket.join(room);

    // if client is admin, join admins room
    if (data.aggregateName === CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME) {
      // admin
      if (data.role === 2) {
        console.log("[SOCKET HANDLER] Joined admins");
        socket.join("admins");
      }
    }

    // Retrieve events after offset from socket store
    console.log("[SOCKET HANDLER] Current offset received:", data.offset);

    if (data.offset !== null) {
      let offset = parseInt(data.offset) + 1;
      // Set offset to 0 for testing
      // let offset = 0;

      redis.zrangebyscore(`PMS:${key}`, offset, "+inf").then(events => {
        // Send back each event to client using emit
        events.forEach(event => {
          let nextEvent = JSON.parse(event);
          console.log("[SOCKET HANDLER] Sending event at offset", offset);
          console.log("[SOCKET HANDLER]", nextEvent);
          socket.emit("event_received", nextEvent);
          offset++;
        });
      });
    }
  });

  socket.on("unsubscribe", data => {
    let room = `${data.aggregateName} ${data.id}`;
    console.log("[SOCKET HANDLER] Client left", room);
    socket.leave(room);
  });
});

const data = {
  app: app,
  server: server,
  io: io
};

module.exports = data;
