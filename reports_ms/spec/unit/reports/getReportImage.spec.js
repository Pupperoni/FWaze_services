const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");
const CONSTANTS = require("../../../constants");

describe("get report image", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getReportById"
    ]);
    controller = reportsController(mockQueryHandler, null);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
    mockRequest = httpMock.createRequest({
      params: { id: "someId" }
    });
  });

  it("should return error 404 when report does not exist", done => {
    // arrange
    mockQueryHandler.getReportById.and.callFake(() => {
      return Promise.resolve({});
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.REPORT_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getImage(mockRequest, mockResponse, null);
  });

  it("should return error 500 when server error", done => {
    // arrange
    mockQueryHandler.getReportById.and.callFake(() => {
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
    mockQueryHandler.getReportById.and.callFake(id => {
      const data = {
        id: id
      };
      return Promise.resolve(data);
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
      "getReportById"
    ]);
    controller = reportsController(mockQueryHandler, null);

    mockResponse = jasmine.createSpyObj("mockResponse", ["sendFile"]);

    mockRequest = httpMock.createRequest({
      params: { id: "someId" }
    });

    mockResponse.sendFile.and.callFake((path, options) => {
      return Promise.resolve();
    });
  });

  it("should return status 200 with existing file", done => {
    // arrange
    mockQueryHandler.getReportById.and.callFake(id => {
      const data = {
        id: id,
        photoPath: "/path/to/file"
      };
      return Promise.resolve(data);
    });

    // act
    controller.getImage(mockRequest, mockResponse, null).then(() => {
      // assert
      expect(mockResponse.sendFile).toHaveBeenCalled();
      expect(mockResponse.sendFile).toHaveBeenCalledWith(
        "/path/to/file",
        jasmine.anything()
      );
      done();
    });
  });
});
