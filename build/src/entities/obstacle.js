"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Matter = require('matter-js');
const Composite = Matter.Composite;
const _ = require('lodash');
const events_1 = __importDefault(require("events"));
class Obstacle {
    constructor(params) {
        this.level = 1;
        this.speedMultiplicator = 1;
        this.bodies = [];
        this.level = params.level ? params.level : 1;
        this.speedMultiplicator = params.speedMultiplicator
            ? params.speedMultiplicator
            : 1;
        this.params = params;
        this.eventEmitter = new events_1.default();
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
        let vertices = [];
        _.forEach(this.getBodies(), (matterBody) => {
            let bodyVertices = [];
            _.forEach(matterBody.vertices, (vertice) => {
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
    loop() { }
    onCollisionStart(obstaclePart, bodyB) { }
    onCollisionEnd(obstaclePart, bodyB) { }
}
module.exports = Obstacle;
