const httpMock = require("node-mocks-http");
const routeHistoryController = require("../../../controllers/users/route_history_controller");

describe("get user route history", () => {
  let controller;
  let mockQueryHandler;
  let mockResponse;
  let mockRequest;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getRouteHistoryByUserId"
    ]);
    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });
    mockRequest = httpMock.createRequest({
      params: { id: "someUser" }
    });
    controller = routeHistoryController(mockQueryHandler, null);
  });

  it("should return error 500 upon server error", done => {
    mockQueryHandler.getRouteHistoryByUserId.and.callFake(() => {
      return Promise.reject();
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      done();
    });

    // act
    controller.getRouteHistoryByUserId(mockRequest, mockResponse, null);
  });

  it("should return error 500 upon server error", done => {
    mockQueryHandler.getRouteHistoryByUserId.and.callFake(() => {
      return Promise.reject();
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      done();
    });

    // act
    controller.getRouteHistoryByUserId(mockRequest, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getRouteHistoryByUserId.and.callFake(() => {
      const routeHistory = [
        {
          id: "routeId",
          user_id: "someId",
          sourceAddress: "source",
          sourcePosition: {
            y: 10,
            x: 5
          },
          destinationAddress: "destination",
          destinationPosition: {
            y: 5,
            x: 10
          },
          created_at: "9:30pm"
        }
      ];
      return Promise.resolve(routeHistory);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        history: [
          {
            id: "routeId",
            userId: "someId",
            sourceAddress: "source",
            sourcePosition: {
              y: 10,
              x: 5
            },
            destinationAddress: "destination",
            destinationPosition: {
              y: 5,
              x: 10
            },
            timestamp: "9:30pm"
          }
        ]
      });
      done();
    });

    // act
    controller.getRouteHistoryByUserId(mockRequest, mockResponse, null);
  });
});
