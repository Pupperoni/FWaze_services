const httpMock = require("node-mocks-http");
const applicationController = require("../../../controllers/users/applications_controller");

describe("get application by user id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getApplicationByUserId"
    ]);

    mockQueryHandler.getApplicationByUserId.and.callFake(id => {
      if (id === "noExist") return Promise.resolve();
      else if (id === "serverError") return Promise.reject("oops error");
      else {
        return Promise.resolve({
          userId: id,
          status: 0,
          timestamp: "2 o'clock"
        });
      }
    });
    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = applicationController(mockQueryHandler, null);
  });

  it("should return 200 with empty data when application does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      params: { id: "noExist" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({});
      done();
    });

    // act
    controller.getApplicationByUserId(mockRequest, mockResponse, null);
  });

  it("should return error 500 upon server", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      params: { id: "serverError" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      expect(mockResponse._getJSONData()).toEqual({
        err: "oops error"
      });
      done();
    });

    // act
    controller.getApplicationByUserId(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      params: { id: "someId" }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        data: {
          userId: "someId",
          status: 0,
          timestamp: "2 o'clock"
        }
      });
      done();
    });

    // act
    controller.getApplicationByUserId(mockRequest, mockResponse, null);
  });
});
