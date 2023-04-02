import {BonusDto} from "./BonusDto";
import {CoordinateDto} from "./CoordinateDto";
import {FrameMessageDto} from "./FrameMessageDto";
import {FullPlayerDto} from "../../games/features/dto/FullPlayerDto";

export interface RefreshedGameInstanceDto {
  currentRound: number,
  totalRounds: number,
  bonusList: Array<BonusDto> | null,
  debugBodies: Array<CoordinateDto> | null,
  obstacles: Array<Array<CoordinateDto>>,
  players: Array<FullPlayerDto>,
  frameMessages: Array<FrameMessageDto>
}
