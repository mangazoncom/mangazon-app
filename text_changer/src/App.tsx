/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  toHalfWidth, 
  toFullWidth, 
  toHiragana, 
  toKatakana,
  encodeByTextCode,
  decodeByTextCode
} from './utils/converter';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Settings, 
  RotateCcw, 
  FileText, 
  Info, 
  Type,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// サンプルテキスト
const SAMPLE_TEXTS = [
  {
    label: "混ぜ書きサンプル",
    text: "Ｔｅｓｔ １２３！ ｱｲｳｴｵ カタカナ（日本語　ｽﾍﾟｰｽ）\nメール: ｕｓｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ\nＴＥＬ： ０９０－１２３４－５６７８",
  },
  {
    label: "公的文書・住所",
    text: "東京都渋谷区神南１丁目２番３号　メゾン渋谷１０２号室\nＴＥＬ：０３（１２３４）５６７８",
  },
  {
    label: "半角カナ・英数",
    text: "ｲﾝﾀｰﾈｯﾄ ﾃｸﾉﾛｼﾞｰ Web Application 2026! #hoge #fuga",
  }
];

interface HistoryItem {
  id: string;
  timestamp: string;
  before: string;
  after: string;
  type: 'toHalf' | 'toFull' | 'toHiragana' | 'toKatakana';
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // 変換後を半角にするか全角にするかのターゲット選択
  const [targetWidth, setTargetWidth] = useState<'half' | 'full'>('half');

  // テキストコード（エンコーディング）の選択
  const [inputEncoding, setInputEncoding] = useState<string>('text');
  const [outputEncoding, setOutputEncoding] = useState<string>('text');

  // 変換オプション
  const [options, setOptions] = useState({
    alphanumeric: true, // 英数字
    katakana: true,     // カタカナ
    space: true,        // スペース
    symbol: true,       // 記号
  });

