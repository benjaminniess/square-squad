const canvasWidth = 700;
const squareSize = 30;
import { Matter } from 'matter-js';
import { Helpers } from '../../../helpers/helpers';
import { Obstacle } from '../obstacle';
import { _ } from 'lodash';

class SimpleHole extends Obstacle {
  private helpers: Helpers;

  constructor(
    params = {
      slug: '',
    },
    helpers: Helpers,
  ) {
    params.slug = 'simple-hole';
    super(params);

    this.helpers = helpers;
    this.init();
  }

  init() {
    const direction = this.helpers.getRandomInt(1, 5);
    const holeSize = this.helpers.getRandomInt(squareSize * 3, squareSize * 8);
    const obstacleWidth = this.helpers.getRandomInt(squareSize, squareSize * 4);
    const obstacleSpeed = (this.getLevel() * this.getSpeedMultiplicator()) / 3;

    const obstacleSpot = this.helpers.getRandomInt(
      squareSize,
      canvasWidth - squareSize,
    );

    let obstacle = {};
    const obstacleParts = [];
    switch (direction) {
      case 1:
        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: obstacleSpot / 2,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'left',
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: 0 },
        };

        obstacleParts.push(obstacle);

        obstacle = {
          x: canvasWidth + obstacleWidth / 2,
          y: obstacleSpot + canvasWidth / 2 + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          speed: obstacleSpeed,
          vector: { x: -obstacleSpeed, y: 0 },
        };

        obstacleParts.push(obstacle);
        break;
      case 2:
        obstacle = {
          x: -obstacleWidth / 2,
          y: obstacleSpot / 2,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: 0 },
        };

        obstacleParts.push(obstacle);

        obstacle = {
          x: -obstacleWidth / 2,
          y: obstacleSpot + canvasWidth / 2 + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          speed: obstacleSpeed,
          vector: { x: obstacleSpeed, y: 0 },
        };

        obstacleParts.push(obstacle);

        break;
      case 3:
        obstacle = {
          x: obstacleSpot / 2,
          y: -obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
          vector: { x: 0, y: obstacleSpeed },
        };

        obstacleParts.push(obstacle);

        obstacle = {
          x: obstacleSpot + holeSize + canvasWidth / 2,
          y: -obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
          vector: { x: 0, y: obstacleSpeed },
        };

        obstacleParts.push(obstacle);
        break;
      case 4:
        obstacle = {
          x: obstacleSpot / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
          vector: { x: 0, y: -obstacleSpeed },
        };

        obstacleParts.push(obstacle);

        obstacle = {
          x: obstacleSpot + holeSize + canvasWidth / 2,
          y: canvasWidth + obstacleWidth / 2,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
          vector: { x: 0, y: -obstacleSpeed },
        };

        obstacleParts.push(obstacle);
        break;
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
          direction: obstaclePart.direction,
        },
      );

      Matter.Body.setVelocity(body, obstaclePart.vector);
      Matter.Body.set(body, {
        direction: obstaclePart.direction,
        customType: 'obstacle',
        customSubType: this.getSlug(),
      });

      Matter.Composite.add(this.getComposite(), body);
    });
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle: any) => {
      switch (obstacle.direction) {
        case 'left':
          if (obstacle.position.x < 0) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle);
          }
          break;
        case 'right':
          if (obstacle.position.x > canvasWidth) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle);
          }
          break;
        case 'bottom':
          if (obstacle.position.y > canvasWidth) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle);
          }
          break;
        case 'top':
          if (obstacle.position.y < 0) {
            this.getEventEmmitter().emit('obstaclePartOver', obstacle);
          }
          break;
      }
    });
  }
}

export { SimpleHole };
