from aiohttp import web
import asyncio
import json
from pprint import pprint

import inspect
import sys
import nodes

custom_classes = [
    {
        "name": cls_name,
        "inputs": getattr(cls_obj, 'inputs', None),  # Will be None if inputs is an instance attribute
        "outputs": getattr(cls_obj, 'outputs', None),  # Will be None if outputs is an instance attribute
        "class": cls_obj
    }
    for cls_name, cls_obj in inspect.getmembers(sys.modules['nodes'])
    if inspect.isclass(cls_obj)
]

class Node:
    def __init__(self, node):
        self.name = node.get('name', None)
        self.flags = node.get('flags', None)
        self.mode = node.get('mode', None)
        self.order = node.get('order', None)
        # self.inputs = node.get('inputs', None)
        self.outputs = node.get('outputs', None)
        self.properties = node.get('properties', None)
        self.type = node.get('type', None)

        self.inputs = []
        self.output = None
        self.func = node.process

    def execute(self):
        print(f"Executing node: {self.name}")
        input_values = [node.output for node in self.inputs]
        self.output = self.func(*input_values)
        return self.output


class Graph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, node_class):
        self.nodes[node_class.name] = node_class

    def connection(self, from_node, to_node):
        self.nodes[to_node].inputs.append(self.nodes[from_node])

app = web.Application()

async def process_graph(request):
    """Handles POST requests from the frontend with graph data."""
    data = await request.json()

    for node in data['nodes']:
        # pprint(node.__dict__)
        for custom_class in custom_classes:
            if custom_class['name'] == node['type']:
                node_class = custom_class['class']
                print(node_class)
            # if custom_class.get(node['type'], None):
            #     node_class = custom_class[node['type']]
            #     print(node_class)



    return web.json_response({"status": "success", "message": "Graph data received."})

async def custom_nodes_handler(request):
    """Handles POST requests for custom nodes."""
    # data = await request.json()
    #


    # print(custom_classes)
    custom_classes_without_class = [{k: v for k, v in d.items() if k != 'class'} for d in custom_classes]
    return web.json_response({"status": "success", "nodes": custom_classes_without_class})

async def sse_handler(request):
    response = web.StreamResponse(
        status=200,
        reason="OK",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )

    await response.prepare(request)

    try:
        counter = 0
        while True:
            counter += 1
            message = f"data: Message {counter} from server\n\n"
            await response.write(message.encode("utf-8"))
            await asyncio.sleep(10)  # Send an update every second
    except (asyncio.CancelledError, ConnectionResetError, web.GracefulExit):
        print("Client disconnected")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        try:
            await response.write_eof()  # Ensure the response is properly closed
        except Exception:
            pass  # Ignore errors when closing the response

    return response

app.router.add_get('/events', sse_handler)
app.router.add_post('/process_graph', process_graph)
app.router.add_post('/custom_nodes', custom_nodes_handler)
app.router.add_static('/', path='.', show_index=True)  # Serve frontend files


web.run_app(app, host="0.0.0.0", port=8080)

