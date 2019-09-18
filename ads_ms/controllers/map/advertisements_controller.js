const queryHandler = require("../../db/sql/map/advertisements.repository");
const CommonCommandHandler = require("../../cqrs/commands/base/common.command.handler");
const CONSTANTS = require("../../constants");
const shortid = require("shortid");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const finder = require("../../utilities").keys;

const Handler = {
  //
  //  Query responsibility
  //

  // Get all ads
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
    finder
      .findSingleKeyByPattern(`AMS:ad:*:${req.params.id}`)
      .then(key => {
        return redis.hgetall(key);
      })
      .then(result => {
        if (!result)
          return res.status(400).json({ msg: CONSTANTS.ERRORS.AD_NOT_EXISTS });
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
        // console.log(results);
        return res.json({ ads: results });
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
    finder
      .findSingleKeyByPattern(`AMS:ad:*:${req.params.id}`)
      .then(key => {
        return redis.hgetall(key);
      })
      .then(ad => {
        if (ad) {
          if (ad.photoPath) return res.sendFile(ad.photoPath, options);
          else return res.json({ msg: CONSTANTS.ERRORS.FILE_NOT_FOUND });
        } else
          return res.status(400).json({ msg: CONSTANTS.ERRORS.AD_NOT_EXISTS });
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
        console.log(e);
        return res.status(400).json({ err: e });
      });
  }
};

module.exports = Handler;
