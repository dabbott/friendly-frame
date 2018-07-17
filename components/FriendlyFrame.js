import React from "react";
import ReactDOM from "react-dom";
import { createPath } from "history";
import Postmate from "postmate";
import PropTypes from "prop-types";

export default class FriendlyFrame extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string,
      search: PropTypes.string,
      hash: PropTypes.string
    }).isRequired,
    onChangeLocation: PropTypes.func,
    debugLevel: PropTypes.oneOf(["none", "verbose"])
  };

  static defaultProps = {
    onChangeLocation: () => {},
    debugLevel: "none"
  };

  /**
   * Get the child iframe
   */
  getChild() {
    return this.child;
  }

  /**
   * Get the container element
   */
  getContainerElement() {
    return this.container;
  }

  log(level, f) {
    const { debugLevel } = this.props;

    if (debugLevel !== level) return;

    f();
  }

  componentDidMount() {
    const { location, onChangeLocation, debugLevel } = this.props;

    const url = createPath(location);

    const handshake = new Postmate({ container: this.container, url });

    handshake.then(child => {
      this.log("verbose", () => {
        console.log("Parent: Handshake complete");
      });

      this.child = child;

      // Listen to a particular event from the child
      this.child.on("location", location => {
        this.log("verbose", () => {
          console.log("Parent: Child changed its location", location);
        });

        onChangeLocation(location);
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.child && prevProps.location !== this.props.location) {
      this.log("verbose", () => {
        console.log(
          "Parent: Telling child to update its location",
          this.props.location
        );
      });

      this.child.call("push", this.props.location);
    }
  }

  componentWillUnmount() {
    if (this.child) {
      this.log("verbose", () => {
        console.log("Parent: Destroying child iframe", this.props.location);
      });

      this.child.destroy();
    }
  }

  render() {
    const { location, onChangeLocation, debugLevel, ...rest } = this.props;

    return (
      <div
        ref={ref => {
          this.container = ref;
        }}
        {...rest}
      />
    );
  }
}
