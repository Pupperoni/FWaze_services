const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("delete vote", () => {
  let controller;
  let mockRequest;
  let mockResponse;
  let mockBroker;
  let mockEventStore;

  beforeEach(() => {
    mockBroker = jasmine.createSpyObj("mockBroker", [
      "publish",
      "commandSubscribe"
    ]);

    mockEventStore = jasmine.createSpyObj("mockEventStore", [
      "getSnapshotAndEvents",
      "getLastOffset",
      "addEvent",
      "addSnapshot"
    ]);

    mockEventStore.getSnapshotAndEvents.and.callFake((name, id) => {
      if (id === "noSnapshot") {
        return Promise.resolve({
          aggregate: null,
          events: []
        });
      } else {
        return Promise.resolve({
          aggregate: {
            id: id
          },
          events: []
        });
      }
    });

    mockEventStore.getLastOffset.and.callFake((name, id) => {
      return Promise.resolve(0);
    });

    mockEventStore.addEvent.and.callFake((name, id) => {
      return Promise.resolve(1);
    });

    mockEventStore.addSnapshot.and.callFake((name, id) => {
      return Promise.resolve(1);
    });

    controller = reportsController(
      null,
      CommonCommandHandler(
        WriteRepo(mockEventStore, CommonAggregateHandler(mockEventStore)),
        mockBroker,
        CommonAggregateHandler(mockEventStore)
      )
    );

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
  });

  /*
   * test success response
   */
  it("should return status 200 with correct message", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        reportId: "someReport",
        userId: "someUser"
      }
    });
    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "someReport",
          aggregateID: "someReport",
          userId: "someUser"
        }
      });
      done();
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteVote(mockRequest, mockResponse, null);
    }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 400 when user does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        reportId: "someReport",
        userId: "noSnapshot"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.USER_NOT_EXISTS]
      });
      done();
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteVote(mockRequest, mockResponse, null);
    }, 2000);
  });

  it("should return error 400 when report does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        reportId: "noSnapshot",
        userId: "someUser"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.REPORT_NOT_EXISTS]
      });
      done();
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteVote(mockRequest, mockResponse, null);
    }, 2000);
  });

  it("should return error 400 when user and report does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        reportId: "noSnapshot",
        userId: "noSnapshot"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData().err).toContain(
        CONSTANTS.ERRORS.USER_NOT_EXISTS,
        CONSTANTS.ERRORS.REPORT_NOT_EXISTS
      );

      done();
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteVote(mockRequest, mockResponse, null);
    }, 2000);
  });

  /*
   * test perform command
   */
  it("should send event with correct event name", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.REPORT_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (topic === CONSTANTS.TOPICS.REPORT_EVENT) {
        // assert
        expect(message.eventName).toEqual(CONSTANTS.EVENTS.REPORT_VOTE_DELETED);
        expect(message.payload).toEqual({
          id: "someReport",
          userId: "someUser"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        reportId: "someReport",
        userId: "someUser"
      }
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteVote(mockRequest, mockResponse, null);
    }, 2000);
  });
});
