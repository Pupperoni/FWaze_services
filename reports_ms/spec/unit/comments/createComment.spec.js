const httpMock = require("node-mocks-http");
const commentsController = require("../../../controllers/map/comments_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("create comment", () => {
  let controller;
  let mockRequest;
  let mockResponse;
  let mockBroker;
  let mockEventStore;
  let aggregateHelpers;

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
            id: id,
            name: "someName",
            email: "cool@email.com"
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

    aggregateHelpers = CommonAggregateHandler(mockEventStore);

    controller = commentsController(
      null,
      CommonCommandHandler(
        WriteRepo(mockEventStore, aggregateHelpers),
        mockBroker,
        aggregateHelpers
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
        userId: "someUser",
        userName: "name",
        reportId: "someReport",
        body: "somebody",
        timestamp: "9 in the evening"
      }
    });
    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: jasmine.any(String),
          aggregateID: jasmine.any(String),
          userId: "someUser",
          userName: "name",
          reportId: "someReport",
          body: "somebody",
          timestamp: "9 in the evening"
        }
      });
      done();
    });

    // act
    controller.createComment(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 401 when user does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "noSnapshot",
        userName: "name",
        reportId: "someReport",
        body: "somebody",
        timestamp: "9 in the evening"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(401);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.USER_NOT_EXISTS]
      });
      done();
    });

    // act
    controller.createComment(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 404 when report does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        reportId: "noSnapshot",
        body: "somebody",
        timestamp: "9 in the evening"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.REPORT_NOT_EXISTS]
      });
      done();
    });

    // act
    controller.createComment(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test perform command
   */
  it("should send event with correct event name without file", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.REPORT_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (topic === CONSTANTS.TOPICS.REPORT_EVENT) {
        // assert
        expect(message.eventName).toEqual(
          CONSTANTS.EVENTS.REPORT_COMMENT_CREATED
        );
        expect(message.payload).toEqual({
          id: jasmine.any(String),
          userId: "someUser",
          userName: "name",
          reportId: "someReport",
          body: "somebody",
          timestamp: "9 in the evening"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        reportId: "someReport",
        body: "somebody",
        timestamp: "9 in the evening"
      }
    });

    // act
    controller.createComment(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });
});
