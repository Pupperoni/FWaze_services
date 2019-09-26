const httpMock = require("node-mocks-http");
const adsController = require("../../../controllers/map/advertisements_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("create ad", () => {
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
            role: 0
          },
          events: []
        });
      } else {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 1
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

    controller = adsController(
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
  it("should return status 200 with correct message without file", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
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
          latitude: "5",
          longitude: "10",
          location: "no where",
          caption: "somecaption"
        }
      });
      done();
    });

    // act
    controller.createAd(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return status 200 with correct message with file", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
      },
      file: {
        path: "/path/to/file"
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
          latitude: "5",
          longitude: "10",
          location: "no where",
          caption: "somecaption",
          file: {
            path: "/path/to/file"
          }
        }
      });
      done();
    });

    // act
    controller.createAd(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 400 when user does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "noSnapshot",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
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
    controller.createAd(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 400 when user role invalid", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "wrongRole",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.USER_NOT_PERMITTED]
      });
      done();
    });

    // act
    controller.createAd(mockRequest, mockResponse, null);
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
      if (topic === CONSTANTS.TOPICS.AD_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (topic === CONSTANTS.TOPICS.AD_EVENT) {
        // assert
        expect(message.eventName).toEqual(CONSTANTS.EVENTS.AD_CREATED);
        expect(message.payload).toEqual({
          id: jasmine.any(String),
          userId: "someUser",
          userName: "name",
          latitude: "5",
          longitude: "10",
          location: "no where",
          caption: "somecaption"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
      }
    });

    // act
    controller.createAd(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should send event with correct event name with file", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.AD_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (topic === CONSTANTS.TOPICS.AD_EVENT) {
        // assert
        expect(message.eventName).toEqual(CONSTANTS.EVENTS.AD_CREATED);
        expect(message.payload).toEqual({
          id: jasmine.any(String),
          userId: "someUser",
          userName: "name",
          latitude: "5",
          longitude: "10",
          location: "no where",
          caption: "somecaption",
          photoPath: "/path/to/file"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        userId: "someUser",
        userName: "name",
        latitude: "5",
        longitude: "10",
        location: "no where",
        caption: "somecaption"
      },
      file: {
        path: "/path/to/file"
      }
    });

    // act
    controller.createAd(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });
});
