# Friendly Frame

### Usage in child frame

#### XFrame detection

```js
import { isXFrame } from "friendly-frame";

isXFrame(); // #=> true
```

To test if a window is used in an iFrame, pass a queryStringParameter (default is `xframe=1`) from the parent.

#### History syncing

```js
import { initialize } from "friendly-frame";

const history = FriendlyFrame.initialize({
  initializeFromQueryStringParameter: true // Defaults to `initialPath`
});
```
