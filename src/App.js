import React, { Component } from "react";
import "./App.css";
import { Navigation } from "./components/Navigation/Navigation";
import { Logo } from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import { ImageLinkForm } from "./components/ImageLinkForm/ImageLinkForm";
import { FaceRecognition } from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Particles from "react-particles-js";
// import Clarifai from "clarifai";

const Fragment = React.Fragment;
const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: false,
        value_area: 0
      }
    }
  }
};
/*
const particlesOptions = {
  particles: {
    number: {
      value: 100
    },
    size: {
      value: 5
    },
    line_linked: {
      shadow: {
        enable: true,
        color: "yellow",
        blur: 2
      }
    }
  },
  move: {
    speed: 50
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      }
    }
  }
};
*/
const initialState = {
  userInput: "",
  imageUrl: "",
  faceBox: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    this.setState({ imageUrl: "http://faces-unplugged.com/img/photo/008.jpg" });
    // this.setState({ imageUrl: "./assets/default_face.jpg" });
    // fetch("http://localhost:3000/").then(response =>
    //   response.json().then(data => console.log(data))
    // );
  }

  addUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  calcFaceLocation = responseData => {
    const clarifaiFace =
      responseData.outputs[0].data.regions[0].region_info.bounding_box;
    console.log(clarifaiFace);
    const image = document.getElementById("inputImage");
    const imageWidth = Number(image.width);
    const imageHeight = Number(image.height);
    console.log(imageWidth, imageHeight);
    return {
      leftCol: clarifaiFace.left_col * imageWidth,
      topRow: clarifaiFace.top_row * imageHeight,
      rightCol: imageWidth - clarifaiFace.right_col * imageWidth,
      bottomRow: imageHeight - clarifaiFace.bottom_row * imageHeight
    };
  };

  displayFaceBox = boxData => {
    console.log(boxData);
    this.setState({ faceBox: boxData });
  };

  onInputChange = e => {
    console.log(e.target.value);
    this.setState({ userInput: e.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.userInput });
    fetch("https://rocky-falls-33914.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.userInput
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch("https://rocky-falls-33914.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);
        }
        this.displayFaceBox(this.calcFaceLocation(response));
      })
      .catch(err => console.log(err));
  };

  onRouteChange = route => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    return (
      <Fragment>
        <div className="App">
          <Particles className="particles" params={particlesOptions} />
          <Navigation
            isSignedIn={this.state.isSignedIn}
            onRouteChange={this.onRouteChange}
          />
          {this.state.route === "home" ? (
            <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition
                faceBox={this.state.faceBox}
                imageUrl={this.state.imageUrl}
              />
            </div>
          ) : this.state.route === "signin" ? (
            <SignIn addUser={this.addUser} onRouteChange={this.onRouteChange} />
          ) : (
            <Register
              addUser={this.addUser}
              onRouteChange={this.onRouteChange}
            />
          )}
        </div>
      </Fragment>
    );
  }
}

export default App;
