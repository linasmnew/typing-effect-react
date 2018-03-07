import React, { Component } from "react";

let lastTime = performance.now();

const myCSS = `
@keyframes typing-effect-react {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes typing-effect-react {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes typing-effect-react {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-ms-keyframes typing-effect-react {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-o-keyframes typing-effect-react {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}`;

class TypeEffect extends Component {
  state = {
    output: ""
  };
  index = 0;
  rafRef = null;
  timeoutRef = null;

  componentWillMount() {
    const exists = document.head.querySelectorAll("[data-typing-effect-react]");

    if (!exists.length) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-typing-effect-react", "true");
      document.head.appendChild(styleElement);
      styleElement.textContent = myCSS;
    }
  }

  componentDidMount() {
    // kick the animation off
    this.animationManager();
  }

  componentWillUnmount() {
    // cleanup
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    if (this.rafRef) cancelAnimationFrame(this.rafRef);
  }

  animationManager = () => {
    // register the very first rAF which will start the animation off
    this.rafRef = requestAnimationFrame(time => {
      // start the typing animation to animate the currently indexed word
      this.typeEffect(time, this.props.data[this.index], () => {
        // typing animation finished, time to start removal animation
        // but first make a pause
        this.timeoutRef = setTimeout(() => {
          this.rafRef = requestAnimationFrame(time => {
            this.deleteEffect(time, () => {
              // removal animation finished, which completes the current animation cycle...
              // so make a pause here & start the next animation cycle
              this.timeoutRef = setTimeout(() => {
                // if on last element, then go back to the first one, else go to the next one
                this.index =
                  this.index === this.props.data.length - 1
                    ? 0
                    : this.index + 1;
                // start again...
                this.animationManager();
              }, this.props.pauseBeforeRestarting);
            });
          });
        }, this.props.pauseBeforeDeleting);
      });
    });
  };

  typeEffect = (time, text, callback) => {
    // skip animation if the desired number of ms haven't elapsed
    if (time - lastTime < this.props.typingSpeed) {
      this.rafRef = requestAnimationFrame(time => {
        this.typeEffect(time, text, callback);
      });
      return;
    }
    lastTime = time;
    // add the next character to output
    this.setState({
      output: text.substr(0, this.state.output.length + 1)
    });
    // if more characters left to type out,
    // then register a call to yourself again to take care of the next character, and so on...
    if (this.state.output.length < text.length) {
      this.rafRef = requestAnimationFrame(time => {
        this.typeEffect(time, text, callback);
      });
    } else {
      // if no characters left to type, i.e. all been typed out
      // then let the caller know
      callback();
    }
  };

  deleteEffect = (time, callback) => {
    // skip animation if the desired number of ms haven't elapsed
    if (time - lastTime < this.props.typingSpeed) {
      this.rafRef = requestAnimationFrame(time => {
        this.deleteEffect(time, callback);
      });
      return;
    }
    lastTime = time;
    // remove the next character from output
    this.setState({
      output: this.state.output.substr(0, this.state.output.length - 1)
    });
    // if more characters left to delete,
    // then register a call to yourself again to take care of the next character, and so on...
    if (this.state.output.length !== 0) {
      this.rafRef = requestAnimationFrame(time => {
        this.deleteEffect(time, callback);
      });
    } else {
      // if no characters left to delete, i.e. all been deleted
      // then let the caller know
      callback();
    }
  };

  render() {
    const blinkingStyles = {
      WebkitAnimation: "1s typing-effect-react step-end infinite",
      MozAnimation: "1s typing-effect-react step-end infinite",
      MsAnimation: "1s typing-effect-react step-end infinite",
      OAnimation: "1s typing-effect-react step-end infinite",
      animation: "1s typing-effect-react step-end infinite"
    };

    return (
      <span className={this.props.className} style={this.props.style}>
        {this.state.output}
        <span style={blinkingStyles}>|</span>
      </span>
    );
  }
}

TypeEffect.defaultProps = {
  typingSpeed: 48, // frame delay period between each character, ~20 frames per second, so around ~20 characters per second
  deletingSpeed: 48, // frame delay period between each character, ~20 frames per second, so around ~20 characters per second
  pauseBeforeRestarting: 1000,
  pauseBeforeDeleting: 1500,
  data: [],
  style: {},
  className: null
};

export default TypeEffect;
