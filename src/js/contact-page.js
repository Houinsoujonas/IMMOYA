// Script du formulaire de la page /contact : envoi via l'API, avec retour visuel.

function initContactForm() {
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await apiSubmitContact(payload);
      feedback.textContent = "Votre message a bien été envoyé. Nous vous répondons sous 24h ouvrées.";
      feedback.className = "text-sm text-accent-green mt-4";
      form.reset();
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = "text-sm text-red-700 mt-4";
    }
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);
