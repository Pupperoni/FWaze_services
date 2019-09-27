const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CONSTANTS = require("../../../constants");

describe("user login", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserByName",
      "getUserById",
      "getUserHome",
      "getUserWork"
    ]);

    mockQueryHandler.getUserById.and.callFake(id => {
      if (id === "wrongPass") {
        return Promise.resolve({
          id: id,
          password: "wrongHashBrown"
        });
      } else {
        return Promise.resolve({
          id: id,
          password:
            "$2y$10$Da.5ib72uqOFuhhDXnwN8uiM/fogzIt2.Nf/p.79C0RAZLBeYHlLi"
        });
      }
    });

    mockQueryHandler.getUserByName.and.callFake(name => {
      if (name === "wrongName") return Promise.resolve(null);
      else return Promise.resolve(name);
    });

    mockQueryHandler.getUserHome.and.callFake(() => {
      return Promise.resolve({
        latitude: "",
        longitude: "",
        address: ""
      });
    });

    mockQueryHandler.getUserWork.and.callFake(() => {
      return Promise.resolve({
        latitude: "",
        longitude: "",
        address: ""
      });
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = usersController(mockQueryHandler, null);
  });

  it("should return error 404 when wrong user name", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      body: { name: "wrongName", password: "secret" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE
      });
      done();
    });

    // act
    controller.loginUser(mockRequest, mockResponse, null);
  });

  it("should return error 404 when wrong password", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      body: { name: "wrongPass", password: "secret" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE
      });
      done();
    });

    // act
    controller.loginUser(mockRequest, mockResponse, null);
  });

  it("should return error 400 when blank details", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      body: { name: "", password: "" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE
      });
      done();
    });

    // act
    controller.loginUser(mockRequest, mockResponse, null);
  });

  it("should return error 400 when missing details", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      body: {}
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(mockResponse._getJSONData()).toEqual({
        err: CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE
      });
      done();
    });

    // act
    controller.loginUser(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      body: { name: "name", password: "secret" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.SUCCESS.LOGIN_SUCCESS,
        user: {
          id: "name",
          password:
            "$2y$10$Da.5ib72uqOFuhhDXnwN8uiM/fogzIt2.Nf/p.79C0RAZLBeYHlLi",
          home: {
            latitude: "",
            longitude: "",
            address: ""
          },
          work: {
            latitude: "",
            longitude: "",
            address: ""
          }
        }
      });
      done();
    });

    // act
    controller.loginUser(mockRequest, mockResponse, null);
  });
});
