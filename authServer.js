const BACKEND = "https://auth-server-0zmg.onrender.com";

function showMsg(text, type = "") {
  const el = document.getElementById("msg");
  el.innerText = text;
  el.className = type;
}

async function handleSendOTP() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const sendBtn = document.getElementById("sendBtn");

  if (!email || !password) 
      return showMsg("Enter email & password", "error");

  sendBtn.disabled = true;
  sendBtn.innerText = "Sending...";

  try {
    const res = await fetch(BACKEND + "/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })   // FIXED ✔✔✔
    });

    const data = await res.json();
    showMsg(data.message, data.success ? "success" : "error");

    if (data.success)
      document.getElementById("otp-section").style.display = "block";

  } catch {
    showMsg("Network error", "error");
  }

  sendBtn.disabled = false;
  sendBtn.innerText = "Log In";
}

async function handleVerifyOTP() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const verifyBtn = document.getElementById("verifyBtn");

  if (!email || !otp) 
      return showMsg("Email & OTP required", "error");

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying...";

  try {
    const res = await fetch(BACKEND + "/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (data.success) {
      showMsg("OTP verified!", "success");
      setTimeout(() => window.location.href = "pages/index.html", 1000);
    } else {
      showMsg(data.message, "error");
    }
  } catch {
    showMsg("Network error", "error");
  }

  verifyBtn.disabled = false;
  verifyBtn.innerText = "Verify OTP";
