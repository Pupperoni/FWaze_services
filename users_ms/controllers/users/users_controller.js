const CONSTANTS = require("../../constants");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");

//
// Query responsibility
//

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    // Get all user info
    getAllUsers(req, res, next) {
      queryHandler
        .getAllUsers()
        .then(results => {
          if (results.length == 0)
            return res
              .status(400)
              .json({ msg: CONSTANTS.ERRORS.USER_NOT_EXISTS });
          return res.json({ users: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get user by user id
    getUserById(req, res, next) {
      queryHandler
        .getUserById(req.params.id)
        .then(result => {
          if (!result)
            return res
              .status(400)
              .json({ msg: CONSTANTS.ERRORS.USER_NOT_EXISTS });
          // Convert string role to int
          result.role = parseInt(result.role);

          // Get home address haha
          queryHandler.getUserHome(req.params.id).then(home => {
            if (home) result.home = home;
            // Then get work address
            queryHandler.getUserWork(req.params.id).then(work => {
              if (work) result.work = work;
              return res.json({ user: result });
            });
          });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get profile picture of a user
    getImage(req, res, next) {
      let options = {
        root: "/usr/src/app/"
      };
      queryHandler
        .getUserById(req.params.id)
        .then(user => {
          if (user) {
            if (user.avatarPath) return res.sendFile(user.avatarPath, options);
            else return res.json({ msg: CONSTANTS.ERRORS.FILE_NOT_FOUND });
          } else
            return res
              .status(400)
              .json({ msg: CONSTANTS.ERRORS.USER_NOT_EXISTS });
        })
        .catch(e => {
          return res
            .status(500)
            .json({ msg: CONSTANTS.ERRORS.DEFAULT_SERVER_ERROR, err: e });
        });
    },

    // Add a new fave route
    getFaveRoutes(req, res, next) {
      queryHandler.getUserById(req.params.id).then(user => {
        if (!user)
          return res
            .status(400)
            .json({ msg: CONSTANTS.ERRORS.USER_NOT_EXISTS });
        queryHandler
          .getFaveRoutes(req.params.id)
          .then(results => {
            return res.json({ routes: results });
          })
          .catch(e => {
            return res.status(500).json({ err: e });
          });
      });
    },

    // Log in a user
    loginUser(req, res, next) {
      let name = req.body.name;
      let password = req.body.password;
      let id = null;
      let user = {};

      if (name && password && name !== "" && password !== "") {
        // fields must not be empty
        queryHandler
          .getUserByName(name) // check if user exists
          .then(userId => {
            if (!userId)
              return Promise.reject(CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE);
            id = userId;
            return queryHandler.getUserById(id);
          })
          .then(result => {
            user = result;
            return bcrypt.compare(password, result.password); // check if password is correct
          })
          .then(isMatch => {
            if (isMatch) {
              // Get home address haha
              return queryHandler.getUserHome(id); // get home details
            } else
              return Promise.reject(CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE);
          })
          .then(home => {
            if (home) user.home = home;
            // Then get work address
            return queryHandler.getUserWork(id); // and work details
          })
          .then(work => {
            if (work) user.work = work;
            return res.json({
              msg: CONSTANTS.SUCCESS.LOGIN_SUCCESS,
              user: user
            });
          })
          .catch(e => {
            return res.status(400).json({ err: e });
          });
      } else
        return res
          .status(400)
          .json({ err: CONSTANTS.ERRORS.DEFAULT_LOGIN_FAILURE });
    },

    //
    // Commands responsibility section
    //

    // Add a new user
    createUser(req, res, next) {
      const payload = {
        id: shortid.generate(),
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
      };
      payload.aggregateID = payload.id;
      // validate user details
      queryHandler
        .getUserByName(payload.name) // checks name
        .then(user => {
          if (user) return Promise.reject(CONSTANTS.ERRORS.USERNAME_TAKEN);
          else return queryHandler.getUserByEmail(payload.email); // checks email
        })
        .then(user => {
          if (user.length > 0)
            return Promise.reject(CONSTANTS.ERRORS.EMAIL_TAKEN);
          else return Promise.resolve();
        })
        .then(() => {
          // all good
          CommonCommandHandler.sendCommand(
            payload,
            CONSTANTS.COMMANDS.CREATE_USER
          );
        })
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          return res.status(400).json({ err: e });
        });
    },

    // Edit user details
    updateUser(req, res, next) {
      const payload = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        home: {
          latitude: req.body.homeLatitude,
          longitude: req.body.homeLongitude,
          address: req.body.homeAddress
        },
        work: {
          latitude: req.body.workLatitude,
          longitude: req.body.workLongitude,
          address: req.body.workAddress
        },
        file: req.file
      };
      payload.aggregateID = payload.id;
      // validate user details
      queryHandler
        .getUserByName(payload.name) // checks name
        .then(user => {
          if (user.length > 0 && user[0].id !== payload.id)
            return Promise.reject(CONSTANTS.ERRORS.USERNAME_TAKEN);
          else
            return Promise.resolve(queryHandler.getUserByEmail(payload.email)); // checks email
        })
        .then(user => {
          if (user.length > 0 && user[0].id !== payload.id)
            return Promise.reject(CONSTANTS.ERRORS.EMAIL_TAKEN);
          else return Promise.resolve(true);
        })
        .then(() => {
          // commandHandler.userUpdated(req.body, req.file);
          CommonCommandHandler.sendCommand(
            payload,
            CONSTANTS.COMMANDS.UPDATE_USER
          );
        })
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          return res.status(400).json({ err: e });
        });
    },

    // Add a new fave route
    createFaveRoute(req, res, next) {
      const payload = {
        routeId: shortid.generate(),
        routeName: req.body.routeName,
        sourceLatitude: req.body.sourceLatitude,
        sourceLongitude: req.body.sourceLongitude,
        destinationLatitude: req.body.destinationLatitude,
        destinationLongitude: req.body.destinationLongitude,
        sourceString: req.body.sourceString,
        destinationString: req.body.destinationString,
        id: req.body.userId
      };
      payload.aggregateID = payload.id;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.CREATE_USER_ROUTE
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          return res.status(400).json({ err: e });
        });
    },

    // Delete a fave route
    deleteFaveRoute(req, res, next) {
      const payload = {
        routeId: req.body.routeId,
        userId: req.body.userId
      };
      payload.aggregateID = payload.userId;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.DELETE_USER_ROUTE
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          console.log(e);
          return res.status(400).json({ err: e });
        });
    }
  };
  return Handler;
};
module.exports = controller;
