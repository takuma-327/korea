/**
 * Web Speech API — Korean pronunciation
 * Reads Korean text aloud using the browser's built-in TTS.
 */
(function () {
  "use strict";

  var synth = window.speechSynthesis;
  var currentUtterance = null;

  // ★ 韓国語の「クリアな女性音声（Yunaなど）」を最優先で探す関数に修正
  function getKoreanVoice() {
    var voices = synth.getVoices();
    
    // 1. まずは韓国語で、かつ名前に「Yuna」または「Google」が含まれる女性らしい声を探す
    var preferredVoice = voices.find(function (v) {
      var isKo = v.lang === "ko-KR" || v.lang.startsWith("ko");
      var nameLower = v.name.toLowerCase();
      return isKo && (nameLower.includes("yuna") || nameLower.includes("google"));
    });

    if (preferredVoice) return preferredVoice;

    // 2. もし見つからなければ、通常の韓国語の音声を探す
    var koVoice = voices.find(function (v) {
      return v.lang === "ko-KR" || v.lang.startsWith("ko");
    });
    
    return koVoice || null;
  }

  function speak(koreanText, button) {
    if (!koreanText || !synth) return;

    if (synth.speaking) {
      synth.cancel();
    }

    var utterance = new SpeechSynthesisUtterance(koreanText);
    utterance.lang = "ko-KR";
    // ★ 聞き取りやすいようにスピードをほんの少し（0.9から0.95に）調整
    utterance.rate = 0.95; 
    utterance.pitch = 1;

    var voice = getKoreanVoice();
    if (voice) {
      utterance.voice = voice;
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

    utterance.onerror = function () {
      if (button) {
        button.classList.remove("speak-btn--speaking");
        button.disabled = false;
      }
      currentUtterance = null;
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
      getKoreanVoice();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpeakButtons);
  } else {
    initSpeakButtons();
  }
})();
