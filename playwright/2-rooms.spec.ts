import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";

const playerName = 'Player 1'
const roomName = 'Room 1'
const roomSlug = 'room-1'
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

test('It redirects to a new room if everything is correct', async ({page}) => {
  await fieldHelpers.getRoomNameField().fill(roomName)
  await fieldHelpers.getCreateRoomButton().click()

  await expect(page).toHaveURL(`/#/rooms/${roomSlug}`)
})
