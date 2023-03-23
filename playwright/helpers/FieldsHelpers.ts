import {Locator, Page} from "@playwright/test";

export class FieldsHelpers {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  getPlayerNameField(): Locator {
    return this.page.locator('input#playerName[required]')
  }

  getPlayerColorField(): Locator {
    return this.page.locator('input#playerColor[required]')
  }

  getHomeLetsPlayButton(): Locator {
    return this.page.getByRole('button', {name: 'Let\'s play!'})
  }

  getPlayerEditLink(): Locator {
    return this.page.locator('a#playerNameLabel')
  }

  getRefreshRoomsLink(): Locator {
    return this.page.locator('#refresh-rooms')
  }

  getRoomsListHolder(): Locator {
    return this.page.locator('#rooms-holder ul li')
  }

  getRoomsHolder(): Locator {
    return this.page.locator('#rooms-holder')
  }

  getRoomNameField(): Locator {
    return this.page.locator('#newRoom')
  }

  getCreateRoomButton(): Locator {
    return this.page.getByRole('button', {name: 'Create room'})
  }
}
