const canvasWidth = 700;
const squareSize = 30;
import * as Matter from 'matter-js';
import { Helpers } from '../../../helpers/helpers';
import { Obstacle } from '../obstacle';
import { _ } from 'lodash';

class SpaceInvaders extends Obstacle {
  private helpers: Helpers;

  constructor(
    params = {
      slug: '',
    },
  ) {
    params.slug = 'space-invader';
    super(params);

    this.helpers = new Helpers();
    this.init();
  }

  init() {
    const obstacleWidth = squareSize * 2;
    const obstacleSpeed = this.getLevel() * this.getSpeedMultiplicator();
    let obstacle = {};
    const invaderRequiredWidth = obstacleWidth * 2.2;
    const obstacleParts = [];

    const rowCount = this.helpers.getRandomInt(1, 4);
    for (let o = 0; o < rowCount; o++) {
      const countInvaders = this.helpers.getRandomInt(3, 6);
      const spaceBetween =
        obstacleWidth +
        (canvasWidth - countInvaders * obstacleWidth) / (countInvaders - 1);
      for (let k = 0; k < countInvaders; k++) {
        obstacle = {
          x: k * spaceBetween + obstacleWidth / 2,
          y: -obstacleWidth - o * invaderRequiredWidth * 2 - obstacleWidth / 2,
          width: obstacleWidth,
          height: obstacleWidth,
          speed: obstacleSpeed,
          vector: { x: 0, y: obstacleSpeed / 4 },
        };

        obstacleParts.push(obstacle);
      }
    }

    _.forEach(obstacleParts, (obstaclePart: any) => {
      const body = Matter.Bodies.rectangle(
        obstaclePart.x,
        obstaclePart.y,
        obstaclePart.width,
        obstaclePart.height,
        {
          frictionAir: 0,
          collisionFilter: { group: 2 },
          isSensor: true,
        },
      );

      Matter.Body.setVelocity(body, obstaclePart.vector);
      Matter.Body.set(body, {
        customType: 'obstacle',
        customSubType: this.getSlug(),
      });

      Matter.Composite.add(this.getComposite(), body);
    });
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle: any) => {
      if (obstacle.position.y > canvasWidth) {
        this.getEventEmmitter().emit('obstaclePartOver', obstacle);
      }
    });
  }
}

export { SpaceInvaders };
