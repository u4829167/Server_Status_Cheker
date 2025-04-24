document.addEventListener("DOMContentLoaded", () => {
  const serverList = document.getElementById("serverList");
  const serverUrl = document.getElementById("serverUrl");
  const addServer = document.getElementById("addServer");

  function normalizeURL(input) {
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      return "https://" + input; // HTTPSを優先
    }
    return input;
  }


  function isValidIP(ip) {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;
    return ipRegex.test(ip);
  }

  function isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  function loadServers() {
    chrome.storage.local.get(["servers"], (data) => {
      serverList.innerHTML = "";
      let servers = data.servers || [];

      servers.forEach((server) => {
        let li = document.createElement("li");

        let div = document.createElement("div");
        let strong = document.createElement("strong");
        strong.textContent = server.url;

        let br = document.createElement("br");

        let span = document.createElement("span");
        span.style.color = server.status === "DOWN" ? "red" : "green";
        span.textContent = `${server.status} (${server.time})`;

        div.appendChild(strong);
        div.appendChild(br);
        div.appendChild(span);

        let btn = document.createElement("button");
        btn.className = "remove-btn";
        btn.dataset.url = server.url;
        btn.textContent = "削除";

        li.appendChild(div);
        li.appendChild(btn);
        serverList.appendChild(li);
      });

      document
        .querySelectorAll(".remove-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) =>
            removeServer(e.target.dataset.url)
          )
        );
    });
  }

  function addServerFunc() {
    let url = serverUrl.value.trim();
    if (!url) return;

    if (isValidIP(url)) {
      url = "http://" + url;
    } else {
      url = normalizeURL(url);
    }

    if (!isValidURL(url)) {
      alert("不正なURL形式です");
      return;
    }

    chrome.storage.local.get(["servers"], (data) => {
      let servers = data.servers || [];
      servers.push({ url, status: "Checking...", time: "" });

      chrome.storage.local.set({ servers }, () => {
        serverUrl.value = "";
        loadServers();
      });
    });
  }

  function removeServer(url) {
    chrome.storage.local.get(["servers"], (data) => {
      let servers = (data.servers || []).filter((s) => s.url !== url);
      chrome.storage.local.set({ servers }, loadServers);
    });
  }

  addServer.addEventListener("click", addServerFunc);
  loadServers();
});
