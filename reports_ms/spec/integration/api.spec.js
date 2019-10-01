const request = require("supertest");
const app = require("../../app");
const CONSTANTS = require("../../constants");
const broker = require("../../kafka");

const DEFAULT_TIMEOUT = 500;
/**
 *  Check report name updated
 */
describe("Update report user name", () => {
  beforeEach(done => {
    setTimeout(() => {
      // add report
      let data = {
        id: "someId",
        userId: "userId",
        userName: "jotaro",
        latitude: 63.33334,
        longitude: -66.83918,
        location: "Iceland",
        type: 2
      };
      let payload = {
        payload: data,
        commandName: CONSTANTS.COMMANDS.CREATE_REPORT
      };
      broker.publish(CONSTANTS.TOPICS.REPORT_COMMAND, payload, "someId");
      setTimeout(() => {
        done();
      }, DEFAULT_TIMEOUT);
    }, DEFAULT_TIMEOUT);
  });
  it("should display update report name", done => {
    let event = {
      eventId: "19282",
      eventName: CONSTANTS.EVENTS.USER_UPDATED,
      aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
      aggregateID: "userId",
      payload: {
        id: "userId",
        name: "joseph",
        email: "newemail@gmail.com"
      }
    };
    broker.publish(CONSTANTS.TOPICS.USER_EVENT, event, "userId", 1);
    setTimeout(() => {
      request(app)
        .get("/map/reports/someId")
        .set("Accept", "application/json")
        .expect(200)
        .then(res => {
          expect(res.body.report.userName).toEqual("joseph");
          done();
        });
    }, DEFAULT_TIMEOUT);
  });
});

describe("Update comment user name", () => {
  beforeEach(done => {
    setTimeout(() => {
      // add report
      let data = {
        id: "commentId",
        userId: "userId",
        userName: "joseph",
        reportId: "someId",
        timestamp: "2019-09-30T02:58:00",
        body: "howdy"
      };
      let payload = {
        payload: data,
        commandName: CONSTANTS.COMMANDS.CREATE_REPORT_COMMENT
      };
      broker.publish(CONSTANTS.TOPICS.REPORT_COMMAND, payload, "someId");
      setTimeout(() => {
        done();
      }, DEFAULT_TIMEOUT);
    }, DEFAULT_TIMEOUT);
  });
  it("should display update comment name", done => {
    let event = {
      eventId: "19282",
      eventName: CONSTANTS.EVENTS.USER_UPDATED,
      aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
      aggregateID: "userId",
      payload: {
        id: "userId",
        name: "jotaro",
        email: "newemail@gmail.com"
      }
    };
    broker.publish(CONSTANTS.TOPICS.USER_EVENT, event, "userId", 1);
    setTimeout(() => {
      //   redis.hgetall(`RMS:report:userId:someId`).then(report => {
      //     expect(report.userName).toEqual("joseph");
      //     done();
      //   });
      request(app)
        .get("/map/comments/commentId")
        .set("Accept", "application/json")
        .expect(200)
        .then(res => {
          expect(res.body.data.userName).toEqual("jotaro");
          done();
        });
    }, DEFAULT_TIMEOUT);
  });
});
