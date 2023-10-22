# simple-rss-watcher
simple-rss-watcher is a rss watcher based on <a href="https://github.com/yayudev/feed-watcher#readme" target="_blank">datyayu's improved rss-watcher</a>, which fixes constant 504 returns and (slightly) optimizes the 8+ year old code.  
If you need help or want to suggest something, you can join [my Discord server](https://discord.gg/MYuWuQq49H).

## Installation
You can install simple-rss-watcher by using:
```
  npm install simple-rss-watcher --save
```

## Usage
A basic watcher can be created using:
```js
  var Watcher  = require('simple-rss-watcher'),
  var rssUrl   = 'http://lorem-rss.herokuapp.com/feed?unit=second&interval=5'

  // if no interval is passed, 60s will be set as the default interval
  // but you MUST pass 'feedUrl' or you'll get an error
  var watcher = new Watcher({ feedUrl: rssUrl, interval: 10 })

  // This will emit if the script finds new itmes at your interval time
  watcher.on('new entries', (entries) => {
    entries.forEach((entry) => {
      console.log(entry.title)
    })
  })

  // Start watching the feed.
  watcher.start().then((entries) => {
    // do something
    console.log(entries)
  })
  .catch((error) => {
    console.error(error)
  })

  // Stop watching the feed.
  watcher.stop()

  // This will emit a "stop" event
  watcher.on('stop', () => {
    console.log('Watcher stopped!')
  })
```

### Options
If you want to change the watcher config after creating it, you can use watcher.config():
```js
  watcher.config({ feedUrl: feed, interval: 60 })
```

### Events
Watcher exposes 3 events: 'new entries', 'stop' and 'error'.
```js
  // Returns an array of entry objects founded since last check
  watcher.on('new entries', (entries) => {
    console.log(entries)
  })

  // Emitted when watcher.stop() is called
  watcher.on('stop', () => {
    console.log('stopped')
  })

  // Emitted when an error happens while checking feed
  watcher.on('error', (error) => {
    console.error(error)
  })
```

## Changes from datyayu's script
I really didn't spend much time on this, but here's all the small changes I made:
* Switched from `parse-rss` to `rss-parser` (fixes 504 returns)
* Removed some useless functions
* The Watcher constructer takes an Object instead of 2 values
* Will error out if a non-number is passed for an interval
* The request (entries fetching) function is now nested in the constructor
* Some minor (non-breaking) typos were fixed