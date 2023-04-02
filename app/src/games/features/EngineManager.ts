import {Container, Service} from "typedi";
import {MainConfig} from "../../config/MainConfig";

const _ = require('lodash')

@Service()
export class EngineManager {
  private readonly engine: any
  private readonly runner: any
  private readonly walls: any
  private readonly matter: any

  constructor() {
    this.matter = Container.get('matter')
    this.engine = this.matter.Engine.create()
    this.engine.world.gravity.y = 0
    this.runner = this.matter.Runner.create()
    this.matter.Runner.run(this.runner, this.engine)

    this.walls = this.matter.Composite.create({label: 'walls'})
    this.addComposite(this.walls)
    this.initWalls()
  }

  addComposite(composite: any) {
    this.matter.Composite.add(this.engine.world, composite)
  }

  getEngine(): any {
    return this.engine
  }

  getDebugMatterTree() {
    let worldComposites = this.matter.Composite.allComposites(this.engine.world)
    let worldBodies = this.matter.Composite.allBodies(this.engine.world)

    let tree = [
      {
        label: 'world',
        composites: _.size(worldComposites),
        bodies: _.size(worldBodies)
      }
    ]

    _.forEach(worldComposites, (composite: any) => {
      tree.push({
        label: composite.label,
        composites: _.size(this.matter.Composite.allComposites(composite)),
        bodies: _.size(this.matter.Composite.allBodies(composite))
      })
    })

    return tree
  }

  getDebugBodies() {
    let debugBodies: any[] = []
    if (process.env.MATTER_DEBUG && process.env.MATTER_DEBUG === 'true') {
      let worldBodies = this.matter.Composite.allBodies(this.engine.world)
      _.forEach(worldBodies, (wb: any) => {
        _.forEach(wb.vertices, (vertice: any) => {
          debugBodies.push({x: vertice.x, y: vertice.y})
        })
      })
    }

    return debugBodies
  }

  initWalls() {
    let commonProperties = {
      isStatic: true,
      collisionFilter: {
        category: 0x0010,
        mask: 0x1001
      },
      customType: 'wall'
    }

    this.matter.Composite.add(this.walls, [
      // Top
      this.matter.Bodies.rectangle(
        MainConfig.canvasWidth / 2,
        -5,
        MainConfig.canvasWidth,
        10,
        commonProperties
      ),
      // Left
      this.matter.Bodies.rectangle(
        -5,
        MainConfig.canvasWidth / 2,
        10,
        MainConfig.canvasWidth,
        commonProperties
      ),
      // Right
      this.matter.Bodies.rectangle(
        MainConfig.canvasWidth + 5,
        MainConfig.canvasWidth / 2,
        10,
        MainConfig.canvasWidth,
        commonProperties
      ),
      // Bottom
      this.matter.Bodies.rectangle(
        MainConfig.canvasWidth / 2,
        MainConfig.canvasWidth + 5,
        MainConfig.canvasWidth,
        10,
        commonProperties
      )
    ])
  }
}

