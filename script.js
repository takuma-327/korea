/**
 * Web Speech API — Korean pronunciation
 * Reads Korean text aloud using the browser's built-in TTS.
 */
(function () {
  "use strict";

  var synth = window.speechSynthesis;
  var currentUtterance = null;

  function getKoreanVoice() {
    var voices = synth.getVoices();
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
    utterance.rate = 0.9;
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
