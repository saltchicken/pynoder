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
