import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";
import {MultiPlayersHelpers} from "./helpers/MultiPlayersHelpers";

const playerName = 'Player 1'
const playerColor = '#4137c8'
let fieldHelpers: FieldsHelpers

test.beforeEach(async ({page}, testInfo) => {
  fieldHelpers = new FieldsHelpers(page)
  await page.goto('/#/')
})

test.afterEach(async ({page}, testInfo) => {
  await page.close()
})

test('It displays homepage form and redirect to rooms when for is completed', async ({page}) => {
  await expect(page).toHaveTitle(/Square Squad/)

  await expect(fieldHelpers.getPlayerNameField()).toHaveCount(1)
  await expect(fieldHelpers.getPlayerNameField()).toHaveValue('')
  await expect(fieldHelpers.getPlayerColorField()).toHaveCount(1)

  await fieldHelpers.getPlayerNameField().click()
  await fieldHelpers.getPlayerNameField().fill(playerName)

  await fieldHelpers.getPlayerColorField().click()
  await fieldHelpers.getPlayerColorField().fill(playerColor)

  await fieldHelpers.getHomeLetsPlayButton().click()

  await expect(page).toHaveURL('/#/rooms')
})

test('It triggers an error if player name is empty', async ({page}) => {
  await page.getByRole('button', {name: 'Let\'s play!'}).click()

  await expect(page.locator('input#playerName[required]:invalid')).toHaveCount(1)
  await expect(page).toHaveURL('/#/')
})

test('remembers player name and color when visiting the home again', async ({page, browser}) => {
  await expect(fieldHelpers.getPlayerNameField()).toHaveValue('')

  await MultiPlayersHelpers.generatesALoggedPlayerFromPage(page, playerName, playerColor)

  await expect(page).toHaveURL('/#/rooms')
  await page.getByRole('link', {name: playerName}).click()

  await expect(page).toHaveURL('/#/')
  await expect(fieldHelpers.getPlayerNameField()).toHaveValue(playerName)
  await expect(fieldHelpers.getPlayerColorField()).toHaveValue(playerColor)
})
