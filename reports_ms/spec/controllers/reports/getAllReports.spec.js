const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");

describe("get all reports", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getReportsByTypeBorder"
    ]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      method: "GET",
      query: {
        tright: "20,20",
        bleft: "1,1"
      }
    });

    controller = reportsController(mockQueryHandler, null);
  });

  it("should return 200 with empty report list", done => {
    // arrange
    mockQueryHandler.getReportsByTypeBorder.and.callFake(() => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        reports: []
      });
      done();
    });

    // act
    controller.getReportsByTypeRange(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.getReportsByTypeBorder.and.callFake(() => {
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
    controller.getReportsByTypeRange(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getReportsByTypeBorder.and.callFake(() => {
      return Promise.resolve([
        {
          id: "report1",
          latitude: "5",
          longitude: "10"
        }
      ]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        reports: [
          {
            id: "report1",
            latitude: "5",
            longitude: "10"
          }
        ]
      });
      done();
    });

    // act
    controller.getReportsByTypeRange(mockRequest, mockResponse, null);
  });
});
