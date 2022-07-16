import React from 'react';

class Footer extends React.Component {
  render() {
    let state = {
      version: '1.0.0'
    }
    return (
      <footer className="footer">
        <p>
          <span>
            <a href="https://github.com/benjaminniess/square-squad" target="_blank">Version {state.version}</a> |&nbsp;
            <a href="#">About us</a>
          </span>
          <a href="https://discord.gg/zGZ2TVw6e4" target="_blank"><img src="/images/discord.png" width="32px"/>
          </a>
        </p>
      </footer>
    )
  }
}

export default Footer;
