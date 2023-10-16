const { EventEmitter } = require('events');
const Parser = require('rss-parser');
const prs = new Parser();

class Watcher extends EventEmitter {
  constructor(options) {
    super();

    if (!options.feedUrl || typeof options.feedUrl !== 'string') {
      throw new Error('feedUrl is not defined!');
    }

    if (options?.interval && !parseInt(options?.interval)) {
      throw new Error('interval must be a number!');
    }

    this.feedUrl = options.feedUrl;
    this.interval = options?.interval || 60;  // 1 minute by default.
    this.lastEntryDate = null; // Used to make sure if there is new entries.
    this.lastEntryTitle = null; // Used to avoid duplicates.
    this.timer = null; // Stores watcher function.
  }

  request(feedUrl = this.feedUrl) {
    return new Promise(async (resolve, reject) => {
      var feed = await prs.parseURL(feedUrl);
      if (feed.items.length == 0) return reject(new Error('No entries were found, check your url'));
      feed.items.sort((ent1, ent2) => ((new Date(ent2.pubDate) / 1000) - (new Date(ent1.pubDate) / 1000)));
      resolve(feed.items);
    });
  }

  // Check all entries on the feed.
  // checkAll() {
  //   return request(this.feedUrl);
  // }
  // No idea why this was used instead of nesting 'request' and calling that

  // Set up the watcher.
  config(cfg) {
    this.feedUrl = cfg?.feedUrl || this.feedUrl;
    this.interval = cfg?.interval || this.interval;
  }

  // Start watching.
  start() {
    return new Promise((resolve, reject) => {
      this.request()
        .then((entries) => {
          this.lastEntryDate = new Date(entries[0].pubDate) / 1000;
          this.lastEntryTitle = entries[0].title;
          this.timer = this.watch();
          resolve(entries);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Stop watching.
  stop() {
    clearInterval(this.timer);
    this.emit('stop');
  }

  // Check the feed.
  watch() {
    const fetch = () => {
      this.request()
        .then((entries) => {
          // Filter older entries.
          const newEntries = entries.filter((entry) => {
            return (this.lastEntryDate === null || this.lastEntryDate < (new Date(entry.pubDate) / 1000));
          });

          // Update last entry.
          // It uses newEntries[0] because they are ordered from newer to older.
          if (newEntries.length > 0) {
            this.lastEntryDate = new Date(newEntries[0].pubDate) / 1000;
            this.lastEntryTitle = newEntries[0].title;
            this.emit('new entries', newEntries);
          }
        })
        .catch(error => this.emit('error', error));
    };

    // Keep checking every n minutes.
    // It returns the timer so it can be cleared after.
    return setInterval(() => {
      fetch();
    }, this.interval * 1000);
  }
}

module.exports = Watcher;