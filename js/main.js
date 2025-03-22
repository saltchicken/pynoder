function main() {

  var graph = createGraph();
  resizeCanvas();
  loadGraph();


  async function sendGraphData() {
      const jsonData = graph.serialize();
      console.log("Sending graph data:", jsonData);

      let response = await fetch('/process_graph', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData)
      });

      let result = await response.json();
      console.log("Server Response:", result);
  }
  function saveGraph() {
      const data = graph.serialize();
      localStorage.setItem("myGraph", JSON.stringify(data)); // Save to local storage or send to a server
      console.log("Graph saved:", data);
  }

  function loadGraph() {
      const data = localStorage.getItem("myGraph");
      if (data) {
          graph.configure(JSON.parse(data));
          // console.log("Graph loaded:", JSON.stringify(JSON.parse(data), null, 2));
        JSON.parse(data).nodes.forEach(node => {
          console.log(`Node ID: ${node.id}, Type: ${node.type}, Title: ${node.title}`);
          console.log("  Inputs:", node.inputs);
          console.log("  Outputs:", node.outputs);
          console.log("  Properties:", node.properties);
          console.log("------------------------");
        });



      } else {
          console.log("No saved graph found.");
      }
      graph.start();
  }

  function loadGraphFromFile() {
    graph.load();
  }

  function saveGraphToFile() {
    graph.save();
  }

  var button = document.getElementById("runbutton");
  button.innerHTML = "Send Graph Data";
  button.addEventListener("click", sendGraphData);

  var savebutton = document.getElementById("savebutton");
  savebutton.innerHTML = "Save Graph";
  savebutton.addEventListener("click", saveGraph);

  var loadbutton = document.getElementById("loadbutton");
  loadbutton.innerHTML = "Load Graph";
  loadbutton.addEventListener("click", loadGraph);

  var loadFromFileButton = document.getElementById("loadFromFileButton");
  loadFromFileButton.innerHTML = "Load Graph From File";
  loadFromFileButton.addEventListener("click", loadGraphFromFile);

  var saveToFileButton = document.getElementById("saveToFileButton");
  saveToFileButton.innerHTML = "Save Graph To File";
  saveToFileButton.addEventListener("click", saveGraphToFile);

  const eventSource = new EventSource('/events'); // Replace with your actual SSE endpoint

  eventSource.onmessage = function(event) {
    try {
    const data = JSON.parse(event.data);
    console.log(data['key'])
    let node = graph.getNodeById(data['key'])
    if (node) {
        // node.setValue(data['value'])
        node.title = "TEST"
        node.setDirtyCanvas(true, true);
        console.log("Node found: ", node)
      } else {
        console.log("Node not found for key:", data['key']);
      }
    } catch (error) {
      console.error("Error parsing SSE data:", error);
    }
  };

  eventSource.onerror = function(error) {
      console.error("SSE Error:", error);
      eventSource.close(); // Close the connection on error
  };
}
