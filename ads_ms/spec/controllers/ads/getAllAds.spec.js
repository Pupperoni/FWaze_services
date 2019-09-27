const httpMock = require("node-mocks-http");
const adsController = require("../../../controllers/map/advertisements_controller");

describe("get all ads", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getAdsByBorder"
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

    controller = adsController(mockQueryHandler, null);
  });

  it("should return 204 with empty ad list", done => {
    // arrange
    mockQueryHandler.getAdsByBorder.and.callFake(() => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(204);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        ads: []
      });
      done();
    });

    // act
    controller.getAdsByRange(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.getAdsByBorder.and.callFake(() => {
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
    controller.getAdsByRange(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getAdsByBorder.and.callFake(() => {
      return Promise.resolve([
        {
          id: "ad1",
          latitude: "5",
          longitude: "10"
        }
      ]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        ads: [
          {
            id: "ad1",
            latitude: "5",
            longitude: "10"
          }
        ]
      });
      done();
    });

    // act
    controller.getAdsByRange(mockRequest, mockResponse, null);
  });
});
