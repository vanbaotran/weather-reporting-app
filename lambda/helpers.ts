export interface HttpResponse {
    statusCode: number;
    body: any;
}

export function getCurrentHourTimestamp() : number {
    return Math.floor(Date.now() / 3600000) * 3600;
}

export function createHttpResponse(statusCode: number, body: any): HttpResponse {
    return {
        statusCode,
        body: JSON.stringify(body)
    }
}
