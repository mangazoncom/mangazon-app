/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Encoding from 'encoding-japanese';

// カタカナのマッピング
export const KANA_FULL_TO_HALF: { [key: string]: string } = {
  'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
  'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ', 'ッ': 'ｯ',
  'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
  'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
  'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
  'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
  'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
  'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
  'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
  'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
  'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
  'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
  'ー': 'ｰ', '、': '､', '。': '｡', '・': '･', '「': '｢', '」': '｣',
  'ヮ': 'ヮ', 'ヰ': 'ヰ', 'ヱ': 'ヱ', 'ヵ': 'ヵ', 'ヶ': 'ヶ'
};

export const KANA_DAKUTEN_FULL_TO_HALF: { [key: string]: string } = {
  'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
  'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
  'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
  'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
  'ヴ': 'ｳﾞ',
};

export const KANA_HANDAKUTEN_FULL_TO_HALF: { [key: string]: string } = {
  'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
};

// 逆マップの構築（半角から全角用）
export const KANA_DAKUTEN_HALF_TO_FULL: { [key: string]: string } = {};
export const KANA_HANDAKUTEN_HALF_TO_FULL: { [key: string]: string } = {};
export const KANA_HALF_TO_FULL: { [key: string]: string } = {};

// マップの初期化
Object.entries(KANA_DAKUTEN_FULL_TO_HALF).forEach(([full, half]) => {
  KANA_DAKUTEN_HALF_TO_FULL[half] = full;
});
Object.entries(KANA_HANDAKUTEN_FULL_TO_HALF).forEach(([full, half]) => {
  KANA_HANDAKUTEN_HALF_TO_FULL[half] = full;
});
Object.entries(KANA_FULL_TO_HALF).forEach(([full, half]) => {
  KANA_HALF_TO_FULL[half] = full;
});

// 手動での補正・特殊マッピング
KANA_DAKUTEN_HALF_TO_FULL['ｳﾞ'] = 'ヴ';

/**
 * 全角から半角へ一括変換する
 */
export function toHalfWidth(text: string, options: {
  alphanumeric: boolean;
  katakana: boolean;
  space: boolean;
  symbol: boolean;
}): string {
  if (!text) return '';
  let result = text;

  // 1. カタカナ変換（濁点・半濁点を優先）
  if (options.katakana) {
    // 濁点
    for (const [full, half] of Object.entries(KANA_DAKUTEN_FULL_TO_HALF)) {
      result = result.replaceAll(full, half);
    }
    // 半濁点
    for (const [full, half] of Object.entries(KANA_HANDAKUTEN_FULL_TO_HALF)) {
      result = result.replaceAll(full, half);
    }
    // 通常カナ
    for (const [full, half] of Object.entries(KANA_FULL_TO_HALF)) {
      result = result.replaceAll(full, half);
    }
  }

  // 2. スペース変換 (全角スペース → 半角スペース)
  if (options.space) {
    result = result.replaceAll('　', ' ');
  }

  // 3. 英数字および記号
  // 全角英数字記号の範囲: U+FF01 (！) から U+FF5E (～)
  if (options.alphanumeric || options.symbol) {
    result = result.replace(/[\uFF01-\uFF5E]/g, (match) => {
      const code = match.charCodeAt(0);
      const halfCode = code - 0xFEE0;
      
      const isAlphaNum = 
        (halfCode >= 0x30 && halfCode <= 0x39) || // 0-9
        (halfCode >= 0x41 && halfCode <= 0x5A) || // A-Z
        (halfCode >= 0x61 && halfCode <= 0x7A);   // a-z
      
      if (isAlphaNum && options.alphanumeric) {
        return String.fromCharCode(halfCode);
      } else if (!isAlphaNum && options.symbol) {
        return String.fromCharCode(halfCode);
      }
      return match;
    });
  }

  return result;
}

/**
 * 半角から全角へ一括変換する
 */
