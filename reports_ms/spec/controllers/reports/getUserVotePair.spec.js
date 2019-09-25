const httpMock = require("node-mocks-http");
const reportsController = require("../../../controllers/map/reports_controller");

describe("get user vote pair", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getUserVotePair"
    ]);

    mockQueryHandler.getUserVotePair.and.callFake((report, user) => {
      if (user === "notExist") return Promise.resolve(0);
      else if (report === "notExist") return Promise.resolve(0);
      else if (user === "notVoting") return Promise.resolve(0);
      else if (report === "serverError")
        return Promise.reject("oops server error");
      else return Promise.resolve(1);
    });

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = reportsController(mockQueryHandler, null);
  });

  it("should return 0 when report does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        reportId: "notExist",
        userId: "someUser"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual(0);
      done();
    });

    // act
    controller.getUserVotePair(mockRequest, mockResponse, null);
  });

  it("should return 0 when user does not exist", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        reportId: "someReport",
        userId: "notExist"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual(0);
      done();
    });

    // act
    controller.getUserVotePair(mockRequest, mockResponse, null);
  });

  it("should return 0 when user does not not upvoted", done => {
    // arrange
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        reportId: "someReport",
        userId: "notVoting"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual(0);
      done();
    });

    // act
    controller.getUserVotePair(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        reportId: "serverError",
        userId: "someUser"
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
    controller.getUserVotePair(mockRequest, mockResponse, null);
  });

  it("should return status 200 with 1 when voting", done => {
    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId"
      }
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual(1);
      done();
    });

    // act
    controller.getUserVotePair(mockRequest, mockResponse, null);
  });
});
