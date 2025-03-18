async function registerNode(node) {
  function customNode() {
    for (let input of node['inputs']) {
      this.addInput(input['name'], input['type']);
    }
    for (let output of node['outputs']) {
      this.addOutput(output['name'], output['type']);
    }
    // this.properties = { precision: 1 };
  }

  customNode.title = node['name'];
  // customNode.prototype.onExecute = node['onExecute'];

  // customNode.prototype.onExecute = function()
  // {
  //   // var A = this.getInputData(0);
  //   // if( A === undefined )
  //   //   A = 0;
  //   // var B = this.getInputData(1);
  //   // if( B === undefined )
  //   //   B = 0;
  //   // this.setOutputData( 0, A + B );
  // }

  console.log("Registering node:", node['name'])
  // TODO: More declarative type instead of just node['name']
  LiteGraph.registerNodeType(node['name'], customNode );

}

async function getCustomNodes() {
    let response = await fetch('/custom_nodes', {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(jsonData)
    });

    let result = await response.json();
    if ( result['status'] == 'success' ) {
        // console.log("Got custom nodes from server:", result['nodes'])
        for ( let node of result['nodes'] ) {
            registerNode(node)
            // LiteGraph.registerNodeType(node['name'], node['class'])
        }
  }
  const event = new CustomEvent('customNodesLoaded');
  window.dispatchEvent(event);
}

getCustomNodes();

