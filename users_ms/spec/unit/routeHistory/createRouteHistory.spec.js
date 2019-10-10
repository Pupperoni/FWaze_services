const httpMock = require("node-mocks-http");
const routeHistoryController = require("../../../controllers/users/route_history_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("create user route history", () => {
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
    controller = routeHistoryController(
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
        source: {
          address: "source",
          latitude: 10,
          longitude: 5
        },
        destination: {
          address: "destination",
          latitude: 20,
          longitude: 10
        },
        timestamp: "10:00"
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
          sourceAddress: "source",
          sourceLatitude: 10,
          sourceLongitude: 5,
          destinationAddress: "destination",
          destinationLatitude: 20,
          destinationLongitude: 10,
          timestamp: "10:00",
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.createRouteHistory(mockRequest, mockResponse, null);
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
        source: {
          address: "source",
          latitude: 10,
          longitude: 5
        },
        destination: {
          address: "destination",
          latitude: 20,
          longitude: 10
        },
        timestamp: "10:00"
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
    controller.createRouteHistory(mockRequest, mockResponse, null);
  });

  it("should return error 400 when details missing", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someId",
        source: {
          address: "source",
          latitude: 10,
          longitude: 5
        },
        destination: {
          address: "destination",
          latitude: 20,
          longitude: null
        },
        timestamp: "10:00"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.DEFAULT_INVALID_DATA]
      });
      done();
    });

    // act
    controller.createRouteHistory(mockRequest, mockResponse, null);
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
          CONSTANTS.EVENTS.USER_ROUTE_HISTORY_CREATED
        );
        expect(message.payload).toEqual({
          id: jasmine.any(String),
          userId: "someId",
          sourceAddress: "source",
          sourceLatitude: 10,
          sourceLongitude: 5,
          destinationAddress: "destination",
          destinationLatitude: 20,
          destinationLongitude: 10,
          timestamp: "10:00"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someId",
        source: {
          address: "source",
          latitude: 10,
          longitude: 5
        },
        destination: {
          address: "destination",
          latitude: 20,
          longitude: 10
        },
        timestamp: "10:00"
      }
    });

    // act
    controller.createRouteHistory(mockRequest, mockResponse, null);
  });
});
