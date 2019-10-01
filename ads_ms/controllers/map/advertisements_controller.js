const CONSTANTS = require("../../constants");
const shortid = require("shortid");

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    //
    //  Query responsibility
    //

    // Get all ads (deprecated)
    getAllAds(req, res, next) {
      queryHandler
        .getAds()
        .then(results => {
          return res.json({ ads: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get ad by ad id
    getAdById(req, res, next) {
      // scan to get keys
      queryHandler
        .getAdById(req.params.id)
        .then(result => {
          if (!result.id)
            return res
              .status(404)
              .json({ msg: CONSTANTS.ERRORS.AD_NOT_EXISTS });
          return res.json({ ad: result });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get all ads enclosed in an area (tright = northeast)
    getAdsByRange(req, res, next) {
      let right = req.query.tright.split(",")[1];
      let left = req.query.bleft.split(",")[1];
      let top = req.query.tright.split(",")[0];
      let bottom = req.query.bleft.split(",")[0];
      queryHandler
        .getAdsByBorder(left, right, bottom, top)
        .then(results => {
          if (results.length === 0)
            return res.status(200).json({ ads: results });
          else return res.json({ ads: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get all ads enclosed in an area (tright = northeast)
    getAdsByRangeExplain(req, res, next) {
      let right = req.query.tright.split(",")[1];
      let left = req.query.bleft.split(",")[1];
      let top = req.query.tright.split(",")[0];
      let bottom = req.query.bleft.split(",")[0];
      queryHandler
        .getAdsByBorderExplain(left, right, bottom, top)
        .then(results => {
          // console.log(results);
          return res.json({ ads: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get profile picture of an ad
    getImage(req, res, next) {
      let options = {
        root: "/usr/src/app/"
      };
      // scan to get keys
      return queryHandler
        .getAdById(req.params.id)
        .then(ad => {
          if (ad.id) {
            if (ad.photoPath) return res.sendFile(ad.photoPath, options);
            else
              return res
                .status(200)
                .json({ msg: CONSTANTS.ERRORS.FILE_NOT_FOUND });
          } else
            return res
              .status(404)
              .json({ msg: CONSTANTS.ERRORS.AD_NOT_EXISTS });
        })
        .catch(e => {
          return res
            .status(500)
            .json({ msg: CONSTANTS.ERRORS.DEFAULT_SERVER_ERROR, err: e });
        });
    },

    //
    //  Commands responsibility section
    //

    // Add an ad (only for users with role >= 1)
    createAd(req, res, next) {
      let payload = {
        id: shortid.generate(),
        userId: req.body.userId,
        userName: req.body.userName,
        caption: req.body.caption,
        latitude: req.body.latitude.toString(),
        longitude: req.body.longitude.toString(),
        location: req.body.location,
        file: req.file
      };

      payload.aggregateID = payload.id;

      // commandHandler
      //   .adCreated(req.body, req.file)
      CommonCommandHandler.sendCommand(payload, CONSTANTS.COMMANDS.CREATE_AD)
        .then(result => {
          if (result)
            return res.json({
              msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
              data: result
            });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 401;
          else if (e.includes(CONSTANTS.ERRORS.USER_NOT_PERMITTED))
            status = 403;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    }
  };
  return Handler;
};

module.exports = controller;
