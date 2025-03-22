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
    def __init__(self, node, custom_class):
        self.setup(node)
        self.custom_class = custom_class
        
    def setup(self, node):
        self.id = node.get('id', None)
        self.unique_id = node['properties'].get('uniqueID', None)
        self.name = node.get('type', None)
        self.flags = node.get('flags', None)
        self.mode = node.get('mode', None)
        self.order = node.get('order', None)
        self.inputs = node.get('inputs', None)
        self.outputs = node.get('outputs', None)
        self.properties = node.get('properties', None)

        # self.inputs = []
        # self.output = None
        # self.func = node.process

    def execute(self, *args):
        if hasattr(self.custom_class, "instantiated"):
            pass
        else:
            self.custom_class = self.custom_class()

        # print(f"Executing node: {self.name}")
        # input_values = [node.output for node in self.inputs]
        if len(args) > 0:
            self.custom_class.run(*args)
        else:
            self.custom_class.run()


class Graph:
    def __init__(self):
        self.nodes = {}
        self.node_queue = asyncio.Queue()
        self.process_task = None
        self.sse_queue = asyncio.Queue()
        
    async def start_processing(self):
        self.process_task = asyncio.create_task(self.process_nodes())
        return self.process_task

    def add_node(self, node_key, graph_node):
        self.nodes[node_key] = graph_node

    def connection(self, from_node, to_node):
        self.nodes[to_node].inputs.append(self.nodes[from_node])


    async def process_graph(self, request):
        """Handles POST requests from the frontend with graph data."""
        data = await request.json()

        self.node_queue.put_nowait(data['nodes'])
        return web.json_response({"status": "success", "message": "Graph data received."})

    async def process_nodes(self):
        try:
            while True:
                nodes = await self.node_queue.get()
                nodes_for_deletion = set()

                for node in nodes:
                    node_key = f"{node['id']}:{node['properties']['uniqueID']}"

                    # Check if node type exists in custom_classes
                    for custom_class in custom_classes:
                        if custom_class['name'] == node['type']:
                            node_class = custom_class['class']

                            if node_key not in self.nodes:
                                graph_node = Node(node, node_class)
                                self.add_node(node_key, graph_node)
                            else:
                                self.nodes[node_key].setup(node)

                            break  # No need to check further once match is found

                # Identify nodes that should be deleted
                current_keys = set(self.nodes.keys())
                new_keys = {f"{node['id']}:{node['properties']['uniqueID']}" for node in nodes}
                nodes_for_deletion = current_keys - new_keys  # Find obsolete nodes

                for node_key in nodes_for_deletion:
                    print(f"Removing node: {node_key}")
                    del self.nodes[node_key]

                # print(self.nodes)
                for key, node in sorted(self.nodes.items(), key=lambda item: item[1].order):
                    previous_node_inputs = []
                    # print(f"Order: {node.order} Inputs: {node.inputs} Outputs: {node.outputs}")
                    if node.inputs is not None:
                        for input in node.inputs:
                            previous_node_inputs.append(self.search_nodes_for_output(input['link']))
                    # self.sse_queue.put_nowait(json.dumps({"node": node.name, "key": str(node.id) + ":" + node.unique_id}))
                    self.sse_queue.put_nowait(json.dumps({"node": node.name, "key": str(node.id)}))
                    if len(previous_node_inputs) == 0:
                        node.execute()
                    else:
                        node.execute(*previous_node_inputs)
                self.node_queue.task_done()

        except asyncio.CancelledError:
            print("Process Queue, Task cancelled")

    def search_nodes_for_output(self, link):
        for node in self.nodes.values():
            for output_links in node.outputs:
                if output_links['links'] is None:
                    continue
                for output_link in output_links['links']:
                    if output_link == link:
                        # print(f"Slot Index: {output_links['slot_index']}")
                        # print(node.custom_class.output_results)
                        return node.custom_class.output_results[output_links['slot_index']]
        return None


    async def sse_handler(self,request):
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
            while True:
                message = await self.sse_queue.get()
                formatted_message = f"data: {message}\n\n"
                await response.write(formatted_message.encode("utf-8"))
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

async def custom_nodes_handler(request):
    """Handles POST requests for custom nodes."""
    # data = await request.json()
    #


    # print(custom_classes)
    custom_classes_without_class = [{k: v for k, v in d.items() if k != 'class'} for d in custom_classes]
    return web.json_response({"status": "success", "nodes": custom_classes_without_class})


async def start_background_tasks(app):
    app['process_task'] = await graph.start_processing()


graph = Graph()
app = web.Application()
app.router.add_get('/events', graph.sse_handler)
app.router.add_post('/process_graph', graph.process_graph)
app.router.add_post('/custom_nodes', custom_nodes_handler)
app.router.add_static('/', path='.', show_index=True)  # Serve frontend files

app.on_startup.append(start_background_tasks)

web.run_app(app, host="0.0.0.0", port=8080)

