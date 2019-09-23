const async = require("async");

function writeRepository(eventStoreHelper, aggregateHelper) {
  const WriteRepo = {
    queue: async.queue(function(task, callback) {
      WriteRepo.saveEvent(task.event).then(offset => {
        callback(offset);
      });
    }),

    enqueueEvent(event, callback) {
      return Promise.resolve(
        this.queue.push({ event: event }, function(offset) {
          console.log("[WRITE REPOSITORY] Saved to event store");
          callback(offset);
        })
      );
    },

    saveEvent(event) {
      let aggregateName = event.aggregateName;
      let aggregateID = event.aggregateID;
      let offset;
      // Get last offset from event store
      return eventStoreHelper
        .getLastOffset(aggregateName, aggregateID)
        .then(lastOffset => {
          offset = lastOffset;
          // save to eventstore
          return eventStoreHelper.addEvent(
            aggregateName,
            aggregateID,
            offset,
            event
          );
        })
        .then(() => {
          // save snapshot after 50 offsets
          if ((offset + 1) % 50 === 0) {
            aggregateHelper
              .getCurrentState(aggregateName, aggregateID)
              .then(aggregate => {
                eventStoreHelper.addSnapshot(
                  aggregateName,
                  aggregateID,
                  aggregate,
                  offset
                );
              });
          }
        })
        .then(() => {
          return offset;
        });
    }
  };
  return WriteRepo;
}

module.exports = writeRepository;
