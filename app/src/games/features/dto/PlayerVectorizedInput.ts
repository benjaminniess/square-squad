import {CoordinateDto} from "../../../dto/game-instance/CoordinateDto";

export interface PlayerVectorizedInput {
  socketID: string
  moveVector: CoordinateDto
}
