import Postmate from "postmate";
import createHistory from "history/createMemoryHistory";
import { createPath } from "history";
import parser from "query-string-parser";

function getQueryParameter(name) {
  const queryString = window.location.search.slice(1);
  const queryParameters = parser.fromQuery(queryString);
  return queryParameters[name] || null;
}

let lock = false;

function callWithLock(f) {
  lock = true;
  f();
  lock = false;
}

function isLocked() {
  return lock;
}

export function isXFrame(rawOptions) {
  const options = {
    queryStringParameterName: "xframe",
    ...rawOptions
  };

  const { queryStringParameterName } = options;

  return getQueryParameter(queryStringParameterName) === "1";
}

export function getInitialPath(rawOptions) {
  const options = {
    queryStringParameterName: "initialPath",
    ...rawOptions
  };

  const { queryStringParameterName } = options;

  return getQueryParameter(queryStringParameterName) || null;
}

export function initialize(rawOptions) {
  const options = {
    debugLevel: "verbose",
    history: undefined,
    initializeFromQueryStringParameter: false,
    queryStringParameterName: "initialPath",
    ...rawOptions
  };

  const {
    debugLevel,
    initializeFromQueryStringParameter,
    queryStringParameterName
  } = options;

  log("verbose", () => {
    console.log("Child: Options", options);
  });

  function log(level, f) {
    if (debugLevel !== level) return;

    f();
  }

  const history = options.history || createHistory();

  if (initializeFromQueryStringParameter) {
    const initialPath = getInitialPath(options);

    if (initialPath) {
      history.push(decodeURIComponent(initialPath));
    }
  }

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

  return history;
}
