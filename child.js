import Postmate from "postmate";
import createHistory from "history/createBrowserHistory";
import { createPath } from "history";

let lock = false;

function callWithLock(f) {
  lock = true;
  f();
  lock = false;
}

function isLocked() {
  return lock;
}

export function initialize(rawOptions) {
  const options = {
    debugLevel: "verbose",
    history: undefined,
    ...rawOptions
  };

  const { debugLevel } = options;

  log("verbose", () => {
    console.log("Child: Options", options);
  });

  function log(level, f) {
    if (debugLevel !== level) return;

    f();
  }

  const history = options.history || createHistory();

  const handshake = new Postmate.Model({
    push: location => {
      callWithLock(() => {
        const path = createPath(location);
        history.push(location);

        log("verbose", () => {
          console.log("Child: Pushed location", location);
        });
      });
    }
  });

  handshake.then(parent => {
    log("verbose", () => {
      console.log("Child: Handshake complete");
    });

    const unlisten = history.listen((location, action) => {
      if (!isLocked()) {
        log("verbose", () => {
          console.log("Child: Emit location", location);
        });

        parent.emit("location", location);
      }
    });
  });
}
