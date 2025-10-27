(function () {
  if (window.self !== window.top) return; // Prevents recursion of creating a chat widget inside another
  // const backendUrl = "http://localhost:8800"
  const backendUrl = "https://supporta.onrender.com"
  const businessId = document.currentScript.getAttribute("data-business");
  const widgetToken = document.currentScript.getAttribute("data-widget-token")
  const logoUrl = document.currentScript.getAttribute("data-logo") || `${backendUrl}/logo.png`;


  // Create chat iframe
  const iframe = document.createElement("iframe");
  iframe.src = `${backendUrl}/chat-widget?business=${businessId}&token=${widgetToken}`;
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 360px;
    height: 500px;
    max-width: 95%;
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
    background-color: white;
    z-index: 9998;
    display: none;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    overflow-y: auto;
  `;
  iframe.sandbox = "allow-scripts allow-same-origin allow-popups";
  document.body.appendChild(iframe);

  // Create chat button
  const button = document.createElement("div");
  button.id = "supporta-widget-button";
  button.setAttribute("aria-label", "Open Supporta Chat");
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #673ab7;
    cursor: pointer;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
  `;

  // Add logo inside button
  const logo = document.createElement("img");
  logo.src = logoUrl;
  logo.alt = "Supporta AI";
  logo.style.width = "70%";
  logo.style.height = "70%";
  logo.style.borderRadius = "50%";
  button.appendChild(logo);

  document.body.appendChild(button);

  // Toggle iframe visibility with animation
  let isOpen = false;
  button.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.display = "block";
      setTimeout(() => {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";
      }, 10);
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";
      setTimeout(() => (iframe.style.display = "none"), 300);
    }
  });

  // Optional: Close iframe if clicked outside
  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !iframe.contains(e.target) &&
      !button.contains(e.target)
    ) {
      button.click();
    }
  });

  // Mobile adjustments
  const adjustForMobile = () => {
    if (window.innerWidth < 500) {
      iframe.style.width = "90%";
      iframe.style.height = "400px";
      iframe.style.right = "5%";
      iframe.style.bottom = "80px";
    } else {
      iframe.style.width = "360px";
      iframe.style.height = "500px";
      iframe.style.right = "20px";
      iframe.style.bottom = "90px";
    }
  };

  window.addEventListener("resize", adjustForMobile);
  adjustForMobile();
})();

