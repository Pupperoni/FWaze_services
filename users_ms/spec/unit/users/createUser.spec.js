const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("create user", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserByName",
      "getUserByEmail"
    ]);

    mockQueryHandler.getUserByName.and.callFake(name => {
      if (name === "exist") return Promise.resolve("nameId");
      else return Promise.resolve();
    });

    mockQueryHandler.getUserByEmail.and.callFake(email => {
      if (email === "exist") {
        let data = {
          id: "emailId",
          name: "emailName",
          email: email,
          home: null,
          work: null
        };
        return Promise.resolve([data]);
      } else return Promise.resolve([]);
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = usersController(mockQueryHandler, null);
  });

  it("should return error 409 with existing username", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "exist",
        email: "email@email",
        role: 1,
        password: "password",
        confirmPassword: "password"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(409);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.USERNAME_TAKEN
      });
      done();
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
  });

  it("should return error 409 with existing email", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "name",
        email: "exist",
        role: 1,
        password: "password",
        confirmPassword: "password"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(409);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.EMAIL_TAKEN
      });
      done();
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
  });
});

describe("create user broker", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;
  let mockBroker;
  let mockEventStore;
  let aggregateHandler;

  beforeEach(() => {
    mockBroker = jasmine.createSpyObj("mockBroker", [
      "publish",
      "commandSubscribe"
    ]);

    mockEventStore = jasmine.createSpyObj("mockEventStore", [
      "getLastOffset",
      "addEvent",
      "addSnapshot"
    ]);

    mockEventStore.getLastOffset.and.callFake((name, id) => {
      return Promise.resolve(0);
    });

    mockEventStore.addEvent.and.callFake((name, id) => {
      return Promise.resolve(1);
    });

    mockEventStore.addSnapshot.and.callFake((name, id) => {
      return Promise.resolve(1);
    });

    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserByName",
      "getUserByEmail"
    ]);

    mockQueryHandler.getUserByName.and.callFake(name => {
      if (name === "exist") return Promise.resolve("nameId");
      else return Promise.resolve();
    });

    mockQueryHandler.getUserByEmail.and.callFake(email => {
      if (email === "exist") {
        let data = {
          id: "emailId",
          name: "emailName",
          email: email,
          home: null,
          work: null
        };
        return Promise.resolve([data]);
      } else return Promise.resolve([]);
    });

    aggregateHandler = CommonAggregateHandler(mockEventStore);

    controller = usersController(
      mockQueryHandler,
      CommonCommandHandler(
        WriteRepo(mockEventStore, aggregateHandler),
        mockBroker,
        aggregateHandler
      )
    );

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "name",
        email: "email@email",
        role: 1,
        password: "password",
        confirmPassword: "password"
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
          name: "name",
          email: "email@email",
          role: 1,
          password: "password",
          confirmPassword: "password"
        }
      });
      done();
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time

    // }, 2000);
  });

  /*
   * test validate
   */
  it("should return error 400 with invalid email", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "name",
        email: "not a valid email",
        role: 1,
        password: "password",
        confirmPassword: "password"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.EMAIL_INVALID_FORMAT]
      });
      done();
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time

    // }, 2000);
  });

  it("should return error 400 with non matching passwords", done => {
    // arrange

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "name",
        email: "email@email",
        role: 1,
        password: "password",
        confirmPassword: "notthesame"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: [CONSTANTS.ERRORS.PASSWORDS_NOT_MATCH]
      });
      done();
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time

    // }, 2000);
  });

  /*
   * test perform command
   */
  it("should send event with correct event name", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, payload, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(payload)
        });
      } else if (topic === CONSTANTS.TOPICS.USER_EVENT) {
        // assert
        expect(payload.eventName).toEqual(CONSTANTS.EVENTS.USER_CREATED);
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "POST",
      body: {
        name: "name",
        email: "email@email",
        role: 1,
        password: "password",
        confirmPassword: "password"
      }
    });

    // act
    controller.createUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time

    // }, 2000);
  });
});
