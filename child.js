import Postmate from "postmate";
import createHistory from "history/createBrowserHistory";
import { createPath } from "history";

const history = createHistory();

let lock = false;

function callWithLock(f) {
  lock = true;
  f();
  lock = false;
}

function isLocked() {
  return lock;
}

const root = document.createElement("div");

document.body.appendChild(root);

const handshake = new Postmate.Model({
  // Expose your model to the Parent. Property values may be functions, promises, or regular values
  height: () => document.height || document.body.offsetHeight,
  push: location => {
    console.log("child push", location);
    callWithLock(() => {
      const path = createPath(location);
      history.push();
      root.textContent = path;
    });
  }
});

// When parent <-> child handshake is complete, events may be emitted to the parent
handshake.then(parent => {
  console.log("child handshake ok");

  // Listen for changes to the current location.
  const unlisten = history.listen((location, action) => {
    // location is an object like window.location
    console.log(action, location.pathname, location.state);

    if (!isLocked()) {
      console.log("emit location");
      parent.emit("location", location);
    }
  });
});
