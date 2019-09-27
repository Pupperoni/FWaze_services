const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CONSTANTS = require("../../../constants");

describe("get user routes", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserById",
      "getFaveRoutes"
    ]);

    mockQueryHandler.getFaveRoutes.and.callFake(() => {
      return Promise.resolve([{ id: "routeId1" }, { id: "routeId2" }]);
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      params: { id: "something" }
    });

    controller = usersController(mockQueryHandler, null);
  });

  it("should return error 404 when user does not exist", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(() => {
      return Promise.resolve({});
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.USER_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getFaveRoutes(mockRequest, mockResponse, null);
  });

  it("should return error 500 when server error", done => {
    // arrange
    mockQueryHandler.getUserById.and.callFake(() => {
      return Promise.reject("oops server error");
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      expect(mockResponse._getJSONData()).toEqual({
        err: "oops server error"
      });
      done();
    });

    // act
    controller.getFaveRoutes(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getUserById.and.callFake(id => {
      return Promise.resolve({
        id: id,
        name: "name",
        email: "email@email"
      });
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        routes: [{ id: "routeId1" }, { id: "routeId2" }]
      });

      done();
    });

    // act
    controller.getFaveRoutes(mockRequest, mockResponse, null);
  });
});
