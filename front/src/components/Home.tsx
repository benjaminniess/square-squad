import React from 'react';
import Logo from "./Logo";
import Footer from "./Footer";

class Home extends React.Component {
  state = {
    playerName: '',
    playerColor: '',
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState: any = {}
    newState[event.target.name] = event.target.value
    this.setState(newState)
  }

  componentDidMount() {
    const existingPlayerName = localStorage.getItem('playerName')
    const existingPlayerColor = localStorage.getItem('playerColor')
    this.setState({'playerName': existingPlayerName ? existingPlayerName : ''})
    this.setState({'playerColor': existingPlayerColor ? existingPlayerColor : '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)})
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
    const {playerName, playerColor} = this.state

    localStorage.setItem('playerName', playerName)
    localStorage.setItem('playerColor', playerColor)
  }

  render() {
    return (
      <div className="super-wrapper">
        <section className="wrapper">
          <Logo/>

          <form className="sq-form" id="pre-home-form" method="post" action="/">
            <div className="input-field">
              <label htmlFor="playerName">What's your name?</label>
              <input id="playerName" type="text" name="playerName" value={this.state.playerName} required
                     onChange={this.handleChange}/>
            </div>
            <div className="input-field">
              <label htmlFor="playerColor">What's your favourite color?</label
              ><input id="playerColor" type="color" name="playerColor" required value={this.state.playerColor}
                      onChange={this.handleChange}/>
            </div>
            <div className="input-field input-submit text-center">
              <button className="btn" id="startButton" type="submit">Let's play!</button>
            </div>
          </form>
        </section>
        <Footer/>
      </div>
    );
  }
}

export default Home;
