import "reflect-metadata";
import {RoomDto} from "../../../src/dto/game-instance/RoomDto";
import {expect} from "@playwright/test";
import {Sample} from "../../../src/games/sample";
import {AppDataSource} from "../../../src/data-source-test";
import {Container} from "typedi";

const Matter = require('matter-js')
beforeAll(async () => {
  await AppDataSource.initialize()

  Container.set('matter', Matter)
})
beforeEach(async () => {

});

afterEach(async () => {

});

describe('Sample', () => {
  it('creates a game instance from a room dto', async () => {
    const room: RoomDto = {
      slug: 'room-slug',
      name: 'Room Name',
      players: [
        {nickName: 'Player 1', color: '#FF0000', socketID: 'abcdef123'}
      ]
    }

    const gameInstance = new Sample(room, {})

    expect(gameInstance.getRoom()).toBe(room)
  })
})

