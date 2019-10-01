const request = require("supertest");
const app = require("../../app");
const CONSTANTS = require("../../constants");

const DEFAULT_TIMEOUT = 500;
/**
 *  Add a user
 */
describe("POST /users/new", () => {
  it("should add new user to db", done => {
    let data = {
      name: "jotaro",
      email: "oraoraxinf@gmail.com",
      role: 0,
      password: "0RAoR4",
      confirmPassword: "0RAoR4"
    };
    request(app)
      .post("/users/new")
      .send(data)
      .set("Accept", "application/json")
      .expect(200)
      .then(res => {
        expect(res.body.msg).toEqual(CONSTANTS.SUCCESS.DEFAULT_SUCCESS);
        return res.body.data;
      })
      .then(payload => {
        // TODO - Think another solution without using timeout
        setTimeout(() => {
          request(app)
            .get(`/users/${payload.id}`)
            .set("Accept", "application/json")
            .then(res => {
              expect(res.statusCode).toEqual(200);
              expect(res.body.user.name).toEqual("jotaro");
              done();
            });
        }, DEFAULT_TIMEOUT);
      });
  });
});
