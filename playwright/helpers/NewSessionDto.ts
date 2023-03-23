import {Page} from "@playwright/test";
import {FieldsHelpers} from "./FieldsHelpers";

export interface NewSessionDto {
  page: Page,
  fieldHelpers: FieldsHelpers
}
