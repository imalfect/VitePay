export class functionResponse {
constructor(status,json) {
    this.status = status;
    this.json = json;

}
}

export function resReply(functionResponse,res) {
    res.status(functionResponse.status)
    res.json(functionResponse.json)
}