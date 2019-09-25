const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CONSTANTS = require("../../../constants");

describe("get user by id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserById",
      "getUserHome",
      "getUserWork"
    ]);
    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
    mockRequest = httpMock.createRequest({
      params: { id: "something" }
    });

    controller = usersController(mockQueryHandler, null);
  });

  it("should return error 400 with correct message", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(() => {
      return Promise.resolve({});
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.USER_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getUserById(mockRequest, mockResponse, null);
  });

  it("should return error 500", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(() => {
      return Promise.reject();
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      done();
    });

    // act
    controller.getUserById(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(id => {
      const userData = {
        id: "something",
        name: "someone",
        email: "my@email.com",
        role: 1
      };
      return Promise.resolve(userData);
    });
    mockQueryHandler.getUserHome.and.callFake(id => {
      const userData = {
        latitude: "32.87772",
        longitude: "-95.24682",
        address: "USA"
      };
      return Promise.resolve(userData);
    });
    mockQueryHandler.getUserWork.and.callFake(id => {
      const userData = {
        latitude: "62.75340",
        longitude: "-105.79159",
        address: "Canada"
      };
      return Promise.resolve(userData);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        user: {
          id: "something",
          name: "someone",
          email: "my@email.com",
          role: 1,
          home: {
            latitude: "32.87772",
            longitude: "-95.24682",
            address: "USA"
          },
          work: {
            latitude: "62.75340",
            longitude: "-105.79159",
            address: "Canada"
          }
        }
      });
      done();
    });

    // act
    controller.getUserById(mockRequest, mockResponse, null);
  });
});
