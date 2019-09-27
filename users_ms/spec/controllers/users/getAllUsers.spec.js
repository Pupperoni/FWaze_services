const httpMock = require("node-mocks-http");
const usersController = require("../../../controllers/users/users_controller");
const CONSTANTS = require("../../../constants");

describe("get all users", () => {
  let controller;
  let mockQueryHandler;
  let mockResponse;

  beforeEach(() => {
    mockQueryHandler = jasmine.createSpyObj("mockQueryHandler", [
      "getAllUsers"
    ]);
    mockResponse = httpMock.createResponse({
      eventEmitter: require("events").EventEmitter
    });

    controller = usersController(mockQueryHandler, null);
  });

  it("should return error 404 when no users exist", done => {
    // arrange
    mockQueryHandler.getAllUsers.and.callFake(() => {
      return Promise.resolve([]);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(404);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        msg: CONSTANTS.ERRORS.USER_NOT_EXISTS
      });
      done();
    });

    // act
    controller.getAllUsers(null, mockResponse, null);
  });

  it("should return error 500 upon server error", done => {
    mockQueryHandler.getAllUsers.and.callFake(() => {
      return Promise.reject();
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(500);
      done();
    });

    // act
    controller.getAllUsers(null, mockResponse, null);
  });

  it("should return status 200 with correct message", done => {
    mockQueryHandler.getAllUsers.and.callFake(() => {
      const userList = [
        {
          id: "hYdy@o12",
          name: "user1",
          email: "user1@gmail.com",
          password: "18283"
        },
        {
          id: "8h&hSmZ12",
          name: "user2",
          email: "user2@gmail.com",
          password: "aoj%hsu7@"
        }
      ];
      return Promise.resolve(userList);
    });

    mockResponse.on("end", () => {
      // assert
      expect(mockResponse.statusCode).toEqual(200);
      expect(JSON.parse(mockResponse._getData())).toEqual({
        users: [
          {
            id: "hYdy@o12",
            name: "user1",
            email: "user1@gmail.com",
            password: "18283"
          },
          {
            id: "8h&hSmZ12",
            name: "user2",
            email: "user2@gmail.com",
            password: "aoj%hsu7@"
          }
        ]
      });
      done();
    });

    // act
    controller.getAllUsers(null, mockResponse, null);
  });
});
