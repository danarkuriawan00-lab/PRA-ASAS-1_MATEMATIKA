(function () {
  const gate = document.getElementById("gate");
  const interrupt = document.getElementById("interrupt");
  const app = document.getElementById("app");
  const flash = document.getElementById("flash");
  const btnMulai = document.getElementById("btn-mulai");
  const STATUS_KEY = "IPAS-soal-status";

  let aktif = false;
  let terkunci = false;

  function bacaStatus() {
    try {
      return sessionStorage.getItem(STATUS_KEY);
    } catch (e) {
      return null;
    }
  }

  function simpanStatus(nilai) {
    try {
      sessionStorage.setItem(STATUS_KEY, nilai);
    } catch (e) {}
  }

  function isFullscreen() {
    return Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
  }

  function mintaFullscreen() {
    const el = document.documentElement;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (!req) return Promise.resolve();
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("portrait").catch(function () {});
      }
    } catch (e) {}
    return Promise.resolve(req.call(el)).catch(function () {});
  }

  function sembunyikanBilahAlamat() {
    window.scrollTo(0, 1);
    document.documentElement.style.height = window.innerHeight + "px";
    document.body.style.height = window.innerHeight + "px";
  }

  function kunciRiwayat() {
    history.pushState({ soalLock: 1 }, "", location.href);
  }

  function bukaSoal() {
    if (terkunci) return;
    aktif = true;
    simpanStatus("aktif");
    gate.classList.add("hidden");
    interrupt.classList.add("hidden");
    app.classList.remove("hidden");
    kunciRiwayat();
    sembunyikanBilahAlamat();
  }

  function tutupSoal() {
    if (terkunci) {
      app.classList.add("hidden");
      gate.classList.add("hidden");
      interrupt.classList.remove("hidden");
      return;
    }
    if (!aktif) return;
    aktif = false;
    terkunci = true;
    simpanStatus("terkunci");
    app.classList.add("hidden");
    gate.classList.add("hidden");
    interrupt.classList.remove("hidden");
  }

  function pulihkanKunci() {
    const status = bacaStatus();
    if (status !== "terkunci" && status !== "aktif") return false;
    aktif = false;
    terkunci = true;
    simpanStatus("terkunci");
    gate.classList.add("hidden");
    app.classList.add("hidden");
    interrupt.classList.remove("hidden");
    return true;
  }

  function mulai() {
    if (terkunci || pulihkanKunci()) return;
    mintaFullscreen().finally(function () {
      bukaSoal();
    });
  }

  pulihkanKunci();
  btnMulai.addEventListener("click", mulai);

  document.addEventListener("fullscreenchange", function () {
    if (aktif && !isFullscreen()) tutupSoal();
  });
  document.addEventListener("webkitfullscreenchange", function () {
    if (aktif && !isFullscreen()) tutupSoal();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) tutupSoal();
  });

  window.addEventListener("pagehide", tutupSoal);
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) pulihkanKunci();
  });

  window.addEventListener("popstate", function () {
    kunciRiwayat();
    if (aktif) tutupSoal();
  });

  window.addEventListener("resize", function () {
    if (aktif && !terkunci) sembunyikanBilahAlamat();
  });
  window.addEventListener("orientationchange", function () {
    if (aktif && !terkunci) {
      setTimeout(sembunyikanBilahAlamat, 80);
    }
  });

  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  ["copy", "cut", "paste", "dragstart", "selectstart"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      e.preventDefault();
    });
  });

  ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
    document.addEventListener(
      ev,
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );
  });

  function blokirPintasan(e) {
    const k = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    const dilarang =
      k === "PrintScreen" ||
      k === "F12" ||
      k === "F11" ||
      k === "F5" ||
      k === "Refresh" ||
      k === "BrowserRefresh" ||
      (ctrl && (k === "r" || k === "R")) ||
      (ctrl && (k === "p" || k === "P")) ||
      (ctrl && (k === "s" || k === "S")) ||
      (ctrl && (k === "u" || k === "U")) ||
      (ctrl && (k === "c" || k === "C")) ||
      (ctrl && (k === "x" || k === "X")) ||
      (ctrl && (k === "a" || k === "A")) ||
      (ctrl && (k === "o" || k === "O")) ||
      (ctrl && (k === "n" || k === "N")) ||
      (ctrl && (k === "t" || k === "T")) ||
      (ctrl && (k === "w" || k === "W")) ||
      (ctrl && (k === "Tab" || k === "tab")) ||
      (ctrl && shift && (k === "i" || k === "I")) ||
      (ctrl && shift && (k === "j" || k === "J")) ||
      (ctrl && shift && (k === "c" || k === "C")) ||
      (ctrl && shift && (k === "n" || k === "N")) ||
      (alt && k === "Tab") ||
      e.keyCode === 44 ||
      e.keyCode === 116;

    if (!dilarang) return;

    e.preventDefault();
    e.stopPropagation();

    if (k === "PrintScreen" || e.keyCode === 44) {
      flash.classList.remove("hidden");
      setTimeout(function () {
        flash.classList.add("hidden");
      }, 1500);
      tutupSoal();
    }

    if (k === "F5" || e.keyCode === 116 || (ctrl && (k === "r" || k === "R"))) {
      tutupSoal();
    }
  }

  document.addEventListener("keydown", blokirPintasan, true);
  document.addEventListener("keyup", blokirPintasan, true);

  window.addEventListener("beforeprint", function (e) {
    e.preventDefault();
    tutupSoal();
  });
})();
