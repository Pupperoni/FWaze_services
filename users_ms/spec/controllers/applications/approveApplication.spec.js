const httpMock = require("node-mocks-http");
const applicationController = require("../../../controllers/users/applications_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("approve user application", () => {
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
      } else if (id === "admin") {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "admin",
            email: "admin@email.com",
            role: 2
          },
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
      } else if (id === "rejected") {
        return Promise.resolve({
          aggregate: {
            id: id,
            name: "someName",
            email: "cool@email.com",
            role: 0,
            status: -1
          },
          events: []
        });
      } else if (id === "noStatus") {
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
            role: 0,
            status: 0
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
        id: "appId",
        userId: "someId",
        adminId: "admin"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "appId",
          userId: "someId"
        }
      });
      done();
    });

    // act
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 400 when admin does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "someId",
        adminId: "noSnapshot"
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
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 400 when admin role invalid", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "someId",
        adminId: "wrongRole"
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
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 400 when application does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "noStatus",
        adminId: "admin"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.APPLICATION_NOT_EXISTS]
      });
      done();
    });

    // act
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 400 when application already approved", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "approved",
        adminId: "admin"
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
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return error 400 when application already rejected", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "rejected",
        adminId: "admin"
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
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
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
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_APPLICATION_APPROVED
      ) {
        // assert
        expect(message.payload).toEqual({
          id: "appId",
          userId: "someId"
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_UPDATED
      ) {
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          role: 1
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        id: "appId",
        userId: "someId",
        adminId: "admin"
      }
    });

    // act
    controller.approveApplication(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });
});
