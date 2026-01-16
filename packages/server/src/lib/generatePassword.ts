import _generatePassword from "omgopass";

export function generatePassword() {
  return _generatePassword({
    hasNumbers: false,
    titlecased: false,
  })
}