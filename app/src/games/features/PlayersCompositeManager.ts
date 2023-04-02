import {CoordinateDto} from "../../dto/game-instance/CoordinateDto";
import {MainConfig} from "../../config/MainConfig";
import {Container, Service} from "typedi";

@Service()
export class PlayersCompositeManager {
  private readonly compositeObj: any
  private readonly matter: any


  constructor() {
    this.matter = Container.get('matter')
    this.compositeObj = this.matter.Composite.create({label: 'players'})
  }

  public getComposite(): any {
    return this.compositeObj
  }

  public getAllPlayersComposites(): any[] {
    return this.compositeObj.bodies
  }

  initPlayer(socketID: string, coordinates: CoordinateDto) {
    let body = this.matter.Bodies.rectangle(
      coordinates.x,
      coordinates.y,
      MainConfig.squareSize,
      MainConfig.squareSize,
      {
        inertia: Infinity,
        restitution: 2,
        frictionAir: 0.25,
        collisionFilter: this.getDefaultPlayerCollisionFilter()
      }
    )

    this.matter.Body.set(body, {
      socketID: socketID,
      customType: 'player'
    })

    this.matter.Composite.add(this.compositeObj, body)
  }

  // getPlayerBody(playerID: string) {
  //   let body
  //   _.forEach(this.getPlayersPhysicalData(), (playerBody: any) => {
  //     if (playerBody.socketID === playerID) {
  //       body = playerBody
  //     }
  //   })
  //
  //   return body
  // }
  //
  // setPlayerBodyData(playerID: string, playerData: any) {
  //   let body = this.getPlayerBody(playerID)
  //   if (!body) {
  //     return
  //   }
  //
  //   this.matter.Body.set(body, playerData)
  // }

  applyForce(socketID: string, vector: CoordinateDto, speed: number = 7, speedMultiplicator = 1): void {
    const compositePlayer = this.getPlayerComposite(socketID)

    this.matter.Body.applyForce(compositePlayer, compositePlayer.position, {
      x: ((vector.x * speed) / 1700) * speedMultiplicator,
      y: ((vector.y * speed) / 1700) * speedMultiplicator
    })
  }

  getPlayerComposite(socketID: string): any {
    return this.getAllPlayersComposites().find(body => body.socketID === socketID)
  }

  getPlayerPosition(socketID: string): CoordinateDto {
    return this.getPlayerComposite(socketID).position
  }

  getDefaultPlayerCollisionFilter() {
    return {
      category: 0x1000,
      mask: 0x1111
    }
  }

  clear(): void {
    this.matter.Composite.clear(this.compositeObj)
  }

  removePlayer(playerID: string) {
    const playerComposite = this.getPlayerComposite(playerID);
    this.compositeObj.remove(playerComposite)
    this.compositeObj.world.remove(playerComposite)
  }
}
