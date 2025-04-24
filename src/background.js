chrome.alarms.create("checkServers", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkServers") {
    checkServerStatus();
  }
});

function checkServerStatus() {
  chrome.storage.local.get(["servers"], (data) => {
    let servers = data.servers || [];
    let fetchPromises = servers.map((server) =>
      fetch(server.url, { method: "HEAD" })
        .then((response) => ({
          url: server.url,
          status: response.ok ? response.status : "DOWN",
          time: new Date().toLocaleTimeString(),
        }))
        .catch((err) => {
          console.error(`Error checking ${server.url}:`, err);
          return {
            url: server.url,
            status: "DOWN",
            time: new Date().toLocaleTimeString(),
          };
        })
    );

    Promise.all(fetchPromises).then((results) => {
      chrome.storage.local.set({ servers: results });
    });
  });
}
