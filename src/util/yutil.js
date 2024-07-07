import { YKeyValue } from "y-utility/y-keyvalue";

/**
 * Converts a YKeyValue instance to a plain JavaScript object
 * 
 * @param {YKeyValue} ykv - YKeyValue instance to convert
 * @returns {Object} plain JavaScript object representing the YKeyValue
 */
export function yKeyValueToJsonObj(ykv) {
    const obj = {};
    ykv.map.forEach((value, key) => {
        obj[key] = value.val;
    });
    return obj;
}

/**
 * Populates a YKeyValue instance from a plain JavaScript object
 * 
 * @param {Object} jsonObj - plain JavaScript object to convert
 * @param {YKeyValue} ykv - YKeyValue instance to populate
 */
export function jsonObjToYKeyValue(jsonObj, ykv) {
    for (const [key, value] of Object.entries(jsonObj)) {
        ykv.set(key, value);
    }
}