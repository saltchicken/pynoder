from aiohttp import web
import json
from pprint import pprint

class Node:
    def __init__(self, node):
        self.flags = node.get('flags', None)
        self.mode = node.get('mode', None)
        self.order = node.get('order', None)
        self.inputs = node.get('inputs', None)
        self.outputs = node.get('outputs', None)
        self.properties = node.get('properties', None)
        self.type = node.get('type', None)

app = web.Application()

async def process_graph(request):
    """Handles POST requests from the frontend with graph data."""
    data = await request.json()
    nodes = [Node(node) for node in data['nodes']]
    for node in nodes:
        pprint(node.__dict__)
    return web.json_response({"status": "success", "message": "Graph data received."})

app.router.add_post('/process_graph', process_graph)
app.router.add_static('/', path='.', show_index=True)  # Serve frontend files

web.run_app(app, host="0.0.0.0", port=8080)

