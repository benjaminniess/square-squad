export interface PlayerDto {
  alive: boolean,
  x: number,
  y: number,
  color: string,
  bonus: string | null,
  bonusBlinking: boolean,
  bonusImgX: number | null,
  bonusImgY: number | null,
  bonusWidth: number | null,
  bonusHeight: number | null,
}
