const request = require("supertest");
const app = require("../../app");
const CONSTANTS = require("../../constants");

let userId;
let routeHistoryId;
const DEFAULT_TIMEOUT = 500;
/**
 *  Add a user
 */
describe("POST /users/history/", () => {
  beforeAll(done => {
    let data = {
      name: "testRouteHistoryUser",
      email: "testRouteHistory@email.com",
      role: 0,
      password: "somePass",
      confirmPassword: "somePass"
    };
    request(app)
      .post("/users/new")
      .send(data)
      .set("Accept", "application/json")
      .expect(200)
      .then(res => {
        setTimeout(() => {
          userId = res.body.data.id;
          done();
        }, 5 * DEFAULT_TIMEOUT);
      });
  });

  it("should add new route history to db", done => {
    let data = {
      userId: userId,
      source: {
        address: "source",
        latitude: 10,
        longitude: 5
      },
      destination: {
        address: "destination",
        latitude: 20,
        longitude: 10
      },
      timestamp: "2019-10-10 13:20:00"
    };
    request(app)
      .post("/users/history/new")
      .send(data)
      .set("Accept", "application/json")
      .expect(200)
      .then(res => {
        expect(res.body.msg).toEqual(CONSTANTS.SUCCESS.DEFAULT_SUCCESS);
        return res.body.data;
      })
      .then(payload => {
        setTimeout(() => {
          request(app)
            .get(`/users/history/${payload.userId}`)
            .set("Accept", "application/json")
            .then(res => {
              routeHistoryId = res.body.history[0].id;

              expect(res.statusCode).toEqual(200);
              expect(res.body).toEqual({
                history: [
                  {
                    id: jasmine.any(String),
                    userId: userId,
                    sourceAddress: "source",
                    sourcePosition: {
                      y: 10,
                      x: 5
                    },
                    destinationAddress: "destination",
                    destinationPosition: {
                      y: 20,
                      x: 10
                    },
                    timestamp: "2019-10-10T13:20:00.000Z"
                  }
                ]
              });
              done();
            });
        }, DEFAULT_TIMEOUT);
      });
  });

  it("should delete route history from db", done => {
    let data = {
      id: routeHistoryId,
      userId: userId
    };

    request(app)
      .post("/users/history/delete")
      .send(data)
      .set("Accept", "application/json")
      .expect(200)
      .then(res => {
        expect(res.body.msg).toEqual(CONSTANTS.SUCCESS.DEFAULT_SUCCESS);
        return res.body.data;
      })
      .then(payload => {
        setTimeout(() => {
          request(app)
            .get(`/users/history/${payload.userId}`)
            .set("Accept", "application/json")
            .then(res => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toEqual({
                history: []
              });
              done();
            });
        }, DEFAULT_TIMEOUT);
      });
  });
});
