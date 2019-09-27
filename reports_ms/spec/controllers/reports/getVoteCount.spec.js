const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");

describe("get vote count", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getReportUpvotersCount"
    ]);

    mockQueryHandler.getReportUpvotersCount.and.callFake(id => {
      if (id === "notExist") return Promise.resolve(0);
      else if (id === "serverError") return Promise.reject("oops server error");
      else return Promise.resolve(2);
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = reportsController(mockQueryHandler, null);
  });

  it("should return status 204 and value 0 when report does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "notExist"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(204);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        result: 0
      });
      done();
    });

    // act
    controller.getVoteCount(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "serverError"
      }
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
    controller.getVoteCount(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct count of voters", done => {
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        result: 2
      });
      done();
    });

    // act
    controller.getVoteCount(mockRequest, mockResponse, null);
  });
});
