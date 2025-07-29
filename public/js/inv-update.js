// public/js/inv-update.js

const form = document.querySelector("#updateForm")
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button[type='submit']") || document.querySelector("input[type='submit'][name='submit']")
  if (updateBtn) {
    updateBtn.removeAttribute("disabled")
  }
})