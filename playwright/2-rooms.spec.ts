import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";
import {MultiPlayersHelpers} from "./helpers/MultiPlayersHelpers";

const playerName = 'Player 1'
const roomName = 'Room 1'
const roomSlug = 'room-1'
const playerColor = '#ff0000'
let fieldHelpers: FieldsHelpers

test.beforeEach(async ({page}, testInfo) => {
  fieldHelpers = new FieldsHelpers(page)
  await MultiPlayersHelpers.generatesALoggedPlayerFromPage(page, playerName, playerColor)
  await expect(page).toHaveURL('/#/rooms')
});

test.afterEach(async ({page}, testInfo) => {
  await page.close()
});


test('It displays player name and color', async ({page}) => {
  await expect(fieldHelpers.getPlayerEditLink()).toHaveCount(1)
  await expect(fieldHelpers.getPlayerEditLink()).toHaveText(playerName)
  await expect(fieldHelpers.getPlayerEditLink()).toHaveCSS('color', 'rgb(255, 0, 0)')
})

test('It shows a default text because rooms are empty', async ({page}) => {
  await expect(fieldHelpers.getRoomsHolder()).toContainText('No rooms yet')
})

test('It triggers an error if room name is empty', async ({page}) => {
  await fieldHelpers.getCreateRoomButton().click()
  await expect(page.locator('#newRoom:invalid')).toHaveCount(1)
})

test('It refreshes rooms list', async ({browser, page}) => {
  await fieldHelpers.getRefreshRoomsLink().click()
  await expect(fieldHelpers.getRoomsListHolder()).toHaveCount(0)

  const secondPlayerContext = await MultiPlayersHelpers.generatesALoggedPlayerFromScratch(browser, 'toto', playerColor)

  await MultiPlayersHelpers.createARoomForSession(secondPlayerContext, 'Room 2', 'room-2')

  await fieldHelpers.getRefreshRoomsLink().click()
  await expect(fieldHelpers.getRoomsListHolder()).toHaveCount(1)
  await expect(fieldHelpers.getRoomsListHolder().first()).toHaveText('Room 2')

  await secondPlayerContext.page.locator('#back-btn').click()
  await fieldHelpers.getRefreshRoomsLink().click()
  await expect(fieldHelpers.getRoomsListHolder()).toHaveCount(0)
})

test('It redirects to a new room if everything is correct', async ({page}) => {
  await fieldHelpers.getRoomNameField().fill(roomName)
  await fieldHelpers.getCreateRoomButton().click()

  await expect(page).toHaveURL(`/#/rooms/${roomSlug}`)
})


