const httpMock = require("node-mocks-http");
const commentsController = require("../../../controllers/map/comments_controller");
const CONSTANTS = require("../../../constants");

describe("get comments by report id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getCommentsByReportId"
    ]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId",
        page: 0
      }
    });

    controller = commentsController(mockQueryHandler, null);
  });

  it("should return 200 with empty comments list", done => {
    // arrange
    mockQueryHandler.getCommentsByReportId.and.callFake((id, page) => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(mockResponse._getJSONData()).toEqual({
        msg: CONSTANTS.ERRORS.COMMENTS_NOT_FOUND,
        data: []
      });
      done();
    });

    // act
    controller.getCommentsByReportId(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.getCommentsByReportId.and.callFake(() => {
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
    controller.getCommentsByReportId(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getCommentsByReportId.and.callFake(() => {
      return Promise.resolve([
        {
          id: "comment1"
        }
      ]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        data: [
          {
            id: "comment1"
          }
        ]
      });
      done();
    });

    // act
    controller.getCommentsByReportId(mockRequest, mockResponse, null);
  });
});
