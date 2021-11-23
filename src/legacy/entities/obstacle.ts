import * as Matter from 'matter-js';
const Composite = Matter.Composite;
import { EventEmitter } from 'events';
import { _ } from 'lodash';

class Obstacle {
  private level = 1;
  private speedMultiplicator = 1;
  private bodies: any[] = [];
  private params: any;
  private eventEmitter: EventEmitter;
  private compositeObj: any;

  constructor(params: any) {
    this.level = params.level ? params.level : 1;
    this.speedMultiplicator = params.speedMultiplicator
      ? params.speedMultiplicator
      : 1;

    this.params = params;
    this.eventEmitter = new EventEmitter();
    this.compositeObj = Matter.Composite.create({ label: this.getSlug() });
  }

  getParams() {
    return this.params;
  }

  getSlug() {
    return this.getParams().slug;
  }

  getBodies() {
    return Composite.allBodies(this.getComposite());
  }

  getVertices() {
    const vertices: any[] = [];

    _.forEach(this.getBodies(), (matterBody: any) => {
      const bodyVertices: any[] = [];
      _.forEach(matterBody.vertices, (vertice: any) => {
        bodyVertices.push({ x: vertice.x, y: vertice.y });
      });

      vertices.push(bodyVertices);
    });

    return vertices;
  }

  getEventEmmitter() {
    return this.eventEmitter;
  }

  getComposite() {
    return this.compositeObj;
  }

  getLevel() {
    return this.level;
  }

  getSpeedMultiplicator() {
    return this.speedMultiplicator;
  }

  isOver() {
    return _.size(this.getBodies()) === 0;
  }

  loop() {
    // to be overridden
  }

  onCollisionStart(obstaclePart: any, bodyB: any) {}
  onCollisionEnd(obstaclePart: any, bodyB: any) {}
}

export { Obstacle };
