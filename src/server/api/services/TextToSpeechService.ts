export interface AudioService {
    convertTextToAudio(text:string):Promise<Blob>
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