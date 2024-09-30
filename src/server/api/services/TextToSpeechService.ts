export interface AudioService {
    convertTextToAudio(text:string):Promise<Response>
}

class TextToSpeechService{
    service:AudioService
    constructor(service:AudioService){
        this.service = service
    }

    getAudio(text:string){
        return this.service.convertTextToAudio(text)
    }
}

export default TextToSpeechService