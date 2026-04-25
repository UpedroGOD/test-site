const eventDate = new Date("2026-05-24T13:00:00-03:00");
const countdownElement = document.querySelector(".countdown");
const whatsappLinks = document.querySelectorAll(".message-link");
const presenceForm = document.querySelector("#presence-form");
const guestNameInput = document.querySelector("#guest-name");
const whatsappNameInput = document.querySelector("#guest-name-whatsapp");
const presenceFeedback = document.querySelector("#presence-feedback");
const whatsappCard = document.querySelector("#whatsapp-card");
const whatsappConfirmButton = document.querySelector("#whatsapp-confirm-button");
const whatsappFeedback = document.querySelector("#whatsapp-feedback");
const animatedNames = document.querySelectorAll(".name-boy, .name-girl");
const addressCopyFields = document.querySelectorAll(".address-copy-field");
const copyToast = document.querySelector("#copy-toast");
const inviteConfig = window.INVITE_CONFIG || {};
const whatsappNumber = "5531993586484";
const whatsappMessageTemplate =
  "Oi, eu (nome da pessoa)! Estou confirmando minha presença no chá revelação do dia 24 de maio 💙💖\n\nVai ser um prazer estar com vocês nesse momento tão especial e cheio de amor! Pode deixar que levarei as fraldas com todo carinho 😍";
const initialGirlAnimationDelay = 2500;
const initialBoyAnimationDelay = 3000;
const nameAnimationDuration = 4000;
const nameReturnDuration = 900;
const copyToastDuration = 2200;
const presenceFeedbackDuration = 4200;
const lockedWhatsAppButtonText = "Confirme no site primeiro";
const unlockedWhatsAppButtonText = "Enviar no WhatsApp";

// Pré-carrega o som do iPhone
const iosSound = new Audio("https://raw.githubusercontent.com/Yizack/Yizack.github.io/master/assets/audio/ios-notification.mp3");
iosSound.load();

updateCountdown();
markExternalLinks();
enhanceWhatsAppLinks();
setupGuestNameInputs();
lockWhatsAppConfirm();
setupPresenceForm();
setupWhatsAppLink();
prepareAnimatedNameLetters();
setupNameAnimations();
setupAddressCopyFields();
scheduleInitialNameAnimations();

function updateCountdown() {
  if (!countdownElement) {
    return;
  }

  const now = new Date();
  const diffInMs = eventDate - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const baseMessage =
    countdownElement.dataset.baseText || countdownElement.textContent.trim();

  if (diffInDays > 1) {
    countdownElement.textContent = `${baseMessage} Faltam ${diffInDays} dias.`;
    return;
  }

  if (diffInDays === 1) {
    countdownElement.textContent = `${baseMessage} Falta 1 dia.`;
    return;
  }

  if (diffInMs > 0) {
    countdownElement.textContent = `${baseMessage} E hoje!`;
    return;
  }

  countdownElement.textContent =
    "Esse momento ja aconteceu, mas continua guardado com carinho.";
}

function markExternalLinks() {
  const externalLinks = document.querySelectorAll('a[href^="http"]');

  externalLinks.forEach((link) => {
    link.setAttribute("rel", "noreferrer noopener");
  });
}

function enhanceWhatsAppLinks() {
  whatsappLinks.forEach((link) => {
    link.addEventListener("click", () => {
      link.dataset.clicked = "true";
    });
  });
}

function setupPresenceForm() {
  if (!presenceForm || !guestNameInput) {
    return;
  }

  presenceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const guestName = guestNameInput.value.trim();

    if (!guestName) {
      showStatusToast("Digite seu nome para confirmar.");
      focusPresenceNameInput();
      return;
    }

    saveGuestLocally(guestName);

    if (hasRemoteConfirmationSetup()) {
      submitPresenceToRemoteForm(guestName);
      unlockWhatsAppConfirm(guestName);
      showStatusToast(
        inviteConfig.confirmationSuccessMessage ||
          "Presenca confirmada. Agora envie a mensagem no WhatsApp.",
        true
      );
    } else {
      unlockWhatsAppConfirm(guestName);
      showStatusToast(
        `${guestName}, presenca salva. Agora envie a mensagem no WhatsApp.`,
        true
      );
    }

    presenceForm.reset();
  });
}

