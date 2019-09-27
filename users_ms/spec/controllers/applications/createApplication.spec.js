const httpMock = require("node-mocks-http");
const applicationController = require("../../../controllers/users/applications_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("create user application", () => {
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
      } else if (id === "wrongRole") {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 1
          },
          events: []
        });
      } else if (id === "pending") {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 0,
            status: 0
          },
          events: []
        });
      } else if (id === "approved") {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 0,
            status: 1
          },
          events: []
        });
      } else {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 0
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
    controller = applicationController(
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
        userId: "someId",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: jasmine.any(String),
          userId: "someId",
          userName: "someName",
          timestamp: "2 o'clock",
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 404 when user does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "noSnapshot",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.USER_NOT_EXISTS]
      });
      done();
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 403 when user role invalid", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "wrongRole",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(403);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.USER_NOT_PERMITTED]
      });
      done();
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 409 when pending application exists", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "pending",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(409);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.DUPLICATE_APPLICATION]
      });
      done();
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 409 when approved application exists", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "approved",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(409);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.DUPLICATE_APPLICATION]
      });
      done();
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test perform command
   */
  it("should send event with correct event name", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (topic === CONSTANTS.TOPICS.USER_EVENT) {
        // assert
        expect(message.eventName).toEqual(
          CONSTANTS.EVENTS.USER_APPLICATION_CREATED
        );
        expect(message.payload).toEqual({
          id: jasmine.any(String),
          userId: "someId",
          userName: "someName",
          timestamp: "2 o'clock"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someId",
        userName: "someName",
        timestamp: "2 o'clock"
      }
    });

    // act
    controller.createApplication(mockRequest, mockResponse, null);
    //   setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });
});
