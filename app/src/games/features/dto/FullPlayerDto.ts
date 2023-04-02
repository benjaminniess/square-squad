export interface FullPlayerDto {
  socketID: string,
  nickName: string,
  alive: boolean,
  color: string,
  custom: object,
  x: number | null,
  y: number | null
}
