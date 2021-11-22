const canvasWidth = 700;
import { Matter } from 'matter-js';
import { Helpers } from '../../../helpers/helpers';
import { Obstacle } from '../obstacle';
import { _ } from 'lodash';

class Ball extends Obstacle {
  private helpers: Helpers;

  constructor(
    params = {
      slug: '',
    },
    helpers: Helpers,
  ) {
    params.slug = 'ball';
    super(params);

    this.helpers = helpers;
    this.init();
  }

  init() {
    const speedReducer = 0.4;
    const startPosition = this.getParams().count ? this.getParams().count : 1;
    const obstacleSpeed =
      this.getLevel() * this.getSpeedMultiplicator() * speedReducer;
    const radius = 20;
    const angle =
      ((10 - this.helpers.getRandomInt(1, 21)) / 10) * obstacleSpeed;
    let obstacle: any = {};

    switch (startPosition) {
      // Bottom
      case 1:
        obstacle = {
          x: canvasWidth / 2 + radius / 2,
          y: canvasWidth + radius + this.helpers.getRandomInt(15, 70),
          vector: {
            x: angle,
            y: -obstacleSpeed,
          },
        };
        break;
      // Top
      case 2:
        obstacle = {
          x: canvasWidth / 2 + radius / 2,
          y: -radius - this.helpers.getRandomInt(15, 70),
          vector: {
            x: angle,
            y: obstacleSpeed,
          },
        };
        break;
      // Right
      case 3:
        obstacle = {
          x: canvasWidth + radius + this.helpers.getRandomInt(15, 35),
          y: canvasWidth / 2 + radius / 2,
          vector: {
            x: -obstacleSpeed,
            y: angle,
          },
        };
        break;
      case 4:
        obstacle = {
          x: -radius - this.helpers.getRandomInt(15, 35),
          y: canvasWidth / 2 + radius / 2,
          vector: {
            x: obstacleSpeed,
            y: angle,
          },
        };
        break;
    }

    obstacle.radius = radius;
    obstacle.speed = obstacleSpeed;

    const body = Matter.Bodies.circle(obstacle.x, obstacle.y, obstacle.radius, {
      frictionAir: 0,
      frictionStatic: 0,
      friction: 0,
      restitution: 1.5,
      isSensor: 1,
      collisionFilter: {
        category: 0x0001,
        mask: 0x1010,
      },
    });

    Matter.Body.setVelocity(body, obstacle.vector);
    Matter.Body.set(body, {
      enableCustomCollisionManagement: true,
      countCollisions: 0,
      customType: 'obstacle',
      customSubType: this.getSlug(),
    });

    Matter.Composite.add(this.getComposite(), body);
  }

  onCollisionStart(obstaclePart: any, bodyB: any) {
    if (bodyB.customType && bodyB.customType === 'player') {
      this.getEventEmmitter().emit('obstaclePartOver', obstaclePart);
      return;
    }
  }

  loop() {
    _.forEach(this.getBodies(), (obstacle: any) => {
      if (
        obstacle.position.x < -100 ||
        obstacle.position.x > canvasWidth + 100 ||
        obstacle.position.y < -100 ||
        obstacle.position.y > canvasWidth + 100
      ) {
        this.getEventEmmitter().emit('obstaclePartOver', obstacle);
      }
    });
  }

  // If we want the ball to bounce
  // Need debug because the onCollisionEnd is not always triggered for some reason
  /*
  onCollisionEnd(obstaclePart, bodyB) {
    if (bodyB.customType && bodyB.customType === 'wall') {
      
      Matter.Body.set(obstaclePart, {
        isSensor: 0,
        collisionFilter: {
          category: 0x0001,
          mask: 0x0011,
        },
      })
    
      obstaclePart.countCollisions++

      
      
      if (obstaclePart.countCollisions === 2) {
        Matter.Body.set(obstaclePart, {
          isSensor: 1,
          collisionFilter: {
            category: 0x0001,
            mask: 0x0011,
          },
        })
      }

      if (obstaclePart.countCollisions > 1) {
        this.getEventEmmitter().emit('obstaclePartOver', obstaclePart)
      }
    }
  }
  */
}

export { Ball };
