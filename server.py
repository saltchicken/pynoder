from aiohttp import web
import json
from pprint import pprint

app = web.Application()

async def process_graph(request):
    """Handles POST requests from the frontend with graph data."""
    data = await request.json()
    nodes = data['nodes']
    for node in nodes:
        pprint(node)
    return web.json_response({"status": "success", "message": "Graph data received."})

app.router.add_post('/process_graph', process_graph)
app.router.add_static('/', path='.', show_index=True)  # Serve frontend files

web.run_app(app, host="0.0.0.0", port=8080)

