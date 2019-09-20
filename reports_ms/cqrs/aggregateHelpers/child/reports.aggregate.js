const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const CONSTANTS = require("../../../constants");
const BaseAggregateHandler = require("../base/base.aggregate");

function ReportsAggregateHandler() {}

ReportsAggregateHandler.prototype = Object.create(
  BaseAggregateHandler.prototype
);

Object.defineProperty(ReportsAggregateHandler.prototype, "constructor", {
  value: ReportsAggregateHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

ReportsAggregateHandler.prototype.getAggregates = function() {
  return [CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME];
};

ReportsAggregateHandler.prototype.getCurrentState = function(id) {
  // get history of events of report id
  let report = {};
  let lastOffset = 0;
  return Promise.resolve(
    // check if snapshot exists
    redis
      .hgetall(
        `RMS:${CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME}:${id}:snapshot`
      )
      .then(snapshot => {
        // snapshot exists - start here
        if (snapshot.offset && snapshot.currentState) {
          report = JSON.parse(snapshot.currentState);
          lastOffset = snapshot.offset + 1;
        }
        return redis.zrange(
          `RMS:${CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME}:${id}:events`,
          lastOffset,
          -1
        );
      })
      .then(history => {
        // Recount history
        history.forEach(event => {
          event = JSON.parse(event);
          let payload = event.payload;

          switch (event.eventName) {
            case CONSTANTS.EVENTS.REPORT_CREATED:
              report.id = payload.id;
              report.userId = payload.userId;
              report.userName = payload.userName;
              report.type = payload.type;
              report.latitude = payload.latitude;
              report.longitude = payload.longitude;
              report.location = payload.location;
              break;
            case CONSTANTS.EVENTS.REPORT_VOTE_CREATED:
              if (!report.votes) report.votes = 0;
              report.votes++;
              if (!report.voters) report.voters = [];
              report.voters.push(payload.userId);
              break;
            case CONSTANTS.EVENTS.REPORT_VOTE_DELETED:
              report.votes--;
              let index = report.voters.indexOf(payload.userId);
              if (index != -1) report.voters.splice(index, 1);
          }
        });

        // report does not exist if it was not created
        if (!report.id) return null;

        // current state of report
        return report;
      })
  );
};

module.exports = ReportsAggregateHandler;
