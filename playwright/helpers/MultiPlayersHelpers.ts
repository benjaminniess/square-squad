import {Browser, expect, Page} from "@playwright/test";
import {FieldsHelpers} from "./FieldsHelpers";
import {NewSessionDto} from "./NewSessionDto";

export class MultiPlayersHelpers {
  static async generatesALoggedPlayerFromScratch(browser: Browser, playerName: string, playerColor: string): Promise<NewSessionDto> {
    const otherUserContext = await browser.newContext();

    const otherUserContextPage = await otherUserContext.newPage();

    return await this.generatesALoggedPlayerFromPage(otherUserContextPage, playerName, playerColor)
  }

  static async generatesALoggedPlayerFromPage(page: Page, playerName: string, playerColor: string): Promise<NewSessionDto> {
    await page.goto('/#/');
    const fieldHelpers = new FieldsHelpers(page)

    await expect(page).toHaveURL('/#/')

    await fieldHelpers.getPlayerNameField().click()
    await fieldHelpers.getPlayerNameField().fill(playerName)

    await fieldHelpers.getPlayerColorField().fill(playerColor)

    await fieldHelpers.getHomeLetsPlayButton().click();

    return {page: page, fieldHelpers: fieldHelpers};
  }

  static async createARoomForSession(context: NewSessionDto, roomName: string, roomSlug: string): Promise<void> {
    await expect(context.page).toHaveURL('/#/rooms')
    await context.fieldHelpers.getRoomNameField().fill(roomName)
    await context.fieldHelpers.getCreateRoomButton().click()
    await expect(context.page).toHaveURL(`/#/rooms/${roomSlug}`)
  }

  static async playerJoinRoomFromLobby(context: NewSessionDto, roomName: string, roomSlug: string): Promise<void> {
    await expect(context.page).toHaveURL('/#/rooms')

    await context.page.getByRole('button', {name: roomName}).click()

    await expect(context.page).toHaveURL('/#/rooms/' + roomSlug)
  }

  static async playerLeavesRoom(context: NewSessionDto, roomSlug: string): Promise<void> {
    await expect(context.page).toHaveURL(`/#/rooms/${roomSlug}`)
    await context.page.locator('#back-btn').click()
    await expect(context.page).toHaveURL('/#/rooms')
  }
}
