const eventSource = new EventSource('/events'); // Replace with your actual SSE endpoint

eventSource.onmessage = function(event) {
  console.log("Received SSE message:", event.data)  
};

eventSource.onerror = function(error) {
    console.error("SSE Error:", error);
    eventSource.close(); // Close the connection on error
};
