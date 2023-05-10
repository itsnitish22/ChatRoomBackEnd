function wrapResponse(responseCode, responseMessage = null, responseData) {
    return {
        statusCode: responseCode,
        message: responseMessage,
        data: responseData
    }
}

module.exports = {
    wrapResponse
}