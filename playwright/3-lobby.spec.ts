import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";

const playerName = 'Player 1'
const roomName = 'Room 2'
const roomSlug = 'room-2'
const playerColor = '#ff0000'
let fieldHelpers: FieldsHelpers

test.beforeEach(async ({page}, testInfo) => {
  fieldHelpers = new FieldsHelpers(page)
  await page.goto('/#/');

  const playerNameInput = fieldHelpers.getPlayerNameField()
  const playerColorInput = fieldHelpers.getPlayerColorField()

  await playerNameInput.click();
  await playerNameInput.fill(playerName);
  await playerColorInput.click();
  await playerColorInput.fill(playerColor);
  await fieldHelpers.getHomeLetsPlayButton().click();

  await expect(page).toHaveURL('/#/rooms')

  await fieldHelpers.getRoomNameField().fill(roomName)
  await fieldHelpers.getCreateRoomButton().click()

  await expect(page).toHaveURL(`/#/rooms/${roomSlug}`)
});

test('It displays the room and player name as admin', async ({page}) => {
  await expect(page.locator('h3.rooms-list__title')).toHaveText(roomName)

  await expect(page.locator('ul.players-list li').first()).toContainText('[Admin]')
  // TODO: Reimplement in app
  //await expect(page.locator('ul.players-list li').first()).toContainText('[You]')
  //await expect(page.locator('ul.players-list li').first()).toContainText(playerName)
})
