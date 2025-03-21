if (typeof crypto.randomUUID !== 'function') {
  crypto.randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
async function registerNode(node) {
  function customNode() {
    for (let input of node['inputs']) {
      this.addInput(input['name'], input['type']);
    }
    for (let output of node['outputs']) {
      this.addOutput(output['name'], output['type']);
    }
    this.properties = {uniqueID: crypto.randomUUID()}
    this.title = "Oh my"
    // this.properties = { precision: 1 };
  }

  // customNode.title = node['name'];
  // customNode.uniqueID = crypto.randomUUID();
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

async function registerSendText() {
  function sendTextNode() {
  this.addOutput("Text", "string");
  this.properties = { text: "Hello World" };
  this.setOutputData(0, this.properties.text);
  this.setDirtyCanvas(true, true);
  this.size = [200, 200];
  this.onDrawBackground = function(ctx) {
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, this.size[0], this.size[1]);
    ctx.fillStyle = "#eee";
    ctx.font = "14px Arial";
    ctx.fillText(this.properties.text, 5, 20);
  };
  this.onPropertyChanged = function(name, value) {
    this.setOutputData(0, value);
    this.setDirtyCanvas(true, true);
  };
}

  console.log("Registering node: send text node manually" )
LiteGraph.registerNodeType("SendText", sendTextNode);
}

registerSendText();

async function registerShowText() {
  function showTextNode() {
    this.addInput("Text", "string");
    this.size = [200, 200];
    this.addWidget("text", "Label:", "My custom text");
    this.onExecute = function() {
      this.widgets[0].value = this.getInputData(0);
      console.log("Executing show text node")
    };
//     this.onAdded = function() {
//       console.log("I was addedkasjd;lfjka;sldkjf;alskdj;flkajs;df")
//     };
//     this.onExecute = function() {
//     if (!this.textarea) {
//         var textarea = document.createElement("textarea");
//         textarea.style.position = "absolute";
//         textarea.style.left = this.pos[0] + "px";
//         textarea.style.top = this.pos[1] + "px";
//         textarea.style.width = "150px";
//         textarea.style.height = "60px";
//         textarea.style.background = "black";
//         textarea.style.color = "white";
//         textarea.style.border = "1px solid white";
//         textarea.style.zIndex = 10;
//         document.body.appendChild(textarea);
//
//         this.textarea = textarea;
//
//         textarea.addEventListener("input", () => {
//             this.properties.text = textarea.value;
//         });
//     }
// };


    this.onDrawBackground = function(ctx) {
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, this.size[0], this.size[1]);
      ctx.fillStyle = "#eee";
      ctx.font = "60px Arial";
      ctx.fillText(this.getInputData(0), 5, 20);
    };
  }

  console.log("Registering node: show text node manually" )
  LiteGraph.registerNodeType("ShowText", showTextNode);
}
registerShowText();

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