export function toFullWidth(text: string, options: {
  alphanumeric: boolean;
  katakana: boolean;
  space: boolean;
  symbol: boolean;
}): string {
  if (!text) return '';
  let result = text;

  // 1. カタカナ変換
  if (options.katakana) {
    // 濁点 (2文字の半角 「ｶﾞ」 などを優先して1文字の 「ガ」 に)
    for (const [half, full] of Object.entries(KANA_DAKUTEN_HALF_TO_FULL)) {
      result = result.replaceAll(half, full);
    }
    // 半濁点
    for (const [half, full] of Object.entries(KANA_HANDAKUTEN_HALF_TO_FULL)) {
      result = result.replaceAll(half, full);
    }
    // 通常カナ
    for (const [half, full] of Object.entries(KANA_HALF_TO_FULL)) {
      result = result.replaceAll(half, full);
    }
  }

  // 2. スペース変換 (半角スペース → 全角スペース)
  if (options.space) {
    result = result.replaceAll(' ', '　');
  }

  // 3. 英数字および記号
  // 半角英数字記号の範囲: U+0021 (!) から U+007E (~)
  if (options.alphanumeric || options.symbol) {
    result = result.replace(/[\u0021-\u007E]/g, (match) => {
      const code = match.charCodeAt(0);
      
      const isAlphaNum = 
        (code >= 0x30 && code <= 0x39) || // 0-9
        (code >= 0x41 && code <= 0x5A) || // A-Z
        (code >= 0x61 && code <= 0x7A);   // a-z
      
      if (isAlphaNum && options.alphanumeric) {
        return String.fromCharCode(code + 0xFEE0);
      } else if (!isAlphaNum && options.symbol) {
        return String.fromCharCode(code + 0xFEE0);
      }
      return match;
    });
  }

  return result;
}

/**
 * 全角カタカナをひらがなに変換
 */
