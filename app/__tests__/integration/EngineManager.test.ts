import "reflect-metadata";
import {EngineManager} from "../../src/games/features/EngineManager";
import {AppDataSource} from "../../src/data-source-test";
import {Container} from "typedi";


let engineManager: EngineManager
const Matter = require('matter-js')
beforeAll(async () => {
  await AppDataSource.initialize()

  Container.set('matter', Matter)
})
beforeEach(async () => {
  engineManager = new EngineManager()
});

afterEach(async () => {

});

describe('Engine manager', () => {
  it('inits the engine', async () => {
    expect(engineManager.getEngine()).not.toBeNull()
  })
})

