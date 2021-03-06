const httpMock = require("node-mocks-http");
const applicationController = require("../../../controllers/users/applications_controller");

describe("get all applications", () => {
  let controller;
  let mockQueryHandler;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getAllApplications"
    ]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = applicationController(mockQueryHandler, null);
  });

  it("should return 200 with empty data when no applications exist", done => {
    // arrange
    mockQueryHandler.getAllApplications.and.callFake(() => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({ data: [] });
      done();
    });

    // act
    controller.getAllApplications(null, mockResponse, null);
  });

  it("should return error 500 upon server error", done => {
    // arrange
    mockQueryHandler.getAllApplications.and.callFake(() => {
      return Promise.reject("oops error");
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
    controller.getAllApplications(null, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockQueryHandler.getAllApplications.and.callFake(() => {
      return Promise.resolve([
        {
          userId: "someId",
          status: 1,
          timestamp: "2 o'clock"
        }
      ]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        data: [
          {
            userId: "someId",
            status: 1,
            timestamp: "2 o'clock"
          }
        ]
      });
      done();
    });

    // act
    controller.getAllApplications(null, mockResponse, null);
  });
});
