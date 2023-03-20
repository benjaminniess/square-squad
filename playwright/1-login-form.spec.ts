import {expect, test} from '@playwright/test';
import {FieldsHelpers} from "./helpers/FieldsHelpers";

const playerName = 'Player 1'
const playerColor = '#4137c8'
let fieldHelpers: FieldsHelpers

test.beforeEach(async ({page}, testInfo) => {
  fieldHelpers = new FieldsHelpers(page)
  await page.goto('/#/');
});

test('It displays homepage form and redirect to rooms when for is completed', async ({page}) => {
  await expect(page).toHaveTitle(/Square Squad/);

  const playerNameInput = fieldHelpers.getPlayerNameField()
  const playerColorInput = fieldHelpers.getPlayerColorField()
  const submitButton = fieldHelpers.getHomeLetsPlayButton()

  await expect(playerNameInput).toHaveCount(1)
  await expect(playerNameInput).toHaveValue('')
  await expect(playerColorInput).toHaveCount(1)

  await playerNameInput.click();
  await playerNameInput.fill(playerName);
  await playerColorInput.click();
  await playerColorInput.fill(playerColor);
  await submitButton.click();

  await expect(page).toHaveURL('/#/rooms')
})

test('It triggers an error if player name is empty', async ({page}) => {
  await page.getByRole('button', {name: 'Let\'s play!'}).click()

  await expect(page.locator('input#playerName[required]:invalid')).toHaveCount(1)
  await expect(page).toHaveURL('/#/')
})

test('remembers player name and color when visiting the home again', async ({page}) => {
  const playerNameInput = fieldHelpers.getPlayerNameField()
  const playerColorInput = fieldHelpers.getPlayerColorField()
  const submitButton = fieldHelpers.getHomeLetsPlayButton()

  await expect(playerNameInput).toHaveValue('')

  await playerNameInput.click();
  await playerNameInput.fill(playerName);
  await playerColorInput.click();
  await playerColorInput.fill(playerColor);
  await submitButton.click();

  await expect(page).toHaveURL('/#/rooms')
  await page.getByRole('link', {name: playerName}).click();

  await expect(page).toHaveURL('/#/')
  await expect(page.locator('input#playerName')).toHaveValue(playerName)
  await expect(page.locator('input#playerColor')).toHaveValue(playerColor)
});
