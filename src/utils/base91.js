const base91chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

/* base91 인코딩*/
export const encodeBase91 = (inputBuffer) => {
  let b = 0,
    n = 0,
    output = "";

  for (let i = 0; i < inputBuffer.length; i++) {
    b |= inputBuffer[i] << n;
    n += 8;

    if (n > 13) {
      let v = b & 8191;
      if (v > 88) {
        b >>= 13;
        n -= 13;
      } else {
        v = b & 16383;
        b >>= 14;
        n -= 14;
      }
      output += base91chars[v % 91] + base91chars[Math.floor(v / 91)];
    }
  }

  if (n) {
    output += base91chars[b % 91];
    if (n > 7 || b > 90) {
      output += base91chars[Math.floor(b / 91)];
    }
  }

  return output;
};