function setupWhatsAppLink() {
  if (!whatsappConfirmButton) {
    return;
  }

  whatsappConfirmButton.addEventListener("click", () => {
    if (whatsappConfirmButton.disabled) {
      showStatusToast("Confirme no site primeiro.");
      focusPresenceNameInput();
      return;
    }

    const guestName = whatsappNameInput?.value.trim() || "";

    if (!guestName) {
      showStatusToast("Digite seu nome para enviar no WhatsApp");
      focusWhatsAppNameInput();
      return;
    }

    const whatsappUrl = buildWhatsAppUrl(guestName);
    resetConfirmationFlow();
    window.location.href = whatsappUrl;
  });
}

function setupGuestNameInputs() {
  if (guestNameInput) {
    guestNameInput.addEventListener("input", () => {
      clearPresenceFeedback();
    });
  }
}

function focusPresenceNameInput() {
  if (!guestNameInput) {
    return;
  }

  guestNameInput.focus();
}

function focusWhatsAppNameInput() {
  if (!whatsappNameInput) {
    return;
  }

  whatsappNameInput.focus();
}

function lockWhatsAppConfirm() {
  if (whatsappCard) {
    whatsappCard.hidden = true;
  }

  if (!whatsappConfirmButton) {
    return;
  }

  whatsappConfirmButton.disabled = true;
  whatsappConfirmButton.setAttribute("aria-disabled", "true");
  whatsappConfirmButton.textContent = lockedWhatsAppButtonText;
}

function unlockWhatsAppConfirm(guestName) {
  if (whatsappCard) {
    whatsappCard.hidden = false;
  }

  if (!whatsappConfirmButton) {
    return;
  }

  whatsappConfirmButton.disabled = false;
  whatsappConfirmButton.setAttribute("aria-disabled", "false");
  whatsappConfirmButton.textContent = unlockedWhatsAppButtonText;

  if (whatsappNameInput && guestName && !whatsappNameInput.value.trim()) {
    whatsappNameInput.value = guestName;
  }
}

function resetConfirmationFlow() {
  hideStatusToast();
  lockWhatsAppConfirm();

  if (whatsappNameInput) {
    whatsappNameInput.value = "";
  }

  if (presenceForm) {
    presenceForm.reset();
  }
}

function buildWhatsAppMessage(guestName) {
  const displayName = guestName || "(nome da pessoa)";

  return whatsappMessageTemplate.replace("(nome da pessoa)", displayName);
}

