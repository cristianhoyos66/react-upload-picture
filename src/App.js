import React, {Component} from 'react';
import firebase from 'firebase';

import './App.css';
import FileUpload from './FileUpload';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      pictures: []
    };

    this.handleAuth = this
      .handleAuth
      .bind(this);
    this.handleUpload = this
      .handleUpload
      .bind(this);
  }

  componentWillMount() {
    firebase
      .auth()
      .onAuthStateChanged(user => {
        this.setState({user});
      });

    firebase
      .database()
      .ref('pictures')
      .on('child_added', snapshot => {
        this.setState({
          pictures: this
            .state
            .pictures
            .concat(snapshot.val())
        });
      });
  }

  handleAuth() {
    const provider = new firebase
      .auth
      .GoogleAuthProvider();

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => console.log(`${result.user.email} ha iniciado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleLogout() {
    firebase
      .auth()
      .signOut()
      .then(result => console.log(`${result.user.email} ha iniciado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleUpload(event) {
    const file = event.target.files[0];
    const storageRef = firebase
      .storage()
      .ref(`Fotos/${file.name}`);
    const task = storageRef.put(file);

    task.on('state_changed', snapshot => {
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({uploadValue: percentage})
    }, error => {
      console.error(error.message);
    }, () => {
      const record = {
        photoURL: this.state.user.photoURL,
        displayName: this.state.user.displayName,
        image: task.snapshot.downloadURL
      }
      const dbRef = firebase
        .database()
        .ref('pictures');
      const newPicture = dbRef.push();
      newPicture.set(record);
    });
  }

  renderLoginButton() {
    if (!this.state.user) {
      return (
        <button onClick={this.handleAuth} className="App-btn">
          Iniciar sesión con Google
        </button>
      );
    } else {
      return (
        <div className="App-intro">
          <p className="App-intro">¡Hola, {this.state.user.displayName}!</p>

          <button onClick={this.handleLogout} className="App-btn">
            Salir
          </button>

          <FileUpload uploadValue={this.state.uploadValue} onUpload={this.handleUpload}/> {this
            .state
            .pictures
            .map(picture => (
              <div className="App-card">
                <figure className="App-card-image">
                  <img width="320" src={picture.image} alt="..."/>
                  <figCaption className="App-card-footer">
                    <img
                      className="App-card-avatar"
                      src={picture.photoURL}
                      alt={picture.displayName}/>
                    <span className="App-card-name">{picture.displayName}</span>
                  </figCaption>
                </figure>
              </div>
            ))
            .reverse()
}

        </div>

      );
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src="https://firebasestorage.googleapis.com/v0/b/pseudogram-4d9b7.appspot.com/o/Fotos%2Fupload.png?alt=media&token=a0a875dd-f481-464e-8a83-973aa0b687be" className="App-logo" alt="logo"/>
          <h2>Upload your picture now</h2>
        </div>
        {this.renderLoginButton()}
      </div>
    );
  }
}

export default App;