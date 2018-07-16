import React from "react";
import ReactDOM from "react-dom";

import Postmate from "postmate";

export default class FriendlyFrame extends React.Component {
  // static propTypes = {
  //   location,
  //   onChangeLocation
  // }

  static defaultProps = {
    onChangeLocation: () => {}
  };

  // static getDerivedStateFromProps(props) {

  //   return {
  //     location:
  //   }
  // }

  getUrl = () => {
    const {
      location: { pathname, search, hash }
    } = this.props;

    const url = [pathname, search, hash].filter(x => !!x).join("");

    return url;
  };

  componentDidMount() {
    const { onChangeLocation } = this.props;

    const url = this.getUrl();

    // Kick off the handshake with the iFrame
    const handshake = new Postmate({
      container: this.container, // Element to inject frame into
      url // Page to load, must have postmate.js. This will also be the origin used for communication.
    });

    // When parent <-> child handshake is complete, data may be requested from the child
    handshake.then(child => {
      console.log("parent handshake ok");

      this.child = child;

      // Listen to a particular event from the child
      this.child.on("location", location => {
        onChangeLocation(location);
      });
    });
  }

  componentDidUpdate(prevProps) {
    console.log(prevProps.location, "?", this.props.location);

    if (this.child && prevProps.location !== this.props.location) {
      console.log("updating iframe location");

      this.child.call("push", this.props.location);
    }
  }

  render() {
    return (
      <div
        ref={ref => {
          this.container = ref;
        }}
      />
    );
  }
}
