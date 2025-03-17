from aiohttp import web
import asyncio
import json
from pprint import pprint

import inspect
import sys
import nodes
print(dir(nodes))

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


    custom_classes = [{cls_name: cls_obj} for cls_name, cls_obj in inspect.getmembers(sys.modules['nodes']) if inspect.isclass(cls_obj)]
    print(custom_classes)

    return web.json_response({"status": "success", "message": "Graph data received."})

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
app.router.add_static('/', path='.', show_index=True)  # Serve frontend files


web.run_app(app, host="0.0.0.0", port=8080)

