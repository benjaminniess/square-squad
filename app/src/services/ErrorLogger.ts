import {Service} from "typedi";

@Service()
export class ErrorLogger {
  report(error: string) {
    console.log('Error reported: ' + error)
  }
}
