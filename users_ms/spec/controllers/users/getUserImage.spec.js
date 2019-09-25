const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CONSTANTS = require("../../../constants");

describe("get user image", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserById"
    ]);
    controller = usersController(mockQueryHandler, null);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
    mockRequest = httpMock.createRequest({
      params: { id: "something" }
    });
  });

  it("should return error 400 when user does not exist", done => {
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
    controller.getImage(mockRequest, mockResponse, null);
  });

  it("should return error 500 when server error", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(() => {
      return Promise.reject();
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.ERRORS.DEFAULT_SERVER_ERROR
      });
      done();
    });

    // act
    controller.getImage(mockRequest, mockResponse, null);
  });

  it("should return status 200 with no existing file", done => {
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

    mockRequest = httpMock.createRequest({
      params: { id: "something" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.ERRORS.FILE_NOT_FOUND
      });
      done();
    });

    // act
    controller.getImage(mockRequest, mockResponse, null);
  });
});

describe("get user image success", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserById"
    ]);
    controller = usersController(mockQueryHandler, null);

    mockResponse = jasmine.createSpyObj("mockResponse", ["sendFile"]);

    mockResponse.sendFile.and.callFake((path, options) => {
      return Promise.resolve();
    });
  });

  it("should return status 200 with existing file", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(id => {
      const userData = {
        id: "something",
        name: "someone",
        email: "my@email.com",
        role: 1,
        avatarPath: "somewhere"
      };
      return Promise.resolve(userData);
    });

    mockRequest = httpMock.createRequest({
      params: { id: "something" }
    });

    // act
    controller.getImage(mockRequest, mockResponse, null).then(() => {
      // assert
      expect(mockResponse.sendFile).toHaveBeenCalled();
      // expect(mockResponse.sendFile).toHaveBeenCalledWith("somewhere", {
      //   root: "/usr/src/app"
      // });
      done();
    });
  });
});
