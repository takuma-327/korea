/**
 * Web Speech API — Korean pronunciation
 * Reads Korean text aloud using the browser's built-in TTS.
 */
(function () {
  "use strict";

  var synth = window.speechSynthesis;
  var currentUtterance = null;

  // 1. メインで使う「クリアな女性の声（Yuna）」を探す
  function getPreferredKoreanVoice() {
    var voices = synth.getVoices();
    return voices.find(function (v) {
      var isKo = v.lang === "ko-KR" || v.lang.startsWith("ko");
      return isKo && v.name.toLowerCase().includes("yuna");
    }) || null;
  }

  // 2. Yunaが喋れない時のための「バックアップの賢い声」を探す
  function getBackupKoreanVoice() {
    var voices = synth.getVoices();
    return voices.find(function (v) {
      var isKo = v.lang === "ko-KR" || v.lang.startsWith("ko");
      return isKo && !v.name.toLowerCase().includes("yuna");
    }) || null;
  }

  function speak(koreanText, button) {
    if (!koreanText || !synth) return;

    if (synth.speaking) {
      synth.cancel();
    }

    var utterance = new SpeechSynthesisUtterance(koreanText);
    utterance.lang = "ko-KR";
    utterance.rate = 0.95; 
    utterance.pitch = 1;

    // まずは女性の声（Yuna）をセットしてみる
    var mainVoice = getPreferredKoreanVoice();
    if (mainVoice) {
      utterance.voice = mainVoice;
    }

    if (button) {
      button.classList.add("speak-btn--speaking");
      button.disabled = true;
    }

    utterance.onend = function () {
      if (button) {
        button.classList.remove("speak-btn--speaking");
        button.disabled = false;
      }
      currentUtterance = null;
    };

    // ★ここが安全装置：もし女性の声でエラー（再生失敗）が起きたら、即座に別の声で鳴らし直す
    utterance.onerror = function (event) {
      console.log("メイン音声でエラーが発生したため、バックアップ音声に切り替えます:", event);
      
      if (button) {
        button.classList.remove("speak-btn--speaking");
        button.disabled = false;
      }
      
      // 1回きりのエラーなら、別の声でリトライ
      if (event.error !== 'interrupted') {
        var backupUtterance = new SpeechSynthesisUtterance(koreanText);
        backupUtterance.lang = "ko-KR";
        backupUtterance.rate = 0.95;
        
        var backupVoice = getBackupKoreanVoice();
        if (backupVoice) {
          backupUtterance.voice = backupVoice;
        }
        
        // リトライ側の制御
        if (button) {
          button.classList.add("speak-btn--speaking");
          button.disabled = true;
        }
        backupUtterance.onend = function () {
          if (button) {
            button.classList.remove("speak-btn--speaking");
            button.disabled = false;
          }
        };
        backupUtterance.onerror = function () {
          if (button) {
            button.classList.remove("speak-btn--speaking");
            button.disabled = false;
          }
        };
        
        synth.speak(backupUtterance);
      }
    };

    currentUtterance = utterance;
    synth.speak(utterance);
  }

  function initSpeakButtons() {
    document.querySelectorAll(".speak-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-korean");
        if (text) {
          speak(text, btn);
        }
      });
    });
  }

  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = function () {
      getPreferredKoreanVoice();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpeakButtons);
  } else {
    initSpeakButtons();
  }
})();
