from perspective.table import Table

import tornado.ioloop
import tornado.web
import tornado.websocket
import json
 
class MainHandler(tornado.web.RequestHandler):

    def set_default_headers(self):
        print("setting headers!!!")
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        self.render("index.html")

TABLE = Table([{"x": 1, "y": "a"}, {"x": 2, "y": "b"}, {"x": 3, "y": "c"}])
VIEW = None
CONVERT = {
    int: "integer",
    str: "string",
    "integer": "integer",
    "string": "string"
}
 
class SimpleWebSocket(tornado.websocket.WebSocketHandler):
    connections = set()
 
    def open(self):
        self.connections.add(self)
 
    def on_message(self, message):
        print(message)
        if (message == "heartbeat"):
            print("Heartbeat")
        else:
            msg = json.loads(message)
            if msg["cmd"] == "init":
                self.write_message(message)
            elif msg["cmd"] == "table_method":
                val = getattr(TABLE, msg["method"])(*msg["args"])
                if (msg["method"] == "schema"):
                    val = {k: CONVERT[v] for k, v in val.items()}
                self.write_message(json.dumps({
                    "id": msg["id"],
                    "data": val
                }))
            elif msg["cmd"] == "view":
                global VIEW
                VIEW = TABLE.view({"config": msg["config"]})
                self.write_message(json.dumps({
                    "id": msg["id"]
                }))
            elif msg["cmd"] == "view_method":
                val = None;
                if (msg["method"] not in ["on_update", "delete", "remove_update", "remove_delete"]):
                    val = getattr(VIEW, msg["method"])(*msg["args"])
                    if (msg["method"] == "schema"):
                        val = {k: CONVERT[v] for k, v in val.items()}
                self.write_message(json.dumps({
                    "id": msg["id"],
                    "data": val
                }))
       
 
    def on_close(self):
        self.connections.remove(self)
 
def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/websocket", SimpleWebSocket)
    ])
 
if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()