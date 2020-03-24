/**
 * @apiDefine AuthBearerHeader
 * @apiHeader {String} Authorization
 * 以`"Bearer "+access_token`的格式將access_token帶入header裡
 * @apiHeaderExample {json} Request Header Example:
 * {
 *  "Authorization":"Bearer XXXXXXXXXXXXX"
 * }
 */

/**
 * @apiDefine APIError
 * @apiErrorExample {json} Error Response:
 * HTTP status會依照不同錯誤而有所不同，但統一的返回格式如下
 * {
 *  "status":"ERROR", "code":"錯誤碼", "message":"錯誤訊息"
 * }
 */
