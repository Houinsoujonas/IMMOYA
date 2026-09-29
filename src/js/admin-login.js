// Script de la page de connexion admin (la seule page admin sans garde de session,
// puisque c'est justement elle qui permet de s'authentifier).

function initLoginForm() {
  const form = document.getElementById("login-form");
  const feedback = document.getElementById("login-feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";

    const password = new FormData(form).get("password");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Connexion impossible");
      }

      window.location.href = "index.html";
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = "text-sm text-red-700 mt-3";
    }
  });
}

document.addEventListener("DOMContentLoaded", initLoginForm);