function buildWhatsAppUrl(guestName) {
  const sanitizedNumber = whatsappNumber.replace(/\D/g, "");
  const message = buildWhatsAppMessage(guestName);

  if (sanitizedNumber) {
    return `https://api.whatsapp.com/send?phone=${sanitizedNumber}&text=${encodeURIComponent(message)}`;
  }

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

function saveGuestLocally(guestName) {
  const storedGuests = JSON.parse(
    localStorage.getItem("confirmacoes-cha-revelacao") || "[]"
  );

  storedGuests.push({
    name: guestName,
    confirmedAt: new Date().toISOString(),
  });

  localStorage.setItem(
    "confirmacoes-cha-revelacao",
    JSON.stringify(storedGuests)
  );
}

function hasRemoteConfirmationSetup() {
  return Boolean(
    inviteConfig.confirmationFormAction && inviteConfig.confirmationNameField
  );
}

function submitPresenceToRemoteForm(guestName) {
  const hiddenForm = document.createElement("form");
  const hiddenInput = document.createElement("input");

  hiddenForm.action = inviteConfig.confirmationFormAction;
  hiddenForm.method = "POST";
  hiddenForm.target = "confirmation-submit-frame";
  hiddenForm.style.display = "none";

  hiddenInput.type = "hidden";
  hiddenInput.name = inviteConfig.confirmationNameField;
  hiddenInput.value = guestName;

  hiddenForm.appendChild(hiddenInput);
  document.body.appendChild(hiddenForm);
  hiddenForm.submit();
  document.body.removeChild(hiddenForm);
}

function prepareAnimatedNameLetters() {
  animatedNames.forEach((nameElement) => {
    const nameText = nameElement.querySelector(".name-text");

    if (!nameText || nameText.querySelector(".name-letter")) {
      return;
    }

    const letters = Array.from(nameText.textContent.trim());
    const totalLetters = letters.length;

    nameText.textContent = "";

    letters.forEach((letter, index) => {
      const letterSpan = document.createElement("span");

      letterSpan.className = "name-letter";
      letterSpan.textContent = letter;
      letterSpan.style.setProperty("--letter-index", String(index));
      letterSpan.style.setProperty(
        "--letter-reverse-index",
        String(totalLetters - index - 1)
      );
      nameText.appendChild(letterSpan);
    });

    nameElement.style.setProperty(
      "--effect-delay",
      `${200 + totalLetters * 70}ms`
    );
    nameElement.style.setProperty(
      "--name-scene-duration",
      `${nameAnimationDuration}ms`
    );
  });
}

function setupNameAnimations() {
  animatedNames.forEach((nameElement) => {
    nameElement.addEventListener("pointerenter", () => {
      triggerNameAnimation(nameElement);
    });

    nameElement.addEventListener("focusin", () => {
      triggerNameAnimation(nameElement);
    });

    nameElement.addEventListener("click", () => {
      triggerNameAnimation(nameElement);
    });
  });
}

function scheduleInitialNameAnimations() {
  if (!animatedNames.length) {
    return;
  }

  animatedNames.forEach((nameElement) => {
    const delay = nameElement.classList.contains("name-girl")
      ? initialGirlAnimationDelay
      : initialBoyAnimationDelay;

    window.setTimeout(() => {
      triggerNameAnimation(nameElement);
    }, delay);
  });
}

function setupAddressCopyFields() {
  addressCopyFields.forEach((field) => {
    field.addEventListener("click", () => {
      copyAddressField(field);
    });
  });
}

async function copyAddressField(field) {
  if (!field) {
    return;
  }

  const textToCopy = field.value.trim();
  const hint = field
    .closest(".highlight-card-address")
    ?.querySelector(".copy-hint");

  field.focus();
  field.select();
  field.setSelectionRange(0, textToCopy.length);

  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      copied = true;
    } catch (error) {
      copied = false;
    }
  }

  if (!copied) {
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
  }

  updateCopyHint(hint, copied);
  showStatusToast(
    copied
      ? "Endereco copiado com sucesso"
      : "Nao foi possivel copiar o endereco"
  );

  window.setTimeout(() => {
    field.blur();
  }, 120);
}

function playNotificationSound() {
  try {
    // Reinicia o som caso já esteja tocando
    iosSound.currentTime = 0;
    iosSound.volume = 0.6;
    
    // Tenta tocar o som pré-carregado
    const playPromise = iosSound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Reprodução automática bloqueada ou erro no áudio:", error);
      });
    }
  } catch (error) {
    console.error("Erro ao processar o som:", error);
  }
}

