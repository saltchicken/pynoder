function createGraph() {
  const canvasElement = document.createElement("canvas");
  canvasElement.id = "mycanvas";
  canvasElement.width = 1024;
  canvasElement.height = 720;
  canvasElement.style.border = "1px solid";
  document.body.appendChild(canvasElement);
  var graph = new LGraph();
  var canvas = new LGraphCanvas("#mycanvas", graph);
  return graph;
}

function resizeCanvas() {
    let canvas = document.getElementById("mycanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.graphcanvas) {
        canvas.graphcanvas.resize(); // Ensure LiteGraph updates its size
    }
}

function load_default() {
  var node_const = LiteGraph.createNode("basic/const");
  node_const.pos = [200,200];
  graph.add(node_const);
  node_const.setValue(4.5);

  var node_watch = LiteGraph.createNode("basic/watch");
  node_watch.pos = [700,200];
  graph.add(node_watch);

  node_const.connect(0, node_watch, 0 );
  graph.start();
}

LiteGraph.LGraph.prototype.save = function () {
    var data = JSON.stringify(this.serialize());
    var file = new Blob([data]);
    var url = URL.createObjectURL(file);
    var element = document.createElement("a");
    element.setAttribute('href', url);
    element.setAttribute('download', "untitled.tcgraph");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000 * 60); 
}

LiteGraph.LGraph.prototype.load = function () {

    var this_graph = this;

    if (typeof FileReader === 'undefined') {
        console.log('File loading not supported by your browser');
        return;
    }

    var inputElement = document.createElement('input');

    inputElement.type = 'file';
    inputElement.accept = '.tcgraph';
    inputElement.multiple = false;

    inputElement.addEventListener('change', function (data) {

        if (inputElement.files) {

            var file = inputElement.files[0];
            var reader = new FileReader();

            reader.addEventListener('loadend', function (load_data) {

                if (reader.result)
                    this_graph.configure(JSON.parse(reader.result));

            });
            reader.addEventListener('error', function (load_data) {
                console.log('File load error');
            });

            reader.readAsText(file);

        }
    });

    inputElement.click();
    return;
}

