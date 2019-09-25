const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("delete user route", () => {
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

    controller = usersController(
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
        routeId: "someRoute",
        userId: "someId"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          routeId: "someRoute",
          userId: "someId",
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteFaveRoute(mockRequest, mockResponse, null);
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
        routeId: "someRoute",
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
      controller.deleteFaveRoute(mockRequest, mockResponse, null);
    }, 2000);
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
        expect(message.eventName).toEqual(CONSTANTS.EVENTS.USER_ROUTE_DELETED);
        expect(message.payload).toEqual({
          id: "someId",
          routeId: "someRoute"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        routeId: "someRoute",
        userId: "someId"
      }
    });

    // act
    setTimeout(() => {
      // set timer to give init time
      controller.deleteFaveRoute(mockRequest, mockResponse, null);
    }, 2000);
  });
});
