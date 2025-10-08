import axios from 'axios'

export interface AlertConfiguration {
  botToken?: string
  chatIdentifier?: string
}

export class MessengerService {
  private readonly alertConfig: AlertConfiguration
  
  constructor(config: AlertConfiguration) { 
    this.alertConfig = config 
  }

  async sendAlert(messageContent: string) {
    if (!this.alertConfig.botToken || !this.alertConfig.chatIdentifier) return
    
    const apiEndpoint = `https://api.telegram.org/bot${this.alertConfig.botToken}/sendMessage`
    await axios.post(apiEndpoint, { 
      chat_id: this.alertConfig.chatIdentifier, 
      text: messageContent, 
      parse_mode: 'HTML', 
      disable_web_page_preview: true 
    })
  }
}

