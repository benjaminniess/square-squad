import React from 'react';
import Logo from "./Logo";
import Footer from "./Footer";
import {SocketContext} from "../socket/SocketProvider";


class Rooms extends React.Component {
  static contextType = SocketContext
  state = {
    loading: true,
    rooms: [],
  }


  handleSubmit = (event: { stopPropagation: () => void; preventDefault: () => void; }) => {
    event.stopPropagation()
    event.preventDefault()

    // @ts-ignore
    this.context.emit('update-player-data', {name: this.state.playerName, color: this.state.playerColor})
    this.setState({'formSubmitted': true})
  }

  componentDidMount() {
    // @ts-ignore
    this.context.emit('rooms-refresh')

    // @ts-ignore
    this.context.on('rooms-refresh-result', (result) => {
      this.setState({loading: false, rooms: result.data})
    })
  }

  render() {
    const {loading, rooms} = this.state

    return (
      <div className="super-wrapper">
        <section className="wrapper">
          <Logo/>

          <h3>Rooms list</h3>
          <div className="page-rooms__intro">
            <p className="text-center">
              <a className="user-name" href="#" id="playerNameLabel"
                //style="{ color: playerData ? playerData.color : null }"
              >
                <span>Player name</span>
              </a>
            </p>
            <p>You first need to select a room or create a new one</p>
          </div>
          <a id="rooms-refresh" href="#">[Refresh]</a
          >
          <div className="rooms-list">
            <h3 className="rooms-list__title">Join a room…</h3>

            <div id="rooms-holder">
              {loading &&
                <p>
                  Loading rooms...
                </p>
              }
              {!loading && rooms &&
                <ul className="rooms-list__list">
                  <li>
                    <a className="rooms-list__link" href="#">Room 1</a>
                  </li>
                </ul>
              }
              {loading && !rooms &&
                <p className="rooms-list__no-rooms">No rooms yet :(</p>
              }

            </div>
          </div>

          <form className="sq-form" method="post" action="#">
            <div className="input-field">
              <label htmlFor="newRoom">Or create a new one?</label>
              <input id="newRoom" placeholder="Give it a name" required type="text"/>
            </div>
            <div className="input-field input-submit text-center">
              <button className="btn" type="submit">Create room</button>
            </div>
          </form>

        </section>
        <Footer/>
      </div>
    );
  }
}

export default Rooms;
