const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");
const CONSTANTS = require("../../../constants");

describe("get report by id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getReportById",
      "getReportUpvotersCount"
    ]);

    mockQueryHandler.getReportUpvotersCount.and.callFake(id => {
      return Promise.resolve(0);
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId"
      }
    });

    controller = reportsController(mockQueryHandler, null);
  });

  it("should return 400 when report does not exist", done => {
    // arrange
    mockQueryHandler.getReportById.and.callFake(id => {
      return Promise.resolve({});
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(400);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.REPORT_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getReportById(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.getReportById.and.callFake(() => {
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
    controller.getReportById(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getReportById.and.callFake(id => {
      return Promise.resolve({
        id: id,
        latitude: "5",
        longitude: "10"
      });
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        report: {
          id: "someId",
          latitude: "5",
          longitude: "10",
          votes: 0
        }
      });
      done();
    });

    // act
    controller.getReportById(mockRequest, mockResponse, null);
  });
});
