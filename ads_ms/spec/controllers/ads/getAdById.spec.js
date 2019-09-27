const httpMock = require("node-mocks-http");
const adsController = require("../../../controllers/map/advertisements_controller");
const CONSTANTS = require("../../../constants");

describe("get ad by id", () => {
  let controller;
  let mockQueryHandler;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", ["getAdById"]);

    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    mockRequest = httpMock.createRequest({
      method: "GET",
      params: {
        id: "someId"
      }
    });

    controller = adsController(mockQueryHandler, null);
  });

  it("should return 404 when ad does not exist", done => {
    // arrange
    mockQueryHandler.getAdById.and.callFake(id => {
      return Promise.resolve({});
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.AD_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getAdById(mockRequest, mockResponse, null);
  });

  it("should return error 500 on server error", done => {
    mockQueryHandler.getAdById.and.callFake(() => {
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
    controller.getAdById(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getAdById.and.callFake(id => {
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
        ad: {
          id: "someId",
          latitude: "5",
          longitude: "10"
        }
      });
      done();
    });

    // act
    controller.getAdById(mockRequest, mockResponse, null);
  });
});
