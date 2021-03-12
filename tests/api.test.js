const app = require("../app");
const supertest = require("supertest");

test("GET /users", () => {
  supertest(app)
    .get("/users")
    .expect(200)
    .then((response) => {
      expect(response.body.status).toBe("success");
    });
});

test("should test registering a user", () => {
  const user = {
    name: "joel",
    group: "muk",
    loan: 100000,
    id: 2,
  };
  supertest(app)
    .post("/add-user")
    .send(user)
    .expect(200)
    .then((response) => {
      expect(response.body.message)
        .toBe("user added successfully")
        .end(function (err, res) {
          if (err) return done(err);
          return done();
        });
    });
});

test("should test submitting payment", () => {
  const user = {
    name: "joel",
    group: "muk",
    loan: 100000,
    id: 2,
  };
  const response = supertest(app).post("/add-user").send(user);
  const res = supertest(app)
    .post("/submit-payment")
    .send(user)
    .then((res) => {
      expect(res.body).toBe(user);
    });
});
