import {Container} from "typedi";
import {PlayersRepository} from "../../src/repositories/PlayersRepository";


describe('Players management', () => {
  const playersRepository = Container.get(PlayersRepository);

  it('returns an empty players object', () => {
    expect(playersRepository.findAll()).toEqual({})
  })

  // it('creates a new player and returns true', () => {
  //   expect(playersRepository.create('abc1234', {nickName: 'Players 1', color: '#FF00FF'})).toBeTruthy()
  // })
  //
  // it('returns an empty players object', () => {
  //   expect(playersRepository.findAll().where('socketID', 'abc1234').first()).toBeInstanceOf(Player)
  // })
  //
  // it('returns the previously created player', () => {
  //   expect(playersRepository.findBySocketID('abc1234')).toBeInstanceOf(Player)
  // })
  //
  // it('returns false when calling a wrong ID', () => {
  //   expect(playersRepository.findBySocketID('abc12345')).toBeFalsy()
  // })

  // it('returns false when trying to update a non existing user', () => {
  //   expect(playersRepository.update('abc12345', {color: '#0000FF', nickName: 'toto'})).toBeFalsy()
  // })
  //
  // it('updates the previously created user', () => {
  //   expect(playersRepository.update('abc1234', {color: '#0000FF', nickName: 'toto'})).toBeFalsy()
  // })
})
