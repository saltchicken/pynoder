//node constructor class
function MyAddNode()
{
  this.addInput("A","number");
  this.addInput("B","number");
  this.addOutput("A+B","number");
  this.properties = { precision: 1 };
}

//name to show
MyAddNode.title = "Sum";

//function to call when the node is executed
MyAddNode.prototype.onExecute = function()
{
  var A = this.getInputData(0);
  if( A === undefined )
    A = 0;
  var B = this.getInputData(1);
  if( B === undefined )
    B = 0;
  this.setOutputData( 0, A + B );
}

//register in the system
LiteGraph.registerNodeType("basic/sum", MyAddNode );

async function registerNode(node) {
  function customNode() {
    this.addInput("A","number");
    this.addInput("B","number");
    this.addOutput("A+B","number");
    this.properties = { precision: 1 };
  }

  customNode.title = node['name'];
  // customNode.prototype.onExecute = node['onExecute'];

  customNode.prototype.onExecute = function()
  {
    var A = this.getInputData(0);
    if( A === undefined )
      A = 0;
    var B = this.getInputData(1);
    if( B === undefined )
      B = 0;
    this.setOutputData( 0, A + B );
  }

  console.log("Registering node:", node['name'])
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

