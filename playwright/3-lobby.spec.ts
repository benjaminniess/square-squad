import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";
import {MultiPlayersHelpers} from "./helpers/MultiPlayersHelpers";
import {NewSessionDto} from "./helpers/NewSessionDto";

const playerName = 'Player 1'
const roomName = 'Room 2'
const roomSlug = 'room-2'
const playerColor = '#ff0000'
let fieldHelpers: FieldsHelpers
let player1session: NewSessionDto

test.beforeEach(async ({page}, testInfo) => {
  fieldHelpers = new FieldsHelpers(page)

  player1session = await MultiPlayersHelpers.generatesALoggedPlayerFromPage(page, playerName, playerColor)
  await expect(page).toHaveURL('/#/rooms')
  await MultiPlayersHelpers.createARoomForSession(player1session, roomName, roomSlug)
  await expect(page).toHaveURL(`/#/rooms/${roomSlug}`)
});

test.afterEach(async ({page}, testInfo) => {
  await page.close()
});

test('It displays the room and player name as admin', async ({page}) => {
  await expect(page.locator('#section-lobby h3.rooms-list__title')).toContainText(roomName)
  await expect(page.locator('#section-lobby ul.players-list li')).toHaveCount(1)
  await expect(page.locator('ul.players-list li').first()).toHaveText(playerName + ' [Admin][You]')
})

test('The room disappear as soon as last user leave it', async ({browser, page}) => {
  await page.locator('#back-btn').click()
  await expect(fieldHelpers.getRoomsListHolder()).toHaveCount(0)

  await fieldHelpers.getRefreshRoomsLink().click()
  await expect(fieldHelpers.getRoomsListHolder()).toHaveCount(0)
})

test('An admin creates a room and another user joins', async ({browser, page}) => {
  const player2Session = await MultiPlayersHelpers.generatesALoggedPlayerFromScratch(browser, 'Player 2', '#0000ff')

  await MultiPlayersHelpers.playerJoinRoomFromLobby(player2Session, roomName, roomSlug)
  await expect(player2Session.page.locator('#section-lobby ul.players-list li')).toHaveCount(2)
  await expect(player2Session.page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin]')
  await expect(player2Session.page.locator('ul.players-list li').nth(1)).toHaveText('Player 2 [You]')
  await expect(page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin][You]')
  await expect(page.locator('ul.players-list li').nth(1)).toHaveText('Player 2')

  await MultiPlayersHelpers.playerLeavesRoom(player1session, roomSlug)

  await expect(player2Session.page.locator('#section-lobby ul.players-list li')).toHaveCount(1)
  await player2Session.page.close()
});

test('If the admin leaves the room, then the first other user becomes admin', async ({browser, page}) => {
  const player2Session = await MultiPlayersHelpers.generatesALoggedPlayerFromScratch(browser, 'Player 2', '#0000ff')

  await MultiPlayersHelpers.playerJoinRoomFromLobby(player2Session, roomName, roomSlug)

  await expect(player2Session.page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin]')
  await expect(player2Session.page.locator('ul.players-list li').nth(1)).toHaveText('Player 2 [You]')
  await expect(page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin][You]')
  await expect(page.locator('ul.players-list li').nth(1)).toHaveText('Player 2')

  await MultiPlayersHelpers.playerLeavesRoom(player1session, roomSlug)

  await expect(player2Session.page.locator('#section-lobby ul.players-list li')).toHaveCount(1)
  await expect(player2Session.page.locator('ul.players-list li').first()).toHaveText('Player 2 [Admin][You]')
  await player2Session.page.close()
});

test('If a user is loosing socket connection, then it is removed from the room', async ({browser, page}) => {
  const player2Session = await MultiPlayersHelpers.generatesALoggedPlayerFromScratch(browser, 'Player 2', '#0000ff')

  await expect(player2Session.page).toHaveURL('/#/rooms')

  await player2Session.page.getByRole('button', {name: roomName}).click()

  await expect(player2Session.page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin]')
  await expect(player2Session.page.locator('ul.players-list li').nth(1)).toHaveText('Player 2 [You]')
  await expect(page.locator('ul.players-list li').first()).toHaveText('Player 1 [Admin][You]')
  await expect(page.locator('ul.players-list li').nth(1)).toHaveText('Player 2')

  await page.goto('/#/');

  await expect(player2Session.page.locator('#section-lobby ul.players-list li')).toHaveCount(1)
  await expect(player2Session.page.locator('ul.players-list li').first()).toHaveText('Player 2 [Admin][You]')
});

