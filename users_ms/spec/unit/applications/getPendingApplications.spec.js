const httpMock = require("node-mocks-http");
const applicationController = require("../../../controllers/users/applications_controller");

describe("get application by user id", () => {
  let controller;
  let mockQueryHandler;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getPendingApplications"
    ]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = applicationController(mockQueryHandler, null);
  });

  it("should return 200 with empty data when no applications exist", done => {
    // arrange
    mockQueryHandler.getPendingApplications.and.callFake(() => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({ data: [] });
      done();
    });

    // act
    controller.getPendingApplications(null, mockResponse, null);
  });

  it("should return error 500 upon server error", done => {
    // arrange
    mockQueryHandler.getPendingApplications.and.callFake(() => {
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
    controller.getPendingApplications(null, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    // arrange
    mockQueryHandler.getPendingApplications.and.callFake(() => {
      return Promise.resolve([
        {
          userId: "someId",
          status: 0,
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
            status: 0,
            timestamp: "2 o'clock"
          }
        ]
      });
      done();
    });

    // act
    controller.getPendingApplications(null, mockResponse, null);
  });
});
