const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

module.exports = {
  findSingleKeyByPattern(pattern, cursor) {
    if (typeof cursor === "undefined") {
      cursor = 0;
    }
    // console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", pattern).then(results => {
        // update the cursor
        cursor = results[0];
        // the key has been found!
        if (results[1].length > 0) {
          console.log("[UTILITIES] Key found", results[1]);
          return results[1];
        }
        // entire scan completed but key not found
        else if (cursor === 0 || cursor === "0") {
          console.log("[UTILITIES] Key not found");
          return null;
        } else {
          return this.findSingleKeyByPattern(pattern, cursor);
        }
      })
    );
  },

  findMultiKeyByPattern(pattern, cursor, keys) {
    let keyList = [];
    if (typeof cursor === "undefined") {
      cursor = 0;
    } else {
      keyList = keys;
    }
    // console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", pattern).then(results => {
        // update the cursor
        cursor = results[0];
        // a key has been found!
        if (results[1].length > 0) {
          // console.log("[UTILITIES] Key(s) found", results[1]);
          results[1].forEach(key => {
            keyList.push(key);
          });
        } // entire scan completed
        if (cursor === 0 || cursor === "0") {
          console.log(`[UTILITIES] Key(s) found matching ${pattern}`, keyList);
          return keyList;
        } else {
          // look for the key again
          return this.findMultiKeyByPattern(pattern, cursor, keyList);
        }
      })
    );
  },

  findAdQueryKey(id, cursor) {
    if (typeof cursor === "undefined") {
      cursor = 0;
    }
    console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", `ad:*:${id}`).then(results => {
        // update the cursor
        cursor = results[0];
        // the key has been found!
        if (results[1].length > 0) {
          console.log("[UTILITIES] Key found", results[1]);
          return results[1];
        }
        // entire scan completed but key not found
        else if (cursor === 0 || cursor === "0") {
          console.log("[UTILITIES] Key not found");
          return null;
        } else {
          return this.findAdQueryKey(id, cursor);
        }
      })
    );
  },

  findReportQueryKey(id, cursor) {
    if (typeof cursor === "undefined") {
      cursor = 0;
    }
    console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", `report:*:${id}`).then(results => {
        // update the cursor
        cursor = results[0];
        // the key has been found!
        if (results[1].length > 0) {
          console.log("[UTILITIES] Key found", results[1]);
          return results[1];
        }
        // entire scan completed but key not found
        else if (cursor === 0 || cursor === "0") {
          console.log("[UTILITIES] Key not found");
          return null;
        } else {
          // look for the key again
          return this.findReportQueryKey(id, cursor);
        }
      })
    );
  },

  findReportUserKey(id, cursor, keys) {
    let keyList = [];
    if (typeof cursor === "undefined") {
      cursor = 0;
    } else {
      keyList = keys;
    }
    console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", `report:${id}:*`).then(results => {
        // update the cursor
        cursor = results[0];
        // a key has been found!
        if (results[1].length > 0) {
          // console.log("[UTILITIES] Key(s) found", results[1]);
          results[1].forEach(key => {
            keyList.push(key);
          });
        } // entire scan completed
        if (cursor === 0 || cursor === "0") {
          console.log(
            `[UTILITIES] Key(s) found matching report:${id}:*`,
            keyList
          );
          return keyList;
        } else {
          // look for the key again
          return this.findReportUserKey(id, cursor, keyList);
        }
      })
    );
  },

  findAdUserKey(id, cursor, keys) {
    let keyList = [];
    if (typeof cursor === "undefined") {
      cursor = 0;
    } else {
      keyList = keys;
    }
    console.log("[UTILITIES] Current cursor:", cursor);
    return Promise.resolve(
      redis.scan(cursor, "match", `ad:${id}:*`).then(results => {
        // update the cursor
        cursor = results[0];
        // a key has been found!
        if (results[1].length > 0) {
          // console.log("[UTILITIES] Key(s) found", results[1]);
          results[1].forEach(key => {
            keyList.push(key);
          });
        } // entire scan completed
        if (cursor === 0 || cursor === "0") {
          console.log(`[UTILITIES] Key(s) found matching ad:${id}:*`, keyList);
          return keyList;
        } else {
          // look for the key again
          return this.findAdUserKey(id, cursor, keyList);
        }
      })
    );
  }
};