  // その他の設定
  const [realtime, setRealtime] = useState(true);
  const [activeTab, setActiveTab] = useState<'convert' | 'about'>('convert');
  const [isFullscreenInput, setIsFullscreenInput] = useState(false);
  const [isFullscreenOutput, setIsFullscreenOutput] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // 統計カウンタ
  const getStats = (text: string) => {
    if (!text) return { chars: 0, noSpaces: 0, bytes: 0, lines: 0 };
    const chars = text.length;
    const noSpaces = text.replace(/[\s　]/g, '').length;
    const lines = text.split('\n').length;
    
    // バイト数計算 (UTF-8を模倣)
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code <= 0x7f) {
        bytes += 1;
      } else if (code <= 0x7ff) {
        bytes += 2;
      } else if (code <= 0xffff) {
        bytes += 3;
      } else {
        bytes += 4;
      }
    }
    return { chars, noSpaces, bytes, lines };
  };

  const beforeStats = getStats(inputText);
  const afterStats = getStats(outputText);

  // 通知を表示
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  // 統合された一括変換フロー
  const executeConversion = (
    mode: 'half' | 'full' | 'hiragana' | 'katakana', 
    textToConvert: string
  ): string => {
    if (!textToConvert) return '';

    // 1. 必要に応じてデコード（入力形式が通常テキストでない場合）
    let decoded = textToConvert;
    if (inputEncoding !== 'text') {
      decoded = decodeByTextCode(textToConvert, inputEncoding);
    }

    // 2. メインの相互変換
    let converted = decoded;
    if (mode === 'half') {
      converted = toHalfWidth(decoded, options);
    } else if (mode === 'full') {
      converted = toFullWidth(decoded, options);
    } else if (mode === 'hiragana') {
      converted = toHiragana(decoded);
    } else if (mode === 'katakana') {
      converted = toKatakana(decoded);
    }

    // 3. 必要に応じてエンコード（出力形式が通常テキストでない場合）
    let finalResult = converted;
    if (outputEncoding !== 'text') {
      finalResult = encodeByTextCode(converted, outputEncoding);
    }

    return finalResult;
  };

  // リアルタイム変換
  useEffect(() => {
    if (realtime && inputText) {
      const converted = executeConversion(targetWidth, inputText);
      setOutputText(converted);
    } else if (!inputText) {
      setOutputText('');
    }
  }, [inputText, options, realtime, targetWidth, inputEncoding, outputEncoding]);

  // localStorageから履歴読み込み
  useEffect(() => {
    const saved = localStorage.getItem('conv_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("履歴の復元に失敗しました", e);
      }
    }
  }, []);

  // 履歴保存
  const saveToHistory = (before: string, after: string, type: HistoryItem['type']) => {
    if (!before.trim() || before === after) return;
    
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      before: before.length > 50 ? before.substring(0, 50) + "..." : before,
      after: after.length > 50 ? after.substring(0, 50) + "..." : after,
      type
    };

    setHistory(prev => {
      const updated = [newItem, ...prev.slice(0, 9)]; // 最大10件
      localStorage.setItem('conv_history', JSON.stringify(updated));
      return updated;
    });
  };

  // 変換アクション
  const handleConvert = (mode: 'half' | 'full') => {
    const res = executeConversion(mode, inputText);
    setOutputText(res);
    saveToHistory(inputText, res, mode === 'half' ? 'toHalf' : 'toFull');
    showNotification(mode === 'half' ? '半角に一括変換しました' : '全角に一括変換しました');
  };

  const handleToHiragana = () => {
    const res = executeConversion('hiragana', inputText);
    setOutputText(res);
    saveToHistory(inputText, res, 'toHiragana');
    showNotification('ひらがなに変換しました');
  };

  const handleToKatakana = () => {
    const res = executeConversion('katakana', inputText);
    setOutputText(res);
    saveToHistory(inputText, res, 'toKatakana');
    showNotification('カタカナに変換しました');
  };


  // コピー
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      showNotification('クリップボードにコピーしました！');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      showNotification('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // クリア
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    showNotification('入力内容をクリアしました');
  };

  // サンプル挿入
  const handleInsertSample = (sample: string) => {
    setInputText(sample);
    showNotification('サンプルテキストを入力しました');
  };

  // 履歴から読み込み
  const handleLoadHistory = (item: HistoryItem) => {
    // 履歴アイテム自体は短縮されているため、簡易的な適用をするか、あるいは履歴からそのまま使う
    // 今回はデモとしてbeforeに入力
    setInputText(item.before.replace('...', ''));
    showNotification('履歴からテキストを復元しました');
  };

  // 履歴クリア
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('conv_history');
    showNotification('履歴をクリアしました');
  };

  // オプション全選択/解除
  const toggleAllOptions = (val: boolean) => {
    setOptions({
      alphanumeric: val,
      katakana: val,
      space: val,
      symbol: val,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* 通知 */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700/50"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-md shadow-emerald-200/55 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" id="header_icon" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
                半角全角一括変換ツール
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unicode Width Translator - 一瞬で正確に文字幅を統一
              </p>
            </div>
          </div>

          {/* ナビゲーションタブ */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-sm">
            <button
              onClick={() => setActiveTab('convert')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'convert' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-convert"
            >
              変換ツール
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'about' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-about"
            >
              使い方・詳細
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {activeTab === 'convert' ? (
          <>
            {/* サンプル入力とリアルタイム設定エリア */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
                  サンプルを入力する:
                </span>
                {SAMPLE_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInsertSample(sample.text)}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={realtime} 
                      onChange={(e) => setRealtime(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      リアルタイム自動変換 ({targetWidth === 'half' ? '半角化' : '全角化'})
                    </span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {realtime ? "(自動実行)" : "(ボタンを押して実行)"}
                  </span>
                </div>
              </div>
            </div>

            {/* 変換方向の指定 (半角 ↔ 全角) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. 変換後の文字幅（全角・半角）を選択</h3>
                  <p className="text-xs text-slate-500 mt-0.5">変換する際、最終的な出力幅をどちらに統一するか決定します</p>
                </div>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto shrink-0">
                <button
                  onClick={() => setTargetWidth('half')}
                  className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    targetWidth === 'half'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="target-width-half"
                >
                  <ArrowRight className="w-4 h-4" />
                  半角に変換する
                </button>
                <button
                  onClick={() => setTargetWidth('full')}
                  className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    targetWidth === 'full'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="target-width-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  全角に変換する
                </button>
              </div>
            </div>

            {/* 変換設定＆オプションパネル */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  2. 変換する文字タイプを設定
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <button 
                    onClick={() => toggleAllOptions(true)} 
                    className="text-emerald-600 hover:underline font-medium cursor-pointer"
                  >
                    すべて選択
                  </button>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={() => toggleAllOptions(false)} 
                    className="text-slate-500 hover:underline font-medium cursor-pointer"
                  >
                    すべて解除
                  </button>
                </div>
              </div>

              {/* チェックボックスグリッド */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={options.alphanumeric}
                    onChange={(e) => setOptions({ ...options, alphanumeric: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">英数字</span>
                    <span className="text-[10px] text-slate-500">A-Z, a-z, 0-9 ↔ Ａ-Ｚ...</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={options.katakana}
                    onChange={(e) => setOptions({ ...options, katakana: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">カタカナ</span>
                    <span className="text-[10px] text-slate-500">ｱｲｳｴｵ ↔ アイウエオ</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={options.space}
                    onChange={(e) => setOptions({ ...options, space: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">スペース</span>
                    <span className="text-[10px] text-slate-500">[ ] (半角) ↔ [　] (全角)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={options.symbol}
                    onChange={(e) => setOptions({ ...options, symbol: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">記号</span>
                    <span className="text-[10px] text-slate-500">!, #, $, % ↔ ！, ＃...</span>
                  </div>
                </label>
              </div>
            </div>

            {/* テキストエリアとコンバータ本体 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* 入力側 */}
              <div className={`bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col transition-all duration-300 ${
                isFullscreenInput ? 'fixed inset-4 z-50 bg-white shadow-2xl m-0' : 'relative h-[480px]'
              }`}>
                {/* テキストエリアヘッダー */}
                <div className="px-4 py-3 bg-slate-50/75 border-b border-slate-200 rounded-t-xl flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-slate-900">3. 入力元のテキスト</span>
                  </div>
                  
                  {/* テキストコードの選択 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <Code className="w-3.5 h-3.5 text-slate-500 ml-1" />
                    <span className="text-[10px] font-bold text-slate-600">テキストコード:</span>
                    <select
                      value={inputEncoding}
                      onChange={(e) => setInputEncoding(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      id="input_encoding_select"
                    >
                      <optgroup label="📝 メモ帳 (Notepad) 文字コード">
                        <option value="text">UTF-8 / 通常テキスト</option>
                        <option value="notepad_utf8_bom">UTF-8 (BOM付き16進)</option>
                        <option value="notepad_sjis">ANSI / Shift_JIS (16進)</option>
                        <option value="notepad_utf16_le">UTF-16 LE (Unicode 16進)</option>
                        <option value="notepad_utf16_be">UTF-16 BE (Unicode BE 16進)</option>
                      </optgroup>
                      <optgroup label="🛠️ その他のコード表現">
                        <option value="notepad_utf8">UTF-8 (純16進表現)</option>
                        <option value="url">URLエンコード (%XX)</option>
                        <option value="unicode">Unicodeエスケープ (\uXXXX)</option>
                        <option value="html_hex">HTML数値文字参照 (16進数)</option>
                        <option value="html_dec">HTML数値文字参照 (10進数)</option>
                        <option value="base64">Base64</option>
                        <option value="ansi_sjis_hex">ANSI / Shift_JIS (旧16進)</option>
                        <option value="ansi_sjis_url">ANSI / Shift_JIS (％エンコード)</option>
                        <option value="ansi_escape">ANSI エスケープ (\x1b表示)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsFullscreenInput(!isFullscreenInput)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title={isFullscreenInput ? "縮小" : "全画面表示"}
                    >
                      {isFullscreenInput ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={!inputText}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-55 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                      title="クリア"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* テキストエリア本体 */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="ここに変換したいテキストを入力、または貼り付けしてください。"
                    className="w-full h-full p-4 resize-none border-0 focus:ring-0 focus:outline-none text-slate-800 text-sm leading-relaxed placeholder-slate-400 font-sans"
                    id="input_textarea"
                  />
                </div>

                {/* フッター・文字数統計 */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center text-xs text-slate-500 font-mono">
                  <div className="flex gap-4">
                    <span>
                      文字数: <strong className="text-slate-800">{beforeStats.chars}</strong>
                    </span>
                    <span className="hidden sm:inline">
                      スペース除く: <strong className="text-slate-800">{beforeStats.noSpaces}</strong>
                    </span>
                    <span className="hidden sm:inline">
                      行数: <strong className="text-slate-800">{beforeStats.lines}</strong>
                    </span>
                  </div>
                  <div>
                    <span>{beforeStats.bytes} バイト</span>
                  </div>
                </div>
              </div>

              {/* 出力側 */}
              <div className={`bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col transition-all duration-300 ${
                isFullscreenOutput ? 'fixed inset-4 z-50 bg-white shadow-2xl m-0' : 'relative h-[480px]'
              }`}>
                {/* テキストエリアヘッダー */}
                <div className="px-4 py-3 bg-slate-50/75 border-b border-slate-200 rounded-t-xl flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                    <span className="text-sm font-bold text-slate-900">4. 変換後のテキスト</span>
                  </div>

                  {/* テキストコードの選択 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <Code className="w-3.5 h-3.5 text-slate-500 ml-1" />
                    <span className="text-[10px] font-bold text-slate-600">テキストコード:</span>
                    <select
                      value={outputEncoding}
                      onChange={(e) => setOutputEncoding(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                      id="output_encoding_select"
                    >
                      <optgroup label="📝 メモ帳 (Notepad) 文字コード">
                        <option value="text">UTF-8 / 通常テキスト</option>
                        <option value="notepad_utf8_bom">UTF-8 (BOM付き16進)</option>
                        <option value="notepad_sjis">ANSI / Shift_JIS (16進)</option>
                        <option value="notepad_utf16_le">UTF-16 LE (Unicode 16進)</option>
                        <option value="notepad_utf16_be">UTF-16 BE (Unicode BE 16進)</option>
                      </optgroup>
                      <optgroup label="🛠️ その他のコード表現">
                        <option value="notepad_utf8">UTF-8 (純16進表現)</option>
                        <option value="url">URLエンコード (%XX)</option>
                        <option value="unicode">Unicodeエスケープ (\uXXXX)</option>
                        <option value="html_hex">HTML数値文字参照 (16進数)</option>
                        <option value="html_dec">HTML数値文字参照 (10進数)</option>
                        <option value="base64">Base64</option>
                        <option value="ansi_sjis_hex">ANSI / Shift_JIS (旧16進)</option>
                        <option value="ansi_sjis_url">ANSI / Shift_JIS (％エンコード)</option>
                        <option value="ansi_escape">ANSI エスケープ (\x1b表示)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsFullscreenOutput(!isFullscreenOutput)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title={isFullscreenOutput ? "縮小" : "全画面表示"}
                    >
                      {isFullscreenOutput ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={!outputText}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-45 disabled:hover:bg-transparent disabled:text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                      title="変換後をコピー"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* テキストエリア本体 */}
                <div className="flex-1 relative bg-slate-50/30">
                  <textarea
                    readOnly
                    value={outputText}
                    placeholder="変換後の文字列がここに表示されます。"
                    className="w-full h-full p-4 resize-none border-0 focus:ring-0 focus:outline-none text-slate-900 text-sm leading-relaxed placeholder-slate-400 font-sans"
                    id="output_textarea"
                  />
                  
                  {/* ロールオーバー的なクイックコピーボタン */}
                  {outputText && (
                    <button
                      onClick={handleCopy}
                      className="absolute bottom-4 right-4 bg-emerald-600 active:scale-95 text-white shadow-lg shadow-emerald-600/20 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? "コピー完了!" : "クリップボードにコピー"}</span>
                    </button>
                  )}
                </div>

                {/* フッター・文字数統計 */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center text-xs text-slate-500 font-mono">
                  <div className="flex gap-4">
                    <span>
                      文字数: <strong className="text-slate-800">{afterStats.chars}</strong>
                      {beforeStats.chars !== afterStats.chars && (
                        <span className="text-xs text-red-500 ml-1">
                          ({afterStats.chars - beforeStats.chars > 0 ? `+${afterStats.chars - beforeStats.chars}` : afterStats.chars - beforeStats.chars})
                        </span>
                      )}
                    </span>
                    <span className="hidden sm:inline">
                      行数: <strong className="text-slate-800">{afterStats.lines}</strong>
                    </span>
                  </div>
                  <div>
                    <span>
                      {afterStats.bytes} バイト
                      {beforeStats.bytes !== afterStats.bytes && (
                        <span className={`text-xs ml-1 ${afterStats.bytes - beforeStats.bytes < 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ({afterStats.bytes - beforeStats.bytes < 0 ? '' : '+'}{afterStats.bytes - beforeStats.bytes}B)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 一括変換のオペレーションコントロール */}
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    変換アクション
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    入力された文字列に対して、設定されたオプションに基づいて一括で変換を適用します。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleConvert(targetWidth)}
                    disabled={!inputText}
                    className={`flex-1 sm:flex-initial text-sm font-semibold text-white px-6 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 ${
                      targetWidth === 'half' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' 
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'
                    }`}
                  >
                    {targetWidth === 'half' ? <ArrowRight className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    <span>選択された方向（{targetWidth === 'half' ? '半角' : '全角'}）に変換する</span>
                  </button>
                </div>
              </div>

              {/* 追加の変換（ひらがな化・カタカナ化等） */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-medium">
                  アドバンスド変換 (全文字対象):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleToHiragana}
                    disabled={!inputText}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700/60 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Type className="w-3.5 h-3.5" />
                    ひらがなにする
                  </button>
                  <button
                    onClick={handleToKatakana}
                    disabled={!inputText}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700/60 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Type className="w-3.5 h-3.5 animate-pulse" />
                    カタカナにする
                  </button>
                </div>
              </div>
            </div>

            {/* 変換履歴 */}
            {history.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    最近の変換履歴 (最大10件)
                  </h4>
                  <button 
                    onClick={handleClearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    履歴を消去
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleLoadHistory(item)}
                      className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-md cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.type === 'toHalf' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          item.type === 'toFull' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {item.type === 'toHalf' ? '半角化' :
                           item.type === 'toFull' ? '全角化' :
                           item.type === 'toHiragana' ? 'ひらがな' : 'カタカナ'}
                        </span>
                        <span className="text-slate-400 shrink-0 font-mono">{item.timestamp}</span>
                        <span className="text-slate-700 truncate font-mono max-w-[200px] sm:max-w-md">{item.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-slate-600 truncate font-mono max-w-[200px] sm:max-w-md">{item.after}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        元テキストを復元
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ヘルプ・詳細タブ */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                本アプリケーションの使い方と仕様
              </h2>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                この「半角全角一括変換ツール」は、原稿、プログラミングコード、住所データ、データベース登録情報などで発生しがちな「半角と全角が混ざってしまっている状態」を、任意のルールに従って一瞬で綺麗に統一するためのWebアプリです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  半角化（toHalfWidth）のルール
                </h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li><strong>全角英数字:</strong> 「Ａ-Ｚ, ａ-ｚ, ０-９」を「A-Z, a-z, 0-9」に書き換えます。</li>
                  <li><strong>全角カタカナ:</strong> 「アイウエオ」を「ｱｲｳｴｵ」に変換します。「ガ」「パ」は濁点つきの「ｶﾞ」「ﾊﾟ」のように2文字に分解されます。</li>
                  <li><strong>スペース:</strong> 全角スペース「　」を標準の半角スペース「 」に書き換えます。</li>
                  <li><strong>全角記号:</strong> 「！」「＃」「＆」「（」などの標準記号をASCII半角記号にします。</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  全角化（toFullWidth）のルール
                </h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li><strong>半角英数字:</strong> 「A-Z, a-z, 0-9」を全角の「Ａ-Ｚ, ａ-ｚ, ０-９」にします。</li>
                  <li><strong>半角カタカナ:</strong> 「ｱｲｳｴｵ」を「アイウエオ」にします。後ろに濁点「ﾞ」や半濁点「ﾟ」がくっついている場合は、「ｶﾞ」→「ガ」、「ﾊﾟ」→「パ」と正しく1文字に合体されます。</li>
                  <li><strong>スペース:</strong> 半角スペース「 」を全角スペース「　」に書き換えます。</li>
                  <li><strong>半角記号:</strong> ASCIIの半角記号をすべて対応する全角記号に書き換えます。</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4 text-slate-500" />
                オフラインでの Windows `.bat` 起動機能について
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                本Webツールはインターネット環境がなくても、お使いのパソコンに Node.js がインストールされていれば、リポジトリ内の <strong>`start.bat`</strong> をダブルクリックするだけで、ローカルサーバーが起動して、お使いのブラウザ上で全く同じ機能を利用できます。社内秘のテキストや個人情報を外部サーバーに送信することなく、完全にお手元の環境だけで安全に変換作業を行うことができます。
              </p>
              <div className="bg-slate-900 text-slate-300 p-3.5 rounded-lg font-mono text-xs">
                <div># Windowsでのローカル起動方法:</div>
                <div className="text-emerald-400 mt-1">1. プロジェクトルートにある `start.bat` をダブルクリックする</div>
                <div className="text-slate-400 mt-0.5">※ 自動的にライブラリがインストールされ、ブラウザで http://localhost:3000 が開きます。</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 半角全角一括変換ツール. 全ての処理はブラウザローカルで安全に実行されます。</p>
          <div className="flex gap-4">
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-semibold tracking-wide">
              Secure Local Processing
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
