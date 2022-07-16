import React from 'react';

class Particles extends React.Component {
  render() {
    return (
      <div className="particles-js" id="particles-js"></div>
    )
  }

  componentDidMount() {
    // @ts-ignore
    particlesJS.load(
      'particles-js',
      '/js/particles.json',
    );
  }
}

export default Particles;