export function toHiragana(text: string): string {
  if (!text) return '';
  // まず全角カタカナをひらがなに置換。カタカナのコード範囲: U+30A1 (ァ) 〜 U+30F6 (ヶ)
  // ひらがなのコードはそれより 0x60 小さい
  return text.replace(/[\u30A1-\u30F6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * ひらがなを全角カタカナに変換
 */
export function toKatakana(text: string): string {
  if (!text) return '';
  // ひらがなのコード範囲: U+3041 (ぁ) 〜 U+3096 (ゖ)
  // カタカナのコードはそれより 0x60 大きい
  return text.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * 各種テキストコード(エンコード)形式への変換
 */
export function encodeByTextCode(text: string, format: string): string {
  if (!text) return '';
  try {
    switch (format) {
      case 'url':
        return encodeURIComponent(text);
      case 'unicode':
        return text.split('').map(char => {
          const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
          return `\\u${code}`;
        }).join('');
      case 'html_hex':
        return text.split('').map(char => {
          const code = char.charCodeAt(0).toString(16).toUpperCase();
          return `&#x${code};`;
        }).join('');
      case 'html_dec':
        return text.split('').map(char => {
          return `&#${char.charCodeAt(0)};`;
        }).join('');
      case 'base64':
        // UTF-8文字列をサポートする形式でのBase64変換
        return btoa(unescape(encodeURIComponent(text)));
      case 'notepad_utf8': {
        // 通常のUTF-8を16進数バイト列表現にする
        const unicodeArray = Encoding.stringToCode(text);
        const utf8Array = Encoding.convert(unicodeArray, 'UTF8', 'UNICODE');
        return utf8Array.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'notepad_utf8_bom': {
        // UTF-8 with BOM (EF BB BF) 16進数表現
        const unicodeArray = Encoding.stringToCode(text);
        const utf8Array = Encoding.convert(unicodeArray, 'UTF8', 'UNICODE');
        const bom = [0xEF, 0xBB, 0xBF];
        return [...bom, ...utf8Array].map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'notepad_sjis': {
        // ANSI / Shift_JIS の16進
        const unicodeArray = Encoding.stringToCode(text);
        const sjisArray = Encoding.convert(unicodeArray, 'SJIS', 'UNICODE');
        return sjisArray.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'notepad_utf16_le': {
        // UTF-16 LE (FF FE) 16進表現
        const bytes = [0xFF, 0xFE]; // BOM
        for (let i = 0; i < text.length; i++) {
          const code = text.charCodeAt(i);
          bytes.push(code & 0xFF);          // Low Byte
          bytes.push((code >> 8) & 0xFF);   // High Byte
        }
        return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'notepad_utf16_be': {
        // UTF-16 BE (FE FF) 16進表現
        const bytes = [0xFE, 0xFF]; // BOM
        for (let i = 0; i < text.length; i++) {
          const code = text.charCodeAt(i);
          bytes.push((code >> 8) & 0xFF);   // High Byte
          bytes.push(code & 0xFF);          // Low Byte
        }
        return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'ansi_sjis_hex': {
        const unicodeArray = Encoding.stringToCode(text);
        const sjisArray = Encoding.convert(unicodeArray, 'SJIS', 'UNICODE');
        return sjisArray.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      }
      case 'ansi_sjis_url': {
        const unicodeArray = Encoding.stringToCode(text);
        const sjisArray = Encoding.convert(unicodeArray, 'SJIS', 'UNICODE');
        return Encoding.urlEncode(sjisArray);
      }
      case 'ansi_escape': {
        // ANSI エスケープの仮文字列表記化 (\u001b を \\x1b に)
        return text.replace(/\u001b/g, '\\x1b');
      }
      case 'text':
      default:
        return text;
    }
  } catch (error) {
    console.error("Encoding error:", error);
    return `[エラー] 変換に失敗しました: ${(error as Error).message}`;
  }
}

/**
 * 各種テキストコード(エンコード)形式からの復元（デコード）
 */
export function decodeByTextCode(text: string, format: string): string {
  if (!text) return '';
  try {
    switch (format) {
      case 'url':
        return decodeURIComponent(text);
      case 'unicode':
        return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
      case 'html_hex':
        return text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
      case 'html_dec':
        return text.replace(/&#([0-9]+);/g, (_, dec) => {
          return String.fromCharCode(parseInt(dec, 10));
        });
      case 'base64':
        return decodeURIComponent(escape(atob(text)));
      case 'notepad_utf8': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        const bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        const unicodeArray = Encoding.convert(bytes, 'UNICODE', 'UTF8');
        return Encoding.codeToString(unicodeArray);
      }
      case 'notepad_utf8_bom': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        let bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        // BOM（EF BB BF）をトリム
        if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
          bytes = bytes.slice(3);
        }
        const unicodeArray = Encoding.convert(bytes, 'UNICODE', 'UTF8');
        return Encoding.codeToString(unicodeArray);
      }
      case 'notepad_sjis': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        const bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        const unicodeArray = Encoding.convert(bytes, 'UNICODE', 'SJIS');
        return Encoding.codeToString(unicodeArray);
      }
      case 'notepad_utf16_le': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        let bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        // BOM（FF FE）をトリム
        let startIdx = 0;
        if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
          startIdx = 2;
        }
        let resStr = '';
        for (let i = startIdx; i < bytes.length; i += 2) {
          if (i + 1 < bytes.length) {
            const charCode = bytes[i] | (bytes[i + 1] << 8);
            resStr += String.fromCharCode(charCode);
          }
        }
        return resStr;
      }
      case 'notepad_utf16_be': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        let bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        // BOM（FE FF）をトリム
        let startIdx = 0;
        if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
          startIdx = 2;
        }
        let resStr = '';
        for (let i = startIdx; i < bytes.length; i += 2) {
          if (i + 1 < bytes.length) {
            const charCode = (bytes[i] << 8) | bytes[i + 1];
            resStr += String.fromCharCode(charCode);
          }
        }
        return resStr;
      }
      case 'ansi_sjis_hex': {
        const hexStr = text.replace(/[^0-9a-fA-F]/g, '');
        const bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
        }
        const unicodeArray = Encoding.convert(bytes, 'UNICODE', 'SJIS');
        return Encoding.codeToString(unicodeArray);
      }
      case 'ansi_sjis_url': {
        const urlDecoded = Encoding.urlDecode(text);
        const unicodeArray = Encoding.convert(urlDecoded, 'UNICODE', 'SJIS');
        return Encoding.codeToString(unicodeArray);
      }
      case 'ansi_escape': {
        // ANSI エスケープ文字カラーコード（\x1b[31m など）のストリップ
        const withRealEsc = text.replace(/\\x1b|\\033|\\u001b/gi, '\u001b');
        return withRealEsc.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
      }
      case 'text':
      default:
        return text;
    }
  } catch (error) {
    console.error("Decoding error:", error);
    return text; // デコード失敗時はそのまま返すかエラー表示
  }
}

