const httpMock = require("node-mocks-http");
const commentsController = require("../../../controllers/map/comments_controller");

describe("count comments by report id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "countCommentsByReportId"
    ]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId"
      }
    });

    controller = commentsController(mockQueryHandler, null);
  });

  it("should return status 200 with empty comments list", done => {
    // arrange
    mockQueryHandler.countCommentsByReportId.and.callFake(id => {
      let data = {};
      data["COUNT(*)"] = 0;
      return Promise.resolve(data);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        data: 0
      });
      done();
    });

    // act
    controller.countCommentsByReportId(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.countCommentsByReportId.and.callFake(id => {
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
    controller.countCommentsByReportId(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.countCommentsByReportId.and.callFake(id => {
      let data = {};
      data["COUNT(*)"] = 3;
      return Promise.resolve(data);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        data: 3
      });
      done();
    });

    // act
    controller.countCommentsByReportId(mockRequest, mockResponse, null);
  });
});