function updateCopyHint(hint, copied) {
  if (!hint) {
    return;
  }

  const defaultMessage = hint.dataset.defaultMessage || hint.textContent.trim();

  hint.dataset.defaultMessage = defaultMessage;
  hint.textContent = copied ? "Endereco copiado" : "Toque novamente para copiar";

  const previousTimerId = Number(hint.dataset.resetTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  const timerId = window.setTimeout(() => {
    hint.textContent = defaultMessage;
    delete hint.dataset.resetTimer;
  }, 1800);

  hint.dataset.resetTimer = String(timerId);
}

function showStatusToast(message, persist = false) {
  if (!copyToast) {
    return;
  }

  // Play iPhone notification sound
  playNotificationSound();

  // Remove previous animation if exists
  copyToast.classList.remove("is-visible");
  
  // Force reflow to restart animation
  void copyToast.offsetWidth;
  
  copyToast.textContent = message;
  copyToast.classList.add("is-visible");

  const previousTimerId = Number(copyToast.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
    delete copyToast.dataset.hideTimer;
  }

  if (persist) {
    return;
  }

  const timerId = window.setTimeout(() => {
    copyToast.classList.remove("is-visible");
    delete copyToast.dataset.hideTimer;
  }, copyToastDuration);

  copyToast.dataset.hideTimer = String(timerId);
}

function hideStatusToast() {
  if (!copyToast) {
    return;
  }

  const previousTimerId = Number(copyToast.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
    delete copyToast.dataset.hideTimer;
  }

  copyToast.classList.remove("is-visible");
}

function setWhatsAppFeedback(message, type = "info") {
  if (!whatsappFeedback) {
    return;
  }

  whatsappFeedback.classList.remove(
    "is-success",
    "is-warning",
    "is-info"
  );
  whatsappFeedback.textContent = message;

  if (type === "success" || type === "warning" || type === "info") {
    whatsappFeedback.classList.add(`is-${type}`);
  }
}

function setPresenceFeedback(message, type = "default") {
  if (!presenceFeedback) {
    return;
  }

  const previousTimerId = Number(presenceFeedback.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
  }

  presenceFeedback.classList.remove(
    "is-success",
    "is-warning",
    "is-info"
  );
  presenceFeedback.textContent = message;

  if (type === "success" || type === "warning" || type === "info") {
    presenceFeedback.classList.add(`is-${type}`);
  }

  const timerId = window.setTimeout(() => {
    clearPresenceFeedback();
  }, presenceFeedbackDuration);

  presenceFeedback.dataset.hideTimer = String(timerId);
}

function clearPresenceFeedback() {
  if (!presenceFeedback) {
    return;
  }

  const previousTimerId = Number(presenceFeedback.dataset.hideTimer || 0);

  if (previousTimerId) {
    window.clearTimeout(previousTimerId);
    delete presenceFeedback.dataset.hideTimer;
  }

  presenceFeedback.classList.remove(
    "is-success",
    "is-warning",
    "is-info"
  );
  presenceFeedback.textContent = "";
}

function triggerNameAnimation(nameElement) {
  if (
    !nameElement ||
    nameElement.classList.contains("is-animating") ||
    nameElement.classList.contains("is-returning")
  ) {
    return;
  }

  clearNameAnimationTimers(nameElement);
  nameElement.classList.remove("is-returning");
  nameElement.classList.add("is-animating");

  const timerId = window.setTimeout(() => {
    startNameReturn(nameElement);
  }, nameAnimationDuration);

  nameElement.dataset.animationTimer = String(timerId);
}

function startNameReturn(nameElement) {
  if (!nameElement) {
    return;
  }

  const previousAnimationTimerId = Number(
    nameElement.dataset.animationTimer || 0
  );

  if (previousAnimationTimerId) {
    window.clearTimeout(previousAnimationTimerId);
    delete nameElement.dataset.animationTimer;
  }

  nameElement.classList.remove("is-animating");
  nameElement.classList.add("is-returning");

  const cleanupTimerId = window.setTimeout(() => {
    nameElement.classList.remove("is-returning");
    delete nameElement.dataset.cleanupTimer;
  }, nameReturnDuration);

  nameElement.dataset.cleanupTimer = String(cleanupTimerId);
}

function clearNameAnimationTimers(nameElement) {
  const animationTimerId = Number(nameElement.dataset.animationTimer || 0);
  const cleanupTimerId = Number(nameElement.dataset.cleanupTimer || 0);

  if (animationTimerId) {
    window.clearTimeout(animationTimerId);
    delete nameElement.dataset.animationTimer;
  }

  if (cleanupTimerId) {
    window.clearTimeout(cleanupTimerId);
    delete nameElement.dataset.cleanupTimer;
  }
}
