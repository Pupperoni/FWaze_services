const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CommonCommandHandler = require("../../../cqrs/commands/base/common.command.handler");
const CommonAggregateHandler = require("../../../cqrs/aggregateHelpers/base/common.aggregate");
const WriteRepo = require("../../../cqrs/writeRepositories/write.repository");
const CONSTANTS = require("../../../constants");

describe("update user", () => {
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
      if (name === "conflict") return Promise.resolve("notTheSame");
      else return Promise.resolve("someId");
    });

    mockQueryHandler.getUserByEmail.and.callFake(email => {
      if (email === "conflict") {
        let data = {
          id: "notTheSame",
          name: "emailName",
          email: email,
          home: null,
          work: null
        };
        return Promise.resolve([data]);
      } else {
        return Promise.resolve([
          {
            id: "someId",
            name: "validName",
            email: email,
            home: null,
            work: null
          }
        ]);
      }
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = usersController(mockQueryHandler, null);
  });

  /*
   * Test error response
   */
  it("should return error 409 with conflicting username", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "conflict",
        email: "email@email"
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
    controller.updateUser(mockRequest, mockResponse, null);
  });

  it("should return error 409 with conflicting email", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "conflict"
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
    controller.updateUser(mockRequest, mockResponse, null);
  });
});

describe("update user broker", () => {
  let controller;
  let mockQueryHandler;
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
      if (name === "conflict") return Promise.resolve("notTheSame");
      else return Promise.resolve("someId");
    });

    mockQueryHandler.getUserByEmail.and.callFake(email => {
      if (email === "conflict") {
        let data = {
          id: "notTheSame",
          name: "emailName",
          email: email,
          home: null,
          work: null
        };
        return Promise.resolve([data]);
      } else {
        return Promise.resolve([
          {
            id: "someId",
            name: "validName",
            email: email,
            home: null,
            work: null
          }
        ]);
      }
    });

    aggregateHelpers = CommonAggregateHandler(mockEventStore);

    controller = usersController(
      mockQueryHandler,
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
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email"
      }
    });
    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "someId",
          name: "name",
          email: "email@email",
          home: {},
          work: {},
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return status 200 with file", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email"
      },
      file: {
        path: "path/to/the/file"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "someId",
          name: "name",
          email: "email@email",
          home: {},
          work: {},
          file: {
            path: "path/to/the/file"
          },
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return status 200 with home", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email",
        homeLatitude: -1.09492,
        homeLongitude: -142.35191,
        homeAddress: "ocean lol"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "someId",
          name: "name",
          email: "email@email",
          home: {
            latitude: -1.09492,
            longitude: -142.35191,
            address: "ocean lol"
          },
          work: {},
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should return status 200 with work", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email",
        workLatitude: -1.09492,
        workLongitude: -142.35191,
        workAddress: "ocean lol"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
        data: {
          id: "someId",
          name: "name",
          email: "email@email",
          home: {},
          work: {
            latitude: -1.09492,
            longitude: -142.35191,
            address: "ocean lol"
          },
          aggregateID: "someId"
        }
      });
      done();
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
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
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "inValidEmAILLXD"
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
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  /*
   * test perform command
   */
  it("should send event with correct event name without work, home and file", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_UPDATED
      ) {
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          name: "name",
          email: "email@email"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email"
      }
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should send event with file path", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_UPDATED
      ) {
        // assert
        expect(message.eventName).toEqual(CONSTANTS.EVENTS.USER_UPDATED);
        expect(message.payload.avatarPath).toEqual("/path/to/file");
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email"
      },
      file: {
        path: "/path/to/file"
      }
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should send event with home", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_HOME_UPDATED
      ) {
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          latitude: 15.17846,
          longitude: -48.01498,
          address: "some place lol"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email",
        homeLatitude: 15.17846,
        homeLongitude: -48.01498,
        homeAddress: "some place lol"
      }
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should send event with work", done => {
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_WORK_UPDATED
      ) {
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          latitude: 15.17846,
          longitude: -48.01498,
          address: "some place lol"
        });
        done();
      }
    });

    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email",
        workLatitude: 15.17846,
        workLongitude: -48.01498,
        workAddress: "some place lol"
      }
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });

  it("should send event with home, work and file", done => {
    let counter = 0;
    // arrange
    mockBroker.publish.and.callFake((topic, message, aggregateID, offset) => {
      if (topic === CONSTANTS.TOPICS.USER_COMMAND) {
        mockBroker.commandSubscribe.calls.argsFor(0)[0]({
          value: JSON.stringify(message)
        });
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_UPDATED
      ) {
        counter += 1;
        // assert
        expect(message.payload.avatarPath).toEqual("/path/to/file");
        if (counter === 3) {
          done();
        }
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_HOME_UPDATED
      ) {
        counter += 1;
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          latitude: 15.17846,
          longitude: -48.01498,
          address: "lol place some"
        });
        if (counter === 3) {
          done();
        }
      } else if (
        topic === CONSTANTS.TOPICS.USER_EVENT &&
        message.eventName === CONSTANTS.EVENTS.USER_WORK_UPDATED
      ) {
        counter += 1;
        // assert
        expect(message.payload).toEqual({
          id: "someId",
          latitude: -48.01498,
          longitude: 15.17846,
          address: "some place lol"
        });
        if (counter === 3) {
          done();
        }
      }
    });

    mockRequest = httpMock.createRequest({
      method: "PUT",
      body: {
        id: "someId",
        name: "name",
        email: "email@email",
        homeLatitude: 15.17846,
        homeLongitude: -48.01498,
        homeAddress: "lol place some",
        workLatitude: -48.01498,
        workLongitude: 15.17846,
        workAddress: "some place lol"
      },
      file: {
        path: "/path/to/file"
      }
    });

    // act
    controller.updateUser(mockRequest, mockResponse, null);
    // setTimeout(() => {
    //   // set timer to give init time
    // }, 2000);
  });
});
