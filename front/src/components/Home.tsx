import React from 'react';
import Logo from "./Logo";
import Footer from "./Footer";

class Home extends React.Component {
  state = {
    formSubmitted: false,
    playerName: '',
    playerColor: '',
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState: any = {}
    newState[event.target.name] = event.target.value
    this.setState(newState)
  }

  handleSubmit = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({'formSubmitted': true})
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
    const {playerName, playerColor, formSubmitted} = this.state

    return (
      <div className="super-wrapper">
        <section className="wrapper">
          <Logo/>

          {formSubmitted &&
            <p>
              Connecting to server...
            </p>
          }

          {!formSubmitted &&
            <form className="sq-form" id="pre-home-form" method="post" action="/">
              <div className="input-field">
                <label htmlFor="playerName">What's your name?</label>
                <input id="playerName" type="text" name="playerName" value={playerName} required
                       onChange={this.handleChange}/>
              </div>
              <div className="input-field">
                <label htmlFor="playerColor">What's your favourite color?</label
                ><input id="playerColor" type="color" name="playerColor" required value={playerColor}
                        onChange={this.handleChange}/>
              </div>
              <div className="input-field input-submit text-center">
                <button className="btn" id="startButton" type="submit" onClick={this.handleSubmit}>Let's play!</button>
              </div>
            </form>
          }
        </section>
        <Footer/>
      </div>
    );
  }
}

export default Home;
