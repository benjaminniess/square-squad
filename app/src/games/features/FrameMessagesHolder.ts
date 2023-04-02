import {FrameMessageDto} from "../../dto/game-instance/FrameMessageDto";
import {Service} from "typedi";

@Service()
export class FrameMessagesHolder {
  private messages: Array<FrameMessageDto> = []

  addMessage(message: FrameMessageDto): void {
    if (message.unique && this.messages.some(e => e.type === message.type)) {
      return
    }

    this.messages.push(message)
  }

  getMessages(): Array<FrameMessageDto> {
    return this.messages
  }

  flushMessages(): void {
    this.messages = []
  }
}
